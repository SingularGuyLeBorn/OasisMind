---
title: "OPD 失败模式：证据、诊断与干预"
description: "按直接观察、目标函数可推导风险和待验证工程假设，诊断在线策略蒸馏的状态漂移、信号偏差、多样性退化与长度失稳"
date: 2026-05-16
as_of: 2026-09-01
published: true
tags: [OPD, On-Policy Distillation, Failure Analysis, Diagnostics, Stability]
---

# OPD 失败模式：证据、诊断与干预

在线策略蒸馏（On-Policy Distillation，OPD）让学生在自己采样的轨迹上接受教师监督。它减少了离线蒸馏的前缀分布错位，却把教师带到了另一类状态：教师要在学生生成、甚至已经出错的前缀上给出分布。这使 OPD 的失败不能只看一个 loss 或一个准确率。

本文把判断分成三个证据等级：

1. **已被论文或实验直接观察**：有明确实验协议、对照和指标；
2. **由目标函数可推导的风险**：数学上可能发生，但是否成为实际故障取决于数据、模型和实现；
3. **待验证工程假设**：可作为排障候选，不能包装成公认症候。

这种分级很重要。表面上相同的“准确率下降”，可能来自教师在坏前缀上失准、sampled-token 梯度偏差、tokenizer 错位、探索多样性下降、长度爆炸或评测器故障。没有对照实验就给它命名，只会把诊断变成故事。

## 1. 先钉住目标与两条数学边界

### 1.1 OPD 的状态和局部目标

给定提示 $x$，学生或行为策略生成轨迹：

$$
y=(a_1,\ldots,a_T),\qquad y\sim\pi_{\mathrm{rollout}}(\cdot\mid x).
$$

第 $t$ 个状态为：

$$
s_t=(x,a_{<t}).
$$

全词表的局部 reverse KL 是：

$$
D_{\mathrm{KL}}\!\left(
\pi_\theta(\cdot\mid s_t)
\middle\|
\pi_T(\cdot\mid s_t)
\right)
=
\sum_{a\in\mathcal V}
\pi_\theta(a\mid s_t)
\log
\frac{\pi_\theta(a\mid s_t)}
{\pi_T(a\mid s_t)}.
$$

许多大模型 OPD 实现为了降低教师传输与显存成本，只在学生已采样 token $a_t$ 上使用：

$$
\log\pi_\theta(a_t\mid s_t)-\log\pi_T(a_t\mid s_t),
$$

再把它放入策略梯度式 surrogate。这里要区分两个层面：

- 对固定状态 $s_t$，若 $a_t\sim\pi_\theta(\cdot\mid s_t)$，上述 log-ratio 的期望等于该位置的 reverse KL，所以它是**局部 KL 数值**的单样本无偏估计；
- 若训练更新只使用当前位置的即时 log-ratio，并切断未来 token 的回报耦合，它相对**完整序列 reverse-KL 的梯度**仍是有偏估计；在《Revisiting OPD》附录采用的有界 reward/log-ratio 与有界 score-gradient 假设下，它有更低的最坏情况长序列方差上界。

因此，“sampled-token 是否有偏”必须说明是在讨论局部损失值，还是完整序列目标的梯度。它与 full-vocabulary、top-$k$ 目标在方差、token 支持和特殊 token 敏感性上也不同，诊断时必须记录实际实现。

### 1.2 Reverse KL 对均匀教师的正确结论

若教师在某个状态上严格均匀：

$$
\pi_T(a\mid s)=\frac{1}{V},
$$

则：

$$
\begin{aligned}
D_{\mathrm{KL}}(\pi_\theta\|\pi_T)
&=
\sum_a\pi_\theta(a\mid s)
\log\frac{\pi_\theta(a\mid s)}{1/V}\\
&=
\log V-H(\pi_\theta).
\end{aligned}
$$

因此：

- 最小值是 0，在学生也均匀时取得；
- delta 分布的熵为 0，KL 为 $\log V$，是最大值而不是最小值。

所以，最小化 $\mathrm{KL}(\text{student}\|\text{uniform teacher})$ 会把学生推向均匀，而不会把学生推向 delta。

