---
title: "Baichuan-13B: 同一套配方做大, 换 ALiBi, 第一次交付 Chat 和量化版"
category: "模型库"
tags: ["Baichuan", "技术解析"]
published: true
excerpt: "页 1 是仓库外壳: 文件只有 media, LICENSE, 中英 README, cli_demo.py, requirements.txt, web_demo.py, Python 100%, 5 位贡献者, 没有 release."
---
# Baichuan-13B: 同一套配方做大, 换 ALiBi, 第一次交付 Chat 和量化版

公开材料是 GitHub 仓库 `baichuan-inc/Baichuan-13B` 的中文 README 抓取 `baichuan-13b.md` (页标记 `page 1 of 8` 到 `page 8 of 8`, 4 图), 不是技术报告. 页内能核对的是三张 5-shot 榜 (C-Eval, MMLU, CMMLU), 一张两行的模型细节表, 一张 tokens/s 表, 一张显存表, 一张量化前后分数表和两份微调脚本. 数据构成, 优化器, 学习率日程, Chat 的对齐方法都没有写.

来源: 同目录 `baichuan-13b.md` 与 `baichuan-13b.pdf`, 对照译稿见 `baichuan-13b-bi.md`. 入口含 [GitHub baichuan-inc/Baichuan-13B](https://github.com/baichuan-inc/Baichuan-13B), [Hugging Face Baichuan-13B-Base](https://huggingface.co/baichuan-inc/Baichuan-13B-Base), [Hugging Face Baichuan-13B-Chat](https://huggingface.co/baichuan-inc/Baichuan-13B-Chat).

## 1. 材料范围与模型规格

### 1.1. 这份 README 覆盖了哪几面

页 1 是仓库外壳: 文件只有 media, LICENSE, 中英 README, cli_demo.py, requirements.txt, web_demo.py, Python 100%, 5 位贡献者, 没有 release. 模型实现和权重都在 Hugging Face, 靠 `trust_remote_code=True` 拉取. 正文依次是更新信息, 介绍, 三张榜, 模型细节, 三种推理方式, 推理性能, 量化, CPU 部署, 微调, 声明; 目录里列了 「协议」, 8 页中没出现, 声明段在半句处截断.

按一个模型的几个面来数: 数据只有 「高质量语料 1.4 万亿 tokens, 比 LLaMA-13B 多 40%」 一句; 结构有一张两行的表; 预训练系统没写; 后训练只知道有个 Chat 版本; 评测有三张榜; 部署一面反而最详细, 包括速度, 显存, 量化和 CPU. 和 7B 的 README 比, **重心从 「怎么训出来」 挪到了 「怎么用起来」**. 更新信息里写着 2023.08.01 更新过 Chat 权重, 2023.09.06 已发布 Baichuan 2, 表里的 Chat 分数对应哪一版权重, 页面没交代.

### 1.2. 两行模型细节表能推出什么

13B 这一行: 隐藏层 5,120, 40 层, 40 头, 词表 64,000, 总参 13,264,901,120, 训练数据 1.4 万亿, ALiBi, 最大长度 4,096. 7B 那一行对应 4,096, 32, 32, 64,000, 7,000,559,616, 1.2 万亿, RoPE, 4,096. 两代共用词表, 头维度都是 128, 窗口没变, 变的是宽度, 深度, token 数和位置编码. 按 6 × 参数量 × token 数, 13B 的训练计算量约 1.1e23 FLOPs, 约是 7B 的 2.2 倍.

总参精确到个位, 可以拿来反推表里没给的 FFN 宽度. 假设沿用 7B 的块结构 (标准多头注意力 4 × d², SwiGLU 三矩阵, 输入与输出 embedding 不共享, 每层两个 RMSNorm), 扣掉两张 64,000 × 5,120 的词表矩阵和归一化权重, 每层剩下的参数减去注意力部分再除以 3 × 5,120, 得到整数 13,696. 同一套假设在 7B 上正好复现 11,008 和 7,000,559,616. 13,696 也正是后来 Baichuan 2-13B 技术报告表里写的 FFN 宽度, 这说明**两代 13B 用的是同一副骨架**. 整除本身只证明假设和表内数字自洽, 页面没有直接写 FFN 宽度. SwiGLU 的一般形式见 [GLU 家族: 从 GLU 到 SwiGLU](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.1-前馈网络FFN与激活函数/03-GLU家族-从GLU到SwiGLU/03-GLU家族-从GLU到SwiGLU.md).

表里还有一个容易漏掉的数: 1.4 万亿 token 对 13B 来说, 每参数约 106 个 token, 7B 是每参数约 171 个. 13B 比 7B 大了近一倍, 数据只多了约 17%, 所以 13B 相对而言 「吃得更少」. 页面没有任何 Scaling Laws 论证, 读不出这个配比的理由. 到 Baichuan 2 时两档统一训到 2.6 万亿 token, 这个差距才被拉平.

## 2. 位置编码与评测

### 2.1. ALiBi 换来的速度, 和它没证明的东西

位置编码从 RoPE 换成 ALiBi. **ALiBi** 不旋转 Q 和 K, 而是在注意力分数上按距离加一个每头固定斜率的线性惩罚, 没有可学习参数. 推理性能节的主张是 「相对于 Rotary Embedding 计算量更小」, 相对标准 LLaMA-13B 平均推理速度提升 31.6%; 表中 LLaMA-13B 19.4 tokens/s, Baichuan-13B 25.4 tokens/s. 测试条件是 A100-SXM4-80G, PyTorch 2.0.0, transformers 4.29.1, batch size 1, 生成长度 2048, fp16, 基于 Base. Hugging Face 上 13B 的实现里, ALiBi 偏置在首次推理时预先生成一张 mask 缓存起来, 后续步直接切片使用.

这段要分开看两件事. 其一, 25.4 / 19.4 约为 1.309, 即 30.9%, 与 31.6% 差 0.7 个百分点, 可能是先按样本求提升再平均, 页面无法判定. 其二, 这是两个完整模型的端到端对比, 没有 「只换位置编码」 的消融. batch size 1 的单流生成通常受显存带宽限制, 每步都要读一遍全部权重, RoPE 那点逐元素运算未必是瓶颈; 两份实现在算子, 融合和缓存上的差异同样会影响速度. 所以 **31.6% 不能直接当作 ALiBi 相对 RoPE 的收益**. 机制差别见 [位置编码](../../../../llm-guide/2-核心原理与架构/2.1-深度学习基础组件/2.1.4-位置编码/2.1.4-位置编码.md) 与 [位置编码与外推](../../../../llm-guide/2-核心原理与架构/2.5-长上下文与外推技术/01-位置编码与外推.md).

ALiBi 在论文里的卖点是 「train short, test long」, 但这份 README 没有用它做外推, 13B 的最大长度仍是 4,096, 和 7B 一样. 选择 ALiBi 的代价要到 Baichuan 2 报告里才被说出来: FlashAttention 这类优化内核更适合乘法式的 RoPE, 加性偏置需要把 mask 传进注意力算子. Baichuan 2 在两档上继续保留 RoPE 与 ALiBi 的分工, 说是给研究者留对照; 再往后的百川医学线 M1 统一回到了 RoPE. KV cache 与单流生成的显存关系见 [KV 缓存与内存优化](../../../../llm-guide/6-训练与推理优化/6.4-KV缓存与内存优化/6.4-KV缓存与内存优化.md).

### 2.2. 三张榜: 中文领先明显, 英文只靠 Chat 守住

Benchmark 节只有一句 「5-shot 评测」. 三张表各 9 行, 对照组是 13B 上下的开源模型 (Vicuna-13B, LLaMA-13B, Chinese-Alpaca-Plus-13B, Chinese-LLaMA-Plus-13B, Ziya-LLaMA-13B-Pretrain, moss-moon-003-base 16B) 加自家 7B. C-Eval 上 Base 52.4, Chat 51.5, 次名是自家 7B 的 42.8; CMMLU 上 Base 55.3, Chat 55.8, 次名还是 7B 的 44.0. 中文两张榜领先十分左右, 和 7B 时代的中文投入是一条线.

MMLU 上情况不同. Vicuna-13B 为 52.0, Baichuan-13B-Base 为 51.6, 低于 Vicuna; Chat 为 52.1, 只高 0.1. 开篇 「中英文 benchmark 上均取得同尺寸最好」 **在英文侧靠的是 Chat 这一行**. 还有两处口径要对齐: C-Eval 的 Average 与四大类的算术平均对不上, 说明另有加权; CMMLU 的列序与前两张表不同, 并被分页切成两段. 具体数字在 bi 的对应表格后面. 评测证据的一般读法见 [评测科学与证据](../../../../llm-guide/5-评测、安全与治理/5.1-评测科学与证据.md).

Chat 与 Base 的差距在三张榜上都在一分左右, 方向不一致: C-Eval 上 Chat 低 0.9, MMLU 和 CMMLU 上 Chat 高 0.5 左右. 页内没写 Chat 用了什么对齐方法, 是只做了 SFT 还是还有偏好优化, 也没写 5-shot 评测时 Chat 是否套用对话模板. **这组差异只能记成现象, 不能归因**. SFT 的一般位置见 [SFT](../../../../llm-guide/4-后训练/4.2-SFT/4.2-SFT.md). 后训练这一面, 百川要到 Baichuan 2 才第一次公开 SFT 加 PPO 的完整流程.

## 3. 部署, 微调与家族位置

### 3.1. int8 与 int4: 部署门槛的真实代价

量化节给出在线量化写法: 先以 float16 加载, 再调 `quantize(8)` 或 `quantize(4)`, 最后 `.cuda()`; 另外提供已量化的 Baichuan-13B-Chat-int8. 节首的加粗警示要求先把原精度模型放在 CPU 上再量化, 否则省不下显存. 显存表: bf16/fp16 26.0 GB, int8 15.8 GB, int4 9.7 GB. 26.0 GB 与 13.26B × 2 字节 ≈ 26.5 GB 基本对得上, int8 没有降到一半, 可能是 embedding 等部分层仍按高精度存放, 页面没说是哪些.

量化前后分数表只测了 Base: int8 在 C-Eval, MMLU, CMMLU 上分别为 51.2, 49.9, 54.5, 各掉一分上下; int4 为 47.6, 46.0, 51.0, 掉四到六分. 放在一起读, **「几乎无损」 和 「可部署在 3090」 主要由 int8 撑住**: 15.8 GB 能装进 24 GB 的 3090, 还留出 KV cache 空间. **int4 省下的显存是用可见的分数下降换的**, int4 版的 MMLU 已经低于 LLaMA-13B 的 46.3. 量化方法本身 (逐通道还是分组, 有无校准数据) 页面没写, 一般做法见 [权重量化](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1.1-权重量化.md). CPU 部署只有一句: float32 加载约需 60GB 内存, 速度较慢, 13.26B × 4 字节约 53 GB, 与 60GB 同量级.

### 3.2. 微调脚本露出的内部命名, 和家族里的位置

微调节推荐第三方的 LLaMA Efficient Tuning, 给出 instruction / input / output 三字段的 json 格式和两份脚本. 全量微调在 8 张 A100 80GB 上用 deepspeed, ZeRO stage 2, fp16 动态 loss scale; LoRA 在单卡上跑, rank 8, `--lora_target W_pack`. 两份脚本学习率同为 5e-5, cosine, 梯度裁剪 0.5, 2 个 epoch, 数据集是 alpaca_gpt4_en 与 alpaca_gpt4_zh. W_pack 是 7B 代码里就有的打包 QKV 投影, LoRA 只挂在它上面, 意味着**默认只调注意力投影, 不碰 FFN**. 配置文件名前后不一致 (标题 deep_speed.json, 脚本传 deepspeed.json), 照抄会出错. LoRA 的原理与常见挂载位置见 [LoRA 低秩适应](../../../../llm-guide/4-后训练/4.3-PEFT/01-LoRA低秩适应：原理实现与工业实践.md).

放回家族看, **13B 是第一代百川的收尾**: 结构沿用 7B 的 LLaMA 式配方, 词表不变, 做大的是宽度, 深度和 token 数, 新增的是 ALiBi, Chat 版和量化版, 前一版见 [Baichuan-7B 解析](../baichuan-7b/baichuan-7b-analysis.md). 它没回答的问题, 如数据怎么配, Chat 怎么对齐, 训练怎样才稳, 要到 [Baichuan 2](../baichuan-2/baichuan-2-analysis.md) 才有技术报告. 那份报告描述的是下一代模型, 数字不能直接搬到 Baichuan-13B 上, 但从反推出的 13,696 看, 两代 13B 的骨架是同一副.
