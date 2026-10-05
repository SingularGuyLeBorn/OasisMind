---
title: "DeepSeek-VL 技术解析: 混合视觉编码器与先保语言的多模态预训练"
category: "模型技术报告"
tags: ["DeepSeek", "技术解析", "多模态", "视觉语言模型", "SigLIP"]
published: true
excerpt: "DeepSeek-VL 用 SigLIP $384$ 加 SAM-B $1024$ 的混合编码器把一张图压成 $576$ 个 token, 再让纯文本在联合预训练里占 $70\%$ 来保住语言能力; 1.3B 版只用 SigLIP, 官方代码的 SAM 支路还多一个论文没写的跨层 $\alpha$ 项."
---

# DeepSeek-VL: 混合视觉编码器与先保语言的多模态预训练

DeepSeek-VL 出自 DeepSeek-AI 的技术报告「DeepSeek-VL: Towards Real-World Vision-Language Understanding」(arXiv 2403.05525, v2 发布于 2024-03-11, 正文加附录共 33 页), 开源了 1.3B 和 7B 两档模型, 每档有 base 与 chat 两个版本, 代码与权重在 [deepseek-ai/DeepSeek-VL](https://github.com/deepseek-ai/DeepSeek-VL). 逐段中英对照见 [DeepSeek-VL 对照译稿](./deepseek-vl-bi.md). 文中代码行号均指提交 `681bffb`.

报告把工作拆成数据, 结构, 训练策略三块. 数据侧整理了一份来自真实使用场景的 SFT 分类体系; 结构侧用两个视觉编码器在 $576$ 个 token 内处理 $1024\times1024$ 的图; 训练侧发现直接拿多模态数据续训 LLM 会拖垮语言能力, 于是让纯文本在阶段 2 占七成, 再配上模态预热和模态分组两个做法. 后来的 Janus 系列沿用了 1.3B 版的视觉理解通路, VL2 则在编码器和语言模型两侧都换了方案.

## 1. 混合视觉编码器: 两条支路, 576 个 token

DeepSeek-VL 7B 的视觉侧由 SigLIP-L 和 SAM-B 两个预训练编码器组成. SigLIP-L 吃 $384\times384$ 的图, 负责语义; SAM-B 吃 $1024\times1024$ 的图, 负责细节. 两条支路的输出在空间上都被压到 $24\times24$, 每个空间位置拼成一个视觉 token, 所以高分辨率支路再高, 进入语言模型的始终是 $576$ 个 token.

这套结构只属于 7B. 1.3B 发布配置里的 `vision_config` 是单个 `CLIPVisionTower`, 加载 `siglip_large_patch16_384`, adaptor 是普通的两层 `mlp_gelu`, 没有任何 SAM 组件; Table 4 和 Table 7 的表头也写着 1B 用 SigLIP. 摘要和 3.1 节把混合编码器当作 DeepSeek-VL 的通用结构来写, 读者容易以为两档模型的视觉侧相同.

### 1.1. 单个 SigLIP 的两处短板

CLIP 系编码器 (SigLIP 也在其中) 用图文对比目标训练, 表征偏向能被一句描述概括的语义. Tong et al. (2024) 把视觉上明显不同却被编码成相近向量的图片对称作 CLIP-blind pairs, 这类信息在编码器出口就已经丢了, 下游 LLM 无从补回. 第二处是分辨率. SigLIP-L 的 patch 边长是 $16$, 在 $384$ 输入下得到 $24\times24=576$ 个 patch; 若把输入直接提到 $1024$, patch 数变成 $64\times64=4096$, 一张图就占满 DeepSeek LLM 的 $4096$ 上下文, 何况 SigLIP 的位置编码只在 $384$ 上预训练过.

报告的应对是补一个纯视觉自监督编码器. SAM-B 的图像编码器源自 ViTDet, 在分割任务上预训练, 原生输入就是 $1024\times1024$, 并用窗口注意力控制计算量. 4.4 节在阶段 2 只训 8000 步的设置下比较了四种编码器组合的训练损失, 结果见图 1.

![Image block](images/p22-chart.jpg)

> 图 1: 四种视觉编码器组合在阶段 2 前 8000 步的训练损失曲线, 依次为 CLIP, SigLIP, SigLIP+DINO, SigLIP+SAM (原文 Figure 10).

**图 1 解析.** 四条曲线在前 500 步几乎重合, 从约 $2.7$ 降到 $2.2$; 之后 SigLIP+SAM 一直在最下方, 8000 步时约 $1.82$, 其余三条挤在 $1.92$ 到 $2.0$ 之间. 正文说「加入纯视觉自监督编码器能明显改善训练损失」, 但 SigLIP+DINO 和单 SigLIP 的曲线基本叠在一起, 拉开差距的只有 SigLIP+SAM. 也就是说图里的收益来自 SAM 支路带来的 $1024$ 分辨率, 并不能说明「自监督目标」本身的作用.

这张图还有两处需要读者自己补的口径. 第一, 纵轴是语言模型在混合数据上的训练损失, 其中七成是纯文本 token, 视觉编码器的差异只作用在三成多模态样本上, 曲线差 $0.1$ 对应多模态样本上的差距会更大. 第二, 文中没有给出这四个设置在下游基准上的分数, 训练损失低不等于评测高, 4.4 节没有补这一组下游对比.

### 1.2. 数据流与形状

图像进入模型前先经过 `image_processing_vlm.py`: 长边缩放到 $1024$, 再用 ImageNet 均值色把短边补齐成正方形 (`expand2square`). `HybridVisionTower` 对这张 $1024$ 方图执行 `Resize(384)`, 得到低分辨率支路的输入, 两条支路的张量形状如下表.

| 步骤 | 低分辨率支路 SigLIP-L | 高分辨率支路 SAM-B |
| --- | --- | --- |
| 输入 | $384\times384$ | $1024\times1024$ |
| patch 化 | 边长 $16$, 得 $24\times24$ 个, 宽 $1024$ | 边长 $16$, 得 $64\times64$ 个, 宽 $768$ |
| 主干 | 24 层 ViT, 全局注意力 | 12 层 ViT, 窗口 $14$, 第 3, 6, 9, 12 层全局注意力 |
| 出口变换 | 无 | neck 降到 $256$ 通道, 插值到 $96\times96$, 两次 stride $2$ 卷积升到 $512$ 再到 $1024$ |
| 输出 | $576\times1024$ | $24\times24\times1024$, 展平为 $576\times1024$ |

两路输出在同一个空间网格上逐位置对齐, 拼成 $576$ 个 token. 按 3.1 节的写法, 拼接后每个 token $2048$ 维, 经 GeLU 和一层嵌入映射送入 LLM. 代码的顺序略有不同, 放到 2.1 节再看. 这里先算一笔压缩比: SAM-B 主干的 $4096$ 个 patch 经过「插值到 $96$, 再两次减半」变成 $576$ 个位置, 每个位置对应原图约 $42.7\times42.7$ 像素 ($1024/24$), 比 SAM 自己的 $16$ 像素 patch 粗了约 $2.7$ 倍. 插值这一步先把 $64$ 放大到 $96$, 只是为了让两次 stride $2$ 恰好落到 $24$, 与 SigLIP 的网格对齐.

补边带来一个文中没有讨论的代价. 宽高比为 $2:1$ 的文档截图缩放后实际内容只占 $1024\times512$, 另一半是均值色, 对应约 $288$ 个 token 没有信息量; 长条网页截图的浪费更多. 固定 $576$ 个 token 的设计对方图友好, 对文档和网页这两类报告重点宣传的真实场景反而吃亏, VL2 改成按宽高比动态切图, 处理的就是这个问题.

### 1.3. 代码里的跨层 $\alpha$ 项

论文对 SAM-B 支路的描述只有「$64\times64\times256$ 特征图, 插值, 两次卷积」一句, 官方代码多了一条旁路. 见 [`deepseek_vl/models/sam.py` 第 161 到 196 行](https://github.com/deepseek-ai/DeepSeek-VL/blob/681bffb4519856ad27cc17531aacde31ddf6f1a7/deepseek_vl/models/sam.py#L161-L196): 构造函数里直接设 `self.sam_hd = True`, 新建一个初值为零的标量参数 `hd_alpha_downsamples`, 并把 neck 整个深拷贝一份为 `neck_hd`; 前向时把所有全局注意力块 (`window_size == 0`) 的输出收进 `global_features`, 取其中第一个, 即第 3 层 (下标 2) 的输出, 走 `neck_hd`, 插值到 $96\times96$, 再经过与主路共用的 `self.downsamples`, 乘以 $\alpha$ 后加到主路输出上. 写成公式:

$$
F = D\big(\mathrm{Interp}_{96}(N(h_{12}))\big) + \alpha\, D\big(\mathrm{Interp}_{96}(N_{\mathrm{hd}}(h_{3}))\big)
$$

其中 $h_{l}$ 是 SAM-B 第 $l$ 层的输出, $N$ 与 $N_{\mathrm{hd}}$ 是两份结构相同的 neck, $D$ 是共用的两层下采样卷积, $\alpha$ 初值为 $0$. 初值为零保证加载原始 SAM 权重时这条旁路不改变输出, 训练中再由梯度决定浅层特征掺多少进来. 第 3 层只经过两层窗口注意力和一层全局注意力, 保留的是更接近边缘, 笔画的低层信息, 这与报告「SAM 负责细节」的叙述一致, 但论文正文, 消融和附录都没有提到它.

这一项是否真的参与了训练, 要看哪些参数可训. `clip_encoder.py` 里 `freeze_high=False` 时只放开名字含 `downsamples` 或 `neck` 的参数, `hd_alpha_downsamples` 与 `neck_hd` 恰好都命中, 所以只要高分辨率支路的出口层可训, $\alpha$ 就会被更新. 论文 3.1 节把插值和两次卷积算作 VL adaptor 的一部分, 阶段 1 到 3 adaptor 一直在训练, 两者对得上. 发布权重里 $\alpha$ 的取值文中没有给出, 要读权重文件才能确认. Hugging Face transformers 的 `deepseek_vl_hybrid` 移植也保留了这一项 (`high_res_vision_alpha`, 取 `global_attn_indexes[0]` 对应层的隐状态), 说明它是加载官方权重必需的结构. GitHub [issue #19](https://github.com/deepseek-ai/DeepSeek-VL/issues/19) 中有用户指出这条旁路论文里没有消融, 官方没有回应这一追问. 同一文件夹的 `clip_encoder.py` 第 143, 144 行还定义了 `high_layer_norm` 与 `low_layer_norm`, 前向里没有用到, 属于残留代码.

## 2. Adaptor 与语言底座

视觉 token 进入 LLM 之前还要经过 adaptor. DeepSeek-VL 的 adaptor 很小, 7B 版约 $2.1\times10^{7}$ 个参数, 不到语言模型的千分之三. 阶段 1 只训这一层, 能学到的东西有限, 报告把重心放到解冻 LLM 的阶段 2, 原因就在这个比例上.

语言底座是 DeepSeek LLM 的中间 checkpoint, 结构沿用 LLaMA 式的 Pre-Norm, RMSNorm, SwiGLU 与 RoPE, 分词器也相同. 选中间 checkpoint 而不是训完的模型, 是为了让多模态联合预训练接在语言预训练的学习率曲线上继续走, 2.3 节会从超参数上核对这一点.

### 2.1. 混合 MLP: 先分后合

`projector.py` 里 7B 用的是 `low_high_hybrid_split_mlp_gelu`. 设 SAM 支路某位置的特征为 $x_{h}\in\mathbb{R}^{1024}$, SigLIP 支路同一位置为 $x_{l}\in\mathbb{R}^{1024}$, LLM 隐层宽度为 $n=4096$, 它的计算是

$$
z = W_{2}\,\mathrm{GELU}\big([\,W_{h}x_{h}\,;\,W_{l}x_{l}\,]\big),\quad W_{h},W_{l}\in\mathbb{R}^{(n/2)\times1024},\ W_{2}\in\mathbb{R}^{n\times n}
$$

第一层两路各有一套权重, 把各自的特征投到 $2048$ 维, 拼成 $4096$ 维后过 GELU, 第二层共享. 参数量为 $2\times1024\times2048+4096^{2}\approx4.2\times10^{6}+1.68\times10^{7}\approx2.1\times10^{7}$ (偏置忽略). SAM 支路出口的两次下采样卷积另有 $3\times3\times256\times512+3\times3\times512\times1024\approx5.9\times10^{6}$ 个参数, 报告把它们也算作 adaptor. 1.3B 用的是普通两层 `mlp_gelu`, 形状为 $1024\to2048\to2048$, 约 $6.3\times10^{6}$ 个参数.

3.1 节说两路特征拼接后得到「576 个 2048 维 token」, 再经 GeLU 和嵌入层进入 LLM, 这是两路原始 $1024$ 维特征直接拼接的维度, 省掉了各自的第一层投影. 同一节 adaptor 段写的「先用两个单层 MLP 分别处理高低分辨率特征, 拼接后再过一层 MLP」与代码一致, 拼接处实际是 $4096$ 维. 两段正文互相对不上, 读形状时以 adaptor 段和代码为准.

### 2.2. Table 10 的 adaptor 消融

4.4 节 Table 10 比较了两类组合方式. 序列拼接一类为了不让序列翻倍, 先把每路特征沿宽或高方向两两合并 (Token Pooling W/H), 再沿序列方向接起来, 总长仍是 $576$; 嵌入拼接一类保持逐位置对齐, 比较三种 MLP: 两路共享 (Shared), 两路完全独立 (Separate), 以及上面的先分后合 (Hybrid). 平均分依次是 Pooling W $55.5$, Pooling H $54.2$, Hybrid $55.9$, Shared $55.2$, Separate $54.5$.

表里的平均分有个隐藏口径: OCRBench 一列是 $1000$ 分制的原始分 ($291$ 到 $318$), 直接平均会把均值拉到 $90$ 以上. 按 Hybrid 一行核对, $(61.7+60.1+62.9+87.8+56.6+31.3+30.9)/7\approx55.9$, 可见平均时把 OCRBench 除以了 $10$, 表注没有写. 再看差距, Hybrid 只比第二名高 $0.4$, 而 Shared 在 MMB ($62.0$) 和 OCRB ($318$) 两列都比 Hybrid 好, Separate 在 SEED 上最高; 这些都是单次运行, 文中没有给出方差. 还有一个缺口: Tong et al. 推荐的是不做池化, 让序列长度翻倍到 $1152$ 的拼接, Table 10 只测了池化后的版本, 没有测这个上限. Table 10 用的是哪个规模的模型文中没有给出; 它的 MMB ($61.7$) 低于 Table 6 的 1.3B ($64.6$), 又必须带 SAM 支路, 只能是一个没有发布的「1.3B 加混合编码器」实验变体.

### 2.3. 语言底座与两档规模

7B 的语言模型是 30 层, 隐层 $4096$, FFN 中间维度 $11008$, 1.3B 是 24 层, 隐层 $2048$, 16 个头, FFN 中间维度 $5632$, 两者词表都是 $102400$. SwiGLU 的中间维度按 $8/3$ 倍隐层取整: $8/3\times4096\approx10923$, 上取到 $256$ 的倍数得 $11008$; $8/3\times2048\approx5461$, 上取得 $5632$. 对 DeepSeek LLM 结构的展开见 [DeepSeek LLM 技术解析](../deepseek/deepseek-analysis.md).

报告说 1B 底座训练了约 5000 亿文本 token, 7B 底座训练了约 2 万亿, 同时又说选的是中间 checkpoint, 两句放在一起有歧义: 2 万亿是 DeepSeek LLM 7B 完整训练的 token 数, 中间 checkpoint 应当少于这个数. 文中没有给出中间 checkpoint 的位置. 从超参数可以推一个范围: DeepSeek LLM 7B 的 batch 是 $2304$, 序列长 $4096$, 峰值学习率 $4.2\times10^{-4}$, 用多段阶梯调度, 训到 80% token 时降到峰值的 31.6%, 90% 时降到 10%; VL-7B 阶段 2 的 batch 同为 $2304$, 学习率 $4.2\times10^{-5}$ 恰好是峰值的 10%, 调度也是 Step. 2 万亿 token 按每步 $2304\times4096\approx9.4\times10^{6}$ token 约为 $2.1\times10^{5}$ 步, 最后 10% 约 $2.1\times10^{4}$ 步, 而阶段 2 走了 $42000$ 步. 这些数字吻合「从 LLM 进入最后一段学习率之前或之中取 checkpoint, 再用多模态混合数据走完并延长最后一段」的做法, 但这只是两份报告超参数的对照, 报告本身没有这样写. 另外 DeepSeek LLM 报告公开的是 7B 和 67B, 1B 底座没有单独发布, 它的学习率曲线也就无从对照.

## 3. 三阶段训练与模态预热

训练分三段: 阶段 1 只训 adaptor, 阶段 2 解冻 LLM 做视觉语言联合预训练, 阶段 3 做监督微调. 前后两段是 LLaVA 一类模型的常规做法, 报告的新东西集中在阶段 2: 多模态数据怎么混进去才不伤语言能力.

阶段 2 的结论都来自 1.3B 上的实验, 再用到 7B. 1.3B 在这一阶段的生成式指标抖得厉害, 报告为此换了评测口径, 这一点在 3.4 节单独看.

### 3.1. 三个阶段各训什么

![Image block](images/p12-figure-3-our-training-pipelines-consist-of-three-stages.jpg)

> 图 2: 三阶段训练流程, 标出每个阶段冻结与可训的模块和所用数据 (原文 Figure 3).

**图 2 解析.** 图中冰晶表示冻结, 火焰表示可训. 阶段 1 只有 adaptor 可训, 数据是图文对; 阶段 2 adaptor 和 LLM 可训, 数据是图文交错数据加纯语言序列; 阶段 3 三个模块都标了火焰, 数据是视觉对话加纯语言对话. 阶段 3 的画法与题注和 3.2.3 节不一致: 题注说这一阶段训练的是 SigLIP-L, adaptor 和 LLM, 正文说 SAM-B 因显存限制保持冻结, 图上混合编码器整体标为可训.

把 Table 4 的超参数换算成样本和 token 数, 能看清每个阶段的体量. 阶段 1 两档模型都是 $15000$ 步, batch $256$, 共 $3.84\times10^{6}$ 条样本, 与阶段 1 数据量 (ShareGPT4V 125 万对加文档 OCR 250 万对, 合 375 万) 基本相当, 约一个 epoch, 序列长只有 $512$. 阶段 2 开了 sequence packing, 7B 为 $42000\times2304\times4096\approx3.96\times10^{11}$ token, 1.3B 为 $96000\times1024\times4096\approx4.03\times10^{11}$ token, 都是填满时的上限, 两档模型训练量几乎相同. 按纯文本占 70% 算, 7B 在阶段 2 见了约 2770 亿文本 token 和约 1190 亿多模态 token. 阶段 3 为 $10000\times256=2.56\times10^{6}$ 条对话, 不打包. 训练时长方面, 7B 在 64 个节点 (每节点 8 张 A100) 上用了 5 天, 1.3B 在 16 个节点上用了 7 天. 文中没有给出实际 token 数, 以上都是从步数, batch 和序列长度推出的上限.

### 3.2. 语言能力为什么会掉

报告先试了只用多模态数据续训 LLM, 结果多模态指标稳步上升, 语言指标明显下滑. 它给出两个解释: 多模态语料普遍比纯文本简单, 分布差异大; 两种模态在有限容量里互相争夺, 造成语言能力的灾难性遗忘. 对策是在阶段 2 混入大比例纯文本, 图 3 是 1.3B 上五种混合比例的对比.

![Image block](images/p14-figure-4-comparative-performance-results-on-different-modality-fusion.jpg)

> 图 3: 1.3B 模型在阶段 2 用五种「多模态比语言」混合比例训练 16000 步时, 三个多模态基准与三个语言基准的变化 (原文 Figure 4).

**图 3 解析.** 六张子图里信号最清楚的是右下角的 Pile-test 困惑度. 纯多模态 (100:0) 一条从 $2.16$ 一路涨到 $2.245$; 75:25 和 60:40 两条在 $2.17$ 附近走平; 25:75 和 10:90 两条停在 $2.14$ 到 $2.15$. MMLU 和 HellaSwag 的纵轴范围只有一到两个百分点, 曲线噪声比各比例之间的差距还大, 只能看出 100:0 整体偏低. 多模态一侧, 10:90 在 SeedBench 上始终停在 $30$ 左右, 25:75 涨到约 $38$, 60:40, 75:25, 100:0 三条都到 $43$ 到 $45$, 彼此难分. 也就是说多模态数据占到 60% 后, 再加多模态比例已经换不来多模态分数, 只会继续推高 Pile 困惑度.

这张图与最终选择的比例有两处对不上. 第一, 题注写「合适的比例是 multimodal:language=70%:30%」, 正文 3.2.2 节写「语言与多模态约 7:3」, Table 1 里纯文本占 70.0%, 4.4 节模态预热也说语言比例从 1 降到目标值 (例如 0.7); 正文, Table 1, 4.4 节三处一致, 题注把方向写反了. 第二, 按正文的比例, 最终配方对应 multimodal:language $=30:70$, 图中五条曲线没有这一条, 它夹在 25:75 和 60:40 之间, 而这两条在多模态基准上差了约 $5$ 个点. 30:70 的多模态表现落在哪里, 文中没有给出实测. 4.4 节的模态分组和模态预热消融用的又是 60:40. 到了 VL2, 预训练数据改成约 70% 视觉语言数据加 30% 纯文本, 方向正好反过来, 但那时的语言模型已换成 MoE, 两者不能直接对比.

### 3.3. 模态预热与模态分组

模态分组针对的是吞吐. 同一个 batch 里混着纯文本和带图样本时, 一步要等最慢的样本算完, 带图样本还要多跑一遍视觉编码器, 纯文本样本只能陪着等. 分组的做法是每个全局步只采一种模态, 要么全是语言数据, 要么全是多模态数据. 报告说训练效率因此提高 20%, 表现不受影响. 模态预热针对的是训练初期的稳定性: 语言数据比例从 1 开始, 逐步降到目标值 0.7. 降得多快, 按步数还是按 token 线性降, 文中都没有给出.

![Image block](images/p21-chart.jpg)

![Image block](images/p21-chart-2.jpg)

![Image block](images/p21-figure-9-comparative-performance-results-on-language-pile-test.jpg)

> 图 4: 有无模态预热时 Pile-test 困惑度, MMBench 与 MMBench-CN 准确率随训练步数的变化, 三张子图依次排列 (原文 Figure 9).

**图 4 解析.** 预热的效果主要在前 4000 步. Pile-test 上, 有预热一条在 500 步时约 $2.1417$, 无预热约 $2.1485$, 差距在 2000 步后迅速缩小, 约 13000 步时两条曲线交叉, 16000 步时只差约 $0.002$. MMBench 上情况相反, 2500 到 5000 步之间有预热的一条低了 $2$ 到 $3$ 个点 (例如 5000 步时 $39.9$ 对 $42.7$), 这与预热期间多模态数据少是一致的, 8000 步以后两条交替领先. 题注说有预热「在所有任务上始终持平或更好」, 前 5000 步的 MMBench 并不支持这一句.

Figure 8 和 Figure 9 放在一起读还有两个问题. 一是 Figure 8 的题注开头写「Comparative analysis of modality warmup」, 后文和图例比较的却是有无模态分组, 首句与图的内容不符. 二是 Figure 8 中「有分组」的 Pile-test 曲线与 Figure 9 中「无预热」的曲线逐点相同 (500 步约 $2.1485$, 2000 步约 $2.1537$, 16000 步约 $2.166$), 说明两组消融共用了同一次运行: 预热实验是在已经开启分组的基础上做的. 这本身合理, 但报告没有写明, 读者容易把两张图当作四次独立运行. 另外, 分组让 Pile 困惑度也降了约 $0.003$, 报告只把它当作效率手段, 没有解释为什么分组会改善语言建模.

### 3.4. 1.3B 上的评测口径

把实验放到 1.3B 上做, 是为了省算力, 但 1.3B 在阶段 2 的生成式指标波动很大, 无法用来判断改动的好坏. 报告引用 Schaeffer et al. (2024) 关于「度量方式造成能力突变」的讨论, 把原因归到两点: 模型容量小, 阶段 2 又没有 SFT 数据, 模型即使知道答案也不会按格式生成. 对应的两项改动是改用多选 PPL (MCPPL) 评测, 以及在阶段 2 混入极少量 SFT 数据.

MCPPL 的做法是把题干, 图像和全部选项一起输入, 计算每个选项字母位置的困惑度, 取模型最偏好的选项作答, 图 3 和图 4 的多模态纵轴都是这种准确率. 它让指标变平滑了, 代价是测到的是排序能力, 而不是生成能力; 用 1.3B 上 MCPPL 的趋势去指导 7B 生成式评测下的配方, 中间隔着两层迁移. 混入的 SFT 数据占多少, Table 1 里没有这一行 (七行比例合计正好 100%), 文中没有给出. 报告还说 1.3B 上的结论大多能迁移到 7B, 并以「编码器设计」为例, 但发布的 1.3B 不带 SAM, 这里的迁移只能指 2.2 节提到的未发布变体.

## 4. 数据配比

数据分预训练和 SFT 两部分, 分别列在 Table 1 和 Table 2. 两张表都只给比例, 不给绝对量, 也没说明比例是按样本, 按 token 还是按采样概率计的. 结合 Table 4 推出的阶段 2 token 上限, 只能得到各类数据的量级.

报告在数据上强调两点: 预训练覆盖网页截图, PDF, OCR, 图表和教材这类真实场景; SFT 的提示从 GPT-4V 与 Gemini 的公开测试用例整理出分类体系, 再按体系选图写提示. 分类体系同时用来出人工评测题, 这一点在 5.3 节读评测结果时要记着.

### 4.1. 预训练数据: 七成纯文本

| 类别 | 主要来源 | 占比 |
| --- | --- | --- |
| 图文交错 | MMC4, 中英文 Wikipedia, Wikihow, 内部 PDF 与 Epub 教材 | 13.1% |
| 图像描述 | Capsfusion, TaiSu, Detailed Caption | 11.1% |
| 表格与图表 | Chart2text, Geo170K, Ureader 等十余个公开集 | 2.1% |
| Web Code | Websight, GitHub notebook 中的 Python 绘图 | 0.4% |
| 场景文字 OCR | ArT, MLT-17, LSVT 等十个公开集 | 1.2% |
| 文档 OCR | arXiv 渲染的 markdown | 2.1% |
| 纯文本 | DeepSeek LLM 2T 文本语料 | 70.0% |

多模态部分合计 30%, 其中图文交错和图像描述占了 24.2 个百分点, 表格图表, Web Code, 两类 OCR 合起来只有 5.8 个百分点, 约占多模态数据的五分之一. 按 7B 阶段 2 约 1190 亿多模态 token 的上限折算, OCR 与图表类数据约 230 亿 token. 报告的叙述重点却在后者: 2.1 节花了大段篇幅讲 Web Code 的构造 (从 146 万个 Jupyter notebook 中抽取图表和生成代码, 过滤后留下 110 万例, 得到约 200 万对图像与代码) 和文档 OCR 的构造 (140 万篇 arXiv 论文经 Nougat 渲染, 86 万本英文与 18 万本中文电子书, 以及中小学试卷经 HTML 渲染). Table 1 的文档 OCR 一行只列了 arXiv, 电子书和试卷那部分没有出现在表里, 也可能并入了图文交错一行的「内部 PDF 与 Epub」, 文中没有说明.

OCR 类数据比例偏低, 与评测结果对得上. Table 5 中 DeepSeek-VL 7B 的 OCRBench 为 $456$, 比 LLaVA-1.5 13B 的 $331$ 高不少, 但离 GPT-4V 和 Gemini Pro 的 $659$ 还差 $200$ 多分; GitHub issue #19 里也有用户反映实测 OCR 偏弱. $1024$ 分辨率解决的是看得清的问题, 读得准还要靠数据, 而这部分在预训练里只占约 3.3% (两类 OCR 之和).

### 4.2. SFT 数据与分类体系

| 类别 | 主要来源 | 占比 |
| --- | --- | --- |
| 内部数据 | 按分类体系构造的 SFT 数据 | 10.5% |
| 通用多模态 | ShareGPT4V, LAION-GPTV, LVIS-Instruct4V 等 | 35.5% |
| 表格与图表 | Ureader, Geo170K, ScienceQA | 4.1% |
| Web Code | Screen-to-code, ScreenQA | 2.0% |
| 纯文本 SFT | DeepSeek LLM 的对话数据 | 47.9% |

SFT 里纯文本仍占近一半, 与阶段 2 的思路一致. 通用多模态数据大多是 GPT-4V 生成的标注 (ShareGPT4V, LAION-GPTV, LVIS-Instruct4V, textOCR-GPT4V, LLaVA1.6-GPT4V), 内部数据只占 10.5%. 训练时只对回答和特殊 token 计算损失, 系统提示和用户提示都被 mask 掉.

Table 3 的分类体系有识别, 转换, 分析, 常识推理, 逻辑推理, 评估, 多图分析, 安全八个一级类, 下面再分二级和三级类. 人工评测集的 100 道题按同一体系出题, 只用了前七类, 安全类没有进评测. 训练集和评测集出自同一套分类, 题目风格一致, 这对 DeepSeek-VL 有利, 对没有见过这种题型分布的对手不利; 再加上 SFT 数据大量来自 GPT-4V 的输出, 5.3 节让 GPT-4V 当裁判时, 这种同源性会进一步放大.

## 5. 评测口径

评测分三层: 公开多模态基准, 公开语言基准, 自建的人工评测与 GPT-4V 评测. 前两层用公开数据, 但各自的解码方式和指标换算有细节要核对; 第三层的题目和裁判都与训练数据有关联. 关于 VLM 基准各自测什么, 可参考 [VLM 的评测与基准](../../../llm-guide/8-多模态/8.2-视觉语言模型/06-VLM的评测与基准/06-VLM的评测与基准.md).

4.4 节的消融采用另一套设置, 模型规模和训练长度均与发布模型不同, 不能和发布模型的结果直接合并比较.

### 5.1. 公开多模态基准

多模态基准一律用生成式评测, 贪心解码, 再从生成文本中解析答案. MMBench 和 MMBench-CN 用的是 dev 集, 理由是官方测试集下载链接失效. 7B 的主要数字: MMB $73.2$, MMC $72.8$, SEED $70.4$, OCRB $456$, POPE $88.1$, MathVista $36.1$, CMMMU $37.9$. SEED 上 $70.4$ 对 GPT-4V 的 $71.6$ 已经很近, MathVista 则差了 $11.7$ 个点.

「在大量基准上超过多数同等规模开源模型」这句话需要逐列看. MMMU 上 DeepSeek-VL 7B 是 $36.6$, 低于 Yi-VL ($37.8$), CogVLM ($37.3$), Qwen-VL-Chat ($37.0$); MM-Vet 上 $41.5$, 低于 CogVLM ($54.5$), Qwen-VL-Chat ($47.3$), LLaVA-Next 7B ($43.9$), 在同组六个 7B 级模型里排第四. 优势集中在 MMB, MMC, SEED, POPE 这类选择题或判断题基准. 1.3B 一侧, MMB $64.6$ 高于 MobileVLM V2 2.7B 的 $63.2$; MathVista $31.1$ 高于表中的 EMU2-Chat 7B ($30.0$) 和 Yi-VL 6B ($28.0$), 低于另外几个 7B 模型, 「与 7B 开源模型相当」只对其中一部分成立.

### 5.2. 语言基准与缺失的 Pile

Table 7 对比 DeepSeek-VL 7B Chat 与 DeepSeek LLM 7B Chat: HellaSwag $68.4$ 对 $68.5$, MMLU $52.4$ 对 $49.4$, GSM8K $55.0$ 对 $63.0$, MBPP $35.2$ 对 $35.2$, AGIEval $27.8$ 对 $19.3$. HellaSwag 和 MMLU 用困惑度选项评测, GSM8K 和 AGIEval 用生成式评测. 语言能力基本保住, 数学掉了 8 个点, 报告把这归到 7B 容量有限, 两种模态仍在竞争.

这张表有三处要补的口径. 第一, 4.2 节说 Pile-test 用每字节比特数评测, 「结果见 Table 7」, 但 Table 7 只有五行, 没有 Pile; 图 3, 图 4 和 Figure 8 的纵轴标的是「PPL」, 数值在 $2.14$ 到 $2.25$ 之间, 比较像每字节比特数或某种归一化损失, 文中没有给出换算. 第二, 对比双方的训练量不同, VL-7B 在中间 checkpoint 之后又在阶段 2 见了约 2770 亿文本 token, MMLU 和 AGIEval 的提升可能来自这批额外文本, 也可能来自多模态训练, 表中无法区分. 第三, 1B Chat 一列 (HellaSwag $56.0$, MMLU $32.5$, GSM8K $18.0$) 没有同规模的纯语言对照, 看不出 1.3B 掉了多少.

### 5.3. 人工评测与 GPT-4V 评测

人工评测集有 100 道题, 七个类别, 图片来自免版税图库和研究人员自己拍的照片. Figure 6 的分数如下: 总分 InternLM-XComposer2-VL $4.55$, CogVLM $4.65$, DeepSeek-VL $5.65$, GPT-4V $6.3$. 分项上 DeepSeek-VL 在识别 ($7.01$ 对 $7.14$) 和常识推理 ($6.52$ 对 $6.74$) 上与 GPT-4V 接近, 分析一项 ($4.74$) 还高于 GPT-4V ($4.47$); 但转换一项 $6.82$ 对 $7.73$ 差了约 $0.9$, 正文说「接近」有些勉强. 正文没有提的是多图一项: DeepSeek-VL 只有 $3.13$, 是四个模型里最低的, 另两个开源模型都是 $3.75$, GPT-4V 为 $8.13$. 每张图只占 $576$ 个 token, 训练数据里多图样本又少, 这一项弱在意料之中.

![Image block](images/p19-figure-7-gpt-4v-based-evaluation-results-of-deepseek.jpg)

> 图 5: 以 GPT-4V 为裁判, DeepSeek-VL 对四个模型在 99 个样本上的胜, 平, 负计数 (原文 Figure 7).

**图 5 解析.** 四行计数依次是: 对 Fuyu-8B 胜 91, 平 6, 负 2; 对 CogVLM-17B 胜 61, 平 25, 负 13; 对 InternLM-XComposer2-VL 胜 57, 平 29, 负 13; 对 GPT-4V 胜 21, 平 34, 负 44. 每行合计 99, 而人工评测集是 100 道题, 少的一道文中没有说明. 4.3 节说对三个开源模型都在超过 60% 的样本中胜出, 按计数只有前两个成立, 对 InternLM-XComposer2-VL 是 $57/99\approx57.6\%$.

对 GPT-4V 一行更值得细看. 胜 21 负 44, 负场是胜场的两倍多, 正文的说法是「与 GPT-4V 相比也表现出相当出色的水平」. 裁判就是 GPT-4V 本身, 参照的 Zheng et al. (2024) 方法本身就讨论过模型裁判偏好自己输出的问题, 而 DeepSeek-VL 的 SFT 数据又大量来自 GPT-4V 的标注, 回答风格与裁判接近, 对其他三个开源模型的胜率也会因此偏高. 报告没有做交换顺序或人工复核来控制这些偏差.

### 5.4. 阶段与步数消融

Table 9 比较三个阶段的组合: 只有阶段 1 和 3 时均值 $57.4$, 阶段 2 和 3 为 $61.7$, 三段全上为 $62.4$. 阶段 2 贡献了约 $4.3$ 到 $5$ 个点, 阶段 1 在有阶段 2 的前提下只多 $0.7$. 三段全上那一行 (MMB $64.3$, MMC $61.3$, SEED $66.7$, POPE $87.6$, MMMU $32.2$) 除 MMB 外与 Table 6 的 1.3B 逐项相同 (Table 6 的 MMB 为 $64.6$), 可见这组消融在 1.3B 上完成, 表注没有写.

Table 8 把阶段 1 的步数从 2K 增到 80K, 之后直接接阶段 3, 均值依次为 $57.5$, $55.1$, $55.5$, $55.6$, POPE 从 $82.3$ 降到 $78.6$. 报告据此说扩大阶段 1 的数据没有收益, 说明 adaptor 容量有限. 这里有三个对不上的地方: 4.4 节写「Figure 8 所示的结果」, 实际是 Table 8, 3.2.1 节引用的也是 Table 8; 表的变量是训练步数, 按 batch $256$, 80K 步对应 $2.05\times10^{7}$ 条样本, 远超阶段 1 的 375 万对数据, 长的几档是重复多轮还是换了更多数据, 文中没有给出; 正式训练用了 $15000$ 步, 落在 8K 和 20K 之间, 选择理由也没有写. 2K 一档最好, 8K 一档在 MMC 上掉到 $45.0$, 波动比档间趋势还大, 单次运行的结论只能看个方向.

## 6. 前后版本与论文自身的问题

DeepSeek-VL 之后, DeepSeek 的多模态工作分成两支: 一支是 Janus 系列, 把理解和生成放进同一个模型, 理解通路直接沿用 VL-1.3B; 另一支是 VL2, 继续做纯理解模型, 视觉编码器和语言模型都换了. 两支都放弃了 SAM 加 SigLIP 的双编码器.

报告本身还有一批数字, 图号和叙述上的不一致, 分散在前几章的分析里, 6.3 节按原文章节号汇总.

### 6.1. Janus 与 Janus-Pro

[Janus](../deepseek-janus/deepseek-janus-analysis.md) 的理解通路是 SigLIP-L/16-384 编码器, 输出 $576$ 个 token, 经两层 MLP adaptor 送入 DeepSeek LLM 1.3B, 与 DeepSeek-VL 1.3B 的视觉侧完全相同; 生成通路另用 VQ tokenizer, 这是 Janus 的新增部分. Janus 的理解数据也引用了 DeepSeek-VL 的表格图表等数据, 训练同样分三段. 区别在于 Janus 把 SigLIP 一直冻结到最后一个阶段才解冻, 而 DeepSeek-VL 在阶段 3 就训练 SigLIP.

[Janus-Pro](../deepseek-janus-pro/deepseek-janus-pro-analysis.md) 保持同一套理解通路, 把语言模型扩到 7B, 理解数据改为参考 VL2 的数据. 从 VL 到 Janus 再到 Janus-Pro, SigLIP-L 384 加 $576$ 个 token 这一组合用了三代, 说明在 DeepSeek 内部, 1.3B 版那条更简单的通路才是被继承下来的部分, SAM 支路没有延续.

### 6.2. VL2 的改动

DeepSeek-VL2 把视觉侧换成单个 SigLIP-SO400M-384, 用动态切图处理任意宽高比: 按宽高比把图切成 $m\times n$ 个 $384$ 方块 ($m\cdot n\le9$), 再加一张缩略全图; 每块 $27\times27$ 个 patch 经 $2\times2$ pixel shuffle 压成 $14\times14=196$ 个 token. 这同时解决了 1.2 节提到的补边浪费和 1.1 节的分辨率上限, 也不再需要 SAM 支路. 语言侧换成 DeepSeekMoE 加 MLA, 三档模型的激活参数为 1.0B, 2.8B, 4.5B, 总参数为 3B, 16B, 27B, 这正是 DeepSeek-VL 结论里「扩大规模并引入 MoE」的落地.

数据配比也变了. VL2 的视觉语言预训练约 70% 是视觉语言数据, 30% 是纯文本, 与 DeepSeek-VL 的 30:70 正好相反. 两者语言模型的规模和结构都不同, 不能由此判断哪个比例更好, 但至少说明 DeepSeek-VL 的 7:3 是针对稠密小模型的配方, 不是固定结论.

### 6.3. 论文自身的问题

前五条涉及数字或图表编号:

1. Figure 4 题注写 multimodal:language=70%:30%, 与 3.2.2 节「语言与多模态约 7:3」, Table 1 纯文本 70.0% 以及 4.4 节目标比例 0.7 方向相反; 图中也没有 70:30 或 30:70 的曲线, 4.4 节消融用的是 60:40.
2. 4.4 节「扩大 projector 训练」一段说结果在 Figure 8, 实际是 Table 8; Figure 8 题注首句写模态预热, 内容是模态分组.
3. 4.2 节说 Pile-test 的每字节比特数结果在 Table 7, Table 7 没有 Pile 一行.
4. 4.3 节说对三个开源模型都在超过 60% 的样本中胜出, Figure 7 中对 InternLM-XComposer2-VL 为 57/99; 人工评测集 100 题, GPT-4V 评测用 99 个样本, 差的一题没有说明.
5. Table 10 的平均分把 OCRBench 除以 10 后参与平均, 表注未说明.

其余几处是叙述和命名上的不一致. 摘要与 3.1 节把 SigLIP 加 SAM 写成通用结构, 发布的 1.3B 只有 SigLIP; 3.1 节写拼接后 token 为 2048 维, 与同节 adaptor 段和代码的先投影再拼接 (4096 维) 不符; Figure 3 阶段 3 把整个混合编码器标为可训, 与「SAM-B 冻结」矛盾; 结论写 1.3B 和 6.7B, 其余各处写 1B, 1.3B 和 7B, 混用不一; 3.2.2 节以「编码器设计」为 1.3B 向 7B 迁移的例子, 但 1.3B 没有 SAM; 官方代码 `sam.py` 的跨层 $\alpha$ 支路论文完全没有提及.

## 参考文献

1. DeepSeek-AI. DeepSeek-VL: Towards Real-World Vision-Language Understanding. arXiv:2403.05525, 2024. [链接](https://arxiv.org/abs/2403.05525)
2. DeepSeek-VL 官方代码, 提交 681bffb4519856ad27cc17531aacde31ddf6f1a7. [链接](https://github.com/deepseek-ai/DeepSeek-VL/tree/681bffb4519856ad27cc17531aacde31ddf6f1a7)
3. `deepseek_vl/models/sam.py` 第 161 到 196 行. [链接](https://github.com/deepseek-ai/DeepSeek-VL/blob/681bffb4519856ad27cc17531aacde31ddf6f1a7/deepseek_vl/models/sam.py#L161-L196)
4. GitHub issue #19: Can you address the work you have referenced? [链接](https://github.com/deepseek-ai/DeepSeek-VL/issues/19)
5. Hugging Face transformers, `modular_deepseek_vl_hybrid.py`. [链接](https://github.com/huggingface/transformers/blob/c472755e/src/transformers/models/deepseek_vl_hybrid/modular_deepseek_vl_hybrid.py)
6. DeepSeek-AI. DeepSeek LLM: Scaling Open-Source Language Models with Longtermism. arXiv:2401.02954, 2024.
7. Tong et al. Eyes Wide Shut? Exploring the Visual Shortcomings of Multimodal LLMs. arXiv:2401.06209, 2024.
8. Kirillov et al. Segment Anything. arXiv:2304.02643, 2023.
9. Zhai et al. Sigmoid Loss for Language Image Pre-Training. arXiv:2303.15343, 2023.
10. Schaeffer et al. Are Emergent Abilities of Large Language Models a Mirage? NeurIPS 2023.
11. 吃果冻不吐果冻皮. DeepSeek 多模态模型演进 (知乎). [链接](https://zhuanlan.zhihu.com/p/1976731060562842519)
12. DOCSAID. [24.03] DeepSeek-VL. [链接](https://docsaid.org/en/papers/deepseek/deepseek-vl/)
13. 站内: [CLIP 与视觉编码器](../../../llm-guide/8-多模态/8.8-CLIP与视觉编码器/01-CLIP与视觉编码器/01-CLIP与视觉编码器.md), [LLaVA 架构深度解析](../../../llm-guide/8-多模态/8.2-视觉语言模型/02-LLaVA架构深度解析/02-LLaVA架构深度解析.md), [高分辨率 VLM 的技术挑战](../../../llm-guide/8-多模态/8.2-视觉语言模型/05-高分辨率VLM的技术挑战/05-高分辨率VLM的技术挑战.md).
