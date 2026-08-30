---
title: "01 · SPIN：自对弈微调，对手是上一轮自己"
date: 2026-08-30
as_of: 2026-08-30
category: 论文精读
published: true
excerpt: >-
  SPIN（arXiv:2401.01335）：对手是上一轮自己，靶是人类 SFT 分布；logistic 损失与 DPO 同形但数据不同。
  报告 Table 4 具体数字。锚在真实数据上。不是 RLHF、不是 OPD、不是 RSI 本身。
tags:
  - RSI
  - SPIN
  - 自对弈
  - Self-Play
  - 自我改进
  - 模型层进化
---

# 01 SPIN：自对弈微调，无新偏好数据的分布匹配

SFT 把人类演示吃进权重之后，再在同一份数据上继续 SFT 往往会平台甚至变差。SPIN（Self-Play fIne-tuNing）要解决的瓶颈是：**不再买新的人类偏好，仍然把弱 LLM 往人类数据分布上推**。做法是让当前模型去区分「人类回答 $y$」和「上一轮自己生成的 $y'$」，然后把新模型拷成下一轮对手。

本篇是 Model 层训练式自改进的样板，位置见 [02 Model–Harness–Artifact](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)。**不是** RLHF（没有奖励模型，没有新偏好标注），**不是** OPD（不蒸馏教师 token 分布，公式在 [llm-guide 4.6](../../../llm-guide/4-后训练/4.6-OPD/4.6-OPD.md)），**不是** RSI 本身（靶 $p_{\mathrm{data}}$ 固定，改进器没有被改）。论文：Chen et al., arXiv:2401.01335，UCLA；HTML 以 2024 稿为准，文末标注 NeurIPS 2025 poster。

## 1. 问题：SFT 已经饱和，偏好数据又贵

设 prompt $\mathbf{x}\sim q(\cdot)$，人类高质量回答来自 $p_{\mathrm{data}}(\cdot|\mathbf{x})$，模型策略为自回归

$$
p_{\bm{\theta}}(\mathbf{y}|\mathbf{x})=\prod_{j=1}^{m}p_{\bm{\theta}}(y_j|\mathbf{x},\mathbf{y}_{<j}). \tag{1}
$$

SFT 最小化负对数似然

$$
L_{\mathrm{SFT}}(\bm{\theta})=-\mathbb{E}_{\mathbf{x}\sim q,\,\mathbf{y}\sim p_{\mathrm{data}}}\bigl[\log p_{\bm{\theta}}(\mathbf{y}|\mathbf{x})\bigr]. \tag{2}
$$

式 (2) 的全局最小在 $p_{\bm{\theta}}=p_{\mathrm{data}}$。实践里，一份有限 SFT 集训完之后，$p_{\bm{\theta}_0}$ 仍然明显差于 $p_{\mathrm{data}}$：论文 Figure 1 给出的例子是模型会编造交通方式百分比，人类回答则只做定性概括。继续在同一 $S_{\mathrm{SFT}}$ 上做 SFT，作者用 zephyr-7b-sft-full 再训 1 epoch，Open LLM 均分从 **58.14 掉到 57.23**（Appendix Table 5）。RL 微调又要求奖励函数，奖励函数又要求偏好数据。SPIN 的设定是：**只用已经有的 SFT 对 $(\mathbf{x},\mathbf{y})$，不再买 $(\mathbf{x},y_w,y_l)$**。

## 2. 两玩家：主模型分辨，对手是上一轮自己

把过程写成双人博弈。第 $t+1$ 轮：

- **对手（opponent）**：$p_{\bm{\theta}_t}$，用 SFT 里的 prompt $\mathbf{x}$ 采样 $\mathbf{y}'\sim p_{\bm{\theta}_t}(\cdot|\mathbf{x})$。
- **主玩家（main player）**：要学的 $p_{\bm{\theta}_{t+1}}$，目标是给人类 $\mathbf{y}$ 打高分、给 $\mathbf{y}'$ 打低分。
- **拷贝**：学完后 $\bm{\theta}_{t+1}$ 直接成为下一轮对手。

