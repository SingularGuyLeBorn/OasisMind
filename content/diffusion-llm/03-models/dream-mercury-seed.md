---
title: "Dream、Mercury、Gemini Diffusion、Seed"
category: null
tags:
  - Dream
  - Mercury
  - Gemini-Diffusion
  - Seed-Diffusion
published: true
as_of: 2026-08-31
excerpt: "开源 7B 的 Dream、商业吞吐的 Mercury、DeepMind 实验模型 Gemini Diffusion、字节的 Seed Diffusion Preview。速度数字的硬件和评测集不同，不能横着减。Dream 的表与 LLaDA 原论文不是同一套 shot。"
---
# Dream、Mercury、Gemini Diffusion、Seed

LLaDA 把「8B 能不能打」钉在学术表上。产品与实验室另外几条线要回答的是：开源 7B 怎么从 AR 初始化；代码补全能不能到四位数 tokens/s；前沿实验室愿不愿意公开一张扩散对照表。四条工作不要合成「2025 年扩散已经全面超过 AR」。

改编几何（移位、退火、WSD）见[从自回归改编](../03-points/ar-to-diffusion.md)。本篇只钉各家公开表和不能横比的吞吐。

## 1. Dream 7B：开源权重里的改编样板

港大 NLP 与华为诺亚，arXiv:2508.15487。离散吸收态。权重从 Qwen2.5 7B 初始化，保持移位，按上下文重标定每个掩码位的噪声。继续预训练作者写成 580B token，Table 1 写作 0.6T。发布 Base 与 Instruct，推理接口是 `diffusion_generate()`。1B 尺度上扫过初始化、移位、噪声重标定，再接到 7B。学习率太大冲掉从左到右的知识，太小扩散训不动。

Table 1 带 $*$ 表示 Dream、LLaDA 8B、Qwen2.5 7B、LLaMA3 8B 同一评测协议。摘关键列（括号内 shot）：

| 任务 | Dream 7B* | LLaDA 8B* | Qwen2.5 7B* | LLaMA3 8B* |
|---|---|---|---|---|
| 类型 | 扩散 | 扩散 | AR | AR |
| 训练 token | 0.6T | 2.3T | 18T | 15T |
| MMLU (5) | 69.5 | 65.9 | 71.9 | 63.5 |
| BBH (3) | 57.9 | 47.4 | 63.9 | 62.7 |
| GSM8K (8) | 77.2 | 70.9 | 78.9 | 55.3 |
| MATH (4) | 39.6 | 30.7 | 41.1 | 18.0 |
| HumanEval (0) | 57.9 | 32.9 | 56.7 | 35.4 |
| MBPP (4) | 56.2 | 39.0 | 63.6 | 49.2 |
| Countdown (8) | 16.0 | 13.2 | 6.2 | 3.7 |
| Sudoku (8) | 81.0 | 46.0 | 21.0 | 0.0 |
| Trip planning (2) | 17.8 | 16.4 | 3.6 | 8.7 |

通用任务上 Dream 贴近 Qwen2.5，MMLU 差 2.4 点，GSM8K 差 1.7 点，HumanEval 略高。规划任务上扩散两列都明显高于两列 AR：数独 81.0 对 21.0 不是边角。作者把原因放到「多约束要同时满足」——从左到右写到一半无法回头改已经提交的数字，掩码扩散可以整盘一起擦。这是机制假说，表只证明这三道题上差距存在。

LLaDA 原论文 Table 1 的 GSM8K 是 4-shot 的 70.3、HumanEval 是 35.4。Dream 这张 $*$ 表把 LLaDA 写成 8-shot 70.9 和 HumanEval 32.9。两套 harness 不要减出「LLaDA 退步了」。讨论 Dream 对 LLaDA 用本表；讨论 LLaDA 对 LLaMA3 用 Nie et al. 的 $*$ 表。

Table 2，SFT 之后。Dream 用 180 万对、3 epoch；LLaDA 450 万对；Qwen2.5 / LLaMA3 有 RL。

