---
title: "D2F：脏前缀上接着写下一块"
category: "06-推理加速与系统"
tags:
  - D2F
  - block-diffusion
  - distillation
  - pipeline
  - KV-cache
published: true
as_of: 2026-08-31
excerpt: "块扩散 teacher forcing 只看见干净前缀，推不出多块同时带噪声的流水线。D2F 把掩码率做成 t1<…<tN，学生块间因果、老师全双向，用不对称 KL 蒸。52.9× 在 MBPP：原版 0.9 TPS 到 47.6，分 39.0 到 38.0。2.5× 对 AR 是 Dream-Base 在 GSM8K 上 119.9 tok/s 对 LLaMA3-Instruct-8B 的 48.0，最大长度 512。不要和 Table 1 的 52.5 焊。"
---
# D2F：脏前缀上接着写下一块

块扩散专文把句子切成块：块间因果、块内双向，前缀的 KV 可以真缓存。训练若仍用 teacher forcing，学生看见的前缀永远是干净的，当前块才带噪声。推理若改成「前一块还没填完，下一块已经开工」，前缀是脏的，分布外。Wang 等人的 Discrete Diffusion Forcing（D2F，arXiv:2508.09192）把这条缝当成主问题：要块间并行，训练必须见过不完整前缀。名字来自连续空间的 Diffusion Forcing，这里搬到离散 token。

开源 LLaDA / Dream 在他们写稿时还没有一篇公开检查点稳定快过同尺寸 AR。加速专文的 DualCache、serving 专文的 dInfer、少步专文的 SDTT，各自补 KV、调度器或步数。D2F 补的是结构：块级自回归换真 KV，同时允许后一块在前一块未完成时动手。实现是非对称蒸馏，不是从零再训 8B。

## 1. 干净前缀推不出流水线

BD3-LM 的块条件写成 $p_\theta(x^{(m)}\mid x^{(<m)})$，前缀 $x^{(<m)}$ 在训练时是明文。推理一块一块填，填完再开下一块，训练–推理对齐。把窗口改成多块同时去噪，后一块的条件变成「前一块仍有 `[MASK]`」。teacher forcing 没见过这种条件。作者把它写成：拥抱块级顺序是为了 KV，拒绝「必须等前一块完全干净」。

连续视频里的 Diffusion Forcing 也是同一句：每个时间块可以处于不同噪声水平，模型学的是「看见半干净的过去，预测更脏的未来」。D2F 把块换成 token 块，噪声换成掩码率。块 $B_1,\ldots,B_N$ 上采单调递增的掩码率 $t_1<\cdots<t_N$，前面的块更干净、后面的块更脏。前一块自然先填完，KV 可以先写进缓存；后一块在训练时已经习惯吃脏前缀。

注意力必须改成块间因果。若学生仍全双向，后面的脏块会回头改前面的 $K,V$，缓存不再精确。老师保持全双向，一次前向看见所有噪声块。学生初始化成老师权重，只换注意力图案。结构差在掩码，不在层数。

单调日程不是装饰。Table 4 把同一套推理超参接到「每块独立随机掩」的对照上：MBPP、$\tau_{\mathrm{act}}=0.95$ 时，随机日程 147.2 TPS / 49.6 分，D2F 日程 171.2 / 54.6。GSM8K 上分数几乎贴着（77.1 对 77.2），吞吐 D2F 仍高一截（114.5 对 119.9）。随机日程也能跑流水线，但前一块未必更干净，KV 写入的时机和「后一块该有多尖」对不齐。

## 2. 非对称 KL：老师看见全局，学生只看见左边

从零训几十亿参数的块因果扩散贵。D2F 用现成双向检查点当老师 $p_{\phi^{-}}$，学生 $p_\theta$ 从同一份权重起步。损失只加在掩码格上：

$$
\mathcal{L}_{\mathrm{D2F}}=\mathbb{E}_{t_1<\dots<t_N}\Biggl[\sum_{i=1}^{N}D_{\mathrm{KL}}\Bigl(p_\theta(Y_{B_i}^{0}\mid Y_{B_1}^{t_1},\dots,Y_{B_i}^{t_i})\;\Big\|\;p_{\phi^{-}}(Y_{B_i}^{0}\mid Y_{B_1}^{t_1},\dots,Y_{B_N}^{t_N})\Bigr)\Biggr].
\tag{1}
$$

