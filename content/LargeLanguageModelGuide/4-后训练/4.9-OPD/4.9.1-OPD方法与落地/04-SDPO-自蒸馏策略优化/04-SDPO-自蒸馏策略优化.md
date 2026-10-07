---
title: "04 · SDPO: 自蒸馏策略优化"
published: true
tags: ["SDPO", "Self-Distillation", "RLVR", "RLRF", "Rich Feedback", "OPD", "后训练", "强化学习"]
excerpt: "SDPO 让同一个模型在看到环境反馈后充当自己的教师, 对已生成的回答重算逐 token 概率, 用师生对数概率差替换 GRPO 的标量优势. 在 LiveCodeBench v6 上 Qwen3-8B 从 GRPO 的 41.2 提到 48.8, 回答长度约为 GRPO 的三分之一."
---
# · SDPO: 自蒸馏策略优化

## 问题与方法

### RLVR 的信号瓶颈

GRPO 对题目 $x$ 采 $G$ 条回答 $y_1,\dots,y_G$, 由验证器给出奖励 $r_i$. 论文的基线用不做标准差归一化的版本:

$$
A_{i,t}^{\mathrm{GRPO}}=r_i-\mathrm{mean}\{r_j\}_{j=1}^{G}, \tag{1}
$$

只作用在实际采到的 token $y_{i,t}$ 上, 在一条回答内对 $t$ 是常数. 这带来两个问题. 一是信用分配: 回答中哪一步出了错, 优势里没有信息, 整条回答的每个 token 一起被加强或削弱. 二是组内奖励相同时式 (1) 全为 0, 对二元奖励来说, 模型在一道题上第一次答对之前, 这道题完全不产生梯度.

蒸馏可以给出逐 token 的稠密监督, 但前提是有一个更强的教师. [01 OPD](../01-OPD基础原理/01-OPD基础原理.md) 用外部大模型当教师; 在线学习一个前沿模型时, 往往找不到比它更强的教师. 论文的出发点是: 环境本身给了很多文本信息, 当前模型把这些信息放进上下文后, 对 「原回答哪里错了」 的判断会比生成时更准. 于是同一个模型可以扮演两个角色, 生成时是学生, 事后看反馈时是教师.

论文 Table 1 把几类后训练方法按两个维度排开: 数据是否 on-policy, 信号来源与密度. SFT 与离线蒸馏是 off-policy 且要强教师; On-Policy Distillation 是 on-policy 但仍要强教师; RLVR 是 on-policy, 信号来自环境但只有标量; SDPO 是 on-policy, 信号来自环境并且是富文本.

论文把环境返回文本反馈的设定称为 RLRF (Reinforcement Learning with Rich Feedback). RLVR 里标量奖励把环境状态遮住了; RLRF 中反馈 $f$ 可以是智能体所到达的任意状态的 token 化表示, 既包含奖励, 也包含状态的具体观察, 例如代码环境的运行错误或 LLM 评委的评语. 论文图 3 给出代码环境 (仿照 LeetCode) 的一条反馈:

```text
Runtime Error
ZeroDivisionError: division by zero
Line 73 in separateSquares (Solution.py)
Last Executed Input [[26,30,2],[11,23,1]]
```

附录另列了答案错误, 内存错误, 下标越界三种反馈的样例. 在 RLVR 里, 这几种失败得到的奖励都是 0.

**自教师与损失**

记 $f$ 为反馈. 自教师就是当前策略在额外上下文下的分布 $\pi_\theta(\cdot\mid x,f,y_{<t})$. SDPO 的损失是逐位置的 KL:

$$
\mathcal{L}_{\mathrm{SDPO}}(\theta)=\sum_t\mathrm{KL}\bigl(\pi_\theta(\cdot\mid x,y_{<t})\,\big\|\,\mathrm{stopgrad}(\pi_\theta(\cdot\mid x,f,y_{<t}))\bigr), \tag{2}
$$

其中 $\mathrm{KL}(p\|q)=\sum_i p(i)\log(p(i)/q(i))$, 学生在前, 教师在后. stopgrad 阻止梯度流过教师, 否则教师会向学生回退, 不再利用 $f$.

