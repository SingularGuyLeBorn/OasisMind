---
title: "Qwen3-VL: 交错 MRoPE, DeepStack 与文本时间戳把长上下文多模态做实"
category: "模型库"
tags: ["Qwen", "技术解析"]
published: true
excerpt: "Qwen3-VL 是 Qwen 视觉语言系列接到 Qwen3 语言模型底盘之后的旗舰多模态报告."
---
# Qwen3-VL: 交错 MRoPE, DeepStack 与文本时间戳把长上下文多模态做实

来源: [Qwen3-VL Technical Report](https://arxiv.org/abs/2511.21631) (arXiv:2511.21631v2, 2025-11-27; 文首日期 December 1, 2025). 仓库: https://github.com/QwenLM/Qwen3-VL. 对照译稿见同目录 `qwen3-vl-bi.md`. 表内数字以源文 `qwen3-vl.md` 为准.

Qwen3-VL 是 Qwen 视觉语言系列接到 Qwen3 语言模型底盘之后的旗舰多模态报告. 相对 Qwen2.5-VL, 主轴不是再从零训一整套窗口 ViT, 而是三条并行改写: 交错式 Interleaved MRoPE 把 t/h/w 频率均匀铺开; DeepStack 把 ViT 多层特征残差注入 LLM 前几层; 视频时间从 Qwen2.5-VL 的绝对时间位置编码改成显式文本时间戳 (如 `<3.0 seconds>`). 产品矩阵同时给 Dense (2B / 4B / 8B / 32B) 与 MoE (30B-A3B / 235B-A22B), 原生交错上下文顶到 256K token. 数据侧重做了 caption, OCR, 文档, grounding, 视频, STEM 与 agent 语料; 优化侧把 per-sample loss 换成 square-root 归一化的 per-token loss; 后训练再分叉 non-thinking / thinking, 加 Strong-to-Weak Distillation 与 SAPO 强化学习. 这几件事彼此咬合: 位置编码决定长视频能不能读准, 数据和 loss 权重决定文本能力会不会被稀释, 后训练决定小模型能拿到多少旗舰的推理.

RoPE / 多模态位置, YaRN, GQA, MoE, SFT, GRPO 的公式与推导见下面单独成篇, 这里只写它们在 Qwen3-VL 里怎么拼. RoPE 本体: [01-RoPE本体-旋转位置编码](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/01-RoPE本体-旋转位置编码/01-RoPE本体-旋转位置编码.md). 多模态与工程扩展: [02-RoPE扩展-长上下文、多模态与工程实现](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md). 长度外推 YaRN: [03-长度外推：从PI到YaRN的频率扩展](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/02-RoPE扩展-长上下文,多模态与工程实现/02-RoPE扩展-长上下文,多模态与工程实现.md). GQA: [03-GQA-在性能与缓存之间折中](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.2-注意力机制/2.2.2-多头注意力变体/02-MQA与GQA-共享KeyValue头/02-MQA与GQA-共享KeyValue头.md). MoE 一般讨论: [01-DeepSeek-MoE](../../../../LargeLanguageModelGuide/2-核心原理与架构/2.6-MoE/01-DeepSeek-MoE/01-DeepSeek-MoE.md) (Qwen3-VL 的 MoE 规格跟 Qwen3 骨干走, 具体激活参以本文旗舰 235B / 22B 为准). 高分辨率视觉 token 的成本问题: [8.2.4-高分辨率VLM的技术挑战](../../../../LargeLanguageModelGuide/8-多模态/8.2-视觉语言模型/05-高分辨率VLM的技术挑战/05-高分辨率VLM的技术挑战.md). SFT: [4.2-SFT](../../../../LargeLanguageModelGuide/4-后训练/4.2-SFT/4.2-SFT.md). 在线蒸馏: [01-OPD基础原理](../../../../LargeLanguageModelGuide/4-后训练/4.9-OPD/4.9.1-OPD方法与落地/01-OPD基础原理/01-OPD基础原理.md). 组相对策略梯度对照见 GRPO: [02-GRPO](../../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/01-GRPO/01-GRPO.md) 与 GSPO: [03-GSPO](../../../../LargeLanguageModelGuide/4-后训练/4.5-GRPO家族与RLVR/04-GSPO/04-GSPO.md) (本文推理 RL 算法写的是 SAPO, 不是把 GRPO 原样搬过来).

## 1. 谱系位置: 从 Qwen2.5-VL 绝对时间到 Qwen3 双模式多模态

相对同队前作 Qwen2.5-VL (Bai et al., 2025), 本报告把自己写成三条架构增量加一条优化改动: Interleaved MRoPE; DeepStack 跨层融合; 文本时间戳替换绝对时间对齐的 T-RoPE/MRoPE 时间分量; 训练目标从 per-sample loss 换成 square-root-normalized per-token loss. 语言骨干换成 Qwen3 系列, 于是 Dense / MoE 矩阵与 thinking / non-thinking 分叉一并进入视觉语言产品线. 引言反复强调: 多模态继续训不能侵蚀纯文本; 旗舰叙事里, Qwen3-VL-235B-A22B 在多数语言榜上要压过或追平其文本对照. 这句话要和 §9 的纯文本表对着看, 对照的是哪一版 Qwen3, 结论差别很大.

同队纯文本 Qwen3 报告负责双模式与蒸馏梯子; 本报告负责把那套骨干接到原生分辨率视觉前端, 并把上下文从常见的 32K / 128K 叙事抬到交错 256K. 能从正文直接读到的谱系关系只有: 初始化来自 Qwen3; 视觉编码器继续训 SigLIP-2 (小档用 Large 300M, 默认 SO-400M); Merger 仍是 2×2 MLP 压缩; DeepStack 另挂专用 merger; 后训练冷启动与蒸馏大量借用 Qwen2.5-VL / Qwen3 教师. 读 Qwen3-VL 应先把 Qwen2.5-VL 的动态分辨率与 MRoPE, 以及 Qwen3 的 thinking 分叉当作已存在的底座, 再看本代在频率交错, 多层视觉注入与文本时间戳上加了什么.

产品交付是六档: Dense 2B/4B/8B/32B, MoE 30B-A3B 与 235B-A22B. 旗舰总参 235B, 每 token 激活 22B. 每档再拆 Instruct (non-thinking) 与 Thinking. 这种「视觉前端共享配方, 语言后端按 Qwen3 梯子放大, 推理深度用 thinking 开关」的矩阵, 便于把 OCR, grounding, 长视频与 GUI agent 的收益同步摊到端侧与旗舰, 而不是为每档重训一个视觉塔.

选型时激活参与总参要分开报价. 30B-A3B 适合总参还能装下但推理成本按激活参算的场景; 32B Dense 适合不想上 MoE 路由又要在中档打 Gemini-2.5-Flash / GPT-5-mini 的场景; 235B-A22B 才是表 2 旗舰对标 Gemini-2.5-Pro / GPT-5 / Claude Opus 4.1 的那一列. 边侧 2B/4B/8B 的价值在蒸馏后的可用性与文档/OCR 甜区, 不在与旗舰比绝对分. 开源许可写 Apache 2.0, 入口在文首 Hugging Face / ModelScope / GitHub; 部署叙事同时覆盖端侧与万卡级预训练集群, 但具体量化档位与推理脚本以仓库为准, 不以本报告口算代替.

## 2. 架构: 位置编码, 跨层融合与视觉前端

### 2.1. Interleaved MRoPE: 为什么要打散 t/h/w 频率

Qwen2-VL / Qwen2.5-VL 的 MRoPE 把嵌入维切成 temporal / horizontal / vertical 三块, 各块挂不同旋转频率. 报告点名的问题是: 这种切块会让**频谱失衡**, 后续工作已观察到长视频理解变差. Qwen3-VL 的改法是把 t, h, w 分量交错铺进各维, 让每个时空轴在低频带与高频带都有代表 (Huang et al., 2025). 目标不是换一套全新位置几何, 而是去掉「某一轴长期占低频, 另一轴挤在高频」的偏置, 让长程视频位置更可信.

把频率对具体数一遍更清楚. RoPE 的 head_dim 为 128 时有 64 个频率对, 下标越小转得越快. Qwen2-VL 的配置按 [16, 24, 24] 切段 (仓库配置), 时间轴拿走最前面 16 对, 也就是频率最高的一段; 高度和宽度分走后面的中低频. 时间轴只有高频, 帧号一拉开, 这些通道转了很多圈, 相位混叠, 又没有低频通道去编码「隔了很远」. Huang et al. 的 MRoPE-I 论文正是这么诊断的. Qwen3-VL 仓库配置是 `mrope_section = [24, 20, 20]` 加 `mrope_interleaved = true`: 前 60 个槽位按 T, H, W, T, H, W 轮转, 最后 4 个最低频槽位只给时间 (仓库实现, 非本报告正文). 每根轴都从最高频铺到最低频, 时间轴还多占了最低频的尾巴. 纯文本 token 的 t, h, w 三个位置相同, 交错与否算出的 cos/sin 一样, 退化回 1D RoPE, 文本能力不受这次改动影响.

这与 Qwen2.5-VL 的「时间分量对齐绝对时间」是两条不同的手术. Qwen2.5-VL 解决的是「帧号不是墙钟」; Qwen3-VL 认为绑绝对时间会制造过大且稀疏的 temporal position id, 并强迫训练在多种 fps 上均匀采样, 数据造价高. 于是时间语义改走文本串, 位置编码侧回到更均衡的交错 MRoPE. 读图 1 时要把两条线分开: Interleaved MRoPE 管频谱; text-based timestamp 管事件时刻.

为什么不继续用绝对时间 MRoPE, 报告在 §2.3 给了两条限制: (1) 长视频 temporal id 过大过稀, 伤长时序理解; (2) 要学好就必须在多种 fps 上均匀采样, 抬高数据成本. 换成 `<3.0 seconds>` 或 HMS 文本前缀后, 上下文略变长, 但时间表示更直接, 也方便同时学秒制与时分秒制. 这不是否认 RoPE, 而是把时间监督从位置 id 挪到可被语言模型直接读的 token 串. 时间戳加在每个视频 temporal patch 前面, 按仓库实现一个 temporal patch 合并 2 帧, 所以每两帧多出一小段时间戳 token (推测, 报告只写「modest increase」).

长视频评测上, 报告把 interleaved MRoPE, **文本时间戳**与稠密时间 caption 扩容写成三位一体, 使得 8B 档已能逼近显著更大的 Qwen2.5-VL-72B. 这句话不能理解成「只换位置编码就等于 72B」; 它是架构改动加数据加上下文窗口共同作用后的总效果. Needle-in-a-Haystack (图 3) 再补一条外推证据: 视频按 1 FPS 均匀采样, 分辨率动态调节以保持视觉 token 预算恒定, 256K 内 30 分钟视频 100% 命中, YaRN 外推到约 1M token (约 2 小时) 仍 99.5%. 30 分钟按 1 FPS 是 1,800 帧, 塞进 262,144 个位置, 每帧约 146 个位置 (按 262, 144 / 1, 800 估算, 未扣文本与时间戳 token). 仓库 README 提醒: 交错 MRoPE 的位置 id 增长比普通 RoPE 慢, 从 256K 外推到 1M 时 YaRN factor 取 2 或 3, 不要按长度比取 4.

训练期时间戳会同时生成秒制与 HMS 两种格式, 逼模型读得懂多种时间码写法. 代价写得很坦白: 上下文略增. 收益是视频 grounding 与稠密描述这类「必须说出何时」的任务, 不再把时刻藏在难以解释的巨大 temporal id 里. 若你的业务主要是短视频分类, 几乎不问时刻, 文本时间戳的边际收益会小一些; 若业务是剪辑定位, 会议检索, 长课章节摘要, 这一改动才是主菜. 和动态 fps 采样对照着读: 采样密度仍可变, 但时刻标签改由文本串携带, 两者分工不同.

### 2.2. DeepStack: 多层 ViT 特征怎么进 LLM 而不涨上下文

**DeepStack** 原作 (Meng et al., 2024) 把高分辨率图像切出的多组视觉 token 按空间膨胀采样分成几组, 每组和全局视觉 token 等长, 再从底向上依次残差加进语言模型的若干层. 它的卖点是「视觉 token 翻几倍, 上下文长度不变」. Qwen3-VL 换了 token 的来源: 不再叠多尺度输入, 而是从 ViT 中间层抽特征. 选三个层级, 各自经专用 vision–language merger 投影, 再残差加到 LLM 前三层的 hidden states. 关键句是: 增强多层融合, **不额外增加上下文长度**. 视觉 token 序列长度仍由动态分辨率与 2×2 Merger 决定; DeepStack 走的是深层注入, 不是把三倍视觉 token 拼进 prompt.

落到代码更具体. transformers 的 Qwen3-VL 视觉配置默认 `deepstack_visual_indexes = (8, 16, 24)`, 视觉塔深 27 层; 每个抽取层配一个独立 merger, 结构与主 merger 相同, 只是多了 shuffle 之后的 norm; 主 merger 吃的仍是最后一层输出 (仓库实现, 非本报告). 注入时只在视觉 token 所在位置做加法, 文本 token 的 hidden state 不动. 按仓库实现写成式子, 设 $z^{(k)}$ 是 ViT 第 $k$ 层输出, $h^{(j)}$ 是 LLM 第 $j$ 层 decoder 的输出, $\mathcal V$ 是视觉 token 的位置集合,
$$h^{(j)}_p\leftarrow h^{(j)}_p+\mathbb 1[p\in\mathcal V]\cdot\mathrm{Merger}_j\big(z^{(k_j)}\big)_p,\qquad (k_0,k_1,k_2)=(8,16,24),\ j=0,1,2.$$
浅的 ViT 层对应浅的 LLM 层, 顺序一一对应. 这样三份特征在序列上和主视觉 token 一一对齐, 注入等于给每个视觉位置多叠了三层不同抽象程度的残差, 没有新位置, KV cache 也不变.

消融表 12 用内部 15B-A2B LLM, 预训练 200B token, 无后训练直接评验证集. Baseline AVG 74.7, DeepStack 76.0; 11 项里 10 项上升, 只有 TVQA 从 80.6 微降到 80.5 (按表计算). 涨幅最大的三项是 OCRB 81.0→83.6, InfoVQA 71.9→74.2, MMStar 55.5→57.7, ChartQA 81.5→83.3 与 DocVQA 89.5→91.1 紧随其后; MMBench 中英两项只涨 0.2 与 0.4. 报告把收益归因于细粒度视觉信息保留, 这个分布和归因吻合: 吃文字细节和版面的任务涨得多, 偏整体语义的问答几乎不动. 读消融时注意设定: 这是中等规模内部骨干上的预训练期对照, 不是旗舰 235B 的最终榜差; 它证明方向, 不替代表 2.

工程含义也清楚. 若只把 ViT 末层经单一 Merger 送进 LLM 第 0 层, 低层边缘与纹理信号容易在视觉塔深处被压扁. DeepStack 让 LLM 前几层直接看到不同抽象层级的视觉残差, 等价于给跨模态对齐多开几条短路. 代价是要维护多套 merger 参数, 并约定「哪一层 ViT 对应哪一层 LLM」. 报告选前三层 LLM, 是把视觉注入压在浅层, 避免整塔每层都灌视觉残差. 也因为这层注入, transformers 文档专门说明 Qwen3-VL 的文本部分「不是纯文本模型」: 把语言塔单拆出来时, 前三层已经习惯了视觉残差.

与窗口注意力那条线对照: Qwen2.5-VL 用窗口管视觉算力; Qwen3-VL 视觉编码器改继续训 SigLIP-2 + 2D-RoPE + 绝对位置插值 (CoMP), 算力叙事从「自研窗口 ViT」换成「强预训练视觉塔 + 动态分辨率续训」. DeepStack 则是在连接器侧补多层. 两条代际不要混成一句「视觉塔又重做了」.

### 2.3. 视觉前端与坐标约定: SigLIP-2, 2×2 Merger, [0,1000] 归一化

视觉编码器默认 SigLIP2-SO-400M, 2B/4B 小 LLM 用 SigLIP2-Large (300M). 在官方预训练检查点上继续做动态分辨率训练, 并用 2D-RoPE 与按输入尺寸插值的绝对位置嵌入. Merger 是两层 MLP, 把 2×2 视觉特征压成一个视觉 token, 对齐 LLM 隐层维. DeepStack 另部署专用 merger. 整体三模块: 视觉编码器, MLP merger, Qwen3 LLM, 见图 1.

续训后的 Qwen3-ViT 值不值, 看消融表 11. CLIP 阶段零样本: ImageNet-1K 84.2→84.6, ObjectNet 79.9→81.0, 内部 OmniBench 36.9→45.5, 涨 8.6; 但 ImageNet-R 96.1→95.7, ImageNet-S 76.2→74.5, 素描与艺术渲染这两项反而掉了 (按表计算). 接同一个 1.7B Qwen3 训 1.5T token 后, VLM 阶段五项全涨: RealWorldQA 58.7→66.1 涨 7.4, AI2D 74.1→76.2, OCRB 77.2→78.7, InfoVQA 65.3→67.0, OmniBench 50.1→53.0. 续训的数据偏真实照片, 文档与世界知识, 分布外的风格化图像有一点代价, 换来的是下游 VLM 任务的全面收益. OmniBench 是内部评测集, 外部无法核对.

相对 Qwen2.5-VL 的关键空间约定变化写在 §3.2.4: 本代 grounding 改用缩放到 [0, 1000] 的**归一化坐标系**, 不再走 Qwen2.5-VL 那套输入图像素绝对坐标. 报告给出的理由是: 对分辨率与宽高比更稳, 后处理更简单, 下游更好用. RefCOCO, ODinW-13, CountBench, 以及 3D 的 ARKitScenes / Hypersim / SUNRGBD 的定位实验都建立在这套 [0,1000] 约定上. 与上一代横比分数时, 先核对坐标协议, 再谈模型强弱.

3D grounding 把单目图 + 指称表达映射到 9-DoF 3D 框的结构化 JSON, 并按 Omni3D 统一到虚拟相机坐标系; 评测报 mAP@0.15, 置信度固定 1.0. 2D 开放词表检测 ODinW-13 同样把置信度设 1.0, 并把全部类别同时放进 prompt, 以便和专模检测器对齐. 这些评测细节决定了表上的 mAP 能不能和检测专模直接比.

空间理解数据还加了相对关系, affordance 与动作条件查询, 且空间指称刻意写成相对其他物体或场景框架, 而不是绝对坐标. 这与 grounding 输出的 [0,1000] 框并不矛盾: 一个管「怎么问空间」, 一个管「怎么答位置」. 具身榜 EmbSpatial / RefSpatial / RoboSpatialHome 上旗舰 84.3 / 69.9 / 73.9, 应同时回看这两类监督.

点 grounding 混合 PixMo 公开标注, 检测/实例分割派生点, 以及面向细粒度细节的合成管线; 计数则在 grounding 子集上做成直接计数, 框计数, 点计数三种题型. 开放词表框数据除 COCO / Objects365 / OpenImages / RefCOCO 系外, 还用 Qwen2.5-VL 提候选, Grounding DINO 与 Qwen2.5-VL 再定位, 低置信过滤. 这些管线决定了表上 RefCOCO-avg 与 CountBench 的分数该怎么解释: 它们不是单一检测头刷出来的, 而是通用模型在统一坐标约定下同时学指称, 定位与计数.

## 3. 训练

### 3.1. 预训练四阶段: 67B 对齐, 再 1T+1T+100B 拉长

表 1 是整份报告最短的课表. S0 Vision-Language Alignment: 只训 Merger, 冻视觉编码器与 LLM, 67B token, 序列长 8,192, 数据是高质量图文对, 视觉知识与 OCR. S1 Multimodal Pre-Training: 全参, 约 1T, 仍 8,192, VL 与纯文本混合, 加入交错, grounding, VQA, STEM 与少量视频. S2 Long-Context: 全参, 约 1T, 序列长 32,768, 抬纯文本比例, 加大视频与 agent 指令数据. S3 Ultra-Long-Context Adaptation: 全参, 100B token, 序列长 262,144, 专攻长视频与长文档.

四段加起来约 2.17T token, S3 只占约 4.6% (按表计算). 100B token 按 262,144 长度切, 约 38 万条满长序列 (按表计算, 实际有打包与截断). 真正贵的长窗只在这一小段; 前面 2T 级 token 仍在 8K/32K. 这与 Qwen2.5-VL 的 1.5T+2T+0.6T 三阶段同族, 视觉语言阶段的总 token 反而少了近一半; 差额由底座补上, Qwen3 语言骨干已经带着完整的文本预训练进场. 按 6ND 粗算, 旗舰只计 22B 激活参, 这 2.17T token 约 2.9×10²³ FLOPs (按 6ND 估算, 不含 ViT, 也没扣掉 S0 冻结部分), 报告本身没有给算力或 GPU-hour.

**square-root 重加权**是这一阶段平衡文本与多模态的主要工具. 报告只写「从 per-sample loss 换成 square-root-normalized per-token loss」, 没有给公式. 同类做法在 InternVL2.5 / InternVL3 里叫 square averaging (InternVL3 报告, 非本报告): 一个 batch 里第 $i$ 条样本有 $l_i$ 个监督 token, 损失写成
$$\mathcal{L}=\frac{\sum_i w_i\sum_{t=1}^{l_i}\ell_{i,t}}{\sum_i w_i\,l_i},\qquad w_i=\frac{1}{l_i^{\alpha}}.$$
$\ell_{i,t}$ 是逐 token 交叉熵, 分母让权重和归一. $\alpha=0$ 是 token 平均, 一条样本的总权重与 $l_i$ 成正比, 长回答主导梯度; $\alpha=1$ 是样本平均, 每条样本总权重都是 1, 长样本里的单个 token 被稀释到 $1/l_i$; $\alpha=0.5$ 时样本总权重是 $\sqrt{l_i}$, 一条 400 token 的长 caption 只比 4 token 的坐标答案重 10 倍, 而不是 100 倍. 放到 Qwen3-VL 的数据上, 长 caption, 长文档解析与纯文本长文在 token 平均下会压过 grounding, 计数这类只吐几个坐标的短答案; 样本平均下又反过来, 长文本的每个 token 学得太轻. 取平方根是两头各让一步 (推测 Qwen3-VL 与 InternVL 同形, 报告未写具体 α).

数据侧大幅重做 caption, OCR (扩到 39 语, 在 Qwen2.5-VL 的 10 个非中英语言之上新增 29 个), 文档 HTML/Markdown 双表示, 长文档拼接, grounding/counting, 3D, 代码, 视频, STEM 与 GUI-agent. OCR 用粗到细管线整理 3,000 万内部真实样本, 另合成约 3,000 万多语 OCR 样本, 收集超过 100 万真实多语图像, 全程不用人工标注. 文档解析从 Common Crawl 取 300 万 PDF, 均分 10 类, 每类 30 万, 另加 400 万内部文档; 版面模型先定阅读顺序和区域框, Qwen2.5-VL-72B 再逐区识别.

STEM 课表很重: 程序化几何图生成 1M 点 grounding + 2M 感知 VQA, 另有 6M 图注; 多模态推理题超过 60M K-12/本科题, 长 CoT 合成超过 12M. 报告的思路是分而治之: 先各自练细粒度视觉感知和语言推理, 再合起来做多模态推理, 所以 Qwen3 的纯文本推理数据也整批并进来. Agent 侧 GUI 跨桌面/手机/网页, 轨迹来自自演化生产框架加人工抽审; 多模态 function calling 轨迹由模型合成函数定义, 调用与返回, 不需要真的实现可执行函数; 搜索轨迹用在线图搜和文本搜, 专门教模型碰到陌生长尾实体时去查.

文档解析走双表示: QwenVL-HTML 带细粒度元素级框; QwenVL-Markdown 只定位图与表, 表用 LaTeX. 长文档先把多页图像放序列开头, 再接 OCR/HTML 文本, 并构造跨页 VQA, 逼模型在图表正文之间做多跳. 知识数据按实体显著性做重要性采样, 长尾概念少采但不断档. caption 侧用微调过的 Qwen2.5-VL-32B 重写, 去重只打在重写后的文本上, 以免视觉多样性被误杀; 再在视觉 embedding 上聚类找稀疏区定向补数据. 交错书册由微调过的 Qwen2.5-VL-7B 解析, 可拼到 256K, 并设最低页数与图文比门槛.

视频课表把短到长 caption 合成, 时空 grounding, 源域平衡与长度自适应采样绑在一起. 预训练各阶段按序列长约束动态调 fps 与最大帧数, 避免过疏抽帧或过低分辨率把细节抽干. 这与评测中「最多 2048 帧 / 224K video token」不是同一套旋钮: 前者是训练分布塑造, 后者是横向比较时的预算对齐. 读长视频分数时两套约束都要带着, 否则容易把架构增益与采样预算混为一谈.

### 3.2. 后训练前半: SFT 分叉与 Strong-to-Weak Distillation

后训练三阶段. SFT: 先 32K 再扩到 256K, 数据分成标准格式 (non-thinking) 与 CoT 格式 (thinking); SFT 集约 1,200,000 条, 纯文本约三分之一, 图文/视频约三分之二, 即约 40 万与 80 万 (按比例计算). 能力范围在 Qwen2.5-VL 约 8 个核心域, 30 个细分类的基础上扩了具身空间推理, 图像接地推理, 视频时空 grounding 与数百页技术文档理解. **Strong-to-Weak Distillation**: 用纯文本数据蒸 LLM 骨干. RL: Reasoning RL (可验证域, SAPO) + General RL (指令遵循与偏好).

SFT 的长度课表是两轮. 第一轮在 32K 长度过一个 epoch; 第二轮在完整 256K 长度再过一个 epoch, 并把长输入和 32K 长度的样本交错混训. 长输入包括数百页技术文档, 整本教材和最长 2 小时的视频. 这里有一处要对上: Needle 实验里 1 FPS 下 256K 只够 30 分钟, SFT 却塞进 2 小时视频, 说明 SFT 阶段对长视频用了更低的帧率或更少的每帧 token (推测, 报告没有写 SFT 的采样参数). 混入 32K 样本的作用也好理解: 只喂满长序列, 模型在短对话上的行为会漂.

SFT 质量管线拆成 Query Filtering 与 Response Filtering. 查询侧用 Qwen2.5-VL 丢掉难验证与空壳网页问句, 歧义指令只做最小改写, 最后按难度和相关性再筛一轮. 响应侧规则过滤管重复, 残缺, 格式与有害; 模型过滤用 Qwen2.5-VL 系奖励模型打正确性, 完整性, 清晰度, 有用性, 对需要看图的任务专门核查视觉信息是否被正确理解和使用, 并抓规则发现不了的语码混用和风格突变.

Thinking 模型的地基是 **Long-CoT 冷启动集**, VL 与纯文本约 1:1. 多模态部分覆盖 VQA, OCR, 2D/3D grounding 与视频, 重点加了 STEM 和 agent 工作流; 纯文本部分和 Qwen3 的数学, 代码, 逻辑题同源. 过滤有三道: 难度筛选, 留下基线模型通过率低或回答更长的题; 多模态必要性过滤, 视觉数学题若 Qwen3-30B-nothink 在无图条件下也能答对, 就丢掉, 保证剩下的样本真需要看图; 响应质量控制, 先删最终答案错误的候选, 再删复读, 语码混用和没有推理步骤就猜答案的回答.

Strong-to-Weak Distillation 沿用 Qwen3 的两段式. 离线阶段把教师输出合在一起做响应蒸馏, 让轻量学生先拿到基本推理能力; 在线阶段由学生自己按 prompt 生成, 再用教师在这些 on-policy 序列上的 logits 做 KL 对齐. 两点值得看: 蒸馏只用纯文本数据, 只调 LLM 骨干, 报告却称文本和多模态推理都涨了, 这说明多模态推理的上限很大程度由语言推理决定, 和 §5 STEM 的分而治之是同一个判断; 教师是哪个模型, 蒸馏用了多少 token, 这一面本页没有. 表 9/10 的边侧模型就是这条管线的产物.

### 3.3. 后训练后半: SAPO 推理 RL, 通用 RL 与 Thinking with Images

Reasoning RL 只做能用规则或代码执行器确定性验证的任务: 数学, 代码, 逻辑, 视觉 grounding, 视觉谜题. 数据准备分三步: 多模态查询先用旗舰 Qwen3-VL-235B-A22B 的早期检查点每题采 16 条, 全错的查询剔除; 再按任务跑小规模 RL, 砍掉提升空间有限的数据源, 剩约 30K 条; 训练每个尺寸的模型时再各采 16 条, 通过率超过 90% 的简单题滤掉. 全错和全对的题在组相对优势下都给不出梯度, 两头都筛, 留下的才是有学习信号的题. 各任务按预先实验定好的固定比例混进同一 batch.

奖励系统是一套共享框架: 数据预处理, 工具函数和 reward manager 共用, 每个任务写自己的判分逻辑. 格式不靠格式奖励, 而是用任务专属的格式提示把输出引到要求的格式上. 回答语言和提问语言不一致时扣分, 用来压语码混用. 算法用 **SAPO** (Gao et al., 2025). SAPO 原文的做法是把 GRPO 的硬裁剪换成温度控制的 sigmoid 软门 (SAPO 原文, 非本报告): GRPO 每个 token 的项是 $\min\big[r\hat A,\ \mathrm{clip}(r,1-\epsilon,1+\epsilon)\hat A\big]$, SAPO 换成
$$f_\tau(r)\,\hat A,\qquad f_\tau(r)=\frac{4}{\tau}\,\sigma\big(\tau(r-1)\big),\qquad \frac{\partial f_\tau}{\partial r}=4\,\sigma\big(\tau(r-1)\big)\big(1-\sigma(\tau(r-1))\big).$$
$r$ 是该 token 的新旧策略概率比. 导数在 $r=1$ 时恰为 1, 与未裁剪的 $r\hat A$ 在 on-policy 点的梯度相同; $r$ 偏离 1 时导数平滑衰减到 0, 而不是在 $1\pm\epsilon$ 处一步跳成 0. $\tau$ 控制衰减快慢, 负优势用更大的温度 (默认 $\tau_{neg}=1.05$, $\tau_{pos}=1.0$), 让负样本的梯度衰减得更快. 和 GRPO 比, 出了裁剪区间的 token 不再一刀切成零梯度; 和 GSPO 比, 一条序列里只有少数 token 严重 off-policy 时, 只压这几个 token, 不把整条序列的信号作废. SAPO 原文点明 token 级重要性比在 MoE 上方差更大, 这正对应 Qwen3-VL 的两档 MoE.

General RL 在 SFT 的任务集上做多任务 RL: VQA, caption, OCR, 文档解析, grounding 与读钟. 奖励分两个维度: 指令遵循, 看内容, 格式, 长度和 JSON 这类结构化约束是否满足; 偏好对齐, 针对开放问题看有用性, 事实性和风格. 这一段还承担纠偏: SFT 会学进一些强而错的先验, 于是专门造能诱发这些错误的可验证题, 如反直觉计数和复杂读钟, 用 RL 把错误先验换掉. 语码混用, 复读和格式错误出现频率低, 普通 RL 采样很难碰到, 所以单独整理一批已知会诱发这些毛病的 prompt, 集中施加高频惩罚.

General RL 的奖励是混合的. 规则奖励用在有确定答案的格式和指令遵循上, 精度高, 也不给 reward hacking 留空子; 模型奖励用 Qwen2.5-VL-72B-Instruct 或 Qwen3 当裁判, 对照参考答案多维打分, 负责开放式任务, 主要作用是减少把「写法不常见但正确」的回答判错. 两种奖励的分工和 Reasoning RL 的「只做可验证任务」一起看: 能验证的交给规则, 不能验证的才交给裁判模型.

**Thinking with Images** (§4.5) 是两阶段的 agent 回路: 先在 Qwen2.5-VL-32B 上用约 10k 简单 grounding 冷启动 SFT, 学「思考, 动作, 读反馈, 回答」的循环, 再做多轮工具 RL; 再用训好的 32B 视觉 agent 蒸馏出约 120k 多轮交互, 供 Qwen3-VL 冷启动与工具 RL. 奖励三通道: 答案正确性 (Qwen3-32B 判), 多轮推理质量 (Qwen2.5-VL-72B 判, 看是否正确读懂工具反馈并逐步推到答案), 工具调用次数相对专家估计目标 (目标由 Qwen2.5-VL-72B 按任务复杂度离线估). 早期实验发现模型会退化成只调一次工具来刷前两项奖励, 所以显式加了 tool-calling reward.

与 Qwen2.5-VL 「后训练冻 ViT 做 SFT/DPO」 对照: 本报告预训练 S0 冻视觉与 LLM 只训 merger, S1 起全参; 后训练叙述重心在 thinking 分叉, 蒸馏与 RL, 没有把「全程冻 ViT」写成 Qwen2.5-VL 同款硬约束. 读实现时以各阶段 Training 列与正文句子为准, 不要把上一代冻结策略默认抄过来. 基础设施写在阿里云 PAI-Lingjun, 预训练基于 Megatron-LM 叠 TP/PP/CP/EP/ZeRO-1, 宣称可到约 10,000 GPU 规模; 本地部署与评测后端点名 vLLM 与 SGLang. 算法名与数据口径有, 完整超参表与 GPU-hour 没有公开, 复现只能到这个粒度.

## 4. 评测

### 4.1. 多模态效果: 文档, 推理, 视频与 agent

旗舰表 2: thinking 在 MMStar 78.7, HallusionBench 相对 Gemini-2.5-Pro / GPT-5 / Claude Opus 4.1 分别高 3.0 / 1.0 / 6.3; Instruct 在 MMBench / RealWorldQA 取最高 89.3/88.9 与 79.2. 文档侧 CC-OCR / OmniDocBench / OCRBench 等, Instruct 常略强于 Thinking; CharXiv 推理子集则 Thinking 更强. 长文档 MMLongBench-Doc 上 instruct/thinking 57.0% / 56.2%. 多语 OCR 自建集: 39 语里 32 语准确率超过 70% (图 2). 文档任务 Instruct 占优, 和 §5 的 OCR 与版面数据量对得上: 识别类任务靠感知, 长推理链帮不上忙, 反而可能引入改写.

中档表 3: 32B Thinking 在 MMBench / RealWorldQA 取 89.5/89.5 与 79.4; 相对上代 Qwen2.5-VL-72B, 中档 Qwen3-VL 已在推理任务上超越. 小档表 4: 8B 整体领先同列; 4B 在 DynaMath / VisuLogic 取最高. 细粒度感知上, 加工具后旗舰 V\* 93.7, HRBench-4k 85.3, HRBench-8k 82.3; 报告强调工具增益 (约 5 分量级) 常大于单纯放大模型, 这是 §7 Thinking with Images 那套回路的直接回报.

视频协议要单独记: 每视频最多 2,048 帧, 视频 token 总量不超过 224K; 每帧 token 上限 VideoMMMU/MMVU 为 768, 其余 640; Charades-STA 4 fps, 其余 2 fps. 对照 API 帧预算并不齐 (Gemini 512, GPT-5 256, Claude 100), 正文自己承认横比不能保证完全公平. Agent 上 ScreenSpot Pro 等 GUI grounding 旗舰 SOTA; 32B OSWorld 41, AndroidWorld 63.7.

评测超参也按档分叉, 读分前先对齐采样. 大档 Instruct: temperature 0.7, top-p 0.8, top-k 20, presence penalty 1.5; 小档 Instruct 改成 1.0 / 1.0 / 40 / 2.0. Thinking 的 MoE 用 0.6 / 0.95 / 20; Dense thinking 用 1.0 / 0.95 / 20 另加 presence penalty 1.5. 最大输出默认 32,768, AIME / HMMT / LiveCodeBench v6 放到 81,920. Arena-Hard v2 的胜率由 GPT-4.1 判, Creative Writing v3 由 Claude 3.7 Sonnet 判, 复现时要跟着用同一裁判, 否则分数不可比. 2D/3D grounding 评测把置信度固定为 1.0, ODinW 还把全部类别塞进同一 prompt; 3D 报 mAP@0.15. 这些口径比单看表头更决定「能不能和专模或闭源 API 横比」.

### 4.2. 纯文本: 和哪一版 Qwen3 比, 结论不一样

表 5–10 用来回答「多模态继续训有没有伤文本」. 旗舰 Instruct 在 AIME-25 74.7, HMMT-25 57.4, LiveCodeBench v6 54.3 上压过 DeepSeek V3 0324 与不开 thinking 的 Claude-Opus-4; Thinking 旗舰 AIME-25 89.7, LiveCodeBench v6 70.1, 高于 o3 (medium) 与开 thinking 的 Claude-Opus-4. 这部分是报告「视觉语言模型也能稳住文本推理」的主证据.

同表里还有一列 Qwen3-235B-A22B-2507, 逐行数一遍更说明问题. 表 5 的 17 行里, Qwen3-VL-235B Instruct 只赢 5 行 (AIME-25, HMMT-25, WritingBench, LiveCodeBench v6, INCLUDE), 输 12 行, 知识组 4 行全输, GPQA 差 3.2 (按表计算). 表 6 的 22 行里, Thinking 版只赢 LiveBench, IFEval, TAU2-Airline 这 3 行, 输 19 行, HMMT-25 差 6.5, AIME-25 差 2.6 (按表计算). 架构节那句「多数语言榜超过文本对照」, 对照对象若是 2507 版, 表上的数字不支持.

中档和边侧呈现同一个规律. 表 7 里 Qwen3-VL-32B Instruct 对 Qwen3-32B 的 17 行全赢, AIME-25 从 20.2 到 66.2; 30B-A3B 对 Qwen3-30B-A3B 赢 16 行, 只输 MultiIF. 可换成 Qwen3-30B-A3B-Instruct-2507, 30B-A3B 只赢 5 行, 平 1 行 (GPQA), 输 11 行 (按表计算). 表 9 里 4B Instruct 对 Qwen3-4B-2507 赢 3 输 14; 表 10 里 4B Thinking 对 4B-2507 赢 5 输 12 (按表计算). 原版 Qwen3 的 non-thinking 是混合模式里关掉思考的那一档, 本来就弱; 2507 是拆开单独训, 后训练更重的版本. Qwen3-VL 的大幅领先主要是对原版而言.

所以更稳的读法是: **Qwen3-VL 的文本能力大致落在原版 Qwen3 和 2507 之间**, 数学和代码这类推理题靠 Long-CoT 数据和 SAPO 追得最近, 知识, 多语和对齐类题落后更明显. 这和 §6 的配方吻合: 后训练把算力压在可验证推理上, 知识题没有额外补课. 选型时若任务以纯文本知识问答为主, 同尺寸 2507 文本模型仍是更好的选择; 若同一服务要同时处理图像和文本, Qwen3-VL 省下一个模型, 文本上付出的是几个点的差距.

## 5. 技术如何拼在一起

拼装顺序可以概括成一条链: 动态分辨率图像/视频 -> SigLIP-2 ViT (续训) -> 2×2 Merger (+ DeepStack 从 ViT 三层抽特征, 残差加到 LLM 前三层) -> 交错 MRoPE 的 Qwen3 Dense/MoE decoder -> 视频帧组前插文本时间戳 -> (后训练) non-thinking 或 Long-CoT thinking, 再蒸馏与 SAPO RL -> (可选) thinking-with-images 工具回路. square-root 重加权管文本/多模态目标平衡; S0→S3 课表管窗口从对齐到 256K; [0,1000] 坐标管 grounding 输出接口.

报告没有给出的部分: 交错 MRoPE 相对切块 MRoPE 的消融表, 这一面本页没有, 只能引用 Huang et al. 的结论; SAPO 在 Qwen3-VL 上的温度和学习率等超参没有公开; square-root loss 没有写成公式; 蒸馏教师与 token 量没有写; 没有声称引入 MLA 或 MTP; Needle 的 YaRN 1M 外推是评测设定, 不是预训练原生训到 1M. 同队更早的 Qwen2-VL / Qwen2.5-VL 负责动态分辨率与 MRoPE 雏形; Qwen3 负责双模式与 MoE 梯子; 本代负责交错频率, DeepStack, 文本时间戳与 256K 多模态窗口.

场景上, 报告自己点名的是: 图接地推理, agent 决策, 多模态代码智能, 长文档与长视频, GUI 操作. 这些场景共享同一前提: 模型必须同时知道「看见多层细节」(DeepStack), 「位置频谱不偏科」(Interleaved MRoPE), 「何时」(文本时间戳), 以及「点哪里/调什么工具」(grounding + function call). 缺任一环, 长上下文或多步 agent 回路都会断.

把 GUI agent 与文档解析放在同一模型里, 不是因为任务表面相似, 而是因为两者都依赖高精度定位加结构化输出. 文档吐 HTML/Markdown 与框; 界面吐点击坐标或 function call. Merger 压缩后的视觉 token, [0,1000] 监督, 以及 thinking-with-images 的工具回路, 是这两类场景共用的能力段. 报告用 ScreenSpot Pro / OSWorld 与 CC-OCR / OmniDocBench / MMLongBench-Doc 两头验证, 比只报一张综合 VQA 总分更讲清「细粒度」到底细在何处. 代码向则把 UI 截图转 HTML/CSS, 图像转可编辑 SVG, 流程图/公式转写与 StackOverflow 带图问答捆进同一多模态代码混合, 纯文本代码直接复用 Qwen3 与 Qwen3-Coder 的语料, 让「看见」直接接到「可执行」.
