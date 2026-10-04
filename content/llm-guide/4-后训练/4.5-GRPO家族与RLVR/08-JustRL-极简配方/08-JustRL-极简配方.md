---
title: "08 · JustRL: 1.5B 数学 RL 的极简配方"
published: true
tags: ["JustRL", "GRPO", "DAPO", "RLVR", "clip-higher", "1.5B"]
excerpt: "JustRL 用 veRL 默认的 GRPO, DAPO 规则验证器和 clip higher, 单阶段, 超参固定, 上下文 16k. 两个蒸馏过的 1.5B 模型上九项数学平均分别到 54.87% 和 64.32%, 略高于多阶段的 ProRL-V2 和 QuestA, token 预算分别约为对方的 1/2 和 1/2.4."
---
# 08 · JustRL: 1.5B 数学 RL 的极简配方

> 相关阅读: [4.4.6 其他策略梯度](../4.5-GRPO家族与RLVR.md) · [02-GRPO](../01-GRPO/01-GRPO.md) · [01-GxPO 结构扩展](../07-GxPO结构扩展/07-GxPO结构扩展.md) · [01-ReMax](../../4.4-强化学习基础/06-ReMax-贪婪基线/06-ReMax-贪婪基线.md) · [03-Dr.GRPO](../02-DrGRPO-去标准差/02-DrGRPO-去标准差.md) · [4.4.7 RLVR 的局限性](../09-RLVR的局限性与探索边界/09-RLVR的局限性与探索边界.md)

材料是 He 等的 *JustRL: Scaling a 1.5B LLM with a Simple RL Recipe* (arXiv:2512.16649), 代码在 [thunlp/JustRL](https://github.com/thunlp/JustRL), 权重在 Hugging Face 的 `hbx/justrl` 集合. 问题是 1.5B 数学 RL 中层层叠加的训练技巧是否必要.

## 1. 问题: 小模型 RL 的调度越叠越多

o1 和 DeepSeek-R1 让可验证奖励的强化学习 (RLVR) 成为大模型推理训练的主路径. 1.5B 这一档, 工业界更常用蒸馏: 用更大模型的轨迹做 SFT, 稳定, 涨分快. Qwen3 的强到弱蒸馏, DeepSeek-R1 的 distill 系列都是这条路. 蒸馏的上限是老师; 蒸馏饱和后, RL 是继续提升的手段.

社区对小模型 RL 的印象是不稳定. 过去一年的做法高度相似: 多阶段拉长上下文, 动态调温度, 长度惩罚, 重置参考模型, 在线滤题, 课程学习. 论文 Table 1 把这些技巧归成九列: 熵控制, 扫超参, 改训练 prompt, 重置 KL 参考, 长度控制, 自适应温度, rollout 抢救, 动态采样, 拆分训练阶段. 具体例子: STILL-3 扫超参并重置参考模型; DeepScaleR 三阶段, 上下文 $8\mathrm{k}\to16\mathrm{k}\to24\mathrm{k}$; FastCuRL 五阶段, 在 CoT 压缩 (长到短) 和扩展 (短到长) 之间交替, 每段用不同的数据, batch 大小和 rollout 数; ProRL 八阶段加长度惩罚, ProRL-V2 加到九阶段; BroRL 在约 3K 步 ProRL 训练之后把每题 rollout 加到数百 (表中为 512); Nemotron 骨干上的 QuestA 用大模型写的部分解答当提示, 按难度分阶段; Qwen3-1.7B 上的 POLARIS 分三阶段, 用动态筛题集中训难题, 配合自适应温度, 评测阶段再做上下文外推; e3 同样多阶段, 上下文长度逐段变化, 也依赖评测阶段的长度外推.

每篇都报告自己解决了某种不稳定, 比如奖励塌缩, 熵漂移, 长度爆炸. 但基线本身往往已经叠了前一篇的调度, 新技巧是加在一个已经很复杂的栈上. 这样就分不清新方法解决的是 RL 本身的问题, 还是上一层调度引入的问题. JustRL 问的就是复杂度是否必要. Table 1 中 JustRL 两行只勾了熵控制一列, 其余八列为空.

**骨干**: 两个蒸馏过的 1.5B. DeepSeek-R1-Distill-Qwen-1.5B 训 4380 步得到 JustRL-DeepSeek; OpenMath-Nemotron-1.5B 训 3440 步得到 JustRL-Nemotron. 每条线 32 张 A800-80GB, 约 15 天, 折合约 $32\times15\times24\approx1.15\times10^{4}$ GPU 小时. 两条线用同一套超参, 不按模型重调, 论文以此说明配方对初始化不敏感.

## 2. 配方: veRL 默认 GRPO 加二元奖励

算法是 veRL 中 GRPO 的默认实现. 同一道题采 $G=8$ 条回答, 组内做 $z$-score:

$$
\hat{A}_{i}=\frac{r_i-\mathrm{mean}(\mathbf{r})}{\mathrm{std}(\mathbf{r})}, \tag{1}
$$

$r_i$ 是第 $i$ 条回答的奖励, $\mathbf{r}$ 是组内 8 个奖励. 奖励来自 DAPO 的轻量规则验证器, 只看 `\boxed{}` 里的最终答案, 判对错, 不调用 SymPy. 论文给的理由是符号库会增加开销, 规则验证器的假阴性留到评测阶段用 CompassVerifier-3B 补. 训练曲线上的平均奖励从约 $-0.6$ 升到 $+0.4$, 说明对错被编码成有正有负的标量, 与 DAPO 的 $\pm1$ 一致. 奖励只给在整段结局上, 没有过程监督.

GRPO 原文在目标上挂了 KL, JustRL 关掉它. Table 2 中 Use KL Loss 与 Use Entropy Regularization 都是 No. 目标只剩组内优势加 clip:

$$
\mathcal{J}(\theta)=\mathbb{E}\Bigg[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t}\min\big(\eta_{i,t}\hat{A}_{i},\;\mathrm{clip}(\eta_{i,t},\,0.8,\,1.28)\,\hat{A}_{i}\big)\Bigg], \tag{2}
$$

