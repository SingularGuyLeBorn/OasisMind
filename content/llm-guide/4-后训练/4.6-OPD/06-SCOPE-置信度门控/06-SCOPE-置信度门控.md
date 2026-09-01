---
title: "SCOPE：信号校准的双路径在线策略蒸馏"
description: "基于正确性分流、学生困惑度加权 MLE 与教师困惑度加权 KL 的 SCOPE 方法、实验边界和复现清单"
date: 2026-05-16
as_of: 2026-09-01
published: true
tags: [OPD, SCOPE, On-Policy Distillation, Dual-Path Adaptive Weighting, Reasoning]
---

# SCOPE：信号校准的双路径在线策略蒸馏

SCOPE 的全称是 **Signal-Calibrated On-Policy Distillation Enhancement with Dual-Path Adaptive Weighting**。它不是一个根据“教师熵、师生一致性、奖励模型置信度”计算总分并做阈值开关的门控器，也没有“低于阈值就回退到 SFT”的设计。论文提出的是另一套更具体的机制：

1. 学生对同一提示采样一组在线轨迹；
2. 用可验证结果把轨迹分为正确组和错误组；
3. 正确轨迹走学生分支，以学生困惑度做组内权重，执行 MLE 式自强化；
4. 错误轨迹走教师分支，以教师困惑度做组内权重，执行 OPD 的 KL 蒸馏；
5. 两个分支分别在同一提示的候选组内归一化，再合并为一个训练目标。

核心不是“只让高置信样本通过”，而是**按结果选择监督类型，并在每个分支内部重新分配学习量**。

## 1. SCOPE 试图解决什么

标准 OPD 在学生自己采样的前缀上查询教师，并用教师的 token 分布提供稠密监督。相比只在教师生成轨迹上训练，这能减轻训练状态与部署状态不一致；但“学生前缀”也会带来两类不同问题。

### 1.1 错误轨迹：教师不一定能修复学生的坏前缀

当学生轨迹已经包含逻辑错误、重复循环或格式崩坏时，教师仍被迫条件化在这个前缀上。此时教师可能给学生轨迹中的 token 较低平均似然，也可能在无意义续写上维持局部一致；两种情况都会削弱“局部 token 分数能纠正整条轨迹”的假设。对所有错误轨迹均匀蒸馏，会把高质量纠错和低质量信号等权混合。

SCOPE 的预实验把错误轨迹按教师困惑度分桶，再让教师从不同截断位置续写。低困惑度桶的恢复率始终更高；随着错误前缀变长，各桶恢复率都下降。这个结果支持“教师在学生错误状态上的困惑度可作为纠错能力代理”，但只是在论文的模型、数据与采样协议下建立了经验相关性，不等于困惑度在所有领域都能校准教师正确性。

### 1.2 正确轨迹：均匀强化会重复训练已经掌握的模式

同一提示的多个正确解并不等价：

- 低困惑度正确轨迹通常是学生已经高概率掌握的主导路径；
- 高困惑度正确轨迹是学生确实完成了、但当前概率较低的路径，可能位于能力边界。

均匀 MLE 会把大量学习量继续投给主导路径。对所有正确轨迹做教师 KL 又可能把学生自己的有效路径拉向教师分布。SCOPE 因而不在正确分支查询教师来决定目标，而是提高“正确但学生困惑度高”的轨迹权重。

论文用 Pass@1 提升而 Pass@32 下降描述多样性退化。这里的 Pass@32 是在固定采样协议下至少一次答对的比例；它反映的是多样性与覆盖能力的组合，不能单独证明内部推理机制发生了某一种形式的坍缩。

## 2. 条件、状态与符号

给定提示 $x$，行为策略 $\pi_{\mathrm{old}}$ 为它采样 $G$ 条轨迹：

$$
y_i=(a_{i,1},\ldots,a_{i,T_i}),\qquad
y_i\sim\pi_{\mathrm{old}}(\cdot\mid x).
$$

第 $t$ 个生成状态是：

$$
s_{i,t}=(x,a_{i,<t}).
$$

训练时涉及三个策略角色：

- $\pi_{\mathrm{old}}$：生成当前 rollout 的行为策略快照；
- $\pi_\theta$：正在更新的学生策略；
- $\pi_T$：固定或在一个更新窗口内固定的外部教师。

