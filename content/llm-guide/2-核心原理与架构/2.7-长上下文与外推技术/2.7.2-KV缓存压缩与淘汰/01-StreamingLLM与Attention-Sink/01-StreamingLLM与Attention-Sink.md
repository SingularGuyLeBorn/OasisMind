---
title: "01 · StreamingLLM 与 Attention Sink"
category: "LLM 指南"
published: true
tags: ["StreamingLLM", "Attention-Sink", "KV-Cache", "Softmax", "ICLR 2024"]
excerpt: "只保留最近一段 KV 的窗口注意力, 一旦把序列开头的 token 移出 cache, 困惑度就会飙升. 原因是模型把大量注意力分给开头几个 token. StreamingLLM 永久保留开头 4 个 token 的 KV, 再加一段滚动窗口, 不微调就能稳定处理数百万 token 的流式输入."
---

# StreamingLLM 与 Attention Sink

## 1. 流式部署的问题与已有做法

### 1.1 流式应用的两个难点

流式应用 (例如多轮对话) 要求模型连续运行很长时间. 论文指出两个难点. 一是解码阶段要缓存所有历史 token 的 key 和 value, 内存随长度线性增长, 每步注意力的计算也随之增长. 二是主流模型无法泛化到比训练序列更长的文本: Llama-2 的预训练窗口是 4K, 超过之后困惑度上升.

最直接的办法是窗口注意力: cache 只保留最近 $L$ 个 token 的 KV. cache 填满之后, 内存和每步解码速度都是常数. 但论文 Figure 3 在 20K token 的文本上显示, 序列长度一超过 cache 大小, 窗口注意力的困惑度就急剧上升. 超过的时刻恰好是第一个 token 被移出 cache 的时刻.

论文要回答的问题是: 一个用有限窗口训练好的模型, 能否在不微调, 不重算的前提下, 对远超预训练长度的流式文本稳定地做语言建模.

### 1.2 已有做法

论文 Figure 1 对比了四种做法. 设模型的预训练长度为 $L$, 正在预测第 $T$ 个 token, $T\gg L$.

| 做法 | 每步时间 | cache | 超过 $L$ 后的表现 |
|---|---|---|---|
| 稠密注意力 | 累计 $O(T^2)$ | 随 $T$ 增长 | 超过预训练长度后困惑度上升 |
| 窗口注意力 | $O(TL)$ 累计 | 最近 $L$ 个 | 开头 token 被移出后崩溃 |
| 窗口内重算 | $O(TL^2)$ 累计 | 最近 $L$ 个 | 质量好, 但每个新 token 都要从原文重建最近 $L$ 个 token 的 KV |
| StreamingLLM | $O(TL)$ 累计 | sink + 最近窗口 | 稳定 |

窗口内重算对每个新 token 都把最近 $L$ 个 token 重新跑一遍前向, 窗口内是完整的二次注意力, 等于每步都在一个从头开始的短序列上推理, 所以不受 sink 问题影响. 论文把它当作质量上的 oracle, 也是唯一质量可用的基线, 但它太慢, 不适合流式部署.

注意窗口注意力在 cache 填满之前和稠密注意力完全相同, 问题只在填满之后出现. 这也是 Figure 3 里窗口注意力的困惑度在 cache 大小处突然跳升, 而不是逐渐变差的原因: 跳升之前开头 token 一直在 cache 里, 跳升那一刻第一个 token 被移出. 稠密注意力的拐点则在预训练长度处, 两者的失效原因不同.

论文把处理长文本的研究分成三个方向, 并说明 StreamingLLM 只属于第一个:

- **长度外推.** 让短文本上训练的模型处理更长的文本, 主要靠相对位置编码. RoPE 在超过训练窗口的文本上表现不好; ALiBi 外推更好一些, 但论文在 MPT 上发现, 文本远长于训练长度时仍会崩溃.
- **上下文窗口扩展.** 让一次前向能处理更多 token, 如 FlashAttention 这类系统优化, 近似注意力, RoPE 插值加微调. 这些方法只能把窗口扩展到有限长度, 处理不了无限输入.
- **更好地利用长上下文.** 让模型真正用上上下文里的信息. 前两个方向的进展不一定带来这一点.

