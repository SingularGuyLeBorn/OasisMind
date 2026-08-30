---
title: "03 · Dr.GRPO：去长度与难度偏差"
date: 2026-08-31
as_of: 2026-08-31
tags: [DrGRPO, GRPO, R1-Zero, Aha, Qwen2.5, Oat-Zero]
---

# 03 Dr.GRPO：去长度与难度偏差

Dr. GRPO 不是新的组相对算法。Liu 等 *Understanding R1-Zero-Like Training: A Critical Perspective*（[arXiv:2503.20783](https://arxiv.org/abs/2503.20783)，Sea AI Lab）把 R1-Zero-like 拆成两块：基座和 RL。DeepSeek-V3-Base 已经会写 Aha、wait 这类自我修正；Qwen2.5 基座无模板平均也能到 38.2，作者怀疑预训练把问答拼在一起训过。GRPO 目标另有两项系统偏差：token 损失里的 $1/|o_i|$（长度偏差），优势里的组标准差（难度偏差）。两项都拿掉，clip、组采样、0/1 结局奖励不动，才叫 GRPO Done Right。极简配方是 Qwen2.5-Math-7B + Dr.GRPO + MATH level 3–5 + Qwen-Math 模板，AIME 2024 **43.3%**（7B），大约 27 小时、8×A100。邻居 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 钉带 $\mathrm{std}$ 的组内 $z$-score；[02-JustRL](../02-JustRL-极简配方/02-JustRL-极简配方.md) 钉 1.5B 单阶段固定超参，九项平均不要抄进本篇。不是 Shao 等 DeepSeekMath 原文。不是 DAPO。不是「所有规模都该拆掉标准差」。

## 1. R1-Zero-like 先拆成基座再拆 RL

DeepSeek-R1-Zero 把后训练收成一句：基座上直接做 RL，前面不加 SFT。卖点是简单，外加一条训练曲线：奖励涨、回复变长，再配上所谓 Aha moment。社区复现多半拿 Qwen2.5 当基座，再套 GRPO 或某份 PPO 实现。这篇要把两块分开看。基座这块问：模板一戴，模型是在答题还是在续写；有没有探索出能打分的轨迹；自我修正是不是 RL 才教出来的。RL 这块问：GRPO 的目标是不是无偏，变长到底有多少来自优化器自己。

记号沿用 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md)。问题 $q$，旧策略采一组 $\{o_1,\ldots,o_G\}$，回报 $R(q,o_i)$ 在推理设定里通常就是结局可验证奖励。本篇 $\beta=0$，规则验证器当 $r$，参考模型那份 KL 从目标里拿掉。论文写得很干：分布外移的担心主要来自学出来的奖励模型；规则分没有那层顾虑，省掉 $\pi_{\mathrm{ref}}$ 也省显存。

模板试了三种。R1 模板把思考和答案塞进 `<think>` / `<answer>`。Qwen-Math 模板是 chat 包一层，系统句要求逐步推理、最终答案放进 `\boxed{}`。第三种是裸题干，一个字的包装都没有。题来自 MATH 训练集抽的 500 道。无模板时，用 GPT-4o-mini 判这条回复像答题还是像续写，答题比例当作「问答应答率」。再给 R1 和 Qwen-Math 各套一次，挑该模型应答率最高的那套，用 pass@8 看基座政策探不探得出能打分的轨迹。

Llama 和 DeepSeek 戴上合适的 R1 模板，应答率往上走。Qwen2.5 反过来：无模板应答率 100%，模板一戴反而掉。DeepSeek-V3-Base 无模板应答率最低，作者把它写成「几乎纯基座」。中间那张 pass@8：测过的基座都探得出奖励，Qwen2.5 最好，连 685B 的 V3-Base 也没压过它。这能部分解释 2025 年初开源 R1-Zero 项目扎堆选 Qwen。探不出一条对的轨迹，RL 没有奖励信号，后面的优化器争论都是空的。