结果判定器给出轨迹级正确性 $c_i\in\{0,1\}$，从而得到：

$$
\Omega_c^x=\{i:c_i=1\},\qquad
\Omega_w^x=\{i:c_i=0\}.
$$

SCOPE 需要以下条件：

- 一个能对完整轨迹给出可靠正确/错误标签的判定器；
- 同一提示至少采样一组候选，才能形成有意义的组内相对权重；
- 教师能够在学生 tokenization 和学生前缀状态上返回目标 token 的 log-probability；
- rollout token、行为策略 log-probability、学生旧 log-probability和教师 log-probability 对齐；
- 更新时能区分行为策略与当前策略，避免把参考教师错当成 importance ratio 的分母。

论文实验主要使用数学答案验证器和代码测试。对于开放式写作、对话安全、审美偏好等缺乏可靠二元判定器的任务，正确/错误分流本身就需要重新定义。

## 3. 双路径目标

### 3.1 On-policy surrogate

行为策略采样后，当前学生可能已经更新。论文用 token 级重要性比修正二者的偏移：

$$
\rho_{i,t}(\theta)=
\frac{\pi_\theta(a_{i,t}\mid s_{i,t})}
{\pi_{\mathrm{old}}(a_{i,t}\mid s_{i,t})}.
$$

这个分母是 rollout 行为策略，不是教师，也不是用于 KL 约束的 reference policy。

### 3.2 正确轨迹：学生困惑度加权 MLE

论文把正确轨迹的 surrogate 写为：

$$
\mathcal L_{\mathrm{MLE}}(x,y_i;\theta)
=-\sum_{t=1}^{T_i}\rho_{i,t}(\theta),
\qquad i\in\Omega_c^x.
$$

在 $\theta$ 接近 $\theta_{\mathrm{old}}$ 时，它提供提高已采样正确动作概率的策略梯度。这里应忠实区分论文的 importance-weighted surrogate 与普通 teacher-forced NLL；实现时不能悄悄把它替换成另一种 reduction 后仍声称复现了同一目标。

学生序列困惑度定义为：

$$
\operatorname{PPL}_S(y_i\mid x)
=\exp\left(
-\frac{1}{T_i}\log\pi_S(y_i\mid x)
\right),
$$

其中：

$$
\log\pi_S(y_i\mid x)
=\sum_{t=1}^{T_i}\log\pi_S(a_{i,t}\mid s_{i,t}).
$$

论文在正确组内使用：

$$
w_i^{\mathrm{stu}}
=
\frac{
\operatorname{PPL}_S(y_i\mid x)^{1/\tau}
}{
\sum_{j\in\Omega_c^x}
\operatorname{PPL}_S(y_j\mid x)^{1/\tau}
},
\qquad i\in\Omega_c^x.
$$

因此，正确但学生困惑度高的轨迹获得更大权重。$\tau$ 是权重温度：

- 较小 $\tau$ 使权重更尖锐，更集中于极端样本；
- 较大 $\tau$ 使权重趋于均匀；
- 论文默认 $\tau=1.0$，只比较了 $0.5、1.0、2.0$，不能据此给其他模型设定通用最优值。

### 3.3 错误轨迹：教师困惑度加权 OPD

错误轨迹使用 sampled-token reverse-KL surrogate：

$$
\mathcal L_{\mathrm{OPD}}(x,y_i;\theta)
=
\sum_{t=1}^{T_i}
\rho_{i,t}(\theta)
\left[
\log\pi_{\bar\theta}(a_{i,t}\mid s_{i,t})
-\log\pi_T(a_{i,t}\mid s_{i,t})
\right],
\qquad i\in\Omega_w^x,
$$

其中 $\bar\theta$ 表示括号内的学生 log-probability 停止梯度。这里用的是采样 token 的 log-ratio surrogate；它并不等同于在每个位置显式计算全词表 KL。

教师序列困惑度为：

$$
\operatorname{PPL}_T(y_i\mid x)
=\exp\left(
-\frac{1}{T_i}\log\pi_T(y_i\mid x)
\right).
$$

错误组内权重为：

$$
w_i^{\mathrm{tea}}
=
\frac{
\operatorname{PPL}_T(y_i\mid x)^{-1/\tau}
}{
\sum_{j\in\Omega_w^x}
\operatorname{PPL}_T(y_j\mid x)^{-1/\tau}
},
\qquad i\in\Omega_w^x.
$$

