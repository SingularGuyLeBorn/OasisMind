---
title: DSA 与索引器: 先召回 token, 再计算 Sparse MLA
description: 从 DeepSeek-V3.2 Lightning Indexer 出发, 解析 token 级 selector 的训练目标、top-k 成本、HISA/MISA/LISA 改进与训推边界.
published: true
---

# DSA 与索引器: 先召回 token, 再计算 Sparse MLA

token 级 Sparse Attention 要完成一次有约束的检索: 对每个 query, 从全部历史 token 中召回少量候选, 再用主 attention 的完整表示精确计算. 候选太少会漏证据, 候选太多又失去稀疏收益. 更棘手的是, 一个为每对 query-key 打分的 selector 自己也会形成 $n\times n$ 分数矩阵. 主 attention 从平方降到 $O(nk)$ 以后, indexer 可能接替它成为最长的 kernel.

[DeepSeek-V3.2](https://arxiv.org/abs/2512.02556)中的 DeepSeek Sparse Attention(DSA)给出一条完整路径: **Lightning Indexer** 用低维、多头 query 与共享 key 产生标量索引分数, top-k selector 为每个 query 选出 2048 个历史位置, Sparse MLA 只读取这些位置. DSA 由 DeepSeek-V3.1-Terminus 继续训练而来, 先用稠密 attention 预热 indexer, 再让主模型适应稀疏拓扑. 选择器、训练目标、MLA 表示和 kernel 都属于模型设计的一部分, 临时给任意稠密模型添加 top-k mask 无法得到同一条计算路径.

DSA 之后的优化大多没有否定 token 级选择, 而是追问「索引阶段能否更便宜」. [HISA](https://arxiv.org/abs/2603.28458)先筛块再在候选块内运行原 indexer; [MISA](https://arxiv.org/abs/2605.07363)把 indexer heads 当成专家池, 每个 query 只激活少量 heads; [LISA](https://arxiv.org/abs/2607.19358)把线性 attention 的长程状态与 indexer 引导的 sparse self-attention 并联. 四者提供了三种不同的降本轴: 缩小 token 搜索范围、缩小参与打分的 head 数、用线性状态承接未进入 top-k 的全局信息.

## 1. Lightning Indexer 的输入、输出与目标

### 1.1. 低维打分怎样连接 Sparse MLA

固定 batch 中一个样本. hidden state 为 $h_t\in\mathbb{R}^{d}$, indexer 为 query token $t$ 产生 $H^I$ 个低维 query $q^I_{t,j}\in\mathbb{R}^{d^I}$ 和 $H^I$ 个权重 $w^I_{t,j}\in\mathbb{R}$. 历史 token $s$ 只产生一个共享 key $k^I_s\in\mathbb{R}^{d^I}$. DeepSeek-V3.2 报告给出的分数是:

$$
I_{t,s}=\sum_{j=1}^{H^I}w^I_{t,j}\operatorname{ReLU}\left((q^I_{t,j})^Tk^I_s\right). \tag{1}
$$

对整段 Prefill, $Q^I\in\mathbb{R}^{B\times n\times H^I\times d^I}$, $K^I\in\mathbb{R}^{B\times n\times d^I}$, 权重 $W^I\in\mathbb{R}^{B\times n\times H^I}$. indexer 输出 $I\in\mathbb{R}^{B\times n\times n}$, 加 causal mask 后沿历史位置维取 top-k, 得到位置张量 $S\in\mathbb{N}^{B\times n\times k}$. Sparse MLA 的主 attention 根据 $S_{t,:}$ gather 对应 latent KV, 输出 shape 仍与原 MLA 一致.

式 (1)的共享 key 很重要. selector 最终为一个 query 的全部主 attention heads 选择同一组 token, 才能让选中的 latent KV 被多个 query heads 复用. 如果每个主 head 各选一套位置, token 数可能成倍增长, K/V gather 也更碎. 多个 indexer heads 的作用是给相关性提供多种子空间, 加权求和后仍输出一个共享标量 $I_{t,s}$.

ReLU 让每个 indexer head 只贡献非负匹配, $w^I_{t,j}$ 再控制该 head 对当前 query 的重要性. 官方报告明确将 ReLU 的选择归因于吞吐, 并指出 indexer head 数较少且可用 FP8 实现. 低维和低精度降低每次配对成本, 没有改变配对数量: Prefill 仍为 $O(n^2H^Id^I)$, Decode 每步仍扫描长度为 $t$ 的全部 $K^I$.

### 1.2. selector 选择什么, 又没有选择什么

候选集合定义为:

$$
\mathcal S_t=\operatorname{TopK}\left(I_{t,0:t},k\right). \tag{2}
$$

主 attention 随后计算:

$$
u_t=\operatorname{Attn}\left(h_t,\{c_s:s\in\mathcal S_t\}\right), \tag{3}
$$

其中 $c_s$ 是 MLA 的 latent KV entry. selector 只决定读取哪些位置, 不复用式 (1)的分数作为主 softmax 权重. 命中候选后, Sparse MLA 仍使用自己的 QK 分数、RoPE、causal 约束和 softmax. 因而 indexer 要逼近的是主 attention 的排序偏好, 不必精确重构每个 head 的 logits.

top-k 的 $k$ 是每个 query 的关系预算, 不是 KV Cache 容量. DeepSeek-V3.2 稀疏训练阶段取 $k=2048$. 全部历史 latent KV 仍然存在, 因为不同 query 的候选不同, 后续 query 也可能重新选择此前未命中的位置. 若把 DSA 与 KV 驱逐组合, 被驱逐位置将无法参与式 (2)之后的精排; 那属于另一项不可逆近似.

同一候选集合跨主 attention heads 共享, 也意味着 selector 目标来自多头偏好的聚合. 某个只对单个 head 关键的 token, 在求和后可能被其他 heads 稀释. 增大 $k$ 能缓解, 代价是 Sparse MLA 读取更多 KV. MISA 反过来处理 indexer 内部的多头冗余, 不改变最终共享候选集合的大小.

### 1.3. 一个五 token 手算

仅示意式 (1)-(3), 取 $H^I=2,d^I=2$, 省略缩放、位置编码与 batch. 当前 query 的两个 index query 为 $q^I_{t,1}=(1,0)$、$q^I_{t,2}=(0,1)$, 权重为 $w^I_t=(0.75,0.25)$. 三个历史 key 为:

$$
k^I_1=(2,-1),\qquad k^I_2=(1,3),\qquad k^I_3=(-1,4). \tag{4}
$$

逐 head 内积和 ReLU 分别为 $(2,0)$、$(1,3)$、$(0,4)$. 按式 (1)加权:

$$
I_{t,1}=0.75\times2+0.25\times0=1.5, \tag{5}
$$

$$
I_{t,2}=0.75\times1+0.25\times3=1.5,\qquad
I_{t,3}=0.75\times0+0.25\times4=1.0. \tag{6}
$$

取 $k=2$, selector 返回位置 1 与 2. 假设主 attention 用完整表示算出的 logits 是 $a_{t,1}=0.2,a_{t,2}=1.2$, 对应 Value 为 $v_1=(2,0),v_2=(0,3)$. 主 softmax 权重约为 $(0.269,0.731)$, 输出为 $(0.538,2.193)$. indexer 分数 1.5 和 1.5 没进入主 softmax; 它们只完成召回.

如果位置 3 的完整主 logit 实际为 2.0, indexer 就漏掉了主 attention 第一名. sparse softmax 会在位置 1、2 上重新归一化, 任何后续高精度 kernel 都无法补回位置 3. 这正是 indexer 训练和 recall@k 评测的对象.

## 2. DSA 为什么需要两阶段继续训练

### 2.1. 稠密预热把选择器对齐到教师分布

DeepSeek-V3.2 从已扩展到 128K 上下文的 DeepSeek-V3.1-Terminus 继续训练. 第一阶段保持稠密 attention, 冻结除 Lightning Indexer 外的全部模型参数. 对 query $t$, 将主 attention 分数跨所有 attention heads 求和, 再沿序列维做 L1 归一化, 得到教师分布 $p_{t,:}\in\mathbb{R}^{t}$.

indexer 的学生分布是 $\operatorname{Softmax}(I_{t,:})$. 预热损失为:

$$
\mathcal L^I=\sum_tD_{KL}\left(p_{t,:}\;\|\;\operatorname{Softmax}(I_{t,:})\right). \tag{7}
$$

报告给出的预热学习率为 $10^{-3}$, 训练 1000 步; 每步 16 条 128K 序列, 总计 2.1B token. 这一阶段不省 attention 训练成本, 因为教师分布来自稠密主 attention. 它的职责是让随机初始化的 indexer 在切换稀疏路径前学会主模型已有的注意力偏好.

KL 目标比直接监督 top-k 多提供了排序信息. 教师高概率位置受到更强约束, 长尾位置仍参与分布. 但教师先跨 head 聚合, 学到的是共享候选偏好. 如果各 head 的峰值位置互不相同, 学生需要用有限 $k$ 覆盖它们的并集. 训练损失低并不自动等于每个 head 的 top-k recall 高, 两者应分别测量.

### 2.2. 稀疏训练让主模型适应漏边

第二阶段启用式 (2)的 fine-grained token selection, 所有主模型参数都参与语言模型训练. indexer 的 KL 只在已选集合 $\mathcal S_t$ 上计算:

$$
\mathcal L^I=\sum_tD_{KL}\left(p_{t,\mathcal S_t}\;\|\;
\operatorname{Softmax}(I_{t,\mathcal S_t})\right). \tag{8}
$$

报告说明 indexer 输入从计算图中 detach. indexer 只由 $\mathcal L^I$ 优化, 主模型只由语言模型 loss 优化. 这种分离避免主任务梯度通过离散 top-k 迫使 indexer走不稳定的近似路径, 同时让主模型在固定选择机制下重新组织信息. 稀疏阶段学习率为 $7.3\times10^{-6}$, 训练 15000 步, 每步 480 条 128K 序列, 总计 943.7B token.

从训练成本看, 稀疏阶段仍需产生对齐目标. 报告的式 (8)只在选中集合计算 indexer 分布, 但教师 $p$ 的产生和具体重计算路径必须由实现配合. NVIDIA cuDNN 的 DSA 文档将训练 kernel拆成稀疏/稠密 indexer 与 attention score recompute、top-k、backward 等操作, 说明训练不会只靠一次前向 mask 完成.

**DSA 的训练对齐包含两件事: selector 学会复现稠密偏好, 主模型学会在 selector 给定的缺边图上工作.** 只有第一件事而没有稀疏适配, 漏选误差会直接冲击已有表示; 只有第二件事而没有可靠初始化, 训练早期的随机候选又会破坏长程信息.

### 2.3. recall@k 应怎样定义

设主 attention 聚合后教师 top-$m$ 集合为 $G_t^{(m)}$, indexer 候选为 $\mathcal S_t^{(k)}$. token recall 为:

$$
\operatorname{Recall@k}_t=\frac{|G_t^{(m)}\cap\mathcal S_t^{(k)}|}{|G_t^{(m)}|}. \tag{9}
$$

$m$ 与 $k$ 必须分别报告. 若把教师集合也取成 $k$, recall 衡量同预算排序重合; 若 $m<k$, 它衡量较大候选能否覆盖最重要的少量 token. 还可计算教师概率质量覆盖 $\sum_{s\in\mathcal S_t}p_{t,s}$, 让第一名比边缘项贡献更大.

平均 recall 容易被大量局部 query 稀释. 应按层、query 位置、相对距离和任务类型给出分位数. 唯一证据检索关注最差位置, 多证据聚合关注被覆盖证据数量, 语言模型 loss 则偏向常见局部 token. MISA 报告每层选中 token 与 DSA 的重合超过 92%, HISA 报告与原 DSA 选择集合的平均 IoU 超过 99%; 这些数字的参照是 DSA selector, 不等同于对稠密 attention 的绝对召回.

## 3. 索引器何时吃掉稀疏收益

### 3.1. Prefill 和 Decode 的复杂度不同

对长度 $n$ 的 Prefill, Lightning Indexer 计算全部 causal 对, 复杂度仍是 $O(n^2H^Id^I)$. Sparse MLA 只计算 $k$ 个候选, 约为 $O(nkd_{main})$. 因为 $d^I$、$H^I$ 与精度都小于主 MLA 的对应工作, DSA 仍可加速; 随 $n$ 增长, indexer 的平方项最终会占比上升. DeepSeek-V3.2 报告也明确说明 indexer 仍为 $O(L^2)$, 只是计算远少于原 MLA.

Decode 第 $t$ 步只有一个新 query. indexer 扫描 $t$ 个缓存的 $K^I$, 成本为 $O(tH^Id^I)$; selector 取 top-k, Sparse MLA 读取 $k$ 个 latent KV. 对生成 $n$ 个 token 的整段过程求和, indexer 仍是平方累计, 但单步可以用 GEMV/小矩阵核执行. Decode 常受 HBM 带宽限制, indexer key cache 的字节数与读取方式比 FLOPS 更重要.

短 Prefill 上, top-k、索引 materialize 和不规则 gather 的固定成本可能超过少算的主 attention. DeepSeek 报告为短序列 Prefill 特别实现 masked MHA 模式模拟 DSA, 正说明稀疏 kernel并非所有长度都占优. 服务端应根据长度与 batch 选择路径, 不能强制所有请求走 token-sparse kernel.

### 3.2. top-k 不只是一个 API 调用

对每个 query 从长度 $t$ 的分数中取 2048 项, 完整排序需要 $O(t\log t)$ 比较, 实现通常使用分块选择、radix top-k 或多级归并. NVIDIA cuDNN 的 DSA 模块同时提供 indexer forward、融合 indexer+top-k 和独立 radix top-k, 并允许按 `seq_lens` 处理变长行. 融合能避免把完整分数矩阵写回 HBM, 对极长上下文尤其关键.

如果 indexer 先物化 $B\times n\times n$ FP32 分数, 内存已经不可接受. 更合理的 kernel边算分块分数边维护局部 top-k, 再归并为每行最终候选. 训练需要 KL 或 backward 时可能重算选中分数, 而不是永久保存全部稠密分数. 这与 FlashAttention 的思想相似: 数学对象是大矩阵, 执行不必物化它.

top-k 输出为整数位置, 后续 Sparse MLA 根据位置 gather latent KV. 每个 query 的位置不同, 内存访问近似随机. 对同一 batch, 可按 key 位置重排工作、让邻近 query 共享加载, 或把候选整理成 tile; 整理本身又会产生排序与索引成本. element-wise 选择比 block-wise 更贴近注意力峰值, kernel 更难达到 tensor core 的规则吞吐.

### 3.3. KV cache、量化与两套状态

DSA 推理至少维护主 MLA latent KV cache 与 indexer K cache. 前者供式 (3)的精确 attention, 后者供式 (1)的全历史扫描. indexer 不需要 V, 但 $K^I$ 必须覆盖所有仍可选的历史 token. 如果主 KV 保留完整而 indexer K 被驱逐, selector 看不到仍存在的主 KV; 如果反过来, selector 会返回已经无法读取的位置.

官方模型实现包含 indexer K 的量化缓存与尺度. FP8 使全历史扫描的字节和算力下降, 也会改变边界附近分数排序. 量化验证不能只比较平均分数误差, 要比较 top-k 集合重合、稠密概率质量覆盖和任务结果. 可以用更大候选做粗召回, 再用高精度 indexer 或主 QK 精排, 但会增加读取.

Prefill 可以一次生成整段 $K^I$ 并执行大矩阵 kernel; Decode 每步追加一条 $K^I_t$ 到 cache. 主 MLA 在 Decode 下可使用权重吸收等 MQA 形式, 让 latent KV 被所有 query heads 共享. indexer 的共享 $K^I$ 与主 MLA 的共享 latent 是两套不同表示, 不能把 indexer key 当作主 attention key 使用.

## 4. HISA、MISA 与 LISA 改了哪一段

### 4.1. HISA: 先筛块, 再按原式精排 token

HISA 将 DSA 的平坦全量扫描改为两阶段层次搜索. 历史 $K^I$ 先按块聚合成代表, query 对块代表打分并保留少量候选块; 随后只在这些块内部计算原 DSA indexer 式 (1), 最终仍输出 token 级 top-k. Sparse MLA 接口和候选数不变, 因而 HISA 是 indexer 的免训练替换.

设块大小为 $b$, 块数 $N=\lceil n/b\rceil$, 粗选保留 $r$ 个块. 平坦 DSA 每个 query 打分 $n$ 个 token; HISA 粗筛约比较 $N$ 个代表, 精排约比较 $rb$ 个 token. 忽略 head 维, 成本从 $O(n)$ 变成 $O(n/b+rb)$. $b$ 太小会让粗筛接近全量, 太大则每个候选块带入更多无关 token. $r$ 决定 coarse recall, 最终 top-k 无法找回被整块剪掉的 token.

HISA 的关键评测是对原 DSA 候选的集合保真. 论文报告直接替换 DeepSeek-V3.2 和 GLM-5 的 indexer, 无需微调; 摘要给出 kernel 在 32K 达到 2 倍、128K 达到 4 倍的结果, 并报告选择集合平均 IoU 超过 99%. 这证明层次筛选能高度复现 DSA selector, 并不证明 DSA 自身与稠密教师完全一致.

### 4.2. MISA: 少算 indexer heads

MISA 观察到 DSA 的多个 indexer heads 最终共同产生一套候选, 对每个 query 全部激活可能冗余. 它把 $H^I$ 个 heads 视为专家池, 轻量 router 根据块池化的 indexer keys 为当前 query 选择 $h\ll H^I$ 个 active heads, 只有这些 heads 扫描 token 并贡献式 (1). 路由器的输入规模由少量块代表控制, 避免自己成为另一套 token 级扫描.

若原 indexer 有 $H^I=64$, 每个 query 只激活 $h=8$, token 打分主体减少到八分之一, 再加 router. MISA 官方摘要报告, 只激活 8 个 heads 时, 在 DeepSeek-V3.2 与 GLM-5 上分别以 8 倍和 4 倍更少的 indexer heads 匹配原 DSA 的 LongBench 质量, H200 上 TileLang kernel约有 3.82 倍加速. 实际加速低于 head 数缩减, 因为 router、内存和 top-k 没有同比消失.

MISA 还给出 hierarchical variant: routed pass 先保留放大的候选集, 再用原 DSA 全 indexer 对候选精排. 这相当于「稀疏 heads 粗召回 + 完整 heads 局部精排」. 它与 HISA 都采用两阶段搜索, 第一阶段削减的对象不同: MISA减少参与扫描的heads, HISA先缩小token区域.

### 4.3. LISA: 线性状态与稀疏检索并联

LISA 的目标不只是让 DSA indexer 更快. 它在原模型中并联线性 attention 与 indexer 引导的 sparse self-attention, 再由 gate 融合. 线性分支以 $O(n)$ 状态提供全局长程记忆, sparse 分支从全上下文选 top-$M$ token 做精确 softmax attention. 若 selector 漏掉广泛分布的小权重信息, 线性分支仍可能保留聚合信号.

训练分两阶段. 第一阶段引入线性 attention, 配合滑动窗口 sparse attention, 通过冻结教师的知识蒸馏逼近 full self-attention. 第二阶段用 indexer 替换固定窗口, 以 per-head KL 对齐教师 attention pattern. 与 DSA 先预热共享 selector 再全模稀疏适配相比, LISA 明确保留两条并行信息通道, 并把对齐细化到 head.

论文在 DeepSeek distilled Qwen 系列上报告 16K 上下文约 50% 推理加速, 推理类评测平均提升 5.6%. 这里的质量变化包含架构迁移与训练, 不能归因于 indexer 单独更准. LISA 的线性状态、sparse KV、indexer K 和 gate 都有运行状态, cache构成也比纯 DSA 更复杂.

## 5. 内核、共享与失效边界

### 5.1. 跨头与跨层共享是两件事

DSA 在一个 layer 内用多个 indexer heads 产生共享 token 集合, 这是跨头聚合. MISA 让每个 query 只激活其中少量 heads, 仍在同层完成. 跨层共享则让相邻 layers 复用 $S_t$ 或某种 indexer 表示, 省去重复扫描. 前者减少式 (1)求和中的 head 数, 后者减少执行式 (1)的 layer 数.

复用跨层 top-k 的风险是 attention 偏好随深度变化. 浅层可能偏局部词法, 深层偏语义实体; 同一候选集合不能保证覆盖两者. 可用教师测量相邻层候选 IoU, 按相似区间设共享组, 并在组首完整重建. 若只共享 $K^I$ 而每层保留独立 $Q^I$ 和 top-k, 省的是 key 投影/cache, 不是全扫描.

跨头和跨层共享都要写清共享对象: 参数、indexer K、query heads、分数还是整数 top-k. 共享分数仍需每层 top-k; 共享 top-k 直接跳过 selector; 共享 KV 只省存储或投影. 把这些统称「共享索引」会无法核算质量和性能.

### 5.2. kernel 边界从 selector 延伸到 Sparse MLA

高效链路应尽量融合 indexer score、causal mask 与 top-k, 避免写回 $n^2$ 分数. top-k 输出随后进入 Sparse MLA kernel, 按不连续地址加载 latent KV. selector 和 attention 若完全分离, 整数索引要写回 HBM 再读入; 若融合, kernel 又要同时处理低维检索与高维 attention, 寄存器和调度更复杂.

训练路径比推理多 backward 和 score recompute. cuDNN DSA 文档列出 sparse attention backward、indexer forward/top-k、稀疏与稠密 score recompute、indexer backward 等独立操作. 这反映一个现实: 前向选择少量 token 不等于反向也自然稀疏. 对齐损失需要哪些未选分数、梯度怎样回到 $Q^I,K^I,W^I$, 都必须由训练 kernel定义.

element-wise gather 的 HBM 合并程度取决于候选排序. 按分数 top-k 返回的索引是无序或按分数排列, 按位置重排后读取更连续, 但主 softmax 不关心位置顺序. kernel 可将候选按物理页和 offset 排序, 同时保留去重与 causal 有效长度. 索引整理时间应计入 selector, 不能只计 QK 打分.

### 5.3. 数值、量化和失效诊断

FP8 indexer 的误差主要表现为排序变化. 对相差很大的分数, 量化不影响 top-k; 对 cutoff 附近密集分数, 微小误差会替换候选. 因此应测 top-k cutoff margin: 第 $k$ 名与第 $k+1$ 名的差越小, 选择越不稳定. MISA 的少 head 路由和 HISA 的粗筛又会叠加离散边界, 可以通过扩大第一阶段候选后精排缓解.

最危险的失败是稳定漏掉罕见关键 token. 平均 recall 和 LongBench 均分可能保持良好, 唯一约束、代码定义或多跳中间证据却持续缺席. 测试应控制证据距离、出现次数、相似干扰和所需证据数, 并记录最差 query 的概率质量覆盖. Needle 热图检查单证据位置, 不能替代多证据聚合.

性能失效则常见于短序列、top-k 过大、候选地址太散和 indexer K 带宽过高. 诊断应拆分 indexer GEMM、top-k、索引整理、Sparse MLA gather/attention 和其他层时间. 若 indexer 已成为主耗时, HISA/MISA 类改造有意义; 若 Sparse MLA gather 更慢, 再压 indexer不会改变瓶颈.

### 5.4. 一套可复算的评测表

算法层记录教师 top-$m$ recall、概率质量覆盖、与基线 DSA 的 IoU、cutoff margin、每 query 候选数. 执行层记录 indexer 读取字节、top-k 时间、物理 KV gather 字节、kernel 时间与峰值工作区. 任务层记录困惑度、远程检索、多证据推理、代码与目标业务. 三层必须使用相同模型权重和上下文长度.

Prefill 与 Decode 分开: Prefill 报每层整段 indexer 和 Sparse MLA 时间; Decode 报不同 cache 长度的单 token 延迟以及 batch 扩展. 量化实验同时给出 indexer K dtype、scale 粒度与 top-k 重合. 跨层共享实验注明每几层刷新、共享哪种状态, 不能只写一个总体加速.

**selector 要在固定候选预算内召回主 attention 需要的位置, 同时让后续 kernel以更少字节完成精确计算.** DSA 建立可训练基线, HISA 缩小 token 搜索域, MISA 缩小 head 搜索域, LISA 增加一条线性全局通道. 它们最终都要通过同一张质量—索引—访存表接受检验.

### 5.5. selector 的预算怎样分配

固定 $k=2048$ 便于 kernel 预分配和批处理, 却隐含每个 query 需要相同预算. 实际 attention 熵随层、head 与位置变化. 一些 query 的教师分布集中在几十个 token, 另一些需要汇总许多段落. 自适应 $k_t$ 可以按教师熵、indexer cutoff margin 或累计分数质量决定, 但变长候选会让工作调度和内存规划更难.

设 indexer softmax 为 $r_{t,s}$, 可以选最小集合满足累计质量阈值 $\tau$:

$$
k_t=\min\left\{m:\sum_{s\in\operatorname{TopM}(r_{t,:},m)}r_{t,s}\ge\tau\right\}. \tag{10}
$$

式 (10)在 indexer 分布校准良好时有意义. 若分布过尖, 很小 $k_t$ 也会满足阈值, 但主 attention 未必同样集中. 若分布过平, $k_t$ 会逼近上下文长度. 训练时可以校准温度, 部署时仍要限制 $k_{min}\le k_t\le k_{max}$. 固定容量 kernel通常将 $k_t$ padding 到少数档位, 而不是支持每行任意长度.

预算也可按 layer 分配. 浅层局部性强时用较小 $k$, 中层实体聚合增大, 深层再根据实测收紧. 总关系预算 $K_{total}=\sum_lk_l$ 固定时, 可以用每层增量质量决定分配. 逐层独立最大化 recall 不是全局最优, 因为前层漏掉的信息会改变后层 hidden state, 教师分布也随之变化.

HISA 的两级预算包含候选块数 $r$ 与最终 token 数 $k$. 粗筛必须让 $rb\ge k$, 通常还要明显大于 $k$ 才给精排留余量. MISA 的预算包含 active heads $h$、粗候选 $k'$ 与最终 $k$. 减少 $h$ 后若直接取最终 top-k, 速度高而召回受限; 先取 $k'>k$ 再用全 heads 精排, 会在候选读取与重算之间取得中间点.

### 5.6. 从公式到 FP8 缓存的数值路径

式 (1)省略了实现中的缩放. 低精度点积需要控制 $q^I$、$k^I$ 与 head 权重的尺度, 否则 ReLU 前的大量值溢出或全部落在零侧. 常见路径是对 indexer key 分块量化, 保存 FP8 数据和每块 scale; query 在寄存器中转换到计算类型, 点积使用更高精度累积, 再乘 $w^I$ 并沿 head 维求和.

设真实 key 为 $k$, 量化值为 $\hat k=\operatorname{round}(k/a)$, scale 为 $a$. 重构误差 $e=a\hat k-k$ 使单 head 分数变化为 $q^Te$. 若 $\|q\|_2\|e\|_2$ 小于 top-k cutoff 的 margin, 排序保持; margin 更小时可能翻转. 因而 scale 粒度不只决定均方误差, 还决定 selector 的离散稳定性. 分块越细, 误差越小, scale 元数据和反量化操作越多.

ReLU 会放大量化对符号的影响. 一个真实小负值被量化成小正值后开始贡献, 小正值变成负值后贡献直接归零. 对接近零的点积, 相对误差很大, 但这类项若远离 top-k cutoff 未必影响选择. 数值测试应重点采样 cutoff 附近候选, 而非对全部 $n^2$ 分数平均.

权重 $w^I_{t,j}$ 可以为正或按实现经过缩放. 如果允许负权, 多 head 求和后 indexer 分数不再是简单的非负相似度累加; top-k kernel仍只比较最终标量. 融合 kernel必须保持 head reduce 的累积顺序和精度. 参考实现与优化实现输出集合不一致时, 先比较 cutoff margin, 再判断是容许的数值替换还是缩放错误.

### 5.7. 分布式执行和通信

在 tensor parallel 下, 主 attention heads 分散在设备, 但 DSA 的 token 集合应为 query token 共享. 若每张卡只用本地 head 的教师或 indexer部分独立 top-k, 各卡会得到不同 $\mathcal S_t$, 失去 latent KV 跨 heads 共享的优势. 一种路径是跨卡 reduce indexer head贡献, 再统一 top-k; 另一种是复制完整轻量 indexer, 让每卡独立得到相同结果.

reduce 的对象若是长度 $n$ 的分数行, Decode 每步需要一次跨卡通信, Prefill 则是大规模分数张量. 复制 indexer 增加参数和 $K^I$ cache, 但避免分数通信. 因为 indexer本身相对主模型小, 复制常更直接; 具体取决于 $H^I,d^I$、并行规模和显存. 配置必须保证随机性、量化 scale 与 causal 长度一致, 否则各卡 top-k 会分叉.

序列并行把历史 token 分到不同设备. 每张卡先计算本地 top-k 及分数, 再做全局 merge-top-k, 通信量约为每卡传 $k$ 个 `(score,index)` 而非传全部分数. 这是可扩展的分层选择, 但最终 Sparse MLA 可能要远程读取被选 latent KV. 将候选 KV all-to-all 到 query 所在设备, 或把 query发送到 KV 所在设备计算局部部分, 都会引入不规则通信.

候选热点还会造成链路不均衡. 很多 query 选择同一远端页时, 广播或复制可能划算; 候选分散时按需 gather 更省容量. 性能报告应包含本地/远程候选比例、每设备发送字节和最长链路, 只给单卡 indexer kernel不足以说明集群服务收益.

### 5.8. 训练梯度为什么需要重计算

top-k 对未选位置的离散集合没有常规梯度. DSA 通过独立 KL 教师训练 indexer, 不依赖语言模型 loss 穿过 selector. 但式 (7)的稠密预热需要全行学生分布, 式 (8)的稀疏阶段至少需要选中位置的 indexer logits. 为节省激活, 前向可只保存整数位置和必要统计, 反向时重算对应 $q^I,k^I,w^I$ 分数.

对式 (1), 令 $z_{t,s,j}=(q^I_{t,j})^Tk^I_s$, 活跃指示为 $m_{t,s,j}=1[z_{t,s,j}>0]$. 若上游对 $I_{t,s}$ 的梯度为 $g_{t,s}$, 则:

$$
\frac{\partial\mathcal L}{\partial q^I_{t,j}}
=\sum_sg_{t,s}w^I_{t,j}m_{t,s,j}k^I_s, \tag{11}
$$

$$
\frac{\partial\mathcal L}{\partial k^I_s}
=\sum_{t,j}g_{t,s}w^I_{t,j}m_{t,s,j}q^I_{t,j}. \tag{12}
$$

式 (11)-(12)说明 backward 包含按稀疏分数位置聚合的两组矩阵运算. 如果预热使用全行 KL, 求和范围是全部 causal $s$; 稀疏阶段只在 $\mathcal S_t$ 重算时, 梯度范围相应缩小. ReLU mask也要由重算点积恢复. cuDNN 文档中的 score-grad、三个 GEMM 与 dtype cast 正对应这种拆分.

主模型的语言模型梯度只经过 Sparse MLA 的选中边. 未选 token 不从当前 query 获得直接 attention 梯度, 但仍可通过别的 query、局部关系、残差和 MLP 更新. 继续训练 943.7B token 的作用之一, 就是让模型在长期稀疏梯度图上重新分配信息路径. 用短暂微调替代大规模适配时, 质量边界应单独验证.

### 5.9. DSA 与 NSA 的选择粒度

Native Sparse Attention(NSA)将压缩、选择与局部分支组合为原生训练架构, selection 以块为主要单位. DSA 的 selector输出 element-wise token位置, 再让 Sparse MLA读取精确 token. token 级候选更容易逼近稠密 attention 的离散峰值, 也会产生更随机的地址. block 级候选读取连续, 但一个命中 token会带入整块.

比较两者不能停在「token 更准」或「block 更快」. 需要固定物理 KV 字节: DSA 的 $k$ 个 token 可能分布在 $k$ 个 cache line或 page, NSA 的若干块虽然逻辑 token 更多, 实际事务更少. 还要固定训练条件: NSA 从结构内原生训练, DSA 从 V3.1-Terminus 继续训练并用教师对齐. 两者的质量来自不同适配过程.

从 indexer 角度, NSA 的压缩分支可以直接提供块级选择信号, DSA 另建 Lightning Indexer. DSA 的 indexer key cache是额外状态, 换来与主 MLA 解耦的低维 token打分. HISA 又把 block coarse filter加回 DSA selector前端, 说明 token 与 block 并非互斥路线: block适合缩小搜索域, token适合最终精排.

### 5.10. 端到端验收顺序

第一步验证数学正确性. 在 $n\le32$ 的小张量上显式计算式 (1), 加 causal mask, 用稳定排序得到 top-k, 再与融合 kernel比较分数和索引. 测例覆盖并列分数、序列开头 $t<k$、padding、FP8 cutoff 和多个 batch. top-k 并列时索引顺序可能不同, 应先确认候选值等价.

第二步验证 Sparse MLA 对固定候选的输出. 用同一 $S$ 分别运行朴素 gather attention 与优化 kernel, 检查 logits、行最大值、softmax 分母和输出. 这一步不把 selector近似混入 kernel误差. 第三步才比较 DSA 与稠密 MLA, 记录 recall、概率质量和 hidden state差异.

第四步评测 HISA/MISA 替换. 以原 DSA top-k 为教师, 分别画 recall—索引时间曲线. HISA改变 token搜索域, MISA改变 active heads, 两者预算轴不同, 应换算为实际 indexer MACs与读字节. 层次精排变体还要把第二遍读取算入成本.

算子测试通过后运行端到端任务和服务. 任务覆盖短上下文、长检索、多证据、代码与长推理; 服务覆盖 Prefill/Decode、batch、PD 分离和多卡. 只有 selector质量、Sparse MLA正确性和系统延迟同时通过, 才能把理论 $O(nk)$ 视为落地收益.

### 5.11. 一次 Decode 的逐项成本

取上下文长度 $t=131072$, indexer heads $H^I=64$, head 维 $d^I=32$, 最终 $k=2048$. 忽略 ReLU 和 reduce, 原 DSA indexer点积数量约为 $tH^Id^I=268435456$ 次乘加. Sparse MLA 主计算只访问上下文的 $2048/131072=1.5625\%$. 这个比例描述主 attention 候选, 不代表整层只剩 1.5625% 时间, 因为 indexer仍扫描全部历史.

若 MISA 每个 query激活 8 个 indexer heads, token打分主体变为约 $33554432$ 次乘加, 理论减少八分之七. router还要读取块池化 key 并选择 heads, top-k 与 Sparse MLA保持不变. 官方 H200 kernel约 3.82 倍而非 8 倍, 正符合 Amdahl 限制: 没缩减的 top-k、访存和固定开销决定上限.

若 HISA 使用块大小 $b=64$, 粗筛需要比较 $2048$ 个块代表. 假设保留 $r=128$ 块, 精排 token数为 $8192$, 是全历史的 $6.25\%$. 若这 8192 个候选覆盖原 DSA top-k 的 99%以上, selector点积显著减少. 但粗筛代表的构造、读取和块 top-k仍要计入. $r$ 降到 32 时精排恰好只有 2048 token, 几乎没有容错空间, 任一错误块都会直接损害最终 recall.

再看 cache 字节. 若 $K^I$ 以 FP8 保存, 每 token 的 indexer key主体约 $d^I=32$ 字节, 131072 token约 4 MiB, 未含 scale和对齐. 单步全扫描可进入较高 cache层级, batch增加后仍会争夺带宽. 主 latent KV若每 token更宽, 只读取 2048 项可显著省带宽. 因此 DSA 的收益来自「便宜表示全扫 + 昂贵表示少读」, HISA/MISA继续压缩前半段.

### 5.12. LISA 的并联状态怎样核算

LISA 线性分支通常维护可递推状态, sparse分支维护历史 KV与 indexer K. 对生成位置 $t$, 线性分支输出 $o_t^{lin}$, sparse分支输出 $o_t^{sp}$, gate $g_t$ 融合:

$$
o_t=g_t\odot o_t^{sp}+(1-g_t)\odot o_t^{lin}. \tag{13}
$$

$g_t$ 可以是标量、通道向量或按 head门控, 具体 shape 影响参数和融合成本. 式 (13)说明 sparse漏选并不等于信息完全消失, 线性状态仍对全部历史作压缩聚合. 同时, 线性状态无法保留任意 token的精确内容, 唯一字符串复制仍更依赖 sparse候选.

Stage 1先让线性分支与滑动窗口配合逼近教师, 使模型在没有动态 selector时建立稳定长程通道. Stage 2再把固定窗口换成 indexer选择, per-head KL让不同 attention heads分别对齐. 这种顺序减少同时引入线性状态和离散路由的优化难度, 代价是两阶段迁移与更多状态.

KV Cache对比必须把线性状态和 sparse cache一起算. 如果 LISA仍保留全历史 sparse KV供 indexer选择, 它降低计算而未必降低容量; 若再做 cache压缩, 需要说明被删除 token是否仍被线性状态概括. 论文报告的 16K推理加速来自完整系统, 不能用式 (13)单独推导显存比例.

量化时两分支敏感性不同. 线性状态误差会递推积累, indexer K误差影响离散 top-k, sparse KV误差影响被选 token的精排和值. 三种误差应分开做消融. 用同一 bit宽统一量化虽然实现简单, 未必是最佳分配.

### 5.13. selector 训练中的偏差与方差

KL 教师来自当前主 attention, 其分布随模型更新. 预热阶段主模型冻结, 教师稳定; 稀疏阶段主模型变化, selector追逐移动目标. indexer输入 detach 避免语言模型梯度直接改变 selector, 却没有消除教师非平稳. 较小 indexer学习率更新慢, 较大又可能追逐 mini-batch噪声.

跨 head求和降低单 head噪声, 也引入聚合偏差. 假设两个主 heads分别只关注位置 $a$ 与 $b$, 聚合教师给二者各一半质量. $k=1$ 时 selector必然只能满足一个, KL的最优解也无法同时召回. 增大 $k$、按 head分组候选或 per-head监督可以降低偏差, 会增加主 attention读取或 selector输出复杂度.

top-k训练还有暴露偏差. 式 (8)只在当前 selector已选集合内对齐, 未选但教师高分的位置无法直接进入学生 softmax集合. 稠密预热先把 selector带到合理区域, 是避免这一问题的关键. 后续可偶尔扩大候选、加入探索位置或使用层次粗召回, 但这些做法会改变训练成本, 需要明确实验支持.

batch中的长序列提供大量 query, 梯度样本数大, 相邻 query又高度相关. 统计有效样本量小于 token数量. 数据应覆盖不同文体、语言、代码和证据结构, 否则 selector会对训练域形成稳定偏好. 部署域迁移时, 先看 recall与 cutoff margin, 再判断是否需要继续对齐.

### 5.14. 负载、尾延迟与可观测性

固定 $k$ 让每个 query 的逻辑候选数相同, 物理工作量仍会变化. 候选可能集中在少数连续 cache pages, 也可能散布到 $k$ 个不同页面. 前者能合并事务和复用 L2, 后者需要大量 gather. profiler应记录唯一 page数、连续段数和每页命中次数, 单看 $k$ 无法解释 Sparse MLA时延.

batch内不同请求的上下文长度也影响 top-k. 较短行只需在 `min(k,t)` 个位置中选择, 较长行完整扫描. 若 kernel按最长行对齐, padding分数和无效比较会拖慢整批. cuDNN 接口中的 `seq_lens` 允许逐行限制, 调度器仍要避免把极长请求与大量短请求放进同一低效形状.

线上监控不宜保存用户的完整索引分数, 可以聚合每层 top-k距离分布、cutoff margin、候选页数、indexer时间与 Sparse MLA时间. 质量影子流量可在极低比例运行稠密教师, 计算概率质量覆盖; 正常流量只记录不含内容的统计量. 一旦某类请求的 margin下降或候选更分散, 可以判断问题来自选择不稳定还是访存退化.

尾延迟还受 top-k算法的数据分布影响. 大量相同分数、NaN 或异常 scale 会触发不稳定排序或额外处理. kernel入口应检查有效长度和 scale有限性, 训练阶段监控 indexer logits范围、ReLU零比例与 head权重分布. 一个 head长期零贡献可能是可裁剪冗余, 也可能是训练坍缩, 需要结合教师 recall判断.

### 5.15. 哪些结论不能从 DSA 推出

DSA 在 DeepSeek-V3.2 的质量结果不能直接证明任意模型都能通过短微调迁移到 token-sparse attention. 官方路径使用特定 MLA表示、128K数据、2.1B token预热和943.7B token稀疏训练. 基座、数据与训练预算改变后, selector对齐和主模型适应程度也会改变.

同样, 2048 是该模型稀疏训练的明确预算, 不是跨模型常数. head维度、上下文长度、任务中的证据密度和 kernel tile变化后, 合理预算都可能变化. 复现应从质量—时延曲线选点, 不能只复制配置数字.

对更短序列, `min(k,t)` 会使早期 query接近稠密; 对更长序列, 固定 $k$ 的保留比例持续下降. 因此长度外推既考验 indexer排序, 也考验固定候选容量能否承载更多潜在证据.

indexer为 $O(n^2)$ 也不表示 DSA 没有价值. 低维、共享 key、FP8 和融合 top-k 让平方项常数远小于主 MLA, 在报告硬件与长度上仍有端到端收益. 同样, 主 attention成为 $O(nk)$ 也不表示整体线性, 因为 indexer、MLP、通信和cache管理仍在.

HISA 的高 IoU与 MISA 的高重合说明它们接近 DSA selector, 不能代替对稠密教师和任务的验证. LISA 的任务提升包含线性分支与蒸馏, 不能证明任何 Lightning Indexer都会提高推理能力. 每个数字都要保留模型、长度、硬件和训练口径.

复现报告还应保存 selector 配置与模型权重的绑定关系. Indexer 参数、主模型继续训练步数、候选预算和 kernel版本中任一项改变, 原有 recall与延迟曲线都可能失效. 只保存最终权重而缺少稀疏训练阶段和候选配置, 无法判断另一个实现是否走了相同计算图.

## 6. Indexer 到底在逼近什么

### 6.1. 排序目标与注意力目标并不相同

把稠密注意力记为 $a_{tj}$, indexer 分数记为 $s_{tj}$. 最直观的训练方法是让 $s_{tj}$ 拟合 attention logit, 但 DSA 真正关心预算为 $k$ 的候选集合能覆盖多少重要位置. 只要前 $k$ 的次序正确, 分数整体平移、缩放甚至在头部区间内发生小幅形变, 都不会改变后续 Sparse MLA 读到的 token. 反过来, 均方误差很小也不保证 cutoff 两侧的顺序正确.

设教师前 $k$ 集合为 $T_k$, 学生集合为 $S_k$. 集合召回率是

$$
R_k=\frac{|T_k\cap S_k|}{k}. \tag{14}
$$

它直接衡量索引结果是否相同, 却把所有教师位置视为等价. 若漏掉的是教师第 $k$ 名且概率极低的位置, 影响通常小于漏掉第 1 名. 因此还要计算教师概率质量覆盖

$$
M_k=\sum_{j\in S_k}a_{tj}. \tag{15}
$$

当注意力分布尖锐时, $R_k$ 可以一般而 $M_k$ 很高; 当分布平坦时, 很高的 $R_k$ 也可能只覆盖有限质量. 两项指标回答不同问题, 不应互相替代.

### 6.2. 多头教师为何需要压成一个候选集合

MLA 的不同 query heads 可以关注不同历史位置. 若每个 head独立选 $k$ 个 token, 最坏要读取 $Hk$ 个 KV, 稀疏收益很快被候选并集吃掉. Lightning Indexer 用若干轻量 indexer heads产生分数, 再把它们聚合成共享候选, 本质上是在有限 I/O 预算下求多头注意力的联合覆盖.

可把第 $h$ 个教师头的重要性写成 $a^{(h)}_{tj}$, 聚合目标写成

$$
p_{tj}=\sum_h w_{th}a^{(h)}_{tj},\qquad \sum_h w_{th}=1. \tag{16}
$$

$w_{th}$ 决定哪些头在共享集合中更有发言权. 均匀权重简单, 但一个分布很平的头可能贡献大量低价值位置; 只看最大值会偏向极尖锐头. 可学习聚合能适应任务, 也可能让弱势头长期拿不到候选. 所以检查共享候选时, 除总体概率质量外还要看 per-head 最低覆盖, 否则平均数会掩盖少数头的系统性失配.

一个三头例子能看出冲突. 三个头分别把 $0.9$ 概率放在位置 10、20、30, 预算 $k=2$. 任何共享集合都至少牺牲一个头. 此时 indexer 即使准确找到了三个峰值, 容量约束仍让共享集合无解. 增加 indexer 参数不能突破集合大小, 只能通过增大 $k$、按头分组候选或让主模型在稀疏训练中重新组织注意力来缓解.

### 6.3. ReLU 分解为何适合轻量索引

Lightning Indexer 将多组低维 query-key 点积经过 ReLU 后加权汇总. 若写成

$$
s_{tj}=\sum_{r=1}^{H^I}\alpha_{tr}\operatorname{ReLU}\!\left(\langle q^I_{tr},k^I_j\rangle\right), \tag{17}
$$

每个 indexer head 都像一个简单的匹配专家. ReLU 把负相关直接截为零, 聚合时不会让一个 head 的强负值抵消另一个 head 的正证据. 对 top-k 检索而言, 这种非负证据累加比追求完整的正负相似度更容易解释: 某个位置只要得到若干匹配头支持, 就能进入候选.

它也带来死区. 当某个 head 对绝大多数 token 都输出负点积时, ReLU 后梯度与贡献同时消失. 监控零比例不能只看全局平均, 应分层、分 head、分数据域统计. 若一个 head 在普通文本中沉默、在代码中活跃, 它可能是有用专家; 若所有数据上都沉默, 才更像训练坍缩.

$\alpha_{tr}$ 若随 query 变化, 相当于先判断当前问题需要哪类匹配, 再组合 token 分数. 这为 MISA 的 head 路由提供了自然入口: 与其每次计算所有 $H^I$ 个匹配头, 不如先用更便宜的 router 找出少数可能贡献最大的头.

### 6.4. top-k 边界决定了真正的稳定性

把排序后的 indexer 分数写为 $s_{(1)}\ge\cdots\ge s_{(n)}$, cutoff margin 定义为

$$
\Delta_k=s_{(k)}-s_{(k+1)}. \tag{18}
$$

当 $\Delta_k$ 很大时, 量化、舍入和 kernel 实现的小误差通常不改变集合; 当 $\Delta_k$ 接近零时, 极小扰动就会交换边界 token. 因此验证 FP8 indexer 时, 只比较分数均方误差意义有限. 更有用的是按 margin 分桶观察集合重合与概率质量损失.

并列分数还牵涉稳定排序. 两个实现都返回合法 top-k, 索引却可能不同. 如果并列位置的教师质量相近, 这不构成数值错误; 若后续测试强制逐索引相等, 反而会制造假失败. 可靠测试应先比较 cutoff 值, 再比较严格高于 cutoff 的必选集合, 最后检查并列集合中返回数量与输出误差.

训练损失连续, top-k 决策离散, 两者之间始终存在缝隙. 稠密蒸馏能把总体分布推近, 但最终部署质量仍由 cutoff 附近的排序决定. 这正是稠密预热、扩大探索候选和稀疏适应阶段缺一不可的原因.

## 7. 两阶段训练的因果链

### 7.1. 先固定教师, 再让模型适应缺失连接

第一阶段冻结原模型, 让 indexer 观察稠密注意力产生的教师分布. 此时监督目标稳定, 主模型也不会为了迎合一个尚未学会检索的 selector 改变表示. 这一步解决的是「怎样用便宜特征预测原模型会看哪里」.

第二阶段真正启用稀疏 attention, 主模型只能访问候选集合. 即使 indexer 对原教师有很高 recall, 遗漏仍不可避免; 原来依赖多个低概率位置累积的信息也会改变. 继续训练让 query、key、value 与 MLP 共同适应新的连接图, 解决的是「模型怎样在受限图上重新分配信息」. 两阶段看似都在对齐 attention, 优化对象其实不同.

若从第一步就同时更新全部参数, selector 可能追逐不断移动的教师, 主模型又会迁就早期的错误候选. 二者形成反馈: 某位置没被选中, 主模型逐渐不再向它写入有用信息; 教师信号随之变弱, selector 更没有机会把它找回来. 稠密预热先建立较可靠的召回面, 能显著缩小这种自我强化的错误区.

### 7.2. 稀疏集合内归一化会放大遗漏

稠密 attention 的输出为

$$
o_t=\sum_{j\le t}a_{tj}v_j,
$$

稀疏版本只在 $S_k$ 内重新做 softmax:

$$
\tilde o_t=\sum_{j\in S_k}\frac{a_{tj}}{M_k}v_j. \tag{19}
$$

即使假设候选内 logit 完全相同, 缺失质量 $1-M_k$ 也会让保留位置整体乘上 $1/M_k$. 当 $M_k=0.98$ 时重标定很小; 当 $M_k=0.6$ 时, 保留证据被放大约 1.67 倍. 因而漏选影响不只来自被丢掉的 value, 还来自剩余分布重新归一化.

由三角不等式可给出一个粗界. 若 $\|v_j\|\le V$, 则在上述理想化条件下

$$
\|o_t-\tilde o_t\|\le 2(1-M_k)V. \tag{20}
$$

这个界较松, 但说明概率质量比纯集合 recall 更接近输出误差. 实际系统还有候选内 logit 重算、位置编码与数值误差, 应把式 (20)当作诊断直觉, 不能当作任务性能保证.

### 7.3. 预算课程比固定预算更容易定位问题

训练早期可以用较大候选预算 $k_0$, 随 indexer 稳定逐步降到目标 $k$. 大预算降低主模型突然失去连接的冲击, 也让边界附近位置仍有梯度通路. 但课程策略会增加训练计算, 并可能让模型迟迟不适应最终预算. 具体退火曲线需要由每个预算下的质量、质量恢复速度与 selector margin共同确定.

另一种做法是固定最终 $k$, 额外采样少量探索 token. 探索集合不必进入正式推理, 只用于估计当前 selector 漏掉的教师质量并提供纠偏信号. 均匀随机对长上下文效率很低, 可按块、距离或教师粗分数分层抽样. 这里的核心是让未选位置仍有被观察的机会, 不是把随机稀疏本身当成检索器.

### 7.4. 动态教师下怎样判断已经收敛

稀疏训练阶段的教师随主模型更新, 单看训练损失下降可能误判. 需要固定一批长上下文探针, 定期用稠密 MLA 离线重算教师, 同时保存任务输出. 若 indexer KL 下降而固定探针的概率质量覆盖恶化, 说明学生只是追上了已经发生漂移的教师或分布变平, 并没有改善选择.

收敛至少包含三层: indexer 对当前教师的选择稳定; 稀疏模型与稠密参照的 hidden state 差异不再扩大; 长上下文任务在目标预算上恢复. 三者时间尺度不同. selector 很早稳定不代表主模型已经学会在稀疏图上传递信息, 任务恢复也可能来自模型绕过长程依赖. 因此还需要受控检索样本确认远距证据确实被使用.

## 8. 从平方索引到层级检索

### 8.1. DSA 的总复杂度要拆成两项

对长度 $n$, indexer 维度 $d_I$, 主注意力每个候选的有效计算宽度 $d_A$, 候选数 $k$, 忽略 head 常数后可写成

$$
C_{DSA}\approx c_I n^2d_I+c_A nkd_A. \tag{21}
$$

第二项是人们常说的 $O(nk)$, 第一项仍是低维全序列两两打分. 当 $n$ 继续增长, 第一项最终占主导. DSA 的工程价值来自 $d_I\ll d_A$、低精度缓存与融合算子降低 $c_I$, 不是从数学上消除了平方项.

交叉长度可由两项相等粗略估计:

$$
n_*\approx \frac{c_Akd_A}{c_Id_I}. \tag{22}
$$

若优化后的 indexer 每次乘加更便宜, $c_I$ 较小, $n_*$ 会向更长上下文移动; 若 Sparse MLA 的 gather 很低效, $c_A$ 变大, 主分支反而更久占主导. 因此「瓶颈在哪个长度出现」是硬件与 kernel 共同决定的, 不能只从大 O 符号回答.

### 8.2. Decode 的线性扫描仍会随历史增长

自回归 Decode 每一步只有一个新 query, 原始 DSA 仍需与全部 $t$ 个 indexer keys 点积. 单步成本约

$$
C_t\approx c_Itd_I+c_Akd_A. \tag{23}
$$

生成 $m$ 个 token 时, 索引部分累计为 $c_Id_I(mn+m(m-1)/2)$, 主稀疏 attention 约为 $c_Amkd_A$. 当输入很长而输出也长, indexer 扫描会反复读取几乎相同的历史 key. 这正是 HISA 与 MISA 关注 selector 自身的原因: 主 attention 已经稀疏以后, 下一块肥肉就是找候选的过程.

Decode 与 Prefill不能共用一句「复杂度降低」概括. Prefill 有大量 query, 可把点积做成高吞吐矩阵运算; Decode 的单 query扫描更容易受内存带宽限制. 相同 MAC 数在两个阶段对应不同时间. 评测必须分别给出首 token 延迟、每 token 延迟与长输出累计时间.

### 8.3. HISA 的两级召回可以分解

把历史 token 划为块, 粗筛选中的块集合记为 $B_r$, 其中包含的 token 集合为 $U(B_r)$. HISA 先在块级缩小搜索域, 再在候选块内精确计算 token indexer 分数. 相对原 DSA top-k 的最终召回可分成

$$
R_{final}=R_{block}\cdot R_{token\mid block}, \tag{24}
$$

其中 $R_{block}$ 表示教师 token 落入候选块的比例, $R_{token\mid block}$ 表示进入候选块后精排保留下来的比例. 若第二级直接使用原 DSA 分数并给足 $k$, 后一项通常接近 1, 主要误差来自块粗筛.

这个分解给出明确的调参方向. $R_{block}$ 低时应改块表示、增加候选块或减小块长; 候选域已覆盖教师而最终召回低, 问题才在 token 精排预算、数值或实现. 把两级只报成一个 IoU, 很难知道损失发生在哪.

### 8.4. 块代表为何会漏掉稀有尖峰

若一个 64-token 块用均值 key 表示, 其中 63 个普通 token 可能淹没唯一关键 token. 假设 query 与关键 key点积为 10, 与其余 key均为 $-0.2$, 块均值分数约为 $(10-12.6)/64=-0.0406$. 这个块可能在粗筛阶段被淘汰, 即使关键 token 按原 DSA 分数本应排第一.

最大池化能保留尖峰, 却难以对向量各维独立取最大后仍保持一个真实 key 的几何意义. 多代表原型、分块最大上界或学习型摘要能改善召回, 都会增加粗筛存储和计算. HISA 的关键不只是「先选块再选 token」, 而是设计一个便宜且对重要 token 有保守覆盖能力的块表示.

边界跨块也是常见问题. 一段语义证据被切在两个块之间时, 每块摘要都可能不突出. 重叠块可提高覆盖, 代价是重复索引; 多尺度块能同时看局部尖峰与长段主题, 代价是层级更复杂. 这些取舍应通过受控的单点证据、多点证据与跨边界样本分别测量.

### 8.5. 层级方法何时反而更慢

设总块数 $n/b$, 保留 $r$ 块, 粗筛宽度 $d_B$. 单步成本可粗写为

$$
C_{HISA}\approx c_B\frac{n}{b}d_B+c_Irbd_I+c_T, \tag{25}
$$

$c_T$ 包含两次 top-k、索引展开和调度. 当上下文不长、$r b$ 接近 $n$ 或块表示没有驻留缓存时, 新增粗筛层只会增加固定成本. 层级索引应在长上下文、较小候选域和可复用块摘要下启用, 而非无条件替换原 DSA.

动态阈值可以根据粗筛 margin 决定 $r$. 主题明确、头部块分数陡峭时少保留; 分布平坦时扩大候选块. 这样能把算力用在不确定 query 上, 但 batch 内变长工作量会增加 kernel 调度难度. 实际实现可把 $r$ 限制在少数离散档位, 兼顾自适应与规则形状.

### 9. MISA：把索引头也看成专家

#### 9.1. 冗余来自哪里

式 (17)每次计算全部 indexer heads, 但某个 query 的聚合权重往往集中在少数头. 若 64 个头中只有 8 个产生主要正贡献, 其余 56 个点积对最终 token 排名影响很小. MISA 将这些头视为专家池, 先预测当前 query 需要哪些专家, 再只执行 active heads.

这与 token top-k 是两条正交的稀疏轴. head 路由减少「用多少种匹配规则扫描历史」, token 路由减少「主 attention 读取多少历史位置」. 前者做错会改变所有 token 的 indexer 分数, 后者做错只遗漏具体候选; 因此 head router 虽小, 错误传播范围反而更广.

#### 9.2. 活跃头恢复率不能代替 token 恢复率

假设完整 indexer 中贡献最大的 8 个 heads 为教师活跃集, router 准确找回 7 个, head recall 达 87.5%. 如果漏掉的那个 head 专门检索唯一答案 token, 最终 token top-k 仍可能失败; 反过来, 漏掉一个与其他头高度冗余的专家几乎没有影响. 所以 MISA 既要报告 active-head 重合, 也要报告最终 token 集合与概率质量.

更直接的训练目标是最小化裁剪 heads 后的聚合分数误差或 token 排名损失. 但精确教师需要先算全部 heads, 会削弱训练加速. 实践中可离线生成教师、周期性全算校准, 或让便宜 router 学习完整 indexer 的 top-head 分布. 推理时无需教师, 训练口径却必须说明清楚.

#### 9.3. 专家多样性决定可压缩程度

若所有 indexer heads 学到近似方向, 任取少数头都能维持排序, MISA 很容易压缩; 但这也说明原 indexer 过度冗余. 若每个 head 负责独特语义, 激进裁剪会明显伤害召回. 可用 head 输出相关矩阵、候选集合 Jaccard 与边际概率质量贡献衡量多样性.

训练时加入多样性约束可能减少冗余, 却让 MISA 更难只激活少数专家. 反过来, 强化可替代性有利于推理裁剪, 可能浪费完整模型容量. 固定 active-head 预算下的匹配模式覆盖率, 比单纯追求 heads差异更值得优化.

#### 9.4. router 的错误应当有退路

当 router 置信度低或 top-head margin 很小时, 可以临时启用更多 indexer heads. 这与动态 token预算同理: 清晰 query 走窄路径, 模糊 query 扩大计算. 由于 head数量通常远小于 token数, 这一级自适应更容易限制在 8、16、32 等几个档位.

另一种保护是保留少数全局共享 heads, 每次必算, 其余专门 heads再由 router选择. 共享 heads提供基础召回, 专家补充细节. 若全局 heads 已覆盖绝大多数普通请求, router 错误只影响长尾模式; 代价是最低成本不再等于纯 8-head 路径.

### 10. LISA：压缩记忆与精确检索并联

#### 10.1. 两条分支解决不同的信息形态

线性 attention 将历史压入固定尺寸状态, 擅长累计主题、统计与平滑特征; 稀疏 attention 保留可寻址的 token, 擅长复制实体、代码片段和孤立证据. LISA 让两个分支分别承担「不可逆压缩」与「少量精确读取」, 这种分工决定了它的能力边界.

设线性状态为 $Z_t$, 更新写成 $Z_t=F(Z_{t-1},k_t,v_t)$. 无论 $F$ 如何设计, 固定容量状态都可能让不同历史映射到相同 $Z_t$. 单靠它无法保证恢复任意原文 token. sparse分支保留历史地址空间, 用 indexer 找回少量细节, 补上这种信息论缺口.

#### 10.2. gate 不是免费的容错器

式 (13)中的 $g_t$ 若偏向线性分支, selector 漏选的影响会减弱; 但模型也可能学会长期忽略 sparse分支, 使 indexer 得不到足够训练信号. 若 $g_t$ 过早偏向 sparse分支, 线性状态又难以形成有用摘要. 两阶段训练先建立线性通道, 再引入索引, 本质上是在避免两条分支互相抢占梯度.

评测 gate 应按任务与位置展开. 在局部语言建模 token 上偏线性、在精确检索答案附近偏 sparse, 才符合预期分工. 只报告平均 gate 值会把这种结构抹平. 还应检查 gate 是否只是随层号或上下文长度固定变化, 而没有响应实际证据需求.

#### 10.3. 线性分支不会自动消除 KV Cache

只要 sparse分支仍可能选择任意历史 token, 对应 key/value 或可重建表示就必须保留. 线性状态降低的是全量 attention 计算, 不必然降低 sparse地址空间的存储. 若进一步删除低价值 KV, indexer 即使选中也无法读取, 系统就从计算稀疏进入了记忆压缩问题.

可以把三类状态明确列开: 递推线性状态 $Z_t$; indexer keys $K^I$; sparse主分支可读取的 latent KV. 它们维度、精度和生命周期都不同. 讨论显存时少算任何一项都会夸大收益. 特别是 indexer key 很窄, 主 latent KV较宽, 二者量化策略不应被一句「KV用 FP8」混在一起.

#### 10.4. LISA 的误差会沿两条路径累积

线性状态量化误差随递推传播, 可能逐步积累; indexer误差在 top-k 边界离散放大; sparse value误差只影响被读位置. 三者对序列长度的响应不同. 应分别改变状态精度、indexer精度与 latent KV精度, 而不是同时量化后只看最终困惑度.

长序列还会让 gate承担分配误差的任务. 如果线性状态随长度退化, gate可能越来越依赖 sparse分支; 若候选预算固定, sparse分支同时承受更低保留比例. 这会产生双重压力. 长度外推实验应同时画 gate、概率质量覆盖与状态范数, 才能判断瓶颈落在哪条路径.

## 11. 候选预算是一种容量

### 11.1. 固定 k 隐含了强假设

固定 $k=2048$ 假设每个 query 无论面对 8K 还是 128K 历史, 都能用同样数量的 token 获得足够证据. 对单点检索, 上下文增长主要增加干扰项, 固定 k可能成立; 对全文归纳、多文档比较或代码依赖, 有效证据数量可能随长度增长, 固定容量会成为任务瓶颈.

保留比例 $k/n$ 下降本身不是问题. 注意力常常高度稀疏, 真正需要看的是达到目标概率质量所需的最小 $k$. 定义

$$
k_\tau(t)=\min\left\{k:\sum_{j\in T_k}a_{tj}\ge\tau\right\}. \tag{26}
$$

若 $k_{0.95}$ 随长度保持稳定, 固定预算有依据; 若它随证据数量持续增加, 再好的 selector 也无法用固定 $k$ 完成覆盖.

### 11.2. 动态预算应由不确定性驱动

可依据累计分数质量、cutoff margin 或粗筛熵选择预算. 分数头部陡峭时用小 k, 平坦时扩大. 但 indexer 分数未必校准为概率, 不同层的尺度也不同. 在用阈值前, 应通过教师概率质量把 margin 或熵映射到实际漏失风险.

动态 k会造成变长候选与负载不均. 一个 batch中只要少数 query 扩大到 4096, kernel若按最大长度对齐, 其他 query也可能付出代价. 可采用离散预算桶并按桶重排 query, 但重排与恢复顺序又有开销. 算法层的弹性只有与规则执行形状结合, 才能变成延迟收益.

### 11.3. 多证据任务怎样压垮 top-k

设问题需要从 $m$ 个文档各取一个证据, 每个文档周围有 $c$ 个相似 token. 若 indexer对每个证据簇都给出相近高分, 仅覆盖全部簇就可能需要 $mc$ 个候选. top-k 还会被某一文档中的重复模板占满, 导致其他文档完全缺席.

这时可在排序中加入多样性, 例如按块或文档设置软配额, 先保证覆盖再在块内精排. 代价是可能压低真正应该集中读取的区域. 另一条路线让上层先选择文档或块, 下层选 token, 把证据多样性显式放进层级结构. 无论采用哪种方法, 多证据覆盖率都应独立于总体 token recall报告.

### 11.4. 预算与层深应该联动观察

浅层注意力偏局部和词法, 深层更可能形成任务相关检索. 给所有层相同 k实现简单, 但不一定有效. 某些层只需窗口与少量远程 token, 某些层承担跨文档聚合, 应有更大候选容量. 层间预算分配可在总读取量固定下优化.

然而逐层缩小 k会改变 residual stream 中的信息可达性. 一层漏掉的证据可能在后续层已无法恢复, 除非其他层重新访问原 token. 评估层预算时不能只做单层 attention重放, 必须运行完整网络并追踪证据首次被读取、写入 residual、再被后层利用的路径.

### 12. 数值、并行与复现细节

#### 12.1. FP8 主要威胁排序而非均方误差

indexer key量化为 FP8能显著减小扫描带宽, 但 top-k 对边界顺序敏感. 若两位置真实分数分别为 1.001 和 1.000, 共同 scale 下很可能量化到同一值; 若分别是 10 和 1, 即使绝对误差更大也不影响排序. 因此量化校准应关注局部 rank inversion 与 $\Delta_k$, 而非只最小化全张量 MSE.

scale粒度也影响稳定性. per-tensor scale容易被极端 key占据动态范围; per-block或 per-channel scale更精确, 同时增加 scale读取与反量化操作. 由于 indexer要扫完整历史, scale元数据的带宽不可忽略. 最优粒度要在排序保持率和实际 kernel吞吐之间测量.

#### 12.2. 分片 top-k 可以做到精确合并

在序列维分到 $P$ 张卡时, 每张卡持有一段历史并计算本地 top-k. 全局 top-k 一定包含在各分片本地 top-k的并集中: 若某 token连本分片前 k都进不了, 该分片已有至少 k 个分数不低于它, 它不可能进入全局前 k. 因此先收集 $Pk$ 个候选再做全局 top-k, 在精确分数与一致 tie规则下不会损失召回.

通信量从传全部 $n$ 个分数降为每卡传 $k$ 个分数与索引, 约为 $O(Pk)$; 但随后 Sparse MLA需要从候选所在卡读取 value. 如果候选高度集中, 负载会倾斜; 若每卡都贡献少量, all-to-all消息增多. selector通信省下来了, value路由仍须单独优化.

#### 12.3. 层间共享的收益与信息损失

相邻层复用候选能减少重复扫描. 若第 $l$ 层候选为 $S_l$, 第 $l+1$ 层只在 $S_l$ 加少量补充集合中搜索, 成本明显下降. 但不同层承担的功能不同, 共享会把第 $l$ 层的漏选永久传递给下一层.

可先测 $J(S_l,S_{l+1})=|S_l\cap S_{l+1}|/|S_l\cup S_{l+1}|$. 高 Jaccard说明有共享潜力, 仍需检查差集是否包含高教师质量 token. 更稳妥的办法是共享粗筛块、各层独立精排 token: 这样复用大部分扫描, 同时保留层级差异. 它与 HISA 的层级结构天然兼容.

#### 12.4. 可复现结果需要保存哪些状态

只发布主模型权重不足以复现 DSA. 至少还要保存 indexer投影与聚合权重、候选预算、位置编码处理、量化 scale规则、top-k tie策略、各阶段训练 token数以及稠密到稀疏的切换点. kernel若对 padding或 causal边界采用不同约定, 即使权重一致也会产生不同候选.

评测记录要绑定软件与硬件. 同一算法在 H200上的融合 kernel收益不能直接外推到另一代 GPU; 同一个 checkpoint换成未融合实现, selector可能成为绝对瓶颈. 质量结果相对稳定, 延迟结果依赖实现. 二者都要报告, 但证据链不能混用.

### 13. 一组可以手算的反例

#### 13.1. 高 recall 仍可能丢掉答案

教师 top-8 中七个位置概率各为 $0.01$, 答案位置概率为 $0.90$, 其余质量为 $0.03$. 学生选中七个低概率位置, 只漏答案, 则 $R_8=87.5\%$, 看起来不差; 概率质量覆盖却只有 $0.07$ 左右. 这说明集合 recall必须与加权质量一起报告.

反过来, 若第一名概率 $0.9$, 其余前八名各约 $0.01$, 学生选中第一名但只命中四个教师位置, recall为 50%, 概率质量仍超过 0.93. 对输出近似而言后者通常更好, 对需要多证据覆盖的任务却未必. 指标选择必须对应任务结构.

#### 13.2. 平均覆盖会掩盖单头崩溃

四个主 heads中三个的教师质量覆盖为 0.99, 一个为 0.03, 平均仍是 0.75. 若前三个头负责局部语法, 最后一个负责远程实体检索, 模型会在普通语言建模指标上看似正常, 长程问答却突然失败. per-head 分位数比均值更能发现这种情况.

共享候选的训练还可能把稀有头当噪声. 如果负责远程检索的 head只在 1% 样本上活跃, batch平均损失会鼓励模型优先服务常见头. 可对触发远程行为的 query加权, 或构造长程探针扩大其监督占比. 这不是简单提高总数据量能自动解决的.

#### 13.3. 块召回高也可能漏掉关键块

HISA选中 99 个教师相关块中的 98 个, 块 recall为 98.99%. 若漏掉的块恰好包含唯一答案, 任务仍失败. 平均 IoU适合衡量总体逼近, 不能替代 answer-containing block recall. 在 needle、多文档和代码依赖测试中, 应单独标注关键证据所在块是否进入粗筛.

同理, MISA恢复 63 个普通 indexer heads而漏掉唯一专门 head, head重合高却可能改变 top-k. 所有层级近似都存在这种「平均很高, 关键路径断裂」风险. 验收应沿 router heads、候选块、候选 token、主 attention输出逐级定位.

#### 13.4. 更高 k 不一定单调改善任务

在固定权重下, 扩大 k通常提高教师质量覆盖, 但稀疏训练后的模型已经适应某一预算. 推理时突然加入更多低分 token会改变 softmax分母, 也可能引入干扰. 因此质量未必随 k严格单调. 预算消融应在训练预算附近密集测试, 不应假设把 k翻倍必然接近稠密模型.

若希望运行时动态 k, 训练中就应让模型见过多种预算, 或让 logits校准对集合大小更稳健. 否则动态策略解决了 selector不确定性, 却引入主 attention分布漂移.

## 14. 从论文结论到可验证命题

### 14.1. 质量命题

第一条命题是: 在目标长度与数据域上, indexer候选覆盖稠密教师的大部分有效概率质量. 它需要 per-layer、per-head、per-task与长度分桶结果. 第二条是: 模型经过稀疏训练后, 即便存在稳定漏失也能恢复任务质量. 它需要端到端任务与稠密对照, 不能由 recall单独推出.

第三条是长度外推. 训练到 128K 不意味着更长位置仍保持相同排序, 位置编码、干扰 token数量和证据密度都改变. 应把 $k_\tau$、margin、候选距离分布随长度画出, 再判断固定预算何时失效.

### 14.2. 效率命题

效率至少拆为 indexer扫描、top-k、Sparse MLA gather与主计算四项. HISA主要改第一项的 token搜索域, MISA主要改第一项的 head数量, LISA改变主分支组合. 若只给端到端倍数, 无法知道收益来自算法、kernel还是基线实现差异.

吞吐与延迟也要分开. 大 batch下 indexer矩阵运算容易吃满算力, 单请求 Decode则可能受带宽和launch限制. 一个方案提高吞吐不代表降低交互式每 token延迟. 报告应固定 batch、输入输出长度、精度、并行策略和功耗口径.

### 14.3. 最小消融矩阵

一组有解释力的消融至少包含: 稠密 MLA; 原始 DSA; 只改低精度 indexer; HISA不同块长与候选块数; MISA不同 active-head数; HISA与 MISA组合; 若采用 LISA, 再分别关闭线性分支、sparse分支和 gate. 每一项同时记录质量、概率质量覆盖、indexer时间、主 attention时间与峰值显存.

组合实验尤其重要. HISA和 MISA都近似 selector, 各自损失很小不表示叠加后仍小. 若层级块召回为 0.99, head路由条件召回为 0.92, 在独立粗假设下联合上限约 0.91; 实际误差还可能相关. 先测误差交集, 再决定是否把两种压缩同时推到极限.

### 14.4. 何时应当停止继续稀疏

当 indexer与主 Sparse MLA时间已经低于 MLP、通信或采样, 继续压缩 selector不会显著改善端到端延迟. 当概率质量覆盖的尾部分布开始快速恶化, 再减预算会把少数关键请求推入不可恢复区域. 极限配置应由系统瓶颈与质量尾部共同决定.

还有一种停止条件来自可维护性. 多级 router、动态预算、量化 scale和跨卡合并每增加一层, 都扩大测试状态空间. 若新增层只节省几个百分点, 却让 tie规则、缓存一致性和故障回退变得复杂, 其真实价值可能为负. DSA路线始终围绕同一件事展开: 让最昂贵的精确读取集中到真正重要的位置.

### 15. 稀疏连接图中的信息怎样流动

把一层 causal attention 看成有向图: query位置 $t$ 向它读取的历史位置连边. 稠密模型在第 $l$ 层拥有约 $n(n+1)/2$ 条候选边, DSA把其中大多数边删除, 每个位置只保留窗口与动态选出的少量远程边. 单层输出是否接近稠密 attention 只是第一步, 更深的问题是多层图能否让信息抵达需要它的位置.

假设位置 $a$ 的事实要用于位置 $t$. 即使第 $t$ 层没有直接选择 $a$, 中间位置 $b$ 可能先读取 $a$, 把事实写入 residual stream, 再被 $t$ 读取. 于是有效感受野由跨层路径决定, 并不等于单层 top-k. 稀疏训练可以主动形成这种接力: 某些层负责把局部信息汇总到锚点, 后续层只需检索锚点. 这解释了为什么 attention矩阵逐点逼近不是唯一目标, 也解释了为什么主模型必须在稀疏图上继续训练.

然而接力路径会增加脆弱性. 稠密模型中 $t$ 可直接访问 $a$, 稀疏模型若依赖 $a\rightarrow b\rightarrow c\rightarrow t$, 任一层漏选都会截断信息. 路径长度越长, selector误差越可能累积. 可用干预实验追踪: 屏蔽某个候选位置, 观察答案 logit变化; 或把关键事实的 hidden state替换为对照, 找到首次承载信息的层. 这比只看 attention热图更接近因果作用.

局部窗口在这张图中承担稳定骨架. 相邻 token无须经过 indexer竞争便能持续传递, 动态远程边只负责跨越长距离. 若没有窗口, 连基础短语和相邻代码行也要占用 top-k, selector负担会显著增加. 若窗口过大, 固定局部读取又挤占计算预算. 合理窗口取决于局部依赖尺度和 kernel形状, 应与动态 k共同消融.

Sink token、段落开头与特殊分隔符常被大量 query选择. 它们可能确实是全局汇总节点, 也可能只是位置偏置形成的热点. 若少数热点占满候选, 图的入度分布会高度集中. 可以统计 token被选择次数的 Gini系数、距离分布和跨层持续性. 对热点做屏蔽后质量明显下降, 说明它承担信息中继; 几乎不变则更像浪费预算.

多文档输入还需要区分文档内边与跨文档边. 模型可能把大量候选花在当前文档的词法相似位置, 而忽略另一个文档中的反例. 在排序中加入文档结构不是必需方案, 但评测至少要画出候选落在哪些文档, 并测关键证据文档覆盖. 只有这样才能判断失败来自 indexer不知道找什么, 还是固定 k被某个区域的重复内容占满.

跨层候选复用也应从图角度理解. 完全共享会让多层具有相同边集, 节省扫描却降低路径多样性; 各层完全独立能探索更多边, 成本最高. 一种折中是保留共享骨架, 每层再有小规模独立候选. 假设共享 $k_s$, 每层新增 $k_l$, 总读取为 $k_s+k_l$, 多层联合覆盖却可能接近 $k_s+Lk_l$. 这种方案是否有效, 取决于不同层新增边是否真的互补.

最终验收看有限边数能否维持任务所需的计算图, 热图重现程度只是其中一项观察. 单层概率质量、跨层可达性、关键证据因果影响分别描述局部近似、结构能力与实际作用, 三者合起来才完整.

## 16. 数据决定索引器学会寻找什么

Indexer容量小并不意味着数据要求低. 它要从 query表示预测哪些历史 token对多个主 attention heads重要, 学到的是训练分布中的检索先验. 如果长序列主要由同一文档拼接, selector容易依赖词汇重复和位置邻近; 部署到跨文档问答、代码仓库或多轮对话时, 重要证据形态变化, 召回会首先退化.

训练样本应覆盖至少四类依赖. 第一类是局部连续依赖, 用来确认动态索引不会破坏基本语言建模. 第二类是远距离精确匹配, 如变量定义、名字、数字和原句引用. 第三类是语义关联, query与证据没有共享关键词, 必须依靠上下文表示. 第四类是多跳与多证据依赖, 需要同时保留多个位置. 四类混在一个平均 loss里不足以诊断, 应分别构造探针.

上下文拼接方式会改变负样本难度. 随机拼接的不同文档边界清晰, query通常只与其中一个文档相关; 同主题文档拼接包含大量近似干扰, 更考验细粒度排序; 单篇超长代码或论文则有跨段结构与重复符号. 若训练只使用随机拼接, recall可能很高, 因为无关文档容易排除, 但真实检索中的 hard negatives没有被学习.

长度分布同样影响 selector. 在大量短样本中, $t<k$ 时选择近乎稠密, indexer即使排序很差也不会造成信息损失. 训练 token数很大不等于有效稀疏监督充足. 应统计真正满足 $t\gg k$ 的 query比例, 并按长度加权或采样, 让模型在会发生竞争的上下文上学习 cutoff.

位置偏置可能提供便宜捷径. 若答案总出现在文档末尾, indexer只学距离就能获得不错召回. 将相同证据随机移动、交换文档顺序、插入相似干扰段, 可以检验它是否理解 query-key关系. 对代码可重命名变量、移动函数定义; 对数学文本可改变符号而保留关系. 这些反事实样本比继续堆同分布 token更能揭露索引器的真实能力.

稀疏训练还会改变数据中的梯度分配. 未进入候选的位置不参与主 attention, 它们的 value路径拿不到当前 query的梯度; 但 indexer仍可能从教师或蒸馏损失获得信号. 若蒸馏教师只偶尔计算, 长尾证据位置得到纠偏的机会更少. 对稀有任务增加教师频率、扩大候选或设置探索集合, 本质上是在重新分配监督覆盖.

领域继续训练要警惕灾难性偏置. 例如只用代码校准 indexer, 某些 heads可能专门化为符号与缩进匹配, 自然语言语义召回下降. 冻结一部分通用 heads、混入旧域回放或约束新旧候选分布, 都能缓解漂移. 是否需要这些手段, 应由跨域固定探针决定, 不必先验地把 indexer全部冻结.

数据质量还有一个容易忽略的维度: 教师本身是否值得模仿. 稠密 attention包含无效热点、位置偏置和重复读取, 完全蒸馏会把这些行为也复制给 indexer. 任务监督下的稀疏继续训练有机会超越教师候选, 但也更难归因. 稳妥的分析应同时比较「复现教师」与「完成任务」, 接受二者不总是同方向.

### 17. 从症状反推故障位置

如果长上下文任务下降, 第一反应不应是直接增大 k. 先固定主模型与候选, 用朴素实现重算 Sparse MLA. 若朴素实现正常、融合 kernel异常, 问题在算子或布局; 若两者一致, 再把候选替换为稠密教师 top-k. 教师候选恢复质量, 说明 indexer排序有问题; 教师候选仍差, 说明预算不足或模型尚未适应稀疏图.

若 indexer召回随长度平滑下降, 常见原因是固定容量或干扰项增长. 若只在某个长度突然坍塌, 更像位置编码外推、kernel边界、序列长度字段或量化 scale分组发生切换. 若 Prefill正常而 Decode异常, 应优先检查单 query路径、KV追加顺序、causal上界与缓存精度, 而不是重新训练模型.

质量只在 batch增大后下降, 通常不是算法现象. 可能存在 padding位置未正确屏蔽、不同请求的 indexer cache地址混淆、top-k workspace复用或变长序列 offset错误. 同一请求单独运行和混批运行应返回相同候选与输出; 这是上线前必须通过的确定性测试.

若候选 recall很高、任务仍差, 要看被漏位置的教师质量和 value方向. 少量高价值漏失可被平均 recall掩盖; 候选内重新归一化也会改变输出. 进一步比较每层 hidden state余弦与范数, 找出误差首次放大的层. 如果早层很小、深层突然扩大, 可能是残差累积或某个关键路由层; 如果第一层就大, selector或数值更可疑.

若延迟没有达到理论收益, profile应按顺序拆开 indexer GEMM、ReLU聚合、top-k、索引整理、KV gather、稀疏 softmax和值聚合. Indexer快而 top-k慢, 增加 HISA/MISA未必解决; gather慢则候选空间分布比点积数量更重要; kernel很快而端到端不变, 瓶颈已转移到 MLP、通信或调度.

HISA故障可通过强制使用教师相关块定位. 若教师块加原始 token精排能恢复, 粗筛表示有问题; 若仍不能恢复, 块内索引展开、causal mask或 token预算有误. MISA可强制启用教师 active heads; LISA可分别关闭线性与 sparse分支. 每个近似层都应保留这种可替换接口, 否则所有误差混在最终输出里很难追踪.

数值问题常表现为偶发而非稳定下降. FP8 scale溢出、NaN、并列排序和未初始化 padding会制造少数灾难请求. 平均困惑度几乎看不见这些尾部. 应记录每条样本的最小 margin、非有限分数数、重复候选数和输出最大误差, 对最坏样本保存可复现的无隐私张量摘要.

最后才考虑重新训练. 若离线教师 top-k本身在目标任务上需要更大预算, 调 indexer loss无法解决容量问题; 若教师候选足够而学生覆盖差, 才需要数据或目标改进; 若学生覆盖高但稀疏模型不适应, 应延长第二阶段或调整主模型学习率. 把症状对应到这三种情形, 能避免用昂贵训练掩盖实现错误.

## 18. DSA、HISA、MISA 与 LISA 应怎样选择

原始 DSA适合把主 attention 从全量读取改为细粒度 top-k, 它保留了 token级选择能力, 结构也最直接. 当目标长度上的 indexer扫描仍只占较小比例, 优先把融合 kernel、量化缓存与 Sparse MLA做好, 通常比再增加路由层更可靠. 此时 HISA或 MISA的论文倍数未必能转化为端到端收益.

当上下文继续增长、Decode 的低维全扫成为瓶颈, HISA适合利用 token之间的局部组织. 文档、代码和对话天然由连续片段构成, 块级粗筛可以一次排除大片无关区域. 它最怕块内孤立尖峰与跨边界证据, 因而需要保守块表示和足够精排域. 如果候选经常散布在全序列且没有局部聚集, HISA能减少的范围有限.

MISA利用的是 indexer heads之间的条件冗余. 它不要求重要 token在位置上成块, 更适合候选分散但每个 query只需少数匹配模式的场景. 若 heads高度专门化、不同任务依赖不同稀有专家, active-head预算不能压得过低. MISA还保留对全历史 token的扫描, 只是降低扫描宽度; 在纯带宽受限且 key读取占主导时, 算术减少未必等比例降时延.

HISA与 MISA可以组合: 先减少候选块, 再用少数 heads精排, 或先由 head router确定匹配模式, 再据此粗筛块. 两种顺序不等价. 先选块更早缩小 key读取, 但粗筛可能缺少完整 head信息; 先选 heads保留语义路由, 仍需让被选 heads扫描块摘要. 应依据硬件上读取与乘加的相对成本选择, 并测联合误差而非相乘两个单独加速比.

LISA把问题推进到记忆分工这一层: 线性状态承担普遍背景, sparse分支承担精确信息. 当任务同时包含长程汇总和少量 exact retrieval, 这种分工有吸引力. 若任务几乎都要求逐 token精确比较, 线性分支帮助有限; 若任务只需平滑统计, 保留完整 sparse地址空间又可能过重.

选择路线时可以按三个问题推进. 第一, 主 attention全量读取是否已经是瓶颈? 若是, 先引入 DSA式细粒度候选. 第二, 候选搜索是否取代主 attention成为瓶颈? 若是, 看冗余主要来自连续 token范围还是 indexer heads, 分别考虑 HISA与 MISA. 第三, 模型是否需要同时维护压缩全局记忆与精确细节? 若是, 再评估 LISA式并联.

无论选择哪条路线, 都应保留回退档位. 低 margin时扩大块、heads或 token预算; 异常数值时切到稳定精度; 特殊长程任务可使用更保守配置. 回退会牺牲最坏延迟, 却能把平均高效与尾部可靠结合. 如果系统完全没有不确定性信号和回退路径, 极限稀疏配置很容易把少数请求变成静默错误.

真正可比较的边界是同一模型质量、同一硬件、同一输入输出长度下的端到端曲线. 单独拿某篇论文的 kernel倍数、另一篇的 recall和第三篇的任务分数拼在一起, 得不出路线优劣. DSA提供细粒度动态检索的基线, HISA压缩位置搜索域, MISA压缩匹配专家数, LISA增加压缩记忆通道. 把各自改变的变量分清楚, 才能知道下一步应该优化哪一层.

## 19. 读懂实验表格时最容易混淆的口径

DSA相关实验经常同时出现 attention计算量、indexer计算量、kernel时间和端到端吞吐, 这些数字不能直接横比. FLOPs减少描述算术工作, 对全前缀扫描而言实际瓶颈可能是读 indexer cache; kernel加速只覆盖某个算子, 端到端还包含 MLP、归一化、通信和调度. 一张表若没有列出测量边界, 倍数再大也很难解释.

Prefill实验要看输入长度与有效 token数. 将所有序列 padding到 128K, 和真正每条都有 128K有效内容, 对 causal计算与内存访问不同. 吞吐可以按输入 token/s、请求/s或总 token/s统计, 长短混批时结论会变化. Decode实验则要给出 KV长度、batch与生成步数; 只测单步无法暴露长输出中的累计扫描成本.

质量对比还要确认稠密参照是谁. 若稠密模型是稀疏训练前 checkpoint, 差异同时包含继续训练收益与结构损失; 若用同等 token继续训练的稠密模型, 才更接近控制变量. 用原始 DSA作为 HISA/MISA教师时, 高重合只能说明复现 DSA候选, 不能说明接近稠密 attention, 更不能单独证明下游质量.

IoU、recall和 recovery也常被混用. 对等长集合, IoU为 $I/(2k-I)$, recall为 $I/k$, 同一交集下 IoU数值更低. 例如 recall 0.9对应 IoU约 $0.9/1.1=0.818$. 论文报告「超过 90%」时必须看指标定义, 不能把 90% IoU、90% token recall与90%概率质量当成同一件事.

速度比较应确认候选预算是否一致. HISA若先保留较大 token域再精排到相同 k, 最终 Sparse MLA成本相同, 差别主要在 indexer; 若某方法同时减小最终 k, 加速混入了更激进的质量取舍. MISA的 active heads数也一样: 8/64描述 indexer乘加缩减, 不等于总 attention缩减到八分之一.

显存数字至少包含模型参数、主 KV、indexer KV、临时 top-k workspace与通信 buffer. 有些实现报告长期 cache, 有些报告峰值分配; allocator保留与实际使用也会不同. LISA还多出线性状态, HISA多出块摘要, MISA多出 router状态. 若只计算理论张量元素, 应明确它不是运行峰值.

训练成本不能只报第二阶段 token数. Indexer预热需要稠密教师计算, 稀疏阶段可能周期性重算教师或同时保留稠密分支. 即使推理显著便宜, 迁移已有 checkpoint所需的训练投入仍然很高. 对新模型从头采用稀疏结构, 又面临教师从哪里来和早期表示不稳定的问题, 两种场景应分开讨论.

统计显著性在长上下文任务中尤其重要. 样本量往往比普通语言建模小, 不同随机插入位置会造成很大波动. Needle测试容易饱和, 也不能代表多证据推理. 应报告多次位置与干扰内容采样, 对每类长度给置信区间, 再配合自然任务. 单个漂亮案例适合解释行为, 不足以证明平均能力.

最后还要区分公开实现与论文设定. 官方 checkpoint、参考 Python实现和高度优化 kernel可能支持不同精度、不同 batch形状与不同并行方式. 复现失败时先确认计算图是否相同, 复现成功后再比较速度. 若为了适配硬件改变了候选聚合、量化或共享策略, 得到的是合理新实现, 但应把变化写清楚, 不能仍把差异全部归到原算法名下.

读表的核心顺序是: 先找比较对象, 再找固定变量, 然后确认指标定义与测量边界, 最后才看倍数. 对 DSA这类算法—算子紧密耦合的技术, 质量与效率都没有脱离上下文的单一数字. 只有把 selector近似、主 attention预算、硬件执行和训练投入放进同一张账, 才能判断它到底省了什么, 又把成本转移到了哪里.

还有一个容易遗漏的对照是「相同延迟下的最佳质量」. 固定 k比较算法便于分析, 但 HISA、MISA与原始 DSA的固定开销不同; 固定质量比较速度也可能落在各自不擅长的配置点. 更完整的做法是扫过块数、active heads与 token预算, 画出质量—延迟 Pareto前沿. 被另一配置同时在质量和延迟上超过的点没有部署价值. 前沿还应分别绘制 Prefill与 Decode, 因为同一配置可能在矩阵化 Prefill占优, 在带宽受限 Decode落后. 这张前沿会直接给出不同负载下的合适档位, 也能呈现路线之间真正存在的交换关系.

同一条前沿还应标出结果方差和最坏样本. 平均质量接近时, 尾部召回稳定、不同长度波动较小的配置更适合上线. 若某个点只在单次运行中占优, 换一批证据位置便退到前沿内部, 它反映的多半是样本偶然性. 把置信区间与资源峰值一起画出, 才能避免为了很小的平均收益承担明显更高的故障风险.

## 参考资料

- [DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models](https://arxiv.org/abs/2512.02556)
- [DeepSeek-V3.2 官方实现](https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp/tree/main/inference)
- [NVIDIA cuDNN DeepSeek Sparse Attention](https://docs.nvidia.com/deeplearning/cudnn/latest/fe-oss-apis/dsa.html)
- [HISA: Efficient Hierarchical Indexing for Fine-Grained Sparse Attention](https://arxiv.org/abs/2603.28458)
- [MISA: Mixture of Indexer Sparse Attention for Long-Context LLM Inference](https://arxiv.org/abs/2605.07363)
- [MuLabPKU TransArch 官方仓库](https://github.com/MuLabPKU/TransArch)
- [LISA: Linear-Indexed Sparse Attention for Efficient Long-Context Reasoning](https://arxiv.org/abs/2607.19358)
