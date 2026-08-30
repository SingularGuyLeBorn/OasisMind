---
title: "CRoCoDiL：连续草稿，掩码解码"
category: null
tags:
  - CRoCoDiL
  - hybrid-diffusion
  - LLaDA
  - unconditional
  - NFE
published: true
as_of: 2026-08-31
excerpt: "Uziel 等人（arXiv:2603.20210）把长程结构交给连续句级潜变量，LLaDA 只当解码器。骨干是在 StarCoder Python 上微调过的 LLaDA-8B，编码器从 Qwen-embedding-0.6B 初始化。无条件代码生成、整段一块：长度 512，基础 NFE=512（MAUVE 0.62，Gen-PPL 19.4）对 ConWithinDisc NFE=40（MAUVE 0.6，Gen-PPL 14.3），约 13×；长度 1024，NFE 1024 对 72，约 14×。摘要「超过 10×」指这两档，不是 Nie Table 1 的 GSM8K。条件生成写在未来工作。Table 1 是自编码器重建，不是这组倍数。"
---
# CRoCoDiL：连续草稿，掩码解码

[五条性质](./discreteness.md) 把 L2 写成：按格边际对了，乘积仍可抽出假句。[CoDD](./codd.md) 在冻住的 logits 上接可算联合。[离散 copula](./discrete-copula.md) 用 GPT-2 当 copula。Uziel、Belhasin、Levy、Bercovich、El-Yaniv、Zilberstein、Elad 的 CRoCoDiL（arXiv:2603.20210）走第三条：长程结构先在连续句级空间里扩散成一份草稿 $\mathbf{z}_0$，再让掩码去噪器条件在这份草稿上把词揭开。解码器仍是 MDM，一步之内各格仍按边际抽。卖点是草稿已经把「整段在说什么」钉住，并行揭开时不那么容易写成互不相干的局部最优。

实验钉死在无条件代码生成。骨干是 LLaDA-8B，在 StarCoder 的 Python 子集上用 1200 万条、长度 $[0,4096]$ 的程序微调 demasker，从开源 Base 初始化。编码器 $h_\phi$ 从 Qwen embedding 0.6B 初始化，和 demasker 一起再训。潜变量尺寸 $1024\times K$，$K$ 是寄存器个数，训练里 $1\le K\le 128$，dropout 偏好前面的寄存器，好让推理用更短的 $K$。这不是 Nie Table 1 那份通用 Base 的 GSM8K / MMLU。条件（带提示）合成作者写成未来工作，附录 H。本篇倍数全部停在无条件 Python、整段当一块的 Figure 6。

摘要写「超过 $10\times$ 更快」。正文例子两档：长度 512，基础 LLaDA NFE $=512$（MAUVE $0.62$，Gen-PPL $19.4$）对 ConWithinDisc NFE $=40$（MAUVE $0.6$，Gen-PPL $14.3$），约 $13\times$；长度 1024，基础 NFE $=1024$（MAUVE $0.76$，Gen-PPL $23.5$）对 ConWithinDisc NFE $=72$（MAUVE $0.8$，Gen-PPL $12.5$），约 $14\times$。NFE 把连续去噪器也折算进去了：400M 的连续 demasker 跑 128 步，约等于 6 次 8B 前向；条件连续扩散 32 步，少于 2 次 NFE。报 $13\times$ 时分母是这套折算后的 NFE，不是墙钟，不是 GSM8K 时延。

## 1. 边际 demasker 缺的是整段草稿

掩码扩散的 demasker 输出各格 logits，训练目标是按格交叉熵。并行揭开等于从乘积里抽。速度和联合误差是同一枚硬币。另一件这篇单独点名：MDM 揭开后就把词提交进最终序列，没有一份全局草稿告诉后面的步「整段在干什么」。局部可以自洽，整段可以飘。

