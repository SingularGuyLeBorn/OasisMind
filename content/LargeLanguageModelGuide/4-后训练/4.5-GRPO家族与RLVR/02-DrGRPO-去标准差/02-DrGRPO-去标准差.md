---
title: "02 · Dr.GRPO: 去掉长度与难度偏差"
published: true
tags: ["DrGRPO", "GRPO", "R1-Zero", "Aha", "Qwen2.5", "Oat-Zero"]
excerpt: "Dr.GRPO 从 GRPO 目标中删去回复长度归一化和组内标准差两项, 恢复带无偏基线的蒙特卡洛策略梯度. 配合 Qwen2.5-Math-7B, MATH level 3-5 和 Qwen-Math 模板, 7B 模型在 AIME 2024 上达到 43.3%, 8 张 A100 约 27 小时."
---
# 02 · Dr.GRPO: 去掉长度与难度偏差

> 相关阅读: [4.5 GRPO 家族与 RLVR](../4.5-GRPO家族与RLVR.md) · [01-GRPO](../01-GRPO/01-GRPO.md) · [05-RLOO](../../4.4-强化学习基础/05-RLOO-留一法基线/05-RLOO-留一法基线.md) · [04-PPO](../../4.4-强化学习基础/04-PPO/04-PPO.md) · [08-JustRL](../08-JustRL-极简配方/08-JustRL-极简配方.md) · [07-GxPO 结构扩展](../07-GxPO结构扩展/07-GxPO结构扩展.md) · [09-RLVR 的局限性](../09-RLVR的局限性与探索边界/09-RLVR的局限性与探索边界.md)

