---
title: "代表性扩散语言模型一览"
category: null
tags:
  - models
  - D3PM
  - Diffusion-LM
  - MDLM
  - SEDD
  - LLaDA
  - survey
published: true
as_of: 2026-08-31
excerpt: "从 D3PM 的 Q_t 到 LLaDA 2.0 的 100B 改编。连续路线停在可控生成；离散吸收态变成 7B–100B 的默认。SEDD 的 25%–75% 困惑度降幅对照的是先前离散扩散，不是 GPT-2。"
---
# 代表性扩散语言模型一览

读者已经知道掩码扩散的损失长什么样。本篇按时间把名字钉回各自解决的那一刀：谁定义了 $Q_t$，谁把 ELBO 收成加权 MLM，谁把分数做到 8B，谁把块当成旋钮。不是家谱展览。数字能指回论文表的才写；一句口号当贡献的不写。

![](./images/fig-dlm-timeline.png)

> 图 1：离散吸收态从 $Q_t$ 走到 8B 从头训，再走到块级 WSD 的 100B。Diffusion-LM 的连续嵌入是侧枝，不是 2025 年大模型的默认。

**图 1 解析**

- **D3PM 2021**：词表上的马尔可夫矩阵。后面所有离散工作都借这套语言。
- **MDLM 2024**：吸收态加 SUBS，连续时间 ELBO 变成加权 MLM。工程上开始像 BERT。
- **LLaDA 8B**：同一套损失接到 8B Transformer，2.3T 从头训。
- **BD3-LM**：块间 AR、块内扩散。可变长和真 KV 从这里回来。
- **LLaDA 2.0**：不再从头堆 100B，继承 AR MoE 权重，WSD 拧块大小。
- **上行虚线**：Diffusion-LM 在嵌入空间加高斯，为的是梯度引导。2025 年的 7B–100B 几乎不走这条训练主路。

## 时间线

| 时间 | 工作 | 路线 | 钉住的事 |
|---|---|---|---|
| 2021 | D3PM | 离散 | $Q_t$：均匀 / 吸收 / 近邻 |
| 2022 | Diffusion-LM | 连续 | 嵌入高斯 + 分类器引导 |
| 2024 | SEDD | 离散 | score entropy；ICML 2024 |
| 2024 | MDLM | 离散 | 吸收态 SUBS，NeurIPS 2024，arXiv:2406.07524 |
| 2024.06 | RADD / MD4 | 离散 | 吸收态 ≅ 任意顺序 AR；$1/t$ |
| 2024.07 | DFM | 离散流 | 路径 $p_t$；1.7B HumanEval 6.7% |
| 2024.10 | SDTT | 蒸馏 | 老师 1024 步蒸到 32–64 倍少步；延迟对照带 KV 的 GPT-2 |
| 2025.02 | LLaDA | 离散 | 8B 从头训，Table 1 对 LLaMA3 |
| 2025.03 | BD3-LM | 块 | 块间 AR、块内扩散，ICLR 2025 Oral |
| 2025.06 | Eso-LM | 因果 KV | 洗牌+因果；65× 对照无缓存 MDLM |
| 2025.06 | Mercury | 离散 | Mini 1109 tok/s @ H100 |
| 2025.06 | DiffuCoder | 离散 | 7B 代码；coupled-GRPO；EvalPlus 67.9 |
| 2025.08 | Dream 7B | 离散 | 从 Qwen2.5 改编的开源 7B |
| 2025.09 | LLaDA-MoE | 稀疏 | 从零约 20T；7B-A1.4B；损失仍是 $1/t$ |
| 2024.10 | DDPD | 规划器 | ICLR 2025；脏净头 + SEDD；GPT-2 尺度 |
| 2025.12 | LLaDA 2.0 | 块 | 16B / 100B MoE，AR→扩散 WSD |

旧稿把 MDLM 写成 ICML 2023 / arXiv:2306.08162，编号是错的。

## D3PM：离散扩散的数学语言

