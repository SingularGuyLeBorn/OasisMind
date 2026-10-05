---
title: "GKD: 把轨迹来源与散度拆开"
published: true
tags: ["GKD", "OPD", "知识蒸馏", "JSD"]
excerpt: "逐步推导 GKD 的混合轨迹目标、散度选择、训练状态与实现边界."
---
# GKD: 把轨迹来源与散度拆开

Generalized Knowledge Distillation (GKD) 处理的核心困难是自回归蒸馏中的训练—生成错位. 传统 token 级 KD 在固定参考序列的前缀上比较教师与学生; 部署时, 学生要在自己生成的前缀上继续. GKD 的改动很小而且精确: 让一部分或全部输出序列由学生生成, 再在这些序列的每个前缀上查询教师. 论文发表于 ICLR 2024, 标题仍使用 On-Policy Distillation, 方法名用 GKD 表示更一般的轨迹与散度组合.

GKD 有两个互不依赖的旋钮. 第一个旋钮控制训练前缀来自固定数据还是学生 rollout; 第二个旋钮控制师生条件分布之间采用哪一种散度. 把两个旋钮拆开后, 监督 KD、纯 on-policy 蒸馏和混合蒸馏都成为同一目标的特例. 这也是 GKD 比「学生生成, 教师打分」这句概括更有用的地方.

## 1. 从固定序列到学生序列

### 1.1. 固定数据目标

设输入为 $x$, 输出序列为 $y=(y_1,\ldots,y_T)$, 第 $t$ 步前缀为 $s_t=(x,y_{<t})$. 教师条件分布记为 $p_T(\cdot\mid s_t)$, 学生条件分布记为 $p_S^\theta(\cdot\mid s_t)$. 对一条给定序列, GKD 先定义平均 token 散度:

$$
\mathcal D(y\mid x;\theta)=\frac{1}{T}\sum_{t=1}^{T}
D\!\left(p_T(\cdot\mid s_t),p_S^\theta(\cdot\mid s_t)\right). \tag{1}
$$

$D$ 是可选择的分布差异. 固定数据蒸馏从数据集 $(x,y)\sim\mathcal B$ 取序列:

$$
\mathcal L_{\mathrm{off}}(\theta)=
\mathbb E_{(x,y)\sim\mathcal B}[\mathcal D(y\mid x;\theta)]. \tag{2}
$$

式 (2) 中, 教师和学生都读取数据集给出的同一前缀. 教师前向产生目标分布, 学生前向产生待优化分布, 两者在该前缀上计算 $D$. 优化器只更新学生参数, 数据集、教师参数与前缀保持不变. 这种训练没有覆盖学生自由生成时可能进入的新状态.

### 1.2. on-policy 目标

GKD 把输出改成学生样本 $y\sim p_S^{\theta_k}(\cdot\mid x)$. $\theta_k$ 是收集第 $k$ 批 rollout 时冻结的学生快照:

$$
\mathcal L_{\mathrm{on}}(\theta;\theta_k)=
\mathbb E_{x\sim\mathcal X}
\mathbb E_{y\sim p_S^{\theta_k}(\cdot\mid x)}
[\mathcal D(y\mid x;\theta)]. \tag{3}
$$

论文实现不对采样过程反向传播. 学生先生成一条完整序列, 随后该序列被当作固定训练样本; 梯度只穿过式 (1) 内重新计算的学生分布. 因此式 (3) 的训练形态更接近「动态刷新数据的监督学习」, 而不是对序列采样器使用 REINFORCE. 这个 stop-gradient 约定降低了方差, 也丢掉了当前 token 对未来前缀分布的影响.

学生 rollout 必须保持足够多样性, 否则训练只覆盖少量贪心轨迹. GKD 实验用温度采样产生学生序列. 采样温度属于状态分布定义的一部分: 即使学生权重相同, 贪心解码与温度采样访问的前缀也不同. 复现时只报告「on-policy」而不报告解码参数, 训练分布仍然没有定义完整.

### 1.3. 混合目标