## 2. Qwen2.5 无模板更强，可能是预训练偏差

Qwen2.5 无模板就会答题，作者又拿 Qwen2.5-Math 在五份卷上做 greedy，最长 3000 token。对照是传统 4-shot、R1 模板、Qwen-Math 模板、无模板。HTML Table 1 原样抄在下面。

| 基座 + 模板 | AIME24 | AMC | MATH500 | Minerva | Olympiad | 平均 |
|-------------|--------:|----:|--------:|--------:|---------:|-----:|
| Qwen2.5-Math-1.5B 4-shot | 0.0 | 20.0 | 50.4 | 12.1 | 15.9 | 19.7 |
| R1 模板 | 0.0 | 9.6 | 21.2 | 6.6 | 2.2 | 7.9 |
| Qwen 模板 | 20.0 | 32.5 | 33.0 | 12.5 | 22.8 | 24.2 |
| 无模板 | 16.7 | 43.4 | 61.8 | 15.1 | 28.4 | 33.1 |
| Qwen2.5-Math-7B 4-shot | 3.3 | 22.5 | 61.6 | 10.7 | 20.9 | 23.8 |
| R1 模板 | 0.0 | 0.0 | 0.0 | 0.0 | 0.1 | 0.0 |
| Qwen 模板 | 16.7 | 38.6 | 50.6 | 9.9 | 16.6 | 26.5 |
| 无模板 | 0.2 | 45.8 | 69.0 | 21.3 | 34.7 | 38.2 |

相对 4-shot，无模板把平均抬了大约 60%：1.5B 从 19.7 到 33.1，7B 从 23.8 到 38.2。R1 模板在 7B 上把五份卷打到接近 0。Qwen2.5-Math 技术报告写过，预训练混了 chat 模型的问答对。作者的假说是直接最大化 $\log p_\theta(q;o)$，把题和答拼成一段续写。假说若成立，拿 Qwen2.5 去「复现」DeepSeek-R1-Zero 要更小心：无模板时基座已经有 SFT 的味道。

7B 无模板 AIME24 那一格 HTML 写的是 **0.2**，同一行 MATH500 却是 69.0、平均 38.2。AIME 30 题，0.2% 对不上整数题数；这里按 HTML 抄 0.2，不写成 20.0。平均涨、AIME 单列可以不同向。引用时写「无模板平均 38.2」，不要把 0.2 说成 AIME 的主成绩。

Takeaway 写在 §2.1：模板的作用是把续写模型拐成答题政策。基座在 RL 之前就已经会做题。Qwen2.5 那条约 60% 是「扔掉模板」换来的，不是 RL 换来的。把复现曲线上的涨分全记在 GRPO 头上，基座那一截被吞掉了。

## 3. Aha 在 V3-Base 里已经出现

开源复现里有人说过：基座已经会写 recheck、wait，谈不上 RL 才涌现的 Aha。那些实验没用 DeepSeek-V3-Base，而真 R1-Zero 就是从它 RL 出来的。这篇补了这块：自己托管 V3-Base-685B，R1 模板，同一批 500 道 MATH。Fig. 3 右侧显示自我修正次数相当可观。附录例子里能看到 Aha、wait。

关键词检测单独用会误伤。wait、try again 经常只是口头禅。论文把词表收得很窄：recheck、rethink、reassess、reevaluate、re-evaluate、reevaluation、re-examine、reexamine、reconsider、reanalyze、double-check、check again、think again、verify again、go over the steps。不同家族偏好不同词。Qwen2.5 爱 check again / double-check；DeepSeek 几乎不写 re-evaluate；Llama 爱 think again。作者把这种差别归到预训练语料，尤其是推理和数学那一截。

关键词仍会假阳，LLM 裁判也会把长回复误判成自我修正。论文用两者交叉验证：词表能滤掉裁判的假阳，裁判能补词表看不见的隐式回看。不要把「检出 Aha」读成「RL 教出了新技能」。