$\eta_{i,t}=\pi_\theta(o_{i,t}\mid q,o_{i,<t})/\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})$ 是 token 级重要性比率, $o_i$ 是第 $i$ 条回答, $q$ 是题目. 普通 GRPO 的对称窗 $\varepsilon=0.2$ 对应 $[0.8,1.2]$. JustRL 把上沿改成 1.28, 即 DAPO 的 clip higher: $\varepsilon_{\mathrm{low}}=0.2$, $\varepsilon_{\mathrm{high}}=0.28$.

对称 clip 下, 比率超过 1.2 的部分被截掉. 正确回答里起始概率很低的 token, 即使优势为正也涨不上去, 熵于是下降. 上沿放到 1.28 给正优势留出空间; 负优势一侧仍是 0.8, 错误回答不会被压得过狠. JustRL 不另加熵奖励, 维持熵靠的就是这个不对称窗. Table 1 给 JustRL 勾了熵控制, 与 Table 2 的「不用熵正则」并不冲突: 勾的是 clip 上沿, 损失里没有 $\lambda\mathcal{H}[\pi]$ 这一项.

论文 §3.1 列了保持简单的五条:

1. 单阶段, 不换上下文长度, 不切课程, 中途不换参考模型.
2. 超参固定, 不调温度, 不改 batch, 不重置 KL 参考.
3. 数据用 DAPO-Math-17k, 不做离线难度过滤, 不做在线动态采样.
4. prompt 后缀不搜索, 固定为「Please reason step by step, and put your final answer within `\boxed{}`」.
5. 不加长度惩罚, 只把最大上下文设为 16k, 其中 prompt 上限 1k, 回答上限 15k.

**不做动态采样的代价**: 8 条全对或全错时, 式 (1) 的 $r_i$ 全相同, 优势全为 0, 这道题在这一步没有梯度. POLARIS 和 ProRL 会滤掉这类题再补采. JustRL 保留这些零优势组, 不补采. 设一个 batch 中零优势组的比例为 $\rho_0$, 有效样本数就是 $(1-\rho_0)\times256\times8$, 每步的有效 batch 随训练波动. JustRL 的取舍是接受这部分浪费, 换掉补采带来的额外生成和调度. 训练 batch 256, PPO mini-batch 64, 每轮 rollout 做 4 次内层更新.

Table 2 是配方的全部超参, 两条骨干共用:

| 项 | 值 |
|----|----|
| Advantage | GRPO |
| Use KL Loss | No |
| Use Entropy Regularization | No |
| Train BS | 256 |
| Max Prompt | 1k |
| Max Response | 15k |
| PPO Mini | 64 |
| Micro/GPU | 1 |
| Clip Ratio | $[0.8,\,1.28]$ |
| lr | $1\times 10^{-6}$ 恒定 |
| Temperature | 1.0 |
| Rollout $N$ | 8 |
| Reward | DAPO 规则验证器 |

