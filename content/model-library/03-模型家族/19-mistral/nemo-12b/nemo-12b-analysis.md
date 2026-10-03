---
title: "Mistral NeMo 发布页解读"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "打印时页面左下角一直叠着 axeptio 的 cookie 弹窗, 每页都在同一位置."
---
原文是一篇正文不到 450 个英文词的发布博文, 表和图又被 cookie 弹窗遮去一半.

# Mistral NeMo 发布页解读

- 原文: Mistral AI 官网博文 「Mistral NeMo」, 2024 年 7 月 18 日, 署名 Mistral AI team. 网页打印 6 页, 正文只占前 4 页; 6 张图里 2 张是图表, 4 张是 cookie 弹窗的截图或图标.
- 合作方: NVIDIA.
- 版本: 预训练基座和指令版两套 checkpoint, Apache 2.0 许可, 权重放在 HuggingFace.
- 上下文: 「up to 128k tokens」.
- tokenizer: Tekken, 基于 Tiktoken, 在 100 多种语言上训练, 取代此前 Mistral 模型用的 SentencePiece.
- 部署: 量化感知训练, 称 FP8 推理无损; la Plateforme 名 open-mistral-nemo-2407; 另有 NVIDIA NIM 容器.
- 双语对照见同目录 nemo-12b-bi.md.

| 项 | 本页怎么写 |
| --- | --- |
| 名字里的 12B | 正文一句 「a 12B model」 |
| 总参数 | 本页未印 |
| 激活参数 | 本页未印 |
| 层数, 隐藏维度, 头数, 词表大小 | 本页未印 |
| 上下文长度 | up to 128k tokens |
| 印出的评测数 | 表 1 露出 12 个百分比, 表 2 露出 3 个分数, 图 2 可读 15 个压缩率 |

## 1. 这是什么材料, 缺了什么

这是一篇产品发布博文, 不是技术报告. 结构很简单: 开头三段加表 1, 「Multilingual Model for the Masses」 一段加图 1, Tekken 一段加图 2, 指令微调一段加表 2, 最后一段下载和部署链接. 第 4 页后半到第 6 页全是网站页脚和导航, 和模型无关. 按字数算, 正文英文不到 450 词.

打印时页面左下角一直叠着 axeptio 的 cookie 弹窗, 每页都在同一位置. 正文文字大多可以从 PDF 文字层找回来, 但表格和图的左半部分找不回: 表 1 的模型名列 (以及可能存在的其他列), 图 1 的 Hellaswag 和 Arc Challenge 两格以及整张图的图例, 表 2 除最右一列之外的所有内容. 所以下文只读露出来的格子, 行名一律写 「第 k 行」, 不去补.

被遮挡之外, 博文本来就没写的东西更多. 训练数据, 训练 token 数, 训练算力, 学习率, 架构规格, 词表大小, 位置编码方式, 128k 是怎么训出来的, 一概没有. 指令版只说 「advanced fine-tuning and alignment phase」, 没说是 SFT 加什么, 用了什么数据. 能核对的只有三块: 表 1 露出的四列, 图 2 的压缩率, 表 2 露出的一列.

## 2. 名字里的 12B, 总参数, 激活参数

名字里的 12B 在全文只出现一次, 就是开头 「a 12B model built in collaboration with NVIDIA」. 总参数: 本页未印. 激活参数: 本页未印. 页面也没印层数, 隐藏维度, 注意力头数, FFN 宽度, 词表大小, 所以无法从本页自己推一个参数量出来. 同目录的 Mistral 7B 解读里有 7B 的规格表, 那是另一个模型的数, 本文不搬.

页面对架构只有两句定性描述: 「relies on standard architecture」 和 「a drop-in replacement in any system using Mistral 7B」. 「standard」 指什么, 页面没展开; 是不是稠密模型, 用什么注意力, 用什么位置编码, 都没写. 这意味着 「12B」 在本页只能当作名字里的量级标签来读, 不能拿它去算显存或 FLOPs.

和上下文相关的数也只有一个: 「up to 128k tokens」. 页面两次提到 「large context window」, 但没有任何长上下文评测, 没说训练序列多长, 也没说 128k 在推理时对显存有什么要求. 长上下文技术的一般背景见本库 [长上下文与外推技术](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/2.5-长上下文与外推技术.md), 但 NeMo 具体用了其中哪一种, 本页没说.

