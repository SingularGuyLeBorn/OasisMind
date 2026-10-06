---
title: "DeepSeek-OCR 2: 用因果 query 重排文档视觉 token"
category: "模型技术报告"
tags: ["DeepSeek", "OCR", "视觉编码器", "因果注意力", "文档解析"]
published: true
excerpt: "DeepSeek-OCR 2 以双向视觉 token 和因果 flow query 组成 DeepEncoder V2, 在固定 token 预算内学习文档阅读顺序."
---
# DeepSeek-OCR 2: 用因果 query 重排文档视觉 token

论文 [DeepSeek-OCR 2: Visual Causal Flow](https://arxiv.org/abs/2601.20552) 于 2026 年 1 月公开, 代码和权重见 [deepseek-ai/DeepSeek-OCR-2](https://github.com/deepseek-ai/DeepSeek-OCR-2). 模型沿用 DeepSeek-OCR 的 16 倍视觉压缩与 3B MoE decoder, 把 encoder 中的 CLIP ViT 换成由 Qwen2-0.5B 初始化的 LLM 风格结构. visual token 继续双向建模全局图像, 后接等数量 learnable query 按 causal mask 逐个读取视觉信息, 只有 query 输出进入语言 decoder.

## 1. 固定 raster 顺序为何成为文档理解限制

固定 raster 顺序把二维文档结构预先压成了一条不可调整的**一维路径**.

### 1.1. 2D patch 展平会把坐标顺序当成语义顺序

ViT 通常把图像切成 patch, 按从左到右, 从上到下展平, 再加 position encoding. 对自然照片, 邻近 patch 的空间关系往往足够稳定; 对文档, 视觉坐标与阅读顺序经常不同. 双栏论文要先读完左栏再到右栏, 表格可能按表头与行列依赖读取, 公式包含分式, 上下标与多行对齐, 这些关系无法由单一 raster path 完整表达.

普通 encoder 使用双向 self-attention 后, 每个 visual token 已能看到全图, 所以问题不在感受野缺失. 难点是送入自回归 LLM 的压缩 token 仍按固定坐标排列. decoder 要一边恢复阅读顺序, 一边识别内容并生成 Markdown. DeepEncoder V2 把顺序选择提前到 encoder, 让输出 token 的先后受图像语义影响.

### 1.2. 人类扫描只是设计动机, 不是机制证明

论文用人类 foveal fixation 和追踪螺旋线解释 visual causal flow. 人眼的下一次注视受此前语义影响, 因而模型 query 也按前序 query 条件化. 这说明为何采用因果 query, 不能证明模型学到与人类相同的眼动路径. 训练没有眼动标签, query 顺序由 next-token prediction 间接塑造.

更准确的机制描述是: 每个 query 能读取全部 visual token 与此前 query, 不能读取未来 query. query 序列因此构成有方向的条件分解. 若任务要求先输出标题再输出正文, 梯度会推动前部 query 捕获标题相关特征, 后部 query 在此前表示上继续组织后续内容. 所谓 reading order 是由生成损失诱导的 latent order.

### 1.3. OCR 是适合验证顺序建模的任务

文档输出可以直接比较字符, 公式, 表格结构与 reading order, 比开放式图像问答更容易把顺序收益单独观察. OmniDocBench 同时给文本 edit distance, formula CDM, table TEDS 和 reading-order edit distance. DeepSeek-OCR 到 OCR 2 的主要数据源和 decoder 保持接近, encoder 变化更容易与指标改善对应.

该试验场也有限制. 文档的目标顺序通常由标注 parser 规定, 不一定等于唯一合理的人类阅读路径. reading-order edit distance 下降表明输出更接近 benchmark 顺序, 不能证明 query 形成通用 2D reasoning. 对物体交互, 空间导航和图形推理的效果仍待后续实验.

## 2. DeepEncoder V2 的 token 流怎样计算

### 2.1. vision tokenizer 先做 16 倍压缩

输入图像先经过约 80M 参数的 SAM-base 与两个 convolution layer. 最后 convolution 输出维从上一代的 1024 调成 896, 与后续 Qwen2 encoder hidden dimension 对齐. window attention 在局部范围聚合 patch, token 数减少 16 倍. 对 1024×1024 global view, 压缩后得到 256 个 visual token; 对 768×768 local crop, 每个得到 144 个.

这一级 tokenizer 不是理论上必需, 普通 patch embedding 也可接入后续结构. 团队保留它是为了降低全局 attention 的序列长度和 activation memory. 约 80M 参数也接近大型 LLM 的 text embedding 参数量. 压缩发生在因果重排之前, 被局部 tokenizer 丢掉的细节无法由后续 query 恢复.

### 2.2. visual prefix 与 causal query 共用 Transformer

压缩后的 $m$ 个 visual token 放在序列前部, 后接 $n$ 个 learnable causal query, 论文设置 $m=n$. visual token 之间使用全双向 attention, 能看到整个视觉 prefix; visual token 不能读取 query. 每个 query 可以读取全部 $m$ 个 visual token, 也可读取此前 query, 但不能读取未来 query.

attention mask 可写成四个 block:

$$
M=\begin{bmatrix}
\mathbf{1}_{m\times m} & \mathbf{0}_{m\times n}\\
\mathbf{1}_{n\times m} & \operatorname{LowerTri}(n)
\end{bmatrix},\qquad m=n.
$$

左上 block 保留 ViT 式全局视觉建模, 左下 block 让每个 query 读取全部视觉信息, 右下 block 让 query 形成自回归序列, 右上 block 阻止 visual token 被 query 反向改变. 最终投影算子 $\pi_Q$ 丢弃前 $m$ 个 visual output, 只保留后 $n$ 个 query output 给 decoder.

### 2.3. 等数量 query 没有进一步压缩 token

Q-former 常用少量 query 压缩大量 CLIP token. DeepEncoder V2 刻意让 query 数量等于视觉 token 数, 因为输入含 padding, border 与重复区域, 模型需要足够 slot 对信息重新注视和排序. token compression 已由前面的 SAM-conv tokenizer 完成, LLM encoder 的职责是重组和蒸馏, 不是再次减少数量.

global view 固定使用 256 query. 每个 local crop 使用共享的 144 query embedding, crop 数 $k$ 为 0–6. 最终 token 数为 $256+144k$, 即 256–1120. local crop 共享 query 参数, 但每个 crop 的视觉输入不同. 最大 1120 略低于 DeepSeek-OCR Gundam mode 的 1156, 便于在相近预算下比较.

## 3. 两级因果流的能力和代价

DeepEncoder V2 用**两级一维因果过程**生成可重排的视觉 token 流.

### 3.1. encoder 重排, decoder 生成

第一级因果过程发生在 encoder query. query $q_i$ 根据全图 visual prefix 与 $q_{<i}$ 生成新的视觉 representation. 第二级发生在 DeepSeek-MoE decoder, decoder 在这些 ordered representation 和文本 prompt 上自回归输出 OCR 内容. 两层都是 1D causal computation, 中间 representation 则来自 2D 图像.

该设计没有显式 permutation matrix, 也没有把每个 query 对应到唯一 patch. query 可以对全部 visual token 做 soft attention, 所以“重排”更接近顺序化的信息聚合. 一个 query 可以混合多个区域, 同一区域也可被多个 query 反复读取. 这比 hard sorting 灵活, 也使 latent order 难以直接解释.

### 3.2. prefix decoder-only 比 cross-attention 更稳定

视觉 encoder 用 Qwen2-0.5B 初始化, 参数约 500M, 比 300M CLIP ViT 大但仍属相近量级. 团队还试过 mBART 式 encoder-decoder 与 cross-attention, 训练没有收敛. 论文推测, visual token 被隔离在独立 encoder 后, 与 query 的交互不足; prefix concatenation 让它们在每一层共同参与 self-attention.

该对照只报告失败, 没给 loss curve, 具体超参数和多次重试. 因此能确定最终采用 prefix 结构, 不能据此断言所有 cross-attention 视觉 encoder 都不适合因果 query. 初始化兼容性, mask 实现和优化设置也可能影响收敛.

### 3.3. decoder 保持不变有助于隔离 encoder 收益

语言 decoder 沿用 DeepSeek-OCR 的 3B MoE, 每 token 激活约 500M 参数. 核心前向可以理解为 vision tokenizer $E$ 生成 $V$, query $Q_0$ 与 $V$ 拼接, LLM encoder $T_L$ 在 mask $M$ 下计算, $\pi_Q$ 抽取 query representation, decoder $D$ 输出词表 logits.

decoder 不升级让 baseline 更可比. 但 encoder 从 300M CLIP 换到 500M Qwen2 风格网络, 总参数和训练过程仍变化, 3.73 个百分点不能只归因于 causal mask. 要严格分解贡献, 还需要同参数双向 Qwen encoder, 不等量 query, 不同 mask 等消融. 报告没有提供这些完整组合.

## 4. 三阶段训练为什么要逐步冻结

### 4.1. encoder 预训练先建立视觉语言接口

第一阶段把 DeepEncoder V2 配轻量 decoder, 用 next-token prediction 联合训练. 768 与 1024 两个 dataloader 分别覆盖 local/global 尺寸. vision tokenizer 从上一代初始化, LLM encoder 从 Qwen2-0.5B-base 初始化. AdamW 学习率从 $10^{-4}$ cosine 衰减至 $10^{-6}$, 使用 160 张 A100, batch 640, 40k iteration, 8K sequence packing, 总量约 100M image-text pair.

这一阶段同时改变 tokenizer, LLM encoder 与轻量 decoder, 让原本处理文本的 Qwen2 attention 适应视觉 prefix 和定制 mask. 训练后只保留 encoder 参数, 轻量 decoder 是提供语言建模监督的临时 readout. encoder 学到 feature extraction, token compression 后的信息利用和初步 query order.

### 4.2. query enhancement 联合对齐最终 decoder

第二阶段接入 DeepSeek-3B-A500M decoder. SAM-conv tokenizer 冻结, LLM encoder 与 decoder 联合更新. multi-crop 把两种分辨率合进同一 dataloader. 4-stage pipeline parallelism 中, tokenizer 在 PP0, LLM encoder 在 PP1, decoder layer 分配到 PP2–3.

160 张 40GB GPU 组成 40 个 data parallel replica, 每个 replica 用 4 张卡, global batch 1280. 学习率从 $5\times10^{-5}$ 降到 $10^{-6}$, 训练 15k iteration. tokenizer 冻结避免低层视觉特征在联合训练中漂移, encoder query 与最终 decoder 同时适应, 使 reordered representation 更适合下游生成.

### 4.3. 冻结 encoder 后扩大数据吞吐

第三阶段冻结整个 DeepEncoder V2, 只训练 decoder. 同 global batch 下训练速度超过翻倍, 学习率从 $10^{-6}$ 降至 $5\times10^{-8}$, 训练 20k iteration. encoder 输出分布固定后, decoder 学习更好解释 reordered visual token, 并能以较低 FLOPs 消耗更多训练数据.

冻结也意味着后续 decoder 发现的新错误无法反向修改 visual order. 三阶段顺序在适应能力和吞吐之间取舍: 前两阶段允许 encoder 学到任务需要的表示, 最后阶段把计算集中到语言生成. 报告没有给各阶段单独指标, 无法量化每一步的边际收益.

## 5. 结果支持什么, 还缺什么

### 5.1. 总分与 reading order 同时改善

OmniDocBench v1.5 有 1355 页中英文文档, 覆盖 9 类. OCR 2 使用最多 1120 visual token, overall 为 91.09%; baseline 使用 1156 token, overall 为 87.36%. 文本 edit distance 从 0.073 降至 0.048, formula CDM 从 84.14 升至 90.31, reading-order edit distance 从 0.085 降至 0.057.

reading-order 改善与 causal flow 目标一致, 文本和公式也同步提升, 说明重排没有用内容识别换顺序. 然而训练 sampling 和 layout label 同时调整, encoder 参数也增加. 论文将数据差异描述为小改动, 它们仍是混杂变量. 缺少严格 ablation 时, 结果支持整套 OCR 2 方案有效, 不能精确归因每个组件.

### 5.2. newspaper 揭示 token 与数据两种瓶颈

分文档类型看, OCR 2 多数文字 edit distance 更低, newspaper 仍为 0.139, 略差于 baseline 的 0.131. 报纸文字密度高, 1120 token 上限可能压缩过强; 增加 local crop 能提高细节预算. 训练中 newspaper 只有约 250k 样本, 新 encoder 也可能没有学到稳定布局模式.

两种原因没有通过独立实验拆分. 若只增加 crop 而不补数据, 可以检验 resolution/token bottleneck; 固定 crop 增加报纸数据, 可检验分布瓶颈. 论文把它们列为后续改进方向, 没有报告实验数值. reading order 在报纸上从 0.101 到 0.100, 改善也很小.

### 5.3. 生产 repetition rate 不是完整准确率

在线用户图像 repetition 从 6.25% 降至 4.17%, PDF 预训练数据从 3.69% 降至 2.88%. 无 ground truth 时, 重复输出易于自动统计, 能发现 decoder loop 与阅读顺序异常. 下降说明新模型在真实流量上更少出现这类明显退化.

repetition rate 看不到遗漏, 错字, 公式错误和错误表格结构. 一个不重复但内容错误的输出仍会被记为正常. 生产 readiness 还需要人工抽检, 下游数据质量与 latency/throughput. 报告没有给推理速度, 显存和线上样本量, 不能仅从 repetition 推断完整生产优势.

### 5.4. “真正 2D 推理”仍是研究假设

串联两个 1D causal reasoner 的设想很有吸引力: encoder 推理阅读逻辑, decoder 推理任务输出. 当前证据来自 OCR 与 document parsing, 任务本来就有可线性化的目标序列. 更一般的 2D reasoning 可能要求来回观察, 多跳空间关系和不止一次重排.

论文提出让 causal flow token 长于 visual token, 以支持多次 re-examination. 这会增加 encoder attention 成本, 也打破 $m=n$ 的简洁设置. 未来还需比较更多 query, recurrent query, sparse attention 与显式 layout graph. 当前结果证明 causal query 对文档有效, 尚未证明双 1D 结构足以覆盖通用二维视觉推理.

### 5.5. omni-modal encoder 需要跨模态实验证据

LLM 风格 encoder 可以理论上共享 $W_k$, $W_v$, attention 和 FFN, 只为图像, 音频, 文本使用不同 learnable query. 统一参数空间有机会复用 MoE, efficient attention 和训练基础设施. query 充当各模态的读取接口, 输出统一长度和 hidden dimension 的 representation.

DeepSeek-OCR 2 只验证视觉文档. 音频的时间连续性, 文本的离散 token 和图像的二维空间有不同局部结构, 共享 encoder 是否产生负迁移尚未知. 模态专用 tokenizer, query 数量, mask 与采样比例仍需设计. 因此 native multimodality 是由架构自然引出的方向, 不是论文已经完成的能力.

从 attention 计算看, DeepEncoder V2 的 LLM encoder 序列长度为 $m+n=2m$. visual token 与 query 等量后, 全局层处理的 token 数比只输入 visual token 更长. 定制 mask 虽然禁止一部分连接, 常规 dense attention kernel 未必按 mask 稀疏性减少 FLOPs. 16 倍 tokenizer compression 因而是控制成本的关键, 否则双流序列会显著放大全局 attention 计算.

只有 query output 进入 decoder, 所以 decoder 的视觉上下文仍为 $n$, 没有因 encoder 内部拼接翻倍. 额外成本集中在 encoder, 自回归 OCR 生成的 KV cache 不保存原始 visual token. 对长文档输出, decoder token 数通常远大于视觉 token, encoder 增量在端到端延迟中的占比需要实测. 论文没有报告速度, 不能从结构直接判断线上吞吐是否持平.

mask 中 visual token 不能看到 query, 让视觉 prefix representation 与 query 读取过程单向分离. 如果允许 visual token 反向读取 query, 各层会把顺序状态写回视觉特征, 可能增强迭代交互, 也会破坏视觉全局表示的稳定性. 当前 block mask 选择一次编码, 多步读取的结构, 与 decoder-only prefix language model 接近.

query embedding 在不同图像间共享, 不对应固定语义类别. 第一个 query 不必总是标题, 后一个也不必总是页脚; 位置只提供因果槽位, 实际读取内容由图像和训练目标共同决定. local crop 又共享同一组 144 query, 让各 crop 采用一致读取接口. 这种参数共享提高泛化, 也可能难以区分同页不同 crop 的全局位置, 需要 global view 提供整体布局.

multi-crop 把高分辨率细节与全局布局分开. global 1024 view 产生 256 token, 保留整页结构; local 768 crop 每块产生 144 token, 补充小字和公式. $k$ 增加时 token 线性增长, 最大 6 crop. 报纸失败说明固定上限下, 超密集页面仍可能有局部内容没有足够 representation slot.

论文称最大预算与 Gemini-3 Pro 的 1120 token 相同, 这只对齐 token 数量, 不对齐 token 信息量. 不同 tokenizer 的 patch 尺寸, compression 和 hidden dimension 不同, 一个视觉 token 携带的空间范围也不同. Table 2 在相同计数下比较 overall edit distance有参考价值, 不能把 token 数直接解释为等 FLOPs 或等视觉带宽.

overall 91.09 的聚合方式来自 OmniDocBench, 各子指标方向不同. Text edit 越低越好, formula CDM 与 table TEDS 越高越好, reading-order edit 在 Table 1 的箭头标注还存在版面抽取歧义. 解析成绩时应回到官方 evaluator, 不能把所有列当成相同百分比. analysis 只比较论文明确给出的同列数字.

DeepSeek-OCR baseline 与 OCR 2 使用相同主要数据源, 但 OCR 1.0 sampling 改为 3:1:1, layout label 也被合并. 更均衡的 formula/table 数据可能直接改善对应指标, label 合并可能减少 layout 分类冲突. 若要证明 causal flow 单独贡献 3.73, 至少需要在新数据方案上训练旧 encoder, 或在旧数据方案上训练新 encoder.

Qwen2-0.5B 初始化还带来文本模型中的顺序先验. 虽然输入变成视觉 embedding, layer normalization, attention 与 FFN 已经学习处理因果序列. 定制 mask 把前半段改成双向, 后半段保留 causal pattern. 性能提升可能同时来自更大参数, LLM pretrained weights 和 mask 结构, 当前报告没有三者消融.

mBART 式 cross-attention 未收敛的观察提示优化路径敏感. cross-attention 通常让 query 读取固定 encoder memory, prefix self-attention 则让 visual token 与 query 每层共同变换. 两者初始化和梯度路径不同. 仅一次失败不足以归纳 cross-attention 上限, 但对本文训练预算而言, prefix 方案已被实验证明可训练且有效.

三阶段学习率逐步降低, 从第一阶段峰值 $10^{-4}$ 到第二阶段 $5\times10^{-5}$, 最后从 $10^{-6}$ 降到 $5\times10^{-8}$. 这与冻结范围扩大相配合: 初始化差异最大的 encoder 先获得较大更新, 接入成熟 decoder 后减小步幅, 最后只微调 decoder 适应固定视觉 distribution. 报告没有给 warm-up 和 weight decay 等全部参数, 复现仍需代码配置.

约 100M image-text pair 是第一阶段经过 packing 的样本暴露量, 不等于独立图像数量. 两个 resolution dataloader 和 OCR/general mixture 会重复采样. 第二与第三阶段只给 iteration 和 batch, 没给去重样本总量. 因而不能把 100M 与后两阶段直接相加, 也无法从论文计算每份文档经历多少 epoch.

生产 repetition 降低可能来自 reading order 改善, 也可能来自 decoder 第三阶段继续训练. decoder 在固定 encoder 上多训 20k iteration, 输出稳定性会改变. 若要隔离 encoder 对 repetition 的贡献, 应让两个模型使用等量 decoder training 或交换 encoder. 论文把 production 结果作为整套系统验证, 没有声称是严格消融.

文档 parser 为 LLM 预训练生产数据时, 错误会进入下一轮语言模型语料. repetition 容易造成大段重复 token, 对训练损失和数据体积影响明显, 因而即使它不是完整准确率, 也是重要运行指标. text omission 和 table corruption则需要更昂贵的抽样检查或可合成 ground truth 数据监控.

公式识别提升 6.17 个百分点, 可能与 causal order 对二维公式结构的建模相关. 分式应先关联分子分母, 矩阵按行列组织, 上下标依赖基符号. query 能从全图读取并按前序 query 条件化, 比固定 patch 顺序更容易形成局部表达式序列. 论文没有提供公式专属 attention 可视化, 该解释仍属于结构上的合理推断.

表格 TEDS 与 reading order 也共享层次关系. 输出一个 cell 前, 模型需要知道表头, 所在行列与相邻 cell; raster order 在合并单元格和多级表头中经常偏离语义. causal query 允许后续 slot 依赖此前聚合的表头信息. 但 query 使用 soft attention, 没有显式行列坐标, 极复杂表格仍可能需要 layout graph 或结构 decoder.

从失败模式看, query 数量等于 visual token 只是保守容量选择. 如果减少 query, 可以进一步压缩 decoder context, 但可能丢失高密度文本; 增加 query, 可以多次读取同一视觉区域, encoder 与 decoder 成本都会上升. 最有价值的消融是固定输入 token, 扫描 query/visual ratio, 分别报告准确率, reading order 与 latency. 论文只评价 $m=n$.

所谓两级因果流也不同于显式视觉搜索. query 不会调用裁剪工具, 放大新区域或根据中间结果重新运行 tokenizer. 所有信息在第一次前向时已存在于 visual prefix. 多次 re-examination 只是在 representation 中反复 attend, 无法恢复 tokenizer 未保留的细节. 真正主动视觉可能还要加入动态 crop 或 recurrent perception.

对一般 VLM, 输出不总是文档顺序. 图像问答可能先查看问题相关区域, 空间推理可能需要在物体之间往返. 固定 query causal order能否适应 prompt 条件取决于 encoder 是否看到文本 prompt. 本文公式中 prompt 主要进入 decoder, encoder 重排更像图像固有顺序. 若任务顺序依赖问题, 可能需要把文本条件也送进 query encoder.

模型名称中的 visual causal flow 容易被误解为严格因果发现. 这里的 causal 指 attention 可见性方向, 不是统计因果推断或干预关系. query $q_i$ 依赖 $q_{<i}$, 形成计算图上的因果顺序; 模型没有识别图像元素之间的因果机制. 使用时应把它理解为 autoregressive visual ordering.

综合来看, 报告给出的最强证据是同一 OCR 家族在更低最大 token 数下, overall, 文字, 公式, 表格与 reading order 同时改善, 并在两类生产流量中减少重复. 最主要证据缺口是 encoder 组件消融, 速度与显存测量, 以及文档之外的视觉任务. DeepEncoder V2 已证明是一种有效文档 encoder, 通用 2D reasoner 与 omni-modal encoder 仍是待验证方向.

Table 1 还同时列出 pipeline OCR 与 end-to-end VLM. pipeline 系统通常把 layout detection, recognition, formula 和 table parser 分开优化, end-to-end 模型用一个生成接口处理整页. DeepSeek-OCR 2 属于后者, 91.09 接近强 pipeline 的 92.86. 两类系统的 token 成本和模块数量不同, overall 可以比较输出质量, 不能据此断言端到端方案在吞吐和维护成本上全面占优.

Table 2 把 text, formula, table, reading order 的 edit distance聚合为 overall edit. Gemini-3 Pro 与 Seed-1.8 只报告 overall, 缺少分项, 所以无法判断 OCR 2 的优势来自文字还是布局. DeepSeek 两代的分项完整, 是分析 causal flow 机制更可靠的对照. 与闭源模型的比较只能支持相同 evaluator 下的总结果.

训练数据 80% 为 OCR, 剩余通用视觉数据用于维持较宽的视觉表示. 高 OCR 比例与文档基准匹配, 也可能限制自然图像泛化. 若未来把同一 encoder 用于通用 VLM, 需要重新平衡数据, 检查 causal query 是否仍会形成有用顺序. 文档上的 token arrangement 不一定适合物体密集的自然场景.

layout label 合并例如 figure caption 与 figure title, 会减少类别边界, 让 detection supervision 更稳定. 对最终 Markdown 而言, 两者可能采用相同输出结构, 合并不会明显损失信息. 但需要细粒度版面语义的下游任务可能需要重新区分. 数据标签简化是面向 OCR 输出目标的取舍, 不是通用 layout ontology.

如果要复现架构, 最关键的实现检查有四项: query 与 visual token 数必须对齐; mask 四个 block 的方向不能写反; projection 只能取后半 query output; multi-crop 的 global/local query 与位置组织必须和训练一致. 任一处错误都可能让 visual token 泄露未来 query, 或把未重排的 prefix 送入 decoder. 这些属于结构不变量, 应用小矩阵单测验证.

如果要复现实验, 还要锁定 OmniDocBench v1.5 evaluator, visual token 上限与 crop policy. 不同 image resize, OCR prompt 和停止条件会改变 edit distance. production repetition 的数据不可公开复算, 因而只能作为作者内部运行证据. 公共基准结果与开源权重才是外部复核的主要入口.

在部署监控中, 可以按文档类别分别记录字符 edit proxy, 空输出率, 重复率, token 使用量和 decoder 截断率. newspaper 与 research paper 的密度差异很大, 总体均值会掩盖特定类别退化. crop 数也应作为可观测字段, 便于判断错误来自视觉预算不足还是生成阶段. 论文的九类明细已经说明分类监控比单一 overall 更有诊断价值.

这些指标应与定期人工抽检共同使用, 防止自动代理指标遗漏新的失败类型.

## 6. Visual causal flow 的数学结构与可验证边界

### 6.1. 四块 mask 决定信息流方向

将视觉 token 写成 $V=(v_1,\ldots,v_m)$,query 写成 $Q=(q_1,\ldots,q_n)$. 每层注意力前的拼接序列为 $S=[V;Q]$. 对 query $q_i$,可见集合为

$$
\mathcal A(q_i)=\{v_1,\ldots,v_m,q_1,\ldots,q_i\};
$$

对视觉 token $v_j$,可见集合只有全部 $V$. 这使视觉表征先在全图双向聚合,query 再按一维因果顺序读取. query 的状态递推可以抽象为

$$
h_i=F_\theta(q_i,V,h_{<i}).
$$

$F_\theta$ 不是普通 RNN,因为每层 query 同时对全部视觉位置做注意力;因果性来自可见域,并不要求状态压缩为单个向量.

右上 mask 为零保证视觉 token 不受 query 影响. 若该块误开,第 $j$ 个视觉位置会读取未来 query 的可学习 embedding,视觉分支不再是独立全局记忆. 左下全一保证每个 query 都能查看完整图像;若错误改成下三角,query 只能读取部分 raster prefix,模型会重新受到固定空间顺序限制.

### 6.2. Query 顺序是一种条件分解

输出给 decoder 的 query representation 可写成联合条件分布

$$
p(H_Q\mid V)=\prod_{i=1}^{n}p(h_i\mid V,h_{<i}).
$$

模型没有显式监督 $h_i$ 应对应页面哪个区域. next-token loss 只要求整段 $H_Q$ 足以让 decoder 生成目标. 因而 latent order 具有不可辨识性:若同时改变 query 内部编码与 decoder 读取方式,多种顺序都可能得到相同输出概率.

所谓重排不能按硬 permutation 理解. 硬重排要求存在置换矩阵 $P$,使 $H_Q=PV$;实际注意力允许

$$
h_i=\sum_{j=1}^{m}\alpha_{ij}W_Vv_j+g(h_{<i}),
$$

一个 query 可混合多个位置,同一位置也可被反复读取. 更准确的称呼是「顺序化视觉摘要」:query 序列按因果槽位逐步形成可供 decoder 使用的视觉状态.

### 6.3. 因果 query 为什么可能学习阅读顺序

假设 decoder 要生成标题 token $y_{1:r}$,随后生成正文 $y_{r+1:}$. 若前部 query 更早聚合标题区域,decoder 可以用较短注意路径获得标题信息;若视觉信息完全无序,decoder 仍可搜索全部 query,但要自己学习布局到输出的映射. 端到端梯度会偏好降低解码难度的 encoder 表示.

这种偏好不是唯一解. decoder 足够强时,它可能忽略 query 顺序,把 $H_Q$ 当作集合重新检索. reading-order 指标改善说明整套表示有利于顺序恢复,没有直接观测 query 与页面区域的一一对应. 要证明顺序形成,需可视化各 $q_i$ 的注意重心,测它与 ground-truth reading order 的秩相关,论文没有提供该分析.

### 6.4. 双向视觉 prefix 提供静态记忆

每个 $v_j$ 经多层双向注意力后都含全图上下文. query 即使主要关注一个位置,读取到的也是已经融合布局的表示，而非孤立 patch. 这让前部 query 有机会判断某块是标题还是页脚,不必等待遍历整页.

代价是所有视觉位置在 encoder 中先做全局交互. 16 倍卷积压缩使 $m$ 控制在 256 或每 crop 144,否则 $m^2$ 成本很高. DeepEncoder V2 的顺序建模建立在「先全局理解,后因果读取」上,与人眼逐次注视原始高分辨率区域并不相同.

### 6.5. 等量 query 是容量保守点

$n=m$ 保证输出槽位数量不低于压缩后视觉位置. 这不会保证无损,因为每个 query hidden dimension 固定,attention 还会混合信息. 它至少避免在 query 层再次显式缩短序列.

若 $n<m$,query 层承担额外压缩,decoder KV 更短;若 $n>m$,多个 query 可从同一视觉记忆提取不同关系,适合反复阅读. 设 ratio $\rho=n/m$,encoder 拼接长度为 $(1+\rho)m$,dense attention 二次项随 $(1+\rho)^2m^2$ 增长,decoder 视觉前缀随 $\rho m$ 线性增长. 扩 query 会同时增加两段成本.

论文只用 $\rho=1$,因此不能判断最优点. 普通段落可能适合 $\rho<1$,复杂表格或几何图可能从 $\rho>1$ 受益. 动态 $\rho$ 需要页面难度路由.

### 6.6. query embedding 共享带来位置先验

第 $i$ 个 learnable query 在所有页面中共享参数,因果位置也固定. 即使没有显式监督,训练可能让早期 query 偏好标题和左上区域,后期 query 偏好尾部. 这是一种数据分布先验.

对阅读顺序异常的页面,固定 query 位置偏好可能造成错误. 例如海报中央标题先读,或表格需要先读顶部和左侧两个表头. 全图 attention 允许内容覆盖位置先验,能否覆盖取决于训练样本. 按文档类型测 query attention 可判断模型是动态重排还是复用了常见模板.

### 6.7. local crop 共享 query 不代表共享页面坐标

每个 768 crop 使用同一组 144 query embedding. 局部坐标原点在各 crop 内部重置,第一个 query 可能都偏向每块左上. 若 crop 在页面中的绝对位置没有显式编码,合并时需依靠输入排列或 global view 恢复位置.

局部块提供细节,global 256 token 提供坐标和整体阅读顺序. 若去掉 global view,各块内容仍可识别,拼接顺序可能退化. 一个关键消融应比较 local-only,global-only 与二者结合,论文只给完整动态模式.

### 6.8. Qwen2 初始化提供序列归纳偏置

Qwen2-0.5B 的 causal attention,RoPE,RMSNorm 与 FFN 已适应语言序列. DeepEncoder V2 将前 $m$ 个位置改为双向可见,后 $n$ 个继续因果. 权重初始化同时带来顺序处理能力和文本预训练统计.

视觉 embedding 分布与词嵌入不同,第一阶段必须重新对齐. 性能提升可能来自三部分:参数从 CLIP 约 300M 增到 Qwen2 encoder 约 500M,语言模型初始化,hybrid mask. 缺少等参数双向 Qwen 和随机初始化 causal Qwen 对照时,不能把 3.73 点全部归给 mask.

### 6.9. Prefix self-attention 与 cross-attention 的梯度路径

prefix 结构中,V 与 Q 在每一层进入同一个 self-attention 投影. query loss 可通过 $K,V$ 投影回传到视觉状态,视觉状态自身又经多层双向更新. cross-attention 结构常先独立编码 V,query 再通过独立模块读取,两套参数和残差路径分开.

论文的 mBART 式方案未收敛,可能来自接口初始化,学习率或信息瓶颈,也可能来自视觉 memory 与 query 交互不足. 该负结果能说明作者配方下 prefix 更稳定,不能建立所有 cross-attention 的一般劣势. BLIP-2 等模型已经证明少量 query cross-attention 可以训练,任务与初始化不同.

### 6.10. Dense kernel 未必利用 block 稀疏性

四块 mask 中有右上 $m\times n$ 禁止区和 query 上三角禁止区. 若实现仍计算完整 $(m+n)^2$ score 再填 $-\infty$,FLOPs 不会按可见边数减少. 可见边数为

$$
m^2+nm+\frac{n(n+1)}{2}.
$$

当 $n=m$,约为 $2.5m^2$,完整矩阵为 $4m^2$,理论可跳过 37.5%. 是否实际节省取决于 kernel. 官方实现使用定制 Qwen2 encoder 与 FlashAttention/SDPA 路径,论文没有报告 mask 稀疏带来的速度.

### 6.11. Encoder 成本与 decoder 成本分开

encoder 内部处理 $2m$ 位置,输出只保留 $m$ query. decoder 因而与上一代接收相近视觉长度,KV cache 不翻倍. 新增计算主要是 500M encoder 对混合序列的前向.

文档输出可能有数千文本 token,decoder 自回归成本占比较大;短 OCR 输出中,encoder 占比更高. 官方仓库称 PDF 并发速度与上一代相当,但没有同硬件完整表. 结构上不能直接推出等速,还要看 kernel,encoder 参数和生成长度.

### 6.12. 视觉因果不等于统计因果

这里的 causal 表示 query attention 遵守时间方向,$h_i$ 不读取 $h_{>i}$. 它没有定义干预 $do(X=x)$,没有识别图像元素的因果图,也没有排除混杂. 「Visual Causal Flow」应理解为视觉表示的自回归信息流.

例如 query 先读标题再读正文,只说明计算依赖顺序,不说明标题导致正文. 如果把该模型用于因果问答,仍需专门数据和目标. 术语边界写清后,方法的新意仍然成立:视觉 encoder 首次显式加入可学习的因果读取序列.

### 6.13. Raster 顺序并非完全无效

大多数文档采用从左到右,从上到下或固定栏序,raster 提供强空间局部性. 双向 ViT 后的 token 虽按 raster 进入 decoder,每个 token 已含全局信息,decoder 也可重新注意. baseline 87.36 已说明固定顺序能完成大量任务.

causal flow 的收益更可能集中在 raster 与语义顺序冲突的页面:多栏,表格,公式,混合图文. 若在单栏纯文本上提升也很大,原因可能包括更强 encoder 或训练数据变化. 按布局复杂度分层的消融比 overall 更能验证动机.

### 6.14. Reading-order edit distance 测的是输出顺序

指标比较预测元素序列与 ground-truth order. 从 0.085 降到 0.057 表明输出更接近标注顺序. 它没有直接测 query attention 顺序. decoder 自身改进,layout label 合并和更多训练也能影响输出.

因果 query 与指标方向一致,属于机制与结果的关联证据. 严格因果归因需固定数据和 decoder,只替换 mask 或 query. 论文没有完整消融,所以应将结论落在整套 DeepEncoder V2 上.

### 6.15. 公式改善可以由树形依赖解释

二维公式包含基符号,上下标,分子分母和矩阵格. LaTeX 输出是一维深度优先或语法顺序. query 序列可以先聚合结构锚点,后续 query 根据此前状态读取从属区域.

以分式为例,先识别分数线和整体边界,再分别读取分子分母比单纯 raster 更接近 LaTeX 生成依赖. 但模型没有显式语法树监督,是否真的采用这一顺序未知. Formula CDM 从 84.14 到 90.31 支持表示更适合结构恢复,不能单独证明 attention 路径.

### 6.16. 表格需要二维坐标与序列协议共同成立

表格输出通常先表头,再逐行 cell. 合并单元格使 raster patch 与 cell 顺序不一致. causal query 可让后续槽位携带已读表头状态,decoder 更容易保持列语义.

soft query 仍没有显式 row/column id. 大表格中,相同数字和空单元格会造成对齐歧义. 结构 decoder 或 layout graph 能提供更强约束. OCR 2 的 TEDS 改善说明当前表示有效,不等于彻底解决复杂表格.

### 6.17. Newspaper 暴露视觉容量上限

报纸常有多栏小字与插图,1120 token 需要同时保存内容和顺序. OCR 2 文本 ED 0.139 略差于 baseline 0.131,reading order 只微幅改善. 新 encoder 无法弥补所有容量不足.

若增加 crop 后文字改善而 order 不变,瓶颈在细节;若补报纸数据后 order 改善,瓶颈在布局学习. 两轴实验可以拆分论文提出的两种解释. 目前 250k 报纸样本与 token 上限同时变化,无法选择唯一原因.

### 6.18. Crop 数是离散的测试时计算旋钮

视觉 token 数为 $n=256+144k$,其中 $k\in[0,6]$. 每增加一块,token 增加 144,encoder 对相应 crop 单独运行,decoder 前缀也增长. 页面密度路由决定质量与成本.

固定最多 6 块会使超大或超密页面仍被压缩. 允许更多块可提高覆盖,也可能超过训练分布和上下文预算. 自适应策略应在模型见过的范围内选择,并监控截断.

### 6.19. 三阶段训练对应三个坐标系对齐

第一阶段让 Qwen2 encoder 接受视觉 token 并让 query 可由轻量 decoder 解码,解决视觉—序列接口. 第二阶段接入最终 MoE decoder,让 query 表示进入目标语言空间. 第三阶段固定 encoder,让 decoder 在稳定输入上吸收更多数据.

每次冻结都把一侧变成参照坐标. 若所有模块始终共同移动,loss 可以下降,中间表示却可能持续漂移,后续大规模 decoder 训练更难复用缓存或稳定收敛. 冻结降低适应自由度,换取吞吐和目标稳定.

### 6.20. 第一阶段的轻量 decoder 是训练探针

轻量 decoder 不进入最终模型,职责是把 query 表示变成可监督文本. 如果 query 不能承载阅读内容,next-token loss 会直接推动 encoder 修正. 使用完整 3B decoder 从头对齐成本更高,强 decoder 还可能用语言先验掩盖 encoder 缺陷.

轻量 readout 能否迫使视觉表示更忠实,取决于容量. 太弱会限制训练上限,太强又失去探针作用. 论文没有给轻量 decoder 规模和消融,只能确认两阶段接口预训练是最终配方的一部分.

### 6.21. 冻结 tokenizer 固定了局部信息上限

第二阶段开始 SAM-conv tokenizer 冻结. 后续 reading-order loss 能调整 query encoder,不能改变低层 patch 与下采样. 若报纸小字在 tokenizer 中已丢失,增加 query 也无法恢复.

冻结的好处是低层视觉分布稳定,训练内存降低. OCR 2 重点研究顺序而非重新学习字符感知,沿用上一代 tokenizer有利于比较. 新布局或更高分辨率任务可能需要解冻或重新训练前端.

### 6.22. 第三阶段吞吐翻倍来自反向图缩短

冻结 encoder 后,无需保存其大部分反向激活,也不计算 encoder 参数梯度. 在相同硬件和 batch 下,训练速度超过两倍符合这一结构. forward 仍必须生成视觉 token,所以提升不等于 encoder 成本消失.

decoder 数据量增加能改善语言展开,重复和格式. 因此 production repetition 下降可能部分来自第三阶段,不能单独视为 query 重排证据. reading-order benchmark 与架构动机更直接,仍受数据变化影响.

### 6.23. 数据 sampling 改动影响分项权重

OCR 1.0 sampling 调成 3:1:1,意味着不同文档或任务子集的训练曝光改变. formula,table 和 layout label 合并也会改变优化目标. 若恰好增加结构数据,公式和表格提升不全来自 encoder.

严格消融应形成 2×2:旧/新 encoder 与旧/新数据配方. 只比较旧+旧和新+新时,能证明产品迭代有效,不能分解架构与数据贡献. 论文对数据变化作了说明,阅读结果时应保留这项混杂.

### 6.24. Overall 91.09 的组合不能当作单一准确率

OmniDocBench 汇总文字 ED,公式 CDM,表格 TEDS 与 order 等异质指标. 各指标尺度和方向不同,overall 由 evaluator 规范聚合. 91.09 不表示每 100 字识别 91 个.

模型选择应查看自身文档类型. 普通合同关心文字与表格,科研论文关心公式,报纸关心小字和多栏. Overall 提供共同排名,分项决定是否满足任务.

### 6.25. Table 方向标注也需要以 evaluator 为准

reading-order edit distance 按定义越低越好,论文文字也把 0.085 降到 0.057 解释为改善. 若版面抽取中的箭头与此冲突,应以指标定义和官方 evaluator 行为判断. 不应为了表格符号强行反转结论.

类似地,CDM 与 TEDS 通常越高越好,文字 ED 越低越好. 将它们直接平均前必须按规范转换. analysis 引用同列变化,不自行重算 overall.

### 6.26. Repetition rate 反映一种明确失效

自回归 decoder 进入循环时,会重复行,段落或标签. reading-order representation 更清楚可能减少模型在页面位置上迷失,第三阶段 decoder 训练也可能增强终止. 在线从 6.25% 到 4.17%,PDF 从 3.69% 到 2.88% 是实用改进.

该指标只标记重复,漏段,错字和错序仍可能存在. 线上无 ground truth 时选择它是因为可自动观察,不表示其覆盖完整质量. 应把它放在健康监控而非准确率位置.

### 6.27. query attention 可解释性需要防止过度解读

绘制 $\alpha_{ij}$ 可以看到第 $i$ 个 query 关注哪些 patch. 多层多头 attention 经过残差和 FFN 后,单层权重不等于信息贡献. attention rollout 或输入遮挡能提供补充,仍不能证明人类式眼动.

若 attention 重心随 $i$ 沿 reading order 移动,是支持 latent order 的证据. 若没有清晰路径但性能提升,模型可能把 query 当成有序语义 basis. 两种机制都有效,只是论文的认知类比强度不同.

### 6.28. Query collapse 是潜在失败模式

多个 query 可能关注相同显著区域,忽略小字. 若 $\alpha_i$ 与 $\alpha_j$ 高度相似,有效槽位少于 $n$. 训练只看最终输出,语言 decoder 可能在简单页面容忍这种冗余.

可以测 attention 分布间相似度,覆盖率和每个视觉 token 被读取的总质量. 加 diversity regularization 能减少 collapse,也可能强迫模型关注无关空白. 论文没有报告 query 多样性损失.

### 6.29. query 数多于视觉 token 时会发生再阅读

$n>m$ 时,额外 query 没有新输入 patch,只能以不同历史状态重新组合 $V$. 对复杂图形,前一轮 query 可以形成中间结论,后一轮据此再查询视觉记忆,类似固定 memory 上的多步推理.

因果层深度已经允许信息跨 query 传播,增加 query 又增加推理步数. 两者是否等价取决于网络:更深层在同一槽位更新,更多 query 创建新的序列位置并进入 decoder. 论文把此方向留作 re-examination,没有实验.

### 6.30. 问题条件若不进入 encoder,顺序难以任务自适应

文档 OCR 的目标顺序相对固定,图像本身足以决定. 通用 VQA 中,问题「右上角数字是什么」希望直接读目标区域;问题「描述人物关系」需要另一条路径. 若 text prompt 只给 decoder,encoder query 顺序不能随问题变化.

要扩展为通用 2D reasoning,可把文本条件加入 visual prefix 或让 query cross-attend prompt. 这会改变 mask 与训练,也可能让同一图像缓存失效. OCR 2 没有验证条件化 visual flow.

### 6.31. 通用二维推理可能需要循环感知

当前 encoder 一次接收固定分辨率图像,query 只能在已有特征中重读. 如果中间推理发现某处文字太小,无法请求更高分辨率 crop. 主动感知系统会根据 query 状态选择新区域,重新运行 tokenizer.

固定多 crop 是预先分配的计算,覆盖稳定但可能浪费. 动态 crop 更高效,选择错误会漏信息. Visual causal flow 提供选择状态,尚缺与图像工具交互的动作空间.

### 6.32. Omni-modal 共享需要区分局部 tokenizer 与全局 reasoner

图像用 SAM-conv,音频需要声学 tokenizer,文本直接有离散 embedding. 各模态局部结构不同,共享 500M reasoner 并不要求共享输入前端. query 输出可以统一 hidden dimension,让下游 decoder 接口一致.

共享 attention 和 FFN 是否正迁移取决于数据. 音频按时间天然有序,图像顺序需学习;同一 causal query 机制可能偏向一类. MoE 能让专家分工,论文当前 encoder 是否为 MoE 以及跨模态训练都未验证. omni-modal 是架构假说.

### 6.33. 相同 token 数不代表相同信息带宽

OCR 2 最大 1120 token 与其他模型计数相同,hidden dimension,量化精度和前端感受野仍不同. 一个 token 覆盖多少像素,包含多少全局上下文,决定可解码信息. token count 主要表示 decoder 序列长度.

比较 FLOPs 还需 encoder 参数,序列长度,attention kernel 与 crop 次数. 比较 KV 需 decoder 层数和 hidden layout. Table 2 的相同 token 上限提供了较公平的上下文位置口径,并非完整计算等价.

### 6.34. 可逆重排并非训练目标

hard permutation 可逆,知道 $P$ 就能恢复原次序. soft query 聚合可能丢失信息,多个视觉 token 的差异可映射到相同 $h_i$. OCR loss只要求输出文本,不要求重建 $V$ 或图像.

所以“reordering”不能推出保留全部视觉细节. 对 OCR 无关的颜色,纹理可能被丢弃;即使文字也受固定槽位限制. 若用于通用视觉,需要增加重建或多任务监督.

### 6.35. 位置编码仍然保留 raster 坐标

视觉 token 在进入 Qwen encoder 前带有二维或展平位置表达,query 才能知道 patch 来自哪里. 动态顺序建立在固定坐标基础上,不是抹去 raster. 模型先用坐标形成全图表示,再输出另一条有序 representation.

若完全删除视觉位置编码,相同 patch 集合无法区分排列,表格与公式结构会崩溃. causal flow 重排的是信息读取顺序,空间位置仍是关键输入.

### 6.36. soft attention 能表达重复与跳跃

人类阅读会回看表头或公式前提. hard permutation 每个 patch 只出现一次,无法表达回看;soft query 可让多个 $q_i$ 关注同一区域. 它也能跳过 padding 和装饰图案,把槽位用于文字.

这种灵活性解释等量 query 仍可能优于原视觉 token:数量没变,信息分配发生变化. 真正是否回看需 attention 或遮挡实验,论文只提出未来增加 query 支持 re-examination.

### 6.37. query 输出可能形成层次而非页面扫描

早期 query 也许编码全局布局,中期 query 编码区域,后期 query 编码字符细节,未必按页面阅读顺序逐块移动. decoder 可以同时利用层次特征和因果次序.

如果是层次分解,reading-order 改善来自更好的结构表示,而非直接排序 patch. 对通用视觉这可能更有价值. 对 query 线性探针分类标题,表格,正文和局部字符,可以区分两种解释.

### 6.38. decoder 仍然可能承担大部分排序

只有最终生成 loss监督 encoder,decoder 与 encoder 可共同分工. 强 decoder 可能读取无序 query 自己排序,encoder 只提升特征容量. 冻结 decoder 后单独训练新 encoder,或交换两代 encoder 与 decoder,能测分工.

论文保持 decoder 架构不变,但训练 checkpoint 与第三阶段数据不同,不是严格固定参数. 因而当前证据支持端到端系统,未精确量化排序转移了多少到 encoder.

### 6.39. 一个两栏反例说明 raster 的冲突

页面左栏行 $L_1,L_2$,右栏行 $R_1,R_2$. 正确顺序为 $L_1,L_2,R_1,R_2$. 按水平扫描 patch,若两栏同高,视觉序列可能交替出现 $L_1,R_1,L_2,R_2$. decoder 必须跨过右栏恢复左栏连续性.

causal query 可令前两个槽位都关注左栏,后两个关注右栏. 但如果训练 ground truth 采用逐行跨栏顺序,同一图像的目标又不同. 模型学习的是标注协议,不存在脱离任务的唯一“自然”顺序.

### 6.40. 一个表格反例说明顺序不止是坐标排序

两级表头中,顶层表头跨多列,子表头位于其下. 单纯按 y 再 x 排序会先读所有顶层格,再读子格;Markdown 序列可能需要按行输出,同时为 colspan 编码. 语义顺序依赖输出协议.

query 全局读取能把跨列关系合入 representation,decoder 仍负责具体 HTML/Markdown 线性化. 所以 encoder 的 latent order 与最终 token 顺序无需一一对应,它只需降低 decoder 难度.

### 6.41. 失败的 cross-attention 对照缺少哪些信息

判断不收敛至少需要训练 loss,梯度范数,不同随机种子,参数量和学习率. 若 mBART 初始化期待文本 encoder states,视觉分布失配可能造成优化失败. query 数,位置编码与 normalization 也会影响.

论文一句未收敛足以解释为何没有采用该结构,不足以形成理论结论. 复用时不应把 cross-attention 列为禁用方案;应将 prefix 结构视为已有成功证据的默认选择.

### 6.42. 三阶段数据量如何手算

第二阶段 global batch 1280,15k iteration,若每步满 batch,样本暴露约

$$
1280\times15000=19.2\text{M}.
$$

第三阶段 20k iteration 对应约 25.6M,合计 44.8M 次样本暴露. packed sequence 中一个样本定义和重复采样会改变独立图像数,该计算只给训练吞吐口径.

第一阶段明确约 100M image-text pair,与后两阶段并非简单同分布叠加. 三阶段总暴露至少在亿级,架构收益与充分训练共同出现.

### 6.43. 学习率降低对应参数漂移风险降低

第一阶段从 $10^{-4}$ 衰减,需要大幅改造 Qwen2 视觉接口;第二阶段峰值 $5\times10^{-5}$,encoder 与最终 decoder 联合对齐;第三阶段从 $10^{-6}$ 到 $5\times10^{-8}$,只做稳定 decoder 适配. 数量级逐阶段下降.

若第三阶段仍用高学习率,固定 encoder 上的 decoder 可能遗忘已有语言与格式能力. 很低学习率配合更多数据更像收敛打磨. 没有阶段指标时,无法知道 20k step 主要改善 accuracy 还是 repetition.

### 6.44. 报纸数据 250k 的“少”是相对架构需求

250k 对普通微调并非绝对小,但 DeepEncoder V2 从头学习复杂报纸顺序,版式变化巨大,相对整体亿级数据占比低. 旧 CLIP encoder已有视觉布局先验,新 Qwen2-based encoder需要更多适配.

增加同模板报纸可能提升训练分数却不改善新出版物. 数据扩展应覆盖栏数,语言,字体,广告与扫描质量,同时去重版式模板.

### 6.45. 生产 repetition 需要定义检测规则

重复率取决于如何判重复:n-gram 阈值,连续重复长度,是否忽略表格合法重复. 若两个版本使用相同检测器和流量分布,相对变化有意义. 样本量与置信区间未公开,绝对百分比的统计误差未知.

表格行中相同空 cell 可能被误判,整段循环又非常明显. 更完整监控应分段落重复,行重复,token loop 与合法模板重复. 论文只给聚合率.

### 6.46. Grounding 输出可帮助验证 latent order

官方 prompt 支持带 layout 的 Markdown 与 grounding. 若输出元素带坐标,可将生成顺序映射回页面轨迹,再与 query attention 比较. 这提供不需要眼动标签的弱监督验证.

若 query 顺序与输出区域顺序相关,遮蔽对应 query 应主要损害相邻输出段. 逐 query ablation 能测因果贡献. 论文没有报告,公开权重使后续研究可以完成.

### 6.47. 图像 padding 会产生无效视觉位置

global view 适配固定 1024,长宽比页面可能 padding. 双向视觉 token 会看到空白,query 可以学会跳过. 这是一种动态重分配收益:原始 raster 序列保留空白槽位,query 输出可以把多个槽位都用于内容摘要.

query 数仍等于总 visual token,跳过空白不会减少 decoder 长度. 空出的表示容量可重复编码有效区域,但若要真正节省长度,需动态减少 query. 当前方案优化信息布局,没有按有效面积缩短上下文.

### 6.48. Query 的 soft 重复可能提高鲁棒性

同一关键标题被多个 query 编码时,局部表示损坏不会完全丢失信息. 冗余降低压缩效率,提高可靠性. $n=m$ 给模型留出这种自由.

对普通字符逐个重复会浪费槽位,训练损失会权衡. 没有显式容量约束时,模型如何分配冗余取决于数据频率和 decoder attention. 关键字段未必自动获得更高冗余.

### 6.49. OCR 2 与上一代的核心差异不在压缩倍率

两代都保留 SAM-conv 的 16 倍空间压缩和相近 decoder 视觉 token 上限. OCR 2 没有追求把 1120 再压到更少,而是让相同预算中的信息顺序更适合生成.

上一代回答「多少视觉 token 能保存页面」,第二代回答「这些 token 以什么条件结构交给语言模型」. 两个问题互补:容量不足时重排救不了小字,容量充足但顺序混乱时 causal query 能降低 decoder 负担.

### 6.50. 与 Q-Former 的区别落在 query 间依赖

传统 Q-Former 常让一组 query 双向交互并 cross-attend image,目标是抽取固定数量视觉表示. OCR 2 query 使用 causal self-attention,第 $i$ 个显式依赖前序而不看未来,形成有向序列.

双向 query 更像无序槽位集合,causal query 更适合输出有顺序的中间表示. 如果任务不需要顺序,双向可能利用全部 query 共同优化. 论文没有直接 Q-Former 对照.

### 6.51. decoder-only prefix 统一了注意力算子

visual prefix 与 query 共用 self-attention 参数,通过 mask 区分角色. 不需要单独 cross-attention layer,便于从 Qwen2 初始化和复用 LLM kernel. 结构简单是工程与优化优势.

共享投影也意味着视觉和 query 的 $Q,K,V$ 在同一坐标系. 这可能促进读取,也可能让两类 token 竞争参数. token-type embedding 或不同 normalization 能帮助区分,具体实现应以官方代码为准.

### 6.52. 位置旋转编码的序列含义改变

Qwen2 使用面向一维文本的 RoPE. visual token 与 query 拼接后,query 位置位于视觉 prefix 之后. 相对位置既编码视觉 raster 索引,又编码 query 因果步. 这不是原生二维位置关系.

视觉 tokenizer 自身已注入空间信息,全局 encoder可从内容恢复二维关系. 若直接依赖一维 RoPE,远距离 patch 的几何关系可能失真. 论文性能说明当前组合可用,没有比较二维 RoPE.

### 6.53. Query 输出进入 decoder 时需要新的位置体系

encoder 输出 $h_1,\ldots,h_n$ 按 query 顺序作为视觉前缀. decoder 给它们自己的序列位置,不再看到原视觉坐标. 位置语义由 encoder hidden state携带.

若 query 顺序有效,decoder 的相对位置能表示阅读流程;若无序,decoder仍可用内容 attention. 这正是 architecture 把空间到序列转换集中在 encoder 的地方.

### 6.54. 输出投影只取 query 是结构不变量

如果同时把视觉 token 与 query 送入 decoder,上下文长度翻倍,decoder也可能绕过重排直接读 raster prefix. 只取 query 强迫下游依赖 causal flow 输出.

训练时 visual token 仍通过 query loss收到梯度,不会因被丢弃而失去监督. projection $\pi_Q$ 既控制预算,也形成信息瓶颈. 实现误取前半序列会退化成普通视觉 prefix.

### 6.55. 一个最小矩阵可验证 mask

令 $m=n=2$,序列为 $[v_1,v_2,q_1,q_2]$. 合法可见矩阵应为

$$
\begin{bmatrix}
1&1&0&0\\
1&1&0&0\\
1&1&1&0\\
1&1&1&1
\end{bmatrix}.
$$

这个单测能发现上下三角方向,visual→query 泄露和 query 无法看全视觉三类错误. 再检查输出 shape 只保留索引 2,3,即可验证核心数据流.

### 6.56. 因果 query 的训练可以并行

虽然依赖是 causal,训练时已知全部 learnable query,masked self-attention 可一次矩阵计算所有位置,无需像生成 decoder 那样逐 query 采样. 推理 encoder 同样一次前向得到全部 query output,因为 query embedding 固定,不需要离散生成.

因此 causal flow 引入有向依赖,没有带来 $n$ 次串行解码. 它的延迟来自更长 attention 矩阵和更大 encoder,不是逐槽位 autoregressive sampling. 这是与第二级文本 decoder 的重要区别.

### 6.57. Query 并不产生新的离散内容

每个 query 是连续 learnable vector,输出由 attention 和 FFN确定. 没有 softmax 词表采样,也没有曝光偏差. 后序 query 读取的是前序连续 hidden state,训练和推理路径一致.

第二级 decoder 才逐 token 生成 Markdown,会受早期输出错误影响. 两级都称 causal,统计性质不同:encoder 是并行 masked representation learning,decoder 是自回归概率生成.

### 6.58. 训练 packing 要隔离不同页面

第一阶段使用 8K sequence packing. 若多个 image-text 样本放入同一序列,attention mask 必须阻止不同页面的 visual/query 互相读取,decoder loss也要按样本隔离. 否则后一个页面可看到前一个页面信息.

hybrid mask 已比普通 causal mask复杂,packing 再加入 block-diagonal 边界. 论文不展开实现,复现应为小 batch 构造两页完全不同输入,确认改变第一页不会影响第二页 query.

### 6.59. 模型参数增加改变容量基线

CLIP-large 约 300M,Qwen2 encoder 约 500M,增加约 200M. 即便使用相同双向 mask,更多层或宽度也可能提升 OCR. 参数差异约占总 3B decoder 的较小部分,对 encoder 本身却接近 67% 增长.

因此架构消融需匹配 encoder 参数或报告缩放曲线. 当前结果证明 500M causal-flow encoder 的系统优于旧 300M CLIP 系统,这是产品层结论.

### 6.60. 预训练来源改变知识类型

CLIP 通过图文对比学习视觉语义,Qwen2 通过 next-token prediction 学顺序与语言结构. 替换后,visual tokenizer继续提供图像感知,Qwen层更擅长序列组织. 这与文档 OCR 的线性输出契合.

Qwen2 初始权重没有直接看视觉 embedding,第一阶段 100M image-text pair承担跨模态转换. 若随机 Qwen结构也能达到相同结果,收益来自 architecture;若明显较差,文本序列预训练是关键. 论文未给该消融.

### 6.61. 文档之外的验证需要选择顺序敏感任务

普通图像分类对 token 顺序不敏感,无法检验 causal flow. 更合适的任务包括迷宫路径,流程图,漫画阅读顺序,多面板科学图与 GUI 操作序列. 它们要求从二维布局产生有序行动或描述.

若模型只在 OCR 上提升,可能学到文档模板;跨任务提升才支持通用 2D reasoner. 论文当前没有这些结果,所以未来主张需要新的基准.

### 6.62. 人眼类比的有效部分是条件注视

人类下一次注视依赖当前理解,query $q_i$ 依赖 $h_{<i}$,两者都具有历史条件. 类比到此为止. 人眼只有高分辨率中心凹,会移动采样位置;OCR 2 每个 query始终能软读全部压缩视觉 token.

模型也没有眼动持续时间,周边视觉或生理约束. 用「human-like」描述设计动机可以,不能把模型 attention 当成人类视觉认知模型.

### 6.63. 可靠归因需要最小消融矩阵

至少应比较旧 CLIP encoder,同参数双向 Qwen encoder,causal Qwen $n=m$,causal Qwen $n<m/n>m$,以及新数据上的旧 encoder. 每项报告 text,formula,table,order,参数,FLOPs与延迟.

再加入 query attention覆盖和按布局复杂度分层,才能回答性能来自容量,初始化,mask还是数据. 论文篇幅给出完整系统与基准,没有这套矩阵. 分析时应避免比实验走得更远.

### 6.64. 公开仓库提供哪些可核查接口

[DeepSeek-OCR 2 官方仓库](https://github.com/deepseek-ai/DeepSeek-OCR-2)发布权重,动态分辨率模式,推理入口与 encoder 实现. 代码中 `token_type_ids` 区分 non-causal visual token 与 causal query,Qwen2 encoder设置 hidden dimension 896,14 attention heads,2 KV heads等结构参数.

官方 README 给出默认输入 $(0\text{--}6)\times768^2+1024^2$,对应 $(0\text{--}6)\times144+256$ visual token. 这些公开接口能核查 token 算术与 mask 实现. 完整训练代码和全部消融配置未公开,重训练证据范围有限.

### 6.65. 论文证据与推导边界

[DeepSeek-OCR 2 论文](https://arxiv.org/abs/2601.20552)直接支持架构,训练阶段,数据改动,OmniDocBench 与 production repetition 数字. 本章关于条件分解,可见边数,query ratio 成本和 failure mode 的公式由公开结构推导,用于解释变量关系.

最强事实结论是 DeepEncoder V2 整套方案在相近 token 上限下改善文档解析,尤其 reading order. causal mask 的独立贡献,query 是否形成类似人眼的轨迹,通用 2D reasoning 和 omni-modal 迁移仍缺受控实验. 把已证效果和架构愿景分开,才能准确评价这项工作.

### 6.76. 指标上涨多少,要结合误差基数和样本组成理解

OmniDocBench 总分从 87.36 提升到 91.09,绝对增加 3.73 分. 若把满分与当前分数之差看成剩余误差,旧系统剩余 12.64 分,新系统剩余 8.91 分,相对减少约 $29.5\%$. 这种换算能说明三点多分并不小,但它仍只是聚合指标上的描述,不能直接推成所有类别的错误都减少三成.

文本编辑距离从 0.073 降到 0.048,相对降幅约为

$$
\frac{0.073-0.048}{0.073}\approx34.2\%.
$$

阅读顺序编辑距离从 0.085 降到 0.057,相对降幅约 $32.9\%$. 两项降幅接近,与“视觉表示和顺序组织同时改善”的解释相容. 公式 CDM 从 84.14 升到 90.31,若按剩余误差计算,减少约 $38.9\%$. 不同指标的量纲与上限定义不同,这些比例只能在各自指标内部比较,不能把 CDM 的六点提升说成比编辑距离的 0.025 更重要.

总分还受类别权重影响. 若普通论文页占比高,模型在论文版式上的进步会主导均值;报纸样本较少,即使该类退化,总分仍可上涨. 论文报告的 newspaper 编辑距离由 0.131 变为 0.139,说明新架构没有自动解决所有复杂布局. 报纸同时包含密集多栏、大小标题、图片说明、广告和不规则留白,正好会放大固定 query 预算、多尺度重复与偏序歧义.

对这个退化至少有三种可检验解释. 其一,约 250k 报纸训练样本仍不足以覆盖版式年代、语言和扫描质量;其二,query 学到主流论文与网页的阅读先验,面对新闻版面时路径偏置更强;其三,动态裁剪把相邻栏切散,局部高分辨率信息与全局布局没有充分对齐. 增加报纸数据、仅改变 mask、仅改变裁剪策略的三组实验,可以区分数据、顺序模型和图像预处理的影响.

指标还应附带不确定性. 测试集有限时,样本构成稍有变化就会改变均值. 可以按页面 bootstrap 重采样,报告 95% 置信区间;对同一页面上的成对结果,使用配对检验比比较两个独立均值更有力. 如果 3.73 分远大于重采样波动,整体提升可靠;某个小类别的 0.008 退化若落在宽置信区间内,则只能说未观察到改善,还不足以断言稳定退化.

### 6.77. 从模型输出回到页面对象,才能处理长文档的一致性

单页 OCR 的输出通常是一段 Markdown,真实文档却由几十页甚至上千页组成. 页码、章节标题、脚注编号、跨页表格与公式引用形成跨页状态. DeepEncoder V2 的 causal flow 发生在单页视觉 token 内,不能天然记住上一页表格有几列、脚注编号走到哪里或章节层级是否闭合. 把每页独立解析后直接拼接,会留下大量文档级错误.

一种处理方式是把单页结果转成中间对象图. 节点表示标题、段落、图、表、公式、页眉和页脚,边表示包含、先后、引用与跨页延续. 页内 query 提供候选顺序,文档级模块再根据版式相似度、文本衔接和编号约束合并节点. 例如上一页表格底部没有闭合边框,下一页顶部列数相同且出现“续表”,两页节点可连接成一个表格对象.

文档级一致性还可反过来纠正 OCR. 某章节标题在目录和正文各出现一次,两个识别结果不同,可以利用字体、页码与字符串相似度选择更可信版本. 公式编号在正文中被引用,若 OCR 把“(12)”读成“(I2)”,引用图会暴露不一致. 这种纠错依赖结构约束,与让语言模型凭流畅度猜字符不同,证据可以定位到另一个页面对象.

长文档评测因此要增加跨页指标:标题层级是否连续,页眉页脚是否被正确去重,表格是否完整连接,引用目标是否存在,目录页码是否匹配. 单页编辑距离很低的系统,仍可能在这些项目上失败. OCR 2 提升了页内结构和顺序,为文档级解析提供了更好的输入;公开论文并未声称已经解决整本文档的一致性,二者不能混为同一能力.

### 6.78. OCR 2 的核心贡献应落在一个可证伪的判断上

这项工作的核心判断可以压缩成一句话:文档视觉表示在送入语言 decoder 前,需要一次带历史状态的有序重组. 旧方案把 raster 顺序当成既定输入,decoder 同时承担识字、布局理解和重排;DeepEncoder V2 让视觉侧先完成一部分重排,把更适合线性生成的表示交给 decoder.

这个判断可以被证伪. 若参数量匹配的双向 encoder 在所有版式上达到相同结果,causal query 的必要性就会下降;若随机打乱 query 顺序不影响输出,所谓阅读流并未真正写进 query 序列;若改善只出现在字符识别而 reading order 不变,收益更可能来自容量或数据;若冻结新 encoder、只训练 decoder 就能复制提升,视觉重组也不是主要原因.

反过来,若 query 顺序与页面偏序稳定对应,改变 mask 会专门损害顺序指标,同一结构在多种语言和反事实版面上仍成立,那么 causal visual flow 才从一个有效配方上升为可迁移的机制. 论文已经给出有竞争力的端到端结果和清楚的结构设计,但机制层面的证据仍有继续补齐的空间.

对读者而言,最有用的理解是抓住信息流变化:视觉 token 彼此双向融合,query 能读取全体视觉信息和此前 query,decoder 只接收 query 输出. 这三条约束共同决定模型能否在固定视觉预算内重组二维页面. 参数、数据、裁剪和 decoder 都会影响最终分数,任何单项归因都需要相应消融. 沿着这条边界阅读论文与代码,既能看见 OCR 2 真正推进的部分,也不会把尚待验证的解释当成既成事实.

它还给出一个实用的研究方向:视觉压缩不只是在空间维度减少 token,也可以在顺序维度重新组织信息. 后续模型若让 query 数量、裁剪尺度和阅读路径共同自适应,便有机会把固定预算分给真正困难的区域. 评价这种进展时仍应回到同一组问题:证据是否保留,顺序是否可靠,额外计算花在哪里,失败能否被检测出来. 这些问题能把架构名称还原成可测量的变量,也能避免只凭最终总分猜测内部机制.

### 6.66. 从二维页面到一维答案,真正困难的是保持偏序关系

文档阅读顺序经常被简化成一个排列问题:页面里有 $N$ 个区域,模型输出排列 $\pi=(\pi_1,\ldots,\pi_N)$. 这种写法适合排版规整的单栏论文,遇到脚注、跨栏标题、表格与浮动图就不够用了. 页面结构更接近一个偏序图 $G=(V,E)$:若区域 $a$ 必须先于区域 $b$ 阅读,就加入边 $a\rightarrow b$;没有边的两块内容可能允许多种合理顺序. 最终文本只是这个偏序图的一次拓扑排序.

这一区分会直接影响训练标签. 如果数据只保留单一线性序列,模型会把标注者的一种选择当成唯一真值. 两个语义独立的侧栏交换位置,生成内容仍然正确,逐 token 交叉熵却会给出巨大惩罚. 更合理的评测要把区域识别、区域内部转写与区域间次序拆开:前两项检查内容,后一项检查偏序约束是否被破坏. DeepSeek-OCR 2 报告的 reading-order edit distance 能测线性结果,但无法完全表达“多种拓扑排序都合法”的页面.

causal query 对这个问题的价值在于提供了一个连续决策状态. 设第 $i$ 个 query 输出为 $h_i$,它读取全部视觉状态 $V$ 和此前的 query 状态 $h_{<i}$:

$$
h_i=F_\theta(q_i,V,h_{<i}).
$$

$h_{<i}$ 可以编码哪些区域已经被覆盖、当前处于哪一栏、表格是否尚未闭合. 于是选择下一块内容不必只看二维坐标,还能看已完成的阅读历史. 这与贪心拓扑排序很像:每一步从当前入度为零的候选集合里选一个节点,输出后再更新状态. 模型没有显式构造图,但有能力在 hidden state 里近似维护这种约束.

可以设计一组比自然文档更干净的合成测试. 第一组页面只改变两栏之间的水平距离,文字和字号不变;第二组插入跨栏标题,要求标题先于两栏正文;第三组把脚注放到页面中部,但用标号把它与正文连接;第四组将表格拆成跨页片段. 如果 causal flow 真在学习偏序,它对这些结构变化应比 raster encoder 稳定,并且错误主要发生在关系模糊处,而非机械地跟随坐标. 这种测试能把“识字更准”和“顺序推理更准”分开.

### 6.67. Query 数量固定时,模型面对的是资源分配问题

DeepSeek-OCR 2 令 query 数与视觉 token 数相等,这样接口整齐,也避免额外搜索压缩率. 但从原理上看,固定的 $n$ 个 query 是一份待分配的表示预算. 一张只有标题和两行正文的页面不需要很多槽位,密集报纸、公式推导和大型表格却可能不够. 若所有页面都使用同一上限,简单页面浪费计算,复杂页面丢失细节.

把第 $i$ 个 query 对视觉 token 的注意力记为 $a_{ij}$,可定义覆盖量

$$
c_j=\sum_{i=1}^{n}a_{ij}.
$$

理想情况下,重要区域的 $c_j$ 足够大,空白与装饰区域得到较少预算. 若某些文字区域长期满足 $c_j\approx0$,说明模型漏读;若大量 query 的注意力分布高度相似,说明槽位发生冗余. 两个统计量可以分别写成覆盖损失与多样性损失:

$$
L_{\text{cover}}=\sum_{j\in\mathcal T}\max(0,\tau-c_j),\qquad
L_{\text{div}}=\frac{1}{n(n-1)}\sum_{i\ne k}\frac{a_i^\top a_k}{\lVert a_i\rVert\lVert a_k\rVert}.
$$

$\mathcal T$ 是含文本或结构信息的视觉区域. 论文没有报告这两项辅助损失,这里用它们说明如何诊断 query 是否真的分工,不代表官方训练目标. 甚至不必把损失加入训练,只画出注意力覆盖和相似度分布,就能判断性能提升来自顺序组织还是单纯增加 encoder 容量.

进一步可以让 query 数量自适应. 最直接的方法是预测停止概率 $p_i$,当累计停止置信度超过阈值便截断后续 query. 另一种做法先估计页面复杂度 $r(x)$,再从若干预算档位中选择 $n\in\{256,544,832,1120\}$. 训练目标需要同时考虑识别损失与计算代价:

$$
L=L_{\text{ocr}}+\lambda\,\mathbb E[n].
$$

难点不在公式,而在防止模型为了降低成本过早停止. 对漏字、漏表格单元格的惩罚必须明显高于多用几个 query 的代价. 在没有自适应实验之前,$m=n$ 应被理解为稳健的工程选择,还不能被解释成文档压缩的最优比例.

### 6.68. 局部裁剪与全局图不是简单的多尺度重复

官方默认动态分辨率由一张 $1024\times1024$ 全局图和最多六张 $768\times768$ 局部图组成. 全局图提供版面骨架,局部图保存小字、公式上下标和细表格线. 二者若只按空间位置拼接,同一段文字会出现多个尺度的重复表示. 模型需要判断这些 token 是同一对象的不同观察,否则 query 可能把一行字读取两次.

设全局 token 为 $g_u$,第 $k$ 个裁剪中的局部 token 为 $l_{k,v}$. 若已知裁剪框,可以把局部坐标映射回页面坐标:

$$
(x,y)=T_k(x_{k,v},y_{k,v}).
$$

这样 attention 不仅看到内容相似度,也能知道 $g_u$ 与 $l_{k,v}$ 是否覆盖同一区域. 如果实现只使用各自序列位置而缺少统一坐标,模型只能靠训练数据猜测对应关系. 它仍可能学会融合,但对裁剪数量、重叠率和页面长宽比的变化更敏感.

多尺度融合至少有三种失败方式. 第一种是重复:全局图已经识别的标题又被局部图复制一次. 第二种是冲突:全局低分辨率把字符识别成一种形式,局部高分辨率给出另一种形式,query 没有稳定选择高置信证据. 第三种是断裂:跨裁剪边界的公式或表格行被拆开,局部 token 各自正确,组合后次序错误. 因而测试不能只按页面平均编辑距离汇总,还应单列重复率、跨裁剪边界错误率与尺度冲突率.

一个有解释力的消融矩阵应保持 token 总数接近,分别比较“只有全局图”“只有局部图”“全局加无重叠局部图”“全局加重叠局部图”. 如果全局加局部仅因 token 更多而获益,等 token 的单尺度高分辨率输入应接近它;如果互补尺度确实重要,组合方案会在小字和布局两类指标上同时改善. 当前公开结果证明动态分辨率方案整体有效,没有完全拆开这几项贡献.

### 6.69. 解码错误应沿信息链逆向定位

OCR 系统最后输出一串 Markdown,观察到的错误却可能来自四个不同环节:图像采样损失、视觉编码丢失、query 排序错误、语言解码偏置. 若只看最终字符串,很容易把所有问题都归给 decoder. 更可靠的诊断方法是沿信息链逐层构造对照.

对字符误识别,先检查原始裁剪里字符是否还有足够像素. 若小数点在 resize 后已经消失,后面的模型不可能恢复可靠证据. 若像素清楚,再看 visual token 线性探针能否识别字符;探针能识别而 query 输出后不能,瓶颈在重排或压缩;query 表示仍可识别而最终 Markdown 错误,才指向 decoder 的语言先验.

对阅读顺序错误,可以给 decoder 输入按真值顺序重排的视觉表示. 若错误消失,encoder/query 是主要来源;若仍把双栏交叉生成,decoder 的训练模板或位置编码也有责任. 反过来,把 causal query 输出交给一个较弱但固定的 decoder,可以检查 encoder 改善是否跨 decoder 保留. 这种交叉替换比只比较两个端到端系统更能说明因果关系.

表格错误还要再拆一层. 单元格文本正确但行列边界错误,属于结构恢复;边界正确但字符错误,属于转写;合并单元格导致后续整行偏移,属于局部结构错误的级联. 公式也类似:变量识别、二维布局和 LaTeX 线性化是三种问题. 对它们使用一个总编辑距离,数值会遮住架构究竟改善了什么.

生产环境里的重复输出下降很重要,但“重复”也需要分类. decoder 可能在文本层陷入循环,也可能因为多个 query 重复覆盖同一区域而忠实地解码两次. 前者通常表现为无视图像边界的短片段循环,后者往往复制完整段落并对应相近视觉区域. 检查重复片段对应的 cross-attention 能区分两者,并决定该改解码策略、训练数据还是 query 多样性.

### 6.70. 训练三阶段的作用可以用梯度路径解释

第一阶段使用大规模 image-text pair,目标是让新视觉 encoder 与既有 decoder 建立基本接口. 此时若同时大幅更新 decoder,语言能力可能被噪声 OCR 数据拉偏;若完全冻结 decoder,encoder 必须把视觉信息投射到 decoder 已熟悉的表示空间. 这是一种强约束,有利于稳定对齐,也可能限制新 encoder 表达特殊版面结构.

设损失为 $L$,视觉 encoder 参数为 $\theta_e$,decoder 参数为 $\theta_d$. 冻结 decoder 时只有

$$
\theta_e\leftarrow\theta_e-\eta\nabla_{\theta_e}L,
$$

$\theta_d$ 仍参与反向传播以提供梯度,但不更新. 解冻后两边共同适应,视觉表示未必继续保持易解释的“阅读路径”;decoder 也可能学会补偿 encoder 的顺序错误. 所以仅在最终模型上看 query attention,不能断言它就是第一阶段形成的机制. 按阶段保存 checkpoint 并比较注意力、线性探针和输出错误,才能看到能力在哪里产生.

第二阶段加入文档数据后,模型从一般图文理解转向结构化解析. 关键的数据属性包括结构覆盖，而样本总量本身不足以描述它:单栏、双栏、复杂表格、脚注、竖排、扫描噪声各占多少. 如果新增语料恰好补足了旧模型最弱的版式,性能提升可能主要来自数据. 架构与数据同时变化时,必须用旧 encoder 加新数据、新 encoder 加旧数据的交叉实验拆分贡献.

第三阶段引入更多任务和高质量数据,往往改善指令遵循与输出格式. 它也可能造成遗忘:模型更愿意输出漂亮 Markdown,却漏掉无法自然排版的页眉编号、印章或边注. 检查每阶段在统一测试集上的变化,尤其是罕见类别的回退,比只展示最终平均分更可靠. 三阶段训练是一条有效配方,但每阶段的因果作用不能仅从顺序本身推出.

### 6.71. 位置编码决定模型能否把“看见”变成“在哪里”

视觉 token 的内容向量告诉模型局部出现了什么,位置表示告诉模型它位于页面何处. 文档中大量关系只靠内容无法判断:两个相同的页码分别位于页眉和目录,两个“合计”分别属于不同表格. 若位置编码不能稳定表达二维距离、方向与尺度,query 再强也只能依赖模糊的序列索引.

把二维坐标 $(x_j,y_j)$ 映射成位置向量 $p_j$,视觉输入为 $e_j=z_j+p_j$. 若裁剪图各自从坐标零开始,不同裁剪的左上角 token 会共享近似位置;只有附加裁剪编号或全局坐标变换,模型才能区分它们. 对长页面而言,绝对坐标还应按页面尺寸归一化,否则同一相对位置在不同分辨率下对应不同数值范围.

关系型任务更需要相对位置. 对 query $i$ 和视觉 token $j$,attention logit 可加入二维相对偏置

$$
s_{ij}=\frac{(W_Qh_i)^\top(W_Ke_j)}{\sqrt d}+b(\Delta x_{ij},\Delta y_{ij},\Delta s_j).
$$

$\Delta s_j$ 表示尺度或裁剪层级. 这种偏置能直接表达“同一行右侧”“下一栏顶部”“全局图与局部图同一位置”. 但 query 本身没有天然二维坐标,$\Delta x_{ij}$ 从哪里来仍是问题:可以让 query 预测当前注视点,也可以从前一 query 的注意力中心估计. 这会把隐式阅读路径变成可观测状态.

验证位置泛化时应改变版面而不改变文字. 例如把同一段落整体平移、交换左右栏、扩大页边距、将 A4 页面改成长图. 内容正确而顺序随位置变化,说明模型确实使用坐标;平移就崩溃,说明它记住了训练模板的绝对位置. 论文的自然测试集覆盖真实分布,这类反事实页面则更适合检验机制.

### 6.72. 参数量、注意力形状与实际吞吐不能混成一个“更高效”

DeepEncoder V2 基于约 0.5B 的 Qwen2 encoder,相较旧视觉 encoder 容量更大. 同时,hybrid mask 让长度为 $m+n$ 的序列进入 self-attention. 若朴素实现完整矩阵,每层注意力计算近似

$$
C_{\text{attn}}\propto (m+n)^2d.
$$

当 $m=n$ 时是 $4m^2d$,而只在 $m$ 个视觉 token 上做 self-attention 约为 $m^2d$. mask 删除了一部分逻辑连接,未必自动减少底层矩阵乘法;只有稀疏 kernel 或分块实现真正跳过被遮挡区域,理论边数才会转化为时间节省.

端到端吞吐还包括图片解码、动态裁剪、视觉 encoder、文本 decoder 与后处理. decoder 输出越长,自回归部分越可能成为主耗时;页面很短时,更大的 encoder 占比上升. 所以“与旧版速度相当”是一条整体观察,不能推出 encoder 本身同样快,也不能推出每种分辨率和输出长度都相当.

公平速度比较至少要固定硬件、精度、batch size、输入 token 数、最大输出长度和停止条件,同时报告预填充与逐 token 解码. 显存峰值也要单列,因为更长 encoder 序列会保存更多激活和 KV. 若只报告每秒页数,高分辨率页面比例与平均输出长度稍有不同,结论就会漂移.

质量—成本曲线比单点排名更有用. 对每个视觉预算 $b$,记录文本、公式、表格、顺序指标与延迟 $t_b$,得到 Pareto 前沿. 新模型若在同延迟下质量更高,或在同质量下延迟更低,才能称为效率改进;若只是使用更多 encoder 参数换取更好结果,它仍然可能值得采用,但理由是质量而非计算节省.

### 6.73. 需要专门测试语言先验是否覆盖视觉证据

强语言 decoder 能修正 OCR 噪声,也会“读出”图中没有的内容. 常见句子缺一个模糊字时,语言模型补全通常正确;合同编号、药品剂量、代码和公式中同样的补全可能造成严重错误. 系统平均编辑距离改善,不等于事实字符的可靠性同步改善.

可以构造最小对抗样例:只改变票据编号的一位数字、把常见词替换成罕见专名、将公式中的 $+$ 改成 $-$,其余像素保持不变. 若输出仍偏向高频文本,说明 decoder 先验压过视觉证据. 再把关键字符区域提高分辨率,观察预测是否随证据改变,可区分视觉 encoder 未看清和 decoder 不愿相信两种情况.

概率校准也很关键. 对最终 token $y_t$,模型给出条件概率 $p(y_t\mid y_{<t},H)$. 高置信错误若集中在罕见实体,说明概率主要来自语言流畅度. 可以遮掉对应图像区域,比较完整图与遮挡图的对数概率差:

$$
\Delta_t=\log p(y_t\mid y_{<t},H)-\log p(y_t\mid y_{<t},H_{\setminus R}).
$$

若关键字符的 $\Delta_t$ 很小,该输出几乎不依赖对应视觉区域. 这类归因检查比观察 attention 热图更直接,因为它测的是删除证据后预测是否变化.

对高风险文档,系统还需要拒答或标记不确定区域. query 覆盖不足、多个尺度证据冲突、decoder 概率分布平坦都可以形成置信信号. DeepSeek-OCR 2 的论文重点是整体解析能力,没有建立完整的字符级可信度体系. 应用到财务、医疗或法律文档时,这部分不能由较高的平均 benchmark 分数代替.

### 6.74. 跨语言、竖排与特殊符号检验的是同一架构的外推能力

拉丁文字通常按左到右、上到下排列,中文古籍可能竖排并从右向左换列,阿拉伯文字在行内从右向左,数学公式又具有二维嵌套. 一个由英文论文训练充分的 reading flow,未必自然迁移到这些方向. causal query 的优势是路径可由内容和历史决定,风险是它会把主流训练分布中的方向固化成强先验.

跨语言测试应控制版面与字符难度. 同一双栏模板分别填入中、英、阿拉伯文本,可以观察错误来自文字识别还是列顺序. 同一种文字分别做横排与竖排,可以测路径能否反转. 对混排页面,标题为中文、正文为英文、公式嵌在段落中,模型还要在局部切换顺序规则,单一全页方向不够.

特殊符号的麻烦在于视觉差异很小、语义影响很大. 上下标、根号覆盖范围、矩阵行列和化学式电荷都依赖二维关系. 把它们压成 Markdown 或 LaTeX 时,输出序列必须插入成对标记. causal query 如果先组织局部结构,能减轻 decoder 的搜索;若 query 将相邻公式片段交错排列,decoder 再强也难以恢复.

评价这类能力不能只统计字符准确率. 公式应检查语法可编译性与结构等价,表格应检查单元格树,竖排文本应检查列级顺序. 多语言平均分还会被高资源语言淹没,需要按语言、方向、版式分别报告. 目前公开结果足以说明模型在综合文档集上的提升,对所有书写系统的稳定性仍需更细数据支撑.

### 6.75. 一套能验证核心主张的复现实验

复现不必一开始追求完整训练规模. 先选取包含单栏、双栏、表格、公式、报纸和扫描件的分层子集,保证每类都有足够样本. 固定 tokenizer、decoder、图像预处理与训练步数,只替换 encoder 结构,就能回答 hybrid causal flow 是否在小规模下产生一致趋势.

第一组实验比较四种 mask:视觉与 query 全双向、全因果、视觉双向加 query 彼此独立、视觉双向加 query 因果. 全双向缺少阅读历史方向,全因果会限制视觉 token 获取右侧上下文,独立 query 只能各自读取整图,最后一种才是论文结构. 如果提升主要出现在 reading order 而字符准确率变化较小,证据与设计动机吻合.

第二组固定 mask,改变 query 数量 $n/m\in\{1/4,1/2,1,2\}$. 记录质量、显存、延迟以及 query 注意力相似度. 若 $n=2m$ 几乎无增益且相似度升高,说明一比一已接近饱和;若密集报纸仍随 $n$ 增长,固定比例限制了复杂页面. 结果应按页面信息密度分桶,否则简单页面会掩盖差异.

第三组检验数据混杂. 用同一新数据分别训练旧 encoder 和新 encoder,再用同一旧数据训练两种 encoder. 四个格子能粗略分离结构收益与数据收益. 若条件允许,再加参数量匹配的双向 Qwen encoder,排除“更大模型”这一解释. 每组至少运行多个随机种子,因为小数据 fine-tuning 的波动可能接近模型差距.

第四组做反事实页面. 平移段落、交换两栏、插入跨栏标题、改变裁剪重叠、把相同文字转为竖排. 这些样例不追求贴近线上分布,用途是探测模型究竟依赖内容、坐标还是模板. 同时保存 query-to-visual attention、query 间注意力和各层线性探针,把输出变化对应到内部状态.

第五组检查错误传播. 给 decoder 喂真值顺序的视觉区域,测其纯转写上限;给固定 decoder 喂不同 encoder 输出,测表示质量;将 OCR 2 encoder 接到较小 decoder,看收益是否保留. 最后把错误分成漏读、重复、错序、字符、结构和格式六类. 只有平均分与这些诊断方向一致,才能把改进可靠地归因给 causal visual flow.

复现实验的结论也应分层表达. 公开论文与仓库能直接确认结构、默认输入配置、训练阶段和报告指标;小规模复现能确认趋势是否存在;对 query 轨迹、偏序维护和跨任务迁移的解释属于机制假设,需要额外实验支持. 这种证据层级不会削弱模型成果,反而能告诉后续工作从哪里继续推进.