学生预测第 $i$ 块的干净字时，条件停在第 $i$ 块自己的噪声；老师预测同一块时，条件一直看到第 $N$ 块。KL 的方向是学生去贴老师，不是反过来。作者把它写成 asymmetric distillation，并点名视频里的 CausVid：整体双向生成器蒸成流式生成器，也是老师看全片、学生看过去。

数据不是 LLaDA 那 2.3T。他们用 Bespoke-Stratos-17k 衍生出的两份 HuggingFace 集合（第三方用 Qwen2.5-7B 写过回答），过滤到最大 600 token，训练时截断或垫到 512。LoRA 只动 `q_proj` / `k_proj` / `v_proj` / `o_proj`，rank 32、缩放 32、dropout 0.1。块长训练固定 16。掩码率夹在 0.3 与 0.7 之间，仍保持块间单调。AdamW，学习率恒为 $10^{-5}$，8×A100-PCIe-40GB 上 12 小时。这不是 CAP 那种继续预训练，也不是 SDAR 的 50B 转换。权重改动小，改的是「看见脏前缀时还敢不敢写」。

对照实验把同一份数据、同一套 LoRA 直接微调原版 Dream-Base，得到 Dream-Base*。Table 6：GSM8K-CoT 从 9.5 TPS 掉到 6.7，分从 75.0 到 77.8；MBPP 从 10.4 掉到 4.2；HumanEval 从 20.2 掉到 8.8。分有的略涨，墙钟一律更慢。作者把慢写成 LoRA 层的额外计算。加速不是这份 17k 推理数据带来的，是块因果加流水线带来的。把 D2F 写成「再 SFT 一遍就快了」，Table 6 打回。

![D2F 在带噪前缀上预测下一块并形成多块流水线的训练推理流程](./images/fig-d2f-pipeline.png)

> 图 1：左列训练，老师全双向、学生块因果、掩码率单调、不对称 KL；右列推理流水线，完成块写真 KV，新块先半激活，前驱够尖再全激活。底栏把 52.9× 钉在 MBPP，把 2.5× 钉在 Dream 对 LLaMA3 的 GSM8K。

**图 1 解析**

- **L1–L2**：老师看见所有噪声块；学生只看见左边加当前块。单调 $t_1<\cdots<t_N$ 让前一块先干净。
- **L3–L4**：式 (1) 的 KL 只加在掩码格。12 小时 LoRA，不是 580B 改编。
- **R1**：已经提交的块走块因果，KV 是真缓存，不是 DualCache 那种冻住的后缀掩码。
- **R2–R3**：新块半激活，只收 $\tau_{\mathrm{conf}}$ 以上的格；前一块完成率过 $\tau_{\mathrm{act}}$ 后改成全激活，没有过阈值的格也至少揭最尖的一个。
- **R4**：最后一块完成率过 $\tau_{\mathrm{add}}$ 就追加一块全掩码。动态窗口，不是一开始垫满 $N$ 块。
- **F0**：52.9× 的分母是 LLaDA-Instruct 在 MBPP 上的 0.9 TPS。2.5× 的分子是 D2F-Dream-Base-7B 的 119.9，分母是 LLaMA3-Instruct-8B 的 48.0，最大长度 512。Table 1 里 D2F-LLaDA 的 GSM8K 是 52.5 TPS，另一张表、另一个骨架。

## 3. 流水线：三个阈值不是三个同义词

推理维持一个滑动窗口。最后一块的完成率超过 $\tau_{\mathrm{add}}$，并且还没见到 `<|EOS|>`，就追加一块全 `[MASK]`。新块先半激活：只提交置信度高于 $\tau_{\mathrm{conf}}$ 的位置。前一块完成率超过 $\tau_{\mathrm{act}}$ 之后，这块改成全激活：过阈值的照收，一个都不过时强制揭最尖的那一格。半激活怕的是「前缀还是糊的，后一块已经大胆并行」；全激活怕的是「前缀已经够用，后一块还在等阈值，流水线饿死」。

论文 Algorithm 1 把窗口写成一个循环。每步先看最后一块完成率，过 $\tau_{\mathrm{add}}$ 且还没有结束符就追加。然后对窗口里每一块：半激活只收置信度高于 $\tau_{\mathrm{conf}}$ 的格；若前一块完成率已过 $\tau_{\mathrm{act}}$，这块按全激活规则再补揭。完成的块把 KV 留下，从窗口里摘掉。滑动的是「还活着的脏块」，不是整句 $N$ 块一直占着显存。作者把动态窗口写成相对「一开始垫满」的算力节省。实现上这和 serving 专文的迭代器外层同构：问下一块从哪开始。差别是 D2F 允许下一块在上一块未空时就进窗口。