**评测**: 九项基准, AIME 2024, AIME 2025, AMC 2023, MATH-500, Minerva, OlympiadBench, HMMT Feb 2025, CMIMC 2025, BRUMO 2025. 脚本沿用 POLARIS, 报 Pass@1; MATH-500, Minerva, OlympiadBench 每题 4 次, 其余每题 32 次. 温度 0.7, top-p 0.9, 最长生成 32k, 再用 CompassVerifier-3B 补规则验证器的假阴性. 训练环是温度 1.0, 最长 16k, 两套设置分开.

![JustRL 单阶段: 数据, rollout, 验证器, clip 更新](./images/fig-justrl-single-stage.png)

> 图 1: 从左到右四步. DAPO-Math-17k 进入 GRPO rollout ($N=8$, 温度 1.0), DAPO 规则验证器给二元分, 再按 $\mathrm{clip}[0.8,1.28]$, 学习率 $1\times10^{-6}$ 更新策略. 虚线框标出单阶段, 16k, 固定超参.

**图 1 解析**

- 奶油色框是数据, 17k 题, 不做离线过滤. 箭头标签 sample.
- 青绿框采 8 条, 即 GRPO 的一组.
- 冰蓝框是冻结的规则验证器, 输出 0/1, 不用 SymPy. 箭头标签 score.
- 鲑粉框做 clip-higher 更新, 没有 KL 项, 没有熵奖励.
- 底注写明两条骨干共用超参. 训练曲线的数字在第 7 节.

和同夹的 [01-ReMax](../../4.4-强化学习基础/06-ReMax-贪婪基线/06-ReMax-贪婪基线.md) 对比: ReMax 减贪心回答的奖励, 没有组, 没有 clip; JustRL 有组, 有 clip, 没有价值网络, 仍是 GRPO.

## 3. 三个算例: 优势, 窗口, 零优势组

配方里的每个选择都可以用简单的数算一遍. 以下数值由式 (1)(2) 直接推出.

**二元奖励下的优势**. 奖励只取两个值时, 设一组 8 条里答对的比例是 $\hat p$, 按总体标准差计, 组内标准差为 $\sqrt{\hat p(1-\hat p)}$ 乘以两个奖励值之差, 式 (1) 化简为

$$
\hat{A}_{\mathrm{correct}}=\sqrt{\frac{1-\hat p}{\hat p}},\qquad
\hat{A}_{\mathrm{wrong}}=-\sqrt{\frac{\hat p}{1-\hat p}}. \tag{3}
$$

结果与奖励编码成 $\{0,1\}$ 还是 $\{-1,+1\}$ 无关. 8 条中答对 1 条, $\hat p=1/8$, 答对的那条优势 $\sqrt7\approx2.65$, 答错的每条 $-1/\sqrt7\approx-0.38$; 答对 7 条时正好反过来. 难题上偶然答对的那一条得到很大的正权重, 易题上偶然答错的那一条得到很大的负权重. Dr.GRPO 所说的难度偏差就是指除以标准差带来的这种放大, JustRL 保留了它.

**clip 上沿对低概率 token 的作用**. 一次更新里, 正优势 token 的比率超过 $1+\varepsilon_{\mathrm{high}}$ 后梯度为零, 所以单轮 rollout 内这个 token 的概率最多涨到 $(1+\varepsilon_{\mathrm{high}})$ 倍. 设某个关键 token 的概率从 0.01 要涨到 0.5:

$$
k_{\min}=\frac{\ln(0.5/0.01)}{\ln(1+\varepsilon_{\mathrm{high}})},\qquad
k_{\min}\big|_{\varepsilon_{\mathrm{high}}=0.2}\approx21.5,\quad
k_{\min}\big|_{\varepsilon_{\mathrm{high}}=0.28}\approx15.8. \tag{4}
$$

$k_{\min}$ 是所需的最少 rollout 轮数下界. 上沿从 1.2 放到 1.28, 下界从约 22 轮降到约 16 轮. 实际增长远慢于这个下界, 因为梯度大小还取决于优势和学习率, 但上沿决定了每轮最多能走多远. 对高概率 token 这一限制几乎不起作用: 概率 0.9 的 token, 1.2 倍已经超过 1. 负优势一侧同理, 下沿 0.8 表示单轮内概率最多降到 0.8 倍, 把一个 token 从 0.5 压到 0.01 至少要 $\ln50/\ln1.25\approx17.5$ 轮, JustRL 没有改动这一侧.