Reverse KL 的 mode-seeking 性质仍然可以在**非均匀、多峰且峰间低密度**的教师分布上出现：学生对自己几乎不采样的教师模态承担的代价很小，可能集中到其中一个峰。但“reverse KL 往往 mode-seeking”不能替代对具体教师分布的分析，更不能用均匀分布推出相反结论。

### 1.3 平均 token KL 不天然线性惩罚长度

总和形式：

$$
\mathcal L_{\mathrm{sum}}(y)=\sum_{t=1}^{T}d_t
$$

在每 token 平均散度近似不变时，会随 $T$ 近似线性增长。

平均形式：

$$
\mathcal L_{\mathrm{mean}}(y)=\frac{1}{T}\sum_{t=1}^{T}d_t
$$

消除了这个简单的线性尺度。它不意味着长度完全中性，因为长度仍会通过以下路径影响训练：

- 长轨迹更容易进入低质量或未覆盖状态；
- 截断和 EOS 处理改变样本选择；
- 不同长度的 token mask 与 batch reduction 可能改变实际权重；
- completion 上限会把长轨迹标成截断样本；
- reward、重要性比、教师可靠性和位置分布都可能随深度改变。

因此，观察到长度缩短或变长时，第一步是确认 loss 的真实 reduction，而不是直接归因于“KL 天然惩罚长链”。

## 2. 已被论文或实验直接观察

### 2.1 学生错误前缀上的教师不可靠

这是目前证据最直接的 OPD 风险之一。

SCOPE 在 2,000 个 DeepMath 问题上生成学生轨迹，把错误轨迹按教师困惑度分为四组，并让教师从不同比例的截断错误前缀继续作答。低教师 PPL 组的恢复率高于高 PPL 组；前缀保留得越长，所有组的恢复率越低。例如在 20% 截断比例下，最低 PPL 组与最高 PPL 组恢复率为 64.9% 和 45.4%；在 80% 截断比例下为 35.8% 和 28.6%。

《Revisiting On-Policy Distillation》也把“教师在学生生成前缀上不可靠”列为 sampled-token OPD 的三类实证故障之一。

| 诊断项 | 建议 |
|---|---|
| 可测信号 | 教师 sequence PPL、token entropy、教师从截断前缀恢复正确答案的概率、教师 PPL 与恢复率/正确率的可靠性曲线、指标随前缀深度的变化 |
| 必做对照 | 同一题的正确学生前缀、错误学生前缀、教师自身前缀和随机扰动前缀；固定采样温度与续写次数 |
| 干预 | SCOPE 式错误组教师 PPL 重加权；只在教师已校准的状态区域蒸馏；做前缀恢复实验后按轨迹深度或可教性路由、截断或拒绝蒸馏 |
| 误判边界 | 高 PPL 可能来自多解、稀有符号或 tokenizer 差异；低 PPL 也可能是教师对错误启发式过度自信。PPL 只有经过目标域校准后才能作为可靠性代理 |

#### 最小验证实验

对每条错误轨迹取多个截断点 $r\in\{0.2,0.4,0.6,0.8\}$：

1. 固定截断到最近的语义或换行边界；
2. 让教师从该前缀独立续写 $n$ 次；
3. 记录原错误轨迹的教师 PPL 和续写成功率；
4. 按 PPL 分桶，并在每个截断深度内比较恢复率；
5. 用 bootstrap 置信区间而不是单一均值判断相关性。

如果 PPL 与恢复率在目标域内没有稳定单调关系，就不应使用 PPL 作为主要权重。

### 2.2 Sampled-token 信号失衡、支持截断与 tokenizer 错位

《Revisiting On-Policy Distillation》直接识别了三类问题：

1. 单个采样 token 的监督失衡，无法完整表示局部分布匹配；
2. 学生前缀使教师信号失真；
3. tokenizer 或特殊 token 不匹配。

论文从理论上指出，即时 token-level 梯度估计器相对 sequence-level reverse-KL 梯度有偏；在附录的有界 reward/log-ratio 与有界 score-gradient 假设下，其最坏方差上界随序列长度为 $O(T^2)$，低于 sequence-level 估计器的 $O(T^4)$。这些是带假设的最坏情况上界，不是无条件的实际方差规律。论文提出 teacher top-$K$ local support matching、top-$p$ rollout 和特殊 token masking 来修复 sampled-token 支持与信号问题；这不否认 sampled log-ratio 是固定状态下局部 KL 数值的无偏单样本估计。