Algorithm 1 的一步: 采题 $x$, 采 $G$ 条回答, 从环境取得每条的反馈 $f_i$, 计算自教师对原回答的 $\log\pi_\theta(y_{i,t}\mid x,f_i,y_{i,<t})$, 对式 (2) 做梯度下降. 教师只对已有回答做一次前向, 不重新解码.

**优势的形式**

命题 2.1 给出式 (2) 的梯度:

$$
\nabla\mathcal{L}_{\mathrm{SDPO}}=\mathbb{E}_{y\sim\pi_\theta(\cdot\mid x)}\Bigl[\sum_{t=1}^{|y|}\mathbb{E}_{\hat y_t\sim\pi_\theta(\cdot\mid x,y_{<t})}\Bigl[\log\frac{\pi_\theta(\hat y_t\mid x,y_{<t})}{\pi_\theta(\hat y_t\mid x,f,y_{<t})}\nabla_\theta\log\pi_\theta(\hat y_t\mid x,y_{<t})\Bigr]\Bigr].
$$

这是一个取负号的 logit 级策略梯度, 对应的优势为

$$
A_{i,t}^{\mathrm{SDPO}}(\hat y_{i,t})=\log\frac{\pi_\theta(\hat y_{i,t}\mid x,f_i,y_{i,<t})}{\pi_\theta(\hat y_{i,t}\mid x,y_{i,<t})}. \tag{3}
$$

与式 (1) 比较有两处差别. 第一, 式 (3) 对每个位置的每个候选 token $\hat y$ 都有一个值, 教师更支持的为正, 更反对的为负, 只有师生完全一致时为 0. 第二, 反馈从 1 bit 扩展为任意 token 序列. 因此现有 RLVR 实现只需替换优势的计算即可接入 SDPO, 论文实验用 verl 实现.

论文图 4 给出 Qwen3-8B 的一个例子: 模型生成回答后看到报错, 对原回答逐 token 计算 $\log(P_{\text{教师}}/P_{\text{学生}})$, 负值集中在少数出错位置, 其他位置接近 0. 这个例子里反馈只有报错, 没有正确解, 模型仍然定位到了错误.

### 自教师的模板

Table 2 给出教师的提示模板. User 侧依次放: 原题; 若同组已有成功回答, 放一段 「Correct solution:」 和该回答; 若原回答失败且没有成功解, 放 「The following is feedback from your unsuccessful earlier attempt:」 和环境输出; 最终一句 「Correctly solve the original question.」. Assistant 侧放原回答, 只用来重算对数概率. 若原回答本身成功, 它就作为正确解放进模板.

同组成功回答由学生自己采得, 作用与 GRPO 的组内比较相近; 它和 [02 OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md) 由数据集提供的标准答案来源不同.

**计算与显存**

相对 GRPO, SDPO 唯一的额外计算是教师前向, 可以并行, 比逐 token 解码快得多. 论文图 5 分别画了计入与不计入代码环境执行时间的单步耗时, 两种口径下增量都较小, 所用 micro batch 为 2, 增大 micro batch 还能进一步降低开销.

完整计算 KL 需要同时保留师生两份整词表 logits. SDPO 只取学生的 top-$K$ 个 logit 与教师在这些位置上的 logit, 再加一项尾部概率 (附录 A.3). 记 $\mathcal{K}_t=\mathrm{top}_K(\pi_\theta(\cdot\mid x,y_{<t}))$, $S_t^{\pi}=\sum_{\hat y\in\mathcal{K}_t}\pi_\theta(\hat y\mid x,y_{<t})$, $S_t^{q}=\sum_{\hat y\in\mathcal{K}_t}q_\theta(\hat y\mid x,f,y_{<t})$, 其中 $q_\theta$ 是自教师, 近似式为

$$
\mathcal{L}_{\mathrm{SDPO}}\approx\sum_{t}\Bigl[\sum_{\hat y\in\mathcal{K}_t}\pi_\theta(\hat y\mid x,y_{<t})\log\frac{\pi_\theta(\hat y\mid x,y_{<t})}{\mathrm{stopgrad}(q_\theta(\hat y\mid x,f,y_{<t}))}+(1-S_t^{\pi})\log\frac{1-S_t^{\pi}}{\mathrm{stopgrad}(1-S_t^{q})}\Bigr]. \tag{4}
$$