**零优势组的比例**. 设某题的真实准确率为 $p$, 8 条独立采样全对或全错的概率是 $p^8+(1-p)^8$. $p=0.5$ 时约 0.008; $p=0.8$ 时约 0.17; $p=0.9$ 时约 0.43; $p=0.95$ 时约 0.66. 训练越成功, 题库里准确率高的题越多, 零优势组的比例越高. POLARIS 的 50% 过滤率大致对应 $p$ 在 0.9 到 0.95 之间的情形. JustRL 不补采, 这些组直接贡献零梯度, 等价于有效 batch 随训练缩小; 用 $N=16$ 时同样 $p=0.9$ 的全同概率降到约 0.19, 这是 ProRL 系增大 rollout 数的一个直接收益.

## 4. 算力: 多阶段与单阶段的 token 预算

多阶段方法的共同点是中途改规则. DeepScaleR 三次抬上下文; ProRL 系把训练切成八到九段, 长度惩罚, rollout 数和上下文来回调整; QuestA 还要用大模型写好的部分解答当提示, 相当于额外造一份课程数据. JustRL 从头到尾一个 16k 上下文.

![多阶段流水线对照 JustRL 16k 直通](./images/fig-justrl-vs-multistage.png)

> 图 2: 上排多阶段, 下排单一 16k. DeepScaleR 三格从 8k 接到 16k 再接到 24k; 右侧单独一格是 ProRL 九阶段, 与 24k 之间没有连线. 下排 DAPO-Math-17k 进入固定 16k 的 GRPO, 同一套超参跑两条骨干.

**图 2 解析**

- 上带浅橙色是对照. 三格之间的实线只表示 DeepScaleR 自己的上下文上调.
- 紫格 ProRL 是并列的另一种调度, 与 DeepScaleR 的 24k 之间没有先后关系.
- 下带浅薄荷色, 中间格写「16k max throughout / no stage switch」.
- 两带之间没有竖向箭头, 上下是对照关系.

论文按 token 预算比较算力. 用了动态采样的方法按 POLARIS 的估计取 50% 过滤率; 即使把过滤率当成 0, JustRL 的预算也不更高, 所以这是保守估计. 被滤掉的题多是 8/8 或 0/8, 正是式 (1) 给不出优势的那些.

DeepSeek 骨干一线, Table 4:

| 模型 | 动态采样 | 步数 | BS | $N$ | 上下文 | Token 预算 |
|------|----------|-----:|---:|----:|--------|--------------|
| DeepScaleR | 否 | 1750 | 128 | 8 | $8\mathrm{k}\to 16\mathrm{k}\to 24\mathrm{k}$ | $2.2\times 10^{6}\mathrm{k}$ |
| ProRL-V1 | 是 | 2450 | 256 | $16\to 32\to 16$ | $8\mathrm{k}\to 16\mathrm{k}$ | $2.1\times 10^{8}\mathrm{k}$ |
| ProRL-V2 | 是 | +1000 | 256 | 同上 | $8\mathrm{k}\to 16\mathrm{k}\to 8\mathrm{k}$ | $2.8\times 10^{8}\mathrm{k}$ |
| BroRL | 是 | +191 | 128 | 512 | 16k | $6.8\times 10^{8}\mathrm{k}$ |
| JustRL-DeepSeek | 否 | 4380 | 256 | 8 | 16k | $1.4\times 10^{8}\mathrm{k}$ |

ProRL-V2 接在 ProRL-V1 的 2450 步之后再训 1000 步, BroRL 再接在 ProRL-V2 之后训 191 步, 三者是同一条加长链. JustRL-DeepSeek 的 $1.4\times10^{8}\mathrm{k}$ 约为 ProRL-V2 的一半; BroRL 的 $6.8\times10^{8}\mathrm{k}$ 约为 JustRL 的 4.9 倍. JustRL 的步数更多 (4380 对 ProRL-V1 加 V2 合计 3450), 但每步更省: $N=8$ 对 16 或 32, 没有过滤后的补采. 按每步生成的回答条数算: JustRL 每步 $256\times8=2048$ 条; ProRL 在 $N=16$ 阶段, 50% 过滤率下为凑满 256 道有效题要采约 512 道, 每步约 $512\times16=8192$ 条, 是 JustRL 的 4 倍, $N=32$ 阶段再翻倍. 步数上 JustRL 多出约 27%, 总量仍少一半. DeepScaleR 的 $2.2\times10^{6}\mathrm{k}$ 比其他几项少两个数量级, 它是早期的短程三阶段训练, 规模不在一档.