GKD 用 $\lambda\in[0,1]$ 混合固定序列与学生序列:

$$
\mathcal L_{\mathrm{GKD}}(\theta)=
(1-\lambda)\mathcal L_{\mathrm{off}}(\theta)
+\lambda\mathcal L_{\mathrm{on}}(\theta;\theta_k). \tag{4}
$$

$\lambda=0$ 是纯固定数据 KD, $\lambda=1$ 是纯学生序列蒸馏. 中间值同时保留规整参考前缀与学生错误前缀. 论文在 XSum、WMT14 En-De、GSM8K 和 FLAN 指令蒸馏上比较不同设置; 总体结果显示, 加入学生生成数据优于只用固定数据, 但最佳散度随任务与解码方式变化.

混合目标还有冷启动含义. 弱学生初期产生大量不可用序列时, 较小的 $\lambda$ 让教师监督先落在可解释前缀上. 学生改善后再提高 $\lambda$, 能逐步扩大到部署状态. 原论文主要把 $\lambda$ 当作固定超参数研究;动态课程属于自然扩展, 但不能冒充论文已经验证的结论.

## 2. 散度不是 on-policy 的定义

### 2.1. forward KL 与 reverse KL

在某个前缀 $s_t$ 上, 简写教师为 $p(v)$, 学生为 $q(v)$. forward KL 为

$$
D_{\mathrm{KL}}(p\|q)=\sum_{v\in V}p(v)\log\frac{p(v)}{q(v)}. \tag{5}
$$

reverse KL 为

$$
D_{\mathrm{KL}}(q\|p)=\sum_{v\in V}q(v)\log\frac{q(v)}{p(v)}. \tag{6}
$$

式 (5) 由教师概率加权, 要求学生覆盖教师认为可能的 token. 式 (6) 由学生概率加权, 主要压低学生过度分配而教师不支持的 token. 当学生容量远小于教师、教师分布包含许多模式时, reverse KL 往往更集中; forward KL 往往保留更多覆盖. 这些是给定状态上的局部性质, 不能直接推出最终文本必然更好或更多样.

**forward KL 和 reverse KL 都能在学生 rollout 上计算, 所以两者都能构成 OPD.** 「reverse KL 等于 on-policy」是把外层采样分布与内层条件散度混为一谈. GKD 的实验价值正在于交叉比较 $\lambda$ 与散度, 而不是预设某一方向属于在线、另一方向属于离线.

### 2.2. 广义 JSD

GKD 还使用带参数 $\beta$ 的 Jensen-Shannon 散度. 先定义混合分布

$$
m_\beta(v)=\beta p(v)+(1-\beta)q(v), \tag{7}
$$

再计算

$$
D_{\mathrm{JSD}(\beta)}(p\|q)=
\beta D_{\mathrm{KL}}(p\|m_\beta)
+(1-\beta)D_{\mathrm{KL}}(q\|m_\beta). \tag{8}
$$

$m_\beta$ 给两个方向提供共同参照, 即使师生支持差异很大, JSD 仍是有界量. $\beta$ 改变两个方向的相对作用, 因而能在覆盖与集中之间连续调整. 论文在翻译上发现 JSD 设置优于两个端点; 在不同任务和学生尺寸上, 最佳选择并不统一.

实现式 (8) 时, 教师分布应 stop-gradient. 混合分布中包含学生 $q$, 梯度会通过 $m_\beta$ 返回学生, 这与先把 $m_\beta$ 整体 detach 的实现不同. 代码审查需要逐项核对原式, 不能只凭函数名 `jsd_loss` 判断.

### 2.3. 一个可复算的例子

取三 token 词表, 教师 $p=(0.6,0.3,0.1)$, 学生 $q=(0.3,0.4,0.3)$. forward KL 为

$$
0.6\log2+0.3\log0.75+0.1\log\frac13
\approx0.237. \tag{9}
$$

reverse KL 为

$$
0.3\log0.5+0.4\log\frac43+0.3\log3
\approx0.296. \tag{10}
$$