第二项把 top-$K$ 之外的全部概率合成一个尾部桶. top-$K$ 按学生取, 作者的理由是某一位置上词表中多数 token 不携带信息. $K=100$ 时几乎没有额外显存, 成绩也没有明显下降.

### 稳定性

论文发现两处修改显著提升稳定性. 一是正则化教师, 二选一: 用学生参数的 EMA $\theta'\leftarrow(1-\alpha)\theta'+\alpha\theta$ 作教师; 或者在初始教师与当前教师之间插值,

$$
q(\cdot)\propto\exp\bigl((1-\alpha)\log q_{\mathrm{ref}}(\cdot)+\alpha\log q_\theta(\cdot)\bigr), \tag{5}
$$

附录 A.2 的出发点是给教师加信赖域约束 $\sum_t\mathrm{KL}(q\,\|\,q_{\mathrm{ref}})\le\epsilon$, 式 (5) 是满足约束且离 $q_\theta$ 最近的教师, $\alpha\in(0,1)$ 是拉格朗日乘子的倒数, 推导见附录 B.2. 两种实现的代价不同: EMA 要多存一份参数 $\theta'$, 不增加运行时间; 信赖域要多算一次 $q_{\mathrm{ref}}$ 的对数概率, 若训练本来就用 $\theta_{\mathrm{ref}}$ 做 KL 正则, 则不增加显存.

二是把散度换成对称的 Jensen-Shannon 散度, Agarwal 等在外部教师的 on-policy 蒸馏中也观察到 JSD 更稳定.

附录 A.4 把梯度推广到 PPO 风格的 off-policy 训练. 基线 GRPO 的 token 级损失结合了 PPO 裁剪, 截断重要性采样 (TIS), clip-higher 与固定长度归一化:

$$
\mathcal{L}_{\mathrm{token}}=-\frac{1}{\sum_i|y_i|}\sum_{i=1}^{G}\sum_{t=1}^{|y_i|}\min(w_{i,t}^{\mathrm{TIS}},\rho)\min\bigl(w_{i,t}A_{i,t},\,\mathrm{clip}(w_{i,t},1-\varepsilon_{\text{low}},1+\varepsilon_{\text{high}})A_{i,t}\bigr), \tag{6}
$$

其中 $w_{i,t}=\pi_\theta(y_{i,t}\mid\cdot)/\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid\cdot)$, $w_{i,t}^{\mathrm{TIS}}=\pi_{\theta_{\mathrm{old}}}(y_{i,t}\mid\cdot)/\pi_{\theta_{\mathrm{old}}}^{\mathrm{rollout}}(y_{i,t}\mid\cdot)$ 修正推理引擎与训练引擎的数值差异. logit 级版本把对采样 token 的求和换成对每个位置所有候选 (或 top-$K$) 的求和, 每个候选用自己的优势 $A_{i,t}(\hat y)$, TIS 权重也改为直接乘候选在 $\pi_{\theta_{\mathrm{old}}}$ 下的概率并截断在 $\rho\,\pi_{\theta_{\mathrm{old}}}^{\mathrm{rollout}}$, 不再用蒙特卡洛估计下一 token 的期望. 正文实验全部是严格 on-policy, 每批生成只做一步梯度.

## 只有对错信号的任务

### 设置

第 2 节先在标准 RLVR 环境里测试, 环境只给标量奖励. SDPO 不使用标量本身, 只把本批次同一题的成功回答当作失败回答的反馈. 任务包括 SciKnowEval 中 L3 推理子集的化学, 物理, 生物, 材料四项本科难度科学问答, 以及 ToolAlpaca 工具调用, 做训练集与测试集划分. 初始模型为 Qwen3-8B 与 Olmo3-7B-Instruct, 指标为每题 16 次采样的平均准确率, 横轴为不含初始化与验证的墙钟时间. 每组实验在一个 4×GH200 节点上运行, 含初始化与验证约 6 小时.

GRPO 基线吸收了近期改进: 非对称裁剪, 去掉有偏的长度归一化, 推理框架 off-policy 修正; 它每批生成做 4 次 mini batch 更新. 另设一个与 SDPO 超参对齐的 on-policy GRPO. 两种基线都做了超参搜索, 按 5 小时验证成绩选最优.

