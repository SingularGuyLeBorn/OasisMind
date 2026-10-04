---
title: "03 · SDFT: 用示范条件化的自身做教师, 从示范中 on-policy 学习"
published: true
tags: ["SDFT", "Self-Distillation", "Continual Learning", "On-Policy Distillation", "灾难性遗忘", "Qwen2.5"]
excerpt: "SDFT 让模型在看到一条专家示范后充当自己的教师, 在学生自己的轨迹上做蒸馏. Qwen2.5-7B 上三个技能任务的新任务成绩都高于 SFT, 六项旧能力的平均分 SFT 为 53.4 至 60.2, SDFT 为 64.5 至 65.4, 基座为 65.5."
---
# SDFT: 用示范条件化的自身做教师, 从示范中 on-policy 学习

> 相关阅读: [01 OPD 基础原理](../01-OPD基础原理/01-OPD基础原理.md) · [02 OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md) · [04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) · [4.6 OPD 节索引](../../4.9-OPD.md)

## 1. 问题与方法

### 1.1 只有示范时怎样做 on-policy 学习

持续学习要求模型学到新技能和新知识, 同时不丢掉已有能力. 已有工作发现, 在当前策略自己生成的数据上学习, 灾难性遗忘明显少于 off-policy 训练 (Shenfeld 等 2025; Chen 等 2025). 这些 on-policy 方法大多是 RL, 需要显式的奖励函数. 现实里更常见的是专家示范数据集, 对应的主流做法是 SFT. SFT 在固定的离线分布上模仿专家动作, 先天是 off-policy 的; 连续做 SFT 适配新任务, 泛化差, 遗忘重 (Kirkpatrick 等 2017; Li & Hoiem 2017).

一个原则上可行的办法是逆强化学习 (IRL): 先从示范里推出奖励, 再做 on-policy RL. 问题在于 IRL 要恢复奖励, 需要对奖励结构做很强的先验. 最大熵 IRL 假设专家服从 Boltzmann 软最优策略; 对抗式 IRL 假设专家与学习者的轨迹能被分类器区分; RLHF 这类基于偏好的方法假设有成对的正负样本. 没有这些先验, IRL 要么不适定, 要么太贵. 这也是 IRL 实际只在 RLHF 一类先验成立的场景里落地的原因.

SDFT 换了一条路: 不推显式奖励, 而是用模型自身的上下文学习能力直接构造 on-policy 的学习信号.

### 1.2 教师与学生

给定基座策略 $\pi$, 教师是它在题目 $x$ 和示范 $c$ 条件下的分布 $\pi(\cdot\mid x,c)$, 学生是只看题目的 $\pi_\theta(\cdot\mid x)$. 教师的提示词模板如下:

```
<Question>
This is an example for a response to the question:
<Demonstration>
Now answer with a response of your own, including the thinking process:
```

作者发现这个提示词足以防止模型逐字照抄 $c$, 模型会写出反映它对示范意图理解的回答. 论文的脚注还指出, 即使不考虑持续学习, 向带特权信息的教师学习也需要 on-policy 训练 (Swamy 等 2022).

### 1.3 目标函数

对每个 $x$, 从学生采样 $y\sim\pi_\theta(\cdot\mid x)$, 最小化学生到教师的 reverse KL (论文式 (1)):

$$
\mathcal{L}(\theta)=D_{\mathrm{KL}}\big(\pi_\theta(\cdot\mid x)\,\|\,\pi(\cdot\mid x,c)\big)=\mathbb{E}_{y\sim\pi_\theta(y\mid x)}\Big[\log\frac{\pi_\theta(y\mid x)}{\pi(y\mid x,c)}\Big] \tag{1}
$$

利用自回归结构把它分解为 token 级损失, 并把教师视为固定, 得到梯度估计 (论文式 (2)):