| 诊断项 | 建议 |
|---|---|
| 可测信号 | 每位置 top-k teacher mass、采样 token 在教师排序中的分位、梯度范数按 token 类型的集中度、特殊 token 梯度占比、全词表 KL 与 sampled-token surrogate 在小批量上的相关性 |
| 必做对照 | sampled-token、teacher top-k、可承受规模上的 full-vocabulary KL；同 tokenizer 与跨 tokenizer；特殊 token mask 开/关 |
| 干预 | teacher-supported top-k 局部匹配、top-p rollout、BOS/EOS/padding/tool token 显式 mask、词表映射和规范化测试 |
| 误判边界 | 梯度集中在少数 token 不必然是故障，代码符号、答案 token 或领域术语本来就可能承载主要信号；必须配合功能消融 |

#### Tokenizer 检查不应只比词表大小

至少核对：

- 同一原始文本编码出的 token ID 和边界；
- BOS、EOS、padding、换行、空白和对话模板；
- 工具调用与结构化输出的特殊 token；
- teacher log-probability 是否确实对应学生采样的同一文本片段；
- 截断是否切在 UTF-8 字符、数字或多 token 特殊标记内部。

若师生 tokenizer 不同，不能直接把学生 token ID 发送给教师打分；需要在文本或字节层重对齐，并明确一个学生 token 对应多个教师 token 时如何聚合概率。

### 2.3 正确轨迹均匀强化导致覆盖下降

SCOPE 论文汇总了两项固定协议下的结果：

- 它引用 Zhu et al. 的 Qwen2.5-7B Positive Sample Reinforcement 实验：Pass@1 提升，但 Pass@32 从 93.7% 降到 84.9%；
- 它自己的 DeepSeek-R1-Distill-Qwen-1.5B 标准 OPD 实验：AIME24 Pass@1 提升，但 Pass@32 从 76.5% 降到 75.0%。

这支持“均匀强化会偏向主导解法并降低多样性覆盖”的解释，也直接动机化了正确轨迹的 student-PPL 加权。

| 诊断项 | 建议 |
|---|---|
| 可测信号 | Pass@1 与 Pass@k、Avg@k、每题独立解法簇数量、答案与推理轨迹 self-BLEU、生成熵、组内正确轨迹的学生 PPL 分布 |
| 必做对照 | 固定温度/top-p/top-k/最大长度和 $k$；均匀 MLE、均匀 OPD、只开学生权重、完整双路径 |
| 干预 | 正确轨迹按学生 PPL 组内加权；保留稀有但经验证正确的解法；调整 rollout 探索参数；监控权重 ESS |
| 误判边界 | Pass@k 会受采样温度、答案解析器、重复过滤和最大长度影响；Pass@1 提升而 Pass@k 下降不能单独证明参数空间发生“模式坍缩” |

不应使用固定熵阈值判定“坍缩”。阈值必须来自基线分布、目标任务和固定采样协议下的统计区间。

### 2.4 长度膨胀、重复饱和与截断崩溃

StableOPD 的一手实验观察到的主要长度故障是**长度膨胀**，而不是统一的轨迹缩短现象：

- rollout 长度在训练中突然上升；
- 截断轨迹占比增加；
- 重复模式饱和；
- 截断样本带来有偏梯度；
- 验证性能随之明显下降。

该工作使用 reference-based divergence constraint 和 rollout mixture distillation 稳定训练。对 Qwen2.5-Math-1.5B 主表，六项数学基准的平均准确率由标准 OPD 的 28.9 提升至 36.1，即 **+7.2 个百分点**；这不是“相对提高 7.2%”的同义表达，也不能脱离该模型、教师和数据设置外推。

| 诊断项 | 建议 |
|---|---|
| 可测信号 | completion 长度分位数、命中最大长度比例、EOS 率、重复 n-gram、循环段长度、截断样本 loss/梯度占比、长度与正确率联合分布 |
| 必做对照 | 纯 on-policy、混入稳定 rollout、加入/移除 reference constraint；相同 token 预算与采样参数 |
| 干预 | reference divergence constraint、rollout mixture、重复检测、截断样本单独处理、最大长度敏感性实验 |
| 误判边界 | 更难题目或能力提升可能真实需要更长轨迹；平均长度增加不是故障，只有与重复、截断和性能退化联动才构成证据 |