## 3. 表 1: 三行四列能读出什么

表 1 露出四列: MMLU (5-shot), OpenBookQA (0-shot), CommonSenseQA (0-shot), TruthfulQA (0-shot). 三行数字分别是 68.0 / 60.6 / 70.4 / 50.3, 71.5 / 50.8 / 60.8 / 46.6, 62.3 / 56.4 / 66.7 / 43.0 (单位 %). 第 1 行背景高亮, 后三格加粗; 第 2 行只有 MMLU 一格加粗. 图注的顺序是 「Mistral NeMo base model ... compared to Gemma 2 9B and Llama 3 8B」, 按惯例高亮行是自家模型, 但行名被遮, 这只是推断.

逐列看, 第 1 行对第 2 行是 -3.5, +9.8, +9.6, +3.7 个点; 对第 3 行是 +5.7, +4.2, +3.7, +7.3 个点. 四列平均, 第 1 行约 62.3, 第 2 行约 57.4, 第 3 行约 57.1 (只算露出的四列). 第 2 行的形状很特别: MMLU 最高, OpenBookQA 和 CommonSenseQA 却最低, 和第 3 行比是 +9.2, -5.6, -5.9, +3.6. 两个对手的强项分布不一样, 只看平均会把这一点抹平.

开头那句 「state-of-the-art in its size category」 要和表对着读. 如果第 1 行是 Mistral NeMo, 那么在 MMLU 这一列它输给第 2 行 3.5 个点, 「state-of-the-art」 在这一列不成立; 在另外三列它领先. 「size category」 也没定义: 按名字里的数, 12B 比 9B 大约 1.33 倍, 比 8B 大 1.5 倍 (只按名字比), 拿更大的模型和更小的模型比, 领先本身不说明 「同档最好」. 页面也没交代对手的分数是自己重跑的, 还是抄各自报告的.

## 4. 图 1: 只剩 MMLU 一格

图 1 本来有三格, 标题分别是 Hellaswag, Arc Challenge, MMLU, 前两格被弹窗盖住, 只剩 MMLU. 这一格画了 10 种语言, 每种一对橙蓝柱, 图例被遮, 分不清哪种颜色是 NeMo. 按像素读柱高 (读图, 误差约 ±1 点):

| 语言 | FR | DE | ES | IT | NL | PT | RU | ZH | JA | KO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 橙柱 | 62 | 62 | 64 | 61 | 57 | 63 | 59 | 59 | 59 | 44 |
| 蓝柱 | 51 | 52 | 54 | 52 | 50 | 52 | 48 | 51 | 52 | 40 |

十种语言都是橙柱高. 橙柱平均约 59.0, 蓝柱平均约 50.1. 两者差距最大的是 RU 和 FR, 约 11 点; 最小的是 KO, 约 4 点. KO 是两组共同的低谷, 橙柱比其余九种低 13 到 20 点. 图注写 「Mistral NeMo performance」, 另一种颜色是谁, 页面没说.

语言名单和正文对不上. 正文说模型在 11 种语言上 「particularly strong」: 英, 法, 德, 西, 意, 葡, 中, 日, 韩, 阿, 印地. 图 1 里有荷兰语和俄语, 却没有英语, 阿拉伯语, 印地语, 两边重合 8 种. 阿拉伯语和印地语在图 2 里压缩率仅次于被裁掉的 Malayalam (3.02 和 2.75), 它们的准确率反而没画.

还可以把图 1 和表 1 连起来看, 但要叠两个前提: 表 1 第 1 行是 NeMo, 橙柱也是 NeMo. 两个前提都成立时, 英文 MMLU 68.0%, 非英文 MMLU 从 ES 的约 64 到 NL 的约 57, 掉 4 到 11 个点, KO 约 44, 掉约 24 个点. 两张图的 MMLU 是否同一套题的翻译版, 用了几 shot, 页面也没说, 所以这个落差只能当量级参考.

## 5. Tekken 的压缩率怎么读