**结果**

Table 3 给出 1 小时与 5 小时内的最高成绩 (每格为 1h / 5h):

| 模型 | 方法 | Chemistry | Physics | Biology | Materials | Tool use |
| --- | --- | --- | --- | --- | --- | --- |
| Qwen3-8B | 基座 | 41.2 | 59.2 | 30.8 | 58.9 | 57.5 |
| | GRPO | 65.9 / 74.5 | 63.8 / 72.7 | 35.1 / 59.9 | 74.3 / 77.1 | 64.9 / 67.7 |
| | on-policy GRPO | 63.3 / 63.4 | 63.6 / 63.6 | 49.8 / 49.8 | 73.9 / 74.1 | 60.2 / 65.7 |
| | SDPO | 73.2 / 80.9 | 66.6 / 75.6 | 50.6 / 56.8 | 72.1 / 78.4 | 68.0 / 68.5 |
| Olmo3-7B-Instruct | 基座 | 22.8 | 37.7 | 16.2 | 36.7 | 39.3 |
| | GRPO | 39.7 / 56.7 | 55.3 / 63.3 | 35.6 / 55.8 | 70.9 / 75.0 | 56.4 / 65.0 |
| | on-policy GRPO | 51.4 / 57.5 | 62.7 / 62.7 | 49.8 / 49.8 | 73.3 / 73.5 | 56.8 / 60.6 |
| | SDPO | 68.0 / 80.0 | 59.9 / 66.1 | 48.0 / 52.8 | 73.7 / 79.1 | 60.8 / 62.1 |

十个 5 小时格子里 SDPO 有 7 个高于 GRPO; Biology 两格与 Olmo 的 Tool use 低于 GRPO. 化学上差距最大: Olmo3-7B-Instruct 上 SDPO 用 50 分钟达到 GRPO 5 小时的成绩, 约 6 倍加速, 5 小时成绩高出 23.3 个点. 摘要给出的总体平均为 70.2 对 66.6.

on-policy GRPO 与 SDPO 同样每批只做一步更新, 可以直接对比. 它在多格中 1 小时与 5 小时成绩几乎相同, 两种模型的 Biology 都停在 49.8, Physics 停在 63.6 和 62.7, 第一小时之后基本不再提升; SDPO 在同样的更新频率下 5 小时内仍在上升, 例如 Qwen3-8B 化学从 73.2 到 80.9. 带 4 次 off-policy 更新的 GRPO 后期追得更快, 在 Biology 上反超. 这些 SDPO 结果都是严格 on-policy, 作者把 off-policy 多步更新列为后续方向.

**回答变短**

SDPO 的回答在各任务上平均比 GRPO 短 3 倍以上. Table 8 的平均长度: Qwen3-8B 上 GRPO 820.8, SDPO 255.8; Olmo3-7B-Instruct 上 GRPO 1095.4, SDPO 343.9. Olmo 化学任务上缩短达 11 倍 (图 6 右), 准确率仍更高.

图 7 给出一道 logD 选择题的对比, 训练 50 步后的 Qwen3-8B: GRPO 回答 5549 token, 含 5 次 「Hmm.」, 9 次 「No.」, 25 次 「Wait」, 同一算式 $10^{1.85}\approx69.3$ 出现四次, 最终选错为 B; SDPO 回答 764 token, 选对 C. 作者的解释是逐 token 的稠密优势会惩罚填充词与循环推理, 附录 F 图 21 显示 SDPO 的优势在 token 上是稀疏的. RLVR 的经验是回答变长带来推理能力, 这组结果说明提升推理效果也可以通过改进推理方式, 不一定靠加长.

**有富反馈的代码任务**

**设置与主结果**

代码环境会返回运行错误与失败的单元测试. 论文使用 LiveCodeBench v6 子集, 共 131 题, 发布于 2025 年 2 月至 5 月. 训练中用公开测试给反馈, 用私有测试做验证, 公开测试取私有测试的 50% 随机子集. 默认模型 Qwen3-8B, 报告 4 次采样的平均准确率, GRPO 基线与第 2 节相同.