长度监控应同时看短尾和长尾。只看均值会漏掉“多数样本正常、少量样本顶满上下文”的截断崩溃。

### 2.5 教师—学生模式不兼容，或教师没有新增能力

《Rethinking On-Policy Distillation》在受控实验中提出两个经验条件：教师与学生的高概率 token 模式需要有足够重合；即使教师分数更高、模式也兼容，教师还要提供学生训练中尚未获得的能力。该论文的结论来自 Qwen3 与 DeepSeek 系列的数学推理设置，不是“任何跨家族教师必然失败”的定理。一个更大但局部目标分布与学生错位的教师，也可能提供难以利用的信号。

| 诊断项 | 建议 |
|---|---|
| 可测信号 | 师生 top-k token overlap、教师相对学生的 held-out 增益、教师在学生前缀上的校准、随位置加深的 margin 与 KL |
| 必做对照 | 同一学生下比较高/低 top-$k$ overlap 教师；同训练流水线教师与额外 RL 后训练教师；强教师与同能力教师；离线冷启动后再 OPD |
| 干预 | 基于 overlap 与 held-out 增益做教师匹配；teacher-aligned prompt 过滤；教师轨迹 SFT 冷启动；只在教师有可验证新增能力的领域路由 |
| 误判边界 | top-k overlap 低也可能代表教师提供真正新颖的路径；要结合学生是否能吸收以及最终功能指标判断 |

## 3. 由目标函数可推导、但必须实证的风险

### 3.1 非均匀多峰教师下的覆盖收缩

Reverse KL 的期望由学生分布加权。若学生几乎不访问教师的某个模态，该模态对损失的贡献也很小，因此学生可能集中于一个高密度峰。

可测信号：

- 教师高概率模态的覆盖率；
- 多次采样的语义簇数量；
- Pass@k 与 Pass@1 的分离；
- reverse KL、forward KL、JS 或混合散度的对照。

干预：

- 适应性选择散度；
- 提高 rollout 覆盖；
- 对经验证的稀有模式单独加权；
- 使用 full-vocabulary 或 teacher top-k 信号保留更多支持。

误判边界：单峰集中在确定性任务中可能是正确行为；不能把所有熵下降都视为退化。

### 3.2 行为策略陈旧造成 importance ratio 漂移

使用旧 rollout 更新当前策略时：

$$
\rho_t(\theta)=
\frac{\pi_\theta(a_t\mid s_t)}
{\pi_{\mathrm{old}}(a_t\mid s_t)}
$$

可能出现重尾。多轮复用同一批 rollout、异步延迟或高学习率都会扩大漂移。

可测信号：

- $\rho_t$ 的均值、方差和极端分位；
- effective sample size；
- rollout age；
- KL$(\pi_\theta\|\pi_{\mathrm{old}})$；
- 梯度范数与 ratio 极值的相关性。

对照实验：

- 每批 1 次更新与多次更新；
- 新鲜 rollout 与延迟 rollout；
- 不同 clip 或 trust-region 设置。

误判边界：某些稀有高优势 token 合理地产生较大 ratio；只有和方差、性能或数值异常联动时才说明失稳。

### 3.3 困惑度权重被异常样本主导

SCOPE 一类方法把 PPL 通过 softmax 变成组内权重。若温度过小或 log-probability 计算异常，单个样本可能占据几乎全部权重。

可测信号：

$$
\operatorname{ESS}(w)=\frac{1}{\sum_i w_i^2},
$$

以及最大权重、权重熵、PPL 分位数和样本长度。

干预：

- 在 log-space 计算；
- 温度敏感性实验；
- winsorization 或上限裁剪，但必须作为新变体做消融；
- 检查 EOS、padding 和异常超长样本。

误判边界：真正位于能力边界的样本可能理应获得较高权重。低 ESS 是调查信号，不是自动失败判据。

### 3.4 自教师闭环可能放大共同偏差

在 OPSD/SDPO 等自蒸馏中，教师和学生共享参数或归纳偏差。若额外上下文、环境反馈或 stop-gradient 不能提供真正的新信息，闭环可能反复强化同一错误启发式。