Nemotron 一线, Table 6: QuestA 2000 步, BS 128, $N=16$, 上下文 32k, 带动态采样, 预算 $2.6\times10^{8}\mathrm{k}$; JustRL-Nemotron 3440 步, 16k, $N=8$, 预算 $1.1\times10^{8}\mathrm{k}$, 约少 2.4 倍.

token 预算可以粗略写成 步数 $\times$ BS $\times$ $N$ $\times$ 平均长度 $/(1-\text{过滤率})$. 用 JustRL-DeepSeek 验算: $4380\times256\times8\approx9.0\times10^{6}$ 条回答, 预算 $1.4\times10^{8}\mathrm{k}$ token 对应平均每条约 15.6k token, 接近 16k 上限, 而训练中实际平均长度后期只有 4000 至 5000. 由此看, 预算大致是按上下文上限估算的, 比较的是各方法配置上的开销上限.

## 5. DeepSeek 骨干: 九项平均 54.87

Figure 1a 是 AIME 2024 的 avg@32 训练监控曲线: 骨干约 28%, JustRL-DeepSeek 训 4000 步后约 58%. Table 3 用统一协议复测, AIME24 一列是骨干 29.90, JustRL-DeepSeek 52.60. 监控曲线用训练上下文, 终局表用 32k 生成和 CompassVerifier-3B, 两者口径不同, 横向比较只用表.

Table 3 (MATH, Minerva, Olympiad 为 @4, 其余 @32):

| 模型 | AIME24 | AIME25 | AMC23 | MATH | Minerva | Olympiad | HMMT | BRUMO | CMIMC | 平均 |
|------|--------:|--------:|--------:|------:|---------:|----------:|------:|--------:|------:|------:|
| Backbone | 29.90 | 22.40 | 63.82 | 84.90 | 34.65 | 45.95 | 13.44 | 30.94 | 12.89 | 37.65 |
| DeepScaleR | 40.21 | 28.65 | 73.83 | 89.30 | 39.34 | 52.79 | 18.96 | 40.00 | 21.00 | 44.88 |
| ProRL-V2 | 51.87 | 35.73 | 88.75 | 92.00 | 49.03 | 67.84 | 19.38 | 47.29 | 25.86 | 53.08 |
| BroRL\* | 57.50 | 36.88 | | 92.14 | 49.08 | 61.54 | | | | |
| JustRL-DeepSeek | 52.60 | 38.75 | 91.02 | 91.65 | 51.47 | 67.99 | 21.98 | 52.71 | 25.63 | 54.87 |

JustRL-DeepSeek 在 AIME25, AMC23, Minerva, Olympiad, HMMT, BRUMO 六项领先. MATH-500 (92.00) 和 CMIMC (25.86) 是 ProRL-V2 略高. AIME24 单列 BroRL 的 57.50 更高, 但带星号: 分数是官方报告, 模型未发布, 若干基准缺失, 平均算不出来.

相对骨干, 平均分从 37.65 到 54.87, 涨约 17.2 个点. DeepScaleR 先到 44.88, ProRL-V2 到 53.08; JustRL 用约一半 token, 不切阶段, 平均再高 1.79. 差距不大, 论文的论点是极简配方已经够用. Takeaway 1 的表述是: 单阶段固定超参, 用约一半算力超过更复杂的做法, 4000 多步训练中没有出现需要人工干预的情况. 这一结论限于 1.5B, 数学, 这条骨干.

## 6. Nemotron 骨干: 平均略高, AIME24 略低

同一套超参换到 OpenMath-Nemotron-1.5B, 训 3440 步. Figure 1b 的 AIME24 监控曲线训到 70% 以上. 九项平均见 Table 5: 骨干 56.74, QuestA 63.81, JustRL-Nemotron 64.32.