SDPO 最终准确率 48.8, GRPO 41.2; 同一子集在公开榜单上, Claude Sonnet 4 为 40.5, Claude Opus 4 为 39.7. SDPO 达到 GRPO 最终成绩所需的生成量少 4 倍. 按 LCB 自带的难度分层, SDPO 的提升集中在 medium 与 hard 题 (图 15).

Table 9 在第 80 步对比更多 RLVR 基线 (3 个种子的标准差):

| 方法 | 第 80 步成绩 | 训练期平均 |
| --- | --- | --- |
| GRPO | 41.2±0.8 | 38.2 |
| GRPO, 只更新高熵 token | 37.8±2.2 | 35.9 |
| GSPO | 40.1±2.3 | 37.7 |
| CISPO | 41.2±1.8 | 37.8 |
| SDPO | 48.8±0.6 | 43.8 |

各种 GRPO 变体彼此接近, SDPO 与它们拉开约 7 个点.

### 遗忘与规模

已有工作发现 GRPO 这类 on-policy 算法训练后, 模型不太会丢掉已有能力, 于是可以在多个任务上依次训练, 不必每次从头重训. SDPO 也是 on-policy, 论文检验它是否保留这一性质. Table 5 比较最终 checkpoint 在训练任务与留出任务上的成绩. 另加一个基线: 用初始自教师生成的成功回答直接做 SFT, 这是标准的 off-policy 蒸馏. 同样步数下它需要 2 倍的生成量, 因为学生和教师都要生成; 只用自教师的成功回答, 比混入学生自己的成功回答成绩更高. 评测集中 IFEval 考格式指令遵循, ArenaHard-v2 是来自 LMArena 的真实指令, 由模型评判, MMLU-Pro 考多任务知识与推理.

| | LCBv6 | IFEval | ArenaHard-v2 hard | ArenaHard-v2 creative | MMLU-Pro | 留出平均 |
| --- | --- | --- | --- | --- | --- | --- |
| Base | 27.9 | 83.9 | 14.0 | 13.7 | 62.5 | 43.5 |
| 自教师样本上 SFT | 42.7 | 83.7 | 11.2 | 8.9 | 61.9 | 41.4 |
| GRPO | 41.2 | 82.2 | 12.0 | 10.8 | 62.3 | 41.8 |
| SDPO | 48.8 | 83.2 | 12.3 | 11.1 | 62.9 | 42.4 |

三种方法的留出平均都低于基座, SDPO 掉得最少, 训练任务成绩最高. 在自教师样本上做 SFT 的训练任务成绩接近 GRPO, 但 ArenaHard creative 从 13.7 掉到 8.9, 遗忘最重. 这与 [03 SDFT](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md) 中 on-policy 方法遗忘少的结论一致.

**规模.** 图 8 在 Qwen3 不同规模上比较第 80 步成绩: 模型越大, SDPO 相对 GRPO 的优势越大, 小模型上只略好. 为了看更弱的模型, 附录图 17 补做 Qwen2.5-Instruct: 7B 上 SDPO 优于 GRPO, 1.5B 上 SDPO 低于 GRPO. 作者把自教师准确回看反馈的能力视为随规模出现的能力, 依据是上下文学习能力随模型增大而增强.

**信用分配粒度**

图 10 左把 SDPO 的优势分成三种粒度: logit 级 (式 (3), 每个候选 token), token 级 (只对采到的 token), 序列级 (整条回答一个值). 成绩依次为 logit 级 > token 级 > 序列级, 但序列级 SDPO 仍明显高于 GRPO. 这里的序列级做法是把一条回答上所有 token 的 SDPO 优势取平均, 得到一个标量, 信用分配不比 GRPO 更细, 只多用了反馈. 所以富反馈与稠密信用分配各自带来收益, 两者可以叠加.

附录 A.1 另外推导了序列级 KL 的梯度估计量, 它多出一项, 刻画前缀如何影响后续 token 的蒸馏散度. 作者试过这个估计量, 相对增加的复杂度没有测到可观的收益, 所以正文用式 (2) 的逐 token 形式.

**自教师在训练中变强**