R1-Zero 训完，自我修正更勤，但和准确率不是正相关。附录 F 把同一题 100 次采样拆成「有自我修正 / 没有」，大约一半题目上有修正的那组并不更准。训练期探索可能仍然受益，推理期别把 wait 当正确性代理。

回复长度也拆开看。附录 Table 5：V3-Base 正确 621.3、错误 1038.9、格式乱 880.7；R1-Zero 正确 4965.4、错误 8206.1、格式乱 7870.3。三类都变长。错误仍比正确长。作者的猜测很土：难题本身更长，错的又更常来自难题。R1 报告里那条「越训越长」是真的，原因不必全是高级推理。

## 4. GRPO 原式里被放大的两项

生成写成 token 级 MDP。状态是题干加已写前缀，动作是下一个 token，转移确定。目标在 $\beta=0$ 时就是期望回报。PPO 的 clip 代理是逐 token 求和，没有按回复长度再平均一遍。GRPO 在 DeepSeekMath 式 (3) 上多了两处归一化。对照 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md) 的式 (2)(4)，把记号写成这篇 HTML 的样子：

$$
\begin{aligned}
\mathcal{J}_{\mathrm{GRPO}}(\pi_\theta)
&=\mathbb{E}_{q,\{o_i\}_{i=1}^{G}\sim\pi_{\theta_{\mathrm{old}}}}
\Bigg[
\frac{1}{G}\sum_{i=1}^{G}
\frac{1}{|o_i|}
\sum_{t=1}^{|o_i|}
\min\big(\eta_{i,t}\hat{A}_{i,t},\;
\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\hat{A}_{i,t}\big)
\Bigg]
\end{aligned} \tag{1}
$$

$$
\hat{A}_{i,t}
=\frac{R(q,o_i)-\mathrm{mean}(\mathbf{R})}
{\mathrm{std}(\mathbf{R})}. \tag{2}
$$

$\eta_{i,t}=\pi_\theta(o_{i,t}\mid q,o_{i,<t})/\pi_{\theta_{\mathrm{old}}}(\cdot)$。要删的是式 (1) 的 $1/|o_i|$ 和式 (2) 的 $\mathrm{std}(\mathbf{R})$。其余：组采样、$1/G$、PPO clip、结局奖励广播到整段，都留着。

长度偏差来自 $1/|o_i|$。正优势（答对）时，短回复每个 token 分到更大的梯度，政策更爱短的正确写法。负优势（答错）时，长回复分母大，惩罚被摊薄，政策更爱在错的里面把话写长。对的要短、错的要长。训练曲线上平均长度仍可能涨，因为错的那一侧在被鼓励变长。R1-Zero 那种「奖励还在爬、回复已经狂长」不一定全是高级推理，分母在帮忙。

难度偏差来自组内 $\mathrm{std}(\mathbf{R})$。题太容易或太难，组内几乎全 1 或全 0，标准差趋近 0，同一点分数差被放成很大的 $|\hat{A}|$。Andrychowicz 等 2021 把优势归一化当成常见技巧，但那是整批上做。GRPO 按题做，等于给不同题不同的损失权重。简单题（组内方差小）在更新里被过加权。不是「标准差这个统计学动作永远有害」，是问级别的 $\mathrm{std}$ 把难度写成了权重。

开源 PPO 实现里，长度偏差比 GRPO 论文更早。trl、OpenRLHF、verl、SimpleRL-Zero、Open-Reasoner-Zero 都按回复 mask 做 `masked_mean`，分母是真实长度。公式里的 PPO 是按 token 求和。作者猜习惯来自预训练：pack 到固定上下文，`loss.mean(-1)` 用上下文长度稳住数值。RL 阶段回复长度不是常数，分母跟着变，偏差就进来了。Zeng 等、Hu 等用的是 PPO 公式，实现仍带长度项。把「回复变长」写成涌现之前，先看训练器最后一行除以什么。