取 $\beta=0.5$, 混合分布为 $m=(0.45,0.35,0.20)$. 代入式 (8), 两项分别比较 $p$ 与 $m$、$q$ 与 $m$. 这里学生对第三个 token 的概率是教师三倍, reverse KL 对这一项的权重为 $0.3$, forward KL 的权重只有 $0.1$. 例子展示的是权重来源, 不是对任意大词表生成行为的保证.

## 3. 一次训练更新到底发生什么

### 3.1. rollout 与教师评分

输入 batch 先发给 rollout worker. worker 持有学生快照 $\theta_k$, 按指定温度生成 response token, 同时保存 token id、attention mask、结束位置和可选的采样 log-prob. 对 GKD 的 stop-gradient 目标而言, 旧 log-prob 不是计算 KL 的必需量, 但可以用来监控策略滞后或做重要性修正.

教师随后读取同一组 prompt 与学生 response. 因为完整 response 已知, 教师可以并行 Prefill 整段序列, 为每个 response 位置输出下一 token logits. 教师计算的是 $p_T(\cdot\mid x,y_{<t})$; 教师没有重新生成自己的回答. 如果改成教师先生成答案再训练学生, 状态来源就回到了 off-policy 序列蒸馏.

### 3.2. learner 与参数同步

learner 用当前待更新参数 $\theta$ 对同一序列做 teacher-forcing 前向, 得到学生 logits. 随后按式 (5)、(6) 或 (8) 计算每个有效 response token 的损失, 用 mask 排除 prompt padding 与终止后的部分, 再按 token 或序列归一化. 反向传播只更新学生; 冻结教师既不保存梯度, 也不参与 optimizer state.

优化器步完成后, learner 参数变为 $\theta_{k+1}$. 同步系统要把新权重传给 rollout worker. 若 rollout worker 继续用旧权重收集多批, 训练数据来自滞后策略; 若同一 batch 做多个 optimizer epoch, learner 也逐渐偏离采样策略. 这不会让训练立即无效, 但「严格 on-policy」已经变成 near-policy, 应记录最大版本差与每批复用次数.

### 3.3. 完整词表、top-$k$ 与分块

原始 GKD 的精确散度需要完整词表. 张量形状为 $[B,T,|V|]$, bf16 内存为 $2BT|V|$ 字节. 当 $B=16,T=8192,|V|=128000$ 时, 一份 logits 约 31.25GB. 师生 logits 同时物化、再加 softmax 中间量与学生反传, 很快超过单卡容量.

一种办法是按序列块或词表块计算归一化与 KL, 用在线 log-sum-exp 避免完整物化. 另一种办法是在教师侧只返回 top-$k$ token 与概率, 加一个尾部桶保存剩余质量. 若只丢掉尾部而不保留总质量, 得到的不是原分布上的 KL. sampled-token 接口最省通信, 但它改变了估计器, 不能仍声称精确实现式 (5) 或式 (6).

## 4. 实验结论怎么读

### 4.1. 模型与任务口径

论文以监督微调后的 T5-XL 约 3B 模型作为教师, 学生为 T5-small、T5-base 与 T5-large, 覆盖摘要、翻译、算术推理和任务无关指令微调. 学生在进入 GKD 前已有可用生成能力. 这个起点很重要: 论文并没有证明随机初始化或完全不会答题的学生能靠纯 on-policy 蒸馏自行进入有效状态区.

在 XSum、WMT 与 GSM8K 上, 学生生成数据比例提高通常带来收益. XSum 的低数据实验显示, on-policy GKD 可以在少量输入下超过使用完整人工摘要的监督 KD. 该结果支持「前缀匹配提高数据利用率」, 但不能脱离教师、学生和任务设定外推成统一算力结论.

### 4.2. 散度与解码的耦合

论文报告, 温度采样评估时, 更偏 mode-seeking 的散度往往生成质量更好, 同时输出多样性下降; 贪心解码下, 散度差异缩小. 翻译任务中 JSD 表现突出, 且学生变大后不同散度之间的差距减弱. 这说明散度选择与学生容量、任务输出多峰程度和评测解码共同作用.