可测信号：

- feedback-conditioned teacher 相对原学生的真实准确率增益；
- 师生在错误 token 上是否有可解释的概率差；
- 多轮自蒸馏后错误类型是否集中；
- 外部 verifier 或独立模型对错误的复核。

干预：

- 保证反馈携带新信息；
- 加入外部验证器或异质教师；
- 周期性与冻结基座/独立教师做对照；
- 对 self-teacher 的置信度—正确率做校准。

误判边界：师生输出相似不等于没有学习信号；局部 token 概率变化可能足以提供有效 credit assignment。

## 4. 待验证的工程假设

以下现象可以进入排障清单，但不能在没有目标域证据时命名为 OPD 的普遍失败模式。

| 假设 | 可测信号 | 对照实验 | 可尝试干预 | 主要误判边界 |
|---|---|---|---|---|
| 学生学会答案解析器或 verifier 的捷径 | verifier 通过但独立测试失败、扰动输入后性能骤降、规则外样本失败 | 主 verifier 与隐藏 verifier；表面格式相同但语义改变的对抗集 | 多验证器、隐藏测试、语义扰动、过程检查 | 简短或模板化解法不等于作弊 |
| 推理轨迹过度缩短 | 长度下降同时复杂题、步骤验证或校准下降 | 固定答案正确率下比较 trace 质量；控制 EOS/reward | 保留必要中间验证、难度分层、step verifier | 更短可能是去除冗余并提升效率 |
| 校准能力恶化 | ECE、Brier、选择性准确率、拒答曲线变差 | 同准确率 checkpoint 对照；温度校准前后 | 校准损失、独立 held-out calibration、保留不确定性表达 | 生成 token 熵不等于答案置信度 |
| 通用能力遗忘 | 非目标域、语言、工具和安全评测下降 | 相同训练 token 的 SFT、RLVR、OPD 对照 | replay、reference constraint、混合域 rollout | 评测波动或模板变化可能造成假下降 |
| 多教师信号冲突 | 同 token 教师梯度余弦为负、router 频繁抖动、领域外退化 | 单教师、均匀混合、领域路由 | competence router、冲突检测、分域 batch | 不同教师的多样性不必然是破坏性冲突 |
| 多轮 Agent 结构退化 | 工具调用轮数、有效 observation 使用率、任务成功率脱钩 | 单轮/多轮、固定/更新教师、终局/步骤信号 | 轨迹结构约束、turn-level credit、稳定 teacher update | 更少轮次可能是更高效策略 |
| 过短或过长两端失稳 | 长度分布双峰、短答错误率与截断率同时上升 | 多个最大长度、温度和 reward 版本 | 分层采样、长度条件评测、对截断单独建模 | 任务混合本身可能自然产生双峰 |

对这些假设的阈值应来自基线置信区间、历史稳定运行和预注册验证集，而不是写死 entropy 0.5、confidence 0.95、固定 token 数或统一温度。

## 5. 统一诊断面板

### 5.1 数据与 rollout

每个 prompt 和每条轨迹至少记录：

- prompt ID、数据版本、领域和难度分层；
- rollout policy checkpoint、生成时间和 rollout age；
- 温度、top-p、top-k、最大长度和随机种子；
- completion token 数、EOS、截断、重复率；
- 结果正确性和验证器版本；
- 正确组、错误组和组大小。

### 5.2 师生概率

按 token 保存或可重算：

- $\log\pi_{\mathrm{old}}(a_t\mid s_t)$；
- $\log\pi_\theta(a_t\mid s_t)$；
- $\log\pi_T(a_t\mid s_t)$；
- teacher/student entropy；
- teacher/student top-k mass 与 overlap；
- sampled-token log-ratio；
- sequence PPL；
- 特殊 token mask。

若成本不允许全量保存，至少在固定审计子集上保留完整词表或 teacher top-k，以便检查 sampled-token 近似。

### 5.3 梯度与优化

监控：

- loss 的 token-sum、token-mean 和 sequence-mean；
- 梯度范数及按 token 类型、位置、正确性分支的贡献；
- importance ratio 分位数；
- 权重最大值、权重熵与 ESS；
- 不同位置深度的 teacher margin 和 KL；
- NaN、Inf、overflow、underflow 与被 mask 比例。