手算一组。$G=2$，规则分 0/1。短对：$R=1$，$|o|=8$。长错：$R=0$，$|o|=40$。组均值 $0.5$，若再除 $\mathrm{std}=0.5$，则 $\hat{A}=(+1,-1)$。GRPO 把 $+1$ 摊到 8 个 token 上，每个系数 $1/8$；把 $-1$ 摊到 40 个 token 上，每个系数 $1/40$。短对的每个 token 梯度幅度是长错的五倍。换成中等题，组内四对四错，$\mathrm{std}$ 接近 $0.5$；换成几乎全对的简单题，$\mathrm{std}$ 掉到 $0.1$ 量级，同一点 $0/1$ 差会被放大五倍。两项叠在一起：简单题上的短正确句，梯度最大；难题上的长错误句，惩罚最稀。

![GRPO 保留两项归一化，Dr.GRPO 两项都删](./images/fig-drgrpo-drop-two-terms.png)

> 图 1：左栏 GRPO。采样之后先按 $1/|o_i|$ 做回复内平均，再按组标准差做 $z$-score。右栏 Dr. GRPO。分母改成生成预算常数，优势只减组均值。两栏之间没有箭头，是对照不是工序。底注：clip、组采样、0/1 结局奖励不变。

**图 1 解析**

- 左虚线奶油框是 Shao 等 2024 的 GRPO。橙框标 LENGTH BIAS 和 DIFFICULTY BIAS，对应式 (1) 的 $1/|o_i|$ 和式 (2) 的 $\mathrm{std}$。
- 右虚线薄荷框是 Dr. GRPO。青绿框写 `sum / MAX_TOKENS` 和 $A=R-\mathrm{mean}(R)$。
- 自上而下的实线只在栏内走：采样 → 长度项或常数分母 → 优势。
- 不要把左栏的 Group 读成 MoE 专家。那只是同题 $G$ 条。

## 5. 两项都删，其余不动

Dr. GRPO 的改法就是把这两处划掉。优势改成无偏基线：

$$
\tilde{A}_{i,t}=R(q,o_i)-\mathrm{mean}(\mathbf{R}). \tag{3}
$$

目标改成 PPO 那种按 token 求和，实现上用生成预算当常数分母，避免再按真实长度平均：

$$
\begin{aligned}
\mathcal{J}_{\mathrm{Dr.GRPO}}(\pi_\theta)
&=\mathbb{E}
\Bigg[
\frac{1}{G}\sum_{i=1}^{G}
\sum_{t=1}^{|o_i|}
\min\big(\eta_{i,t}\tilde{A}_{i},\;
\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\tilde{A}_{i}\big)
\Bigg]. \tag{4}
$$

代码开关就一行。有偏：`(tensor * mask).sum(axis=dim) / mask.sum(axis=dim)`。无偏：分母换成 `MAX_TOKENS`。`MAX_TOKENS` 是整段训练的生成上限，本实验是 3000。别的正常数也能用，梯度范数会变，学习率要跟着看。附录 A 说这恢复了带无偏基线的 Monte Carlo 策略梯度。组均值当 $B(q)$，对 $o_t$ 不变，期望里那项是 0。

和 [06-RLOO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/06-RLOO-留一法基线/06-RLOO-留一法基线.md) 差一个常数。$\frac{G}{G-1}\tilde{A}_{i,t}$ 就是 RLOO 的留一优势。常数可以吃进学习率，动态等价。RLOO 的基线不含自己那一条；Dr. GRPO 含自己，再靠 $G/(G-1)$ 对齐。两者都没有组标准差。不要把 Dr. GRPO 写成「RLOO 换了个名字」，组还在、clip 还在、只是 $z$-score 的分母没了。

奖励极瘦。Math-Verify，含正确最终答案为 1，否则 0。没有过程监督，没有长度惩罚，KL 系数 0。$G=8$，温度 1.0，clip $\varepsilon=0.2$，AdamW $1\times 10^{-6}$ 恒定，内层 proximal epoch 1。这是附录 Table 6，不是 DeepSeekMath 那套 $G=64$、最大长度 1024。抄超参要带模型档。