材料是 Liu 等的 *Understanding R1-Zero-Like Training: A Critical Perspective* (arXiv:2503.20783), 代码在 [sail-sg/understand-r1-zero](https://github.com/sail-sg/understand-r1-zero), 训练框架是 Oat. 问题是 R1-Zero 式训练中的涨分和回复变长, 分别有多少来自基座, 模板和 GRPO 的目标本身.

## 1. 基座: 涨分有多少在 RL 之前就有了

### 1.1 把 R1-Zero-like 训练拆成两部分

DeepSeek-R1-Zero 在基座上直接做 RL, 前面不加 SFT. 它报告的现象有三条: 奖励上升, 回复变长, 训练中出现自我修正 (所谓 Aha moment). 社区复现大多用 Qwen2.5 当基座, 再接 GRPO 或某个 PPO 实现. 这篇论文把这套流程拆成基座和 RL 两部分分别检查.

基座部分要回答三个问题: 加模板后模型是在答题还是在续写; 基座能否采到可以得分的轨迹; 自我修正是否由 RL 训练出来. RL 部分要回答: GRPO 的目标是否无偏, 回复变长有多少来自优化目标本身.

生成过程写成 token 级 MDP. 状态 $s_t$ 是题干 $q$ 拼上已生成的前缀 $o_{<t}$, 动作是下一个 token, 转移是确定的. 回报 $R(q,o)$ 在推理任务中通常只有最终答案对错. 全文取 KL 系数 $\beta=0$. 论文的理由是, KL 正则在 RLHF 中用来防止策略偏离奖励模型的训练分布; 规则验证器不存在这种分布偏移问题, 去掉 KL 还能省掉参考模型的显存和计算.

### 1.2 模板决定答题还是续写

论文试了三种模板. R1 模板把思考和答案分别放进 `<think>` 和 `<answer>`. Qwen-Math 模板用 chat 格式包一层, 系统提示要求逐步推理并把答案放进 `\boxed{}`. 第三种不加任何模板, 直接给题干.

实验在 Qwen2.5-Math-1.5B, Qwen2.5-Math-7B, Qwen2.5-7B, Llama-3.1-8B, DeepSeek-Math-7B, DeepSeek-V3-Base-685B 上进行, 题目是 MATH 中抽出的 500 道. 先在无模板条件下生成, 由 GPT-4o-mini 判断回复是答题格式还是续写格式, 记录答题比例. 再分别套 R1 和 Qwen-Math 模板, 按答题比例为每个模型选最合适的模板, 然后测不同采样温度下的 pass@8, 用来衡量基座能否采到正确轨迹.

Figure 3 有三个结论. Llama 和 DeepSeek 套上 R1 模板后答题比例上升. Qwen2.5 在无模板时答题比例就是 100%, 套模板反而下降. DeepSeek-V3-Base 无模板时答题比例最低, 论文据此认为它接近纯基座. pass@8 显示所有测试的基座都能采到正确轨迹, Qwen2.5 最好, 超过了 V3-Base. 论文认为这部分解释了为什么 2025 年初的开源 R1-Zero 复现大多选 Qwen2.5. 如果基座一条正确轨迹都采不到, RL 没有奖励信号, 也就无从改进.

Qwen2.5 无模板就能答题, 论文进一步在五个基准上用 greedy 解码测 Qwen2.5-Math, 生成上限 3000 token. Table 1:

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

无模板相对 4-shot 的提升约 60%: 1.5B 从 19.7 到 33.1, 7B 从 23.8 到 38.2. R1 模板在 7B 上让五项全部接近 0. 7B 无模板的 AIME24 一格是 0.2, AIME 只有 30 题, greedy 解码下每题非对即错, 这个值对不上整数题数, 引用时只用平均分 38.2.

Qwen2.5-Math 技术报告提到预训练阶段用了 chat 模型的问答数据. 论文的假说是, Qwen2.5 可能直接在拼接好的问答文本上最大化 $\log p_\theta(q;o)$. 如果假说成立, 用 Qwen2.5 复现 R1-Zero 需要更谨慎, 因为无模板时这个基座已经接近 SFT 后的模型. 论文 §2.1 的结论是: 模板的作用是让基座从续写转向答题; 在 RL 之前, 所有基座都已经具备解题能力. Qwen2.5 的约 60% 提升来自去掉模板, 跟 RL 没有关系. 复现曲线上的总涨幅如果全部算在 GRPO 头上, 基座本身的贡献就被计入了 RL.

### 1.3 自我修正在 V3-Base 中已经出现

此前 Liu 等 (2025b) 的 Oat-Zero 博客和 Yeo 等 (2025) 对长 CoT 的分析指出, 开源复现所用的基座本来就会写 recheck, wait 一类的自我修正, 谈不上 RL 涌现. 但这些工作没有测 DeepSeek-V3-Base, 而 R1-Zero 正是从它训练出来的. 论文自行部署 V3-Base-685B, 用 R1 模板回答同样的 500 道 MATH 题. Figure 3 右图显示 V3-Base 的自我修正次数相当可观, 附录 E 的例子里能看到「Aha」和「wait」.

检测方法有两套. 关键词检测单独用会误报, 因为「wait」「try again」在回复里常常只是口头语. 论文把词表限制在强指示词上: recheck, rethink, reassess, reevaluate, re-evaluate, reevaluation, re-examine, reexamine, reconsider, reanalyze, double-check, check again, think again, verify again, go over the steps. 不同模型家族偏好不同的词: Qwen2.5 系列最常出现 check again, double-check, recheck 等; DeepSeek 系列从不写 re-evaluate, re-examine, verify again; Llama 常写 think again. 论文认为这反映了预训练语料的差别, 尤其是推理和数学部分. 这组统计 (Figure 10) 覆盖 40000 条回复, 即 500 道题, 每题 8 条, 10 个采样温度. 另一套是 GPT-4o-mini 判断, 能识别不含关键词的隐式回看. 两套方法各有误判, Figure 11 各给了一个例子: 关键词命中但回复并没有回看; 裁判把一条又长又乱的回复判成了自我修正. 论文用两者交叉验证: 词表过滤裁判的误判, 裁判补上词表漏掉的隐式行为. Figure 12 按题计数, 一道题的 8 条回复中只要有一条出现自我修正, 这道题就记为有自我修正.

自我修正与准确率的关系也做了检验. 论文部署 DeepSeek-R1-Zero, 选出 8 次采样中至少有一次出现自我修正的题, 每题采 100 次, 分成「有自我修正」和「没有自我修正」两组, 比较组间准确率差. Figure 15 显示接近一半的题上, 有自我修正的一组并不更准. 论文据此认为, 在推理阶段, 自我修正不能作为正确性的指标. 它在训练阶段是否有助于探索, 论文没有下结论.

附录 F 还把 V3-Base 与 R1-Zero 在同样 500 道题上的回复按难度和类别拆开 (Figure 14): RL 之后大多数原本错误的回复被纠正, 同时格式错误的回复变多, 这一点与 Liu 等 (2025b) 的观察一致. 平均回复长度见附录 Table 5, 单位是字符串长度. 截断的回复如果给更长的上下文, 会落入其他三类之一, 所以不计入:

| 模型 | 正确 | 错误 | 格式错误 |
|------|-----:|-----:|---------:|
| DeepSeek-V3-Base | 621.3 | 1038.9 | 880.7 |
| DeepSeek-R1-Zero | 4965.4 | 8206.1 | 7870.3 |

三类回复都大幅变长, 这与 R1 报告中的长度曲线一致. 但错误回复始终比正确回复长. 论文的解释是: 难题本身需要更长的推理, 而错误回复更多来自难题, 因此平均更长. 第 2 节给出另一个来源.

## 2. GRPO 目标中的两项偏差

### 2.1 长度项与标准差项

PPO 的替代目标是对 token 逐个求和, 没有再按回复长度做平均. 它的优势 $\hat{A}_t$ 通常用 GAE 加一个学习出来的价值模型估计; 在 LLM 上训练价值模型的计算开销很大, 所以实践中更常用不需要价值模型的估计方式, GRPO 就是其中之一. GRPO 在此基础上加了两处归一化. 记号与 [01-GRPO](../01-GRPO/01-GRPO.md) 一致, 对同一题 $q$ 由旧策略采 $G$ 条回复 $\{o_1,\ldots,o_G\}$:

$$
\mathcal{J}_{\mathrm{GRPO}}(\pi_\theta)
=\mathbb{E}\Bigg[\frac{1}{G}\sum_{i=1}^{G}\frac{1}{|o_i|}\sum_{t=1}^{|o_i|}
\min\big(\eta_{i,t}\hat{A}_{i,t},\;\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\hat{A}_{i,t}\big)\Bigg], \tag{1}
$$

$$
\hat{A}_{i,t}=\frac{R(q,o_i)-\mathrm{mean}(\mathbf{R})}{\mathrm{std}(\mathbf{R})}, \tag{2}
$$

其中 $\eta_{i,t}=\pi_\theta(o_{i,t}\mid q,o_{i,<t})/\pi_{\theta_{\mathrm{old}}}(o_{i,t}\mid q,o_{i,<t})$, $\mathbf{R}=\{R(q,o_1),\ldots,R(q,o_G)\}$. 在比率处于 clip 窗内时, 第 $i$ 条回复每个 token 的梯度系数是

$$
w_{i}=\frac{R(q,o_i)-\mathrm{mean}(\mathbf{R})}{\mathrm{std}(\mathbf{R})\cdot|o_i|}. \tag{3}
$$

论文 Figure 4 把这一点画成: GRPO 的有效优势等于无偏优势 $R(q,o_i)-\mathrm{mean}(\mathbf{R})$ 按 $\mathrm{std}(\mathbf{R})$ 和 $|o_i|$ 重新加权.

**回复级长度偏差**来自 $1/|o_i|$. 优势为正 (答对) 时, 短回复的每个 token 分到更大的梯度, 策略倾向于更短的正确回答. 优势为负 (答错) 时, 长回复的分母更大, 每个 token 受到的惩罚更小, 策略在错误回答中倾向于更长的写法. 从整条序列看, 式 (3) 下一条回复所有 token 的系数之和等于它的优势本身, 与长度无关. 一条 8000 token 的错误回复与一条 800 token 的错误回复受到的总惩罚相同, 分摊到每个 token 上相差 10 倍.

**问题级难度偏差**来自 $\mathrm{std}(\mathbf{R})$. 太容易或太难的题, 组内奖励几乎全为 1 或全为 0, 标准差很小, 同样的分数差被放大成很大的优势. 优势归一化是 RL 中常见的技巧 (Andrychowicz 等, 2021), 但通常在整个 batch 上做. GRPO 按题做, 等于给不同题不同的损失权重.

### 2.2 二元奖励下的算例

用二元奖励算一组. 取 $G=8$, 按总体标准差计. 8 条中答对 1 条时, 组均值 0.125, 标准差 $\sqrt{0.125\times0.875}\approx0.331$, 答对那条的优势 $0.875/0.331\approx2.65$. 答对 4 条时标准差 0.5, 答对的每条优势 1.0. 不除标准差时两者分别是 0.875 和 0.5. 对整组求和:

$$
\sum_{i=1}^{G}\big|R_i-\mathrm{mean}(\mathbf{R})\big|=2G\hat p(1-\hat p),\qquad
\sum_{i=1}^{G}\big|\hat{A}_{i}\big|=2G\sqrt{\hat p(1-\hat p)}, \tag{4}
$$

$\hat p$ 为组内答对比例. 不除标准差时, 一组的总梯度权重与 $\hat p(1-\hat p)$ 成正比, $\hat p=1/8$ 的组是 $\hat p=1/2$ 的组的 0.44 倍; 除以标准差后变为与 $\sqrt{\hat p(1-\hat p)}$ 成正比, 这一比值升到 0.66. 难度接近两端的题因此被相对加权.

两项叠加的效果用 $G=2$ 的例子更直观. 一条短的正确回复, $R=1$, $|o|=8$; 一条长的错误回复, $R=0$, $|o|=40$. 组均值 0.5, 标准差 0.5, 优势为 $\pm1$. 按式 (3), 正确回复每个 token 的系数是 $1/8$, 错误回复是 $1/40$, 前者是后者的 5 倍. 去掉两项归一化后, 两条回复每个 token 的系数都是 $\pm0.5/C$, $C$ 为常数.

### 2.3 开源 PPO 实现中的长度项

长度偏差在 GRPO 论文之前就已存在于 PPO 实现里. 论文 Table 2 检查了 trl, OpenRLHF, verl, SimpleRL-Zero, Open-Reasoner-Zero 五个仓库的 PPO 损失, 全部带有长度归一化, 与 PPO 公式的逐 token 求和不一致. 实现有两种写法:

- 按每条回复做 `masked_mean` 再对回复取平均 (OpenRLHF 为例), 等价于式 (1) 的 $1/|o_i|$.
- 把整个 batch 的 token 一起做 `masked_mean` (trl, verl 为例), 分母是 batch 内全部回复的 token 总数.

第二种写法在同一 batch 内对所有 token 一视同仁, 没有回复级的长度偏差, 但分母随 batch 的总长度变化, 仍是一个变量. 论文把两种都列为有偏.

论文推测这种写法来自预训练: 所有 token 被打包进固定长度的上下文, 按上下文长度求平均 (`loss.mean(-1)`) 有助于数值稳定. 到了 RL 阶段, 实现按回复长度归一化, 而回复长度随样本变化, 偏差就此引入. SimpleRL-Zero (Zeng 等) 和 Open-Reasoner-Zero (Hu 等) 使用的是 PPO, 公式本身无偏, 但实现仍然带有长度项.

## 3. Dr.GRPO: 两项都删

### 3.1 新的优势与目标

Dr.GRPO (GRPO Done Right) 删掉式 (1) 的 $1/|o_i|$ 和式 (2) 的 $\mathrm{std}(\mathbf{R})$, 组采样, PPO clip, 结局奖励广播到整段都保留. 优势变成

$$
\tilde{A}_{i}=R(q,o_i)-\mathrm{mean}(\mathbf{R}), \tag{5}
$$

目标变成

$$
\mathcal{J}_{\mathrm{Dr.GRPO}}(\pi_\theta)
=\mathbb{E}\Bigg[\frac{1}{G}\sum_{i=1}^{G}\sum_{t=1}^{|o_i|}
\min\big(\eta_{i,t}\tilde{A}_{i},\;\mathrm{clip}(\eta_{i,t},1-\varepsilon,1+\varepsilon)\tilde{A}_{i}\big)\Bigg]. \tag{6}
$$

实现上只改 `masked_mean` 的分母. 有偏写法是 `(tensor * mask).sum(axis=dim) / mask.sum(axis=dim)`, 无偏写法把分母换成 `MAX_TOKENS`. `MAX_TOKENS` 是整个训练过程中的生成上限, 实验中为 3000; 除非启用了生成预算课程, 它就是一个全局常数. 其他正常数也可以, 区别只在梯度范数, 可以由学习率吸收.

### 3.2 无偏性与 RLOO 的等价

附录 A 从蒙特卡洛策略梯度出发说明式 (6) 无偏. 目标 $\mathbb{E}_{q}\mathbb{E}_{o\sim\pi_\theta}[R(q,o)]$ 的梯度可以写成 $\sum_t\nabla_\theta\log\pi_\theta(o_t\mid q,o_{<t})\,(R-B)$, 只要基线 $B$ 与当前 token $o_t$ 无关, 减去它不改变期望:

$$
\mathbb{E}_{o_t\sim\pi_\theta}\big[\nabla_\theta\log\pi_\theta(o_t\mid q,o_{<t})\,B\big]
=B\,\nabla_\theta\sum_{o_t}\pi_\theta(o_t\mid q,o_{<t})=B\,\nabla_\theta1=0. \tag{7}
$$

取 $B=\mathrm{mean}(\mathbf{R})$ 得到式 (5); 梯度表达式里既没有 $\mathrm{std}$, 也没有 $|o_i|$. 用 PPO 目标实现这一梯度, 就是式 (6). 推导中回报 $R$ 写成 token 级奖励之和, 只有结局奖励时它就是最终对错; 论文指出这一分析同样适用于过程奖励.

式 (5) 与 [05-RLOO](../../4.4-强化学习基础/05-RLOO-留一法基线/05-RLOO-留一法基线.md) 只差一个常数因子:

$$
\frac{G}{G-1}\tilde{A}_{i}
=\frac{G}{G-1}R_i-\frac{1}{G-1}\sum_{j=1}^{G}R_j
=R_i-\frac{1}{G-1}\sum_{j\neq i}R_j=\hat{A}^{\mathrm{RLOO}}_{i}. \tag{8}
$$

RLOO 的基线不含自己那一条, Dr.GRPO 的组均值含自己; 乘以 $G/(G-1)$ 后两者相同. 这个常数可以并入学习率, 不影响训练动态. 严格说, 组均值含有 $R_i$ 本身, 基线与 $o_i$ 有关, 式 (7) 的条件只在留一形式下严格成立; 式 (8) 说明两者只差缩放, 所以无偏性可以由 RLOO 继承.

![GRPO 保留两项归一化, Dr.GRPO 两项都删](./images/fig-drgrpo-drop-two-terms.png)

> 图 1: 左栏 GRPO, 右栏 Dr.GRPO. 两栏都从同一题采 $G$ 条回复开始. 左栏先做回复内 token 平均, 再做组内 $z$-score; 右栏改为常数分母, 优势只减组均值. 底注: clip, 组采样, 0/1 结局奖励不变, 只删 $1/|o_i|$ 和 std.

**图 1 解析**

- 左栏虚线框标题 GRPO (Shao 2024). 第二格橙色标 LENGTH BIAS, 对应式 (1) 的 $1/|o_i|$; 第三格标 DIFFICULTY BIAS, 对应式 (2) 的 $(R-\mathrm{mean})/\mathrm{std}(R)$.
- 右栏虚线框标题 Dr. GRPO. 第二格写 `sum / MAX_TOKENS`, 箭头标 fixed budget; 第三格写 $A=R-\mathrm{mean}(R)$, 对应式 (5).
- 两栏之间没有箭头, 是对照关系. 竖向箭头只在栏内, 表示同一条计算流程的先后.

## 4. 实验

### 4.1 1.5B 上的对照与消融

主对照用 Qwen2.5-1.5B 基座加 R1 模板, 在 Oat 框架中训练, 奖励由 Math-Verify 给出: 回复含正确最终答案得 1, 否则得 0. 没有过程奖励, 没有长度惩罚. 超参见附录 Table 6, 所有实验通用:

| 项 | 值 |
|----|----|
| 最长回复 | 3000 token |
| 采样温度 | 1.0 |
| (top-p, top-k) | (1.0, -1) |
| 每题回复数 | 8 |
| 优化器 | AdamW, $(\beta_1,\beta_2)=(0.9,0.95)$ |
| 权重衰减 | 0 |
| 梯度裁剪 | 1.0 |
| 学习率 | $1\times10^{-6}$, 恒定 |
| 内层更新轮数 | 1 |
| KL 系数 | 0 |
| clip $\varepsilon$ | 0.2 |

所有实验在 8 张 A100 上完成, 每个约一天; 训练时启用了 Oat 支持的 actor-learner 同置 (actor 与 learner 放在同一组 GPU 上) 来提高效率. 与 DeepSeekMath 中 GRPO 的设置相比, 这里 $G=8$, 无 KL, 生成上限 3000, 超参不能混用.

Figure 5 的结果: GRPO 和 Dr.GRPO 都出现奖励与回复长度一同上升的现象, 与 R1-Zero 的曲线相似. 区别出现在奖励增长放缓之后: GRPO 的回复长度继续上升, Dr.GRPO 的长度不再大幅增长. 在评测基准上, Dr.GRPO 的错误回复明显更短. 论文认为, 「RL 让长 CoT 涌现」这一解读至少部分混入了长度偏差的作用, 并把错误回复变短与 overthinking 问题 (Chen 等, 2024) 联系起来.

附录 C 拆开两项做消融. 设置换成 Qwen2.5-1.5B 在 3K 道题上训练, 题目来自 ASDiv, MATH 和 2023 年以前的 AIME. 四个变体: Dr.GRPO, 只去长度归一化, 只去标准差归一化, 原版 GRPO. 长度曲线上, Dr.GRPO 和只去长度项的变体明显更短, 说明回复长度主要受 $1/|o_i|$ 影响. 训练奖励和评测准确率上, 去掉任一项的变体都优于原版 GRPO. Figure 9 用 3 个独立种子比较 GRPO 与 Dr.GRPO, Dr.GRPO 在 token 效率和最终准确率上的提升在统计上显著.

长度偏差并不意味着回复变长全是假象. R1-Zero 的正确回复平均长度也从 621.3 增长到 4965.4 (字符串长度). 消融说明的是: 原版 GRPO 在此之外还额外推动错误回复变长. 用平均长度衡量推理能力时, 需要先把这一部分分离出来.

### 4.2 模板与题集的组合

这一组实验从 Qwen2.5-Math-1.5B 出发, 用 Dr.GRPO 训练, 模板取 R1, Qwen-Math, 无模板三种, 题集取四档 (Table 3):

| 题集 | 规模 | 内容 |
|------|-----:|------|
| ORZ | 57k | AIME, Numina-Math, Tulu3 MATH, 覆盖面宽 |
| MATH | 12k | 高中竞赛题 |
| GSM | 8k | 小学应用题, 更简单 |
| ASDiv | 2k | 基础算术, 范围更窄 |

Figure 6 的结论有两条. 第一, 模板决定初始策略的水平, 但只要题集合适, RL 能把各条曲线提到约 40% 的相近水平. 第二, 用 R1 模板时, 题集对训练动态影响很大, 覆盖太窄会压低平台; 用 Qwen-Math 模板时, 最好的终局结果来自 GSM-8K, 用更简单且分布外的题训练, 让更难题目上的测试准确率提高到接近两倍.

论文据此得出两点. Qwen2.5-Math-1.5B 本身已有较强的解题能力, 套上模板会先破坏这一能力, 再由 RL 重建; 因此对「纯 RL 带来巨大提升」的说法应当更保守. 当基座与模板严重不匹配时 (例如 R1 模板与 Qwen2.5-Math-1.5B), 策略改进主要来自 RL, 需要题集有足够的覆盖面; 否则, 即使是很小且完全分布外的题集, 也能通过强化已有的推理行为达到同样效果, 不需要注入新知识.

### 4.3 弱基座与数学续预训练

开源 R1-Zero 复现几乎都建立在已经会解题, 会自我修正的 Qwen2.5 上. 这一节换成数学能力很弱的 Llama-3.2-3B, 用 Dr.GRPO 加 R1 模板. 另外准备两档续预训练模型: 在 FineMath 上续训的 Llama-3.2-3B-FineMath; 以及在 FineMath 模型基础上, 用 NuminaMath-1.5 拼接成的问答连续文本再续训 2 个 epoch (学习率 $1\times10^{-5}$) 得到的 Llama-3.2-3B-NuminaQA. 后一档对应第 1.2 节关于 Qwen2.5 预训练方式的假说.

Table 4 的 3B 部分:

| 模型 | AIME24 | AMC | MATH500 | Minerva | Olympiad | 平均 |
|------|--------:|----:|--------:|--------:|---------:|-----:|
| Llama-3.2-3B | 0.0 | 2.4 | 6.4 | 6.3 | 1.3 | 3.3 |
| + Dr.GRPO | 3.3 | 7.2 | 10.0 | 11.0 | 2.2 | 6.8 |
| Llama-3.2-3B-FineMath | 0.0 | 3.6 | 18.4 | 5.9 | 2.2 | 6.0 |
| + Dr.GRPO | 3.3 | 10.8 | 38.0 | 12.9 | 9.0 | 14.8 |
| Llama-3.2-3B-NuminaQA | 0.0 | 0.0 | 0.6 | 0.0 | 0.1 | 0.14 |
| + Dr.GRPO (Oat-Zero-3B) | 6.7 | 18.1 | 50.0 | 14.3 | 14.7 | 20.7 |
| Llama-3.2-3B-Instruct | 6.7 | 15.7 | 38.8 | 11.8 | 12.6 | 17.1 |

裸 Llama 经 RL 从 3.3 提到 6.8, 有提升但很小. FineMath 续训后 RL 到 14.8. NuminaQA 模型在 R1 模板下几乎不会答题 (平均 0.14), RL 之后却到 20.7, 超过 Instruct 版的 17.1. 数学续预训练提高的是 RL 能达到的上限.

同一 3B 模型上再比较 GRPO 与 Dr.GRPO (Figure 7 右). GRPO 出现准确率和长度同时上升的现象, 容易让人以为 Llama 经数学预训练后也能涌现长 CoT. Dr.GRPO 下长度没有同步上升, 说明这种同时上升可以由优化偏差产生.

### 4.4 极简配方与 7B 结果

综合以上分析, 论文给出一条极简配方: Qwen2.5-Math-7B, Dr.GRPO, MATH level 3-5 的题, Qwen-Math 模板. 引言给出的算力是 8 张 A100 约 27 小时. 得到的模型叫 Oat-Zero.

![R1-Zero-like 拆成基座检查再加 Dr.GRPO](./images/fig-r1zero-base-plus-rl.png)

> 图 2: 从左到右四步. 检查基座, 套 Qwen-Math 模板, 用 Dr.GRPO 在 MATH level 3-5 上训练, 评测 Oat-Zero-7B. 底注: 不要把全部涨幅算在 RL 上; 模板不匹配会先损害基座能力.

**图 2 解析**

- 第一格外有蓝色虚线框, 标注「pretraining already did part of the work」. 格内两行: V3-Base 已有 Aha, Qwen2.5 无模板平均 38.2. 38.2 是 Table 1 中 7B 的五项平均.
- 第二格是 Qwen-Math 模板, 写有 `im_start`, system 和 `boxed{}`, 对应 chat 格式.
- 第三格是 Dr.GRPO, MATH level 3-5, $G=8$, 无 KL.
- 第四格是 Oat-Zero-7B, AIME 2024 为 43.3%, 约 27 小时, 8 张 A100.

Qwen2.5-Math 的上下文长度是 4k, 所有对照统一把生成上限设为 3k; Open-Reasoner-Zero 和 R1-Distill-Qwen 是在更长上下文上训练的, 另外报告 8k 结果. Table 4 的 7B 部分:

| 模型 | AIME24 | AMC | MATH500 | Minerva | Olympiad | 平均 |
|------|--------:|----:|--------:|--------:|---------:|-----:|
| Qwen2.5-Math-7B | 16.7 | 38.6 | 50.6 | 9.9 | 16.6 | 26.5 |
| Qwen2.5-Math-7B\* | 0.2 | 45.8 | 69.0 | 21.3 | 34.7 | 38.2 |
| SimpleRL-Zero-7B | 26.7 | 60.2 | 78.2 | 27.6 | 40.3 | 46.6 |
| PRIME-Zero-7B | 16.7 | 62.7 | 83.8 | 36.0 | 40.9 | 48.0 |
| OpenReasoner-Zero-7B @ 3k | 13.3 | 47.0 | 79.2 | 31.6 | 44.0 | 43.0 |
| OpenReasoner-Zero-7B @ 8k | 13.3 | 54.2 | 82.4 | 31.6 | 47.9 | 45.9 |
| **Oat-Zero-7B** | **43.3** | 62.7 | 80.0 | 30.1 | 41.0 | **51.4** |
| R1-Distill-Qwen-7B @ 3k | 10.0 | 26.2 | 60.1 | 23.0 | 23.1 | 28.5 |
| R1-Distill-Qwen-7B @ 8k | 33.3 | 68.4 | 88.1 | 35.9 | 47.7 | 54.7 |
| Qwen2.5-Math-7B-Instruct | 16.7 | 53.0 | 83.6 | 29.8 | 42.7 | 45.1 |

星号行使用无模板, 是该基座得分最高的设置, 用来反映基座能力. Oat-Zero-7B 的 AIME24 为 43.3, 平均 51.4, 高于同表 3k 预算下的其他 Zero 系模型. R1-Distill-Qwen-7B 在 8k 下平均 54.7 更高, 但它是蒸馏模型, 生成上限也更长. Instruct 7B 平均 45.1, AIME24 只有 16.7.

1.5B 同配方的 Oat-Zero-1.5B: AIME24 20.0, AMC 53.0, MATH500 74.2, Minerva 25.7, Olympiad 37.6, 平均 42.1. 对照: Qwen2.5-Math-1.5B 无模板平均 33.1, R1-Distill-Qwen-1.5B 在 3k 下 22.0, 8k 下 41.5, Qwen2.5-Math-1.5B-Instruct 39.8.

AIME 只有 30 题, 一题对错就是 3.3 个百分点. 43.3% 对应 13 题, SimpleRL-Zero-7B 的 26.7% 对应 8 题. 评测用 greedy 解码, 每题只有一次结果, 单项分数的波动较大, 五项平均更稳定一些.

## 5. 与相邻方法的关系和适用范围

### 5.1 与 GRPO, RLOO, DAPO, JustRL 的差别

**与 GRPO 原文**: Shao 等的 GRPO 带组内标准差, 目标里有 $1/|o_i|$, 还有 KL 项. Dr.GRPO 删掉前两项, KL 系数为 0.

**与 RLOO**: 按式 (8) 只差 $G/(G-1)$, 训练动态等价. RLOO 来自 Ahmadian 等 (2024), 是 REINFORCE 加留一基线; Dr.GRPO 在此基础上保留了 PPO clip 和组采样的形式.

**与 DAPO**: DAPO ([arXiv:2503.14476](https://arxiv.org/abs/2503.14476)) 改 clip 上沿, 做动态采样, 用 token 级损失, 加软超长惩罚. 它的 token 级损失按 batch 内 token 总数归一化, 对应第 2.3 节的第二种写法, 消除了回复级长度偏差, 但分母仍随 batch 变化. 对于全对或全错的组, DAPO 选择丢弃并补采, Dr.GRPO 选择去掉标准差, 让这些组的优势自然为零. 两篇论文同一个月发布, 改动的侧重点不同.

**与 JustRL**: [08-JustRL](../08-JustRL-极简配方/08-JustRL-极简配方.md) 保留组内标准差和 $1/|o_i|$, clip 上沿放到 1.28, 在蒸馏过的 1.5B 模型上训练. 它的回复长度在没有惩罚的情况下反而下降, 起点与 Dr.GRPO 的基座设置不同. JustRL 的 54.87% 和 64.32% 是九项平均, Dr.GRPO 的 43.3% 是 7B 的 AIME 2024 单项, 两者不可比.

### 5.2 适用范围

主要结果来自 Qwen2.5-Math 1.5B 和 7B, 以及 Llama-3.2-3B, 任务只有数学, 奖励是二元规则分, $G=8$. 没有代码任务, 没有通用对话, 没有更大规模的模型. 问题级标准差在二元奖励, 小组的条件下会把两端难度的题放大; 奖励连续或组很大时, 这一偏差的大小没有实验数据.

| 现象 | 原因 | 处理 |
|------|------|------|
| 回复越训越长, 错误回复更长 | $1/|o_i|$ 摊薄负优势 | 分母换成常数 |
| 全对或全错附近的题梯度偏大 | 组内 $\mathrm{std}$ 很小 | 去掉 $\mathrm{std}$, 或像 DAPO 那样丢弃全同组 |
| Qwen2.5 复现曲线起点很高 | 无模板时基座已能答题 | 先测无模板基线 |
| 检测到自我修正但分数不变 | 基座已有自我修正 | V3-Base 已有; R1-Zero 上与准确率无正相关 |
| 裸 Llama RL 涨幅很小 | 数学知识不足 | 数学续预训练提高上限 |
| PPO 实现仍有长度偏差 | 损失按长度平均 | 检查 `masked_mean` 的分母 |

可以直接复用的是式 (5)(6) 和附录 Table 6. 生成上限 3k, greedy 评测, Math-Verify 二元分, 这些条件变化后数字会随之变化.

**参考文献**

1. Liu, Z., Chen, C., Li, W., Qi, P., Pang, T., Du, C., Lee, W. S., & Lin, M. (2025). [Understanding R1-Zero-Like Training: A Critical Perspective](https://arxiv.org/abs/2503.20783). 代码 [sail-sg/understand-r1-zero](https://github.com/sail-sg/understand-r1-zero).
2. Shao, Z., et al. (2024). [DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models](https://arxiv.org/abs/2402.03300).
3. Guo, D., et al. (2025). [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948).
4. Schulman, J., et al. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
5. Ahmadian, A., et al. (2024). [Back to Basics: Revisiting REINFORCE-Style Optimization for Learning from Human Feedback in LLMs](https://arxiv.org/abs/2402.14740).
6. Hendrycks, D., et al. (2021). [Measuring Mathematical Problem Solving with the MATH Dataset](https://arxiv.org/abs/2103.03874).
7. Yang, A., et al. (2024). [Qwen2.5-Math Technical Report](https://arxiv.org/abs/2409.12122).
8. Liu, A., et al. (2024). [DeepSeek-V3 Technical Report](https://arxiv.org/abs/2412.19437).
9. Yu, Q., et al. (2025). [DAPO: An Open-Source LLM Reinforcement Learning System at Scale](https://arxiv.org/abs/2503.14476).
10. He, B., et al. (2025). [JustRL: Scaling a 1.5B LLM with a Simple RL Recipe](https://arxiv.org/abs/2512.16649).
11. Andrychowicz, M., et al. (2021). What Matters for On-Policy Deep Actor-Critic Methods? A Large-Scale Study. *ICLR*.
12. Chen, X., et al. (2024). [Do Not Think That Much for 2+3=? On the Overthinking of o1-Like LLMs](https://arxiv.org/abs/2412.21187).
13. Allal, L. B., et al. (2025). [SmolLM2: When Smol Goes Big](https://arxiv.org/abs/2502.02737).
14. Yeo, E., Tong, Y., Niu, M., Neubig, G., & Yue, X. (2025). [Demystifying Long Chain-of-Thought Reasoning in LLMs](https://arxiv.org/abs/2502.03373).
15. Liu, Z., et al. (2025b). [There May Not Be Aha Moment in R1-Zero-like Training: A Pilot Study](https://oatllm.notion.site/oat-zero). Notion 博客.