$$
\nabla_\theta\mathcal{L}(\theta)=\mathbb{E}_{y\sim\pi_\theta}\Big[\sum_t\sum_{y_t\in\mathcal{V}}\pi_\theta(y_t\mid y_{<t},x)\log\frac{\pi_\theta(y_t\mid y_{<t},x)}{\pi(y_t\mid y_{<t},x,c)}\nabla_\theta\log\pi_\theta(y_t\mid y_{<t},x)\Big] \tag{2}
$$

式 (2) 对每个位置的整个词表求和, 即附录 A.1 所说的 「解析的逐 token 估计」.

### 1.4 三个实现细节

**教师参数用 EMA.** 附录 A.3 比较了三种教师. 冻结的基座做教师训练稳定, 但成绩一直偏低, 因为教师反映不出学习中获得的进步. 直接用当前学生做教师会严重不稳定: token 概率的小幅随机波动经 on-policy 反馈回路被迅速放大, 训练发散. 学生参数的指数滑动平均 (EMA) 两者兼顾, 图 8 显示它训练稳定, 最终成绩最好. 更新规则是 $\phi\leftarrow\alpha\theta+(1-\alpha)\phi$, $\alpha$ 在 $\{0.01,0.02,0.05\}$ 中搜索.

**实践中 forward KL 最好.** 理论推导指向 reverse KL, 但作者报告在 logit 级损失上实际用 forward KL 效果最好. 论文没有给出这一选择的对比表.

**梯度估计用解析 token 级.** 附录 A.1 比较了三种估计.

- token 级 (部分) 估计: 只在采到的 token 上取 $\log\frac{\pi_\theta}{\pi}\nabla\log\pi_\theta$, 对序列级 KL 有偏, 方差大, KL 控制弱.
- 解析逐 token 估计: 式 (2), 对词表求和, 方差严格更低, 但仍忽略 $y_t$ 对后续前缀的影响, 在序列级上有偏. 所需的量在前向中已经算出, 计算便宜.
- Rao-Blackwell 化估计 (Amini 等 2025): 在每个前缀上对下一 token 解析积分, 对前缀保留蒙特卡洛采样, 对 KL 及其梯度无偏且方差更低, 但更贵.

实验中解析估计最稳, 下游成绩最好; Rao-Blackwell 化估计没有带来可测的收益. 每题采多条轨迹降方差, 收益可以忽略, 算力却显著增加. 所有主实验因此用每题 1 条轨迹加解析估计. Algorithm 1 还注明, 推理引擎 (如 vLLM) 与训练代码的数值差异需要时可加重要性采样修正.

## 2. 理论与假设

### 2.1 自蒸馏即逆强化学习

第 3.1 节证明 SDFT 等价于最大化一个由示范和模型上下文学习能力定义的隐式奖励. 从信赖域正则的 RL 出发, 第 $k+1$ 步的更新限制在当前策略 $\pi_k$ 附近 (论文式 (3)):

$$
\pi_{k+1}=\arg\max_\pi\ \mathbb{E}_{y\sim\pi}[r(y,x)]-\beta\,D_{\mathrm{KL}}\big(\pi(\cdot\mid x)\|\pi_k(\cdot\mid x)\big) \tag{3}
$$

它的最优解是倾斜分布 $\pi^*_{k+1}(y\mid x)\propto\pi_k(y\mid x)\exp(r(y,x)/\beta)$, 反解出奖励:

$$
r(y,x)=\beta\big[\log\pi^*_{k+1}(y\mid x)-\log\pi_k(y\mid x)\big]+C \tag{4}
$$

标准 IRL 里 $\pi^*_{k+1}$ 未知. SDFT 的关键假设 (论文称为 In-Context Assumption, 式 (4)) 是: 看过示范 $c$ 的模型近似最优新策略,

$$
\pi^*_{k+1}(y\mid x)\approx\pi(y\mid x,c) \tag{5}
$$

代入式 (4), 去掉不影响最优策略的 $\beta$ 与常数 $C$, 得到隐式奖励 (论文式 (5)):