CRoCoDiL 把「整段在干什么」放到连续空间。编码器 $h_\phi$ 把干净序列映成 $\mathbf{z}_0$。demasker 变成 $f_\theta(\mathbf{x}_t,t,\mathbf{z}_0)$，每格仍独立抽 $\hat x_0^i$，但条件多了这份草稿。长程结构由轻量连续扩散在潜空间里长出来，MDM 负责把草稿译成词。作者的类比是：潜变量是素描，MDM 是按素描上色。素描可以不完整，MDM 的迭代还能补。这和 COSMOS 不同：COSMOS 的解码器没有生成能力，潜变量必须自己带齐所有信息。E2D2 把提示编成连续向量去导离散回答，回答侧仍是普通 MDM，跨 token 依赖仍缺。本篇的 $\mathbf{z}_0$ 导的是无条件整段，不是提示到答案。

相关工作里点名的 DCD copula、能量模型、高斯隐变量，作者写成小尺度上补联合。CRoCoDiL 的尺度是 8B demasker 加 0.6B 编码器再训，任务是无条件 Python。DCD 的 32× NFE 对照 SEDD 多步、尺度 GPT-2。CoDD 的 +5.00 是 LLaDA 低置信 MATH500 256 步。三套分母不能减。

COSMOS 也在连续潜空间扩散。差别在解码器：COSMOS 的解码没有生成能力，潜变量必须自己带齐所有信息，少一点就译不回来。CRoCoDiL 的 MDM 会迭代揭开，素描可以残缺。E2D2 在有提示的设定里把提示编成连续向量，用普通 MDM 写回答；跨 token 依赖仍在回答侧的因子化里。本篇无条件、整段草稿、demasker 从第一步就条件在 $\mathbf{z}_0$ 上。推理期只改揭开顺序的算法（条件独立性检验、膨胀日程）被写成：它们在找「不太相关的格一起揭」，相关格若处处都在，加速就停。CRoCoDiL 不找独立格，它先把相关写进草稿。

高斯隐变量那条（Xie 等人 VADD）也是给离散扩散加连续相关。作者把它和 copula、能量模型放在小尺度一栏。本篇 8B 实验没有和 VADD 对打的表。能量模型 Xu 等人 ICLR 2025 用能量给文本扩散补依赖，配分一般不可精确求；CoDD 后来走可算回路，是另一篇。CRoCoDiL 连续侧是高斯扩散，离散侧仍因子化，依赖靠 $\mathbf{z}_0$ 这个条件，不靠能量。

## 2. 编码器和解码器一起训

损失仍是掩码扩散那一项，只是 demasker 看见 $\mathbf{z}_0=h_\phi(\mathbf{x}_0)$。抽干净 $\mathbf{x}_0$，抽 $t\sim U[0,1]$，按吸收态掩出 $\mathbf{x}_t$，网络吃 $(\mathbf{x}_t,t,h_\phi(\mathbf{x}_0))$，对被掩位置做交叉熵。权重沿用 LLaDA 的 $1/\alpha_t$。$\phi$ 和 $\theta$ 一起更新。没有这份条件时，式子退回普通 MDM。

变长靠 BOS / EOS。微调后的 demasker 会写不同长度的程序，开头结尾用这两个特殊词标出来。潜变量不是「一个 1024 维向量」，是 $K$ 个 1024 维寄存器排成的矩阵。训练对后面的寄存器做 dropout，推理时长度 512 用 $K=8$，长度 1024 用 $K=16$，自编码器 Table 1 用满 $K=128$。$K$ 不是 Transformer 层数。寄存器越多，草稿越细，Figure 4 上有条件 demasker 的交叉熵缝越大。生成 Figure 6 没有用满 128，因为无条件连续扩散还要先把这些寄存器从噪声里长出来，$K$ 太大，连续侧更难。dropout 偏好前面的寄存器，意思是短 $K$ 时仍然用矩阵的前几列，而不是随机抽子集。这样 $K=8$ 的推理和 $K=128$ 的训练共享同一套列对齐。附录 C 写 FlexTok 一类工作把图压成变长 1D token，这里是把程序压成变长寄存器。本篇不把 FlexTok 的图像数字搬过来。