因此复现实验不能只抄一个散度超参数. 训练采样温度决定访问状态, 评测解码决定从最终分布取哪一部分, 二者会改变同一局部目标的宏观表现. 应同时报告采样温度、评测温度、beam 设置、长度限制和多样性指标.

### 4.3. 与 RL 组合

GKD 的学生 rollout 可以同时交给奖励模型或任务评分器. 论文把奖励最大化与蒸馏项线性组合, 让教师分布在 RL 更新中承担行为约束. 组合目标并不使 RL 与蒸馏成为同一个东西: 奖励项评价序列结果, 蒸馏项比较师生条件分布; 两项共享轨迹, 梯度接口仍不同.

组合训练最需要监控梯度尺度. 若奖励项按序列求和、蒸馏项按 token 平均, 系数的数值不能直接解释为相同比例. 长度变化还会改变两项相对权重. 实现应先固定归一化口径, 再调混合系数, 并分别记录奖励、蒸馏损失和梯度范数.

## 5. 失败模式与适用边界

### 5.1. 学生状态没有可学习信号

学生过弱时, rollout 可能在早期就偏离任务. 教师在错误前缀上的局部条件分布未必能指出回到正确解的路径. 如果 batch 大部分 token 位于重复、乱码或无效格式区, OPD 只会高成本学习表面修复. 可行的处理是先用 SFT 或固定教师序列冷启动, 混入 off-policy 前缀, 或按轨迹质量筛选; 每种处理都会改变状态分布, 需要如实命名.

教师也可能缺少新增信息. 如果师生分布在学生高概率 token 上已经高度重合, KL 仍可下降, 任务能力却没有提升空间. 训练前比较教师与学生在同一批学生 rollout 上的条件优势, 比单独比较两者最终准确率更直接.

### 5.2. 长度与归一化

式 (1) 按长度平均, 使每条序列贡献接近一致. 若改为对全部 token 求总和, 长回答产生更多梯度; 若先按 batch 汇总再除有效 token 数, 长回答按 token 数占更大权重. EOS 也参与分布匹配, 教师与学生对结束位置的偏好会改变长度. 回答持续变短或变长时, mask、EOS、长度归一化和采样截断共同决定偏移方向.

教师在截断位置后的分布不存在, learner 却可能把 padding 当作监督;聊天模板中的 assistant 起始 token 也可能错位一位. 这些错误不会必然让 loss 变成 NaN, 反而可能得到平滑下降的假象. 对一个短样本逐位置打印 prompt mask、label、teacher top token 与 student top token, 是最有效的实现检查.

### 5.3. tokenizer 与服务边界

GKD 的逐 token 分布匹配默认师生词表可比较. 不同 tokenizer 下, token id 相同没有共同语义, token 位置也不一一对应. 仅把学生文本重新 tokenize 给教师, 再按位置截齐 logits, 会产生错误监督. 若无法建立字节区间上的概率映射, 应使用共同 tokenizer 的模型对, 或改用序列概率、教师文本与黑盒反馈方法.

教师服务失败也会污染训练状态. 超时后用全零 logits、重复上一批 logits 或静默跳过部分位置, 都会改变有效 batch. 系统应把教师失败显式标记, 丢弃对应样本并记录比例;不能让 fallback 分布进入 optimizer. 教师版本、聊天模板与精度设置也必须固定, 否则同一学生状态的目标会随基础设施变化.

## 6. 最小复现清单

实现 GKD 时, 先用共享 tokenizer 的小模型和短序列验证. 对单个 batch 同时计算手写 KL 与框架 KL, 检查方向; 固定学生样本, 多次前向应得到相同教师目标; 把 $\lambda$ 设为 0 时应退化为固定数据 KD, 设为 1 时数据中 response 必须来自当前学生. 再检查 teacher 参数无梯度、prompt token 不计 loss、EOS 只计一次、序列长度归一化与论文一致.