默认值 $\tau_{\mathrm{conf}}=0.9$、$\tau_{\mathrm{add}}=0.1$、$\tau_{\mathrm{act}}=0.95$。附录 Table 8 按任务改。D2F-LLaDA 的 GSM8K 把 $\tau_{\mathrm{add}}$ 拧到 0.7、块长 64、最大长度 512；MBPP 用 $\tau_{\mathrm{add}}=0.9$、块长 32；HumanEval 和 MATH 用默认 0.1。Dream 侧最大长度多数钉在 256，因为基座经常写不出结束符，作者跟 dLLM-Cache 的设定对齐，避免「谁垫得更长谁看起来更慢」。长度在 D2F 里只是上限，块写完可以停；原版逐步揭开的长度会进采样分布。两套长度列不能横减成「D2F 更短所以更快」这句空话，但 GSM8K 上 231→144 确实会把延迟倍数抬到 11.5，高于 TPS 的 7.3。报延迟必须同时报生成长度。

半激活那条规则，采样专文里叫低置信 remask 的近亲：一步里只冻结尖的格，糊的格下一轮再看。差别是 remask 发生在同一块的去噪步之间，半激活发生在「前缀还脏」的未来块上。全激活多出来的「没有过阈值也揭最尖的一个」，是为了让流水线不卡死。阈值揭开专文把这件事写成训练免费的启发式；D2F 把启发式接到一块已经见过脏前缀的权重上，所以敢把 $\tau_{\mathrm{add}}$ 拧到 0.1，窗口里同时活几块。

Table 3 在 GSM8K 4-shot、块长 32、最大长度 512 上扫 $\tau_{\mathrm{act}}=\tau_{\mathrm{conf}}$ 与 $\tau_{\mathrm{add}}$。$\tau_{\mathrm{add}}=\tau_{\mathrm{act}}$ 是单态：新块一进来就是全激活。$\tau_{\mathrm{add}}<\tau_{\mathrm{act}}$ 是双态。$\tau_{\mathrm{act}}=0.85$ 时，把 $\tau_{\mathrm{add}}$ 从 0.85 收到 0.7，分从 72.6 到 74.2，吞吐从 136.8 到 139.0。再收到 0.1，分到 75.0，吞吐略回 135.4。双态不是免费午餐，是用更保守的开头换分数；拧过头，窗口里同时活着的块变多，注意力变贵。

推理块长不必等于训练的 16，作者用 16 的整数倍扫。Figure 5：块变大，吞吐往下走，分数先升后降。GSM8K 上块长 48 到 77.5，块长 16 是 75.9。更大的块让块内双向半径变长，搭配误差也回来。没有对所有任务最优的推理块长。主表里 LLaDA 的 HumanEval / MATH 用 32，GSM8K 用 64，是工作点，不是定理。

## 4. Table 1 的 52.9× 在 MBPP，不在 GSM8K

LLaDA-Instruct 主表（Table 1）对照原版逐步揭开，超参跟 Nie 原文对齐。硬件写在「训练和推理都在 8×A100-PCIe-40GB」那一句里，没有另开一张单卡 vs 八卡的 TPS 表。不要和 dInfer 的 8×H800、batch 1、长度 1024 减。

| 任务 | 原版 TPS / 分 | DualCache TPS / 分 | D2F TPS / 分 | 相对原版 |
|---|---|---|---|---|
| GSM8K 4-shot | 7.2 / 77.4 | 35.2 / 78.9 | 52.5 / 77.3 | 7.3× |
| MBPP 3-shot | 0.9 / 39.0 | 15.3 / 36.4 | 47.6 / 38.0 | 52.9× |
| HumanEval 0-shot | 2.8 / 36.0 | 19.2 / 35.4 | 81.6 / 40.2 | 29.1× |
| MATH 4-shot | 21.1 / 23.7 | 42.5 / 22.4 | 90.2 / 29.1 | 4.3× |