StreamingLLM 不扩大注意力窗口, 也不增强模型对长文本的记忆, 后两个方向和它正交, 可以叠加.

论文附录还对比了 Sparse Transformer, Longformer, ETC, BigBird 这类固定稀疏模式. 它们的问题是: 有的需要专门的块稀疏 GPU kernel; Longformer, ETC, BigBird 依赖全局注意力模式, 不适合自回归语言模型; 都要从头训练, 不能用于已有的预训练模型. StreamingLLM 用标准 kernel 就能实现, 直接用于已有的稠密注意力模型.

## 2. attention sink

### 2.1 现象

论文可视化了 Llama-2-7B 在 256 个长 16 的句子上的平均注意力 logits (Figure 2): 第 0, 1 层呈局部模式, 最近的 token 得到更多注意力; 往上的所有层所有头都集中关注开头的 token. 附录 Figure 11 把句子长度换成 128, Figure 13 换成 Llama-2-70B, 结论相同. 论文提到, 序列越长, 热力图上 sink 的分数显得越淡, 因为同样的注意力要和更多位置一起画在图上; 所以长序列要用下面的定量方法看.

附录 F 做了定量分析: 在 256 个长 4096 的序列上, 第 4096 个 token 在每一层分给第一个 token 的 softmax 注意力, 除了最底下两层, 通常超过总注意力的一半.

### 2.2 为什么移走开头 token 会崩

softmax 的分母包含所有被注意的 token. 开头 token 的 logit 很大时 (论文式 (1)):

$$
\mathrm{SoftMax}(x)_i=\frac{e^{x_i}}{e^{x_1}+\sum_{j=2}^{N}e^{x_j}},\qquad x_1\gg x_j,\ j\in2,\dots,N. \tag{1}
$$

窗口注意力把第一个 token 移出 cache, 相当于从分母里去掉了很大的一项 $e^{x_1}$. 剩下各项的注意力分数都被放大, 整个分布偏离了模型在训练中见过的形状, 后续层的输入随之失真.

举个数字例子. 设某个头上第一个 token 拿走了 0.6 的注意力, 其余 0.4 分布在最近的 token 上. 去掉第一个 token 后, 剩下的分数要重新归一化, 每一项都乘以 $1/0.4=2.5$. 这个头的输出从「0.6 份 sink 的 value 加 0.4 份内容」变成「1.0 份内容」. 如果 sink 的 value 接近零向量, 原来的输出大小约是内容部分的 0.4 倍, 现在放大到 2.5 倍. 每层每头都这样偏一下, 误差逐层累积.

### 2.3 是语义还是位置

开头 token 重要, 可能是因为语义, 也可能是因为模型学到了对绝对位置的偏好. 论文把开头 4 个 token 换成换行符 `"\n"` 来区分 (Table 1, Llama-2-13B, PG19 第一本书, 约 65K token):

| cache 配置 | 困惑度 |
|---|---|
| 0 + 1024 (纯窗口) | 5158.07 |
| 4 + 1020 | 5.40 |
| 4 个 `"\n"` + 1020 | 5.60 |

$x+y$ 表示 $x$ 个开头 token 加 $y$ 个最近 token. 换成换行符后困惑度几乎恢复, 说明重要的是开头 token 的绝对位置, 不是它们的内容. 论文还观察到, 换成换行符之后模型仍然把大量注意力分给这 4 个位置. 换行符本身几乎不携带信息, 模型照样把它们当 sink 用, 可见 sink 的作用是在分母里占住一大块, 而不是给输出提供什么内容.

### 2.4 为什么偏偏是开头

论文给出的解释是: softmax 不允许所有被注意 token 的分数都为零, 即使当前 embedding 本身已经有足够的信息做预测, 也必须从其他 token 聚合一些信息. 于是模型倾向于把不需要的注意力倒给特定的 token. 自回归建模中, 开头 token 对后面所有 token 都可见, 而后面的 token 只对有限的后续 token 可见, 所以开头 token 更容易被训练成 sink. 量化研究中的异常值现象也有类似观察, Miller 据此提出了 SoftMax-off-by-one.