正文给了四个说法: 100 多种语言上训练; 源代码, 中文, 意大利语, 法语, 德语, 西班牙语, 俄语 「~30% more efficient」; 韩语 2 倍, 阿拉伯语 3 倍; 和 Llama 3 tokenizer 比, 约 85% 的语言压得更好. 图 2 可读的 15 个压缩率是: English 1.12, Code 1.28, Chinese 1.28, Italian 1.28, French 1.31, German 1.33, Spanish 1.35, Russian 1.36, Portuguese 1.37, Japanese 1.56, Vietnamese 1.85, Korean 2.22, Bengali 2.48, Hindi 2.75, Arabic 3.02. 第 16 根 Malayalam 超出纵轴 3.5 的上沿, 数字被裁掉.

图的纵轴只写 「Compression ratio」, 没标基线. 按正文, 比较对象是此前 Mistral 模型的 SentencePiece tokenizer. 压缩率大于 1 表示 Tekken 更省, 所以合理的读法是 「旧 token 数 / 新 token 数」. 照这个读法换成 token 数:

| 语言 | 压缩率 | 新 token 数约为旧的 | 少用 token |
| --- | --- | --- | --- |
| English | 1.12 | 89.3% | 约 10.7% |
| Code, Chinese, Italian | 1.28 | 78.1% | 约 21.9% |
| Russian | 1.36 | 73.5% | 约 26.5% |
| Portuguese | 1.37 | 73.0% | 约 27.0% |
| Korean | 2.22 | 45.0% | 约 55.0% |
| Hindi | 2.75 | 36.4% | 约 63.6% |
| Arabic | 3.02 | 33.1% | 约 66.9% |

「~30% more efficient」 对应的是压缩率 1.28 到 1.36, 这一点图文一致. 但读者容易把它理解成 「token 少 30%」, 实际换算是少 22% 到 26%. 名单还有一处遗漏: Portuguese 1.37 比名单末尾的 Russian 1.36 还高, 却没进名单; English 1.12 全图最低, 正文一字未提. 「2x and 3x」 分别对应 2.22 和 3.02, 韩语的 2.22 更接近 「2.2 倍」.

压缩率也改变了 128k 的实际容量. 同样 128k 个 token, 按旧 tokenizer 计量大约装得下: 英文约 143k, 中文约 164k, 韩语约 284k, 阿拉伯语约 387k 旧 token 的内容 (按 128k × 压缩率). 反过来说, 表 1 和图 1 里的准确率和 token 数无关, 但凡是按 token 计价, 按 token 算吞吐的指标, 换 tokenizer 之后和旧模型不能直接比.

压缩更好通常要付出词表更大的代价, 词表越大, 嵌入矩阵越大. 本页没印 Tekken 的词表大小, 这笔账算不了. 「85% of all languages」 同样无从核对: 分母是哪些语言没说, 也没有和 Llama 3 tokenizer 对比的图表. tokenizer 训练的一般做法见本库 [分词器与 Tokenizer](../../../../llm-guide/3-预训练/3.3-分词器与Tokenizer/3.3-分词器与Tokenizer.md).

## 6. 表 2 与指令微调

正文说指令版 「compared to Mistral 7B」 在遵循精确指令, 推理, 多轮对话, 生成代码四方面 「much better」. 支撑这句话的表 2 只露出最右一列, 列头首字母被裁, 可见 「ildBench」, 按字形是 WildBench. 三行分数 25.55, 28.77, 42.57, 第 3 行高亮加粗. 图注说分数由 GPT4o 当评委, 对照官方参考答案给出.

第 3 行比第 1 行高 17.02, 比第 2 行高 13.80, 分别约是它们的 1.67 倍和 1.48 倍. 行名被遮, 所以哪一行是 Mistral 7B, 哪一行是别的对手, 看不出来; 正文列的四个能力各对应表里哪一列, 也看不到. 能说的只有: 在露出的这一个基准上, 高亮行领先幅度很大.

图注把这些分数叫 「accuracy」, 这个词不太合适. 让 GPT4o 对照参考答案打分, 得到的是评委分, 满分多少, 是否百分制, 页面都没说. 25.55 和 42.57 这种两位小数, 只能在同一张表内比高低, 不能和别处的 WildBench 分数直接对照. 指令版用了什么数据, 是 SFT 之后再做偏好对齐还是别的流程, 本页都没写.

## 7. 发布与部署口径

部署相关的信息集中在第一段和最后一段. 基座和指令版都用 Apache 2.0 许可, 权重放 HuggingFace, 推理用 mistral-inference, 微调用 mistral-finetune; la Plateforme 上的名字是 open-mistral-nemo-2407, 后缀 2407 和 「July 18, 2024」 的年月对得上; NVIDIA 这边打包成 NIM 推理微服务, 放在 ai.nvidia.com.