| 模型 | AIME24 | AIME25 | AMC23 | MATH | Minerva | Olympiad | HMMT | BRUMO | CMIMC | 平均 |
|------|--------:|--------:|--------:|------:|---------:|----------:|------:|--------:|------:|------:|
| Backbone | 58.75 | 48.44 | 90.55 | 92.40 | 26.93 | 71.70 | 30.10 | 61.67 | 30.08 | 56.74 |
| QuestA | 71.56 | 62.08 | 93.44 | 92.95 | 32.08 | 72.28 | 40.94 | 67.50 | 41.48 | 63.81 |
| JustRL-Nemotron | 69.69 | 62.92 | 96.02 | 94.15 | 30.24 | 76.59 | 40.63 | 66.88 | 41.72 | 64.32 |

JustRL-Nemotron 在 AIME25, AMC23, MATH, Olympiad, CMIMC 五项领先; AIME24, Minerva, HMMT, BRUMO 四项是 QuestA 略高. 平均高 0.51. 摘要里的 64.3% 是九项平均, 不能当 AIME 分数引用.

这些差距有多大意义, 可以按评测协议粗估. AIME 一套 30 题, 每题采 32 次取平均. 只看有限采样带来的噪声, 若每题准确率在 0.5 附近, 单题 avg@32 的方差约 $0.25/32$, 30 题平均的标准误约 $\sqrt{30\times0.25/32}/30\approx1.6$ 个百分点. AIME24 上 69.69 与 71.56 相差 1.87, 与这个量级相当. 如果再把 30 道题本身看作从题目分布中抽出的样本, 标准误约 $\sqrt{0.25/30}\approx9$ 个百分点, 单项基准的排序就更不可靠. 九项平均把多个基准合在一起, 噪声小一些, 用它做主要比较更稳妥. 但两条线上平均分的领先幅度 (1.79 与 0.51) 也都不大, 论文的主张落在「用更少预算达到同一水平」, 而非显著超越.

QuestA 的课程有额外成本: 题干要拼上大模型写的部分解答, 按难度分阶段, 除了问答对还需要完整轨迹. JustRL 只用 DAPO-Math-17k 的问答对. 论文没有否定 question augmentation, 只说明在这条 1.5B 线上, 不造课程也能达到同一水平, token 约少 2.4 倍.

两条骨干起点差别很大: DeepSeek 蒸馏模型九项平均 37.65, Nemotron 已有 56.74. 论文 Takeaway 2 的表述是: 同一配方不调任何超参, 把 OpenMath-Nemotron-1.5B 推到与使用课程学习和问题增强的最好结果相当的水平. 配方不变, 两边都涨, 这是论文对「只对某个初始化有效」的回应. 规模和任务上的推广, 这两组实验回答不了: 没有 7B 以上, 没有代码, 没有通用问答.

## 7. 训练动态

复杂技巧的常见动机是三类问题: 熵塌缩或漂移, 奖励平台, 长度爆炸. JustRL-DeepSeek 的 Figure 2 给出约 4000 步的三条监控曲线:

| 监控量 | Figure 2 的读数 |
|------|----------------------|
| 熵 | 全程大约在 1.2 至 1.4 之间振荡, 后期范围约 1.0 至 1.6. 没有单向上漂, 也没有过早塌缩. |
| 平均奖励 | 从约 $-0.6$ 升到约 $+0.4$, 有噪声但趋势向上, 没有长平台或骤降. |
| 回答长度 | 起始约 8000 token (图注写约 7000), 约 1000 步时降到 4000 至 5000, 之后稳定. 没有显式长度惩罚. |

**奖励**: 若奖励按 DAPO 编码为答对 $+1$, 答错 $-1$, 平均奖励 $m$ 对应的训练准确率是 $(m+1)/2$. $-0.6$ 对应约 20%, $+0.4$ 对应约 70%. 训练题来自 DAPO-Math-17k, 准确率从两成升到七成, 说明后期有相当一部分题进入第 3 节算例中零优势组比例很高的区间.

**熵**: 作者把熵能维持归因于 clip higher. 没有 KL 约束, 没有熵奖励, 策略在 4000 步里仍保持探索. ProRL, STILL 一类方法把 KL 过大当作需要干预的信号并重置参考模型; JustRL 直接不挂 KL, 也就没有这一问题. 论文还列了其他方法引入技巧的动机: ProRL-V2 观察到长度漂移后加了按日程变化的长度惩罚; BroRL 遇到平台后把 rollout 加到数百. 作者也说明, 他们没有算力做系统的对照实验, 这里的对比只能借助文献.