1200 万条 Python 相对 LLaDA 原文的 2.3T 通用 token，是领域适配，不是第二份预训练。开源 Base 当初始化，损失仍是带 $1/\alpha_t$ 的掩码交叉熵，只是 demasker 多吃 $\mathbf{z}_0$。适配之后，通用 MMLU / GSM8K 会不会掉，这篇没有表。读加速倍数时把领域钉在 Python 无条件生成，就不会把 13× 抄到聊天。Qwen embedding 0.6B 的论文是 Qwen3 Embedding；初始化之后权重和公开的检索向量未必还是同一份，因为 $\phi$ 和 demasker 联合更新。检索任务上的分数不能拿来当本篇编码器还在。

ConThenDisc 的循环按 Algorithm 2。从 $\epsilon\sim\mathcal{N}(0,I)$ 用 $G_\psi$ 得到 $\mathbf{z}_0$。$\mathbf{x}$ 从全掩出发。每一步 demasker 条件在这份冻住的 $\mathbf{z}_0$ 上预测 $\hat{\mathbf{x}}_0$，再按前向核把下一步该掩的位置盖回去，$t$ 减 $1/T$。$T$ 小则每步揭得多。草稿不变，等于整段生成共用一张素描。

ConWithinDisc 每步（或选定的子集步）先抽新的 $\mathbf{z}_0\sim G_\psi(\epsilon,h_\phi(\mathbf{x}_t))$，再揭开。正文为了省，只在 MDM 中途加一次连续更新，NFE 额外少于 2。作者列出三条未做完的改进：更新可以更勤；条件可以直接打在 $\mathbf{x}_t$ 上而不经 $h_\phi$；给掩码输入另训编码器 $h_\mu$。主表没有这三档的数字。

自编码器评测把这件事反过来用：已知 $\mathbf{z}_0=h_\phi(\mathbf{x}_0)$，从全掩出发跑少步 MDM，看能不能把程序找回来。Figure 4 在 1000 条验证程序上画交叉熵和 top-1：掩码率升高，所有曲线都差；条件在 $K=8/64/128$ 上优于无条件基线，$K$ 越大缝越大。曲线点没有进主表，本篇不从阴影读数。

Table 1 是自编码器，长度 256，潜变量 $1024\times 128$，扫块长和 NFE。NFE 由「每步揭几个词」决定。作者举的算法账：长度 256、块长 32 则 8 块；NFE $=32$ 表示每块 4 步去噪，每步揭 8 个词。Gen-PPL、CodeBERTScore、CER 三列。块长 32 从 NFE 8 到 256：PPL 59.538 → 20.263 → 13.525 → 11.301 → 10.401 → 10.085；Bert-Score 0.901 → 0.936 → 0.957 → 0.968 → 0.970 → 0.972；CER 0.422 → 0.210 → 0.150 → 0.130 → 0.123 → 0.118。块长 64、NFE 8 / 16 / 32 / 64：PPL 28.172 / 15.553 / 12.463 / 10.971。块长 128、NFE 8 已经 18.027，比块长 32 的 NFE 16 还低。块长 256、NFE 4 是 19.221 / 0.939 / 0.205；NFE 64 到 10.458 / 0.973 / 0.118。作者写 CER 大约 0.10、CodeBERTScore 大约 0.96 到 0.97 时，剩下的差多半在空白、格式、标识符命名，不是语义翻了。块越大、NFE 很少时重建反而更稳，他们写成 surprising。这张表测的是「草稿已知时 MDM 能不能译回来」，不是无条件生成的 $13\times$。NFE=8 和 NFE=256 分属 Table 1 的两档，不是 Figure 6 横轴上的同一套协议。

连续扩散的 demasker 另训。2M 条变长序列经 $h_\phi$ 变成 $1024\times 128$ 的矩阵，拿去训潜空间去噪器。细节在附录 E。推理时 ConThenDisc 先从噪声用 $G_\psi$ 抽出 $\mathbf{z}_0$，再冻住它跑 MDM。ConWithinDisc 在 MDM 中途用条件连续扩散，按当前部分掩码序列的嵌入 $h_\phi(\mathbf{x}_t)$ 把 $\mathbf{z}_0$ 更新一轮。正文实现只在中途加一次，NFE 额外少于 2。编码器没为掩码输入训过，$h_\phi(\mathbf{x}_t)$ 是权宜；作者提到可以另训 $h_\mu$，主实验没有换。附录 F 给自编码器更多设定，附录 E 给连续扩散训练，本篇主叙述只用 Table 1 和 Figure 6 正文里写出的两档工作点。