扩大训练后, 记录 rollout policy 版本、learner 版本、每批复用次数、教师吞吐、学生 Decode 吞吐、logits 通信量和丢弃样本比例. 模型指标之外, 同时看回答长度、重复率、熵、师生 top-$k$ 重合和任务成功率. **GKD 的有效性来自学生状态上的教师分布监督;只要状态来源或分布接口被工程近似改变, 就应把近似单独测出来.**

### 6.1. 梯度方向的数值测试

一个最小测试只需要三项 logits. 固定教师 logits 为 $(2,1,0)$, 学生 logits 为 $(0,1,2)$, 分别计算 forward KL 和 reverse KL. 对学生最高概率的第三项, reverse KL 应给出明显的向下压力;对教师最高概率的第一项, forward KL 应给出明显的向上压力. 把学生 logits 设成可求导张量, 打印 autograd 梯度, 再用有限差分逐项扰动 $10^{-4}$, 两种梯度应在数值误差内一致.

API 参数顺序也会在这个测试中暴露. PyTorch 一类接口常以 log-prob 作为第一个参数、概率作为 target, 函数名不会替调用者标出数学方向. 手算分布、损失值和预期梯度符号应直接保存为单元测试. JSD 还要检查混合分布中的学生项是否保留梯度.

### 6.2. mask 与位置对齐测试

构造 prompt 两个 token、response 三个 token 的样本, 令每个位置的教师最高概率 token 都不同. learner 应只在三个 response 预测位置产生 loss;第一个 response token 使用 prompt 末端的 logits 预测, response 末端位置预测 EOS. 把 padding 扩到不同长度后, 单样本 loss 不应变化. loss 位置或数值不符时, 错误范围可收窄到 shift、prompt 泄漏或 padding 归一化.

聊天模板要进入同一测试. 有些 tokenizer 自动加入 assistant 起始 token, 有些数据管道又手工添加一次;重复 token 会让教师与学生输入看似相同, response mask 却偏移. 应比较原始文本、token id 和 mask 三层, 不要只打印解码后的字符串.

### 6.3. 轨迹新鲜度与批次复用

定义采样版本为 $k$, learner 当前版本为 $j$, 策略滞后可用 $j-k$ 表示, 也可以在已采 token 上计算新旧学生的平均 KL. 版本差只反映更新次数, 参数移动幅度还受学习率与梯度大小影响;两个指标一起看更可靠. 当新旧 KL 超过设定范围时, 应减少每批优化 epoch、加快权重同步或丢弃过旧轨迹.

如果系统使用异步流水线, 教师评分完成时学生可能已经更新. 这不影响教师分布本身, 但 learner 计算的学生分布与生成分布不同. GKD 的 stop-gradient 目标允许一定程度的数据复用, 却不能无限忽略分布漂移. 训练报告应给出版本差分布, 而不是只写「使用在线 rollout」.

### 6.4. 教师信号质量诊断

教师是否有用, 可以在正式训练前用冻结学生样本检查. 对每个位置记录 $\Delta_t=\log p_T(y_t\mid s_t)-\log p_S(y_t\mid s_t)$, 再按正确轨迹、错误轨迹和位置分桶. 若教师只在学生已经正确的 token 上给更高概率, 对错误步骤没有区分力, 蒸馏可能只强化现有行为. 若 $\Delta_t$ 在坏前缀上出现极端负值, sampled-token 估计会产生长尾梯度.

完整词表接口还能计算教师熵、学生熵、top-$k$ 交集和教师概率质量落在学生 top-$k$ 中的比例. 教师更强但 top-token 重合接近 100%, 说明局部目标提供的新信息有限;重合极低则可能表示推理风格或 tokenizer 不兼容. 两端都需要谨慎, 中间没有一个跨任务通用阈值.

### 6.5. 成本拆解

一次 GKD step 的时间由学生 rollout Decode、教师 Prefill、学生训练前向、学生反向和权重同步组成. 学生 Decode 通常受 KV cache 访存与顺序依赖限制;教师 Prefill 可以并行处理完整回答, 但大教师的矩阵计算与词表投影仍可能占主导. 把总 step 时间报成一个数, 无法判断优化应落在生成、教师服务还是 learner.