为什么需要好几个开头 token, 而不是一个? 论文认为是因为预训练样本没有统一的起始 token. Llama-2 虽然给每个段落加了 `<s>`, 但这是在切分文本块之前加的, 切块后第 0 个位置上的 token 大多是随机的. 没有统一的起始 token, 模型就用前几个 token 一起当 sink.

## 3. 带 sink 的滚动 KV cache 与专用 sink token

### 3.1 方法: 带 sink 的滚动 KV cache

StreamingLLM 把 cache 分成两部分 (论文 Figure 4): attention sink, 即开头 4 个 token 的 KV, 用来稳定注意力计算; 滚动 KV cache, 保留最近的 token, 承担实际的语言建模. 记 sink 数为 $s$, 窗口大小为 $W$, cache 大小为 $C=s+W$. 生成第 $T$ 个 token 时, cache 里的原文下标是

$$
\mathcal{K}_T=\{0,1,\dots,s-1\}\cup\{T-W,\dots,T-1\}. \tag{2}
$$

**位置按 cache 内下标编号.** 计算相对距离和加位置信息时, StreamingLLM 用 token 在 cache 里的位置, 而不是在原文里的位置. 论文的例子: cache 里是原文的 $[0,1,2,3,6,7,8]$, 正在解码第 9 个 token, 赋予的位置是 $[0,1,2,3,4,5,6,7]$, 而不是 $[0,1,2,3,6,7,8,9]$. 这样当前 query 和任何缓存 token 的相对距离都不超过 $C$. 只要 $C$ 不超过预训练长度, 模型看到的相对距离就都在训练时见过的范围内, 无论原文已经多长.

手算一例: $s=4$, $W=6$, $C=10$, 正在生成原文第 20 个 token (下标从 0 开始). 按式 (2), cache 里是原文下标 $\{0,1,2,3\}\cup\{14,\dots,19\}$. 它们在 cache 内依次编号为 0 到 9, 当前 token 编号为 10. 当前 token 和 sink 的相对距离是 7 到 10, 和窗口内 token 的距离是 1 到 6. 如果按原文位置, 当前 token 和第 0 个 token 的距离是 20, 生成到第 100 万个 token 时就是 100 万, 远超预训练时见过的距离. 下一步生成第 21 个 token 时, 原文第 14 个 token 被移出, 第 20 个进入, cache 内编号整体前移一位, 但当前 token 的编号仍是 10.

这一点对 RoPE 有实现上的要求: cache 里存旋转之前的 key, 每步解码时按当前的 cache 内位置重新施加旋转. 因为窗口每滑动一步, 同一个 token 的 cache 内位置就会变. 按这个做法推算, 每步每层要给 cache 里全部 $C$ 个 key 重新施加旋转, 计算量是 $O(Cd)$, 和这一步注意力打分的 $O(Cd)$ 同阶, 只是常数更小; 好处是 cache 里的 key 和具体位置无关, 窗口滑动时不用改存储的内容. 对 ALiBi 更直接: 给注意力分数加连续的线性偏置, 不加按原文距离跳变的偏置. 论文说明这种赋位方式对所有使用相对位置编码的自回归模型都适用.

**每步代价.** 每个新 token 对 $C$ 个 KV 做注意力, 每步 $O(C)$; 窗口内重算每步要对 $W$ 个 token 重做前向, 窗口内注意力是 $O(W^2)$. 两者之比随窗口大小线性增长. 论文在单张 A6000 上用 HuggingFace Transformers 实现, 测 Llama-2-7B 和 13B (Figure 10): 随着 cache 增大, StreamingLLM 的解码时延线性增长, 重算基线二次增长, 每 token 加速最高 22.2×; 两者的显存占用相近.