![](./images/fig-crocodil-conthendisc.png)

> 图 1：左列是微调过的 LLaDA、Qwen 编码器、寄存器潜变量、Table 1 重建。右列是先连续后离散、中途更新草稿、400M 连续步折算成约 6 次 8B、长度 512 的 $13\times$ 与长度 1024 的 $14\times$。底栏钉无条件 Python。

**图 1 解析**

- **L0**：1200 万条 StarCoder Python，不是通用 SFT。
- **L1**：0.6B 是编码器初始化，和 8B 一起再训。
- **L2**：$K$ 是寄存器个数。Figure 6 上长度 512 用 $K=8$，长度 1024 用 $K=16$。
- **L3**：Table 1 长度 256、已知 $\mathbf{z}_0$。CER 0.118 不是生成 MAUVE。
- **R0**：ConThenDisc 的 $\mathbf{z}_0$ 全程冻。
- **R1**：ConWithinDisc 中途更新一次。
- **R2**：连续 128 步 $\approx 6$ 次 8B NFE。
- **R3–R4**：整段一块。基础模型 NFE 等于长度时，对比的是「几乎每步揭一格」。
- **F0**：无条件。条件生成没有主表。

## 3. Figure 6：13× 在长度 512，14× 在长度 1024

无条件生成把整段当一块，作者写这对基础模型最好。横轴是折算后的 NFE，纵轴 MAUVE 和 Gen-PPL。上图 $n=512,K=8$，下图 $n=1024,K=16$。

可比工作点正文写了两句。长度 512：基础 NFE $=512$，MAUVE $0.62$，Gen-PPL $19.4$；ConWithinDisc NFE $=40$，MAUVE $0.6$，Gen-PPL $14.3$。MAUVE 接近，困惑度更低，NFE 从 512 到 40，约 $13\times$。长度 1024：基础 NFE $=1024$，MAUVE $0.76$，Gen-PPL $23.5$；ConWithinDisc NFE $=72$，MAUVE $0.8$，Gen-PPL $12.5$。质量不差，NFE 从 1024 到 72，约 $14\times$。摘要的「超过 $10\times$」是这两档的下界说法，不是第三张没公开的墙钟表。

两档并排：

| | 长度 | NFE | MAUVE | Gen-PPL | 相对基础 NFE |
|---|---|---|---|---|---|
| 基础 LLaDA | 512 | 512 | 0.62 | 19.4 | 1× |
| ConWithinDisc | 512 | 40 | 0.6 | 14.3 | 约 13× |
| 基础 LLaDA | 1024 | 1024 | 0.76 | 23.5 | 1× |
| ConWithinDisc | 1024 | 72 | 0.8 | 12.5 | 约 14× |

MAUVE 在 512 上 0.62 对 0.6，几乎打平；在 1024 上 0.8 对 0.76，草稿侧更高。Gen-PPL 两档都是草稿侧更低。倍数来自 NFE 比，不是来自 MAUVE 比。整段一块、$K$ 随长度从 8 到 16，两行不是只改了一个超参。报 13× 必须写长度 512；报 14× 必须写长度 1024。摘要「超过 10×」是两档都过 10 的写法。硬件墙钟、batch、KV 缓存这篇没有。NFE 比只说明 demasker 被调用多少次（连续侧已折算），同一张卡上 40 次 8B 前向是否真的比 512 次快十三倍，还取决于实现有没有把连续 400M 和 8B 叠在同一步调度里。作者用 NFE 当复杂度轴，本篇跟这条轴，不另报 tok/s。

基础模型 NFE 等于长度，含义是几乎每步只揭一格：长度 512 走 512 次 demasker，并行卖点基本关掉，质量当上界来对照。CRoCoDiL 在 NFE 40 或 72 上就对上甚至超过这份上界的 MAUVE，Gen-PPL 还更低。读法是：有草稿之后，少步并行不再付那么多联合误差。没有草稿的基础模型要把步数加到与长度同阶，才把边际陷阱压回去。这和[采样](../02-mechanism/sampling.md)里 $T\ge n$ 减轻因子化误差是同一件事，只是这边用连续草稿把 $T$ 买下来。