$$
r(y,x,c)=\log\pi(y\mid x,c)-\log\pi_k(y\mid x) \tag{6}
$$

按 token 分解为 $r_t=\log\frac{\pi(y_t\mid y_{<t},x,c)}{\pi_k(y_t\mid y_{<t},x)}$, 且 $\sum_t r_t=r(y,x,c)$. 在 $\pi_k$ 下的 policy gradient 为

$$
\nabla_\theta J(\pi_k)=\mathbb{E}_{y\sim\pi_k}\Big[\log\frac{\pi(y\mid x,c)}{\pi_k(y\mid x)}\nabla_\theta\log\pi_k(y\mid x)\Big] \tag{7}
$$

它在期望上与 reverse KL $D_{\mathrm{KL}}(\pi_k\|\pi(\cdot\mid x,c))$ 的梯度 (式 (2)) 相同 (差一个符号, 一个最大化, 一个最小化). 因此 SDFT 也可以看成 on-policy RL, 奖励来自 「当前行为」 与 「看过示范的自己」 的对比. 这一推导与 [05 G-OPD](../05-GOPD-散度光谱/05-GOPD-散度光谱.md) 把 OPD 写成 KL 约束 RL 的思路一致, 区别在于 SDFT 的参考策略是当前策略 $\pi_k$, 最优策略由示范条件化的模型近似.

这一推导有两处需要对照实现来读. 第一, 推导针对的是 reverse KL, 而实践中作者改用了 forward KL; 换成 forward KL 后, 式 (7) 的等价关系不再成立, IRL 解释只能看作动机. 第二, 推导中的参考策略是第 $k$ 步的当前策略 $\pi_k$, 隐式奖励每一步都在变; 实现中的教师是 EMA 参数加示范上下文, 相当于用平滑后的参数近似 「看过示范的当前策略」. 两处差别都没有改变方法的骨架: 学生采样, 示范条件化的教师打分, 逐 token 拉近两者.

从式 (6) 也能看出 SDFT 的信号在哪些 token 上为零: 示范对某个位置的分布没有影响时, $\pi(y_t\mid y_{<t},x,c)\approx\pi_k(y_t\mid y_{<t},x)$, $r_t\approx0$. 信号只出现在示范改变了模型判断的位置. 这可以部分解释 SDFT 为什么遗忘少: 与示范无关的 token 几乎不被更新, 而 SFT 要求逐字复现示范的每一个 token, 包括示范的措辞和格式.

### 2.2 检验上下文学习假设

式 (5) 的近似要成立, 需要两个条件 (第 3.2 节):

1. **最优性**: 教师的期望奖励接近未知最优策略, 即 $\mathbb{E}_{y\sim\pi(y\mid x,c)}[r(y,x)]\approx\mathbb{E}_{y\sim\pi^*_{k+1}}[r(y,x)]$.
2. **最小偏离**: 由于式 (3) 的信赖域约束, 最优策略是所有达到最大奖励的策略里离当前模型最近的一个, 因此要求 $D_{\mathrm{KL}}(\pi(\cdot\mid x,c)\|\pi_k)\approx D_{\mathrm{KL}}(\pi^*_{k+1}\|\pi_k)$.

第二个条件决定了方法的实用性. 若教师只是逐字照抄示范, 它会偏离基座很远, on-policy 的好处就没了. 已有工作也表明, 与预训练分布接近的分布遗忘更少.

作者用 Qwen2.5-7B-Instruct 和 ToolAlpaca 检验 (任务是给定工具 API 说明和用户请求, 输出正确的工具调用):

- **最优性**: 不给示范时基座只解对 42%; 每题给上对应示范后, 教师成功率 100%. 人工检查 50 条教师推理, 每一条的最终调用都正确, 中间的 CoT 也合理, 说明教师在重建推理过程, 而非照抄专家输出.
- **最小偏离**: 用相对基座的 $D_{\mathrm{KL}}(\pi\|\pi_0)$ 作为到当前策略距离的代理. 在示范上做 SFT 的模型偏离 1.26 nats, 示范条件化的教师只有 0.68 nats, 接近一半 (图 2 右). 同一张图里两者的新任务准确率相同, 教师离基座更近, 正确率并没有因此降低.