**显存.** 按 Llama-2-7B 的结构估一下: 32 层, 32 个头, 每头 128 维, FP16. 每个 token 的 KV 是 $2\times32\times4096\times2$ 字节, 即 512 KiB. cache 2048 个 token 时约 1 GiB, 不随流的长度变化. 如果稠密注意力要缓存 400 万 token, 需要约 2 TB, 远超单卡显存; 何况超过 4K 之后模型质量本身就崩了. StreamingLLM 的显存是常数, 代价是看不到被移出窗口的内容. 再加上约 13.5GB 的 FP16 权重, Llama-2-7B 加 2048 的 cache 一共不到 15GB, 单张 48GB 的 A6000 有很大余量; 4 个 sink 只占这 2048 条的 0.2%, 在显存上可以忽略. 按论文的代价分析, 两者每步代价之比随窗口线性增长, 窗口从 1024 加到 4096, 重算基线每步的注意力计算约变成 16 倍, StreamingLLM 约变成 4 倍. 窗口越大, StreamingLLM 相对重算的优势越明显, 这和 22.2 倍出现在 cache 最大的那一端是相互一致的.

### 3.2 预训练时加专用 sink token

既然已有模型用多个开头 token 当 sink 是因为缺少统一的起始 token, 论文提出两种预训练改法:

- **Sink Token.** 在每个训练样本开头加一个可学习的占位 token, 专门吸收多余的注意力.
- **Zero Sink.** 把 softmax 换成 SoftMax-off-by-one (论文式 (2)), 不要求所有上下文 token 的分数加起来为 1:

$$
\mathrm{SoftMax}_1(x)_i=\frac{e^{x_i}}{1+\sum_{j=1}^{N}e^{x_j}}. \tag{3}
$$

$\mathrm{SoftMax}_1$ 等价于在注意力计算中前置一个 key 和 value 全为零的 token: 零 key 和任何 query 的内积都是 0, 贡献分母里的 $e^0=1$; 零 value 对输出没有贡献. 当所有 $x_i$ 都远小于 0 时, 各项分数都接近 0, 这个头相当于什么都不看.

论文用 Pythia-160M 的代码和训练配方, 在 8 卡 A6000 上用去重的 Pile 从头训练三个 160M 模型, 除了把 batch size 降到 256, 其余配置不变, 各训练 143,000 步. 流式困惑度 (Table 3, PG19 测试集第一个样本):

| cache 配置 | 0+1024 | 1+1023 | 2+1022 | 4+1020 |
|---|---|---|---|---|
| 原始 | 27.87 | 18.49 | 18.05 | 18.05 |
| Zero Sink | 29214 | 19.90 | 18.27 | 18.01 |
| Sink Token | 1235 | 18.01 | 18.01 | 18.02 |

Zero Sink 只部分缓解了问题, 模型仍然要依赖其他开头 token: 去掉所有开头 token (0+1024) 时困惑度是 29214, 比原始模型的 27.87 差得多, 保留 4 个才回到 18.01. 论文没有分析原因. 一种理解是, 零 key 给分母贡献的是固定的 1, 它能吸收多少注意力取决于其他 logit 的大小, 模型无法调节; 可学习的 sink token 有自己的 key, 模型可以学到合适的 logit; 加 Sink Token 的模型只需保留这 1 个 token 就稳定, 困惑度还略低. 两种模型的预训练损失曲线 (Figure 6) 收敛趋势相近. 7 个零样本基准 (Table 4) 上, 加 sink token 的模型和原始模型持平或略高, 例如 ARC-c 19.6 对 18.6, HellaSwag 29.8 对 29.4, Winogrande 50.8 对 50.1. 注意力可视化 (Figure 7) 显示, 加了 sink token 后, 各层各头都明显关注它, 分给其他开头 token 的注意力变少. 论文据此建议以后预训练都在所有样本中加 sink token.

**两个 sink token 没有更好.** 附录 I 又训练了加 2 个 sink token 的模型. 预训练损失和原始模型接近, 零样本基准 (Table 9) 没有明显提升, 例如 LAMBADA 从 39.9 降到 37.5, PIQA 从 62.6 升到 64.3. 流式困惑度 (Table 10) 上, 1+1023 时为 25.73, 2+1022 时才回到 18.05, 说明模型同时依赖这两个 sink token. 论文指出这和 ViT 的发现不同, 在 ViT 中多个 register 是有益的.

