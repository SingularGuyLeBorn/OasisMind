---
title: "01 · OPD 基础原理: 学生前缀上的逐 token 蒸馏"
published: true
tags: ["OPD", "On-Policy Distillation", "Reverse KL", "MiniLLM", "GKD", "Self-Distillation", "后训练"]
excerpt: "OPD 让学生自己采样轨迹, 教师只在学生前缀上给逐 token 的分布监督. 本文从 MiniLLM 和 GKD 的目标函数讲起, 推到单样本估计与零折扣的 RL 读法, 再用 Qwen3 Table 21 看算力对比, 最后把 OPSD, SDFT, SDPO 收进同一个自蒸馏框架."
---
# OPD 基础原理: 学生前缀上的逐 token 蒸馏

> 相关阅读: [4.9 OPD 节索引](../../4.9-OPD.md) · [02 OPSD](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md) · [03 SDFT](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md) · [04 SDPO](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) · [05 G-OPD](../05-GOPD-散度光谱/05-GOPD-散度光谱.md) · [07 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md) · [09 多教师](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) · [4.6.2 综述](../../4.9.2-OPD综述/01-Song-Zheng综述/01-Song-Zheng综述.md) · [4.9.3 状态分布视角](../../4.9.3-状态分布视角/4.9.3-状态分布视角.md)

On-Policy Distillation (OPD) 让学生对输入自己采样, 由教师在学生走到的每个前缀上给出下一 token 分布. 材料取 MiniLLM 与 GKD 两篇奠基论文, Song 与 Zheng 的综述 (arXiv:2604.00626) 和 Qwen3 技术报告, 问题是这种训练方式补上了 SFT 与 RL 各自的哪处缺口, 又要付出哪些代价.

## 1. 问题, 统一目标与散度方向

### 1.1 问题: 前缀从哪里来

自回归模型在第 $t$ 步的输入是前缀 $y_{<t}$. 训练时这个前缀从哪里来, 决定了模型学到的条件分布在推理时还成不成立.

SFT 和传统的 token 级蒸馏 (Hinton 等 2015; Sanh 等 2019) 用的是固定数据集里的前缀: 要么是人工写的标准答案, 要么是教师生成的序列 (SeqKD, Kim & Rush 2016). 推理时学生只能从自己的输出续写, 早期一个 token 偏离了训练分布, 后面的前缀就越来越陌生. Ross 等 (2011) 在模仿学习里证明, 只在专家状态分布上训练的策略, 误差会随时间步累积. 在 LLM 里, 这一现象常被叫作暴露偏差 (exposure bias).

RL 的数据来自学生自己, 前缀分布与推理一致. 代价是信号稀疏: 以 RLVR 为例, 一条几千 token 的回答通常只拿到一个 0 或 1 的结果奖励, 每个 token 分到的优势相同, 模型分不清哪一步该改.

OPD 把两者组合起来: 前缀由学生采样, 每个前缀上的监督由教师的完整分布 (或其中一部分) 提供. 这一思路在模仿学习里对应 DAgger 一类 「学生采样, 专家标注」 的交互式方法 (Ross 等 2011). GKD 论文明确把蒸馏看成带交互专家的模仿学习问题.

GKD 第 3 节列出的几种做法, 加上 RL, 可以按 「前缀从哪来」 和 「每个前缀上拿到什么监督」 两个维度排开:

| 做法 | 前缀来源 | 每个前缀上的监督 | 需要什么 |
| --- | --- | --- | --- |
| SFT | 人工标准答案 | 标准答案的下一个 token | 标注数据 |
| SeqKD (Kim & Rush 2016) | 教师生成的序列 | 教师序列的下一个 token | 教师采样, 成本高 |
| 监督 KD (Hinton 2015; Sanh 2019) | 固定数据集 | 教师的完整下一 token 分布 | 教师前向 |
| RL (如 GRPO) | 学生采样 | 整条轨迹共享的标量优势 | 奖励函数或验证器 |
| OPD | 学生采样 | 教师的下一 token 分布或其单样本估计 | 教师前向 |

只有最后两行的前缀分布与推理一致; 只有后三行的监督落到 token 级的分布上. OPD 同时满足两条. 代价是每一步都要让教师在学生的新样本上前向一次, 教师样本无法提前离线生成.

