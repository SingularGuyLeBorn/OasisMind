---
title: "量化 dLLM：掩码态和去噪步都要管"
category: null
tags:
  - quantization
  - PTQ
  - STaR-Quant
  - W4A4
  - LLaDA
published: true
as_of: 2026-08-31
excerpt: "AR 的 PTQ 假定一步一个因果 token。扩散同一步里掩码格和明文格激活分布不同，量化误差还会沿去噪步累积。STaR-Quant 用 SGAT 把两态分到不同激活变换、权重仍一份，再用 TAC 在注意力输出投影前做块对角仿射校正。LLaDA-8B W4A4 九项均分 57.07，对照同协议 FP 58.99，掉 1.92。摘要 1.69× 是 Dream 的吞吐 23.27 到 39.33，3.14× 是 Dream 显存 13.95GB 到 4.44GB。另有一个 1.69 是 Dream 相对 DLLMQuant++ 的均分分差，不是倍数。硬件 A40。不要和 DualCache、NPU 视频量化焊。"
---
# 量化 dLLM：掩码态和去噪步都要管

加速专文让每一步更便宜或更少步。Serving 专文换调度器。两边默认权重仍是 FP16。Yan、Wang、Wan、Yu、Tsang 的 STaR-Quant（arXiv:2606.04945）问的是下一档：权重量化到 4 bit、激活也量化到 4 bit 之后，掩码去噪还能否用。直接把 RTN、AWQ、QuaRot 抄过来，九项均分会从 LLaDA 的 58.99 掉到 44 至 51。他们认了两件扩散特有的事：同一步里 `[MASK]` 和明文的激活不是同一张分布；这一步的量化误差会变成下一步的输入，沿轨迹叠起来。

摘要「最多 1.69× 加速、3.14× 省显存」对照的是 **FP16 部署**，表是 Table 4 的 Dream 行：吞吐 23.27 到 39.33 tok/s，峰值显存 13.95GB 到 4.44GB。正文里还有另一个 1.69：Dream 上 STaR-Quant 均分相对 DLLMQuant++ 高 1.69 **分**。一个是倍数，一个是百分点。写错对照物，1.69 会变成一句空话。主表硬件是 NVIDIA A40，校准 128 段 WinoGrande，无需微调。测的是 LLaDA-8B、LLaDA-1.5-8B、Dream 7B。NPU 上的 DART、视频扩散的 KV 量化，不是这张表。

DLLMQuant（Xu 与 Yang，arXiv:2508.14090）是作者当强基线用的扩散专用 PTQ；DLLMQuant+ 接 AWQ，DLLMQuant++ 接 QuaRot。Lin 等人「Quantization meets dLLMs」（arXiv:2508.14896）提供的判断是：AR 向 PTQ 直接搬到 dLLM，权重量化加激活量化时掉得更狠。STaR-Quant 站在这两篇后面，主结果是 Table 1 的 W4A4。

## 1. 同一步两种激活，下一步还要接着用

AR 的 PTQ 默认：当前要算的是最新位置，激活分布沿序列缓慢漂，校准集上估一次 scale 就能用。掩码扩散一步里同时存在两种 token。掩码格要被预测，表示里带着「还不知道」；明文格已经落盘，表示更像普通上下文。作者 Figure 1 把两态的激活直方图分开画，峰值和离群点都不重合。用同一套激活变换去抹平两边，结果是一边仍尖、一边被过度缩放。这是 **state-dependent activation disparity**。

第二件事是时间。去噪输出会变成下一步的输入。Softmax 乘 $V$ 被先前分析认作低比特下最脆的矩阵乘（Xu 与 Yang 2025）。这一步的注意力表示偏了，下一步的 Query 看见的就是偏的邻居，误差不是逐步独立的噪声，是轨迹上的积分。这是 **temporal error accumulation**。QuaRot 那种旋转可以把单步离群点打散，不自动修「第 $t$ 步的偏到第 $t+k$ 步还在」。

于是目标不是再做一个更强的通用 4 bit 量化器，是让量化器看见掩码态，并在注意力输出投影前把量化后的表示扳回 FP 轨迹附近。训练免费：校准段上估变换和仿射，推理时折叠进量化权重。