**适用场景.** 论文附录 A 举的例子是基于大模型的日常助手. 传统做法在对话长度超过训练长度时, 要么重置 cache, 丢掉最近的上下文; 要么从最近的文本历史重算 KV, 效率很低. StreamingLLM 让模型一直基于最近的交互回答, 不用刷新 cache. 和窗口注意力相比, 它只多存了 4 个 token 的 KV, 实现上也只改了 cache 的驱逐规则和位置编号, 不改模型权重, 也不改注意力 kernel.

## 4. 实验

### 4.1 语言建模

模型选了 Llama-2, MPT, Pythia, Falcon 四个系列. 其中 Llama-2, Falcon, Pythia 用 RoPE, MPT 用 ALiBi. 默认 4 个 sink. 数据是拼接起来的 PG19 测试集 (100 本书). Llama-2 的 cache 设为 2048, 其他模型设为 1024, 都是各自预训练窗口的一半, 论文说这样选是为了让图更清楚.

20K token 上 (Figure 3), StreamingLLM 的困惑度和窗口内重算基本重合. 400 万 token 上 (Figure 5), Llama-2-[7, 13, 70]B, Falcon-[7, 40]B, Pythia-[2.8, 6.9, 12]B, MPT-[7, 30]B 的困惑度都保持稳定, 书与书衔接处有波动.

**sink 数量** (Table 2, 400K token):

| cache 配置 | 0+2048 | 1+2047 | 2+2046 | 4+2044 | 8+2040 |
|---|---|---|---|---|---|
| Falcon-7B | 17.90 | 12.12 | 12.12 | 12.12 | 12.12 |
| MPT-7B | 460.29 | 14.99 | 15.00 | 14.99 | 14.98 |
| Pythia-12B | 21.62 | 11.95 | 12.09 | 12.09 | 12.02 |

Llama-2-7B 的配置是 4096 总量: 0+4096 为 3359.95, 1+4095 为 11.88, 2+4094 为 10.51, 4+4092 为 9.59, 8+4088 为 9.54. 一两个 sink 在 Llama-2 上不够, 4 个基本够, 再加收益很小. 不同模型对 sink 数的敏感程度差别很大: Falcon-7B 只要 1 个 sink 就从 17.90 降到 12.12, 之后再加完全不变; MPT-7B 纯窗口时高达 460.29, 1 个 sink 就回到 14.99; Llama-2-7B 从 1 个到 4 个还在持续下降. 这和 2.4 节的解释一致: 预训练数据的起始 token 越不统一, 模型分散到前几个位置上的 sink 越多. 论文没有给出各模型预训练数据切分方式的细节, 这一对应关系是推测.

**cache 大小** (Table 6, 400K token): 加大 cache 不一定降低困惑度. Falcon-7B 从 4+1020 的 12.34 升到 4+2044 的 12.84; MPT-7B 从 4+252 的 14.12 一路升到 4+2044 的 14.99; Llama-2-7B 在 4+2044 时最低 (9.08), 4+4092 反而是 9.59. 论文认为这说明这些模型没有充分利用给它们的全部上下文.

### 4.2 流式问答

把 ARC-Easy 和 ARC-Challenge 的全部问答对拼成一条连续的流, 输入 Llama-2-[7, 13, 70]B-Chat, 在每个答案位置用精确匹配评分 (Table 5, cache 1024). 稠密注意力显存溢出. 窗口注意力的输出在输入超过 cache 后变成随机文本, 7B 上 ARC-E 只有 3.58, ARC-C 只有 1.39. StreamingLLM 是 71.34 和 55.03, 和逐题单独回答的 one-shot 基线 (71.25, 53.16) 相当; 70B 上为 91.37 和 80.20, 基线是 91.29 和 78.50.