显存也应分为持久状态与临时状态. 学生训练持有参数、梯度与 optimizer state; rollout 持有推理权重和 KV cache;教师持有冻结权重与 Prefill 激活;full-vocab KL 临时产生师生 logits. 使用同一 GPU 时, sleep/wake 或权重卸载可以复用空间, 代价是切换延迟. 使用独立教师集群时, 显存更清晰, 代价转为网络传输.

### 6.6. 结果解释的边界

GKD 比监督 KD 好, 可以支持学生状态监督在相应设定下有效, 不能单独证明收益来自消除全部 exposure bias. 学生生成同时改变前缀难度、token 频率、回答长度和训练样本多样性. 要分辨原因, 至少需要固定输入、控制生成数量, 并比较教师轨迹、学生轨迹与混合轨迹.

同样, 某个散度在单一指标上领先, 不能推出该方向普遍更适合 OPD. reverse KL、forward KL 与 JSD 的差异会随学生容量、生成温度、任务多峰程度和评测解码改变. 论文给出的结论适合形成候选配置, 最终选择仍需在目标任务上同时看质量、多样性、校准与稳定性.

### 6.7. 三种对照必须共享什么

比较监督 KD、混合 GKD 与纯 on-policy GKD 时, 输入 prompt 集合、教师检查点、学生起点和总优化 token 数应尽量一致. 如果 on-policy 分支额外生成更多 response token, 改善可能部分来自数据量. 如果固定数据分支使用人工答案而 on-policy 分支只使用 prompt, 两者的数据资源也不同, 应在表中直接列出.

训练算力的对照还要计入教师推理. 离线教师答案可以一次生成并反复复用, on-policy 教师 logits 随学生回答变化, 每轮都要重算. 只统计 learner 反向时间会系统性低估 GKD 成本. 完整口径至少包括学生 rollout、教师评分、学生前反向和通信.

### 6.8. 从单轮任务到多轮环境

单轮文本中, 状态是 prompt 加当前回答前缀. 多轮环境中, 状态还包含环境观察、工具返回和历史动作. 当前学生动作会改变下一次环境观察, 教师不能只对离线拼接文本打分而忽略环境转移. 若教师没有访问同一环境状态, token 级分布比较可能不再对应同一个决策问题.

把 GKD 扩展到多轮时, 应记录谁执行工具、谁生成环境动作、教师看到哪些隐藏信息, 以及失败动作后环境是否可恢复. 学生 rollout 与教师监督之间若重新执行环境, 随机环境可能产生不同观察. 这时需要保存环境状态或确定性 replay, 否则师生并未在同一状态上计算.

### 6.9. 数据治理与可重复性

在线生成使训练数据随随机种子、并发调度和学生版本变化. 为了复查一次异常更新, 应保存 prompt id、采样种子、学生版本、生成 token、终止原因与教师版本. 不一定长期保存完整 logits;可以保存教师 top-$k$、已采 token log-prob 与校验摘要, 在需要时用固定教师重算.

隐私或授权限制也可能阻止保存学生回答. 此时至少保留聚合诊断和不可逆标识, 并明确无法逐样本复现. 数据保留策略属于 OPD 系统设计的一部分, 因为在线轨迹既是训练输入, 也是定位状态分布故障的唯一直接证据.

## 参考文献与实现

1. Agarwal et al. *On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes*. ICLR 2024. [OpenReview](https://openreview.net/forum?id=3zKtaqxLhW), [arXiv](https://arxiv.org/abs/2306.13649).
2. Ross, Gordon, Bagnell. *A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning*. AISTATS 2011. [PMLR](https://proceedings.mlr.press/v15/ross11a.html).
3. verl. *On-Policy Distillation Trainer*. [官方仓库文档](https://github.com/verl-project/verl/blob/main/examples/on_policy_distillation_trainer/README.md).