**长度**: 起始回答冗长, 16k 上限在, 但平均长度自己降到 4k 至 5k. 论文引用 DLER (arXiv:2510.15110) 的观点: 显式长度惩罚会造成对抗压力, 模型学会规避惩罚. 这里没有惩罚项, 长度下降是模型发现较短的回答也能答对后的结果.

**训练与评测长度**: 评测允许生成 32k, 训练回答上限 15k. POLARIS 把「短训长评」作为一项技巧, JustRL 只在评测协议中放开 32k.

论文也指出, 这些曲线证明不了简单配方总是更稳, 也分不清起作用的是超参, 数据, 验证器还是三者的组合. 能确认的是, 最小配方的训练动态没有出现那些通常需要干预的现象.

## 8. 消融: 加标准技巧, 平台反而更低

从 JustRL-DeepSeek 的配方出发, 在 DeepSeek 骨干上再训 3000 多步, 比较两种改动. 第一种加 DAPO 式 overlong penalty, 作用在最后 4k token 上. 第二种在此基础上换用 DeepScaleR 的宽松验证器, 减少假阴性.

Figure 3 给出 AIME24 与熵. 约 2000 步之前三条曲线差别不大, 之后才分开.

| 配方 | AIME24 平台 (约) | 熵 (约) |
|------|------------------:|----------|
| JustRL 基线 | 55% | 1.2 至 1.4 |
| + overlong penalty | 50% | 0.5 至 0.6 |
| + penalty + 宽松验证器 | 45% | 0.5 至 0.6 |

按 DAPO 的软超长惩罚公式, 回答上限 15k, 缓冲 4k, 惩罚区间是 11k 到 15k: 长度 $\ell$ 落在这一段时奖励加上 $(11\mathrm{k}-\ell)/4\mathrm{k}$, 13k 的回答扣 0.5, 到 15k 扣满 1. 训练初期平均长度约 8000, 长尾样本正好落进惩罚区. 二元奖励下答对是 $+1$, 一条 13k 的正确回答扣完只剩 0.5, 与同组较短的正确回答拉开差距, 组内优势随之改变.

**长度惩罚**: 本意是让模型早点收尾. 实际效果是探索先被压低, 模型在还没找到能得分的推理方式之前, 短回答已经成为主要模式.

**宽松验证器**: 本意是减少正确答案被规则误判. 换上后结果更差. 论文给了两个推测: 宽松验证器让满分样本变多, 组内相对优势的区分度下降; 严格验证器迫使模型把格式和计算做规范, 宽松验证器在外部容忍了格式错误, 模型内部的这部分压力消失. 作者做过奖励尺度归一, 排除了单纯的量纲问题.

overlong penalty 在 DAPO 自己的设定 (32B, 有 token 级损失) 中有效, 迁移到这条 1.5B, 16k, 无 KL 的配方中却有害. 两种合理改动都让结果变差, 说明这个配方的平衡比较脆弱. 消融只做了这两项; 课程学习, 自适应温度, 参考重置, 其他验证器, 数据增强都没有测. 论文的建议是先观察到具体问题, 再针对它加组件.

## 9. 与 GRPO, ReMax, Dr.GRPO 的关系

**与 GRPO**: JustRL 用的就是组内 $z$-score 加 clip, 改了三处工程选择: 去掉 KL, clip 上沿到 1.28, 奖励换成 DAPO 规则分. 没有新的优势定义.

**与 DAPO**: JustRL 从 DAPO 拿了三样东西: 规则验证器, DAPO-Math-17k 数据, clip higher. DAPO 的另外三项, 即动态采样, token 级损失, 软超长惩罚, 都没有用; 目标里保留的是序列内先平均的 $1/|o_i|$. DAPO 在 Qwen2.5-32B base 上的递进实验里, 动态采样贡献最大 (42 到 50), 软超长惩罚加 3 分; 到 JustRL 这条 1.5B 蒸馏线上, 消融显示超长惩罚有害. 同一组技巧在不同骨干, 规模, 上下文长度下的效果方向可以相反.

序列级重要性比率等结构改动见 [4.4.5](../4.5-GRPO家族与RLVR.md).

**与 ReMax**: 两者都在做减法. ReMax 去掉价值网络, 减贪心回答的奖励; JustRL 去掉调度, 保留组. ReMax 的主实验是 7B 对话加奖励模型, JustRL 是 1.5B 数学加规则分.