Austin 等人，NeurIPS 2021。把 DDPM 的高斯换成行随机矩阵 $Q_t$。均匀、吸收态、离散化高斯三条设计写在同一篇里。文本上吸收态最好用：被腐蚀是可观测事件，反向不会把一个合法词悄悄换成另一个合法词。当时生成质量远不如自回归，贡献是记号，不是分数。公式见[离散扩散](../02-mechanism/discrete-diffusion.md)。

## Diffusion-LM：连续侧枝

Li 等人，NeurIPS 2022，斯坦福。token 先映到嵌入，嵌入上加高斯，去噪后再 rounding 回词表。约 80M 参数。Table 2 的可控生成：Semantic 81.2 对 FUDGE 69.9、PPLM 9.9；Syntax Tree 86.0 对 17.9。这是梯度能写进轨迹的好处。不要把 80M 的句法树成功率抄到 LLaDA 8B 头上。连续路线后来还有 DiffuSeq、SSD-LM、CDCD，主战场逐步让给离散吸收态。引导公式见[可控生成](../03-points/controllable-generation.md)。

## SEDD：换训练目标，不换噪声哲学

Lou、Meng、Ermon，ICML 2024，arXiv:2310.16834。连续扩散靠 score matching；离散上直接搬 $\ell_2$ score 不稳定。他们提出 score entropy，对具体分数（concrete score，状态之间的比率）做匹配，并且这条损失仍是似然的界。吸收态和均匀两条 $Q$ 都做了；主结果用 Absorb。

摘要里的「降低困惑度 25%–75%」对照的是先前离散扩散范式，不是 GPT-2。Table 3 在 One Billion Words 上写成：相对其它离散扩散低 50%–75%（尤其 D3PM），并且与同设定 AR 的精确似然相差在 1 个困惑度以内（扩散报的是上界）。Table 3 的逐格数字，公开 HTML 抽取未得到可逐格核对的完整表，本篇不编格子；引用用摘要与 Table 1。

Table 1 零样本无条件困惑度（↓），Small 档：

| 模型 | LAMBADA | WikiText2 | PTB | WikiText103 | 1BW |
|---|---|---|---|---|---|
| GPT-2 | 45.04 | 42.43 | 138.43 | 41.60 | 75.20 |
| SEDD Absorb | ≤50.92 | ≤41.84 | ≤114.24 | ≤40.62 | ≤79.29 |
| D3PM | ≤93.47 | ≤77.28 | ≤200.82 | ≤75.16 | ≤138.92 |
| PLAID | ≤57.28 | ≤51.80 | ≤142.60 | ≤50.86 | ≤91.12 |

SEDD Absorb 在多数集上优于先前扩散，部分集优于他们重算的 GPT-2（无滑动窗口，数字会比 GPT-2 原文高）。text8 上 SEDD Absorb 的 BPC 上界 ≤1.39，D3PM Absorb ≤1.45，自回归 1.23。生成侧作者报：不必温度退火，生成困惑度相对未退火 GPT-2 约 6–8 倍更好；步数换质量，32× 更少的网络评估仍可接近。这是 GPT-2 尺度的故事。不要把它写成 8B 的换算表。

SEDD 不是另一种 `[MASK]`。它可以走吸收，也可以走均匀。2025 年的 7B 默认仍是吸收态加权交叉熵（MDLM / LLaDA / Dream），因为工程上就是 MLM。SEDD 证明离散扩散的目标函数还有空间；它没有成为 LLaDA 的损失函数。比率、势垒、Table 3 的 32.79，见[Score entropy](../03-points/score-entropy.md)。

## MDLM：加权 MLM 当生成模型

Sahoo 等人，NeurIPS 2024，arXiv:2406.07524。前向只进 `[MASK]`。SUBS 参数化：未掩位置抄输入，掩码位置才预测。连续时间 ELBO 在线性日程下变成掩码交叉熵乘一个时间权重。作者强调工程配方（优化器、混合精度、实现）对困惑度的贡献，往往比理论简化还大：他们重实现的 D3PM 掩码也没有早期文献说的那么差。top-p 揭开、半自回归采样是推理侧。公式见[掩码扩散](../02-mechanism/masked-diffusion.md)。

## LLaDA 与 2.0

