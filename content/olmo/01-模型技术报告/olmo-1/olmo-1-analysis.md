---
title: "OLMo: 全栈公开的 7B Dense 起点"
category: "模型库"
tags: ["OLMo", "技术解析"]
published: true
excerpt: "一句话身份: OLMo 是 Allen AI 在 1B 与 7B 两档 Dense decoder-only 上做的第一次 「全栈公开」, 7B 主 checkpoint 训到 2.46T token, 预训练语料是同队的 Dolma, 对齐借 TÜLU 2 的 SFT → DPO 配方."
---
# OLMo: 全栈公开的 7B Dense 起点

来源: [OLMo: Accelerating the Science of Language Models](https://arxiv.org/abs/2402.00838) (arXiv:2402.00838v4, 2024-06-07), 21 页. 数字以同目录 `olmo-1.md` 的表图为准, 对照译稿见 `olmo-1-bi.md`. 后续几代的解析: [OLMo 2](../olmo-2/olmo-2-analysis.md), [Olmo 3](../olmo-3/olmo-3-analysis.md), [Olmo Hybrid](../olmo-hybrid/olmo-hybrid-analysis.md).

一句话身份: OLMo 是 Allen AI 在 1B 与 7B 两档 Dense decoder-only 上做的第一次 「全栈公开」, 7B 主 checkpoint 训到 2.46T token, 预训练语料是同队的 **Dolma**, 对齐借 **TÜLU 2** 的 **SFT → DPO** 配方. 它在能力上瞄准 Llama 2 7B, 在开放度上瞄准 Pythia 与 BLOOM, 两头都要. Table 3 八项均值 69.3, 离 Llama 2 7B 的 70.5 差 1.2 分; 公开清单则从权重一直列到数据顺序与评测代码.

模型是数据, 架构, 优化器, 硬件, 评测和对齐一起做出来的, OLMo 的每个选择都在几条线之间互相牵制. 比如 Dolma 里网页占比高, 就直接写进了 Paloma 各域的 bits per byte; 学习率收尾的方式, 又写进了八项下游曲线的最后一格. 机制背景可对照: [RoPE 本体](../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/01-RoPE本体-旋转位置编码/01-RoPE本体-旋转位置编码.md), [GLU 到 SwiGLU](../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-激活函数/02-GLU家族-从GLU到SwiGLU/02-GLU家族-从GLU到SwiGLU.md), [归一化层](../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.2-归一化层/2.1.2-归一化层.md), [分词器](../../../llm-guide/3-预训练/3.2-分词器与Tokenizer/3.2-分词器与Tokenizer.md), [BF16 混合精度](../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.2-混合精度训练/01-浮点数基础与BF16混合精度训练/01-浮点数基础与BF16混合精度训练.md), [AdamW](../../../llm-guide/6-训练与推理优化/6.5-优化器/6.5.1-优化器综述-从SGD到AdamW/6.5.1-优化器综述-从SGD到AdamW.md), [困惑度](../../../llm-guide/3-预训练/3.6-预训练评估/3.6.1-困惑度-PPL/3.6.1-困惑度-PPL.md), [Scaling Law](../../../llm-guide/3-预训练/3.3-模型配置与Scaling-Laws/3.3.2-Scaling-Laws/3.3.2-Scaling-Laws.md), [SFT](../../../llm-guide/4-后训练/4.2-SFT/4.2-SFT.md), [DPO](../../../llm-guide/4-后训练/4.6-偏好优化/4.6.1-离线偏好优化/01-DPO/01-DPO.md).

## 1. 定位与架构

### 1.1. 谱系坐标: 开放度排成一条线, OLMo 站在最右端

Introduction 把 2023 年前后的发布按开放程度排了一遍: Mixtral 8x7B 给权重加一份短报告, LLaMA 给了详细的适配说明, Mosaic 的 MPT 公开了数据分布但没放数据本身, Falcon 放了部分预训练数据, Pythia 与 BLOOM 最开放, 训练代码, checkpoint 和数据都给. OLMo 把自己放在这条线的最右端, 并点名 LLM360 目标相近. 它的增量有两处: 一是把 「完全开放」 这一侧的能力往 Llama 2 推, Table 3 里 OLMo-7B 均值 69.3, 同为全开放的 Pythia 6.9B 是 63.0, RPJ-INCITE-7B 是 66.6; 二是评测本身也进了公开范围, **Catwalk**, **Paloma** 与 **TÜLU** 评测套件都放出来, 别人拿到的是整条流水线.

Section 5 的发布清单可以按 「能回答什么问题」 来读. 权重侧有 7B, 7B-twin-2T, 1B 终局权重, 每个都附 500+ 个按 1000 step 间隔保存的中间 checkpoint; 数据侧有完整 Dolma, 生成它的代码, **WIMBD** 数据分析工具, 以及能重建 「第 k 步 batch 里有哪些文档」 的工具; 评测侧有 Catwalk 与 Paloma; 适配侧有 Open Instruct 与 OLMo+SFT, OLMo+SFT+DPO 两个模型. 许可是 Apache 2.0. 研究数据与能力因果的人, 第一需要的是中间 checkpoint 和数据顺序; 只想部署聊天的人, 第一需要的是 Table 4 的适配结果. 两类用途依赖同一份发布清单中的不同材料.

7B 档不止一个模型, 这一点常被略过. Introduction 写 7B 放了四个变体, 分别对应不同的架构, 优化器和训练硬件, 全部至少训到 2T token; Section 5 里点名的 7B-twin-2T 就是其中之一. 对只看排行榜的人, 多出的变体只是噪声; 对做训练研究的人, 这是一组现成的对照组, 同一套数据顺序下换硬件或换设定, 终点差多少可以直接比. 报告正文没有逐个展开这几个变体的消融结论, 只在 §3.4 用 LUMI 与 MosaicML 两条曲线在 2T 处几乎重合, 说明硬件这一维的差别可以忽略.

这种定位也决定了报告的写法. 它几乎不推新的 Scaling 公式, Figure 2 里的 Scaling 只是经验对照: 同量级模型随训练 token 增加, bits per byte 大体同向下降. 真正的交付是可复现材料的厚度. 社区当时对 OLMo 的常见概括是 「权重, 代码, 数据, 评测, 指令微调五样都开」, 这个概括和 Section 5 的四栏清单能一一对上, 没有夸大.

### 1.2. 吞吐, 稳定与 「最安全」: 一组互相牵制的默认值

Section 2.1 开头写了选超参的原则: 在自己的硬件上优化吞吐, 同时压低 loss spike 与慢发散的风险, 用训练环内评测做消融. 这条原则同时约束了架构, 优化器和硬件, 所以五项架构改动要和它一起读. **去掉全部 bias** 与 **non-parametric layer norm** (LayerNorm 里不带可学的 gain 与 bias) 被归到稳定性一侧, 作者说无参 LN 是比带参 LN 和 **RMSNorm** 都 「更安全也更快」 的选项; **SwiGLU** 隐宽取约 $(8/3)d$ 再上取到 128 的倍数 (7B 为 11008, 门控使输入维实为 2 × 11008 = 22016), 词表 50280 补到 50304 行 embedding, 这两处都是为吞吐凑整数. **RoPE** 替换绝对位置编码, 和 LLaMA, PaLM 一致.

把这五项放到 Table 5 的同尺度对照里, 分叉点就清楚了. **SwiGLU**, **RoPE**, 无 bias 与 LLaMA2 一致, sequential block 也与 LLaMA2 相同 (Falcon 与 PaLM 用 parallel block). 真正分开的是两处: LLaMA2 用 **RMSNorm** 与 **GQA**, OLMo-7B 用无参 LN 与 full attention; 学习率日程上 LLaMA2 用 cosine, OLMo 用 linear; 序列长 LLaMA2 为 4096, OLMo 为 2048. 所以 OLMo-7B 不是 LLaMA 的复刻, 是在同一代 Dense 7B 配方里挑了更保守的归一化, 注意力留在最朴素的形态, 上下文也更短. 这些选择都不是稀疏路线, 报告里没有 MoE, 也没有 **GQA** 之类的 KV 压缩.

Table 5 另外三列把同代的设计空间摊得更开. OpenLM-7B 与 OLMo 最接近, 同为 full attention, sequential block, SwiGLU, 区别在于用带参 LN 且只在 LN 里保留 bias, 日程用 cosine. Falcon-7B 走得最远: 隐维 4544, 71 个头, MQA, parallel block, GeLU, MLP 倍率 4, 峰值 LR 6.0E-04, β 取 (0.99, 0.999), 梯度 all-reduce 用 BF16. PaLM-8B 同样用 MQA 与 parallel block, 并共享输入输出 embedding, 全局 batch 只有约 1M token. 在 「吞吐与稳定性」 能互换的每一处, 例如注意力是否共享 KV, 梯度规约用什么精度, OLMo 都选了偏稳的一侧, 这与 §2.1 的选参原则一致.

三种归一化差在哪, 写成式子最清楚. 设子层输入为 $\boldsymbol{x}\in\mathbb{R}^d$, 各维均值 $\mu$, 方差 $\sigma^2$: 带参 LN 是 $\boldsymbol{\gamma}\odot\frac{\boldsymbol{x}-\mu}{\sqrt{\sigma^2+\epsilon}}+\boldsymbol{\beta}$; OLMo 用的无参 LN 去掉 $\boldsymbol{\gamma}$ 与 $\boldsymbol{\beta}$, 只剩 $\frac{\boldsymbol{x}-\mu}{\sqrt{\sigma^2+\epsilon}}$; RMSNorm 不减均值, 写作 $\boldsymbol{g}\odot\boldsymbol{x}/\sqrt{\frac1d\sum_i x_i^2+\epsilon}$. 无参 LN 于是没有一个可学参数, 每次归一化后的输出都被固定在零均值, 单位方差上, 各维该放大还是缩小, 只能交给紧接着的线性层去学; RMSNorm 则每维保留一个增益 $\boldsymbol{g}$. 这也和 「去掉全部 bias」 是一路做法: 两者都在减少不参与矩阵乘的零散参数.

关于无参 LN, 后一代给了一个事后注脚. OLMo 2 报告 §3.3.2 写, 早期用无参 LN 一半是为了性能, 一半是为了绕开当时所用库的 bug; 到 OLMo 2 时 bug 已不存在, 硬件也更快, 消融显示两者没有差别, 于是换回 RMSNorm. 这说明 OLMo 1 的 「最安全」 带着当时工具链的约束, 不是一个被证明更优的归一化方案. 读 OLMo 1 的架构节, 最好把 「为能力服务的归纳偏置」 (RoPE, SwiGLU, 无 bias) 和 「为吞吐与工具链服务的约束」 (128 对齐, 无参 LN) 分开.

优化器与架构共用同一条稳定性原则. Table 1 两档都用 **AdamW**, β=(0.9, 0.95), ε=1.0E-5; warmup 后按全局 ℓ2 范数把梯度裁到 1.0; Table 5 里梯度 all-reduce 与优化器状态都是 FP32, weight decay 0.1. ε 这个数在下一代也被改掉: OLMo 2 Figure 9 显示把 ε 降到 1e-8 后早期梯度范数更低更稳. 回看 OLMo 1, 1.0E-5 是当时 LLaMA 系沿用的数, 报告没有对 ε 做消融.

序列长 2048 也是几条线的交点. 它比同期 LLaMA2 的 4096 短一半, full attention 的二次成本和激活显存因此更低; §3.1 写 7B 上每 GPU micro-batch 为 4096 token, 心算即每卡一次只放 2 条 2048 长的样本. 在 MI250X 每个逻辑设备 64GB, A100 只有 40GB 的条件下, 这个长度让两套集群都能用同一份配置跑. 代价落在能力侧: RoPE 只在 2048 以内训练过, 报告没有做任何更长上下文的评测, 下一代 OLMo-0424 才把长度提到 4096.

两档配置之间还有分档差异. **weight tying** 在 1B 为 yes, 7B 为 no; 1B 为 L=16, D=2048, H=16, 峰值 LR 4.0E-4; 7B 为 L=32, H=32, 峰值 LR 3.0E-4. 隐维在 Table 1 写 D=4086, 附录 Table 5 写 4096, 两处分属主文与附录, 引用时带表号即可. warmup 也有类似情况: Table 1 里 1B 写 2000 steps, §3.2 正文写 「所有尺寸都 warmup 5000 steps (约 21B token)」, 源文两处并存.

## 2. 数据与评测

### 2.1. 从 Dolma 到一个 batch: 2.46T token 怎样流进优化器

Dolma 的构建顺序是: 语言过滤, 质量过滤, 内容过滤, 去重, 多源混合, 分词, 各源在策展与发布时都分开保存. Table 2 给出六源: Common Crawl 2180B token (9812 GB, 3734M 文档), GitHub 342B, Reddit 80B, Semantic Scholar 57B, Project Gutenberg 5.2B, Wikipedia 3.7B, 合计 2668B token, 11519 GB, 4367M 文档, token 数按 GPT-NeoX 分词器计. 分词器本身也和数据管道咬合: 它是在 GPT-NeoX-20B BPE 上加了 PII 掩码 token 的改版, Dolma 里被遮蔽的个人信息, 在词表里有对应的占位 token.

进入优化器的并不是全库. §3.3 写训练集是从 Dolma 抽出的 2T token 样本, **每篇文档末尾加 EOS 后首尾拼接**, 再切成 2048 token 的训练实例, **每个 run 的打乱顺序完全一致**, 所以 batch 组成可以从发布物重建. 全部放出的模型至少训完 2T (单 epoch), 部分进入第二 epoch 并换打乱顺序, 作者引用 Muennighoff et al. (2023) 认为少量重复的影响可以忽略. 拼接时是否做文档内注意力掩码, 这份报告没有写; 到 Olmo 3 的长上下文阶段, 文档内掩码才作为配方的一项被单独消融.

CC 占比有两个口径. 用 Table 2 心算, 2180 / 2668 ≈ 81.7%, 这是 Dolma 全库的组成; §4.2 与 Figure 2 题注写的 88.8% 是训练实际用到的混合. 两者差约 7 个百分点, 说明训练样本比全库更偏网页. 报告只给了结果比例, 没有给各源的采样权重, 所以只能说 「训练混合比全库更偏 CC」, 不能反推每个源被上采样或下采样了多少.

Table 2 的文档数与字节数还能算出各源的形状, 它们和 2048 的切块方式直接相关. 平均每篇文档的 token 数: Common Crawl 约 584, Reddit 约 212, Semantic Scholar 约 1470, Wikipedia 约 600, Project Gutenberg 约 9.3 万 (心算, 按 token / 文档数). 于是一条 2048 长的训练样本里, 通常拼着三四篇网页或近十条 Reddit 帖子, 而一本书会被切成约 45 条样本. 每 token 对应的字节数也不同: 代码约 3.0, 网页约 4.5, 论文约 4.7 (心算, 按字节数 / token 数), 代码更碎, 同样字节要花更多 token. 这些形状差异既影响模型在一条样本里能看到多长的连贯上下文, 也解释了第 2.2 节里短文档源 bits per byte 偏高的现象.

「各源分开保存」 这条规矩看上去只是整理习惯, 其实是给后续研究留的接口. Dolma 的六个源在策展和发布时都不合并, 数据配方研究就可以按源增删, 再用环内评测看信号; Dolma 自己的报告正是用中间状态的语料训小模型, 讨论内容过滤, 质量过滤, 去重与多源混合各自的作用. OLMo 这份报告把这些实验结论交给 Dolma 报告, 自己只交代最终配方, 因此去重前后的量化差异需要结合 Dolma 报告与 WIMBD 的语料检查结果判断.

数据怎样流过硬件, 由 §3.1 与 §3.4 决定. 并行用 **ZeRO** 策略, 经 PyTorch **FSDP** 切分权重与优化器状态, 7B 上每 GPU micro-batch 4096 token; 全局 batch 恒约 4M token (2048 条 × 2048). 混合精度走 PyTorch amp: softmax 等算子保持全精度, 其余用 bfloat16; 各 GPU 本地的分片权重与优化器状态为全精度, 前反向物化整块参数时才转 bf16, 梯度以全精度规约. 硬件有两套: LUMI 最多 256 节点, 每节点 4 张 MI250X (双芯模块, 逻辑上 8 个设备); MosaicML 27 节点, 每节点 8 张 A100-40GB. 两边训到 2T 时评测几乎重合, 作者用它证明代码在 AMD 与 NVIDIA 上都能跑. 数据顺序固定, 加上双集群互证, 共同撑起了 「可复现」 这个说法.

batch 的数字在源文里有两处. §3.1 写全局 batch 约 4M token, 即 2048 条 × 2048; 附录 Table 5 的 OLMo-7B 一列写 2160 条, 心算约 4.42M token. §3.4 又说两套集群 「为优化吞吐, batch 略有不同」, 两处数字很可能分别对应两次运行, 报告没有明说哪个数属于哪个集群. 这会影响 「按步号重建 batch」 的用法: batch 大小不同, 同一步号对应的累计 token 数也不同, 要重建第 k 步看到的文档, 先得确认是哪一次运行的 checkpoint (由两处数字推出).

### 2.2. 88.8% 网页比例在困惑度曲线上的回声

内禀评测用 **Paloma** 的 11 个源, 去掉了不可公开, 含边缘或有毒文本, 以及代码且无法按 Paloma 方法去污染的源; 指标是 **bits per byte**, 让不同词表的模型可比. OLMo-7B 被报告称为 「对困惑度评测做了显式去污染的最大模型」: 预训练文档中若有段落泄漏自 Paloma 评测集, 整篇剔除. 没做去污染的模型, 困惑度可能被低估, 也就是样本外拟合被高估. **这是数据管道与评测设计之间的直接接口**, 数据侧多做一步, 评测侧的数才站得住.

为什么用 bits per byte 而不是每 token 困惑度, 也和分词器有关. OLMo 的词表是 50280, Llama 2 是另一套 BPE, 同一段文本切出的 token 数不同, 每 token 的 loss 不能直接比; 把总 loss 折算到原始字节上, 词表差异就被消掉了. 按通常的定义写作 $\mathrm{BPB}=\frac{1}{N_{\text{bytes}}\ln 2}\sum_{t=1}^{N_{\text{tokens}}}-\ln p(x_t\mid x_{<t})$: 分子是整段文本按 token 累加的负对数似然, 除以 $\ln 2$ 换成比特, 再除以原文的字节数. 同一段文本, 词表大的模型切出的 token 少, 每个 token 的 loss 高, 只有两者相乘的总量才对应整段文本; 按 token 平均会偏向切得碎的分词器, 按字节平均只看原文, 所以可以跨词表比. Paloma 本身覆盖 585 个文本域, 来自 18 个数据源, 按分层抽样让小域也有足够权重, 所以它能看出 「网页域强, 百科与论文域弱」 这种分布差异, 单一验证集做不到这一点.

Figure 2 的分源曲线把数据配方写得很清楚. OLMo 在 C4 这类 CC 主导的集合上更占便宜, 甚至超过全部对照; 在 WikiText-103, M2D2 S2ORC / Wikipedia, 以及 CC 占比低的 RedPajama 上样本效率偏弱. §4.2 把这归到非 CC 比例: MPT 27%, LLaMA 18%, RedPajama 12.2%, OLMo 11.2%, 非 CC 最少的 OLMo 在 C4 上最强. MPT-7B 在总图上最靠前, 作者猜测和它非 CC 比例更高, 以及 semantic deduplication 等预处理有关. 附录 Figure 3 里还有一个方向相反的同类现象: Pythia-6.9B 训练 token 比 OLMo 少近一个数量级, 却在 Pile 上最好, 因为它就是在 Pile 上训的.

代码域的读法需要多一层小心. Dolma 100 Programming Languages 上 OLMo 明显领先, 作者提醒可能低估了代码污染, 同时指出同样训过 GitHub 的 RPJ-INCITE 仍差一截, 说明 「同一套后处理产生的分布内效应」 也在起作用. GitHub 342B 在 Table 2 里是第二大源, 但离 CC 的 2180B 很远, 代码域的优势更可能来自后处理一致, 而不是代码 token 量大.

附录 C 还提醒, 其余 5 个面向特定社群的源要谨慎解读. Paloma 发现这些源上的困惑度常被文档平均长度这类表面特征主导, 而不反映模型对该社群语言的真实拟合: TwitterAAE 与 Gab 的文档在 Paloma 里最短, 所以 bits per byte 异常偏高; 除这两者外, ICE, Manosphere 与 4chan 上各模型沿数据 Scaling 趋势挤得很紧, 拉不开差距. 这说明 **bits per byte 虽然消掉了词表差异, 却消不掉文档长度的影响**, 短文档缺少上文, 每个字节都更难预测. 用 Paloma 比较模型时, 分源曲线比总平均更可靠, 短文档源又比长文档源更需要打折扣.

中间 checkpoint 让这张图多了一个维度. Figure 2 里能画出中间虚线的只有 Pythia-6.9B, RPJ-INCITE-7B 与 OLMo-7B 三家, 其余模型只能以终点出现. 作者同时提醒, 曲线陡度受该点落在学习率日程何处影响, 训得更短的模型曲线往往更陡, 不等于固定训程下更省样本. 所以读这张 Scaling 图要拆成三件事: 数据配方是否匹配评测域, 学习率走到了哪一段, 评测集有没有被去污染. 三件事都依赖发布物, 这正是全栈公开在评测上的用处.

### 2.3. 学习率收尾与八项下游: 日程怎样写进评测曲线

主日程见 §3.2: warmup 后从峰值 linear 降到峰值的 1/10, Table 5 的 minimum LR 3.0E-05 对应这一终点, 是 3.0E-04 的十分之一, 不是 0. Section 4 开头又加了一段: 已训到 2.46T 的 checkpoint 在 Dolma 上再跑 1000 step, LR 从主日程终点线性收到 0, 作者称这同时改善了困惑度和下游任务. Figure 1 的八条曲线里, 末端相对倒数第二个点有明显跳升 (读图), 作者把它归于这最后 1000 step. 本文没有做 linear 与 cosine 的受控消融, **能确认的只是 「末段收到 0 有帮助」, 不能推出 linear 本身更好**.

这 1000 step 在家族谱系里有后续. OLMo 2 把 「学习率收到 0」 与 「换一批高质量数据」 合并成独立的 mid-training 阶段, 用 Dolmino 数据退火 50B 到 300B token, 再做权重平均; Olmo 3 又把这一段扩成 100B 的 Dolmino Mix, 并加上长上下文扩展. 在 OLMo 1 里, 收尾只换了学习率, 数据仍是同一个 Dolma, 这是后来退火阶段最早的形态.

下游八项的选择也和训练过程绑在一起. §2.4 写这些任务在开发初期就定下, 理由是都能写成文本补全打分, 且在整个训练过程中给出稳定信号; 训练环内每 1000 step (约 4B token) 评一次, 用来决定架构, 初始化, 优化器, 日程与数据混合. 打分方式是 rank classification: 每个候选答案 $c$ 接在题目 $x$ 后面算似然, 取得分最高的当预测. 得分有几种归一: 不归一就是 $\log P(c\mid x)$; per-token 是 $\frac{1}{|c|}\log P(c\mid x)$, $|c|$ 为候选的 token 数, 免得长选项因为连乘项多而吃亏; per-character 按字符数除; unconditional 减去候选在无信息前缀下的似然, 即 $\log P(c\mid x)-\log P(c\mid x_0)$, 扣掉 「这个答案本身就常见」 的先验, $x_0$ 用什么前缀报告没写. OLMo 按任务分开选: arc 与 openbookqa 用 unconditional, hellaswag / piqa / winogrande 用 per-token, boolq / sciq 不归一化, 因为它们被写成单 token 预测, 候选长度相同, 除不除都一样. 前两组的分法可以按题型理解, arc 与 openbookqa 的选项多是短实体或短语, 常见词天然似然高, 另三项的选项是长短不一的句子续写 (报告只写了分配). 附录另六项 (headqa_en 等) 在 Figure 4 上噪声很大, 有的接近随机基线, 作者明确说不要当主信号. **评测集是按 「训练中能不能给信号」 挑出来的**, 这是开发工具, 不只是排行榜.

附加六项的 Table 7 正好示范了信号差的任务会怎样误导. OLMo-7B 六项均值 47.5, 是七个模型里最高的, RPJ-INCITE-7B 47.3, LLaMA2-7B 46.5, Falcon-7B 最低为 45.4, 七家挤在 2.1 分以内. 细看单格, wic 上各家都在 48–55 之间, OLMo 为 50.2, 接近二分类的随机水平; mrpc 上模型容易总是预测同一个标签, 类别不平衡会把分数抬高或压低; wnli 上 OLMo 56.3, Pythia 只有 38.0, 波动远大于能力差. 作者明确提醒不要在训练过程中或模型之间过度依赖这些任务. 「OLMo 在附加任务上均值第一」 这句话在表里成立, 但几乎不携带信息.

环内评测和线性日程叠在一起, 读早期信号时要多想一步. 线性衰减意味着训练中段的学习率仍然偏高, 下游分数的抬升一部分来自学到新东西, 一部分会在学习率降下来以后才兑现; Figure 1 末段那一跳就是后者的例子. 因此用环内评测比较两个设定时, 只有在同一日程的同一位置上比才公平, 拿一个刚 warmup 完的 run 和一个快收尾的 run 比, 结论会偏. 报告把 「决定架构与数据混合」 的职能交给环内评测, 但没有公开这些中途决策各自依据的曲线, 这一面因此没有.

Table 3 的单格值得看细. OLMo-7B 八项为 48.5 / 65.4 / 73.4 / 76.4 / 50.4 / 78.4 / 93.8 / 67.9, 均值 69.3; Llama 2 7B 70.5, Falcon-7B 70.3, MPT-7B 69.8. arc_challenge 与 Llama 2 同为 48.5, arc_easy 65.4 却明显低于 Llama 2 的 69.5 与 Falcon 的 70.4; piqa 78.4 贴近 Falcon 的 78.5, 高于 Llama 2 的 76.7. 均值接近不代表每格同构. 1B 档均值 60.4, 高于 Pythia 1B 的 54.5 与 TinyLlama 1.1B 的 59.4, 低于 StableLM 1.6B 的 66.5; 作者注明后者参数更多且训练数据未知, 这一行只适合当参照上限.

1B 与 7B 的设定并不一致, 横着比两档时要先扣掉差别: 1B 训 2T token 并共享输入输出 embedding, 7B 训 2.46T 且不共享, 峰值学习率也不同. 所以 「从 1B 到 7B 均值涨了 8.9 分」 (心算 69.3 − 60.4) 混合了参数量, 训练量和 tying 三个因素, 不能读成单纯的参数 Scaling. 报告没有给同设定下的规模扫描, 这类曲线要到 OLMo 2 的 1B 附录与 Olmo Hybrid 的 60M 到 1B 受控实验里才有.

## 3. 对齐, 成本与后续

### 3.1. 借来的对齐配方: TÜLU 2 在非 Llama 底座上的得失

适配走 **TÜLU 2** 的两段式. 附录 D: **SFT** 学习率 2×10⁻⁶, 3 epoch, 前 3% warmup 后线性降到 0, weight decay 与梯度裁剪都是 0, 最长 2048, 数据是改过的 TÜLU V2 SFT mix, 长对话切成 2048 的段, 硬编码片段换成关于 OLMo 的说明. **DPO** 学习率 5×10⁻⁷, β=0.1, 3 epoch, warmup 10%, 数据是去掉 TruthfulQA 提示的 UltraFeedback 修正版. 最长序列与预训练上下文对齐在 2048, 这份配方里没有奖励模型, 也没有在线 RL.

数据上的几处小手术都在防评测串味. SFT 数据替换掉硬编码的身份片段, 避免模型自称别家模型; DPO 数据去掉 TruthfulQA 的提示, 因为 TruthfulQA 正是 Table 4 的评测之一. 这类处理说明作者把 「训练集和评测集是否重叠」 从预训练 (Paloma 去污染) 一直管到了适配阶段. 局限节同时承认, 适配数据大量蒸馏自其他模型, 希望以后减少这种依赖; OLMo 2 把偏好数据的生成池限定在许可允许的模型上, 就是沿这个方向往前走了一步.

Table 4 显示两段各管一摊. base 的 MMLU 0-shot 28.3, ToxiGen 毒性 81.4%, TruthfulQA 真实且有信息 31.6%; **SFT** 后变为 47.3 / 14.4 / 41.2, AlpacaEval 胜率 57.0; 再 **DPO** 后为 46.2 / 1.7 / 52.0, AlpacaEval 69.3. **毒性的大头在 SFT 阶段降下来**, DPO 把剩下的几乎压到零; 真实性与聊天胜率在 DPO 阶段涨得最多; MMLU 相对纯 SFT 回落 1.1 分. 附录 Table 8 把代价摊得更开: GSM8k 8-shot CoT 从 base 8.5 升到 SFT 的 15.5, DPO 后回落到 11.0; BBH 3-shot CoT 36.9 → 35.8; TydiQA 35.2 → 21.7. 同一步偏好对齐, 安全与聊天变好, 数学与多语问答回吐了一部分.

放到同表的官方对话模型里, OLMo+SFT+DPO 的位置更清楚. MPT Chat 为 MMLU 33.8, AlpacaEval 46.8, 毒性 0.1%, TruthfulQA 42.7; Falcon Instruct 为 25.2 / 14.0 / 70.7 / 27.2; RPJ-INCITE Chat 为 27.0 / 38.0 / 46.4 / 53.0. 在公开了预训练数据的这几家里, OLMo 的 MMLU 与聊天胜率最高, 毒性仅高于 MPT Chat. Llama-2-Chat 是另一种取舍: 毒性 0.0%, AlpacaEval 87.3, TruthfulQA 却只有 26.3, 远低于 OLMo 的 52.0. 对齐把哪一项压到极致, 往往就在另一项上付出代价, 单看一列会得出相反的结论. TÜLU 2 的 TruthfulQA 因测试集污染没有报告 (脚注 7), 这一列 OLMo 找不到同配方的对照.

和同表的 TÜLU 2+DPO (Llama 2 底座, MMLU 50.7, AlpacaEval 85.1) 比仍有缺口. 作者给了两个解释: Llama 2 可能有 MMLU 污染; TÜLU 配方原本为 Llama 族设计, 可能没对准 OLMo 自己的强弱项. 文中没有做换配方的对照实验, 这两个解释目前停在假设. 后一代的做法恰好回应了第二点: OLMo 2 沿用 Tulu 3 骨架, 但收紧许可, 重扫 SFT 与 DPO 超参, 再接可验证奖励的 RL, 等于承认 「直接搬 Llama 的配方」 不够.

评测协议决定了这些数能不能与外部横比. 附录 E: ToxiGen 只用原版仇恨提示, 每组 500 条, 由 toxigen RoBERTa 判毒; TruthfulQA 因 GPT-3 弃用, 改用两个基于 LLaMA 2 的判定器; AlpacaEval 是 GPT-4 判对 Davinci-003 的胜率. Table 4 与 Table 8 里 OLMo+SFT+DPO 的 MMLU 分别写 46.2 与 46.1, 两处分属正文和附录, 各带表号引用即可.

### 3.2. 成本, 局限与报告没有的东西

附录 B 的测量方法是: 单节点每 25ms 采一次功耗, 取全程均值乘以节点数, 再乘 PUE 1.1. Table 6 两行合计 135 + 104 = 239 MWh, 与正文 239 MWh 一致. A100-40GB 在澳大利亚训练, 碳强度取 0.610, 心算 104 × 1.1 × 0.610 ≈ 69.8, 对应表中 70 tCO₂eq 与正文 69.78; MI250X 在 LUMI, 按官方水电碳强度 0 记, 若按 0.024 计则为 3.54 tCO₂eq. 作者强调这是**运行期下界**, 制造, 调试, 调参, 宕机都没算进去. 同表 LLaMA-7B 14, LLaMA2-7B 31, 各自的功耗与碳强度假设不同, 不宜当精确排名.

239 MWh 这个总数还要拆开读. 附录 B 写的是 「预训练我们的 7B 模型们」 共耗 239 MWh, 两行分别对应 A100 上训练的模型与 MI250X 上训练的模型, 也就是两次 7B 运行的合计. 单次运行是 104 或 135 MWh, 与同表 LLaMA2-7B 的 74 MWh 同一量级 (后者训 2T token, 用 A100-80GB). 两套硬件跑同一配方, 能耗相差约 30% (心算 135 / 104), 报告没有拆出这部分差距来自芯片效率, 训练时长还是 batch 设置, 所以不能据此判断 MI250X 与 A100 谁更省电. 电网选址的影响则一目了然: 功耗更高的 LUMI 一行按官方口径排放为 0, 澳大利亚那一行贡献了全部 70 吨.

报告没有直接给训练 FLOPs. 按常用的 $C \approx 6ND$ 粗算, 取名义参数 7B 与 2.46T token, 约为 1.0×10²³ FLOPs (参数量取名义值, 没有扣掉 embedding). OLMo 2 报告 Table 6 用同一近似给 OLMo 7B 记的正是 1.0(×10²³), 同表 OLMo 2 7B 为 1.8. 能耗侧只有 7B 的数, 1B 的功耗与排放报告没有.

局限节写明: 预训练以英文为主; 数据仍可能残留有毒, 隐私, 版权内容; 适配主要照搬为 Llama 设计的 TÜLU; 自动评测噪声大, 也不等于真实聊天. Ethics 的立场是公开能减少重复预训练的环境成本, 并加速风险研究. 这些边界写清以后, 「Apache 2.0 全家桶」 才落到可追责的发布内容上.

还有几样东西这份报告里没有. 上下文只有 2048, 没有长上下文扩展, 也没有位置外推实验; 注意力是 full attention, 没有 KV 压缩; 没有多语或代码专项评测; 对齐只到 DPO, 没有奖励模型与 RL; 没有 linear 与 cosine, 无参 LN 与 RMSNorm 的消融结果. Conclusion 提到数据与训练更新后 MMLU 提升 24 分到 52%, 那是脚注里的后续博客, 不属于本文任何一张表.

### 3.3. 往后几代从这里改了什么

OLMo 2 报告 Table 1 把 OLMo 1 (0224), OLMo-0424 与 OLMo 2 并排, 正好可以当作这份报告的 「后来怎样」 来读. 保持不变的是无 bias, SwiGLU, decoder-only; 改掉的是 RoPE θ 从 1×10⁴ 到 5×10⁵, QKV 从不处理到 **QK-Norm**, LN 从无参到 **RMSNorm** 并挪到子层输出侧, z-loss 从 0 到 10⁻⁵, embedding 不再做 weight decay. 上下文则在 OLMo-0424 提到 4096. 这些改动几乎都指向训练稳定性, 说明 OLMo 1 在 7B 这一档上能训完, 但放大到 13B / 32B 时, 当初 「最安全」 的一组选择并不够用.

数据与后训练也沿着这份报告留下的接口往前走. 预训练数据从单一 Dolma 换成以 DCLM 为主的 OLMo 2 Mix, 再到 Olmo 3 的 9T 源池与约 6T 训练混合; 末段 1000 step 的学习率收尾, 长成了带专门数据的 mid-training; 对齐从 TÜLU 2 的 SFT → DPO, 长成 Tulu 3 式的 SFT → DPO → RLVR, 再到 Olmo 3 的 Think / Instruct / RL-Zero 分叉. 评测侧, Paloma 的去污染和 「训练中能给信号」 的选任务原则, 在 OLMES 与 OlmoBaseEval 里继续用.

「开放」 的含义也在变宽. OLMo 1 公开的是终局权重, 中间 checkpoint, 数据和代码; OLMo 2 加上了 mid-training 数据与后训练数据, 以及训练日志; Olmo 3 干脆把 「model flow」 当成交付物, 每个阶段的数据, checkpoint 与依赖都列出来, 并额外做了一条从 Base 直接做 RL 的 RL-Zero 线, 专门研究预训练数据怎样影响强化学习. 从这个方向回看, OLMo 1 的中间 checkpoint 与可重建的数据顺序, 是整个家族 「可干预」 路线的第一块基石.

同一把尺子下的差距, OLMo 2 报告 Table 6 已经量过一次. 在 OLMES 子集上, OLMo 7B 均值 38.3, MMLU 28.3, GSM8K 9.2; 同为约 1.0×10²³ FLOPs 的 OLMo 7B 0424 均值 50.7, MMLU 54.3; OLMo 2 7B 用 1.8×10²³ FLOPs 到 62.9, MMLU 63.7. 训练算力相同时 0424 已经多出 12.4 分, 说明**第一代之后的主要进步先来自数据与训练配方, 然后才是算力**.

所以这份报告在谱系里的角色是起点配置: Dense 7B, 序列 2048, full attention, 无参 LN, linear LR 加末段收 0, 高 CC 的 Dolma, TÜLU 2 的 SFT → DPO. 要比较家族内部的进步, 应该在同一套 Catwalk 八项, 同一套 Paloma 去污染口径下重跑, 而不是把不同评测设定的分数直接相减. 这份报告最耐用的部分, 是它让这种重跑成为可能.