一步在实现里长什么样。输入序列带着当前掩码图案。线性层先按态切成两行块 $X^m_t$、$X^u_t$，各自乘门控后的 $P$，量化，再乘同一份 $W_f$，按原下标写回。注意力仍按整段（或当前块）算 $Q,K,V$，Softmax–$V$ 之后的 $\hat Z$ 进 TAC，再进量化的输出投影。下一步掩码图案变了，同一位置可能从 $m$ 变成 $u$，SGAT 会换门，权重 $W_f$ 不变。这就是「态在 token 上变、权重在层上静」。AR 的 PTQ 没有这道切分：因果解码里当前步通常只有一个新位置，没有一大片 `[MASK]` 和一大片明文共享一次前向。

评测九项跟 LLaDA 论文的任务清单走：TruthfulQA-MC2、ARC-Challenge、HellaSwag、WinoGrande、PIQA、MMLU、C-EVAL、HumanEval、GSM8K。均分是这九个数的算术平均。作者写「跟随 LLaDA 评测设定」，**Table 1 的 FP 列不是 Nie Table 1**。本表 LLaDA FP：MMLU 65.85、GSM8K 67.48、HumanEval 32.92，均分 58.99。Nie 的 8B Base 是 MMLU 65.9、GSM8K 70.3、HumanEval 35.4。协议一换，GSM8K 就能差两点以上。量化掉分只能相对**同一张表的 FP 列**谈。

![](./images/fig-starquant-state-time.png)

> 图 1：左列是 AR 向 PTQ 看不见的两态激活和跨步误差。右列 SGAT 分空间、权重仍一份，TAC 在 $o_{\mathrm{proj}}$ 前按 $g=16$ 做块对角校正。底栏把 1.69× 钉在 Dream 吞吐，把 1.69 分钉在均分差之外。

**图 1 解析**

- **L1**：掩码 / 明文激活不是同一张图。
- **L2**：量化误差沿去噪步走，不是单步 MSE。
- **L3**：RTN / AWQ / QuaRot 的均分在 Table 1 里已经写过掉到哪。
- **R0–R1**：共享子空间加两态专属子空间，权重侧一份静态变换。
- **R3**：$g=16$ 是 Table 3 的最好档，不是注意力头数。
- **F0**：LLaDA 均分 57.07 对 58.99。Dream 吞吐 1.69×、显存 3.14×。GSM8K 67.48 到 57.29 必须单独写。

## 2. SGAT：两态不同变换，权重仍一份

线性层 $Y=XW^\top$。变换量化把计算改写成 $Y=(XP)(P^{-1}W^\top)$，激活在更平滑的空间里量化，逆变换折进权重。AR 里 $P$ 对所有 token 共用。扩散里同一份 $W$ 要同时乘掩码激活和明文激活，若给两态各备一份 $P^{-1}W$，推理要存两份量化权重，4 bit 省下的显存会吐回去。

SGAT 把隐层维拆成共享加两态专属：

$$
d=d_{\mathrm{sh}}+d_m+d_u,\qquad P=[U_{\mathrm{sh}},\,U_m,\,U_u].
\tag{1}
$$

掩码态门 $G_m=\mathrm{diag}(1_{d_{\mathrm{sh}}},1_{d_m},0_{d_u})$，明文态门 $G_u=\mathrm{diag}(1_{d_{\mathrm{sh}}},0_{d_m},1_{d_u})$。掩码 token 走 $P G_m$，明文走 $P G_u$。共享方向两边都看见，专属方向互不干扰。权重侧只保留与完整 $P$ 对应的一份变换 $\tilde P$，正交时 $\tilde P=P^\top$。量化权重

$$
W_f=Q_w(\tilde P W^\top)
\tag{2}
$$

只算一次。两态激活分别 $Q_a(\Phi_s(X^s_t))$ 再乘同一份 $W_f$，再按原位置拼回。FreeAct（Liu 等人 2026）提供「激活变换可以按状态条件化、权重仍静态」的先例；SGAT 把状态定义成掩码 / 明文，而不是 AR 里的层或通道组。

目标是层输出相对 FP 的 Frobenius 误差，对去噪步 $t$ 取期望，掩码、明文两块加起来。校准结束，$\tilde P$ 折进 $W_f$，推理只做按态切分、激活变换、量化矩阵乘、写回。没有第二份 8B 权重。

激活按 token 量化、权重按通道量化，和常见 LLM PTQ 相同。比特主设定 W4A4。W8A8 放 Table 5，掉分小到均分只动小数点后一位量级，不能拿来证明 4 bit 已经无损。