还有一点区别影响学生能学到什么. 前三行的目标都是让学生复现某个固定的输出集合, 学生容量不够时, 只能在这些输出之间折中. OPD 和 RL 允许学生生成自己的答案, 教师只对学生实际走到的地方提出修改. MiniLLM 把这一点概括为: 学生不必记住教师的所有样本, 只需在自身容量内生成教师偏好的样本.

### 1.2 统一目标

记学生为 $\pi_\theta$, 教师为 $\pi_T$, 输入分布为 $\mathcal{X}$. 综述 2604.00626 的式 (1) 把 OPD 写成

$$
\min_\theta\ \mathbb{E}_{x\sim\mathcal{X}}\ \mathbb{E}_{y\sim\pi_\theta(\cdot\mid x)}\big[\mathcal{L}(x,y;\pi_\theta,\pi_T)\big] \tag{1}
$$

其中 $\mathcal{L}$ 是学生和教师在轨迹 $y$ 上的某种差异. 最常见的展开是对每个前缀的下一 token 分布求散度再求和:

$$
\mathcal{L}(x,y)=\sum_{t=1}^{|y|}D\big(\pi_T(\cdot\mid x,y_{<t}),\ \pi_\theta(\cdot\mid x,y_{<t})\big) \tag{2}
$$

式 (2) 有三个可以独立选择的部分:

1. **采样分布**: $y$ 从谁那里来. 纯 on-policy 用 $\pi_\theta$; MiniLLM 混入一部分教师分布; GKD 用 $\lambda$ 在学生样本与固定数据之间混合.
2. **教师**: 外部更大的模型, 或同一个模型加上额外上下文 (第 4.1 节).
3. **散度 $D$**: forward KL, reverse KL, JSD($\beta$), 或更一般的 $f$-散度; 以及在完整词表, top-$k$ 子集, 还是单个采样 token 上计算.

后面几节分别讨论这三处选择.

### 1.3 散度方向

两个分布 $P,Q$ 之间的 KL 不对称. 按蒸馏的惯例, 以教师为 $P$, 学生为 $Q$:

$$
\mathrm{KL}(\pi_T\|\pi_\theta)=\sum_v\pi_T(v)\log\frac{\pi_T(v)}{\pi_\theta(v)},\qquad \mathrm{KL}(\pi_\theta\|\pi_T)=\sum_v\pi_\theta(v)\log\frac{\pi_\theta(v)}{\pi_T(v)} \tag{3}
$$

前者叫 forward KL, 后者叫 reverse KL. forward KL 在 $\pi_T(v)>0$ 而 $\pi_\theta(v)\to0$ 处代价趋于无穷, 学生被迫覆盖教师的全部支撑, 容量不够时会把概率摊到教师认为不太可能的 token 上 (mean-seeking). reverse KL 的权重是 $\pi_\theta(v)$, 学生没放概率的地方不计代价, 于是学生集中到教师的主要模式上 (mode-seeking). MiniLLM 的论证是: 教师的输出分布比学生多出许多模式, forward KL 迫使学生高估教师的低概率区域, 在生成任务上表现为低质量文本; reverse KL 让学生在自己的容量内生成教师偏好的样本.

GKD 用广义 Jensen-Shannon 散度在两个方向之间插值 (GKD 式 (1)):

$$
D_{\mathrm{JSD}(\beta)}(P\|Q)=\beta\,\mathrm{KL}\big(P\,\|\,\beta P+(1-\beta)Q\big)+(1-\beta)\,\mathrm{KL}\big(Q\,\|\,\beta P+(1-\beta)Q\big) \tag{4}
$$

其中 $0<\beta<1$. JSD 在两个分布支撑不相交时仍然有界. GKD 引用 Huszár (2015) 的结果: $\lim_{\beta\to0}D_{\mathrm{JSD}(\beta)}(P\|Q)/\beta=\mathrm{KL}(P\|Q)$, 因此 $\beta$ 接近 0 时梯度接近 forward KL, 接近 1 时接近 reverse KL.

实现上有一个容易出错的地方. PyTorch 的 `F.kl_div(input, target)` 计算的是 $\sum \text{target}\cdot(\log\text{target}-\text{input})$, 其中 `input` 是对数概率. 写成 `F.kl_div(student_logprobs, teacher_probs)` 时, 结果是 $\mathrm{KL}(\pi_T\|\pi_\theta)$, 也就是 forward KL. 要得到 reverse KL, 需要交换两者的位置, 让学生概率作为权重.