论文还构造了 StreamEval: 每输入 10 行新信息提问一次, 答案总在 20 行之前, 模拟提问通常针对最近信息的场景. 按附录 C 的说明, 每行 23 个 token, 20 行约 460 个 token, 远小于 cache, 所以答案总在窗口内. 这个基准衡量的是模型在流已经远超预训练长度时, 还能不能正常读取窗口里的近期信息, 不衡量远距离检索. 输入接近 120K token 时 StreamingLLM 仍保持合理的准确率, 稠密注意力和窗口注意力分别在超过预训练长度和 cache 大小时失效. 用 LongChat-7b-v1.5-32k 和 Llama-2-7B-32K-Instruct 这两个扩展过上下文的模型, 可以把 cache 开得更大. 论文强调这里的上下文扩展指的是加大 cache, 能看到更大范围的最近信息.

### 4.3 超出 cache 的信息找不回来

附录 C 把 StreamEval 的问答距离拉长 (Table 7, Llama-2-7B-32K-Instruct, 每行 23 个 token). 距离在 cache 以内时准确率还在, 超过 cache 就降为 0. 例如 cache 4+2044 时, 80 行 (1840 token) 的准确率是 75.30, 100 行 (2300 token) 是 0. 表中还有一个现象: cache 4+16380 时, 20 行距离的准确率是 77.65, 比 4+2044 的 85.80 还低. cache 内的信息也没有被充分利用, 和 Liu 等人 Lost in the Middle 的观察一致.

附录 D 在 LongBench 上用 Llama-2-7B-chat (最长 4K) 对比 (Table 8). LongBench 对这个模型的默认做法是截断到 3500 token, 保留开头和结尾各 1750 个. StreamingLLM 4+3496 在所有子任务上都低于截断基线, 例如 NarrativeQA 11.6 对 18.7. 论文认为原因是丢掉了输入开头的提示信息. 把 sink 数改成 1750 (即 1750+1750) 后, 结果回到截断基线的水平, 例如 NarrativeQA 18.2, Qasper 19.7 对 19.2. StreamingLLM 的效果完全取决于 cache 里有什么.

## 5. 相关现象, 后续做法与边界

### 5.1 相关现象和后续做法

**编码器和 ViT 也有.** 论文附录 H 显示 BERT-base-uncased 在大多数层把很高的注意力分给 `[SEP]`. 同期 Darcet 等人在 ViT 中发现注意力集中在随机的背景 patch 上, 提出加专用的 register token. 论文认为两者类似; 区别是 register 在中间层充当全局信息的载体, 而 sink 是自回归模型的开头 token. 论文据此推测 softmax 在 sink 的形成中起了更根本的作用.

**同期工作.** Han 等人 (LM-Infinite) 从理论上分析了长度泛化失败, 用 Λ 形注意力模式并重新设置位置距离, 做法和 StreamingLLM 相似.

**训练期的 sink logit.** DeepSeek-V4 的 CSA 和 HCA 核心注意力引用 StreamingLLM 和 OpenAI 2025, 给每个头设一个可学习的 sink logit $z'_h$, 在分母里加 $\mathrm{Exp}(z'_h)$, 和式 (3) 的分母加 1 是同一类做法, 只是常数换成了可学习的标量. 这样每一行的注意力和可以小于 1, 不需要额外的 KV. 详见 [CSA-HCA 篇](../../../2.4-稀疏注意力/04-CSA-HCA-混合压缩注意力/04-CSA-HCA-混合压缩注意力.md). 这里的 OpenAI 2025 指 gpt-oss: 它的模型卡写明每个注意力头有一个学出来的偏置, 加在 softmax 的分母上, 让这个头可以把注意力几乎全部「不分给」任何 token. 这正是 3.2 节里 Sink Token 做法的另一种实现, 不占 cache 槽位.

**推理框架的集成.** 官方仓库列出的集成包括 NVIDIA TensorRT-LLM, Intel Extension for Transformers, HuggingFace Transformers 和 CMU 的 MLC LLM. HuggingFace Transformers 里对应的是一种带 sink 的 cache 类 (`SinkCache`), 构造时指定窗口长度和 sink token 数, 驱逐规则就是式 (2).