主玩家先被想成一个打分函数 $f$。在积分概率度量（IPM）动机下，希望 $f(\mathbf{x},\mathbf{y})-f(\mathbf{x},\mathbf{y}')$ 尽量大。线性损失会让 $f$ 在负样本上跑到 $-\infty$，所以论文取 logistic

$$
\ell(t)=\log\bigl(1+\exp(-t)\bigr), \tag{3}
$$

把问题写成

$$
f_{t+1}=\mathop{\mathrm{argmin}}_{f\in\mathcal{F}_t}\mathbb{E}\bigl[\ell\bigl(f(\mathbf{x},\mathbf{y})-f(\mathbf{x},\mathbf{y}')\bigr)\bigr], \tag{4}
$$

期望对 $\mathbf{x}\sim q$、$\mathbf{y}\sim p_{\mathrm{data}}$、$\mathbf{y}'\sim p_{\bm{\theta}_t}$。对手侧则最大化 $\mathbb{E}[f_{t+1}(\mathbf{x},\mathbf{y})]$，并加 KL 正则以免一步跳太远：

$$
\max_{p}\;\mathbb{E}_{\mathbf{y}\sim p}[f_{t+1}(\mathbf{x},\mathbf{y})]-\lambda\,\mathrm{KL}\bigl(p(\cdot|\mathbf{x})\,\|\,p_{\bm{\theta}_t}(\cdot|\mathbf{x})\bigr). \tag{5}
$$

式 (5) 的闭式解是 $p(\mathbf{y}|\mathbf{x})\propto p_{\bm{\theta}_t}(\mathbf{y}|\mathbf{x})\exp(\lambda^{-1}f_{t+1}(\mathbf{x},\mathbf{y}))$。要求它落在 LLM 族里，函数类只能取对数比：

$$
\mathcal{F}_t=\Bigl\{\lambda\log\frac{p_{\bm{\theta}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_t}(\mathbf{y}|\mathbf{x})}\Bigm|\bm{\theta}\in\bm{\Theta}\Bigr\}, \qquad
f_{t+1}(\mathbf{x},\mathbf{y})=\lambda\log\frac{p_{\bm{\theta}_{t+1}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_t}(\mathbf{y}|\mathbf{x})}. \tag{6}
$$

把式 (6) 代回式 (4)，两端合成一条端到端损失——这就是论文 (4.7)：

$$
L_{\mathrm{SPIN}}(\bm{\theta},\bm{\theta}_t)=\mathbb{E}\Biggl[\ell\Biggl(\lambda\log\frac{p_{\bm{\theta}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_t}(\mathbf{y}|\mathbf{x})}-\lambda\log\frac{p_{\bm{\theta}}(\mathbf{y}'|\mathbf{x})}{p_{\bm{\theta}_t}(\mathbf{y}'|\mathbf{x})}\Biggr)\Biggr]. \tag{7}
$$

其中 $\mathbf{y}$ 永远来自人类 SFT，$\mathbf{y}'$ 永远来自**上一轮自己**。算法 1：每轮对每个 $\mathbf{x}_i$ 生成 $\mathbf{y}'_i$，再对式 (7) 的有限和做一次微调。实现里 Alignment Handbook 的 $\beta$ 对应这里的 $\lambda$；作者对 iter 0–1 取 $\beta=0.1$，接近收敛的 iter 3 把 $\beta$ 提到 $5.0$ 以减小步长。

![SPIN 一轮：人类 y 与上一轮 y′ 进入 logistic 损失，学完的 θ 拷成下一轮对手](./images/fig-spin-self-play.png)

> 图 1：SPIN 一轮。人类 $y$ 与上一轮 $y'$ 进入同一条 logistic 损失；学完的 $\theta_{t+1}$ 拷成下一轮对手。（自绘，对应论文 §4.1 与 Algorithm 1）

**图 1 解析**

- **左橙 Opponent**：冻结的 $p_{\theta_t}$，只负责采样，不回传。
- **上绿 $p_{\mathrm{data}}$**：人类回答 $y$，是唯一的「真」锚。没有这条锚，自对弈没有方向。
- **右蓝 Main player**：被训练的 $p_{\theta}$，要让 $\log(p_\theta(y)/p_{\theta_t}(y))$ 大于 $\log(p_\theta(y')/p_{\theta_t}(y'))$。
- **底框损失**：式 (7)。形状像 DPO，代入物不是偏好对。
- **回弯箭头**：$\theta_{t+1}$ 变成下一轮对手。这是「self-play」的全部含义——不是两个独立种群，是时间上错开的同一条权重。

## 3. 和 DPO 同形，不是 DPO

DPO 从 Bradley-Terry 来，最大化人类（或 AI）偏好对的似然。标准写法是

$$
\mathcal{L}_{\mathrm{DPO}}=-\mathbb{E}\Bigl[\log\sigma\Bigl(\beta\log\frac{\pi_{\theta}(y_w|x)}{\pi_{\mathrm{ref}}(y_w|x)}-\beta\log\frac{\pi_{\theta}(y_l|x)}{\pi_{\mathrm{ref}}(y_l|x)}\Bigr)\Bigr]. \tag{8}
$$

因为 $-\log\sigma(t)=\log(1+e^{-t})$，式 (7) 在 logistic $\ell$ 下与式 (8) **同形**。论文 §4.2 把差别写死，不要背错：

1. **数据**：SPIN 只要 SFT 对 $(\mathbf{x},\mathbf{y})$；DPO 要偏好三元组 $(\mathbf{x},y_w,y_l)$。SPIN 的「赢」是人类演示，「输」是上一轮自己。
2. **参照策略**：SPIN 每轮的参照是 $p_{\bm{\theta}_t}$（上一轮自己）；DPO 通常把参照钉在 SFT checkpoint。
3. **迭代**：SPIN 的自对弈**自然导致**多轮；DPO 本身是一轮匹配偏好概率，迭代 DPO 是后来的推广（Xu et al. 2023；Self-Rewarding 也走迭代 DPO）。
4. **损失族**：SPIN 允许任何单调递减凸 $\ell$（相关、hinge、指数、logistic）。**只有 logistic 时**才长得像 DPO。
5. **目标**：DPO 对齐偏好概率；SPIN 对齐生成分布 $p_{\theta}(\mathbf{y}|\mathbf{x})$ 与 $p_{\mathrm{data}}(\mathbf{y}|\mathbf{x})$。

Self-Rewarding LM（Yuan et al., 2024）被论文列为并发：那边用模型自己当奖励模型打偏好，再迭代 DPO。SPIN 的「自评」是隐式的，中间没有分数、没有 LLM-as-a-Judge。家族对照见 [Self-Rewarding 专文](../02-Self-Rewarding-家族/02-Self-Rewarding-家族.md)，本篇不重写。

![SPIN 与 DPO 共用 logistic 骨架，代入的赢家/输家与参考策略不同](./images/fig-spin-dpo-contrast.png)

> 图 2：DPO 与 SPIN 的代入物对照（自绘）。中间骨架同为 logistic 偏好损失。

**图 2 解析**

- **左 DPO**：赢家 / 输家来自人类或冻结奖励模型；参照通常冻结；默认一轮。
- **右 SPIN**：赢家钉死在 $p_{\mathrm{data}}$，输家是上一轮自己；参照跟着走；必须迭代。
- **不要说「SPIN 就是 DPO」**：同形来自 logistic + 对数比函数类，不是同一算法。

## 4. 理论：停下来当且仅当已经等于人类分布

Assumption 5.1：$\ell$ 单调递减、$\ell'(0)<0$、凸。Theorem 5.2：

- **充分**：若 $p_{\bm{\theta}_t}=p_{\mathrm{data}}$，则 $\bm{\theta}_t$ 是式 (7) 对任意 $\lambda\ge 0$ 的全局最小。
- **必要**：若 $p_{\bm{\theta}_t}\ne p_{\mathrm{data}}$，则存在合适的 $\lambda$ 使 $\bm{\theta}_t$ **不是**全局最小。

一句话：优化过程**停在** $p_{\theta}=p_{\mathrm{data}}$，也**只在**那里停。这既是收敛保证，也是天花板声明——靶是固定人类分布。

Theorem 5.4（logistic）：若下一轮全局最小落在 LLM 族内，则

$$
p_{\bm{\theta}_{t+1}}(\mathbf{y}|\mathbf{x})\propto p_{\bm{\theta}_t}(\mathbf{y}|\mathbf{x})\Bigl(\frac{p_{\mathrm{data}}(\mathbf{y}|\mathbf{x})}{p_{\bm{\theta}_t}(\mathbf{y}|\mathbf{x})}\Bigr)^{1/\lambda}. \tag{9}
$$

$p_t<p_{\mathrm{data}}$ 的点被抬高，$p_t>p_{\mathrm{data}}$ 的点被压低。$\lambda$ 小则步子大，$\lambda$ 大则稳。作者在最后一轮加大 $\beta$，就是这条。

## 5. 实验：Table 4 的具体数字

基座 **zephyr-7b-sft-full**（Mistral-7B 在 Ultrachat200k 上 SFT）。SPIN 从 Ultrachat200k **随机抽 50k prompt** 生成合成回答；iter 0 用 50k 合成，iter 1–3 把上一轮合成与本轮合成拼成 100k。每轮 2 epoch。评测走 HuggingFace Open LLM Leaderboard，few-shot 与指标见论文 Table 1。

Appendix **Table 4**（模型 zephyr-7b-sft-full；列 Arc / TruthfulQA / Winogrande / GSM8k / HellaSwag / MMLU / Average）：

| Model | Arc | TruthfulQA | Winogrande | GSM8k | HellaSwag | MMLU | Average |
|---|---:|---:|---:|---:|---:|---:|---:|
| zephyr-7b-sft-full | 60.41 | 43.73 | 74.19 | 26.76 | 82.85 | 60.92 | 58.14 |
| SPIN iteration 0 | 63.40 | 49.18 | 72.69 | 35.10 | 84.38 | 60.03 | 60.80（+2.66） |
| SPIN iteration 1 | 65.19 | 55.17 | 72.30 | 35.78 | 84.96 | 59.34 | 62.12（+1.32） |
| SPIN iteration 2 | 65.96 | 54.91 | 73.56 | 38.06 | 85.41 | 59.93 | 62.97（+0.85） |
| SPIN iteration 3 | 65.87 | 54.90 | 73.72 | 38.97 | 85.54 | 59.99 | 63.16（+0.19） |

读表：均分 **58.14 → 63.16**。GSM8k **26.76 → 38.97**，TruthfulQA **43.73 → 54.90**，摘要里写的「10%+」指这两列相对基座的量级。增益逐轮变小，符合「接近 $p_{\mathrm{data}}$ 后式 (7) 变平」。MMLU 略降（60.92 → 59.99），不是全面上涨。

对照 DPO：同一 SFT 出发的 zephyr-7b-beta 用 UltraFeedback Binarized 约 **62k** GPT-4 偏好。论文 Figure 3：SPIN iter 0（只用已有 50k SFT）均分已可与这份 DPO 相比；iter 1 在多数 Leaderboard 集上超过它。Table 3 另列 zephyr-7b-dpo-full 均分 **61.31**；SPIN iter 3 再接两 epoch DPO 得到 **64.05**，TruthfulQA 再涨约 5 分（54.90 → 60.07）。SPIN 可以插在 SFT 与 RL 微调之间，不是互斥。

**Table 6** 其它基准（zephyr-7b-sft-full → SPIN iter 2）：MT-Bench **5.94 → 6.78**（iter 0 已 6.46，iter 1 为 6.65）；BB-causal 56.15 → 59.36；OpenBookQA 45.4 → 47.6。从 iter 1 起 MT-Bench 超过 vicuna-13b-v1.5 的 6.57。Sports Understanding 从 96.0 略降到 94.4，作者写「无显著退化」，不是零退化。

消融：同一轮里把 epoch 拉长，到不了下一轮的分数（Figure 4）——**必须迭代换对手**，不是多刷几个 epoch。SFT 把 Ultrachat200k 再训到 epoch 3，均分提升不到 1%（Figure 5）。合成集 14k / 26k / 50k 时 SPIN 仍随规模涨。

开销（Table 2，8×A100 80G）：每轮生成约 1.45 h（50k 条），训练 iter 0 为 4.32 h，iter 1–3 因数据翻倍为 8.64 h。生成相对训练不是主项。

## 6. 局限：锚在「真实数据」上

论文自己把话说死：理论收敛当且仅当对齐 $p_{\mathrm{data}}$，因此**固定人类分布构成性能天花板**。真实数据有偏，自对弈只会更逼近该偏差。要超人，必须让靶动起来——那已经不是这篇的算法。

开放任务上，「人类 $y$ vs 自己 $y'$」的可分性变弱时，增益有限。迭代后期增量接近零，不是 bug。资源上每轮都要生成合成数据。Winogrande 在 iter 0–1 相对基座下降（74.19 → 72.30），再回升，说明「全面变好」不是逐格单调。

旧文写「AlpacaEval 上 Llama 系列 +6~8 分」：**本篇在论文 HTML / Table 4–6 未找到对应表**。领导榜数字以 Table 4 的 zephyr-7b-sft-full 为准，不以旧摘要的 Llama 口算为准。

## 7. 在谱系里的位置

- **属于 Model 层、训练时、自监督信号**（人类数据当锚，没有新偏好）。见 [术语辨析](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。
- 与 GPT-Red 那种「独立攻击者种群 vs 防御者种群」不是一回事。SPIN 是时间错开的同一条 LLM；红队自对弈见 [OpenAI GPT-Red](../../5-实验室与公司/05-OpenAI-GPT-Red/05-OpenAI-GPT-Red.md)。
- 与 TTT：SPIN 离线跨 prompt 分布；TTT 在线对当前输入。互补，不是递归。
- **不是 RSI**：改进器仍是「式 (7) + 固定 $p_{\mathrm{data}}$」。没有改评价标准，也没有让改进后的系统去改改进程序。

下一篇：[Self-Rewarding 家族](../02-Self-Rewarding-家族/02-Self-Rewarding-家族.md)。独立监督：[可靠性专文](../../6-评测与安全/02-可靠性与独立监督/02-可靠性与独立监督.md)。

## 本篇来源

1. Chen, Z., Deng, Y., Yuan, H., Ji, K., & Gu, Q. (2024). [Self-Play Fine-Tuning Converts Weak Language Models to Strong Language Models](https://arxiv.org/abs/2401.01335). arXiv:2401.01335. HTML: https://arxiv.org/html/2401.01335 。损失 (4.7)、Theorem 5.2 / 5.4、Table 4 / 6 以该稿为准。代码：https://github.com/uclaml/SPIN 。
2. Rafailov et al. (2023). Direct Preference Optimization. 用于对照式 (8)，不在本篇重推。
3. Yuan et al. (2024). Self-Rewarding Language Models. arXiv:2401.10020。SPIN 论文 §4.2 所列并发。