教师困惑度越低，权重越大；教师困惑度越高，权重越小。它是连续重加权，不是硬阈值删除。

### 3.4 分组归一化

两个分支都只在**同一提示、同一正确性子组**内归一化：

$$
\sum_{i\in\Omega_c^x}w_i^{\mathrm{stu}}=1,
\qquad
\sum_{i\in\Omega_w^x}w_i^{\mathrm{tea}}=1.
$$

归一化有两个作用：

1. 不让原始困惑度的绝对尺度直接放大整批梯度；
2. 让权重表达“同一题的候选中谁更值得学”，减少不同题目固有难度造成的尺度不可比。

它不能保证梯度估计无偏。论文明确把这描述为一种 signal-calibrated bias：有意偏向可靠的错误纠正和较少探索的正确路径。

如果一个分支只有一个样本，其权重自然为 1；如果分支为空，该分支贡献为 0。复现时必须明确空组行为、分母数值稳定和跨设备 group 聚合，否则很容易把“提示内归一化”错误实现成“全局 batch 归一化”。

### 3.5 总目标

$$
\mathcal J_{\mathrm{SCOPE}}
=
\mathbb E_{x\sim\mathcal D}
\left[
\sum_{i\in\Omega_c^x}
w_i^{\mathrm{stu}}\mathcal L_{\mathrm{MLE}}(x,y_i)
+
\sum_{i\in\Omega_w^x}
w_i^{\mathrm{tea}}\mathcal L_{\mathrm{OPD}}(x,y_i)
\right].
$$

论文公式没有额外的“回退 SFT”项，也没有三维置信度向量、手工 percentile 门槛或奖励模型置信度分支。若工程实现额外加入这些机制，应单独命名并做消融，不能继续称为原论文 SCOPE。

## 4. 训练算法

一次训练迭代可以按以下顺序实现：

1. 从数据集采样一批提示 $x$，冻结当前行为策略快照 $\pi_{\mathrm{old}}$。
2. 对每个提示采样 $G$ 条轨迹，同时保存 response mask 和 $\log\pi_{\mathrm{old}}(a_{i,t}\mid s_{i,t})$。
3. 用答案解析器、单元测试或其他验证器计算 $c_i$，建立 $\Omega_c^x$ 与 $\Omega_w^x$。
4. 对正确轨迹：
   - 计算学生在原轨迹上的长度归一化序列 log-probability；
   - 转换为 $\operatorname{PPL}_S$；
   - 在 $\Omega_c^x$ 内用 softmax 形式得到 $w_i^{\mathrm{stu}}$；
   - 计算 importance-weighted MLE surrogate。
5. 对错误轨迹：
   - 让教师在相同的学生前缀状态上打分，不要求教师重新生成一条答案；
   - 计算目标 token 的教师 log-probability和 $\operatorname{PPL}_T$；
   - 在 $\Omega_w^x$ 内得到 $w_i^{\mathrm{tea}}$；
   - 计算 sampled-token OPD surrogate。
6. 合并两个分支的加权损失。论文附录的梯度表达把 $w_i^{\mathrm{stu}}$ 与 $w_i^{\mathrm{tea}}$ 当作固定权重处理；复现时仍需核对官方实现是否对权重显式 detach，并把“允许权重梯度”作为单独消融，而不能只凭正文公式推断。
7. 更新 $\pi_\theta$；进入下一轮时重新采样，保证 rollout 与策略足够新鲜。

下面的伪代码只强调数据流，不替代论文和官方实现中的张量 mask、分布式 group 聚合与 reduction 细节：

    for prompts in loader:
        rollouts = sample(policy_old, prompts, n=G)
        correctness = verifier(prompts, rollouts)

        old_logp = score(policy_old, prompts, rollouts)
        current_logp = score(policy, prompts, rollouts)
        ratio = exp(current_logp - old_logp)

        loss = 0
        for each prompt group:
            correct = trajectories where correctness == 1
            wrong = trajectories where correctness == 0

            if correct is not empty:
                student_ppl = exp(-sequence_mean(current_logp[correct]))
                student_weight = softmax(log(student_ppl) / tau)
                mle_surrogate = -token_sum(ratio[correct])
                loss += weighted_sum(student_weight, mle_surrogate)

            if wrong is not empty:
                teacher_logp = score(teacher, prompt, wrong)
                teacher_ppl = exp(-sequence_mean(teacher_logp))
                teacher_weight = softmax(-log(teacher_ppl) / tau)
                opd_signal = stopgrad(current_logp[wrong]) - teacher_logp
                opd_surrogate = token_sum(ratio[wrong] * opd_signal)
                loss += weighted_sum(teacher_weight, opd_surrogate)

        optimize(loss)