附录 C 把两项拆开消融。Qwen2.5-1.5B，3K 道 ASDiv / MATH / AIME（2023 前）混合题。四个变体：Dr. GRPO、去掉长度归一、去掉 $\mathrm{std}$、原版 GRPO。长度曲线上，Dr. GRPO 和「只去长度项」明显更短，说明变长主要是 $1/|o_i|$ 在推。训练奖励和评测准确率上，去掉任一项都强过原版 GRPO。三项独立随机种子，Dr. GRPO 在 token 效率和终局准确率上都能分开。不要把「去标准差」从这张消融里单独抽出来当唯一药方。长度项对回复长度的影响更大。

## 6. 1.5B 上：奖励还在涨，长度不必狂奔

对照实验用 Qwen2.5-1.5B 基座加 R1 模板，MATH 训练集，Math-Verify 二元分。评测仍是 AIME24 / AMC / MATH500 / Minerva / OlympiadBench。HTML Fig. 5 的读法进表，不把手绘曲线冒充论文图。

| 监控 | GRPO | Dr. GRPO |
|------|------|----------|
| 训练奖励 | 上升 | 同样上升 |
| 回复长度 | 奖励变慢之后仍继续拉长 | 涨幅被刹住 |
| 评测时错误回复长度 | 更长 | 明显更短 |
| 准确率 | 基线 | 同档或略好，token 更省 |

两边都出现 R1-Zero 那种「奖励和长度一起涨」。分歧在奖励斜率变平之后。GRPO 还在把回复写长。社区常把这写成长思维链涌现。这篇认为长度偏差是混杂因素。SimpleRL-Zero 和 Open-Reasoner-Zero 用的是 PPO 公式，实现仍除以回复长度，曲线同样能「涌现」。Dr. GRPO 把错误回复的长度压下去，作者把它和 overthinking 那条线连起来：无偏梯度少鼓励「错了就再写一段」。

这不是说变长一定是假的。正确回复也在变长，R1-Zero 上正确类从 621 到 4965。无偏优化器证明的是：原版 GRPO 会额外推动错的一侧变长。把平均长度当能力指标，先把这一侧拆开。

## 7. 极简配方：7B 的 AIME 2024 是 43.3%