## 3. 实验与结果

### 3.1 实验设定

**技能学习** 选三个模型没有专门微调过的领域 (避开数学和代码):

- Science Q&A: SciKnowEval 的 Chemistry L-3 子集, 约 75% 训练, 5% 验证, 20% 测试. 示范由 GPT-4o 生成, 每题最多采 8 次, 保留一条最终答案正确的.
- Tool Use: ToolAlpaca, 使用原作者的划分和自带示范, 用正则匹配 API 调用评分.
- Medical: HuatuoGPT-o1. 训练取第一阶段的英文问题约 20,000 条, 评测从可验证问题集中随机抽 1,000 条, 用 GPT-5-mini 判对错.

**知识注入** 用一组 2025 年 (晚于训练截止) 自然灾害的 Wikipedia 文章, 共约 200K token, 包括 2025 年缅甸地震, 堪察加地震, 北阿坎德邦山洪, 飓风 Melissa, 7 月德州中部洪水等. 按 Mecklenburg 等 (2024) 的方法用 GPT-5 生成问答对, SFT 数据量约为原文的 5 倍. 直接问题形如 「2025 年缅甸地震影响了哪些地区」. 评测分严格准确率 (所有细节正确), 宽松准确率 (含正确信息且无错误陈述), 以及间接问题准确率 (答案依赖新知识但题面不直接提及, 例如 「2025 年哪些国家需要国际人道援助」).

三个技能领域的示范来源不同, 对结论的影响也不同. Science 的示范由 GPT-4o 生成并按答案过滤, 示范本身带推理过程; Tool Use 的示范来自数据集原作者, 是结构化的 API 调用; Medical 的训练集来自 HuatuoGPT-o1 的 SFT 阶段. 评分方式也各异: Science 是选择题精确匹配, Tool Use 是正则匹配, Medical 与知识注入用 GPT-5-mini 作评判, 提示词要求只看医学或事实准确性, 不看文风与长度. 用模型作评判会引入评判模型自身的偏差, 论文没有报告人工校验.

**旧能力** 用 HellaSwag, TruthfulQA, MMLU, IFEval, Winogrande, HumanEval 六项的平均衡量遗忘, 统一用 LM Evaluation Harness.

**基线**: 技能学习对比 SFT, DFT (Wu 等 2025, 用重要性采样把离线数据当作 on-policy 样本), 以及 Re-invocation (Lu 等 2025, SFT 之后再在通用提示上从基座做 on-policy 蒸馏以恢复能力). 知识注入对比在原文上做下一 token 预测的持续预训练 (CPT), 在问答对上做 SFT, 以及总是检索到正确文章的 Oracle RAG.

**训练细节**: 默认模型 Qwen2.5-7B-Instruct, Hugging Face TRL, 单张 H200, 全参数微调. 各方法在学习率 $\{5\times10^{-6},10^{-5},5\times10^{-5}\}$, batch $\{16,32,64\}$ 和 epoch 上搜索, 按验证集选检查点. SDFT 的最长生成长度在技能学习中为 2048, 知识注入中为 1024. SDFT 通常要多个 epoch (技能学习约 2 个, 知识注入约 4 个), SFT 多数情况下 1 个 epoch 之后就过拟合. 附录 Table 3, 4 给出搜索范围: 技能学习三种方法的 epoch 都在 $\{1,2\}$ 中选; 知识注入中 SFT 仍是 $\{1,2\}$, SDFT 放宽到 $\{1,2,4\}$, CPT 放宽到 $\{1,2,4,8\}$, 且 CPT 的学习率改在更小的 $\{10^{-6},5\times10^{-6},10^{-5}\}$ 中搜索. 准确率用贪心解码; pass@k 用温度 1.0, top-p 0.95. 除特别说明外, 每个实验 3 个随机种子.