ConThenDisc 在同一组图上优于基础 LLaDA，ConWithinDisc 再好一截，代价是中途一次连续扩散。附录 G 有更宽的超参，正文主叙述只用这两档。MAUVE 和 Gen-PPL 是无条件生成常用的分布匹配指标，不是 HumanEval Pass@1，不是 GSM8K。StarCoder 微调过的 LLaDA 会写 Python，本篇不把它的 Gen-PPL 19.4 和 Nie 的 HumanEval 35.4 放在同一句。无条件的意思是：没有用户提示，从噪声（连续）和全掩（离散）长出一段程序。评测把生成分布和真实程序分布比 MAUVE，再用外部 LM 打 Gen-PPL。这和「给一道题写出能跑的函数」不是同一张表。

NFE 折算必须读脚注。连续去噪器 400M 参数、128 次，作者换成「约 6 次 8B demasker」。条件连续扩散 32 步，「少于 2」。ConWithinDisc 的 40 和 72 已经把这笔加进去。若只用 8B 前向次数重算，连续侧那 6 次会被漏掉，$13\times$ 会虚高。本篇跟作者的折算走。400M 对 8B 大约是二十分之一的宽度，128 次乘下来才会接近 6。这是粗算，正文用约等号，本篇不另发明更精确的 FLOPs 表。

块长在自编码器 Table 1 里扫过 32 到 256。生成 Figure 6 把整段当一块。两套几何分开读：重建可以大块少步；无条件生成的对照把基础模型也放在整段一块上，为的是让并行诅咒充分暴露，再看草稿能不能托住质量。Figure 5 给了一段源程序和编解码结果，作者写成几乎完美，即便 MDM 用很少 NFE。定性例子没有进 Table 1 的格子，本篇不从截图读 CER。

微调数据两笔账要分开。demasker 见过 1200 万条 Python。连续扩散见过 200 万条经 $h_\phi$ 映出的潜变量矩阵。编码器自己从 Qwen 0.6B 初始化，和 demasker 联合更新。三套数据量不是三次重复计算同一语料。StarCoder 子集的许可证和过滤条件以原数据论文为准，本篇只钉「Python、变长、带 BOS/EOS」。

CodeBERTScore 用预训练代码模型的上下文表示做余弦对齐，F1 高表示语义近。CER 是字符级 Levenshtein 除以参考长度。自编码器同时报两列，是为了区分「看起来像同一段程序」和「字符几乎逐个对上」。生成 Figure 6 改报 MAUVE，因为无条件样本没有一对一的参考程序。Table 1 的 Bert-Score 0.973 不能抄到 Figure 6 当 MAUVE。

## 4. 和连续嵌入扩散、联合层、加速器怎么分工

[从图像到离散](../02-mechanism/from-image-diffusion.md) 里的连续路线把噪声加在 token 嵌入上，最后 rounding。CRoCoDiL 的连续扩散加在句级寄存器上，词仍由离散 MDM 揭开，没有 rounding 成词这一步。Diffusion-LM 的 80M 句法树表和本篇无关。

[CoDD](./codd.md) 冻 8B，训 HMM，主表是 MATH500 / GSM8K 准确率。CRoCoDiL 再训 8B demasker 和编码器，主表是无条件 Python 的 MAUVE / Gen-PPL / NFE。一个补因子化输出，一个补「没有全局草稿」。可以叠，这篇没有叠过的表。

[离散 copula](./discrete-copula.md) 推理期 I-投影，尺度 GPT-2。CRoCoDiL 把 copula 写成相关工作里的小尺度联合补丁。8B 上他们选的是连续草稿，不是 I-投影。

[代码向扩散](./code-dllm.md) 写 DiffuCoder 7B、专料约 130B、coupled-GRPO。CRoCoDiL 的 1200 万条 StarCoder Python 是适配 demasker 的领域，不是再训一个代码基座。HumanEval 那篇有表，这篇没有。两篇都碰代码，一个评函数对错，一个评无条件程序分布和 NFE。标识符命名在 CER 里会被罚，在 CodeBERTScore 里可能仍高，这是 Table 1 两列并报的原因。生成侧没有参考程序，CER 用不上，才改成 MAUVE。