原版 MBPP 只有 0.9 TPS，延迟 71.4 秒，生成长度 65。分母极小，52.9× 好看。GSM8K 原版已经 7.2，D2F 到 52.5 只有 7.3×。摘要「50× 不掉平均分」是四任务一起说：MBPP 掉 1.0，GSM8K 掉 0.1，HumanEval 加 4.2，MATH 加 5.4。平均能平，单列不能写成「处处不掉」。DualCache 在 GSM8K 上 78.9，高于 D2F 的 77.3；MATH 上 DualCache 22.4，低于 D2F 的 29.1。不要写成全面碾压分数。MATH 的延迟只到 2.7×（11.5 秒到 4.3 秒），因为生成长度从 243 涨到 384；TPS 的 4.3× 和延迟的 2.7× 差在长度，不是算错。

dLLM-Cache 和 PrefixCache 写在同一张表里，当作「训练免费、近似缓存」的邻居。GSM8K 上 PrefixCache 33.3 / 77.8，已经接近 DualCache。MBPP 上 PrefixCache 13.0 / 37.6，DualCache 15.3 / 36.4，都远慢于 D2F 的 47.6，分数还略低。HumanEval 上 DualCache 19.2 / 35.4，D2F 81.6 / 40.2。近似缓存吃的是「相邻去噪步余弦接近 1」；块一短、步数一少，这份近似变差。D2F 再往上走，靠的是块因果加流水线，不是把 DualCache 的余弦相似度再拧一档。

LLaDA 2.0 的 WSD 把块大小当课程：warmup 加大块，stable 全序列，decay 收到部署块，起点是 AR。D2F 的起点是已经训好的双向扩散，LoRA 12 小时只改注意力投影。两条河都接到「块间因果、块内双向」，学费差两个数量级。2.0 买的是 100B 改编后的部署块；D2F 买的是现成 Instruct / Base 立刻能跑流水线。Fast-dLLM v2 从 AR 出发、约 1B token，互补掩码保住 next-token 几何。三份检查点不要减吞吐：卡、长度、是否 Instruct，协议都不齐。机制上问清楚起点是 AR 还是双向扩散，训练见过的脏块是一个还是一串。

Dream-Base 主表（Table 2）最大长度统一 256。GSM8K-CoT 8-shot：原版 9.5 TPS / 75.0 分，D2F 91.2 / 77.6，9.6×。MBPP 10.4→105（10.1×），分 56.2→55.2。HumanEval 20.2→73.2（3.6×），分贴着 54.3。MATH 9.9→98.8（10.0×），分 35.8→35.4。相对 Fast-dLLM DualCache，GSM8K-CoT 上 91.2 对 49.8 约 1.8×。这张表的分母是 Dream 原版 Python 循环，不是 LLaMA3。

对 AR 的 2.5× 在 Figure 1，不是 Table 1。最大生成长度所有方法 512。D2F-Dream-Base-7B 在 GSM8K 上 119.9 tok/s，LLaMA3-Instruct-8B 48.0，Qwen2.5-Base-7B 52.7。HumanEval 文称约 1.6× 于同尺寸 AR。骨架是 Dream-Base，不是 D2F-LLaDA。Instruct 对 Base、8B 对 7B，对照本来就不齐；作者要的是「开源扩散第一次墙钟超过同量级 AR」这件事，不是对齐 SFT 配方。激进档 Figure 2：固定 $\tau_{\mathrm{add}}=0.1$、块长 32，把 $\tau_{\mathrm{act}}=\tau_{\mathrm{conf}}$ 往下拧，GSM8K 上 150.9 tok/s、分 71.2，对 LLaMA3 的 48.0 / 70.1 约 3.1× 吞吐且略超分。同一图上，原版 Dream 把步数从 512 收到 128，GSM8K 从 71.4 掉到 42.8。少步专文写过：不改结构、只砍步数，并行诅咒会把分打穿。D2F 的曲线能走远，是因为块间因式分解把一部分搭配误差关在块边界上，流水线又让一步提交的格子跨多块。

## 5. 消融：缓存是一截，流水线是另一截

Table 5 把 D2F-LLaDA 拆成 Cache-only 和 Cache+Para。Cache-only 用块因果换真 KV，一块填完再开下一块，没有异步窗口。GSM8K：17.5 TPS（2.4×），分 78.1。加上流水线：52.5（7.3×），分 77.3。MBPP：18.1（20.1×）到 47.6（52.9×）。HumanEval：28.0（10.0×）到 81.6（29.1×），两档分数都是 40.2。MATH：30.6（1.5×）到 90.2（4.3×）。真 KV 已经比原版逐步揭开快一截；摘要里那些十几倍、五十倍，多半来自多块同时干活。把 D2F 写成「就是块扩散加 KV」，漏掉 Table 5 右边那一列。