## 2. MiniLLM 与 GKD

### 2.1 MiniLLM: 序列级 reverse KL 与 policy gradient

MiniLLM 的目标是序列级 reverse KL:

$$
\theta^*=\arg\min_\theta\ \mathrm{KL}(q_\theta\|p)=\arg\min_\theta\Big[-\mathbb{E}_{x\sim p_x,\ y\sim q_\theta}\log\frac{p(y\mid x)}{q_\theta(y\mid x)}\Big] \tag{5}
$$

这里沿用原文记号, $q_\theta$ 是学生, $p$ 是教师. 期望里的样本来自学生, 所以对 $\theta$ 求导要用 policy gradient 定理 (MiniLLM 式 (2)):

$$
\nabla\mathcal{L}(\theta)=-\mathbb{E}_{x,\ y\sim q_\theta}\sum_{t=1}^{T}(R_t-1)\,\nabla\log q_\theta(y_t\mid y_{<t},x),\qquad R_t=\sum_{t'=t}^{T}\log\frac{p(y_{t'}\mid y_{<t'},x)}{q_\theta(y_{t'}\mid y_{<t'},x)} \tag{6}
$$

$r_{t'}=\log p/q_\theta$ 是每一步的质量: 教师概率越高越好, 学生自己的概率越低越好, 后者起到保持多样性的作用. 原文指出直接用式 (6) 有三个问题: 方差大, 会出现 reward hacking, 而且 $R_t$ 偏好短句, 学生会学着输出空回答. 对应的三个改动是:

- **单步分解** (MiniLLM 式 (3)): 把 $R_t$ 拆成当前步 $r_t$ 和 $R_{t+1}$. 当前步的期望 $\mathbb{E}_{y_t\sim q_\theta}[r_t]$ 可以在词表上精确求和并直接求导, 不需要蒙特卡洛采样. 消融显示这一项主要降低方差.
- **教师混合采样** (MiniLLM 式 (4)): 采样分布换成 $\tilde p=\alpha p+(1-\alpha)q_\theta$, 再用重要性权重修正. 完整的权重是逐 token 比值的连乘, 方差太大, 原文近似为单步比值 $w_t\approx q_\theta(y_t)/\tilde p(y_t)$. 全部实验取 $\alpha=0.2$. 去掉这一项后, 学生会学会生成重复, 短小, 在教师下概率很高的无意义字符串.
- **长度归一化** (MiniLLM 式 (6)): 用 $R^{\mathrm{Norm}}_{t+1}=\frac{1}{T-t-1}\sum_{t'=t+1}^{T}\log\frac{p}{q_\theta}$ 代替 $R_{t+1}$, 抵消长序列 $R_{t+1}$ 偏小的倾向.

实验设定方面, 学生来自三个模型族: GPT-2 (120M, 340M, 760M), OPT (1.3B, 2.7B, 6.7B) 和 LLaMA (7B), 对应的教师分别是 GPT-2-1.5B, OPT-13B 和 LLaMA-13B, 教师都先在指令数据上微调过. 评测用五个指令跟随集合: 从 dolly 切出的 500 条 DollyEval, 252 条 SelfInst, 80 条 VicunaEval, 以及 Super-NaturalInstructions 和 UnnaturalInstructions 中参考回答长于 11 个 token 的子集. 超参数按验证集 Rouge-L 选择, 理由是它比验证损失更贴近人工偏好. 论文还按参考回答长度分组分析: 回答不超过 5 个 token 时, 输出空间小, 学生能覆盖教师的大部分模式, forward KL 和 reverse KL 差别不大; 回答更长时, 教师分布的模式多于学生, MiniLLM 的优势才显现出来.

此外 MiniLLM 在训练中加入预训练语料上的语言模型损失 (GPT-2 系列用 OpenWebText, 其余模型用 RoBERTa 训练语料), 用来保住通用能力. 训练数据是 databricks-dolly-15K 过滤后的约 12.5K 条; 第二阶段学习率 5e-6, mini-batch 64, 每次收集 256 条样本做 4 个内层 epoch, 裁剪率 0.2, 采样温度 1, 训练 5000 步. 从 LLaMA-13B 蒸馏 LLaMA-7B 在 16 张 V100 上不到 10 小时.

论文还做了三项分析, 都与 「前缀来自学生」 直接相关.

- **暴露偏差**: 用 ExAccErr 衡量训练与自由生成不一致带来的额外累积误差. 学生 GPT-2-125M, 教师 GPT-2-1.5B, Dolly 测试集, 每个 prompt 采 10 条. 基线的 ExAccErr 随生成长度持续增长; MiniLLM 低得多, 生成超过 150 个 token 后不再累积.
- **校准**: LLaMA-7B 学生, SST2 与 BoolQ 上做零样本分类, 用标签词的概率算 ECE. 教师为 0.025 与 0.356; KD 为 0.191 与 0.682, SeqKD 为 0.243 与 0.681; MiniLLM 为 0.099 与 0.502, 准确率 89.7 与 67.8 也高于两种基线; SeqKD 在 SST2 上只有 66.5, 比 KD 的 84.7 还低. 作者的解释是 forward KL 把概率推到目标分布的空白区域.
- **教师规模**: 固定 GPT-2-125M 学生, 教师依次取 340M, 760M 和 1.5B, MiniLLM 的学生成绩随教师变大而上升, OPT 族上的结果见附录, 且始终高于 SeqKD. 已有工作报告过教师变大反而损害蒸馏的情况.

MiniLLM 的写法已经包含了后来 OPD 的全部要素: 学生采样, 教师打分, 以 $\log p-\log q_\theta$ 作逐 token 回报. 区别在于它保留了 $R_t$ 中未来步的累积, 即折扣为 1 的回报.

### 2.2 GKD: 采样来源与散度都可选

GKD 先定义序列上的 token 级平均散度 (GKD 式 (2)):

$$
D(p_T\|p_S^\theta)(y\mid x)=\frac{1}{L_y}\sum_{n=1}^{L_y}D\big(p_T(\cdot\mid y_{<n},x)\,\|\,p_S^\theta(\cdot\mid y_{<n},x)\big) \tag{7}
$$

on-policy 蒸馏损失是在学生样本上的期望 (GKD 式 (4)):

$$
L_{OD}(\theta)=\mathbb{E}_{x\sim X}\Big[\mathbb{E}_{y\sim p_S(\cdot\mid x)}\big[D_{\mathrm{KL}}(p_T\|p_S^\theta)(y\mid x)\big]\Big] \tag{8}
$$

这里的 KL 方向是教师在前, 即 forward KL. 关键的实现约定是**不对学生的采样分布反传**: $y$ 被当作固定数据, 梯度只流过式 (7) 里的 $p_S^\theta$. 原文给的理由是这样训练稳定, 计算也便宜. 训练时采样温度 $\gamma=1$, 以保证学生样本的多样性.

GKD 的一般形式在固定数据集和学生样本之间混合:

$$
L_{\mathrm{GKD}}(\theta)=(1-\lambda)\,\mathbb{E}_{(x,y)\sim(X,Y)}\big[D(p_T\|p_S^\theta)(y\mid x)\big]+\lambda\,\mathbb{E}_{x\sim X}\Big[\mathbb{E}_{y\sim p_S(\cdot\mid x)}\big[D(p_T\|p_S^\theta)(y\mid x)\big]\Big] \tag{9}
$$

$\lambda\in[0,1]$ 是学生数据的比例. $D$ 取 forward KL 时, $\lambda=0$ 退化为监督式 KD, $\lambda=1$ 退化为式 (8). $D$ 可以换成 reverse KL 或 JSD($\beta$).

散度怎么选, GKD 的回答是看任务. forward KL 要求学生覆盖教师的全部支撑, 学生容量小时, 温度采样下容易生成幻觉和低质量文本; reverse KL 这类 mode-seeking 散度生成质量高, 但同一输入下的多样性下降. 论文图 1 的设定是: WMT 翻译用 JSD(0.1), 其他任务 (XSum 摘要, GSM8K) 用 forward KL. 学生是先做过监督微调的 T5 模型, 教师是监督微调后的 T5-XL (约 3B). 论文还建议, 若要把 GKD 接进 RLHF 一类本来就用 reverse KL 约束策略的流程, 优先用 reverse KL 或 JSD(0.9).

GKD 对学生还有一个前提: 学生要能生成质量尚可的序列, 教师才有东西可评. 论文的学生都先做过监督微调, 流程和两阶段 RLHF (先 SFT, 再在线 RL) 相同.

### 2.3 GKD 的实验结论

GKD 的实验覆盖摘要 (XSum), 翻译 (WMT14 en-de), 算术推理 (GSM8K) 和任务无关的指令微调 (FLAN). 教师是监督微调后的 T5-XL (约 3B), 学生是 T5-small (77M), T5-base (250M) 和 T5-large (800M), 分别比教师小 38 倍, 12 倍和 3.8 倍. 散度在 forward KL, reverse KL, JSD(0.1), JSD(0.5), JSD(0.9) 中选择, 学生数据比例取 $\lambda\in\{0,0.5,1\}$. 主要结论如下.

- **学生样本比固定数据有效.** 三个任务上, $\lambda=1$ 与 $\lambda=0.5$ 都稳定优于只用固定数据的 $\lambda=0$. GSM8K 上, 学生生成数据的比例超过 25% 之后, 比例越高效果越好.
- **数据效率.** XSum 上用 T5-small 做学生, 只取 5% 训练集 (约 10K 条, 不用人工摘要) 的 on-policy GKD, 超过了用全部训练集和人工摘要的监督 KD 与 ImitKD.
- **散度与解码方式有关.** 用温度采样评估时, mode-seeking 散度更好; 用贪心解码时, 散度的选择影响不大. 从 forward KL 经 JSD 到 reverse KL, 学生输出的多样性 (Self-BLEU) 逐步下降, 高温下生成质量更好. 翻译任务上 JSD 好于两个方向的 KL, 但学生变大后差距缩小.
- **任务无关蒸馏.** 在 FLAN 上做指令微调蒸馏, 用 MMLU 和 BBH 评估, on-policy GKD 加 reverse KL 最好. 教师 FLAN T5-XL 的 MMLU 为 52.4%, BBH 为 41%; 学生 T5-large 起点为 35.6% 与 31.25%.

### 2.4 GKD 与 RL 目标组合

GKD 只需要学生样本, 所以可以和 RL 微调共用一批 rollout. 论文式 (5) 把奖励最大化与蒸馏写在同一个目标里:

$$
\mathbb{E}_{x\sim X}\Big[(1-\alpha)\,\mathbb{E}_{y\sim p_S^\theta(\cdot\mid x)}[r(y)]-\alpha\,\mathbb{E}_{y\sim p_S(\cdot\mid x)}\big[D(p_T\|p_S^\theta)(y\mid x)\big]\Big] \tag{10}
$$

$\alpha\in[0,1]$ 控制蒸馏项的强度, $\alpha=1$ 时只做蒸馏. 论文在 XSum 上以 T5-XXL NLI 分类器的文本蕴含分数为奖励, 蒸馏项用 JSD(0.9). $\alpha$ 增大时 ROUGE-2 上升, 事实一致性的提升变小. 与把学生约束在自身初始策略附近的 RLEF 相比, 「RL 加 on-policy GKD」 的 ROUGE-2 更高, 生成的摘要比 T5-XL 教师本身的事实一致性更高. 这个结果说明, 教师的分布可以充当 RL 中的 KL 参考策略, 同时把教师的能力带给学生.

把 MiniLLM 和 GKD 放在一起看: MiniLLM 对序列级 reverse KL 做无偏 (近似) 的 policy gradient, 采样过程参与求导; GKD 把学生样本当作固定前缀, 在每个前缀上做监督式的分布匹配, 采样过程不参与求导. 后来的大多数 OPD 实现走 GKD 的路线, 只在学生前缀上算 token 级散度.

## 3. 单样本估计, RL 读法与算力

### 3.1 三种计算粒度

式 (2) 的 $D$ 在实现上有三种粒度:

- **full-vocab**: 在完整词表上算精确的 KL. 信息最全, 但教师和学生的 logits 要同时放在显存里, 词表十几万时代价高.
- **top-$k$**: 只在学生 (或教师) 概率最高的 $k$ 个 token 上计算, 其余概率并成一个尾部桶. SDPO 用的就是这种做法 (第 4.1 节).
- **sampled-token**: 只在学生实际采到的 token $a_t$ 上取一个单样本估计. 教师只需返回这一个 token 的 log 概率, 通信和显存开销最小.

full-vocab 的显存可以直接估算. 一条长 $T$ 的序列, 每个模型要存 $T\times|\mathcal{V}|$ 个 logits. 取 $T=16384$, $|\mathcal{V}|=150{,}000$ 做例子, 是约 $2.46\times10^9$ 个数, bf16 下约 4.9GB, 师生两份再翻倍, 还没算反传需要的中间量. top-$k$ 把每个位置压到 $k+1$ 个数, $k=100$ 时只有原来的约万分之七. sampled-token 每个位置只剩 1 个数, 代价是估计方差最大, 学生没采到的 token 完全得不到信号.

### 3.2 单样本 reverse KL, 零折扣与 RL 视角

学生在第 $t$ 步采到 $a_t$, reverse KL 的单样本估计是

$$
\hat k_t=\log\pi_\theta(a_t\mid x,y_{<t})-\log\pi_T(a_t\mid x,y_{<t}) \tag{11}
$$

因为 $a_t\sim\pi_\theta$, $\mathbb{E}_{a_t}[\hat k_t]=\mathrm{KL}(\pi_\theta\|\pi_T)$ 在该前缀上成立. 取逐 token 奖励

$$
r_t=-\hat k_t=\log\pi_T(a_t\mid x,y_{<t})-\log\pi_\theta(a_t\mid x,y_{<t}) \tag{12}
$$

并把折扣因子设为 0, 第 $t$ 个 token 的优势就是 $r_t$ 本身, 未来 token 的奖励不回传. 这样 OPD 可以直接复用现成的 RL 训练框架: rollout 由学生完成, 教师只做一次前向得到 $\log\pi_T(a_t)$, 优势用式 (12) 替换. G-OPD 论文 (Yang 等, 2602.12125) 的式 (6) 采用的就是这一形式, 并注明 Thinking Machines 的 On-Policy Distillation 博客 (Lu 等 2025) 和 MiMo-V2-Flash 技术报告 (2601.02780) 都把折扣设为 0.

与 MiniLLM 的式 (6) 对照, 两者的差别正好是 $R_t$ 里有没有 $t'>t$ 的项. 零折扣丢掉了 「这一步怎样影响后续前缀」 的信息, 换来的是逐 token 独立, 方差更小. SDFT 附录 A.1 和 SDPO 附录 A.1 都讨论过同一问题: 只按当前 token 求导的估计对序列级 KL 有偏, 但两篇论文的实验里, 补上序列项的估计都没有带来可测的收益.

**RL 视角的推论.** 式 (12) 让 OPD 有一个 RL 解释: 教师的 log 概率是奖励, 学生自己的 log 概率起熵正则的作用. G-OPD 在此基础上证明 OPD 等价于一个 KL 约束的 RL 目标, 其中奖励为 $\log\pi_T/\pi_{\mathrm{ref}}$, KL 系数为 1, 并通过改变奖励的权重得到插值与外推; 推导见 [05 G-OPD](../05-GOPD-散度光谱/05-GOPD-散度光谱.md). sampled-token 估计在长序列上的方差, 信号不平衡, 以及学生前缀上教师不可靠等问题, 见 [07 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md).

### 3.3 Qwen3 Table 21: RL 与 OPD 的算力对比

Qwen3 技术报告 (2505.09388) 的 Table 21 是公开资料里少见的同起点对照. 设定是: 学生 Qwen3-8B, 起点是一个 off-policy 蒸馏得到的检查点, 只用数学和代码查询; 一支继续做 RL, 另一支做 on-policy 蒸馏, 教师来自 Qwen3-32B 与 Qwen3-235B-A22B. 括号内是 pass@64.

| 方法 | AIME'24 | AIME'25 | MATH500 | LiveCodeBench v5 | MMLU-Redux | GPQA-Diamond | GPU 小时 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Off-policy 蒸馏 | 55.0 (90.0) | 42.8 (83.3) | 92.4 | 42.0 | 86.4 | 55.6 | - |
| + RL | 67.6 (90.0) | 55.5 (83.3) | 94.8 | 52.9 | 86.9 | 61.3 | 17,920 |
| + On-policy 蒸馏 | 74.4 (93.3) | 65.5 (86.7) | 97.0 | 60.3 | 88.3 | 63.3 | 1,800 |

按表计算, OPD 的 GPU 小时约为 RL 的 1/10, 六项指标全部更高. AIME'24 上 OPD 比 RL 多 6.8 分, AIME'25 多 10.0 分, LiveCodeBench v5 多 7.4 分. 训练只用了数学和代码查询, MMLU-Redux 与 GPQA-Diamond 仍有小幅提升.

更值得看的是括号里的 pass@64. RL 之后 AIME'24 与 AIME'25 的 pass@64 保持在 90.0 与 83.3, 与起点相同; OPD 之后升到 93.3 与 86.7. 报告据此认为, 教师 logits 能扩大学生的探索空间, 而 RL 只是把已有的正确答案采得更准. 这一读法有两个前提: 教师明显强于学生, 而且两支的起点相同. 表中只有 8B 一个尺寸, 也没有给出两支各自的训练步数或查询数量. 报告正文与配方见 [Qwen3 正本](../../../../../model-library/03-模型家族/03-qwen/qwen3/qwen3-bi.md).

## 4. 自蒸馏与适用条件

### 4.1 去掉外部教师: 自蒸馏统一框架

OPD 依赖一个比学生强的教师. 在线学习的目标往往是超过现有模型, 这时外部教师不存在. 2026 年初的几篇工作用同一个思路绕开这一点: 让学生自己充当教师, 只是给教师多看一段学生看不到的上下文 $c$. 这一思路来自 context distillation (Snell 等 2022; Bai 等 2022): 带额外信息的模型作为不带该信息的同一模型的教师. 早期做法在教师的样本上离线训练, 新工作改为在学生样本上 on-policy 训练.

三步可以写成统一形式:

$$
\hat y\sim\pi_S(\cdot\mid x),\qquad \pi_T^{(t)}=\pi(\cdot\mid x,c,\hat y_{<t}),\qquad \mathcal{L}=\sum_{t}D\big(\pi_S(\cdot\mid x,\hat y_{<t}),\ \mathrm{sg}(\pi_T^{(t)})\big) \tag{13}
$$

其中 $\mathrm{sg}$ 表示 stop-gradient. 学生只看到 $x$ 自己采样; 教师和学生共享参数 (或共享参数的某个平滑版本), 在 $x$ 加 $c$ 的条件下对学生的同一条轨迹重新打分; 损失对 token 级散度求和. 不同方法之间变化的只有 $c$ 和 $D$:

| 方法 | 上下文 $c$ | 散度与实现 | 教师参数 | 详见 |
| --- | --- | --- | --- | --- |
| OPSD (Zhao 等, 2601.18734) | 题目的参考解 | full-vocab forward KL, 逐点裁剪; 消融中优于 RKL 与 JSD | 固定为初始策略 | [02](../02-OPSD-自蒸馏/02-OPSD-自蒸馏.md) |
| SDFT (Shenfeld 等, 2601.19897) | 专家示范 | 理论上为 reverse KL, 实践中 forward KL 最好; 解析 token 级估计 | 学生参数的 EMA | [03](../03-SDFT-自蒸馏持续学习/03-SDFT-自蒸馏持续学习.md) |
| SDPO (Hübotter 等, 2601.20802) | 环境反馈, 组内成功解 | reverse KL 或 JSD, top-$K$ 加尾部桶 | EMA 或与初始教师插值 | [04](../04-SDPO-自蒸馏策略优化/04-SDPO-自蒸馏策略优化.md) |

三者的共同前提是模型具备足够的上下文学习能力: 看到 $c$ 之后的分布要明显优于没看到时. SDFT 在 Qwen2.5-3B 上不如 SFT, SDPO 在 Qwen2.5-1.5B 上不如 GRPO, OPSD 的附录指出题目太难时教师也给不出有用信号. 这些都是该前提不成立时的表现.

自蒸馏和外部教师 OPD 在实现上几乎相同: 学生 rollout 一次, 教师做一次前向, 按式 (2) 或式 (12) 计算损失. 增加的计算只是一次带 $c$ 的前向, 这一次前向可以并行, 比顺序生成快得多. SDPO 图 5 对比了单步耗时, 相对 GRPO 的额外开销较小.

SDPO 中 「组内成功解」 的作用值得单独说明. RLVR 环境只返回标量奖励时, SDPO 把同一题组里答对的 rollout 放进失败 rollout 的教师上下文. 这一用法依旧属于式 (13) 的蒸馏: 教师在看到成功解之后对失败轨迹逐 token 重新打分, 损失仍是两个分布的散度, 不涉及偏好对或成对比较.

### 4.2 适用条件与代价

**教师必须在学生前缀上可靠.** OPD 只在学生访问到的前缀上要求教师给监督. 学生前缀离教师自己的分布太远时 (例如学生进入重复循环), 教师可能仍然给出局部一致的高概率, 信号失去意义. 师生能力差距过大, 词表或特殊 token 不一致, 也会让教师信号失真. 这些问题集中在 [07 失败模式](../07-OPD-失败模式/07-OPD-失败模式.md).

**每步多一次教师前向.** 外部教师通常比学生大, 教师前向的成本可能接近学生 rollout. full-vocab 需要两份完整 logits, top-$k$ 和 sampled-token 用信息换显存.

**散度方向影响多样性.** reverse KL 让学生集中到教师的主要模式上, 生成质量更稳, 多样性下降. 需要保留多样性的任务可以考虑 forward KL 或 JSD($\beta$), 这是 GKD 的结论, 也解释了 SDFT 在实践中改用 forward KL 的选择.

**多个教师.** 不同领域的教师可以分别给出逐 token 监督, 再合并到一个学生里. 合并方式和权重怎样定, 见 [09 多教师蒸馏](../09-MOPD-多教师蒸馏/09-MOPD-多教师蒸馏.md) 和 [05 G-OPD](../05-GOPD-散度光谱/05-GOPD-散度光谱.md) 中的多教师实验.

**理论视角.** 学生前缀为什么重要, 可以从状态分布的角度推导: on-policy 训练让损失在学生自己的状态分布上取期望, 与推理时一致. 这一线索的展开见 [4.9.3 状态分布视角](../../4.9.3-状态分布视角/4.9.3-状态分布视角.md); 文献的系统整理见 [4.6.2 综述](../../4.9.2-OPD综述/01-Song-Zheng综述/01-Song-Zheng综述.md).

## 参考文献

1. Song, Zheng. *A Survey of On-Policy Distillation for Large Language Models*. arXiv:2604.00626. [链接](https://arxiv.org/abs/2604.00626)
2. Gu, Dong, Wei, Huang. *MiniLLM: Knowledge Distillation of Large Language Models*. arXiv:2306.08543. [链接](https://arxiv.org/abs/2306.08543)
3. Agarwal, Vieillard, Zhou, Stanczyk, Ramos, Geist, Bachem. *On-Policy Distillation of Language Models: Learning from Self-Generated Mistakes*. arXiv:2306.13649. [链接](https://arxiv.org/abs/2306.13649)
4. Qwen Team. *Qwen3 Technical Report*. arXiv:2505.09388. [链接](https://arxiv.org/abs/2505.09388)
5. Yang, Liu, Xie, Yang, Yang, Lin. *Learning beyond Teacher: Generalized On-Policy Distillation with Reward Extrapolation*. arXiv:2602.12125. [链接](https://arxiv.org/abs/2602.12125)
6. Lu, Thinking Machines Lab. *On-Policy Distillation*. Thinking Machines Lab: Connectionism, 2025. [链接](https://thinkingmachines.ai/blog/on-policy-distillation/)
7. Xiaomi LLM-Core Team. *MiMo-V2-Flash Technical Report*. arXiv:2601.02780. [链接](https://arxiv.org/abs/2601.02780)
8. Ross, Gordon, Bagnell. *A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning*. AISTATS 2011. [链接](https://arxiv.org/abs/1011.0686)
9. Snell, Klein, Zhong. *Learning by Distilling Context*. arXiv:2209.15189. [链接](https://arxiv.org/abs/2209.15189)
10. Zhao 等. *Self-Distilled Reasoner: On-Policy Self-Distillation for Large Language Models*. arXiv:2601.18734. [链接](https://arxiv.org/abs/2601.18734)
11. Shenfeld, Damani, Hübotter, Agrawal. *Self-Distillation Enables Continual Learning*. arXiv:2601.19897. [链接](https://arxiv.org/abs/2601.19897)
12. Hübotter 等. *Reinforcement Learning via Self-Distillation*. arXiv:2601.20802. [链接](https://arxiv.org/abs/2601.20802)
