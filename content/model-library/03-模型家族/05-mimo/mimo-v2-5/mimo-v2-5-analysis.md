# MiMo-V2.5: 在 Flash 骨干上接视听, 把窗口拉到 1M

> 源文 `mimo-v2-5.md` 是 2026-04-22 的产品发布页 (6 页标记, 11 图, 约 4900 英文字符). 页内给出规格口号 (310B 总参 / 15B 激活 / 48T tokens), 骨干继承 Flash 的 hybrid sliding window attention, 自研视听编码器加轻量 projector, 五阶段训练顺序, 一张架构图, 两组柱图, 开源表与 Token Plan. 没有专家数, 窗长, 层表, 评测协议, 也没有 MOPD 的公式. 用到 Flash 报告, V2.6 报告或 Hugging Face 模型卡的数字时逐处标明出处.

来源: 同目录 `mimo-v2-5.md`. 对照译稿见 `mimo-v2-5-bi.md`. 入口: [AI Studio](https://aistudio.xiaomimimo.com/), [API](https://platform.xiaomimimo.com/), [Hugging Face](https://huggingface.co/XiaomiMiMo/MiMo-V2.5). 同族报告: `../mimo-v2-flash/mimo-v2-flash.md`, `../mimo-v2-6/mimo-v2-6.md`.

## 1. 位置, 架构与训练

### 1.1. 在家族里的位置

页 1 的发布句有三件事: 原生视觉与音频理解, 智能体表现超过 MiMo-V2-Pro, 上下文最长 1M tokens. 规格句紧接着: Sparse MoE, 总参 310B, 激活 15B, 训练 48T tokens, 语言骨干继承 [MiMo-V2-Flash](https://github.com/XiaomiMiMo/MiMo-V2-Flash) 的 hybrid sliding window attention, 视觉与音频编码器都是自研预训练, 经轻量 projector 接入. 把这几句和同族报告对起来看, V2.5 处在 Flash 与 V2.6 之间: 往前, Flash 报告是 309B / 15B, 27T tokens, 纯文本, 窗 128, 5:1; 往后, V2.6 报告的 Flash 档是 310B / 15B, 48T tokens (26T 文本 + 22T omni), 并给出了完整的视听编码器规格.

V2.5 的总参, 激活与数据量和 V2.6-Flash 完全一致, 多模态接入方式 (编码器 + projector 接进 Hybrid-SWA 骨干) 也相同, 所以 V2.6-Flash 很可能是在 V2.5 的预训练基础上继续做 mid-training 与后训练 (两份材料都没明说). 如果这个推断成立, V2.6 报告里 「先文本, 再接 ViT 与音频做 omni 联合训练」 的描述, 也就是 V2.5 前三个训练阶段的展开版本. 从 Flash 到 V2.5, 总参多了约 1B, 数据量从 27T 增到 48T, 新增的主要是视听编码器与多模态语料; 本页没有给出参数的具体分配.

### 1.2. 架构图: 三路 token 汇进同一条骨干

页 2 的架构图把数据流画成三路. 音频: 波形 → Audio Tokenizer → Local Transformer → Audio Projector → 音频 token. 视觉: 图像 / 视频帧 → MiMo ViT → Visual Projector → 视觉 token. 文本直接成为文本 token. 三类 token 拼成一条序列送进 「MiMo Hybrid-SWA Backbone」, 输出端并列 LM Head 与 MTP Block. 这是 LLaVA 一路的拼接式结构: 编码器把各模态压成与文本同维的 token, 骨干统一建模, 不另设跨模态注意力塔. 拼接方式的背景可对照 [LLaVA 架构深度解析](../../../../llm-guide/8-多模态/8.2-视觉语言模型/8.2.1-LLaVA架构深度解析.md).

图上的组件名在 V2.6 报告里都有展开, 可以帮助理解, 但数字不能直接搬过来. V2.6 报告写 MiMo-ViT 用 sink 加 SWA 替代 MiMo-VL-7B 的固定窗口注意力, 28 层, 参量 681M; 音频 tokenizer 在 25 Hz 用 20 层 RVQ, patch encoder 每 4 帧合成一个 patch 后投进骨干, 图上的 「Local Transformer」 与这个 patch 内双向注意力的描述对得上. Hugging Face 模型卡 (外部材料) 列 V2.5 的 ViT 约 729M, 音频部分约 261M, MTP 约 329M. 模型卡与 V2.6 报告的 ViT 参量不同, V2.6 报告注明编码器参量含输入 embedding, 不含 projector, 两边统计口径不一定相同, 不宜据此判断编码器换过. MTP Block 在 Flash 报告里是 3 层, 每层约 0.33B, 与模型卡的 329M 量级接近; 本页没有写 MTP 层数与接受长度.

### 1.3. 五阶段训练: projector 先对齐, 窗口在后训练里拉长

页 2 的训练叙述按顺序列了五段: 文本预训练搭语言骨干; projector warmup, 对齐音频与视觉 projector; 大规模多模态预训练; SFT 与 agentic post-training, 其间上下文从 32K 到 256K 再到 1M; 最后是 RL 与 [MOPD](https://arxiv.org/html/2601.02780v2#S4), 链接指向 Flash 报告的后训练一节. 这个顺序和常见的多模态接入做法一致: 编码器与骨干都先各自训好, projector 单独热身, 避免随机初始化的投影层把梯度噪声灌进骨干, 然后再全量联合训练.

两处和前后代的对照值得看. 上下文方面, Flash 在预训练 Stage 3 扩到 256K, V2.6 报告写预训练中途到 256K, mid-training 末段到 1M; V2.5 把 1M 放在 SFT 与 agentic 后训练阶段逐步拉长, 开源表里 Base 是 256K, 正式版是 1M, 与这个安排一致. 后训练方面, 「RL + MOPD」 沿用 Flash 的范式: 分域训教师, 再用多教师在线蒸馏合进学生; 到 V2.6 升级为一次混合 RL 加 MOPD2. 本页没有给 MOPD 的教师名单, 也没有说 V2.5 的 RL 用了哪些环境. 长度外推的一般做法见 [长度外推: 从 PI 到 YaRN](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/RoPE/03-长度外推：从PI到YaRN的频率扩展.md), 本页没有点名具体方法.

## 2. 评测与发布

### 2.1. 智能体柱图: 分数与主张要一起读

页 3 的四格柱图, 橙柱为 V2.5: 内部 MiMo Coding Bench 71.8, Claw-Eval Text 62.3, Terminal-Bench 2.0 65.8, SWE-Bench Pro 56.1. 对照有 MiMo-V2-Pro, Kimi K2.6, DeepSeek-V4-Flash, Claude Opus 4.6, Gemini 3.1 Pro, GPT-5.4. 正文说 Coding Bench 上拉近了与前沿的差距, 并且 「以一半成本追平 MiMo V2.5-Pro」; Claw-Eval general subset 62.3, 称处在性能与效率的 Pareto 前沿. 正文说 general subset, 图上标 Text, 数字一致.

「best-in-class」 要连着没赢的格读: Coding Bench 上 Claude Opus 4.6 为 77.1 (读图), 高于 71.8; Terminal-Bench 2.0 上 Gemini 3.1 Pro 为 68.5 (读图), 略高于 65.8. 「一半成本」 只是文案, 柱图不给成本, 页 5 Token Plan 的 1x / 2x 计费也没说明适用于这个内部榜. 同页出现了两个 Pro: 超越对象是 MiMo-V2-Pro, 半价对齐对象是 MiMo V2.5-Pro, 保留原名, 不合并. 与 Flash 报告相比, 这组榜整体换了一代: Flash 用 SWE-Bench Verified (73.4) 与 Terminal Bench 2.0 (38.5), V2.5 页用 SWE-Bench Pro 与 Terminal-Bench 2.0, 协议与版本不同, 数字不能相减.

### 2.2. 多模态柱图: 能引用的只有柱顶数字

页 3–4 强调精细视觉推理, 复杂图表分析, 深度多模态理解, 以及原生 1M 上下文. 页 4 分图像理解, 多模态智能体, 视频理解三组, 可见标签与橙柱: CharXiv RQ 81.0, MMMU-Pro 77.9, Claw-Eval Multimodal 23.8, Video-MME 87.7, DailyOmni 83.5, VideoHolmes 64.0. 另有两组未印基准名的柱, 橙顶读数 88.5 与 87.2, 只记数字, 不猜榜名. 收束句写视频追平 Gemini 3 Pro, 多模态智能体追平 Claude Sonnet 4.6, 图像与文档理解有竞争力, 全部来自一个统一模型.

对照柱的读法: Video-MME 橙 87.7 对星标柱 88.4, VideoHolmes 64.0 对 64.2, CharXiv RQ 81.0 对 81.4 (都是读图), 差距在一分内, 与 「matching」 的说法相符, 但页内没说星标柱对应哪个模型. 图例里还出现了 MiMo-V2-Omni, 正文没有解释. Claw-Eval Multimodal 23.8 远低于纯文本子集的 62.3, 说明多模态智能体任务仍是短板. 评测温度, shot 数, 是否开思考, 页内都没写. V2.6 报告后来把视觉 Agent 做成了单独的 RL 环境 (开放设计与高保真复刻), 并用内部的 MiMo Visual Coding 评测, V2.5 页上还没有这类视觉编码的分数.

### 2.3. 开源表与计费

页 5 开源表两行: MiMo-V2.5-Base 与 MiMo-V2.5, 都是 310B / 15B, 精度写 FP8 (E4M3) Mixed, 只有上下文不同, Base 256K, 正式版 1M. 文称权重, tokenizer 与完整模型卡已开源. 表里没有 Pro. FP8 混合精度与 Flash 报告的做法一致 (Flash 训练与推理都走 FP8, 注意力输出投影, embedding, 输出头留 BF16), 但本页没有说明 「Mixed」 指哪些层.

Token Plan 写两档: V2.5 1x (1 token = 1 credit), V2.5-Pro 2x, 并宣布不再对 1M 上下文加收倍率. 从产品角度, 这把 Hybrid SWA 在长上下文上的开销优势转成了定价: Flash 报告称混合结构相对全局注意力把长上下文的 KV 缓存与注意力计算降了近 6×, 所以长窗口不加价在成本上有依据 (解读, 本页没有把两者联系起来). 页 5–6 的展望说下一代正在训练, 方向是更深的推理, 更紧的工具集成与更真实的场景落地; 按时间看, 这指向后来的 V2.6. 本页没有 TestingTime 相关的开关或说明.