### 5.4 功能指标

至少同时报告：

- Pass@1、Avg@k、Pass@k；
- 多种固定采样预算下的 accuracy-cost 曲线；
- completion 长度分布、截断率和重复率；
- OOD、跨领域和遗忘评测；
- ECE、Brier、选择性准确率等校准指标；
- 语义解法簇或功能行为多样性；
- 教师从错误前缀恢复的成功率。

任何指标都要绑定采样参数。改变温度后比较 Pass@k，不能归因于训练方法本身。

## 6. 对照实验矩阵

当训练出现退化时，推荐按最小改动逐层隔离。

### 6.1 采样轴

- 静态教师轨迹 vs 学生 on-policy 轨迹；
- 当前策略 rollout vs 延迟策略 rollout；
- 温度/top-p/top-k 的固定网格；
- rollout 数量 $G$ 和最大长度敏感性。

### 6.2 信号轴

- full-vocabulary KL；
- teacher top-k local support；
- sampled-token surrogate；
- 正确轨迹 MLE；
- 结果奖励；
- feedback-conditioned self-teacher。

### 6.3 教师轴

- 同家族与跨家族；
- 固定教师、EMA teacher、周期 hard copy；
- 外部教师与 self-teacher；
- 单教师与多教师；
- 正确前缀、错误前缀和教师自身前缀。

### 6.4 稳定化轴

- reference constraint 开/关；
- rollout mixture 开/关；
- 特殊 token mask 开/关；
- 均匀权重与自适应权重；
- 不同 weight temperature；
- 每批更新次数和 rollout freshness。

每个实验只改变一个主因素，并报告至少多个随机种子。若同时换教师、采样温度、loss reduction 和数据 mixture，就无法定位故障。

## 7. 从症状到根因

### 症状一：loss 下降，准确率不升

依次检查：

1. 验证器和数据是否正确；
2. loss 是否主要由特殊 token、格式 token 或 persistent high-loss token 驱动；
3. sampled-token surrogate 与小规模 full-KL 是否相关；
4. 教师在学生前缀上是否仍有恢复能力；
5. 教师是否确实提供了学生尚未掌握的新能力。

### 症状二：Pass@1 上升，Pass@k 下降

检查：

1. 评测采样参数是否完全一致；
2. 正确轨迹是否被均匀强化；
3. 学生 PPL 较高但正确的轨迹是否消失；
4. 解法簇数量和生成熵是否同时下降；
5. 答案解析器是否把多样表达错误判错。

干预优先级：先修评测，再做正确轨迹重加权或探索调整；不要仅凭 token entropy 强行加熵正则。

### 症状三：长度突然增加并顶满上下文

检查：

1. 重复 n-gram 与循环段；
2. EOS 概率和特殊 token mask；
3. 截断轨迹在 loss 中的权重；
4. reference divergence；
5. rollout 是否完全由最新学生产生。

若长度增加但正确率、非重复步骤数和完成率同步改善，不应直接压短。

### 症状四：长度变短且复杂题退化

检查：

1. 训练 loss 到底是 token-sum 还是 token-mean；
2. EOS 是否获得异常监督；
3. 数据 mixture 是否偏向短答案；
4. verifier 是否只看最终答案而忽略必要过程；
5. 短轨迹是否只是去冗余。

“长度变短”本身不是根因。只有独立步骤验证、困难分层或校准指标也退化时，才有理由干预。

### 症状五：训练早期正常，后期突然失稳

检查：

1. rollout age 和 importance ratio 重尾；
2. teacher 更新或 hard-copy 事件；
3. PPL 权重 ESS 是否骤降；
4. 长度、重复和截断率是否发生相变；
5. 数据课程或 prompt 难度是否越过学生可学边界。

## 8. 干预的适用边界