8B 从头训，Table 1 $*$：MMLU 65.9 对 LLaMA3 的 65.4，GSM8K 70.3 对 48.7，HumanEval 35.4 对 34.8。Instruct 只有 SFT。同一家族后来分出两条不该焊在一起的河：LLaDA-MoE 仍从零训稀疏 MDM，约 20T，激活 1.4B，Instruct 平均分 53.12 贴近 Qwen2.5-3B-Instruct 的 53.51，见[LLaDA-MoE](./llada-moe.md)；2.0 从 Ling AR MoE 转换，mini 16B、flash 100B，平均分 64.34 / 73.18；flash-CAP 535 TPS，文内 AR 对照约 2.1 倍。规格卡见[LLaDA 专文](./llada-frontier.md)。

## BD3-LM、Dream、Mercury、Seed

BD3-LM（Arriola 等人，ICLR 2025 Oral）把块大小 $B$ 定义成 AR 与扩散之间的旋钮。$B=1$ 在概率上是 AR，用扩散目标去训仍差一截，因为损失方差。可变长、块间真 KV 从这里来。见[块扩散](../03-points/block-diffusion.md)。

Dream 7B 从 Qwen2.5 7B 改编，0.6T 继续预训练。同协议 Base：MMLU 69.5 对 Qwen2.5 的 71.9，Sudoku 81.0 对 21.0。Mercury Coder Mini 1109 tok/s @ H100（Artificial Analysis）。Gemini Diffusion 官方表 HumanEval 89.6 对 Flash-Lite 90.2，1479 tok/s 不含 0.84s overhead。Seed Preview 2146 token/s @ H20，作者自己写不能和前两者横比。见[Dream / Mercury / Seed](./dream-mercury-seed.md)。

## 怎么读这些名字

连续还是离散，问噪声定义在哪。吸收还是均匀，问被腐蚀的 token 是否仍是一个合法词。从头训还是改编，问知识从哪来。全双向还是块扩散，问 KV 和填空哪头优先。SEDD 还是 MDLM，问训练目标是 score entropy 还是加权交叉熵。

把这些名字理解成四条河，比理解成一张荣耀榜有用。第一条河是噪声定义：D3PM 给出矩阵语言，吸收态胜出，均匀和近邻在文本上基本被放弃。第二条河是训练目标：MDLM 把 ELBO 收成加权交叉熵，SEDD 把 score matching 收成 score entropy。2025 年能叫 LLM 的开放权重走第一条目标，因为交叉熵和现成工具链对接；SEDD 停在 GPT-2 尺度的似然竞赛，没有被证伪，也没有成为 LLaDA 的损失。第三条河是规模：LLaDA 8B 证明从头训能上同一张表，Dream 证明改编能上另一张表，2.0 证明 100B 不必从头堆。第四条河是生成过程怎么接到产品：块扩散把 KV 接回来，Mercury / Seed 把并行写进 runtime，Fast-dLLM 把近似缓存和并行揭开做成训练免费的插件。

连续路线为什么还留在年表里。不是为了怀旧。Diffusion-LM 证明：只要状态是连续的，图像那边的梯度引导可以原样搬来控制句法树和语义。80M 上 Syntax Tree 86.0 对 PPLM 的 17.9，这不是「小模型碰巧好用」，是连续轨迹上分类器梯度有明确方向。离散 8B 把这条路几乎关掉了，因为 token 上没有欧氏梯度。后面可控生成专文写的掩码、定长、D-CFG，都是在没有梯度时的替代。读年表时若跳过 2022，会以为扩散从一开始就是 BERT 加日程。不是。有人先把语言抬到嵌入里，为的就是那条梯度。

2024 年为什么突然像 BERT。吸收态让腐蚀可观测，SUBS 让未掩位置抄输入，连续时间权重变成 $1/t$。三件事叠在一起，训练循环看起来就是随机掩码率的 MLM。工程团队可以用现成的交叉熵、混合精度、数据加载。MDLM 自己强调：重实现的 D3PM 掩码也没有早期文献说的那么差，优化器比理论简化更值钱。这句话挡住了一种叙事：好像 2021 到 2024 之间有人发现了全新物理。更准确的说法是：吸收态这一列被工程化到可以 scale。

