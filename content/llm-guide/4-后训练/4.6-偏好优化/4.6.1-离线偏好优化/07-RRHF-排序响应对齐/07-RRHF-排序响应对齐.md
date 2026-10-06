---
title: "07 · RRHF: 排序响应对齐"
published: true
tags: ["RRHF", "hinge", "ranking", "SFT", "RLHF", "PPO", "best-of-n"]
excerpt: "RRHF 用当前模型的长度归一对数概率给每条回答打分, 用无间隔的 hinge 让分数顺序贴合奖励顺序, 再对奖励最高的回答做 SFT. 训练只需 1 到 2 个模型, HH 上 Alpaca-RRHF 奖励 -0.96, PPO 是 -1.03."
---
# RRHF: 排序响应对齐

> 相关阅读: [4.6.2 在线偏好与自对弈](../../4.6.2-在线偏好与自对弈/4.6.2-在线偏好与自对弈.md) · [06 SLiC](../06-SLiC-序列似然校准/06-SLiC-序列似然校准.md) · [08 PRO](../08-PRO-偏好排序优化/08-PRO-偏好排序优化.md) · [04 PPO](../../../4.4-强化学习基础/04-PPO/04-PPO.md) · [04 RAFT](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md) · [01 DPO](../01-DPO/01-DPO.md) · [01 Best-of-N](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/01-Best-of-N-奖励模型过优化/01-Best-of-N-奖励模型过优化.md)