「trained with quantisation awareness, enabling FP8 inference without any performance loss」 是全文唯一和量化有关的句子. 没有 FP8 和高精度的对照分数, 没说量化了权重还是连激活一起, 也没说 「无损」 是在哪些基准上测的. FP8 相对 16 位格式能把权重存储减半, 这是格式本身的性质, 但 NeMo 的权重总量本页没印, 所以具体省多少也算不出. 相关背景见本库 [量化](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1-量化.md) 和 [FP8 混合精度训练详解](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.2-混合精度训练/02-FP8混合精度训练详解.md).

「drop-in replacement」 和 Tekken 之间有张力. 换了 tokenizer, 同一段输入的 token 序列就变了, 旧系统里任何按 token 写死的逻辑 (截断长度, 计费, 缓存) 都要跟着改. 页面没说 「drop-in」 覆盖到哪一层, 更稳妥的理解是: 推理框架和调用方式不用改, tokenizer 要连模型一起换.

## 8. 谱系: 这页自己交代的上下游

本页明说的关系一共五条. 第一, 和 NVIDIA 合作打造. 第二, 可以替换 Mistral 7B, 是它的接口级后继. 第三, 指令版拿 Mistral 7B 当比较对象, 说自己在四方面强得多. 第四, tokenizer 从 「previous Mistral models」 的 SentencePiece 换成基于 Tiktoken 的 Tekken, 这是 Mistral 家族 tokenizer 的一次换代. 第五, 基座横向对标 Gemma 2 9B 和 Llama 3 8B, tokenizer 横向对标 Llama 3 tokenizer.

画成一张简图就是: 纵向上接 Mistral 7B (接口和比较基线), tokenizer 线从 SentencePiece 到 Tekken; 横向对标两个 8B 到 9B 档的开源基座. 页面没说 NeMo 是从零训练还是从 Mistral 7B 继续训练, 没提 Mixtral 这类 MoE 模型, 也没说后续哪些模型会沿用 Tekken. 这些关系要到别的材料里找, 本页不能作证.

Mistral 7B 自己的规格和评测见同目录 [Mistral 7B 解读](../mistral-7b/mistral-7b-analysis.md). 读两篇时要注意口径不同: Mistral 7B 是 arXiv 技术报告, 有规格表和消融; 本页是发布博文, 没有规格, 评测表还被遮了一半. 两者的数字不能混在一起算.

## 9. 本页对不上的数字

按页面顺序汇总, 前提写在各条里:

1. 表 1 MMLU: 高亮的第 1 行 68.0%, 低于第 2 行的 71.5%, 若第 1 行是 NeMo, 与 「state-of-the-art in its size category」 冲突.
2. 语言名单: 正文点名 11 种, 图 1 MMLU 格画 10 种, 重合 8 种; 英语, 阿拉伯语, 印地语只在正文, 荷兰语, 俄语只在图里.
3. 「~30% more efficient」: 图 2 对应压缩率 1.28 到 1.36, 换成 token 数是少约 22% 到 26%; Portuguese 1.37 达标却不在名单.
4. 「2x and 3x」: 图 2 是 2.22 和 3.02, 韩语一项实际略高于 2 倍.
5. 「over more than 100 languages」 和 「approximately 85% of all languages」: 前者措辞重复, 后者分母未定义, 也没有配图.
6. 表 2: 列头被裁成 「ildBench」, 图注叫 「accuracy」, 实为 GPT4o 评委分, 量纲未注明.
7. 名字里的 12B: 总参数本页未印, 激活参数本页未印.
8. 页脚 「Mistral AI © 2026」 与发布日期 2024 年 7 月 18 日不同, 是打印时间, 页面在发布后是否改过, 无从判断.

这些问题里, 1, 2, 6 三条的根子都是 cookie 弹窗遮住了行名和图例, 换一份没有弹窗的截图, 可能就对上了. 3, 4, 5 三条出在博文措辞本身, 和遮挡无关: 正文用 「效率高 x%」 描述压缩率, 读者自然会换算成 token 少 x%, 两者差了一截.

第 7 条要单独说一句. 这页能给的只是名字里的 12B; 总参数和激活参数都要到模型卡或权重文件里去读, 本文不从别的模型推算.