2025 年的分叉是从头训还是改编。从头训回答「扩散目标本身能不能养出 8B」。改编回答「已经养好的 AR 几何能不能改生成过程」。两条路的知识来源不同，失败模式也不同。从头训怕的是样例效率和 KV；改编怕的是把基座冲掉、移位对错、打包作弊。LLaDA 2.0 把块当课程，是承认 100B 付不起从头训，也承认全双向部署付不起每步重算。Dream 付了约 580B 继续预训练，买的是仍全双向的 7B。v2 付约 1B，买的是块扩散。数字差两个数量级，交付物不是同一个。

读完应能指着图 1 说出：哪一格换了 $Q_t$，哪一格换了损失，哪一格换了训练起点，哪一格换了注意力图案。指不出这四刀，名字再多也只是年表装饰。

给只记过 GPT 的人一条更慢的读法。2021 年你若打开 D3PM，会觉得这是生成模型理论论文，分数对不上 GPT-2。2022 年打开 Diffusion-LM，会觉得这是可控生成论文，模型很小。2024 年打开 MDLM 和 SEDD，会觉得离散扩散忽然能报困惑度了，但仍在 GPT-2 尺度。2025 年 2 月打开 LLaDA，第一次看见和 LLaMA3 8B 同一张下游表。之后的名字大多不再发明新的 $Q_t$，而是在改编、块、缓存、对齐上拧螺丝。把 2021 的「远不如 AR」和 2025 的「MMLU 65.9」焊成一句「扩散一直更差」或「扩散已经反超」，都忽略了中间换了尺度、换了损失工程、换了评测。年表的用处是阻止这种焊接。

SEDD 的 Table 1 还适合用来练习「上界」三个字。SEDD Absorb 在 WikiText2 上 ≤41.84，GPT-2 是精确的 42.43。看起来扩散更好，但左边带 ≤。若界是松的，真实困惑度可能更差；若界很紧，可以当作几乎打平。作者在 1BW 的 Table 3 上写与 AR 相差在 1 个困惑度以内，并强调扩散报上界、AR 报精确值。读任何扩散 PPL 表，先找 ≤ 号和脚注。找不到，就把该表当成不可与 AR 横减。本花园后文的 LLaDA 主表因此不报 PPL，报 MMLU 和 GSM8K。

MDLM 的历史定位容易写成「发明了掩码扩散」。更干净的句子是：吸收态在 D3PM 里已经有了，BERT 在 2018 年就已经用 `[MASK]` 做理解。MDLM 做的是把连续时间 ELBO 和 SUBS 参数化写到工程可 scale，并证明配方比早期文献暗示的更值钱。LLaDA 把同一条损失接到 8B。发明权不在「第一次看见掩码」，在「第一次把这条损失当成大模型生成目标并跑到下游表」。这种发明权叙事对读论文有用，对写产品文档没有用。产品只问检查点从哪来、采样器怎么拧。

名字还会继续涨。2026 年会有更多改编、更多缓存、更多 RL。新名字进来时，仍用这四刀归档：噪声、损失、起点、注意力图案。归档不了的，多半是系统论文，放到推理加速或对齐篇，不要硬塞进 $Q_t$ 家族。本篇是地图，专文才是地形。地图上的点如果开始互相抄数字，地形就被踩乱了。LLaDA 的 70.3 和 Dream 表上的 LLaDA 70.9，Mercury 的 1109 和 2.0 的 535，都是这种抄错的温床。地图只负责指出「去哪篇看哪张表」，不负责再发明第三张表。

D3PM 当年在 text8、LM1B 上的困惑度上界，不能拿来和 LLaDA 的 MMLU 减。尺度差三个数量级，评测从字符级似然换成了下游生成。年表把 2021 放在第一格，是为了钉住 $Q_t$ 这套语言，不是为了说「离散扩散一直很差」。同样，SEDD 的 GPT-2 尺度似然竞赛赢了，也不自动翻译成 8B 该换 score entropy。地图上相邻的两格，问的问题可以完全不同。读的人若按时间顺序把分数连成一条「进步曲线」，会把不可比的分子分母焊在一起。正确的读法是：每一格只回答它自己那一刀，分数去专文的表。