| 干预 | 主要针对 | 不解决 |
|---|---|---|
| SCOPE 双路径权重 | 正确轨迹重复强化、错误前缀上的教师可靠性差异 | verifier 错误、跨 tokenizer 对齐、教师没有新能力 |
| Teacher top-k local support | sampled-token 支持不足和梯度失衡 | 教师本身在坏前缀上错误 |
| 特殊 token masking | tokenizer/模板 token 污染 | 语义层教师错误 |
| Reference constraint | 策略漂移、长度与重复失稳 | 教师—学生能力不匹配 |
| Rollout mixture | 纯 on-policy 自反馈失稳、长度膨胀 | 静态数据本身质量差 |
| Forward/JS/混合散度 | 覆盖与 mode-seeking 权衡 | 错误验证器、过期 rollout |
| Curriculum/competence routing | 全错组、低梯度 SNR、题目超出学生边界 | 教师无法在这些状态上提供可靠信号 |
| 外部 verifier/异质教师 | 自蒸馏共同偏差 | 额外信号本身不可靠或分布外 |

不存在一组可跨模型复用的默认阈值。干预参数必须通过目标域消融选择，并在 held-out 集上验证是否只是改变了生成长度或采样熵。

## 9. 发布前验证清单

### 公式与实现

- [ ] 均匀教师的 reverse KL 单元测试验证最优学生也是均匀分布。
- [ ] 明确使用 full-vocabulary、top-k 还是 sampled-token 目标。
- [ ] 明确 token-sum、token-mean、sequence-mean 和 batch reduction。
- [ ] importance ratio 分母来自真实行为策略。
- [ ] stop-gradient 位置与论文一致。
- [ ] prompt、padding、EOS、工具 token 和截断 mask 有单元测试。

### 教师可靠性

- [ ] 在学生正确/错误前缀上分别测教师正确率与 PPL。
- [ ] 画 PPL—恢复率可靠性曲线和前缀深度曲线。
- [ ] 检查低 PPL 高错误率的过度自信区域。
- [ ] 检查师生 top-k overlap 与教师能力增益。

### 训练稳定性

- [ ] 记录 rollout age、ratio 分位数、梯度范数和 NaN/Inf。
- [ ] 记录长度全分布、截断率、EOS 和重复率。
- [ ] 对自适应权重记录最大值、熵和 ESS。
- [ ] 将正确/错误分支、不同位置和 token 类型的梯度分开统计。

### 功能与边界

- [ ] 固定采样协议报告 Pass@1、Avg@k 和 Pass@k。
- [ ] 对复杂度、领域、长度和 OOD 分层。
- [ ] 报告校准、遗忘和非目标能力。
- [ ] 用多个随机种子和置信区间。
- [ ] 每项干预有单因素消融。
- [ ] 工程假设不写成已证实的普遍规律。

## 10. 一手来源

1. Song and Zheng, [A Survey of On-Policy Distillation for Large Language Models](https://arxiv.org/abs/2604.00626), arXiv:2604.00626v4, 2026。该综述标注为 ongoing work；本文用它建立分类，具体结论回到下列一手论文。
2. Fu et al., [Revisiting On-Policy Distillation: Empirical Failure Modes and Simple Fixes](https://arxiv.org/abs/2603.25562), arXiv:2603.25562v2, 2026。
3. Zheng et al., [SCOPE: Signal-Calibrated On-Policy Distillation Enhancement with Dual-Path Adaptive Weighting](https://arxiv.org/abs/2604.10688), arXiv:2604.10688v2, 2026。
4. Luo et al., [Demystifying OPD: Length Inflation and Stabilization Strategies for Large Language Models](https://arxiv.org/abs/2604.08527), arXiv:2604.08527v1, 2026。
5. Agarwal et al., [On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes](https://arxiv.org/abs/2306.13649), ICLR 2024；arXiv 初稿提交于 2023 年。
6. Gu et al., [MiniLLM: On-Policy Distillation of Large Language Models](https://arxiv.org/abs/2306.08543), arXiv:2306.08543, 2023。
7. Zhao et al., [Self-Distilled Reasoner: On-Policy Self-Distillation for Large Language Models](https://arxiv.org/abs/2601.18734), arXiv:2601.18734v3, 2026。
8. Hübotter et al., [Reinforcement Learning via Self-Distillation](https://arxiv.org/abs/2601.20802), arXiv:2601.20802v2, 2026。
9. Li et al., [Rethinking On-Policy Distillation of Large Language Models: Phenomenology, Mechanism, and Recipe](https://arxiv.org/abs/2604.13016), arXiv:2604.13016v2, 2026。