| 任务 | Dream 7B | LLaDA 8B | Qwen2.5 7B | LLaMA3 8B |
|---|---|---|---|---|
| 后训练 | SFT | SFT | SFT+RL | SFT+RL |
| 对齐数据 | 1.8M | 4.5M | 1M / 0.15M | — |
| MMLU | 67.0 | 65.5 | 76.6 | 68.4 |
| GSM8K | 81.0 | 78.6 | 91.6 | 78.3 |
| Math | 39.2 | 26.6 | 75.5 | 29.6 |
| HumanEval | 55.5 | 47.6 | 84.8 | 59.8 |
| MBPP | 58.8 | 34.2 | 79.2 | 57.6 |
| IFEval | 62.5 | 59.9 | 74.7 | 49.7 |

Dream Instruct 的 GSM8K 81.0 高于 LLaMA3 Instruct 的 78.3，仍低于有 RL 的 Qwen2.5。HumanEval 55.5 对 84.8，代码缺口大。LLaDA 1.5 的 VRPO 把 Instruct 的 HumanEval 从 49.4 拉到 52.4，仍到不了 84.8。后训练深度不同，不要把 Table 2 读成「扩散不会写代码」。

Countdown 上调扩散步数，作者给出质量和速度的折中：步数设在 5–20 时，可以同时比 Qwen2.5 7B 更快更好。这是规划题上的曲线，不是 HumanEval 的默认。步数旋钮见[采样](../02-mechanism/sampling.md)。

Dream 仍是全双向掩码扩散，不是 Mercury 那种系统级吞吐怪兽。评它用质量表，不要用 H100 tokens/s 去羞辱它。

按上下文改噪声这件事，值得用一句话钉死。全局一个 $t$ 时，句子里有的格子左右都是可读词，有的格子陷在一片掩码里。前者几乎是轻度填空，后者几乎是从边际乱猜。共用同一个时间权重，梯度会在两种难度之间折中，容易把已经有足够上下文的格子仍当难题来训，或者反过来。Dream 按周围可信上下文重标定每个掩码位的有效噪声，等于承认「时间」在序列上不是均匀的。这和图像里按空间位置改日程不是同一套公式，目的同类：别让一个标量 $t$ 代表所有格子的难度。

移位则是改编能否保住基座的开关。Qwen2.5 的每一层 $h_i$ 已经对准 $x_{i+1}$。若扩散损失改去让 $h_i$ 预测 $x_i$，等于把预测头的靶子挪一格，继续预训练要重新学位置几何。DiffuLLaMA 和 Dream 都选择保住移位。dKV-Cache 后来从解码侧证明：推理时若把移位搞反，Dream 的 GSM8K 可以掉到 32.68。那不是 Dream 原文的主表，但是同一几何的反面教材。

规划题上的优势不要外推成「扩散更会思考」。数独和 Countdown 的共同点是：若干约束必须同时成立，从左到右写到一半很难改已经提交的数字。全双向去噪可以整盘一起擦。写小说、写文档、写解释题，约束稀疏得多，这张表上的 81.0 对 21.0 不会自动出现。作者在 1B 尺度上先确认初始化与噪声重标定有用，再接到 7B；没有公开「去掉移位、其它全同」的 7B 完整对照表。机制判断可以写，因果结论要等那张表。

Instruct 只有 SFT，代码缺口对着有 RL 的 Qwen2.5。这和 LLaDA Instruct 落后 LLaMA3 Instruct 是同一类口径问题。Dream 的 180 万对比 LLaDA 的 450 万对更少，GSM8K 81.0 仍高于 LLaMA3 的 78.3，说明改编基座（Qwen2.5）本身数学就不弱。HumanEval 55.5 对 84.8 则说明：基座会写代码，不等于扩散 SFT 能把代码能力完整接过来。后训练深度不同，不要把 Table 2 读成结构失败。

## 2. Mercury Coder：把并行写进产品

Inception Labs，技术报告 arXiv:2506.17298。Transformer 骨干，扩散训练与生成，代码向。Mini 与 Small 两档。Artificial Analysis 在 NVIDIA H100 上测到 Mini 1109 tokens/s、Small 737 tokens/s，相对当时速度优化的前沿 AR 最高约 10 倍吞吐，质量落在同类快速代码模型区间。Copilot Arena 上作者称质量第二、速度第一。上下文官方写 32k，可扩到 128k。