### 3.2 单任务: 新任务与旧能力

论文 Table 5 给出每个方法的新任务成绩和六项旧能力 (三张子表的基座行相同, 只列一次):

| 方法 | 新任务 | HellaSwag | HumanEval | IFEval | MMLU | TruthfulQA | Winogrande | 旧能力平均 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Base (Qwen2.5-7B) | 见下 | 62.0 | 65.8 | 74.3 | 71.7 | 47.9 | 71.1 | 65.5 |
| **Science Q&A** | | | | | | | | |
| SFT | 66.2 | 55.0 | 54.8 | 35.3 | 64.6 | 36.8 | 73.7 | 53.4 |
| SFT + re-invoke | 66.0 | 61.6 | 63.4 | 52.9 | 68.7 | 45.2 | 70.0 | 60.2 |
| DFT | 54.8 | 57.6 | 67.0 | 60.4 | 69.4 | 38.8 | 68.2 | 60.2 |
| SDFT | 70.2 | 60.9 | 68.9 | 66.8 | 70.7 | 46.5 | 73.1 | 64.5 |
| **Tool Use** | | | | | | | | |
| SFT | 63.2 | 57.3 | 50.0 | 49.8 | 70.2 | 37.5 | 73.1 | 56.0 |
| SFT + re-invoke | 63.1 | 61.7 | 68.9 | 59.1 | 71.5 | 49.1 | 71.6 | 63.7 |
| DFT | 64.2 | 59.7 | 61.4 | 60.2 | 71.6 | 40.2 | 71.5 | 60.8 |
| SDFT | 70.6 | 61.6 | 68.3 | 71.9 | 71.5 | 47.3 | 71.7 | 65.4 |
| **Medical** | | | | | | | | |
| SFT | 35.5 | 59.5 | 62.1 | 56.6 | 70.5 | 39.8 | 72.9 | 60.2 |
| SFT + re-invoke | 35.6 | 61.5 | 63.1 | 67.6 | 70.0 | 42.3 | 71.4 | 62.6 |
| DFT | 36.2 | 61.9 | 64.6 | 74.6 | 71.6 | 40.1 | 71.3 | 64.0 |
| SDFT | 40.2 | 61.4 | 67.7 | 72.3 | 71.5 | 47.3 | 71.9 | 65.4 |

基座的新任务成绩: Science 32.1, Tool Use 42.9, Medical 30.1.

读法:

1. **新任务上 SDFT 三项都最高.** 相对 SFT 分别高 4.0, 7.4, 4.7 分. 作者把这一点归于 on-policy 训练避免了复合误差, 属于分布内泛化更好.
2. **旧能力上 SDFT 几乎不掉.** 三个任务的旧能力平均分比基座低 1.0, 0.1, 0.1 分. SFT 分别低 12.1, 9.5, 5.3 分.
3. **遗忘集中在 IFEval 和 TruthfulQA.** Science 上 SFT 的 IFEval 从 74.3 掉到 35.3, 少了 39.0 分; SDFT 是 66.8, 少 7.5 分. 三个任务上 SFT 的 TruthfulQA 都在 36.8 到 39.8 之间, 比基座低 8 到 11 分, SDFT 在 46.5 到 47.3 之间. 指令遵循和事实性这两类能力最容易被窄领域的 SFT 破坏.
4. **re-invoke 能补回一部分, 补不全.** Tool Use 上它把旧能力从 56.0 拉回 63.7, 仍低于 SDFT 的 65.4, 且多了一个训练阶段. DFT 的遗忘比 SFT 少, 但 Science 上新任务只有 54.8.

图 4 把每个训练得到的模型画在 「新任务成绩, 旧能力」 平面上, SDFT 在三个任务上都处在帕累托前沿.