**和其他 KV 压缩方法的区别.** StreamingLLM 保留的位置是固定的, 不看注意力分数. [H2O](../02-H2O-Heavy-Hitter-Oracle/02-H2O-Heavy-Hitter-Oracle.md) 按累计注意力分数动态驱逐, [SnapKV](../03-SnapKV-生成前观测窗/03-SnapKV-生成前观测窗.md) 用 prompt 末尾的观测窗挑选要保留的 prompt KV, [Quest](../08-Quest-查询感知稀疏/08-Quest-查询感知稀疏.md) 保留全部 KV, 每步按当前 query 选页. 这些方法里很多都把开头若干 token 和最近窗口作为固定保留的部分, 例如 [NSA](../../../2.4-稀疏注意力/02-原生稀疏注意力机制NSA/02-原生稀疏注意力机制NSA.md) 的 LongBench 实验给所有稀疏基线都配了开头 128 个和最近 512 个 token.

### 5.2 边界

**不扩展上下文, 不增强长期记忆.** 论文附录 A 明确写了: 模型只能在当前 cache 内工作, 不适合长文档问答和摘要这类需要长期记忆和大量数据依赖的任务, 适合日常对话, 短文档问答这类只需要短期记忆的场景. 附录 C 和 D 的结果都印证了这一点.

**cache 内的信息也未必用好.** Table 6 和 Table 7 显示, 加大 cache 不一定带来更好的困惑度或检索准确率.

**sink 数量取决于模型.** 默认 4 个是在 Llama-2, MPT, Falcon, Pythia 上的经验值. Falcon 1 个就够, Llama-2 需要 4 个. 换新模型需要重新确认.

**位置编码需要支持重新编号.** RoPE 要缓存旋转前的 key, 每步重新旋转, 这比常规实现多了每步对整个 cache 施加旋转的计算. 使用绝对位置编码的模型不适用.

**效率对照的范围.** 22.2× 是和窗口内重算比, 不是和稠密注意力比. 稠密注意力在长流上会显存溢出或质量崩溃, 不存在可比的速度. 实验只用了 HuggingFace Transformers 实现和单张 A6000.

**sink token 的建议只在小模型上验证.** 预训练实验是 160M 参数, 更大规模上是否同样有效, 论文没有验证. 而且这个改法要从预训练开始, 已有模型只能用保留开头 4 个 token 的做法.

**流里的提示信息会被移出.** 系统提示, 任务说明通常在对话开头, 紧跟在 sink 之后. 对话一长, 它们就滑出窗口, 只剩开头 4 个 token. LongBench 上 4+3496 低于截断基线, 论文给出的原因正是丢了开头的提示. 需要一直遵守系统提示的应用, 要把提示放进固定保留的部分, 例如像附录 D 那样把 sink 段加长, 代价是窗口相应缩短.

## 参考文献

1. Xiao, G., Tian, Y., Chen, B., Han, S., Lewis, M. (2024). [Efficient Streaming Language Models with Attention Sinks](https://arxiv.org/abs/2309.17453). ICLR 2024. arXiv:2309.17453. 式 (1)(2), Table 1–10, Figure 1–15. 代码: [mit-han-lab/streaming-llm](https://github.com/mit-han-lab/streaming-llm).
2. Miller, E. (2023). [Attention Is Off By One](https://www.evanmiller.org/attention-is-off-by-one.html).
3. Darcet, T., Oquab, M., Mairal, J., Bojanowski, P. (2023). [Vision Transformers Need Registers](https://arxiv.org/abs/2309.16588). arXiv:2309.16588.
4. Han, C., Wang, Q., Xiong, W., et al. (2023). [LM-Infinite: Zero-Shot Extreme Length Generalization for Large Language Models](https://arxiv.org/abs/2308.16137). arXiv:2308.16137.
5. Liu, N. F., Lin, K., Hewitt, J., et al. (2023). [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172). arXiv:2307.03172.
6. DeepSeek-AI. (2026). [DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence](https://arxiv.org/abs/2606.19348). arXiv:2606.19348. Attention Sink 一节.