开源权重和商业演示在年表上相邻，只为时间对齐。Dream / LLaDA 可以下载检查点、复现表；Mercury / Gemini / Seed Preview 多数只能读报告和官方页。把商业 tok/s 写进开源 7B 的规格卡，是把两类文献焊成一类交付物。地图在这一格只写「存在性」：并行解码可以做成产品。参数量、训练 token、$Q_t$ 细节，去专文看「未公开」三个字，不要补。

若只读一篇代表作就停，读 LLaDA 8B 原文。它同时有从头训、同数据 ARM、采样消融、诗歌反向。其余名字是这条主线上的支路：MDLM 提供损失形状，BD3-LM 提供块，Dream 提供改编配方，2.0 提供 100B 转换，Mercury 提供产品吞吐。支路可以不按时间读，但不要跳过 LLaDA 直接从 Mercury 的 tokens/s 倒推机制。吞吐推不出 $1/t$，也推不出为什么 Instruct 的自回归采样会归零。

Mercury 几乎不公开参数量和是否块扩散，读它只能当系统存在性证明：并行改多 token 可以做成产品，H100 上测到四位数 tokens/s。不能从它倒推 LLaDA 8B 的速度，也不能倒推 $Q_t$。Gemini Diffusion 的官方表更像实验室海报：代码接近 Flash-Lite，知识向落后，1479 tok/s 不含 0.84s overhead。Seed 最老实，自己写了不可横比，并公开编辑腐蚀和块解码。三家商业/实验室线和开源 Dream / LLaDA 是两类文献。年表把它们放在同一张表上，只为了时间对齐，不为了分数对齐。

SEDD 停在 GPT-2 尺度，还有一个读法：它证明离散扩散可以报似然，并且 Absorb 优于 Uniform。7B 没有沿用 score entropy，因为交叉熵和 SFT 工具链更顺。这不是「SEDD 失败了」。目标函数竞赛和规模竞赛可以分开赢。年表把 SEDD 放在 2024，就是把它钉在目标函数那一刀，而不是钉在「被 LLaDA 淘汰」。

BD3-LM 在年表上的位置是「把旋钮写进模型定义」。LLaDA 附录里的块采样没有改检查点；2.0 的 WSD 改了。同一年里「块」这个词有两种身份，读错身份会把 78.6 抄到 100B 头上，或把 535 TPS 抄到 8B 纯扩散头上。地图在这里只做分流：解码器去采样篇，模型定义去块扩散篇，100B 数字去 LLaDA 专文。

连续侧枝上还有几个名字，年表故意写轻。DiffuSeq 把条件扩散接到序列到序列，SSD-LM 做半自回归的嵌入扩散，CDCD 把对比学习写进连续去噪。它们证明连续路线在 2022–2024 年仍有论文可发，没有证明这条路能养出 8B 开放权重。读到这些名字时，问的是「约束能不能写成嵌入空间里的梯度」，不是「和 LLaDA 谁的 MMLU 高」。没有同尺度、同数据的表，就不要排。本篇把它们收进 Diffusion-LM 那一格的注释里，避免地图上再多三个没有 7B 检查点的点。

2023 年前后还有一批「非自回归一次出全句」的工作，名字里偶尔带 diffusion。NAT、CMLM 那一派通常没有前向腐蚀过程，训练是带蒸馏的交叉熵。扩散的「一次出全句」只发生在某一次反向步的网络前向里，完整生成仍是多步。步数为 1 且从全掩码起步时，它才塌缩成一次性的条件 MLM。把 NAT 和 MDLM 焊成「都是非自回归」，会把 ELBO 和蒸馏损失混成一种东西。年表用「有没有 $Q_t$」这一刀把它们分开：没有转移矩阵的，不进这张表。

读一篇 2026 年的新名字，仍只用四刀归档。噪声定义在词表上还是嵌入上。训练目标是加权交叉熵、score entropy，还是别的界。起点是从噪声堆还是从 AR 权重改编。注意力图案是全双向、块内双向，还是推理时才切块。四刀都能回答，这篇论文可以挂到图 1 的某一格或某条虚线上。有一刀答不出，多半是系统论文：吞吐、缓存、serving、RL。那种工作挂到推理加速或对齐篇，不要硬塞进 $Q_t$ 家族，也不要因为标题带 diffusion 就在年表上新开一行。