三个任务之间的差别也有信息量. Medical 上 SFT 的遗忘最轻 (旧能力 60.2), DFT 的旧能力达到 64.0, 接近 SDFT, 但新任务只有 36.2. Science 上 SFT 遗忘最重 (53.4), 新任务的提升也最大 (32.1 到 66.2). 一种解释是: SFT 在新任务上提升越多, 为拟合示范对模型的改动越大, 遗忘也越重. 论文只在 ToolAlpaca 上测过 SFT 模型相对基座的 KL (1.26 nats), 没有逐任务测量, 这一解释没有直接证据. DFT 用重要性采样把离线数据当作 on-policy 样本, 能减少遗忘, 但在新任务上的收益不稳定; SDFT 在新任务和旧能力两个维度上同时领先, 三个任务都是如此.

各实验检验的对象和结论汇总如下:

| 实验 | 检验什么 | 结论 |
| --- | --- | --- |
| ToolAlpaca 上的教师成功率与 KL | 示范条件化的教师是否既正确又接近基座 | 100% 正确, KL 0.68 对 SFT 的 1.26 |
| Table 5 与图 4 | 单任务学习的新旧权衡 | 新任务最高, 旧能力基本不掉 |
| Table 1 与附录 A.2 | 能否注入新知识并泛化 | 间接问题 98 对 SFT 的 80; 教师需要看到答案 |
| 图 3 | 连续学多个任务 | SDFT 累积, SFT 震荡 |
| 图 5 右 | 增益是否来自熵塌缩 | pass@k 到 128 都保持优势 |
| Table 2 | 只有答案时能否保住长推理 | 准确率 43.7 对 SFT 的 23.5 |
| 图 6 | 收益是否只来自教师质量 | 离线用同一教师不如 on-policy |
| 图 5 左 | 对规模的依赖 | 3B 不如 SFT, 7B 与 14B 领先 |

### 3.3 知识注入

论文 Table 1:

| 方法 | 严格准确率 | 宽松准确率 | 间接问题准确率 |
| --- | --- | --- | --- |
| Base | 0 | 0 | 0 |
| Oracle RAG | 91 | 100 | 100 |
| CPT | 9 | 37 | 7 |
| SFT | 80 | 95 | 80 |
| SDFT | 89 | 100 | 98 |

基座没见过这些知识, 全部答错. CPT 表现差, 与 Mecklenburg 等 (2024) 的观察一致. SFT 严格准确率 80, SDFT 89, 接近 Oracle RAG 的 91. 差距在间接问题上更大: SDFT 98, SFT 80. 作者的解释是 SFT 学会了复现特定答案, 却没有把底层事实可靠地并入模型的知识. 附录 A.2 的消融显示, 教师只看原文时严格准确率为 75%, 看到原文加答案时为 89%, 说明示范中的答案部分不可缺少. 这组消融固定 on-policy 训练, 只换教师上下文, 共三种: 只给原文, 只给答案, 原文加答案; 只给答案的效果最差, 只给原文居中. 对照的是近期用自蒸馏做知识注入的工作 (Eyuboglu 等 2025 的 Cartridges; Kujanpää 等 2025), 它们只把原文放进教师上下文, 并且离线蒸馏. SDFT 在两处不同: 教师还看到一个写好的答案, 蒸馏在学生自己的生成上进行.

### 3.4 增益不来自熵塌缩, 以及连续学三个任务

on-policy RL 的成绩提升有时只是降低熵, 让分布更尖, 而非学到新行为 (Yue 等 2025). 作者在技能学习上测了 $k$ 最大到 128 的 pass@k, 图 5 右显示 SDFT 相对基座和 SFT 的优势在所有 $k$ 上都保持, 据此认为是真实的技能获取. 作者还据此建议把 SDFT 当作后续 RL 的初始化.