[推理加速](./inference-acceleration.md) 的 DualCache、SlowFast、dParallel 改的是已有 demasker 的采样轨迹，不另训句级扩散。CRoCoDiL 要训 $h_\phi$、$f_\theta$、$G_\psi$。训练免费的加速数字不能和 $13\times$ 减。dParallel 的 8.5× 是 GSM8K-CoT 时延 18.6s 到 2.2s。分母是任务、硬件、是否微调，三件都不同。Fast-dLLM DualCache 的 27.6× 对照原版 LLaDA 吞吐，任务在加速专文里。本篇 $13\times$ 对照的是同一颗 Python 微调 LLaDA、无条件、整段一块、NFE 从 512 降到 40。长度 1024 那档是 1024 降到 72，约 $14\times$，MAUVE 从 0.76 到 0.8。两档都过 10，摘要才写超过 10×。换一块长度、换 $K$、换是否中途更新 $\mathbf{z}_0$，倍数要重测。ConThenDisc 冻草稿，NFE 更省，质量在 Figure 6 上低于 ConWithinDisc、仍高于基础。中途更新一次是正文默认；更新更勤的档附录可以有，主叙述没有把它写成第二张倍数表。自编码器 Table 1 里块长 256、NFE 4 已经能把 CER 打到 0.205，说明草稿已知时少步译词是可行的；无条件难在草稿本身要从噪声长出来。重建容易、生成难。CER 是有参考的重建误差，MAUVE 是无参考的分布匹配，两列不能对减。Table 1 没有 MAUVE 列，Figure 6 没有 CER 列。指标跟着任务换。重建跟生成不是同一张卷，也不能当同一份分数读。

能量模型那条相关工作是 Xu 等人 ICLR 2025 的 energy-based diffusion LM，作者写成小尺度上用能量补跨格。Guo/Xu 若另有 copula 能量写法，不在这篇主表里。CRoCoDiL 没有报能量函数的配分函数，连续侧走的是标准高斯扩散去噪。

局限按原文。条件生成没有做。连续扩散还可以蒸。潜变量设计还可以更省。对照模型还窄，主骨干就是这颗微调 LLaDA。1200 万 Python 改变了 demasker 的领域，读「LLaDA 上 13×」时，LLaDA 已经不是通用 Base。13× 不是开源 LLaDA-8B 聊天快了十三倍，领域是无条件 Python，指标是 NFE 与 MAUVE / Gen-PPL。HumanEval、GSM8K、MATH500 这篇没有。附录 H 讨论怎么把算法接到有提示的合成，正文没有那张表。蒸连续扩散、换更省的潜变量、换别的 demasker 骨干，都写在结论里当下一步。当前能核对的只有：微调 Python 的 LLaDA-8B、Qwen 0.6B 编码器、无条件、整段一块、Figure 6 两档工作点，以及 Table 1 的重建。

ICML 关键词写在摘要页。投稿年份按 arXiv 2603.20210 的 2026 年 3 月版本读。实现细节大量在附录 C（寄存器与 dropout）、E（连续扩散）、F（自编码器）、G（生成超参）。Figure 6 是曲线，正文只抽出 NFE 512 对 40、1024 对 72 两对。曲线上其余 NFE 没有写成表格，本篇不估读。

## 参考文献

- Uziel, Belhasin, Levy, Bercovich, El-Yaniv, Zilberstein, Elad. *CRoCoDiL: Continuous and Robust Conditioned Diffusion for Language*. arXiv:2603.20210.
- Nie 等人. LLaDA-8B Base 作 demasker 初始化，不是 Table 1 通用评测。
- Li 等人. StarCoder。Python 子集 1200 万条。
- Ren 等人. Qwen3 Embedding。0.6B 编码器初始化。
- Meshchaninov 等人. COSMOS。解码器无生成能力，和素描+MDM 不同。
- Arriola 等人. E2D2。提示编码 + 普通 MDM 答，跨 token 依赖仍缺。