材料是 Yuan, Yuan, Tan 等的 *RRHF: Rank Responses to Align Language Models with Human Feedback without tears* ([arXiv:2304.05302](https://arxiv.org/abs/2304.05302), NeurIPS 2023), 作者来自阿里达摩院与清华大学. 问题是能否把 PPO 换成一次带排序项的微调, 用多条回答的奖励顺序直接训练语言模型.

## 问题与打分

### PPO 的难处与 best-of-$n$

InstructGPT 的 RLHF 分三步: SFT, 训练奖励模型, PPO. RRHF 引言指出 PPO 这一步有两个难处. 第一, 要调的超参多, 涉及保守更新, 奖励设计, 优势估计. 第二, 标准实现要同时放下策略模型, 价值模型 (或价值头), 奖励模型, 参考模型四份, 内存吃紧, 放大到更大参数量时还需要复杂的训练平台.

另一条已有的路是 best-of-$n$: 推理时采 $n$ 条, 用奖励模型挑最高的 (Nakano 等 2021, Cobbe 等 2021). 它实现简单, 每次推理却要付 $n$ 倍采样. RRHF 的出发点是把 best-of-$n$ 的选择搬到训练期: 训练时看 $n$ 条回答及其奖励, 推理时只采 1 条.

PPO 的优化信号是优势, 即某个状态动作比价值网络估出的基线好多少, 所以训练全程都离不开价值网络. RRHF 改成在同一条查询的多条回答之间做比较, 回答之间互为参照, 不再需要额外估基线. 采样在训练前做完, 行为策略不随训练变化, PPO 里那项约束策略离初始模型不太远的 KL 也就不再需要. 代价也在这里: 候选回答一旦采定, 模型能学到的最好结果就被候选里的最好回答框住, 后文第 4.4 节和第 5 节的实验反复回到这一点. 改成在线采样能突破这个上限, 但会把奖励过优化和 KL 一起带回来.

**分数: 长度归一的条件对数概率**

记号沿用 Ziegler 等 2019. 查询 $x\sim\mathcal{D}$, 回答 $y$ 的奖励 $R(x,y)$ 由人或网络给出. 要学的自回归模型记作 $\pi$, 从初始模型 $\rho$ 初始化.

训练时每条 $x$ 有 $k$ 条回答 $y_i$, 由采样策略 $\rho_i$ 生成, $1\le i\le k$. $\rho_i$ 没有限制: 可以是初始模型 $\rho$, 可以是正在学的 $\pi$, 可以是 ChatGPT, GPT-4, 也可以是人写的好坏回答, 训练中途还可以换. 奖励函数给每条回答一个分数 $r_i=R(x,y_i)$. 模型 $\pi$ 自己给每条回答的分数是论文式 (1):

$$
p_i=\frac{\sum_t\log P_\pi(y_{i,t}|x,y_{i,<t})}{\|y_i\|} \tag{1}
$$

分子是整条回答逐 token 的条件对数概率之和, 分母 $\|y_i\|$ 是回答长度. 式 (1) 里只有当前模型, 没有参考模型, 也没有温度系数.

除以长度的原因是对数概率为负, 回答越长, 求和越负. 设两条回答平均每 token 的对数概率都是 $-1.0$, 长度分别是 10 和 40, 不归一的分数是 $-10$ 和 $-40$, 排序会系统性地偏向短回答; 归一以后两者都是 $-1.0$. 式 (1) 比的是平均每个 token 有多可能.

同一套权重同时做两件事: 生成时按自回归采样, 打分时按式 (1) 给候选排序. 论文因此说训好的模型既可以当语言模型, 也可以当奖励模型. 当奖励模型用时, 分数是长度归一的对数概率, 一般奖励模型则是在 [CLS] 或 [EOS] 位置接一个打分头.

**损失**

### 排序项

目标是让 $\pi$ 给更好的回答更大的 $p$, 给更差的回答更小的 $p$. 受 BRIO (Liu 等 2022) 启发, 论文用排序损失, 式 (2):

$$
L_{\mathrm{rank}}=\sum_{r_i<r_j}\max(0,p_i-p_j) \tag{2}
$$

求和遍历所有按奖励 $i$ 比 $j$ 差的对. 希望 $p_i<p_j$; 若差回答的 $p_i$ 反而更高, 罚 $p_i-p_j$. 排对的对贡献 0.

式 (2) 没有间隔. BRIO 加了随名次差增长的间隔 $\lambda_{ij}=(j-i)\lambda$, 鼓励排名越高的回答 $p$ 越高. 论文关掉了它, 理由是不加间隔经验效果已经很好, 而 $\lambda$ 要额外调. 奖励 $r$ 的数值不进入损失, 只决定哪些对要比较, 哪条当第一名.

**SFT 项与总损失**

另加一项和 SFT 一样的交叉熵, 要求模型学奖励最高的回答, 式 (3)(4):

$$
i'=\arg\max_i r_i \tag{3}
$$

$$
L_{\mathrm{ft}}=-\sum_t\log P_\pi(y_{i',t}|x,y_{i',<t}) \tag{4}
$$

总损失是两项不加权的和, 式 (5):

$$
L=L_{\mathrm{rank}}+L_{\mathrm{ft}} \tag{5}
$$

BRIO 建议给排序项乘 10 或 100, 论文在预实验里试过, 效果更差, 所以保持 1 比 1. 训练代码在 Stanford Alpaca 的 SFT 脚本上只多约 30 行, 对照的 PPO 实现是 CarperAI 的 trlX.

**梯度落在哪里**

把式 (1) 代入式 (2), 对一对排反的回答 ($r_i<r_j$ 且 $p_i>p_j$) 求梯度:

$$
\nabla_\theta\max(0,p_i-p_j)=\frac{1}{\|y_i\|}\sum_t\nabla_\theta\log P_\pi(y_{i,t}|\cdot)-\frac{1}{\|y_j\|}\sum_t\nabla_\theta\log P_\pi(y_{j,t}|\cdot) \tag{6}
$$

式 (6) 说明三件事. 第一, 下降方向压低差回答每个 token 的对数概率, 抬高好回答的, 每个 token 的权重是 $1/\|y\|$, 长回答单个 token 分到的梯度小. 第二, 权重只有 0 和 1 两档: 排对了就停, 排反了不论差多少, 系数都是 1. 第三, 一条回答可能出现在多个对里, 第三名要同时低于第一名, 高于第四名, 它的梯度是所在各对之和. $k$ 条回答最多 $\binom{k}{2}$ 对, $k=6$ 时 15 对.

$L_{\mathrm{ft}}$ 的梯度不除长度, 每个 token 权重为 1, 只落在第一名上. 两项的尺度因此不同: 第一名的 token 在 $L_{\mathrm{ft}}$ 里拿权重 1, 在 $L_{\mathrm{rank}}$ 里每对只拿 $1/\|y_{i'}\|$. 设第一名长 50 个 token, 它在 $k=6$ 时最多出现在 5 个对里, 排序项给它每个 token 的权重合计至多 $5/50=0.1$, 交叉熵给 1. 所以在第一名上, 交叉熵占主导; 排序项的作用主要落在排反的中间名次和差回答上. 这段比例是按式 (4)(6) 算出来的, 论文没有单独报告两项梯度的大小.

手算一组数. 设 $k=3$, 奖励 $r=(1.0,0.2,0.8)$, 顺序是 $r_2<r_3<r_1$; 分数 $p=(-0.80,-0.50,-0.90)$.

| 对 | 条件 | $p_i-p_j$ | hinge |
|----|------|----------:|------:|
| $(2,1)$ | $r_2<r_1$ | $-0.50-(-0.80)=0.30$ | $0.30$ |
| $(2,3)$ | $r_2<r_3$ | $-0.50-(-0.90)=0.40$ | $0.40$ |
| $(3,1)$ | $r_3<r_1$ | $-0.90-(-0.80)=-0.10$ | $0$ |

$L_{\mathrm{rank}}=0.70$. $y_3$ 的分数已经低于 $y_1$, 这一对不更新. $y_2$ 奖励最低, 分数却最高, 在两对里都被压. $L_{\mathrm{ft}}$ 只看 $y_1$.

![长度归一分数进 hinge, 奖励最高的那条另做 SFT](./images/fig-rrhf-pi-rank-sft.png)

**图 1 解析**

- 节点从左到右: 查询 $x$, $k$ 条回答 (来源 $\rho$, ChatGPT, 人写), 上路是模型打分框式 (1), 下路是奖励框 $r_i=R(x,y_i)$; 再往右是排序项, 第一名的 SFT 项, 总损失.
- 上路的打分框写明分母 $\|y_i\|$, 输出进排序项式 (2), 框内注明没有间隔. 奖励框标注只当排序依据, 虚线把 $r_i<r_j$ 的配对条件送进排序项, 奖励数值本身不进 hinge.
- 下路从奖励框取 $\arg\max$ 得 $i'$, 算式 (4); 右侧把两项不加权相加成式 (5). 底部注明式 (4) 不做长度归一.
- 图里没有参考模型和价值网络, 也没有画回答是训练前采好的这一时间顺序.

### 和 RLHF 三步的关系

论文 §3.2 把 RRHF 和 InstructGPT 三步逐一对照.

**和 SFT**. $k=1$ 且 $\rho_1$ 固定为人写回答时, 式 (2) 没有可比的对, 只剩式 (4), RRHF 退化成 SFT (行为克隆).

**和奖励模型**. 若 $R(x,y)$ 是人标的, 用式 (1) 拟合人标顺序, 等于在训一个以长度归一对数概率为输出的奖励模型.

**和 PPO**. PPO 最大化 $\mathbb{E}_{x\sim\mathcal{D},y\sim\pi(\cdot|x)}[R(x,y)]$, 为了不让策略离初始模型太远, 奖励改写成

$$
\tilde R(x,y)=R(x,y)-\beta\log\frac{\pi(y|x)}{\rho(y|x)} \tag{7}
$$

$\beta$ 固定 (InstructGPT) 或动态调整 (Ziegler 等). 论文列了四点差别: PPO 用 $\pi$ 采样, RRHF 用任意 $\rho_i$; PPO 在训练中采样, RRHF 在训练前采样, 式 (7) 的 KL 项因此用不上; PPO 优化奖励的绝对值, RRHF 只用不同回答之间奖励的比较, 论文认为后者更容易学; PPO 需要价值模型给出基线, RRHF 在采样回答之间比较.

**和其他微调技巧**. 结论部分补了一点: RRHF 的训练过程就是交叉熵加 hinge 的普通微调, 可以直接套用 Child-Tuning, R-Drop, HyPe 一类微调技巧; Ramamurthy 等发现 dropout 这类技巧会让强化学习训练变得不稳定. 相关工作里, 同期还有另一类做法是先构造更对齐的数据再做 SFT, 例如事后改写提示 (Zhang 等 2023 的 hindsight 指令重标注, Liu 等 2023 的 hindsight 微调) 或原则驱动的自对齐 (Sun 等 2023), 它们不在训练目标里做排序比较.

训练期需要的模型数也随之变化. 非在线设定里采样和打分都在训练前完成, 训练只加载 $\pi$ 一个模型; 在线设定要在训练中给新样本打分, 再加一个冻结的奖励模型, 合计 2 个.

## 实验设定

### 数据, 模型, 奖励

数据是 Anthropic 的 Helpful and Harmless (HH), 用 Hugging Face 上的 `Dahoas/rm-static` 版本, 每条查询有一条 chosen 和一条 rejected. 代理奖励模型是在同一数据上训的 `Dahoas/gptj-rm-static`, PPO 和 RRHF 用同一个奖励模型, 便于比较.

初始模型是 7B 的 LLaMA 和 Alpaca. InstructGPT 与 Ramamurthy 等做 PPO 时都从 SFT 模型出发, 论文也按 trlX 的做法在 `Dahoas/full-hh-rlhf` 的 chosen 回答上微调 Alpaca-7B, 记作 Alpaca-sft.

### 采样策略

训练效果和采样质量强相关. 论文把初始模型记作 $\rho$, 在线模型记作 $\pi$, 每训练 3 个 epoch 后的模型记作 $\rho^*$. 每条查询用模型采 4 条, 数据集自带的好坏两条记作 $\rho_5,\rho_6$, 最多 6 条. Table 1:

| 设定 | $\rho_1\sim\rho_4$ | $\rho_5,\rho_6$ |
|------|-------------------|-----------------|
| BP | $\rho$ 做 beam search | 数据集回答 |
| SP | $\rho$ 做 top-$p$ 采样 | 数据集回答 |
| DP | $\rho$ 做 diverse beam search | 数据集回答 |
| OP-$k$ | $\pi$ 在线 diverse beam, 每 $k$ 步更新 | 数据集回答 |
| IP-$n$ | 上一轮训完的 $\rho^*$ 做 diverse beam | 数据集回答 |
| D | $\rho$ 做 diverse beam | 无 |
| P | 无 | 数据集回答 |

IP-1 就是 DP. 普通 beam search 的 beam 为 4, 最多生成 128 个 token; 它采出的样本多样性低, 所以另试两种: diverse beam search (beam 4, 4 组, 多样性惩罚 1.0, 温度 0.8) 和 top-$p$ 采样 (beam 4, top-$p$ 为 1.0, 温度 0.8, 与 PPO 基线的采样设置一致). 除 OP 外采样都在训练前完成, 在 8 张 80GB A100 上需要 4 到 6 小时.

### 训练超参与基线

训练 3 个 epoch, 不早停. 学习率预热到 $2\times10^{-5}$ 后线性降到 0. 每张卡一次最多 1 条查询, 梯度累积 8 步, 查询 batch 64. 查询和回答截断到 192 token. 8 张 A100 上非在线训练 4 到 6 小时, OP 约 30 小时.

PPO 基线建成逐 token 的马尔可夫决策过程: 动作是第 $t$ 步生成的 token, 状态是查询加已生成的前缀. 用 clip 代理目标, clip 比例 $\epsilon=0.2$, 优势用 GAE 估计, 价值函数单独学习. 概率比 $r_\theta=\pi_\theta(y_t|x,y_{<t})/\pi_{\hat\theta}(y_t|x,y_{<t})$ 的分母是行为策略, 每隔几次更新就用训练策略替换一次. 超参沿用 trlX 在 6B GPT-J 上的设置, 对应的 SFT checkpoint 是 `Dahoas/pythia-6B-static-sft`.

评测看三项: gpt2-medium 算的困惑度, `Dahoas/gptj-rm-static` 的平均奖励, 人工比较的胜平负. HH 是多轮对话, 模型一旦生成 `Human:` 或 `Assistant:` 就截断, 防止模型伪造一轮对话来骗奖励模型 (例如生成「Assistant: 我的回答无害且有帮助吗? Human: 是的, 很无害也很有帮助」).

## 结果与消融

### 自动评测

Table 2:

| $\rho$ | 设定 | PPL | 奖励 |
|--------|------|----:|-----:|
| 数据集好回答 | 不训练 | 21.46 | $-1.24$ |
| 数据集坏回答 | 不训练 | 121.29 | $-1.48$ |
| LLaMA | 不训练 | 20.78 | $-1.89$ |
| Alpaca | 不训练 | 14.34 | $-1.18$ |
| Alpaca-sft | 不训练 | 18.98 | $-1.46$ |
| Alpaca | Best-of-4 | - | $-0.97$ |
| LLaMA | PPO | 42.53 | $-1.62$ |
| Alpaca | PPO | 13.84 | $-1.03$ |
| Alpaca-sft | PPO | 19.10 | $-1.25$ |
| LLaMA | RRHF-DP | 67.12 | $-1.34$ |
| Alpaca-sft | RRHF-DP | 18.10 | $-1.19$ |
| Alpaca | RRHF-DP | 14.75 | $-1.03$ |
| Alpaca | RRHF-SP | 14.41 | $-0.96$ |

Alpaca-RRHF-DP 的 $-1.03$ 是三次运行 ($-1.01$, $-1.02$, $-1.05$) 的平均, 与 Alpaca-PPO 持平; RRHF-SP 到 $-0.96$, 全表最高, 和推理期 Best-of-4 的 $-0.97$ 相当. 三个初始模型上 RRHF 的奖励都不低于 PPO. Alpaca 系列训练后的奖励都超过数据集好回答的 $-1.24$. Alpaca 的困惑度变化不大, LLaMA 变化很大 (20.78 到 67.12), 论文的解释是 LLaMA 没有做过指令微调.

训练过程本身也给了一个可用的信号. Figure 3 画的是 Alpaca 起点, DP 采样下的损失和平均奖励: 损失与平均奖励负相关, 看损失曲线就能估计奖励; 损失在第三个 epoch (约 2400 到 3600 步) 收敛, 平均奖励也在第三个 epoch 到最高. RRHF 在和 SFT 相同的超参下就能收敛. 这一点和 PPO 不同: PPO 训练中奖励上升时 KL 也在变, 只看奖励曲线判断不了是否已经在利用奖励模型, 而 RRHF 的式 (5) 里两项都是固定样本上的监督损失, 损失下降对应固定候选上排序变准, 不会出现奖励涨了损失反而发散的情形. 第 5 节的在线设定打破了这一前提, 那时奖励曲线和输出质量就分开了.

**人评**

代理奖励模型和人的偏好可能不一致, 论文另做了人评, 三组都从 Alpaca 出发. Table 3:

| A | B | 胜 | 平 | 负 |
|---|---|--:|--:|--:|
| RRHF-DP | 数据集好回答 | 59 | 30 | 11 |
| RRHF-DP | PPO | 27 | 48 | 25 |
| RRHF-DP | RRHF-IP-2 | 0 | 90 | 10 |

对数据集好回答明显占优; 对 PPO 基本持平; IP-2 用 RRHF-DP 自己采的样本再训一轮, 比 DP 更好, 迭代训练还能继续提升. 附录 D 写了标注细节: 共抽 330 对, 三组各 110 对, 其中 30 对用来算一致性, 300 对计分; 每个标注者标 130 对 (100 对随机加 30 对公共). 两两标注者完全相同的比例 57.7%, 互不矛盾的比例 84.4%.

Table 4 的样例里, RRHF-DP 的回答细节更多. 问能不能用 Clorox 把衣服洗白, RRHF-DP 答可以, 并说明 Clorox 是漂白剂品牌, 还提到小苏打; 数据集回答只说 Clorox 比醋毒性大. 问投资哪只股票能跑赢标普 500, IP-2 把亏损风险, 预期收益, 可投资金额分开列出.

**当奖励模型用**

训好的模型可以用式 (1) 的 $p_i$ 给回答打分. 论文在训练 `Dahoas/gptj-rm-static` 的测试集上算准确率, 即好回答分数高于坏回答的比例. Table 5:

| 打分模型 | 准确率 |
|---------|-------:|
| Dahoas/gptj-rm-static | 68.49% |
| LLaMA | 45.09% |
| Alpaca | 45.13% |
| Alpaca-PPO | 46.03% |
| Alpaca-RRHF-DP | 61.75% |

未训练的语言模型和 PPO 训过的模型都低于随机猜测. RRHF-DP 到 61.75%, 它学的是代理奖励模型给出的顺序, 没见过奖励模型的训练集, 所以难以超过奖励模型本身的 68.49%.

**消融**

消融分两类: 一类换初始模型和采样方式, 看候选质量怎样决定结果; 另一类去掉排序项, 看式 (2) 自身贡献多少. Table 6 是前一类, 同时给出训练样本奖励的均值, 标准差, 最大值 (每条查询取最大后再平均):

| $\rho$ | 设定 | PPL | 测试奖励 | 均值 | 标准差 | 最大 |
|--------|------|----:|--------:|-----:|------:|-----:|
| LLaMA | DP | 67.12 | $-1.34$ | $-2.18$ | 0.97 | $-1.27$ |
| Alpaca | DP | 14.75 | $-1.02$ | $-1.30$ | 0.66 | $-0.95$ |
| Alpaca-sft | DP | 18.10 | $-1.19$ | $-1.49$ | 0.79 | $-1.11$ |
| LLaMA | BP | 17.03 | $-1.27$ | $-2.26$ | 0.96 | $-1.26$ |
| Alpaca | BP | 14.37 | $-1.03$ | $-1.31$ | 0.67 | $-1.00$ |
| Alpaca-sft | BP | 17.63 | $-1.14$ | $-1.50$ | 0.77 | $-1.15$ |
| LLaMA | P | 18.49 | $-1.31$ | $-1.50$ | 0.79 | $-1.28$ |
| Alpaca | P | 18.88 | $-1.31$ | $-1.50$ | 0.79 | $-1.28$ |
| Alpaca-sft | P | 18.92 | $-1.31$ | $-1.50$ | 0.79 | $-1.28$ |
| Alpaca | D | 13.66 | $-1.08$ | $-1.21$ | 0.65 | $-1.02$ |
| Alpaca | IP-1 | 14.75 | $-1.02$ | $-1.30$ | 0.66 | $-0.95$ |
| Alpaca | IP-2 | 14.31 | $-0.96$ | $-1.13$ | 0.57 | $-0.77$ |
| Alpaca | IP-3 | 14.51 | $-0.94$ | $-1.05$ | 0.56 | $-0.65$ |
| Alpaca | OP-32 | 63.78 | $0.34$ | - | - | - |
| Alpaca | OP-32+KL | 19.76 | $-0.86$ | - | - | - |

几处读法:

- **LLaMA 最差, 原因在采样**. 只用数据集两条回答 (设定 P) 时, 三个初始模型的测试奖励都是 $-1.31$, 训练数据相同时能力相同. LLaMA 没做过指令微调, 它自己采的回答奖励 $-1.89$, 远低于 Alpaca 的 $-1.18$ 和 Alpaca-sft 的 $-1.46$.
- **Alpaca-sft 不如 Alpaca**. Ramamurthy 等也观察到 SFT 预热不一定提升效果.
- **采样方式**. 非在线设定里, Alpaca 用 diverse beam 最好, 另两个模型用普通 beam 更好. 模型样本加数据集回答, 明显好于只用数据集回答. 只用 Alpaca 自己的样本 (设定 D) 也能到 $-1.08$.
- **迭代**. IP-1, IP-2, IP-3 的测试奖励 $-1.02$, $-0.96$, $-0.94$, 训练样本最大奖励 $-0.95$, $-0.77$, $-0.65$, 两者同步上升.

排序项是否必要看 Table 7, Alpaca 加 BP 采样: 完整 RRHF 困惑度 14.37, 奖励 $-1.03$; 去掉 $L_{\mathrm{rank}}$ 后 14.74, $-1.14$. 只剩第一名的交叉熵, 模型学不到一条回答比另一条好在哪里. 结合第 2.3 节的梯度看, 去掉排序项后差回答上的梯度整个消失, 中间名次也不再被要求低于第一名, 训练只是在每条查询的最优候选上做 SFT. 奖励差 0.11, 比 Table 6 里 BP 和 DP 两种采样之间的差还大, 说明在固定候选上, 利用名次信息带来的收益不小于换一种采样方式. 去掉排序项以后的做法和同期的 [RAFT](../../../4.7-AI反馈与奖励过优化/4.7.2-Best-of-N与奖励过优化/04-RAFT-奖励排序微调/04-RAFT-奖励排序微调.md) (Dong 等 2023) 一致, 论文把这组消融作为和 RAFT 的区别.

### 在线采样与其他任务

**OP-32: 骗过奖励模型**

主实验都用初始模型采样. 改成像 PPO 那样用正在训练的 $\pi$ 采样, 需要奖励模型在线打分. 每 32 步更新一次采样模型 (OP-32), 平均奖励很快升到 0.34, 困惑度恶化到 63.78. 人工检查发现输出变成友好但空洞的回答, 如「That sounds great! I appreciate your help. Thanks for your help! You're welcome! ...」, 奖励模型被骗了.

缓解办法是像 PPO 一样把 KL 加进奖励, 系数 0.01. OP-32+KL 奖励 $-0.86$, 高于 PPO 和 RRHF-DP, 困惑度 19.76. 代价是要多放一个参考模型算 KL, 还要调 KL 系数, 与 RRHF 少模型, 少超参的初衷相反. 论文总结在线方法 (PPO 与在线 RRHF) 可能上限更高, 但有三个困难: 要更多显存放参考模型; 训练要在自回归采样和并行训练之间切换, 速度慢; 要调 KL 系数和 rollout 步数. 资源有限时, 非在线 RRHF 更好用.

**best-of-$n$ learner: 测试奖励贴近训练样本的最大奖励**

Table 6 里, 测试奖励与训练样本的平均奖励和最大奖励都高度相关, 两者升, 测试奖励也升. 效果好的模型奖励标准差小, 因为它被鼓励更多输出高奖励回答. 最主要的发现是: 非在线设定下, 学到的模型的平均奖励接近训练样本最大奖励的均值. 在线设定会生成作弊模式, 截断这些模式后同样成立. 论文把目标写成式 (8):

$$
\mathbb{E}_{x,y\sim\pi(x)}R(x,y)=\max_i\mathbb{E}_{x,y_i\sim\rho_i(x)}R(x,y_i) \tag{8}
$$

式 (8) 是论文对实验现象的概括, 没有给出推导. 它的含义是 $\pi$ 的期望奖励高于任何单个采样策略 $\rho_i$, 方差变小. Table 8 比较几种方法每条查询的采样次数:

| 方法 | 训练 | 推理 |
|------|------|------|
| Best-of-$n$ | - | $n$ |
| SFT | 固定 1 条 | 1 |
| PPO | 1 | 1 |
| RRHF | 固定 $n$ 条 | 1 |
| RRHF-OP | $n$ | 1 |

「固定」指训练样本在训练前就定了. 推理期的 $n$ 倍采样被换成训练期的 $n$ 条固定样本.

**Wombat: 用 ChatGPT 当奖励**

前面的实验对齐的是代理奖励模型. 为了模拟训练类 ChatGPT 模型的场景, 论文用 ChatGPT 当 $R(x,y)$ (附录 E). 查询取 Alpaca 的训练指令, 每条 5 个回答: 两条 ChatGPT, 一条 text-davinci-003, 一条 LLaMA, 一条 Alpaca. 让 ChatGPT 按相关性, 正确性, 连贯性, 安全性四个维度各打 1 到 5 分, 求和作为奖励. 52k 条里成功解析出 46k 条. 从 Alpaca 出发训 RRHF, 得到 Wombat, 8 张 A100 上训练 4 小时.

在 Vicuna 的 80 题测试集上比较, Table 9:

| 模型 A | A 得分 | B 得分 | 模型 B |
|--------|------:|------:|--------|
| Alpaca | 567 | 616 | Wombat |
| Alpaca (ChatGPT) | 574 | 612 | Wombat |
| ChatGPT | 669 | 548 | Wombat |

Alpaca (ChatGPT) 是用 Alpaca 指令加 ChatGPT 回答做 SFT 的模型. Wombat 胜过两种 SFT 模型, 论文据此说 RRHF 在相近训练资源下容易超过 SFT. Wombat 仍落后于 ChatGPT, 论文认为主要差在逻辑推理. 附录 B 写明 Wombat 只供研究, 不用于生产, 仍可能生成不安全回答.

### IMDB 情感续写

附录 C 在 IMDB 上做正面影评续写, 按 Ramamurthy 等的设置: 输入是至多 64 token 的部分影评, 生成至多 48 token, 奖励是 DistilBERT 情感分类器, 起点是同一个 SFT GPT-2. Table 10:

| 方法 | 设定 | 奖励 | 困惑度 |
|------|------|-----:|------:|
| SFT | - | 0.539 | 35.472 |
| PPO | 无 KL | 0.796 | 42.916 |
| NLPO | 无 KL | 0.777 | 41.035 |
| RRHF | BP | 0.861 | 32.083 |
| RRHF | B (不用数据集续写) | 0.799 | 32.077 |
| RRHF-OP-128 | 无 KL | 0.990 | 32.081 |
| PPO | KL 0.1 | 0.626 | 35.049 |
| NLPO | KL 0.1 | 0.620 | 34.816 |
| RRHF-OP-128 | KL 0.1 | 0.635 | 32.088 |

RRHF 只训 5 个 epoch, 有无 KL 两种情况下奖励和困惑度都好于 PPO 和 NLPO. RRHF-OP-128 不加 KL 时奖励 0.990, 困惑度却没变, 样例显示模型对不同输入都续写「It's a great film and I highly recommend it to anyone.」, 和 HH 上 OP-32 的问题同类.

## 对照与边界

### 和 PPO, RAFT, DPO 对照

| | PPO | RAFT | DPO | RRHF |
|--|-----|------|-----|------|
| 分数 | 奖励模型 $r_\phi$, KL 进奖励 | 奖励模型排序 | $\beta\log(\pi/\pi_{\mathrm{ref}})$ | 式 (1) 的 $p_i$ |
| 损失 | clip 代理目标 | 只对第一名 CE | Bradley-Terry 的 $-\log\sigma$ | 无间隔 hinge 加第一名 CE |
| 进入更新的样本 | 当前 rollout | 只有第一名 | 成对 $(y_w,y_l)$ | hinge 用全部对, CE 只用第一名 |
| 采样 | 训练中 $y\sim\pi$ | 当前模型 | 离线对 | 训练前任意 $\rho_i$ |
| 训练期模型数 | 4 | 1 | 2 (含冻结参考) | 1 到 2 |

和 [DPO](../01-DPO/01-DPO.md) 比, DPO 从带 KL 约束的 RLHF 目标反解隐式奖励, 分数里有冻结参考 $\pi_{\mathrm{ref}}$ 和温度 $\beta$, 损失是光滑的 $-\log\sigma$, 不除长度. RRHF 的分数只有当前模型, 除了长度, 损失在排对时截断.

和 [06 SLiC](../06-SLiC-序列似然校准/06-SLiC-序列似然校准.md) 比, SLiC-HF 的 hinge 有间隔 $\delta$, 序列对数似然不除长度, 交叉熵的目标是 SFT 参考或最优候选. 两者都受 BRIO 一路的序列级排序方法影响.

[08 PRO](../08-PRO-偏好排序优化/08-PRO-偏好排序优化.md) 的分数和式 (1) 相同, 损失换成对剩余集合逐次 softmax 的 Plackett-Luce 形式.

![四列对照: PPO 四个模型, RAFT 只留第一名, DPO 隐式奖励, RRHF 的长度归一分数与 hinge](./images/fig-rrhf-vs-ppo-raft-dpo.png)

**图 2 解析**

- 四列互相独立, 每列从上到下是一种方法的流程. PPO 列是 Actor, Critic, 奖励模型, 冻结参考四个模型, 底注 4 个模型, 只能 $y\sim\pi$, 用 clip 加 GAE.
- RAFT 列: 每条提示采 $K$ 条, 保留奖励最高者, 只对它做 SFT, 其余丢弃, 底注没有排序 hinge.
- DPO 列: 离线对, 隐式奖励 $\beta\log(\pi/\pi_{\mathrm{ref}})$, Bradley-Terry 损失, 损失里没有长度. RRHF 列: 任意 $\rho_i$ 的 $k$ 条回答, 长度归一分数 (框里是式 (1) 的简写), 无间隔 hinge, 加第一名的 $L_{\mathrm{ft}}$, 底注 1 到 2 个模型.
- 图中没有数值, 也不表示各方法效果高低.

### 失效与边界

最常见的失效来自采样质量. 测试奖励紧跟训练样本里的最大奖励, 采样差, 上限就低: LLaMA 用自己的 diverse beam 样本只到 $-1.34$, 而只用数据集回答时, LLaMA 和两个 Alpaca 起点都是 $-1.31$. 想提高 RRHF 的效果, 先要提高候选的质量.

其他边界:

- **奖励过优化**. 在线或迭代采样时, RRHF 容易去骗奖励模型, OP-32 和 IMDB 的 OP-128 都出现了. Limitations 指出这是 RRHF, PPO, best-of-$n$ 共有的问题, 引的是 Gao 等的过优化研究, 怎么防止留作未来工作.
- **单条查询的显存**. RRHF 每条查询要同时前向 $k$ 条回答, 单条查询的 GPU 占用比 PPO 高. 省的是常驻模型数, 每一步的峰值激活反而更大.
- **代理奖励**. HH 主表的奖励来自 GPT-J 奖励模型, 它可能不如真实人类偏好复杂; Limitations 认为换成真实人类偏好分只是直接的推广, 论文没有做这组实验. 人评与之方向一致, 但对 PPO 是 27 胜 25 负, 差距在噪声范围内.
- **排序项权重**. 排序项乘 10 或 100 效果更差, 式 (5) 的 1 比 1 是论文推荐值.
- **有害偏好**. 方法本身不检查奖励的来源, 附录 A 指出它同样能对齐到有害偏好.

方法还有两种退化情形. $k=1$ 时没有可比的对, 退回 SFT; 没有奖励也没有人标顺序时, 式 (2)(3) 没有输入. 需要逐步过程奖励或在线探索的任务, 离线 hinge 帮不上.

**参考文献**

1. Yuan, Z., Yuan, H., Tan, C., Wang, W., Huang, S., & Huang, F. (2023). [RRHF: Rank Responses to Align Language Models with Human Feedback without tears](https://arxiv.org/abs/2304.05302). *NeurIPS*. 代码: [GanjinZero/RRHF](https://github.com/GanjinZero/RRHF).
2. Ouyang, L., et al. (2022). [Training language models to follow instructions with human feedback](https://arxiv.org/abs/2203.02155). *NeurIPS*.
3. Ziegler, D. M., et al. (2019). [Fine-Tuning Language Models from Human Preferences](https://arxiv.org/abs/1909.08593).
4. Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). [Proximal Policy Optimization Algorithms](https://arxiv.org/abs/1707.06347).
5. Bai, Y., et al. (2022). [Training a Helpful and Harmless Assistant with Reinforcement Learning from Human Feedback](https://arxiv.org/abs/2204.05862).
6. Liu, Y., Liu, P., Radev, D., & Neubig, G. (2022). [BRIO: Bringing Order to Abstractive Summarization](https://aclanthology.org/2022.acl-long.207/). *ACL*.
7. Dong, H., et al. (2023). [RAFT: Reward rAnked FineTuning for Generative Foundation Model Alignment](https://arxiv.org/abs/2304.06767).
8. Ramamurthy, R., et al. (2023). [Is Reinforcement Learning (Not) for Natural Language Processing: Benchmarks, Baselines, and Building Blocks for Natural Language Policy Optimization](https://arxiv.org/abs/2210.01241). *ICLR*.
9. Gao, L., Schulman, J., & Hilton, J. (2023). [Scaling Laws for Reward Model Overoptimization](https://arxiv.org/abs/2210.10760). *ICML*.
10. Nakano, R., et al. (2021). [WebGPT: Browser-assisted question-answering with human feedback](https://arxiv.org/abs/2112.09332).
11. Taori, R., et al. (2023). [Stanford Alpaca: An Instruction-following LLaMA model](https://github.com/tatsu-lab/stanford_alpaca).
12. Touvron, H., et al. (2023). [LLaMA: Open and Efficient Foundation Language Models](https://arxiv.org/abs/2302.13971).
13. Chiang, W.-L., et al. (2023). [Vicuna: An Open-Source Chatbot Impressing GPT-4 with 90%* ChatGPT Quality](https://lmsys.org/blog/2023-03-30-vicuna/).
14. Rafailov, R., et al. (2023). [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290). *NeurIPS*.