双向注意力让「按 token 量化激活」比因果更刺。因果解码新位置的激活尺度主要由前缀统计决定；掩码扩散一步里，掩码格的激活幅度可以和明文差一截，同一层的 per-token scale 若在校准阶段被两态平均掉，推理时某一态就会经常打到量化格子的两端。SGAT 先把两态送进不同子空间，等于让后续的 per-token scale 各自看见更干净的动态范围。这不是换一套量化器公式，是换输入进量化器之前的坐标系。权重仍 per-channel，因为 $W$ 不随掩码图案变。谁随图案变谁走激活侧，谁静态谁走权重侧，这条分工抄 AR 也成立，只是 AR 很少需要在同一次矩阵乘里服务两种分布。

## 3. TAC：校正注意力表示，不改注意力公式

SGAT 管线性层。注意力里 Softmax$(QK^\top/\sqrt{d_h})V$ 仍脆。TAC 不改这条公式，只在量化后的 $Z$ 进入输出投影之前，做一块块对角仿射：

$$
Z^{\mathrm{tac}}_{t,b}=\hat Z_{t,b}M_b^\top+\mathbf{1}d_b^\top,\qquad b=1,\ldots,B.
\tag{3}
$$

隐层维切成块大小 $g$ 的 $B$ 段。整张稠密仿射从有限校准激活里估不稳定；纯逐通道又管不住 Softmax–$V$ 混出来的通道相关。块对角是折中。$M_b$、$d_b$ 用 FP 的 $Z^{\mathrm{FP}}$ 与量化 $\hat Z$ 的块内一二阶统计闭式求解，阻尼项 $\lambda I$ 稳住协方差的逆平方根，奇异值再往单位阵收缩，避免校准噪声被放大。插入点只有注意力输出投影前。Figure 3 画逐步 hidden-state 相对 FP16 的 MSE：带 TAC 的曲线低于不带 TAC；QuaRot* 把 Softmax–$V$ 留在未量化当对照，不是部署设定。它说明脆点确实在那次矩阵乘：把那一处抬回高精度，跨步 MSE 会掉，但 Table 4 的 4 bit 吞吐就不再成立。TAC 的意图是留下 4 bit 乘，用廉价仿射去买回一部分轨迹对齐。买回多少，看 Figure 3 的曲线，主文没有把 MSE 读成一张数表，本篇也不从曲线上读数。

Table 3 扫 $g\in\{4,8,16,32,64\}$，均分 52.48 / 54.66 / **57.07** / 56.39 / 56.03。默认 $g=16$。再大，校准 128 段上协方差估不稳，均分回落。不要把 16 理解成块扩散的块长，也不要理解成头数。

## 4. Table 1：均分掉 1.92，GSM8K 掉的不是这一点

W4A4。列顺序：TruthfulQA、ARC-C、HellaSwag、WinoGrande、PIQA、MMLU、C-EVAL、HumanEval、GSM8K、均分。

**LLaDA-8B**

| 方法 | Hum. | GSM8K | 均分 |
|---|---|---|---|
| FP | 32.92 | 67.48 | 58.99 |
| RTN | 14.02 | 16.56 | 44.23 |
| AWQ | 20.10 | 36.88 | 48.09 |
| DLLMQuant+ | 22.13 | 40.66 | 49.26 |
| QuaRot | 25.33 | 44.57 | 51.03 |
| DLLMQuant++ | 28.92 | 56.25 | 54.29 |
| STaR-Quant | 35.98 | 57.29 | 57.07 |

STaR 相对 DLLMQuant++ 均分高 2.78。相对 FP 掉 1.92。HumanEval 35.98 高于 FP 32.92，量化评测有噪声，不能写成「4 bit 提升代码」。GSM8K 67.48 到 57.29，掉约 10 点，均分看起来只掉 1.92，是因为知识类任务掉得少、TruthfulQA 甚至 47.49 到 49.12。报「均分接近 FP」时必须把 GSM8K 单独写出来。MMLU 65.85 到 62.95，C-EVAL 69.54 到 64.56，知识也不是零成本。C-EVAL 掉将近 5 点，中文知识比英文 MMLU 更怕 4 bit。

完整九列里 STaR 为 49.12、44.23、52.75、72.92、73.85、62.95、64.56、35.98、57.29。ARC-C 44.23 对 FP 44.03，几乎走平。WinoGrande 74.90 到 72.92。HellaSwag 54.06 到 52.75。不要只摘涨的列。