自教师的参数随训练更新, 学生因此有一个不断变强的目标. 图 10 右在当前训练批上比较自教师与学生的生成准确率 (5 步滑动平均): 自教师显著提升, 训练后期学生的准确率超过了初始教师. 所以初始自教师的水平不构成学生成绩的上限.

正则化方式的影响见 Table 4 (第 90 步内最好与平均成绩, 3 个种子的标准误, $\alpha=0.01$):

| 教师 | 最好 | 平均 |
| --- | --- | --- |
| 当前参数 $q_\theta$ | 36.1±1.6 | 29.8±1.3 |
| 冻结的初始教师 | 48.8±0.7 | 44.4±0.2 |
| 信赖域, 式 (5) | 50.6±0.9 | 45.6±0.2 |
| EMA | 49.3±0.3 | 45.3±0.2 |

不加正则时训练最终发散. 冻结初始教师已经能达到 48.8, 信赖域最好.

**反馈内容**

Table 6 比较教师上下文里放什么 (训练到第 60 步, 3 个种子的标准差). 「同输出率」 是教师得到与学生原回答相同环境输出的比例, 越低说明教师在探索不同解法.

| 反馈 $f$ | 训练前教师准确率 | 同输出率 | 训练后学生准确率 | 学生平均熵 |
| --- | --- | --- | --- | --- |
| 环境输出 | 32.5±0.5 | 13.7±0.6 | 39.9±1.1 | 0.40 |
| 同组成功解 | 42.4±1.0 | 12.1±0.7 | 42.6±1.3 | 0.41 |
| 环境输出 + 成功解 | 42.5±1.2 | 10.1±0.2 | 48.3±1.4 | 0.38 |
| 原回答 + 环境输出 + 成功解 | 39.3±0.8 | 30.0±0.9 | 44.5±1.3 | 0.23 |

环境输出与成功解互补. 成功解只在模型已经能解这道题时才有, 作用接近 GRPO 的组内比较, 区别是教师能指出具体错在哪里, 而 GRPO 给所有 token 同样的负优势. 环境输出在学生从未解出时也能提供信号, 第 4 节的单题场景依赖的正是这一点. 把原回答 $y$ 也放进教师提示时, 同输出率升到 30.0, 熵降到 0.23: 教师被拉向学生原来的尝试, 学生分布的熵随之下降, 起初不确定的 token 上降得最多, 探索减少, 学生成绩下降. 所以默认模板不放原回答. 作者另外报告, 模板措辞的小改动对成绩影响不大.

### 与 GRPO 混合

GRPO 的优势是蒙特卡洛估计, 对期望奖励 $J(\theta)=\mathbb{E}_{y\sim\pi_\theta}[r(y\mid x)]$ 无偏; SDPO 的优势来自反馈与自教师, 对 $J(\theta)$ 有偏, 但方差通常更低. 这对应 RL 中蒙特卡洛优势与自举优势的区别. 于是论文试了把两种优势加权:

$$
A_{i,t}=\lambda A_{i,t}^{\mathrm{GRPO}}+(1-\lambda)A_{i,t}^{\mathrm{SDPO}}, \tag{7}
$$

取 $\lambda=0.9$. 图 11 显示, Qwen3-0.6B 上混合显著优于纯 SDPO, 因为弱模型的自教师优势不可靠, 加入 GRPO 的标量信号能稳住训练; Qwen3-8B 上混合略差于纯 SDPO, 作者认为对强初始模型来说只由标量奖励决定的 GRPO 信号反而有害.

## 推理阶段对单题自蒸馏

### 设定

第 4 节考虑另一种用法: 只有一道难题和它的环境, 目标是尽快找到一个解. 论文定义

$$
\mathrm{discovery@}k=\mathbb{P}\bigl(r(y_1\mid x)=1\ \text{或}\ \dots\ \text{或}\ r(y_k\mid x)=1\bigr), \tag{8}
$$

即算法前 $k$ 次尝试中至少一次成功的概率. 对从固定模型独立采样的 best-of-$k$, 它就是 pass@$k$; 对逐次改变的算法, 它是 pass@$k$ 的推广.

