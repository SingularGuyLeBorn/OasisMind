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

MISA 还给出层次变体: routed pass 先保留放大的候选集, 再用原 DSA 全 indexer 对候选精排. 这相当于「稀疏 heads 粗召回 + 完整 heads 局部精排」. 它与 HISA 的共同点是两阶段搜索, 区别在第一阶段剪掉的是 head 计算还是 token 区域. 论文官方名称为 hierarchical variant; 若实现或图中用版本号简称, 应以对应版本文档为准, 不能把非正式称呼当作独立架构.

### 4.3. LISA: 线性状态与稀疏检索并联

LISA 的目标不只是让 DSA indexer 更快. 它在原模型中并联线性 attention 与 indexer 引导的 sparse self-attention, 再由 gate 融合. 线性分支以 $O(n)$ 状态提供全局长程记忆, sparse 分支从全上下文选 top-$M$ token 做精确 softmax attention. 若 selector 漏掉广泛分布的小权重信息, 线性分支仍可能保留聚合信号.

训练分两阶段. 第一阶段引入线性 attention, 配合滑动窗口 sparse attention, 通过冻结教师的知识蒸馏逼近 full self-attention. 第二阶段用 indexer 替换固定窗口, 以 per-head KL 对齐教师 attention pattern. 与 DSA 先预热共享 selector 再全模稀疏适配相比, LISA 明确保留两条并行信息通道, 并把对齐细化到 head.

论文在 DeepSeek distilled Qwen 系列上报告 16K 上下文约 50% 推理加速, 推理类评测平均提升 5.6%. 这里的质量变化包含架构迁移与训练, 不能归因于 indexer 单独更准. LISA 的线性状态、sparse KV、indexer K 和 gate 都有运行状态, cache 账本也比纯 DSA 更复杂.

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

## 参考资料

- [DeepSeek-V3.2: Pushing the Frontier of Open Large Language Models](https://arxiv.org/abs/2512.02556)
- [DeepSeek-V3.2 官方实现](https://huggingface.co/deepseek-ai/DeepSeek-V3.2-Exp/tree/main/inference)
- [NVIDIA cuDNN DeepSeek Sparse Attention](https://docs.nvidia.com/deeplearning/cudnn/latest/fe-oss-apis/dsa.html)
- [HISA: Efficient Hierarchical Indexing for Fine-Grained Sparse Attention](https://arxiv.org/abs/2603.28458)
- [MISA: Mixture of Indexer Sparse Attention for Long-Context LLM Inference](https://arxiv.org/abs/2605.07363)
- [MuLabPKU TransArch 官方仓库](https://github.com/MuLabPKU/TransArch)
- [LISA: Linear-Indexed Sparse Attention for Efficient Long-Context Reasoning](https://arxiv.org/abs/2607.19358)