报告几乎不公开参数量、训练 token、是否块扩散。能引用的是第三方吞吐和「粗到细并行改多 token」。不要把 10× 抄到 LLaDA 8B 头上。开源全双向模型和商业代码专用栈不在同一条速度曲线上。

## 3. Gemini Diffusion：实验室演示，有一张官方表

Google DeepMind 实验模型，页面写明是 demo，用来摸未来模型。机制一句话：不是逐 token 写，而是从噪声迭代改，生成中途能纠错，擅长编辑、数学和代码类改写。

官方对照 Gemini 2.0 Flash-Lite（AI Studio 默认采样，pass@1）：

| 基准 | Gemini Diffusion | Flash-Lite |
|---|---|---|
| LiveCodeBench v6 | 30.9% | 28.5% |
| BigCodeBench | 45.4% | 45.8% |
| HumanEval | 89.6% | 90.2% |
| MBPP | 76.0% | 75.8% |
| GPQA Diamond | 40.4% | 56.5% |
| AIME 2025 | 23.3% | 20.0% |
| Global MMLU Lite | 69.1% | 79.0% |

代码接近，知识与科学落后。速度：评测平均采样 1479 tokens/s（不含 overhead），overhead 0.84s。硬件未写。SWE-Bench Verified 是非 agent、单轮编辑、最长 32k。这些限定要跟着数字走。HumanEval 89.6 和 LLaDA 8B Instruct 的 49.4 不能放进同一句「扩散代码」：规模、数据、是否闭源、评测库都不同。

## 4. Seed Diffusion Preview：H20 上的 2146 token/s

ByteDance Seed，arXiv:2508.02193，代码模型。作者报 H20 上 2146 token/s，并自己写了不能和 Mercury / Gemini 横比：Mercury 用 H100 和私有集，Gemini 速度是混合任务平均、硬件未公布，系统提示约束格式也会抬速度。LiveCodeBench 用 v1–v6 共 1055 题以迁就未知基线协议。

训练上前 80% 步标准掩码腐蚀，后 20% 加基于 Levenshtein 距离的编辑腐蚀（插删改），逼模型不要迷信「未掩的字一定对」，从而能在采样里改已经写出的 token。他们故意不用 MDLM 那种 carry-over 抄输入。推理用块间因果、块内扩散，KV 缓存前缀块，块划分在推理时再定，不单独训死块长。系统栈是内部框架。

这是「掩码 + 允许改已写字 + 块解码 + 自研 runtime」的组合，不是新的 $Q_t$ 家族。编辑腐蚀不是回到均匀跳转：主过程仍是掩码，后 20% 只是增强。吸收态默认揭开就不回去；Seed 要的是揭开之后仍允许再脏，所以必须改前向的一部分，而不能只改采样器上的 remask。

## 5. 速度表怎么读

| 名称 | 数字 | 硬件 | 作者提醒 |
|---|---|---|---|
| Mercury Mini | 1109 tok/s | H100 | Artificial Analysis |
| Mercury Small | 737 tok/s | H100 | 同上 |
| Gemini Diffusion | 1479 tok/s | 未公布 | 不含 0.84s overhead |
| Seed Preview | 2146 token/s | H20 | 与上两行条件不同 |
| LLaDA 2.0-flash-CAP | 535 TPS | 文内设定 | dInfer vs SGLang AR |

分母、是否含 prefill、batch、是否约束输出格式，全部可能差一倍。本花园只并列，不排名。开源 Dream 没有把 H100 tokens/s 写成主卖点，缺这一格不是「Dream 慢」，是论文没测这条产品曲线。

## 6. 失效

把 Gemini 的 HumanEval 89.6 和 LLaDA 8B Instruct 的 49.4 放在同一句「扩散代码」里：规模、数据、是否闭源、评测库都不同。

把 Seed 的编辑腐蚀理解成「回到均匀 $Q_t$」：编辑是后 20% 的增强，主过程仍是掩码。

把四条都当成可以自托管的开源 7B：Dream 是；Mercury / Gemini / Seed Preview 不是同一类交付物。