数字抄错的温床可以预先点名。LLaDA 原论文 GSM8K 70.3（4-shot）对 Dream 表上的 LLaDA 70.9（8-shot）；HumanEval 35.4 对 32.9。Mercury Mini 1109 tok/s @ H100 对 2.0-flash-CAP 535 TPS。SEDD 摘要 25%–75% 的分母是先前离散扩散，不是 GPT-2。MDLM 的正确编号是 NeurIPS 2024 / 2406.07524。这五组一旦出现在综述里，先当过期或焊错，再去专文核对。地图的职责是指出「去哪篇看哪张表」，不是再发明第六张表把它们平均。

LLaDA 8B 原文同时有从头训、同数据 ARM、采样消融、诗歌反向，所以它是年表上唯一建议「只读一篇就停」的点。其余名字是支路：MDLM 提供损失形状，BD3-LM 提供块，Dream 提供改编配方，2.0 提供 100B 转换，Mercury 提供产品吞吐。支路可以不按时间读，但不要跳过 LLaDA 直接从 Mercury 的 tokens/s 倒推机制。吞吐推不出 $1/t$，也推不出为什么 Instruct 的自回归采样会归零。倒推的方向永远是：先机制，后系统。

图 1 的上行虚线是连续嵌入，不是失败的主路。Diffusion-LM 证明梯度能写进轨迹，80M 上句法树远高于 PPLM。2025 年的 7B 不走这条训练主路，是因为词表上没有欧氏梯度、rounding 要付税。读综述若把 2022 和 2025 焊成「扩散一直在进化」，会漏掉路线分叉：连续回答可控，离散回答规模。两条河现在都还在，只是检查点几乎全在离散这边。

## 参考文献

- [D3PM (NeurIPS 2021)](https://arxiv.org/abs/2107.03006)
- [Diffusion-LM (NeurIPS 2022)](https://arxiv.org/abs/2205.14217) — Table 2
- [SEDD (ICML 2024)](https://arxiv.org/abs/2310.16834) — Table 1；摘要 25%–75%
- [MDLM (NeurIPS 2024)](https://arxiv.org/abs/2406.07524)
- [LLaDA (2025)](https://arxiv.org/abs/2502.09992)
- [LLaDA 2.0 (2025)](https://arxiv.org/abs/2512.15745)
- [BD3-LM (2025)](https://arxiv.org/abs/2503.09573)
- [Dream 7B (2025)](https://arxiv.org/abs/2508.15487)
- [Mercury (2025)](https://arxiv.org/abs/2506.17298)
- [Gat et al., Discrete Flow Matching (2024)](https://arxiv.org/abs/2407.15595)
- [Gong et al., DiffuCoder (2025)](https://arxiv.org/abs/2506.20639)
- [Zhu et al., LLaDA-MoE (2025)](https://arxiv.org/abs/2509.24389)
- [Sahoo et al., Eso-LMs (2025)](https://arxiv.org/abs/2506.01928)
- [Deschenaux & Gulcehre, SDTT (2025)](https://arxiv.org/abs/2410.21035)
- [Liu et al., DDPD (ICLR 2025)](https://arxiv.org/abs/2410.06264)

## 相关

- [为什么用扩散做语言生成](../01-overview/why-diffusion.md)
- [掩码扩散](../02-mechanism/masked-diffusion.md)
- [LLaDA 专文](./llada-frontier.md)
- [LLaDA-MoE](./llada-moe.md)
- [扩散 vs 自回归](../04-comparison/diffusion-vs-autoregressive.md)
- [多模态扩散](./multimodal-dllm.md)
- [任意顺序](../03-points/any-order.md)
- [Eso-LM](../03-points/eso-lm.md)
- [少步蒸馏](../03-points/few-step-distill.md)
- [谁决定揭开哪一格](../03-points/plan-denoise.md)
- [Score entropy](../03-points/score-entropy.md)
- [离散流匹配](../03-points/discrete-flow.md)
- [代码向扩散](../03-points/code-dllm.md)