**与 Dr.GRPO**: JustRL 保留组内标准差和 $1/|o_i|$, Dr.GRPO 把两项都删掉, clip 仍对称 $\varepsilon=0.2$. Dr.GRPO 的 Oat-Zero-7B 在 AIME 2024 上 43.3% 是 7B 单项分数, 与这里的九项平均不可比.

两种写法的差别可以用式 (3) 量化. 奖励取 $\{0,1\}$ 时, Dr.GRPO 不除标准差, 答对一条的优势是 $1-\hat p$; JustRL 的优势是它除以 $\sqrt{\hat p(1-\hat p)}$. 两者之比 $1/\sqrt{\hat p(1-\hat p)}$ 在 $\hat p=1/2$ 时为 2, 在 $\hat p=1/8$ 时约 3.02. 也就是说, 相对于对错各半的组, JustRL 给 1/8 或 7/8 这种极端组的权重多放大约 1.5 倍. 长度项同理: 式 (2) 里每个 token 的权重是 $\hat A_i/|o_i|$, 一条 8000 token 的错误回答, 每个 token 受到的惩罚只有 4000 token 错误回答的一半. Dr.GRPO 认为这会让错误回答越拉越长; JustRL 的长度曲线在蒸馏骨干上反而下降, 两个结论建立在不同的起点上.

## 10. 边界

论文 Limitations 列出: 只做了 1.5B 数学; 代码, 通用问答, 更大模型没有数据; 无法区分超参, 验证器, DAPO-Math-17k 哪个是主因; 相对 ProRL 和 QuestA 更省, 但对资源少的团队仍然贵, 每条线 32 张 A800 训约 15 天; 训练再延长后是否需要加回技巧, 没有实验. 第 3 节的推算给出一个具体的观察点: 训练准确率已到约七成, 继续训下去, 准确率接近 0.9 的题越来越多, 这类题每步约四成的组没有梯度, 有效 batch 会持续缩小. 届时是补采, 换更难的题, 还是增大 $N$, 论文没有给出答案.

Discussion 中列出复杂度可能有用的情形: 算力极度受限, 遇到本配方没碰到的问题, 要突破当前上限, 奖励噪声更大的领域.

两个骨干都是蒸馏模型, 起点已经具备长 CoT 能力. 从基座直接做 RL 时, 熵和长度的行为可能完全不同, 例如 Dr.GRPO 在 Qwen2.5-Math 基座上观察到错误回答越写越长. 九项平均 54.87 和 64.32 依赖这两个骨干, DAPO-Math-17k 和 CompassVerifier 评测协议; 换验证器或采样次数, 或者把 Figure 1 的 58% 与 70% 以上的监控数字拿去横比, 结论都会变. AIME24 单项尤其不稳定, Nemotron 一线上 QuestA 反而更高.

## 参考文献

1. He, B., Qu, Z., Liu, Z., Chen, Y., Zuo, Y., Qian, C., Zhang, K., Chen, W., Xiao, C., Cui, G., Ding, N., & Liu, Z. (2025). [JustRL: Scaling a 1.5B LLM with a Simple RL Recipe](https://arxiv.org/abs/2512.16649). 代码 [thunlp/JustRL](https://github.com/thunlp/JustRL).
2. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).
3. Yu, Q., et al. (2025). [DAPO: An Open-Source LLM Reinforcement Learning System at Scale](https://arxiv.org/abs/2503.14476).
4. Sheng, G., et al. (2025). HybridFlow: A Flexible and Efficient RLHF Framework. *EuroSys*.
5. Liu, M., et al. (2025). [ProRL: Prolonged Reinforcement Learning Expands Reasoning Boundaries in Large Language Models](https://arxiv.org/abs/2505.24864).
6. Hu, J., et al. (2025). BroRL: Scaling Reinforcement Learning via Broadened Exploration.
7. Li, J., et al. (2025). QuestA: Expanding Reasoning Capacity in LLMs via Question Augmentation.
8. An, C., et al. (2025). POLARIS: A Post-Training Recipe for Scaling Reinforcement Learning on Advanced Reasoning Models.
9. Liu, S., et al. (2025). CompassVerifier: A Unified and Robust Verifier for Large Language Models.
10. Liu, Z., et al. (2025). [Part I: Tricks or Traps? A Deep Dive into RL for LLM Reasoning](https://arxiv.org/abs/2508.08221).