读完四条线，手里应有一张交付物卡。Dream：开源 7B 权重，质量表可核对，吞吐不是卖点。Mercury：商业代码模型，H100 上四位数 tokens/s，参数量和训练 token 未公开。Gemini Diffusion：实验室 demo，有官方对照 Flash-Lite 的表，硬件未写，知识向基准落后。Seed Preview：代码向，H20 上 2146 token/s，作者禁止和前两者横比，训练后 20% 允许改已写字。四张卡不能合成「扩散 LLM 已经」后面跟任何一个全能谓语。

数独那一格特别容易被截图传播。81.0 对 21.0 是真的，协议写在 Table 1 的 8-shot 上，没有任务微调。它证明的是：这道题上双向去噪比从左到右更顺。它不证明写博客、写邮件、写 API 文档也会出现同样的倍数。约束同时成立的任务，扩散有结构借口；约束稀疏的任务，借口消失。把借口当定理，下一张表就会打脸——Dream Instruct 的 HumanEval 55.5 对 Qwen2.5 的 84.8，同一对模型，另一道题。

商业吞吐数字还有一层「系统提示约束格式」的水份。Seed 自己写了：约束输出格式会抬速度。评测若强制 JSON 或强制短代码块，tokens/s 变好看，因为有效生成更规律、提前结束更容易。读 1479 和 2146 时，问是不是混合任务平均、含不含 overhead、批大小是多少。答不出这三问，数字只能当数量级。数量级已经有用：扩散解码可以到四位数 tokens/s。精确排名没有用。

把 Dream Table 1 的 LLaDA HumanEval 32.9 抄进 LLaDA 专文当主数字：那是 Dream 的协议。Nie et al. Table 1 是 35.4。

把 Countdown 步数 5–20 的速度优势抄到写小说上：那条曲线是规划题、短画布。长文档、全双向注意力每步 $O(n^2)$，步数少省的是前向次数，省不掉每步的整段注意力。

初始化来自 Qwen2.5 这件事，读表时要始终放在分子里。Dream Base 的 MMLU 69.5 对 Qwen2.5 的 71.9，差距不大，不能证明「扩散目标比 AR 更会学知识」；更像是改编保住了大部分知识，扩散阶段没有把基座冲光。Sudoku 81.0 对 21.0 则不太能用「基座本来就会」解释：同一张表上 Qwen2.5 只有 21.0。结构差在规划题上被放大，在知识题上被缩小。这是读改编论文时应有的默认姿势：先问这格分数有多少来自基座，有多少来自改生成过程。问不清，就不要把整张表记在扩散名下。

Instruct 的 180 万对、3 epoch 是轻量后训练。Qwen2.5 Instruct 有 RL，代码 84.8。Dream 55.5 的缺口，优先解释成后训练深度，其次才解释成「扩散不会写代码」。LLaDA 1.5 用 VRPO 把 HumanEval 从 49.4 拉到 52.4，步子不大，说明偏好优化不是自动的代码特训。若有人用可验证奖励在 Dream 上做 diffu-GRPO，分数怎么走还没有公开主表。未找到一手来源之前，不要把「开源 7B 扩散代码已经打平 Qwen」写成事实。

`[OM-FREEPLAY]` 上一句限定来自：Dream 原文 Table 2 对照的是有 RL 的 AR Instruct，没有同数据、同后训练深度的配对实验。

## 参考文献

- [Ye et al., Dream 7B, 2025](https://arxiv.org/abs/2508.15487) — Table 1–2；0.6T；Sudoku 81.0。
- [Khanna et al., Mercury, 2025](https://arxiv.org/abs/2506.17298)
- [Gemini Diffusion 官方页](https://deepmind.google/models/gemini-diffusion/) — 表与 1479 tokens/s。
- [Song et al., Seed Diffusion, 2025](https://arxiv.org/abs/2508.02193) — 2146 token/s @ H20；不可比声明。

## 相关

- [从自回归改编](../03-points/ar-to-diffusion.md)
- [代表性年表](./representative-models.md)
- [采样与调度](../02-mechanism/sampling.md)
- [LLaDA 专文](./llada-frontier.md)