**连续学三个任务.** 图 3 用一个模型依次学 Science, Tool Use, Medical 三个技能, 成绩按线性归一化 (0 为基座在该任务上的成绩, 1 为两种方法在该任务上的最好成绩). SDFT 每学一个新任务, 之前学过的任务基本保持. SFT 每换到下一个任务, 前一个任务的成绩立刻下降, 曲线来回震荡, 没有累积. 图 3 只给出归一化曲线, 没有对应的数值表, 也没有报告三个任务学完之后六项旧能力的分数.

### 3.5 推理模型, 只有答案的数据, 以及 on-policy 的必要性

很多真实数据集只给最终答案, 没有完整推理. 对长 CoT 模型做这类数据的 SFT, 会惩罚长推理而偏向与监督匹配的短输出. 论文 Table 2 用 Olmo-3-7B-Think 在第 3.1 节的医疗任务上验证 (训练数据不含显式 CoT 标注):

| 模型 | 准确率 | 平均 token 数 |
| --- | --- | --- |
| Olmo-3-7B-Think | 31.2 | 4612 |
| + SFT | 23.5 | 3273 |
| + SDFT | 43.7 | 4180 |

SFT 准确率下降 7.7 分, 回答缩短约 29%. SDFT 准确率提高 12.5 分, 长度只缩短约 9%. 教师来自同一个模型, 看到短答案之后仍按自己的长推理风格作答, 学生学到的分布也保留了这种风格.

**on-policy 是必需的.** 第 4.6 节在 Tool Use 上比较同一个示范条件化教师的三种用法: 在教师样本上做 SFT; 在教师样本的固定数据集上做 KL 离线蒸馏; 以及 SDFT. 图 6 显示两种离线用法都好于普通 SFT, 但都不如 SDFT. 由此可见收益不能只归于教师质量, on-policy 训练本身贡献了一部分.

### 3.6 规模的影响

SDFT 依赖上下文学习能力, 而上下文学习能力随规模增强. 作者在 Qwen2.5 的多个尺寸上做 Science Q&A (图 5 左): 3B 时模型的上下文学习太弱, 教师给不出有效指导, SDFT 不如 SFT; 7B 时比 SFT 高约 4 分, 14B 时高约 7 分.

这与 [04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) 在 Qwen2.5-1.5B 上不如 GRPO 的结论方向一致: 自蒸馏方法的收益与模型的上下文学习能力绑定. 作者据此推测, 模型继续变大, 上下文学习继续变强, SDFT 的优势会更明显; 但实验只做到 14B, 也只在 Science Q&A 一个任务上做了规模对比, 这一推测还需要更大模型和更多任务来检验.

## 4. 代价, 复现与相关方法

### 4.1 代价与局限

**计算量.** SDFT 训练中需要生成 on-policy rollout, 实验中约为 SFT 的 2.5 倍 FLOPs, 4 倍墙钟时间. 作者的论点是, Re-invoke 这类方法本身就要先 SFT 再做 on-policy 恢复, 算上多阶段流程, SDFT 的总训练时间可能更短. 与 GRPO 这类 RL 相比, SDFT 每题只需 1 条生成, 而且监督在 token 级甚至 logit 级, 比 GRPO 的轨迹级优势更密.

**学到伪迹.** 教师看过示范或原文, 回答有时以 「Based on the text...」 「Following the example...」 开头. 学生没有这些上下文, 却会学着输出这些套话. 作者发现训练时屏蔽前几个 token 的损失就能压住这些伪迹, 且不损害下游准确率, 但承认这是启发式补救, 更有原则的解法还没有找到.

**能力前提.** 小模型上下文学习弱, 教师信号无效. 此外, 方法擅长在保留现有能力的前提下学新技能和新知识, 对需要根本改变生成模式的目标不擅长. 作者举的例子是把非推理模型变成输出显式 CoT 的推理模型, 实验中很难做到.

**仍有遗忘.** 相对 off-policy 方法遗忘大幅减少, 但没有消失: Science 任务上 IFEval 仍低 7.5 分.