Dream 侧 Table 7 同构。GSM8K-CoT：Cache-only 40.7（4.3×）/ 77.8 分，Cache+Para 91.2（9.6×）/ 77.6。HumanEval 上流水线从 43.6 到 73.2，只有 3.6× 相对原版，缓存自己已经 2.2×。任务短、原版并不特别慢时，流水线的倍数收窄。

和 d3LLM 的表不要焊。Qian 的 HuggingFace、单卡 H100、GSM8K-CoT 零样本里，D2F 的 TPF 2.88、分 73.2、AUP 213.8，和 Fast-dLLM 的 2.77 / 74.7 / 205.8 贴着。d3LLM 同一列 TPF 9.11、AUP 637.7。D2F 原文的 52.5 TPS 是另一套采样器、另一块卡、带 shot 的 GSM8K。AUP 切掉相对逐步揭开掉 5 分以上的点；D2F 原文没有画这条曲线，也没有报 TPF。抄各自论文，分母跟着表走。

d3LLM 把多块做成五态，用熵选格，完成后再稳定 1–2 步才写 KV。D2F 用完成率阈值切半激活 / 全激活，没有稳定期这一态。伪轨迹专文写过：没有顺序监督时，未来块吃到的前缀更脏，所以 D2F 在他们框架里跑不进 TPF 9。两篇都叫多块并行，监督不同。SDAR 是先付 AR 的 NLL 再转块扩散，转换约 50B token，不移位、不退火；D2F 是从双向扩散检查点 LoRA 12 小时。SDAR 买的是「训练预算先给精确连乘」；D2F 买的是「推理时脏前缀合法」。接到同一 7B–8B 产品时可以叠，主表没有叠。

APD 把揭开顺序钉成从左到右，用小 AR 管联合，有损。D2F 不引入验证器，并行误差用块边界和阈值挡。SSD 才是无损自验证。serving 专文的 hierarchical 切 span，训练免费；D2F 的窗口是训练过脏前缀之后的时间启发式。credit / vicinity 窗口 16 和 $\tau_{\mathrm{add}}=0.1$ 不是同一个旋钮。

Table 3 还有一列值得盯。$\tau_{\mathrm{act}}=0.95$ 时，$\tau_{\mathrm{add}}$ 从 0.95 收到 0.1，吞吐几乎不动（105.2 到 104.0），分从 76.9 到 77.7。$\tau_{\mathrm{act}}=0.90$ 时同样：124.5 / 74.7 对 122.1 / 76.4。真正拉开吞吐的是把 $\tau_{\mathrm{act}}$ 自己往下拧，不是把加块阈值拧到尽头。报「D2F 默认 $\tau_{\mathrm{add}}=0.1$」时，分数敏感的是 $\tau_{\mathrm{act}}$ 和 $\tau_{\mathrm{conf}}$ 那一档。Figure 2 的 150.9 tok/s 走的就是把这一档拧低，不是把加块阈值再拧一圈。

## 6. 失效：长度、EOS、全双向、评测协议

最大长度 256 或 512 的主表，摊不到 dInfer 那种 1024 画布，更摊不到 32k 聊天。流水线窗口里同时活着的块一多，每步注意力按「未完成块的并集」涨，不是按 1。产品平均写两千字，要重测 TPS，不要把 119.9 写进 SLA。

Dream-Base 写不好结束符，Table 2 才把所有方法的上限钉死在 256。块扩散本该「写到不想写为止」；基座不会 EOS 时，可变长名存实亡，长度列变成填充。LLaDA-Instruct 在 GSM8K 上能停在 144，延迟倍数才好看。换一个不会停的检查点，11.5× 延迟会消失，TPS 还在。

块间因果买不到全双向的填空和诗歌反向。老师是双向的，学生蒸馏之后图案已经换成下三角加对角方块。Berglund 那种反向、LLaDA 诗句表，结构上弱于原版 Instruct 的全双向采样。产品主打续写、代码、长 CoT，通常够；主打任意跨度 infill，要回到全双向或临时放大编辑块。块扩散专文写过第三种身份：推理时把选中区域当成更大的块。D2F 的流水线没有演示这一招。

训练只见过最多 0.7 的掩码率、块长 16、序列 512。推理块长 64、最大 512，已经是外推。再外推到 2048 画布、块长 128，单调日程保证不了。MBD-LM 后来用 Multi-block Teacher Forcing 补「训练见几个噪声块」这件事，说明 D2F 的 LoRA 没有把多块 teacher forcing 写成预训练目标。看见更新的多块论文，先问训练见过几个脏块，再问推理窗口允许多少个脏块。