GSM8K 掉 10 点，比知识选择题狠，符合「误差沿轨迹积分」。一道题要写几十上百 token 的推理，每一步的掩码格都在吃上一份量化过的上下文。HumanEval 反而高于 FP，更像评测方差：32.92 本身就低，16 点的摆动在 164 题上不算奇迹。部署若在乎数学，W4A4 的卖点不在均分 57.07，在显存 5.20GB；分要看 57.29 那一格。部署若在乎 MMLU 类，65.85 到 62.95 可能可接受。两句话不要合成「4 bit 几乎无损」。

**LLaDA-1.5-8B**

FP 均分 69.86（ARC 列 88.50、GSM8K 83.30、HumanEval 49.40）。STaR 均分 66.93，相对 DLLMQuant++ 的 64.31 高 2.62。GSM8K 83.30 到 76.45，HumanEval 49.40 到 46.53。1.5 是 VRPO 对齐过的检查点，FP 绝对值高于 Base 正常。ARC 列 88.50 对 Base 的 44.03 跳了一倍，不像同一套 ARC-Challenge 的常规涨幅。未与 Zhu 等人原文 ARC 协议逐格核对。[OM-FREEPLAY] 本篇只在作者这张 Table 1 内部比量化掉分，不拿 88.50 对外宣传 1.5 的常识推理。量化故事仍然成立：同一张表上 STaR 均分高于 DLLMQuant++，GSM8K 仍明显低于 FP。

**Dream-7B**

FP 均分 66.94（MMLU 69.50、HumanEval 57.90、GSM8K 77.20）。STaR 均分 63.59，相对 DLLMQuant++ 的 61.90 高 **1.69 分**。HumanEval 57.90 到 47.43，GSM8K 77.20 到 69.57。Dream 的 FP HumanEval 57.90 接近 Ye 等人 Table 1 的 57.9，比 LLaDA 这张表的 32.92 更像原论文主表；仍不要把量化后的 47.43 写进 Dream 发布会。MMLU STaR 69.37 对 FP 69.50，几乎保住；C-EVAL 64.89 到 58.79，掉得比 MMLU 明显。

STaR 九列是 48.72、59.76、71.32、72.98、74.34、69.37、58.79、47.43、69.57。TruthfulQA 49.76 到 48.72，ARC 59.80 到 59.76，HellaSwag 73.30 到 71.32，PIQA 75.66 到 74.34。知识选择题大多在 1–2 点内，代码和数学把均分从 66.94 拉到 63.59。Dream 改编自 AR，移位还在；量化误差叠在移位后的双向表示上，作者没有单独报 Un-Shift 消融。APD 专文写过 dKV-Cache 把移位搞反会把 GSM8K 打到 32.68。本篇量化表默认作者按 Dream 官方推理设定跑，未另验移位。

RTN 在三模型上均分分别 44.23 / 53.12 / 49.53，说明「四舍五入到 4 bit」在 dLLM 上不是能用的部署。AWQ 好一些，仍比 STaR 低约 9 / 8 / 9 个均分点。QuaRot 已经旋转离群点，LLaDA 均分 51.03，接上 DLLMQuant 才到 54.29，STaR 再接到 57.07。阶梯说明：扩散专用校正有用，态和时间两刀都有用。SmoothQuant 把激活的难处乘到权重上，仍是一套对所有 token 共用的通道缩放。SGAT 承认共用缩放抹不平两态，才把空间劈开。没有把 SmoothQuant 单独开列，基线里最近的亲戚是 AWQ 的激活感知和 QuaRot 的旋转。

## 5. 消融：TAC 和 SGAT 都不是装饰

Table 2，LLaDA-8B W4A4，九项均分：

| 方法 | 均分 | 相对 FP 掉分 |
|---|---|---|
| FP | 58.99 | 0.00 |
| 去掉 TAC | 55.43 | 3.56 |
| 去掉 SGAT | 56.39 | 2.60 |
| 完整 STaR-Quant | 57.07 | 1.92 |

去掉 TAC 伤更大。跨步误差在这条协议上比两态激活更贵。两者互补：只做 SGAT 均分 55.43，只做 TAC 56.39，合在一起 57.07。没有「只开一个就够」的行。校准仍是同一份 128 段 WinoGrande；WinoGrande 自己也在九项里，校准任务和评测任务有重叠，这是 PTQ 常见做法，不是额外的训练数据。作者没有报换校准域的消融。换 GSM8K 校准会不会把 57.29 拉回来，未找到一手来源，不编。