实现时至少要做以下数值处理：

- 在 log-space 计算权重，避免先 exponentiate 成 PPL 后溢出；
- 权重 logits 减去组内最大值后再 softmax；
- response padding、prompt token、EOS 和特殊 token mask 必须一致；
- $\pi_{\mathrm{old}}$、$\pi_\theta$、$\pi_T$ 的 token ID 必须对应同一序列；
- 论文在 OPD 括号内用 $\bar\theta$ 明确停止学生 log-probability 的梯度；附录推导把双路径权重当作固定量。实现应分别核对权重、教师信号与 $\log\pi_{\bar\theta}$ 的计算图，并记录是否 detach；
- 记录组内有效样本数和有效样本量，避免极端权重被平均指标掩盖。

## 5. 与相邻方法的边界

| 方法 | rollout 来源 | 监督来源 | 主要目标 | 与 SCOPE 的关键区别 |
|---|---|---|---|---|
| 离线 KD/SFT | 静态教师或数据轨迹 | 教师文本/标签 | 模仿固定数据 | 不在学生当前状态分布上训练 |
| 标准 OPD | 学生在线轨迹 | 外部教师 token 分布 | 对所有轨迹做蒸馏 | 不按正确性分流，也不做双路径困惑度权重 |
| GRPO/RLVR | 学生在线轨迹 | 可验证标量奖励 | 组相对策略优化 | 没有外部教师的稠密 token 信号 |
| SCOPE | 学生在线轨迹 | 正确性验证器 + 外部教师 | 正确轨迹 MLE、错误轨迹 OPD | 按正确性路由并在分支内自适应加权 |
| OPSD | 学生在线轨迹 | 同一模型在特权信息条件下的分布 | 自蒸馏 | 教师与学生共享参数，差异来自上下文 |
| SDPO | 学生在线轨迹 | 环境富反馈条件化的 self-teacher | 把反馈转为稠密 token 信号 | 不需要外部强教师；反馈是核心条件 |
| MOPD | 学生在线轨迹 | 多教师或混合教师 | 汇聚不同教师能力 | 关注教师组合；SCOPE 论文验证的是单教师双路径校准 |

这些边界允许组合，但组合后要重新验证：

- SCOPE + SDPO：错误分支可否改用 feedback-conditioned self-teacher，是新的研究设计，不是原 SCOPE。
- SCOPE + MOPD：必须先解决教师选择和冲突，再定义教师 PPL 由哪位教师计算。
- SCOPE + GRPO：可以增加 outcome reward 分支，但需要明确目标权重和消融，不能把两个目标简单相加后沿用原论文结论。

## 6. 实验协议与结果如何解读

### 6.1 数学推理

论文使用两组教师—学生配置：

- SkyWork-OR1-7B → DeepSeek-R1-Distill-Qwen-1.5B；
- Qwen3-8B-Instruct → Qwen3-1.7B-Base。

训练集为 DeepMath；评测包括 AIME 2024、AIME 2025、AMC 2023、MATH-500、Minerva 和 OlympiadBench。基线包括 GRPO、离线 KD 和标准 OPD。主要指标是 Avg@32 与 Pass@32。

在第一组配置中，SCOPE 相对标准 OPD 的六项平均：

- Avg@32：52.3 → 55.2，论文报告相对提升 5.54%；
- Pass@32：73.1 → 75.0，论文报告相对提升 2.60%。

摘要给出的“Avg@32 平均相对提升 11.42%、Pass@32 提升 7.30%”是相对竞争基线的汇总表述，不能替换成“对标准 OPD 普遍提升 11.42%”。引用结果时必须说明比较对象。

### 6.2 代码生成扩展实验