评测是数学和代码。Waiting Line、Shuffle、拉丁方那种高条件相关任务，ParallelBench 专文单独打。GSM8K 不掉点，推不出「并行无害」。本篇 77.3 对 77.4，只说明在这套 4-shot 协议下分数贴着；Shuffle 上同一套阈值可能退化成逐步揭开，或一步全错。条件总相关 $\mathcal{C}(Y|X)$ 高的任务上，块内因子分解误差不会因为换了脏前缀训练就消失。D2F 把误差关在块边界上，块内一步仍可能同时揭多格，ParallelBench 的 Shuffle 定理对块内同样成立。

batch 1。连续 batch 下，每步已经是多块满注意力，多请求是占显存，不一定换吞吐。d3LLM 的 SGLang 附录里 batch 4 几乎买不来东西，是同一类账单。D2F 原文没有 batch 32 的主表。`[OM-FREEPLAY]` 线上并发要自己测，不要把 150.9 写成聊天服务的稳定吞吐。

LoRA 只动注意力投影。MLP、词表、位置编码原样。基座不会的竞赛数学，12 小时补不回来。MATH 上 LLaDA 从 23.7 到 29.1，更像采样动态和长度变了，不像突然学会新题型。Dream-Base* 在 MATH 上还从 35.8 掉到 33.4。数据对照已经表明：同一份 17k 不会自动变成更快的模型，也不会自动变成更强的模型。

## 7. 读完应留下的判断

要块间 KV，问训练是不是块因果。要块间并行，再问训练见没见过脏前缀。两问都「是」，才是 D2F 这条河；只改推理窗口、训练仍 teacher forcing，是块扩散专文警告过的分布外。

要报快，先问分母。52.9× 的分母是 MBPP 上原版 0.9 TPS。7.3× 的分母是 GSM8K 上原版 7.2。2.5× 的分母是 LLaMA3-Instruct-8B 的 48.0，分子是 Dream-Base 蒸馏后的 119.9，最大长度 512。d3LLM 表里 2.88 TPF 是第三套协议。四条分母减不出谁更快。

要报质量，先看 DualCache 在 GSM8K 上 78.9 高于 D2F 的 77.3，再看 MATH 上 D2F 的 29.1 高于 DualCache 的 22.4。平均能平，列上会换人赢。激进档 150.9 tok/s 配 71.2 分，对 LLaMA3 的 70.1 仍略高；原版 Dream 砍到 128 步会掉到 42.8。曲线形状是结构带来的，不是把阈值拧到 0.1 就能从逐步揭开里免费得到。

图 1 左列是训练多出来的脏前缀。右列是推理多出来的半激活 / 全激活。底栏是分母纪律。三块齐，50× 和 2.5× 才有地方放。

## 参考文献

- [Wang et al., D2F, 2025](https://arxiv.org/abs/2508.09192) — 式 (3)；Table 1–8；Figure 1–2、4–5；LoRA 与 Bespoke-Stratos-17k。
- [Chen et al., Diffusion Forcing, 2024](https://arxiv.org/abs/2407.01392) — 连续空间的 forcing，D2F 的名字来源。
- [Arriola et al., BD3-LM, 2025](https://arxiv.org/abs/2503.09573) — 块扩散 teacher forcing；训练只脏当前块。
- [Wu et al., Fast-dLLM, 2025](https://arxiv.org/abs/2505.22618) — DualCache；Table 1 的近邻。
- [Qian et al., d3LLM, 2026](https://arxiv.org/abs/2601.07568) — 另一套协议上的 D2F TPF / AUP，不要和 52.5 TPS 焊。

## 相关

- [块扩散](./block-diffusion.md)
- [SDAR](./sdar.md)
- [推理加速](./inference-acceleration.md)
- [ReFusion](./refusion.md)
- [SlowFast](./slowfast.md)
- [d3LLM](./d3llm.md)
- [少步蒸馏](./few-step-distill.md)
- [Serving](./serving.md)
- [APD](./apd.md)
- [采样与调度](../02-mechanism/sampling.md)
- [LLaDA 专文](../03-models/llada-frontier.md)
- [Dream、Mercury、Seed](../03-models/dream-mercury-seed.md)
- [失效模式](./failure-modes.md)
- [ParallelBench](./parallelbench.md)