128 段算少。AR 的 GPTQ 常用 128–256 条校准。TAC 还要从这些激活里估块内协方差，所以 $g$ 不能无限小：Table 3 里 $g=4$ 均分 52.48，已经接近 QuaRot 档。校准太瘦、块太碎，闭式解会把噪声当成需要扳的方向。作者用奇异值收缩往单位阵靠，就是在防这件事。WinoGrande 句子短、是常识填空，和去噪长画布上的激活未必同分布。校准域偏移是 PTQ 通病，这篇没有额外免疫。

## 6. Table 4：1.69× 是 Dream 吞吐，3.14× 是 Dream 显存

内核实现跟 QuaRot 文的 W4A4 测量协议走（Ashkboos 等人 2024）。对照 FP16。

| 模型 | FP tok/s | Quant tok/s | 加速 | FP GB | Quant GB | 省显存 |
|---|---|---|---|---|---|---|
| LLaDA | 34.59 | 57.07 | 1.65× | 15.89 | 5.20 | 3.05× |
| LLaDA-1.5 | 35.55 | 58.30 | 1.64× | 15.88 | 5.20 | 3.05× |
| Dream | 23.27 | 39.33 | **1.69×** | 13.95 | 4.44 | **3.14×** |

平均加速约 1.66×。摘要取 Dream 行当「最多」。LLaDA 量化后的 57.07 tok/s 和 Table 1 均分 57.07 是碰巧同一个数，一个是吞吐，一个是准确率，不要焊。显存是峰值 GPU 占用，权重 4 bit 是大头，激活 4 bit 和 TAC 的块对角矩阵也在里面。3.14× 不是 DualCache 省下的 KV 页，也不是 dInfer 相对 Fast-dLLM 的 10× TPS。

Serving 专文 680.71 TPS 是 8×H800、LLaDA-MoE、batch 1、长度 1024。本表是 A40、密模型、另一套内核。两张卡减不出「量化再叠 dInfer 等于多少」。Fast-dLLM 27.6× 对照原版逐步揭开；本表 1.69× 对照同模型 FP16。量化不减少去噪步数，它减少每步矩阵乘的位宽。步数仍由采样器决定。把 1.69× 和 27.6× 乘起来当联合加速，没有一手联合表。

显存账也要拆。DualCache 省的是「不重算的那些层的激活 / KV」，峰值仍可能被未命中刷新和双向块顶住；STaR-Quant 把权重从 FP16 收到 4 bit，8B 密模型从约 16GB 量级落到约 5GB，这是参数本体。Eso-LM 说因果前缀上 GQA 和量化 KV 可以按 AR 手册抄，那是注意力图案已经变成可精确缓存之后的话。LLaDA / Dream 默认全双向，KV 量化不是这篇 Table 4。把 3.14× 写成「KV 压缩了三倍」，读错行。

W8A8（Table 5）LLaDA 均分 58.99 到 58.25，LLaDA-1.5 69.86 到 68.94，Dream 66.94 到 65.35。若干列略高于 FP，同样视为评测抖动。8 bit 几乎保住分，部署若显存允许，不必为了 1.65× 去扛 GSM8K 掉 10 点的 4 bit。4 bit 的卖点是 15.89GB 到 5.20GB：A40 上多挤几条并发，或把 8B 塞进更小的卡。作者未报 batch>1 的量化吞吐。单请求延迟若已被步数主导，1.65× 的矩阵乘加速会稀释成更小的端到端倍数。这和 DCD 的「NFE 掉 32 倍、墙钟不一定掉」是同一类警告，只是这里掉的不是步数，是位宽。

## 7. 和缓存、少步、NPU 不是同一笔账

DualCache / PrefixCache 复用过期 $K,V$，省的是「这一步还要不要重算注意力」。量化省的是「算的时候每个数几 bit」。可以叠，原文没叠。Eso-LM 65× 对照无缓存 MDLM，长度 8192；那是注意力图案改成可缓存之后的墙钟，与 W4A4 无关。SlowFast 15.63× 在 GPQA、长度 1024、8-shot，对照 vanilla LLaDA 的 1.60 TPS，叠 dLLM-Cache 才到 34.22× 并掉 3.13 分。量化 Table 4 的分母是 FP16 的 34.59 / 23.27 tok/s，任务不是 GPQA。四套倍数四个分母。