代码实验使用 TACO 的 25,202 个训练问题，并在 HumanEval、LiveCodeBench 2024.08–2025.02 和 500 个 Codeforces 问题上评测；论文称这 500 个问题从训练集中排除。在 1.5B 学生配置下，SCOPE 相对 OPD 的三项平均：

- Avg@32：42.6 → 44.6；
- Pass@32：59.2 → 60.3。

这支持方法不只适用于数学，但仍然属于可程序验证的代码任务，不能直接外推到开放式对话或非可验证偏好任务。

### 6.3 关键超参数与算力

论文主要训练设置：

| 项目 | 设置 |
|---|---:|
| 全局 prompt batch | 256 |
| 每个提示生成数 $G$ | 8 |
| 最大 prompt 长度 | 4,096 |
| 最大 completion 长度 | 12,288 |
| rollout 温度 | 0.6 |
| 权重温度 $\tau$ | 1.0 |
| 学习率 | $5\times10^{-5}$ |
| 每批更新轮数 | 1 |

评测使用 32 个样本、温度 0.6、top-p 0.95、top-k 20、最大 32,768 token。实验使用 20 张 A100 80GB，其中 16 张训练学生、4 张部署教师。

同步实现中，论文报告 SCOPE 每步 641.9 秒，标准 OPD 227.5 秒，GRPO 459.0 秒。相对同为 $G=8$ 的 GRPO，SCOPE 多约 182.9 秒，而表中教师打分为 200.0 秒，因此这组差额主要对应教师打分；不能用同一分解解释相对 $G=1$ 标准 OPD 的全部 414.4 秒差额，因为 rollout 数量、old log-probability 与 actor update 也同时改变。作者认为异步化有望降低墙钟成本，但论文没有用异步系统实证“成本与 GRPO 相当”。

## 7. 局限与失效边界

### 7.1 困惑度是代理量，不是真值

低教师 PPL 与恢复能力在论文实验中相关，但教师也可能对错误模式过度自信；高 PPL 也可能来自合理的多解、tokenization 差异或少见符号。必须在目标域上先画教师 PPL 与纠错成功率的可靠性曲线。

### 7.2 正确性路由依赖验证器

错误标签会直接把轨迹送进错误分支：

- 假阴性：有效轨迹被迫模仿教师；
- 假阳性：错误轨迹被 MLE 自强化。

答案解析、单位、浮点容差、代码沙箱和多解等价判断必须单独测试。

### 7.3 组内权重依赖候选覆盖

当 $G$ 很小、正确组或错误组只有一个样本时，自适应权重退化为 1。若一个 prompt 的 rollout 全对或全错，只有一个分支产生梯度。SCOPE 不会凭空解决“所有轨迹都错、且教师也无法在坏前缀上恢复”的能力鸿沟。

### 7.4 极端 PPL 会主导权重

较小 $\tau$ 会提高权重集中度，也会放大异常 token、长度归一化误差和教师打分故障。应监控：

$$
\operatorname{ESS}(w)=\frac{(\sum_i w_i)^2}{\sum_i w_i^2}
=\frac{1}{\sum_i w_i^2},
$$

并与组大小一起报告。ESS 很低只说明权重高度集中，不自动意味着训练错误。

### 7.5 sampled-token surrogate 的信息有限

论文目标使用学生已采样 token 的教师 log-probability，不利用完整教师词表分布。对固定状态而言，采样 token 的 log-ratio 在期望上可估计该位置的 reverse KL；但 SCOPE 使用的局部 surrogate 没有保留序列级目标中的未来回报耦合，因此相对序列级 reverse-KL 梯度仍可能有偏。它还会受到单 token 方差、教师在学生前缀上的可靠性和特殊 token 对齐影响。需要在小规模子集上与 teacher top-k 或 full-vocabulary KL 做对照。

### 7.6 教师服务成本与复现状态

官方仓库提供训练脚本和模型，但截至 `as_of` 日期，论文/README 与默认运行脚本存在会改变复现语义的冲突：论文 Table 3 的最大 prompt 长度是 4,096，两个运行脚本写为 2,048；论文公式与 README 要求教师 PPL 越低、错误分支权重越大，README 对应 `TEACHER_PATH_PPL_POSITIVE=False`，而两个运行脚本当前写为 `True`。在没有追踪该布尔量进入实际权重函数的代码路径前，不能假定脚本忠实实现论文方向。仓库公告还曾提示 DeepSeek-R1-Distill-Qwen-1.5B 的 checkpoint 与环境依赖问题。复现必须锁定 commit、镜像和权重哈希，并对两条仅 PPL 不同的轨迹手算权重，分别核对论文、README、脚本与实际函数。