在单道题上做 RLVR 无法胜过 best-of-$k$, 因为二元奖励在第一次成功之前没有信号. SDPO 每次尝试后都拿到反馈, 在还没成功时就能修正错误. 对比的多轮方法把历史反馈拼进上下文, 权重不变; SDPO 把 $(y,f)$ 蒸进权重 (图 12), 不受上下文长度限制.

### 设置与结果

题目来自 LCBv6, 按基座表现分档: hard 为 pass@64<0.5, very hard 为 pass@64<0.03; 只保留 2750 次尝试内至少有一种方法解出的题, hard 19 道, very hard 9 道. 每题 5 个种子. best-of-$k$ 用 2944 次独立采样估计 pass@$k$. 多轮方法受 Qwen3-8B 40k 上下文限制, 提示达到 32k 后按先进先出丢弃最早的反馈; 消融显示只保留历史反馈, 丢掉历史回答, 效果明显更好. SDPO 的 batch 为 16, 消融显示 batch 8 或 16 在很小预算下略早找到解, 16 或 32 在预算增大后更稳定.

very hard 题上, discovery@2750 分别为: 多轮 35.6%, best-of-$k$ 41.5%, SDPO 53.2%. 达到 22% 的发现概率, SDPO 所需生成量约为两种基线的 1/3. hard 题上 SDPO 的 discovery@2750 为 78%, 达到 67% 时所需生成量约为基线的 1/2.4. 多轮方法在 hard 题上平均第 837 步 (±466), very hard 题上第 1007 步 (±349) 用满上下文窗口, 可能是它在大预算下增益变小的原因.

SDPO 解出了 best-of-$k$ 与多轮方法能解的全部题, 还独自解出 Q3: 某次运行在第 321 次尝试首次找到解, 对应 batch 16 下的 20 步自蒸馏. Table 10 的平均首次成功次数 (超过 2750 记为 2750):

| | SDPO | best-of-$k$ | 多轮 |
| --- | --- | --- | --- |
| hard 平均 | 894 | 1145 | 1141 |
| very hard 平均 | 1739 | 2180 | 2121 |

单题加速最高为 Q120 的 13.6 倍 (24 对 327). 也有题目上 SDPO 更慢, 例如 Q69 为 280 对 134. Q3 在 Table 10 中的 SDPO 均值是 1987, 包含未解出种子的截断值, 与正文的 321 次统计口径不同.

Table 11 报告自教师在第一步的准确率: 几乎所有题都低于 1%, 78% 的题恰好为 0. 单轮把反馈放进上下文不足以解题, 但自教师给出的逐 token 优势足以让策略逐步改进, 最终解出.

## 超参数, 局限与相关方法

### 超参数

Table 12 汇总三节实验的配置. 公共设置: 关闭 Thinking 模式, 最长提示 2048 token, 最长回答 8192 token, 采样温度 1.0.

| | 第 2 节 | 第 3 节 | 第 4 节 |
| --- | --- | --- | --- |
| 每步题目数 | 32 | 32 | 1 |
| mini batch | 32 | 1 | 1 |
| 每题回答数 | 8 | 8 | 16 |
| top-$K$ | 100 | 20 | 20 |
| 散度 | JSD | reverse KL | reverse KL |
| 教师 EMA 系数 | 0.05 | 0.01 | 0.01 |
| 学习率 | 1e-5 | 1e-6 | 1e-6 |
| 优势裁剪 | 无 | 无 | 5.0 |

GRPO 基线的 $\varepsilon_{\text{high}}$ 取 0.28, KL 系数为 0.

### 局限

论文列出三点.

1. **依赖上下文学习**: 自教师要能读懂反馈并据此重新评价原回答. 第 3.2 节的规模实验显示, 能力不足的小模型上 SDPO 不如 GRPO.
2. **依赖反馈质量**: 反馈含糊或带误导时, 教师给出的优势也不可靠. 论文主实验的反馈来自编译器, 单元测试和同组成功解, 没有测试由其他模型生成的评语作反馈的情形.
3. **计算开销**: 每步多一次教师前向. 小模型或短回答时, 生成本身便宜, 这部分开销占比更大.

另外, 第 2 节的 SDPO 全部是 on-policy, 对照的 GRPO 每批做 4 次更新; SDPO 的 off-policy 版本在附录给出了形式, 正文没有实验.