基座和 RL 两头看完，作者给了一条极简配方：Qwen2.5-Math-7B，Dr. GRPO，MATH level 3–5，Qwen-Math 模板。算力写在引言第三段：大约 27 小时，8×A100。代码 [sail-sg/understand-r1-zero](https://github.com/sail-sg/understand-r1-zero)，训练框架是 Oat。得到的权重叫 Oat-Zero。

![R1-Zero-like 拆成基座检查再加 Dr.GRPO](./images/fig-r1zero-base-plus-rl.png)

> 图 2：从左到右四步。先检查基座（V3-Base 已有 Aha，Qwen2.5 无模板平均 38.2），再套 Qwen-Math 模板，用 Dr. GRPO 在 MATH level 3–5 上训，$G=8$、无 KL，评测 Oat-Zero-7B 的 AIME 2024 为 43.3%，大约 27 小时、8×A100。底注：涨分不要全记在 RL 上；模板不匹配会先把基座打穿。

**图 2 解析**

- 奶油框外包一圈虚线，标预训练已经做了一部分。38.2 是 Table 1 无模板平均，不是 AIME 单列。
- 紫框是 Qwen-Math 模板，不是 R1 的 think/answer 标签。
- 薄荷框是本篇的优化器，不是 JustRL 那条 1.5B 配方。
- 鲑粉框的 43.3% 是 7B、AIME 2024、生成预算 3k。不要写成九项平均。

Qwen2.5-Math 上下文 4k，和所有对照一样把生成预算钉在 3k。OpenReasoner-Zero 和 R1-Distill-Qwen 另报了 8k。HTML Table 4 主数字：

| 模型 | AIME24 | AMC | MATH500 | Minerva | Olympiad | 平均 |
|------|--------:|----:|--------:|--------:|---------:|-----:|
| Qwen2.5-Math-7B | 16.7 | 38.6 | 50.6 | 9.9 | 16.6 | 26.5 |
| Qwen2.5-Math-7B\* | 0.2 | 45.8 | 69.0 | 21.3 | 34.7 | 38.2 |
| SimpleRL-Zero-7B | 26.7 | 60.2 | 78.2 | 27.6 | 40.3 | 46.6 |
| PRIME-Zero-7B | 16.7 | 62.7 | 83.8 | 36.0 | 40.9 | 48.0 |
| OpenReasoner-Zero-7B @ 3k | 13.3 | 47.0 | 79.2 | 31.6 | 44.0 | 43.0 |
| OpenReasoner-Zero-7B @ 8k | 13.3 | 54.2 | 82.4 | 31.6 | 47.9 | 45.9 |
| **Oat-Zero-7B** | **43.3** | 62.7 | 80.0 | 30.1 | 41.0 | 51.4 |
| R1-Distill-Qwen-7B @ 3k | 10.0 | 26.2 | 60.1 | 23.0 | 23.1 | 28.5 |
| R1-Distill-Qwen-7B @ 8k | 33.3 | 68.4 | 88.1 | 35.9 | 47.7 | 54.7 |
| Qwen2.5-Math-7B-Instruct | 16.7 | 53.0 | 83.6 | 29.8 | 42.7 | 45.1 |

星号行是无模板，五份卷里最高的那套，用来反映基座能力，不是 RL 之后的数。Oat-Zero-7B 的 AIME 2024 **43.3%** 是本篇要钉的主数字。平均 51.4 高于同表 3k 预算的 Zero 系。R1-Distill @ 8k 平均 54.7 更高，那是蒸馏体、更长生成，不是基座直上 RL。Instruct 7B 平均 45.1，AIME24 只有 16.7。论文摘要写 7B 上 AIME 新高，表里要连着预算和是否蒸馏一起读。

1.5B 同配方：Oat-Zero-1.5B 平均 42.1，AIME24 20.0。Qwen2.5-Math-1.5B 无模板平均已经 33.1，RL 再抬一截。不要和 [02-JustRL](../02-JustRL-极简配方/02-JustRL-极简配方.md) 的九项平均 54.87% / 64.32% 混。那是另一篇、1.5B 蒸馏骨干、九项协议，不是本表的 AIME 单列。

同夹 [01-ReMax](../01-ReMax-贪婪基线/01-ReMax-贪婪基线.md) 减的是 greedy 奖励，没有组、没有 clip。Dr. GRPO 有组、有 clip、没有 Critic，走的仍是 GRPO 那条，只是两项归一化没了。

## 8. 模板和题集是一对，不匹配会先打穿基座

Qwen2.5-Math 无模板已经很能做题。RL 时模板怎么选、题集覆盖多宽，会缠在一起。作者拿 Qwen2.5-Math-1.5B 跑 Dr. GRPO，模板三种，题集四档。

| 题集 | 规模 | 内容 |
|------|-----:|------|
| ORZ | 57k | AIME、Numina-Math、Tulu3 MATH，覆盖宽 |
| MATH | 12k | 高中竞赛 |
| GSM | 8k | 小学应用题，更简单 |
| ASDiv | 2k | 四则运算，更窄 |

HTML Fig. 6 的判断就两句。模板决定初始政策的高低，但题集合适时，RL 能把几条线收到大约 40% 同一档。R1 模板和 Qwen2.5-Math 不匹配，题集覆盖就变得很关键，太窄会把平台压低。Qwen-Math 模板下，最好的终局来自 GSM-8K：更简单、还偏出分布的题，测试集准确率几乎翻倍。

这意味着两件事。Qwen2.5-Math-1.5B 已经会做题，套模板等于先把能力打穿，再让 RL 重建。所谓「纯 RL 巨幅提升」，有一截是在修模板伤口。模板匹配时，题集不必又大又难，小而偏的题也能强化已有推理行为，不一定在灌新知识。模板不匹配时，政策改进主要靠 RL，覆盖不够真会把天花板压住。

## 9. 弱基座也能 RL，天花板看数学预训练

开源 R1-Zero 复现几乎都站在 Qwen2.5 这种已经会做题、已经会自我修正的基座上。另一侧：数学很弱的基座，这条训练走不走得通。起点换成 Llama-3.2-3B，仍用 Dr. GRPO 加 R1 模板。再加两档数学续预训练：FineMath 数据上的 Llama-3.2-3B-FineMath；以及把 NuminaMath-1.5 拼成问答连续文本、再续训 2 epoch、学习率 $1\times 10^{-5}$ 的 Llama-3.2-3B-NuminaQA。

Table 4 的 3B 行：裸 Llama 平均 3.3，RL 之后 6.8，有增益但很小。FineMath 之后 RL 到 14.8。NuminaQA 之后的 Oat-Zero-3B 平均 20.7，AIME24 6.7。Instruct 3B 平均 17.1。领域预训练把 RL 天花板抬上去，不是「Llama 上 R1-Zero 天生无效」。

同一 3B 上再对比 GRPO 和 Dr. GRPO。GRPO 又能画出长度和准确率双升，看起来像 Llama 也能长思维链。Dr. GRPO 把长度那一侧刹住。双升可以是优化偏差。数学续预训练改变的是准确率能爬多高，不自动给一条无偏的长度曲线。

## 10. 不是谁，何时失效

不是 Shao 等 DeepSeekMath 的 GRPO。那边组内 $z$-score 含 $\mathrm{std}$，目标里还有 $1/|o_i|$ 和 $\beta=0.04$ 的 KL。本篇两项都删，KL 为 0。GSM8K 82.9%→88.2% 是 Instruct 7B 上 GRPO 原文的数，不要安到 Oat-Zero 头上。

不是 JustRL。He 等把 veRL 默认 GRPO 配上 DAPO 规则验证器，单阶段、固定超参，抬的是已经蒸馏过的 1.5B。摘要里的 54.87% / 64.32% 是九项平均，不是 AIME 单列，更不是本篇 7B 的 43.3%。JustRL 保留组内 $z$-score，还用 clip higher $[0.8,1.28]$。本篇改的是分母和 $\mathrm{std}$，clip 仍对称 $\varepsilon=0.2$。

不是 DAPO（[arXiv:2503.14476](https://arxiv.org/abs/2503.14476)）。DAPO 改 clip 上沿、动态采样、token 级损失、超长惩罚。同月另一篇。CISPO 一类后来采用 token 级总分母，和 Dr. GRPO 的常数分母是亲戚，不是同一篇论文。

不是「所有规模、所有任务都该拆掉标准差」。问级别 $\mathrm{std}$ 会把简单题过加权；整批上的优势归一化仍是 RL 里的常规。组很大、奖励连续、难度接近时，$\mathrm{std}$ 的危害不一定复制。这篇主结果是 Qwen2.5-Math 7B、数学规则分、$G=8$。没有代码，没有通用对话，没有 70B。

| 现象 | 原因 | 说明 |
|------|------|------|
| 回复越训越长、错的更长 | $1/|o_i|$ 摊薄负优势 | 先换常数分母，再谈涌现 |
| 简单题梯度异常大 | 组内 $\mathrm{std}\to 0$ | 全对全错组被过加权；DAPO 选择丢掉这些组，这里选择去掉 $\mathrm{std}$ |
| Qwen 复现曲线起步很高 | 无模板基座已经会做题 | 约 60% 相对 4-shot；R1 模板可能先打穿 |
| 检出 Aha 但分数不动 | 基座已有自我修正词 | V3-Base 已有；R1-Zero 上修正与准确率无正相关 |
| Llama 裸基座 RL 几乎不动 | 数学知识不够 | FineMath / NuminaQA 抬的是天花板，不是优化器 |
| 长度偏差还在 | 训练器仍 `mask.mean` | trl / verl / OpenRLHF 公式写 PPO、实现写长度平均 |
| 把 43.3% 写成九项 SOTA | 口径混了 JustRL | 43.3% 是 7B AIME 2024；九项平均是另一篇 1.5B |

工程上能抄走的是式 (3)(4) 和 Table 6，不是摘要里的 SOTA。生成预算 3k、评测 greedy、Math-Verify 二元分，换协议数字会漂。AIME 30 题，一个对错就是 3.3 个点，43.3% 对 26.7% 很扎眼，方差也大。

没有两全其美。删掉两项归一化，换来的是更干净的 token 效率和一条 7B 数学成绩单；付出的是「不再按题把优势缩放到同一尺度」，以及一张没有证明「任意规模都该这样」的表。基座那一截更烦人：模板和预训练偏差能在 RL 开始前就把曲线的纵轴抬走或打穿。优化器再干净，也填不满基座里没有的数学。同夹配方问题在 [02-JustRL](../02-JustRL-极简配方/02-JustRL-极简配方.md)；组内 $z$-score 的原式在 [02-GRPO](../../4.4.1-基于奖励模型的RL-RLHF-PPO/02-GRPO/02-GRPO.md)。

## 参考文献

1. Liu, Z., Chen, C., Li, W., Qi, P., Pang, T., Du, C., Lee, W. S., & Lin, M. (2025). [Understanding R1-Zero-Like Training: A Critical Perspective](https://arxiv.org/abs/2503.20783). HTML：[arXiv HTML](https://arxiv.org/html/2503.20783)。代码：[sail-sg/understand-r1-zero](https://github.com/sail-sg/understand-r1-zero)。框架：[sail-sg/oat](https://github.com/sail-sg/oat)。
2. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).（GRPO 原式；正本在 4.4.1/02）
3. Guo, D., et al. (2025). [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948).
4. Schulman, J., et al. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
5. Ahmadian, A., et al. (2024). [Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740).（RLOO；与式 (3) 差 $G/(G-1)$）
6. Hendrycks, D., et al. (2021). [Measuring Mathematical Problem Solving with the MATH Dataset](https://arxiv.org/abs/2103.03874).
7. Yang, A., et al. (2024). [Qwen2.5-Math Technical Report](https://arxiv.org/abs/2409.12122).
8. Liu, A., et al. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437).
9. Yu, Q., et al. (2025). [DAPO: An Open-Source LLM Reinforcement Learning System at Scale](https://arxiv.org/abs/2503.14476).（不是本篇；对照用）
10. He, B., et al. (2025). [JustRL: Scaling a 1.5B LLM with a Simple RL Recipe](https://arxiv.org/abs/2512.16649).（不是本篇；九项平均不要抄成 AIME）
11. Andrychowicz, M., et al. (2021). What Matters for On-Policy Deep Actor-Critic Methods? A Large-Scale Study. *ICLR*.（优势归一化通常在整批上做）
12. Zeng, W., et al. (2025). [SimpleRL-Zero](https://hkust-nlp.notion.site/simplerl-reason).（Table 4 对照；PPO 实现仍带长度项）
13. Hu, J., et al. (2025). [Open-Reasoner-Zero](https://github.com/Open-Reasoner-Zero/Open-Reasoner-Zero).
14. Chen, X., et al. (2024). [Do Not Think That Much for 2+3=? On the Overthinking of o1-Like LLMs](https://arxiv.org/abs/2412.21187).
15. Allal, L. B., et al. (2025). [SmolLM2](https://arxiv.org/abs/2502.02737).（FineMath 续预训练）
16. Liu, Z., et al. (2025). [There May Not Be Aha Moment in R1-Zero-Like Training](https://oatllm.notion.site/oat-zero). Notion.