### 7.7 证据范围

当前证据集中在 1.5B、1.7B 学生和 7B、8B 教师，可验证数学与代码任务。尚不能据此断言：

- 对更大模型同样有效；
- 对黑盒只返回文本的教师同样有效；
- 对不可验证的偏好、安全和创意任务同样有效；
- 对跨 tokenizer 教师—学生无需额外处理；
- 对多教师、持续学习和长周期训练不会遗忘。

## 8. 复现清单

### 数据与验证

- [ ] 固定训练集版本、去重规则和 held-out 评测集。
- [ ] 对数学答案解析器做多解、单位、格式和浮点测试。
- [ ] 对代码测试记录沙箱、超时、内存限制和隐藏用例版本。
- [ ] 记录每个 prompt 的全对、全错、混合组比例。

### rollout 与概率

- [ ] 记录 $\pi_{\mathrm{old}}$ checkpoint 和 rollout 生成时间。
- [ ] 固定温度、top-p、top-k、最大长度和每题生成数。
- [ ] 保存行为策略、当前学生、教师的目标 token log-probability。
- [ ] 验证 prompt mask、response mask、EOS 和 padding 完全一致。
- [ ] 检查三个策略的 tokenizer 与特殊 token 映射。

### 双路径权重

- [ ] 正确组权重随学生 PPL 单调增加。
- [ ] 错误组权重随教师 PPL 单调减少。
- [ ] 两个子组分别求和为 1，而不是整批共同归一化。
- [ ] 空组贡献为 0，单样本组权重为 1。
- [ ] PPL 与权重在 log-space 计算；根据锁定 commit 核对权重是否 detach，并分别测试允许/禁止权重梯度。
- [ ] 记录 $\tau$、权重最大值、熵和 ESS。

### 目标函数

- [ ] importance ratio 分母来自 $\pi_{\mathrm{old}}$。
- [ ] OPD 括号内学生 log-probability停止梯度。
- [ ] 明确 token-sum、token-mean、sequence-mean 的 reduction。
- [ ] 对照均匀 OPD、均匀正确轨迹 MLE、只开学生权重、只开教师权重和完整 SCOPE。
- [ ] 在小规模 batch 上用手算例核对 loss 和梯度方向。

### 评测与报告

- [ ] 同时报告 Pass@1、Avg@k、Pass@k，固定 $k$ 和采样协议。
- [ ] 报告至少多个随机种子及方差。
- [ ] 记录长度、截断率、重复率、正确率和多样性指标。
- [ ] 单列对 OPD 的差值，不把“相对竞争基线”写成“相对 OPD”。
- [ ] 报告教师服务的 GPU、吞吐、失败率和墙钟时间。
- [ ] 记录官方代码 commit、环境锁文件、权重哈希和本地修改。
- [ ] 对照论文、README、运行脚本和实际权重函数，核对最大 prompt 长度与 `TEACHER_PATH_PPL_POSITIVE` 的真实语义；用两个教师 PPL 的手算样例验证低 PPL 轨迹权重更大。

## 9. 一手来源

1. Zheng et al., [SCOPE: Signal-Calibrated On-Policy Distillation Enhancement with Dual-Path Adaptive Weighting](https://arxiv.org/abs/2604.10688), arXiv:2604.10688v2, 2026.
2. 作者官方实现：[machine981/SCOPE](https://github.com/machine981/SCOPE)。
3. Song and Zheng, [A Survey of On-Policy Distillation for Large Language Models](https://arxiv.org/abs/2604.00626), arXiv:2604.00626v4, 2026。该综述标注为 ongoing work，方法细节仍应回到对应一手论文。
4. Hübotter et al., [Reinforcement Learning via Self-Distillation](https://arxiv.org/abs/2601.20802), arXiv:2601.20802v2, 2026。
5. Zhao et al., [Self-Distilled Reasoner: On-Policy Self-Distillation for Large Language Models](https://arxiv.org/abs/2601.18734), arXiv:2601.18734v3, 2026。