作者列出的后续方向有四个: 轨迹长, 中间状态可见的 agent 环境; 在大规模多任务 RL 和前沿基座上研究 SDPO 的扩展性; 没有真值验证器, 只有文本反馈的开放式生成或连续奖励任务; 系统研究提示模板等因素如何影响 SDPO 的推理风格.

### 与其他 OPD 方法的关系

| 方法 | 教师 | 教师额外看到的信息 | 信号 |
| --- | --- | --- | --- |
| [01 OPD](../01-OPD基础原理/01-OPD基础原理.md) | 外部强模型 | 无 | 逐 token 分布 |
| [02 OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md) | 同一模型 | 数据集标准答案 | 逐 token 分布 |
| [03 SDFT](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md) | 同一模型的 EMA | 专家示范 | 逐 token 分布 |
| SDPO | 同一模型, EMA 或信赖域 | 环境反馈, 同组成功解 | 逐 token 分布, 可与 GRPO 混合 |

论文 §6 梳理了利用反馈的其他路线. 一类把文字反馈转成奖励函数, 借助外部冻结模型或强 LLM. 一类只在上下文中改进, 例如 Self-Refine, Reflexion, 不进入 RL 优化. 一类把反馈前后的回答配成偏好对做 DPO, 需要额外生成, 也没有逐 token 的信用分配. 还有一类训练以反馈为条件的策略 $\pi_\theta(y\mid x,f)$, 把反馈当目标做重标注; RLRF 把反馈当作状态, 用来判断目标 $x$ 是否达成, 并在失败轨迹上做信用分配. 已有的自蒸馏工作多用 off-policy 目标, 让学生学教师的生成; SDPO 让学生在自己的生成上避开错误, 第 3.2 节的 SFT 基线显示前者明显更差.

SDFT, OPSD 与 SDPO 是同期工作, 共同点是让同一个模型在额外上下文下当教师. 差别在额外信息从哪来: SDFT 需要示范, OPSD 需要标准答案, SDPO 只需要环境本来就会给出的反馈, 因此可以直接放进现有 RLVR 环境里使用. 论文 §6 还对比了过程奖励模型 (PRM): PRM 通常在标量奖励上训练, 是独立于学生的模型, 有额外显存开销; 有富反馈时, 语言模型通过回看自身就起到隐式 PRM 的作用. 附录进一步指出, SDPO 目标等价于以 $\log q(y_t\mid x,f,y_{<t})$ 为稠密奖励的最大熵 RL, 学生学到的是由回看模型定义的隐式奖励, 这也把 SDPO 与逆强化学习联系起来.

散度选择与 [05 GOPD](../05-GOPD-散度光谱/05-GOPD-散度光谱.md) 讨论的散度光谱相关: SDPO 在第 2 节用 JSD, 第 3, 4 节用 reverse KL. 多教师设置见 [09 MOPD](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md). OPD 方法总览见 [4.9-OPD](../../4.9-OPD.md).

**参考文献**

1. Hübotter, J., Lübeck, F., Behric, L., Baumann, A., Bagatella, M., Marta, D., Hakimi, I., Shenfeld, I., Kleine Buening, T., Guestrin, C., Krause, A. *Reinforcement Learning via Self-Distillation*. arXiv:2601.20802, v2, 2026. 代码: https://github.com/lasgroup/SDPO
2. Shao, Z. et al. *DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models*. arXiv:2402.03300, 2024.
3. Agarwal, R. et al. *On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes*. ICLR 2024. arXiv:2306.13649.
4. Liu, Z. et al. *Understanding R1-Zero-Like Training: A Critical Perspective*. COLM 2025.
5. Jain, N. et al. *LiveCodeBench: Holistic and Contamination Free Evaluation of Large Language Models for Code*. ICLR 2025.
6. Shenfeld, I., Damani, M., Hübotter, J., Agrawal, P. *Self-Distillation Enables Continual Learning*. arXiv:2601.19897, 2026.
7. Zhao, S., Xie, Z., Liu, M., Huang, J., Pang, G., Chen, F., Grover, A. *Self-Distilled Reasoner: On-Policy Self-Distillation for Large Language Models*. arXiv:2601.18734, 2026.