作者列出的后续方向包括与 on-policy RL 结合 (先 SDFT 后 RL, 或同时混合示范信号与奖励信号), 进一步减少遗忘, 以及从非专家, 有噪声或无结构的数据 (如用户对话) 中学习.

### 4.2 复现要点

按 Algorithm 1 与附录 B, 一个最小实现包括:

1. 数据是 $(x,c)$ 对. 学生上下文 $\mathrm{Ctx}_S(x)$ 只放题目; 教师上下文 $\mathrm{Ctx}_T(x,c)$ 用第 1.2 节的模板放题目与示范. 初始化教师参数 $\phi=\theta$.
2. 每步取一个 minibatch, 用学生上下文采一条回答, 技能学习截断到 2048 token, 知识注入截断到 1024 token.
3. 把同一条回答分别接在学生上下文和教师上下文之后, 学生用 $\theta$, 教师用 $\phi$ 各做一次前向, 取回答部分每个位置的分布.
4. 用解析逐 token 估计计算梯度并更新 $\theta$; 若采样用 vLLM 等推理引擎, 按需加重要性采样修正训练与推理的数值差异.
5. 更新教师: $\phi\leftarrow\alpha\theta+(1-\alpha)\phi$, $\alpha$ 取 0.01 到 0.05.

学习率在 $5\times10^{-6}$ 到 $5\times10^{-5}$ 之间搜索, cosine 调度, 10 步 warmup, 梯度裁剪 1.0, bf16, 不用权重衰减. SDFT 比 SFT 需要更多 epoch, 不要沿用 SFT 的 1 个 epoch 设置.

几个容易忽略的点. 若发现学生输出 「Based on the text」 一类开头, 屏蔽回答前几个 token 的损失. EMA 教师要额外存一份参数, 显存比 SFT 多一份模型. 教师上下文里多了一条示范, 示范很长时教师前向的序列会明显长于学生. 知识注入任务里 「示范」 是原文加答案, 只给原文时效果下降 14 个百分点 (75 对 89).

### 4.3 与 OPSD, SDPO 的关系

论文在相关工作中说明, Zhao 等 ([02 OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md)) 与 Hübotter 等 ([04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md)) 同期独立提出了自蒸馏算法. 三者的共同骨架见 [01](../01-OPD基础原理/01-OPD基础原理.md) 第 4.1 节. SDFT 的特点是: 特权信息是一条专家示范, 目标场景是持续学习, 评价重点是新任务成绩与旧能力的权衡, 并给出了 IRL 视角的推导.

SDFT 与 context distillation (Bai 等 2022; Snell 等 2022) 的区别有两点: 训练是 on-policy 的; 教师的上下文是为每道题单独挑的示范, 而非固定的提示前缀.

## 参考文献

1. Shenfeld, Damani, Hübotter, Agrawal. *Self-Distillation Enables Continual Learning*. arXiv:2601.19897. [链接](https://arxiv.org/abs/2601.19897) · 项目页 [idanshenfeld.com/SDFT](http://idanshenfeld.com/SDFT)
2. Yang, Pang, Feng, Wang, Chen, Zhu, Liu. *Self-Distillation Bridges Distribution Gap in Language Model Fine-Tuning*. ACL 2024. [链接](https://arxiv.org/abs/2402.13669)
3. Agarwal 等. *On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes*. arXiv:2306.13649. [链接](https://arxiv.org/abs/2306.13649)
4. Tang, Munos. *On a Few Pitfalls in KL Divergence Gradient Estimation for RL*. arXiv:2506.09477. [链接](https://arxiv.org/abs/2506.09477)
5. Snell, Klein, Zhong. *Learning by Distilling Context*. arXiv:2209.15189. [链接](https://arxiv.org/abs/2209.15189)
6. Ross, Gordon, Bagnell. *A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning*. AISTATS 2011. [链接](https://arxiv.org/abs/1011.0686)