少步蒸馏、dParallel、DCD 改的是要跑多少步、一步的联合像不像话。量化不改采样分布的函数形式，改的是浮点实现。W4A4 在 GSM8K 上掉 10 点，说明低比特会伤多步推理；这和「少步因子分解伤联合」是两件事。不要把 57.29 写成「量化版 LLaDA 的 GSM8K SOTA」。

DCD 的 copula 外挂一个 GPT-2，每步更贵、步数可以少。量化让每步更便宜、步数不变。一加一减可以对冲，没有联合实验，「4 bit DCD」没有出处。APD 的 0.5B 验证器若也量化，误差会进联合截断，更没有一手表。邻居的对照物分开写，1.69× 就不会被填进 APD 的 tok/s 列。

NPU 侧有把扩散调度和量化写在一起的工作，视频扩散还有 KV 量化。那些论文的张量是时空块或潜在帧，不是 LLaDA 的词表掩码态。本篇主表三模型、九项、A40。材料不够把 NPU 行写进 Table 1，就不写。DLLMQuant 的逐表数字以 Xu 与 Yang 原文为准；本篇只引用 STaR-Quant 转载的 ++ 行，避免隔一层再抄错。

限制作者自己写了：主攻 W4A4 掩码去噪 dLLM；3 bit / 2 bit 仍难；TAC 与 SGAT 的实际加速还等融合核；状态现在只有预定义的掩码 / 明文，置信度态、多模态扩散是后话。没有融合核时，1.69× 已经含「校正本身也要算」之后的净吞吐。再向 2 bit 推，这篇的闭式 TAC 不一定够。

置信度态值得单独说一句。推理时低置信 remask 会把刚写出的格退回掩码，同一位置在相邻两步之间可以 $u\to m$。SGAT 按当前图案切分，法律上覆盖了这种跳变。TAC 的 $M_b$ 却是校准期估死的，不随置信度改。若 Fast-dLLM 那种阈值并行让每步提交集合剧烈抖动，注意力表示的漂移可能超出块对角仿射的能力。作者评测没有报「叠 DualCache / 叠阈值」的量化表。加速专文的 27.6× 和本篇 1.69× 现在只能分列，不能乘。

## 8. 读完应留下的判断

开源 8B 扩散要上 4 bit，不能只抄 AWQ。同一步里掩码和明文不是同一张激活，误差还会沿去噪步积分。STaR-Quant 用 SGAT 分空间、TAC 扳注意力表示。LLaDA 九项均分 57.07 对 FP 58.99；Dream 吞吐 1.69×、显存 3.14×。另一个 1.69 是 Dream 均分相对 DLLMQuant++ 的分差。GSM8K 在 LLaDA 上从 67.48 到 57.29，均分好看不等于推理任务好看。硬件 A40，校准 128 段 WinoGrande，无微调。不要和 DualCache 的 27.6×、dInfer 的 680、NPU 视频量化写进同一句。图 1 底栏把倍数和分差拆开，正文就按拆开的写。

## 参考文献

- [Yan et al., STaR-Quant, 2026](https://arxiv.org/abs/2606.04945)：Table 1–5；SGAT；TAC；$g=16$；A40。
- [Xu & Yang, DLLMQuant, 2025](https://arxiv.org/abs/2508.14090)：扩散专用 PTQ 基线。
- [Lin et al., Quantization meets dLLMs, 2026](https://arxiv.org/abs/2508.14896)：AR 向 PTQ 搬到 dLLM 会掉。
- [Ashkboos et al., QuaRot, 2024](https://arxiv.org/abs/2404.00456)：旋转；Table 4 的 W4A4 内核协议。
- [Xiao et al., SmoothQuant, 2023](https://proceedings.mlr.press/v202/xiao23c.html)：通道缩放；和 SGAT 共用缩放不是同一刀。
- [Nie et al., LLaDA, 2025](https://arxiv.org/abs/2502.09992)：任务清单来源；主表数字不要和本篇 FP 列横减。
- [Ye et al., Dream 7B, 2025](https://arxiv.org/abs/2508.15487)：Dream 基座。

## 相关

- [推理加速](./inference-acceleration.md)
- [Serving](./serving.md)
- [Eso-LM](./eso-lm.md)
- [SlowFast](./slowfast.md)
- [LLaDA 前沿](../03-models/llada-frontier.md)
- [Dream、Mercury、Seed](../03-models/dream-mercury-seed.md)
- [失效模式](./failure-modes.md)
- [离散 copula](./discrete-copula.md)
- [APD](./apd.md)
