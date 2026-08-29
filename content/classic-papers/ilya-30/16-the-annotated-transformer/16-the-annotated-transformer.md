---
title: "The Annotated Transformer"
category: Attention与Transformer
published: true
excerpt: >-
  Ilya 清单第 16 篇紧接第 15 篇 Attention Is All You Need, 是 30 篇里唯一的「论文原文 +
  逐行代码注解」配对. 2018 年 4 月, Harvard NLP 的 Alexander Rush 拉上 OpenNMT 的 Vincent
  Nguyen 和 Guillaume Klein, 把论文 8 页正文拆成段落, 每段配上可运行的 PyTorch 代码, 全文本身就是一个
  Jupyter notebook. 400 行库代码, 4 张 V100 上跑到 27000 tokens/s. 本帖不复述第 15 篇的
tags:
  - Ilya
  - Transformer
  - AnnotatedTransformer
  - PyTorch
  - AlexanderRush
  - OpenNMT
  - Ilya推荐30篇
  - 经典论文
---
# The Annotated Transformer: 论文告诉你是什么, 400 行代码告诉你到底怎么做

> 原始文本: Alexander Rush, "The Annotated Transformer", Harvard NLP, 2018-04-03. 后续由 Vincent Nguyen, Guillaume Klein 等维护.
> http://nlp.seas.harvard.edu/2018/04/03/attention.html
> 这是 Ilya Sutskever 阅读清单的第 16 项, 紧接第 15 项 Attention Is All You Need. 全清单 30 篇里, 这是唯一一对「论文原文 + 逐行代码注解」组合. 第 15 篇讲架构是什么, 这一篇把架构落成可运行的 PyTorch: 400 行库代码, 4 张 GPU 上跑到 27000 tokens/s.

全文只有两条数学公式, 其余全是代码. 符号表放在最前面, 两条公式的完整展开 (逐块拆解和数值实例) 在第 15 篇 extended.md, 本文不重复, 只在公式旁边重申读法.

**全文符号表**

| 符号 | 含义 |
|------|------|
| $Q, K, V$ | 注意力的三个输入矩阵: query (我在找什么), key (我是什么), value (我携带的内容), 每行一个位置 |
| $q, k$ | 单个位置的 query 和 key 向量, 矩阵 $Q, K$ 的一行 |
| $d_k$ | 每个注意力头内部 query/key 的维度, 代码里等于 64 |
| $X^T$ | 矩阵转置: 行列互换, $QK^T$ 的第 $(i, j)$ 个元素就是 $q_i \cdot k_j$. **本文上标 $T$ 只有转置这一个含义** |
| $\sqrt{d_k}$ | 缩放因子, 把点积的方差从 $d_k$ 压回 1 |
| $\text{softmax}$ | 按行归一化: 每行取 exp 再除以该行总和, 变成加起来等于 1 的注意力权重 |
| mask | 布尔矩阵, True 表示「允许看见」, False (代码里 mask==0) 的位置在 softmax 前被填成 -1e9 |
| $\text{lrate}$ | 学习率, 每步更新参数用的步长 |
| $d_{model}$ | 模型主维度, 全文 512, 所有子层输入输出统一成这个维度, 残差才能直接相加 |
| $step$ | 训练步数, 从 1 开始数 |
| $warmup$ | 预热步数, 全文 4000 (复制任务的玩具模型用 400) |
| $\min(a, b)$ | 取两者中较小的那个, 学习率公式靠它在升温段和降温段之间自动切换 |
| $\varepsilon$ | label smoothing 的平滑系数, 全文 0.1, 正确标签的概率质量分 10% 给其余词表 |

**读公式的方法**: 两条公式都是第 15 篇的原式, 读法也一样. §5 注意力公式按三步读: $QK^T$ 打分, 除 $\sqrt{d_k}$ 再过 softmax 归一化成权重, 乘 $V$ 做加权求和. 本文的重点不在公式本身, 在公式没写的地方: mask 填什么值, dropout 乘在谁身上, 返回几个值. §9 学习率公式读「两条曲线取更小那条」, 升温支和降温支的交点恰好在 warmup.

## 1. 2018 年 4 月: 一篇「难以正确实现」的论文

Attention Is All You Need 2017 年 6 月挂出, 到 2018 年初已经在 NLP 圈掀起巨浪. 翻译质量刷榜只是一面, 更关键的是它给出了一种完全不依赖 RNN 和卷积的序列转导架构, 训练可以彻底并行.

但论文写清楚不等于能复现. Rush 在博客开头直接引用了当时的 conventional wisdom: 论文本身写得非常清晰, 但业界普遍认为它很难正确实现 (quite difficult to implement correctly). 这不是客气话. 2017 年还没有 Hugging Face, 没有现成的 Transformer 库, 想复现的人只能对着论文 8 页正文自己写 PyTorch. 论文公式里一个 softmax(QK^T/√d_k)V 看起来人畜无害, 真写起来全是坑: mask 加在哪, 维度怎么变换, 残差里 dropout 放在什么位置, embedding 为什么要乘根号 d_model. 这些细节论文要么没写, 要么一句话带过.

Rush 的回应是一篇博客, 但形式前所未有: 左边是论文原文段落, 右边是这段文字对应的可运行 PyTorch 代码, 全文本身是一个 Jupyter notebook, 可以直接执行. 作者阵容也值得注意. Alexander Rush 是 Harvard NLP 的负责人, Vincent Nguyen 和 Guillaume Klein 是 OpenNMT 的核心开发者. OpenNMT 是 2017 年 ACL 上发表的开源神经机器翻译工具包, 当时工业界做翻译系统的事实标准之一. 也就是说, 这份注解不是学生作业, 是一群靠 NMT 吃饭的人把自己的生产实现公开出来.

Rush 在文末写得很明白: 代码重度基于 OpenNMT 包, 需要完整实现的可以看 Tensor2Tensor (TensorFlow) 和 Sockeye (MXNet). 三个框架三家官方实现, 但只有这份注解把「论文的每个段落」和「实现的每一行」一一对应起来. 这就是它成为入口的原因.

## 2. 注解体: 一种被低估的体裁

先谈体裁本身, 这是这篇博客最容易被忽视的价值.

论文写作有严格的篇幅和抽象层级约束. 作者要写的是「模型是什么」, 不是「代码怎么写」. 于是论文第 3.2.2 节用一段话讲完多头注意力, 给出投影矩阵的维度, 收工. 但实现者面对的问题完全不同: mask 的形状是 (batch, 1, seq) 还是 (batch, seq, seq), softmax 之前 mask 怎么处理, 八个头的 reshape 在哪个轴上做, 这些在论文里一个都没有.

注解体把两个层级焊在了一起. 论文段落提供「为什么这样做」的论证, 紧挨着的代码提供「到底怎么做」的答案. 读论文时你觉得懂了, 读代码时你确认自己懂没懂. 两种理解之间的缝隙, 恰恰是复现失败的所有来源.

这种体裁后来影响深远. 2018 年之后, 无数后来者是顺着这份 notebook 学会 Transformer 的, 包括很多今天的主流实现. 它的代码结构 (make_model 组装函数, EncoderDecoder 基类, SublayerConnection 包装) 被各种教程和课程原样继承. 说一句不夸张的话: 在 Hugging Face 出现之前, 这份博客就是 PyTorch 世界复现 Transformer 的事实标准入口.

## 3. 400 行代码的骨架: EncoderDecoder

整个模型的入口是一个不到 20 行的类:

```python
class EncoderDecoder(nn.Module):
    def __init__(self, encoder, decoder, src_embed, tgt_embed, generator):
        super(EncoderDecoder, self).__init__()
        self.encoder = encoder
        self.decoder = decoder
        self.src_embed = src_embed
        self.tgt_embed = tgt_embed
        self.generator = generator

    def forward(self, src, tgt, src_mask, tgt_mask):
        return self.decode(self.encode(src, src_mask), src_mask, tgt, tgt_mask)
```

这个类的设计哲学是一切皆组件. 它不假设 encoder 是什么, decoder 是什么, 只规定五个插槽和它们之间的数据流. encode 把 src 变成 memory, decode 消费 memory 和已生成的 tgt. forward 只是把两者串起来, 但拆成两步意味着推理时可以只 encode 一次, 然后反复 decode. 这个接口划分直接决定了后面 greedy_decode 的写法.

Generator 更简, 一个 linear 加 log_softmax. 注意是 log_softmax 不是 softmax, 因为后面的 label smoothing 要用 KLDivLoss, 它直接吃 log 概率.

Encoder 和 Decoder 各自是 N=6 层的堆叠, 用同一个 clones 函数 deepcopy 出 6 份. 每层 EncoderLayer 包含两个子层 (自注意力 + 前馈), DecoderLayer 包含三个 (自注意力 + 编码器-解码器注意力 + 前馈). 三种注意力复用同一个 MultiHeadedAttention 类, 区别只在 query, key, value 从哪来: 自注意力三者同源, 交叉注意力 query 来自 decoder, key 和 value 来自 encoder 的输出 memory. 论文里三种应用写在 3.2.3 节, 代码里就是构造 DecoderLayer 时传两次 c(attn).

## 4. SublayerConnection: 论文写 post-norm, 代码换成了 pre-norm

残差加 LayerNorm 是 Transformer 的黏合剂, 论文公式是 LayerNorm(x + Sublayer(x)). 代码长这样:

```python
class SublayerConnection(nn.Module):
    "A residual connection followed by a layer norm.
     Note for code simplicity the norm is first as opposed to last."
    def forward(self, x, sublayer):
        return x + self.dropout(sublayer(self.norm(x)))
```

那行注释是全文最有信息量的注释之一: 为了代码简洁, norm 放在前面而不是后面. 也就是说, 论文写的是 post-norm, 这份实现实际跑的是 pre-norm. 2018 年这看起来只是个代码风格问题, 后来 pre-norm 被证明在深层模型里训练更稳定, GPT 系列全面采用 pre-norm. Rush 一行注释提前踩到了后来的主流路线, 虽然他当时只是为了少写几行.

细节还有两处. 第一, dropout 加在子层输出上, 在残差相加之前, 论文的表述是 "we apply dropout to the output of each sub-layer, before it is added to the sub-layer input". 顺序错了训练就不对. 第二, LayerNorm 是自己实现的, 没有用 PyTorch 内置: mean 和 std 沿最后一维计算, 可学习参数 a_2 和 b_2 初始化为全 1 和全 0, eps=1e-6. 手写是为了让公式和代码一一对应, 教学意图明显.

d_model=512 在这一节也有交代: 为了让残差连接能直接相加, 所有子层和 embedding 的输出维度必须统一. 这个约束在代码里体现为所有 nn.Linear 都是 d_model 进 d_model 出, 除了 FFN 中间膨胀到 2048.

## 5. attention 函数: -1e9 与两个返回值

缩放点积注意力的论文公式一行:

$$
\mathrm{Attention}(Q, K, V) = \mathrm{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
$$

公式本身的逐块拆解在第 15 篇, 这里只重申读法. $QK^T$ 是打分: 上标 $T$ 是转置 (行列互换, 本文上标 $T$ 只有这一个含义), 乘出来的矩阵第 $(i, j)$ 个元素是 $q_i \cdot k_j$, 即「位置 $i$ 找位置 $j$」的匹配分. 除以 $\sqrt{d_k}$ 把方差压回 1, 再过 softmax 按行归一化成权重. 最后乘 $V$, 每一行输出是所有位置 value 的加权和. 三步全是矩阵乘, 零循环.

代码六行, 信息量全在公式没写的地方:

```python
def attention(query, key, value, mask=None, dropout=None):
    d_k = query.size(-1)
    scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
    p_attn = F.softmax(scores, dim=-1)
    if dropout is not None:
        p_attn = dropout(p_attn)
    return torch.matmul(p_attn, value), p_attn
```

mask 的处理是全篇最容易写错的地方. 论文说 "masking out (setting to -inf)", 代码用 -1e9 代替负无穷. 原因很实际: 真负无穷进 softmax 可能产出 NaN, -1e9 在 softmax 后精确等于 0, 数值上干净. 另外约定是 mask==0 的位置填 -1e9, 也就是说 mask 里 True 表示「允许看见」, 这个布尔方向写反了整个模型就废了.

除以 √d_k 的理由论文给了推导: 假设 q 和 k 的分量是均值 0 方差 1 的独立随机变量, 点积的方差是 d_k. d_k=64 时点积的标准差是 8, softmax 被推到梯度极小的饱和区, 除以 8 把分布拉回中心. 这是 additive attention 在大 d_k 下反超 dot-product 的原因, 缩放把这个问题消掉了.

两个细节. 第一, dropout 作用在注意力权重 p_attn 上, 不是作用在 value 上, 训练时随机丢弃一部分注意力连接. 第二, 函数返回两个值: 加权和的输出, 以及注意力矩阵本身. self.attn 被存下来, 只为了文末的可视化. 教学代码才会这么写, 生产代码不会为可视化留接口.

## 6. MultiHeadedAttention: 四个 linear 与一场维度芭蕾

多头注意力是全文维度变换最密集的一段:

```python
self.linears = clones(nn.Linear(d_model, d_model), 4)
...
query, key, value = \
    [l(x).view(nbatches, -1, self.h, self.d_k).transpose(1, 2)
     for l, x in zip(self.linears, (query, key, value))]
x, self.attn = attention(query, key, value, mask=mask, dropout=self.dropout)
x = x.transpose(1, 2).contiguous().view(nbatches, -1, self.h * self.d_k)
return self.linears[-1](x)
```

论文画了 8 个头, 每个头有自己的 W^Q, W^K, W^V. 代码里并没有 24 个矩阵, 只有 4 个 d_model×d_model 的 linear. 前三个一次性算完 Q, K, V 的全部投影, 然后 view(nbatches, -1, h, d_k) 把 512 维切开成 8 个 64 维, transpose(1, 2) 把头维提到前面, 得到 (batch, 8, seq, 64). 一次矩阵乘等价于 8 次小矩阵乘, 这就是「总计算量与单头全维度相当」的代码层证明.

mask 在这里要做一次广播: mask.unsqueeze(1) 把 (batch, 1, seq) 或 (batch, seq, seq) 扩成 (batch, 1, 1, seq) 或 (batch, 1, seq, seq), 同一个 mask 被 8 个头共享. 注释里写得很清楚: "Same mask applied to all h heads."

attention 算完后再 transpose 回来, .contiguous() 不能省, 因为 transpose 后的张量内存不连续, view 会直接报错. 这是 PyTorch 新手最常撞的墙之一. 最后一个 linear 把拼回去的 512 维再做一次输出投影 W^O. h=8, d_k=d_v=64, 全部对上论文 Table 1 的超参.

## 7. 三个论文轻描淡写、代码给出答案的细节

FFN 最简单: 512 → 2048 → 512, 中间 ReLU, 两个 linear 加 dropout. 论文补了一句等价描述: 这是两个 kernel size 为 1 的卷积, 逐位置独立作用. 这个视角在后来的 MoE 讨论里很重要, FFN 才是 Transformer 里存知识的地方, 注意力只负责搬运.

Embeddings 藏着第一个隐藏缩放:

```python
def forward(self, x):
    return self.lut(x) * math.sqrt(self.d_model)
```

查表之后乘 √512 ≈ 22.6. 论文 3.4 节一句话带过, 不说为什么. 原因和位置编码有关: 位置编码是幅度为 1 的正弦, embedding 不放大就会被正弦盖过, 放大 22.6 倍后两者量级匹配, token 语义仍是主导. 这个细节漏掉, 模型照样能跑, 只是学得慢.

第二个细节在 PositionalEncoding. div_term 在对数空间算: exp(arange(0, d_model, 2) * -(log(10000)/d_model)), 等价于 10000^{-2i/d_model}, 但数值上更稳. 位置编码提前算好 max_len=5000 个位置, 用 register_buffer 注册而不是 nn.Parameter. buffer 不接收梯度, 不参与优化, 但会跟着模型一起存进 checkpoint. 这个 API 选择精确表达了「固定正弦, 不学习」的设计意图. 论文还交代了一个对照实验: 换成可学习的位置 embedding, 结果几乎相同, 选正弦是因为它理论上可以外推到训练时没见过的序列长度.

第三个细节是权重共享. 源语言 embedding, 目标语言 embedding, 和 softmax 前的输出投影共享同一个权重矩阵. 论文一句 "similar to (cite)", 代码在 Additional Components 里给了两行: 直接把 generator 的 weight 指到 tgt_embed 的 weight. 共享能减少参数量, 还因为 BPE 共享词表 (WMT 英德 37000 token), 输入输出在同一语义空间.

## 8. Batch: 右移一位与三角矩阵

训练数据进入模型前的最后一步是 Batch 类, 它同时构造两种 mask:

```python
self.src_mask = (src != pad).unsqueeze(-2)
self.trg = trg[:, :-1]
self.trg_y = trg[:, 1:]
```

src_mask 把 padding 位置标成 False, unsqueeze(-2) 扩出一维, 为了后面广播到注意力矩阵. 目标序列的右移是 teacher forcing 的代码形态: 输入是 trg 去掉最后一个 token, 标签是 trg 去掉第一个 token, 模型在第 i 个位置预测第 i+1 个 token. 论文里 "the output embeddings are offset by one position" 一句话, 代码里是两行切片.

subsequent_mask 是 decoder 自回归的保障:

```python
def subsequent_mask(size):
    attn_shape = (1, size, size)
    subsequent_mask = np.triu(np.ones(attn_shape), k=1).astype('uint8')
    return torch.from_numpy(subsequent_mask) == 0
```

np.triu(k=1) 造一个上三角为 1 的矩阵, 对角线上方全是 1. 然后 == 0 取反: 下三角 (含对角线) 变成 True, 上三角变成 False. 配合 attention 里 mask==0 填 -1e9, 位置 i 只能看见 0 到 i, 未来位置全部封杀. make_std_mask 把这个因果 mask 和 padding mask 做按位与, 两种不可见一次处理完.

这段还有一张配图, imshow(subsequent_mask(20)) 画出一个 20×20 的下三角. 行是目标词, 列是它被允许看的位置. 训练时整句并行喂进去, 靠这个三角矩阵模拟逐个生成. 这就是 Transformer 训练能并行的全部秘密: 不是真的逐个词生成, 而是用 mask 假装在逐个生成.

## 9. 训练循环, NoamOpt 与 LabelSmoothing 的 KL 形式

run_epoch 是一个标准的训练循环, 每 50 步打印一次 loss 和 tokens/s, 没有花活. 有意思的在优化器. 论文的学习率公式:

$$
lrate = d_{\text{model}}^{-0.5} \cdot \min(step^{-0.5},\ step \cdot warmup^{-1.5})
$$

读法和第 15 篇相同: 前面 $d_{\text{model}}^{-0.5}$ 是基准步长 (512 维时约 0.0442), min 里第二条 $step \cdot warmup^{-1.5}$ 是与步数成正比的升温支, 第一条 $step^{-0.5}$ 是与步数平方根成反比的降温支, min 取更小者, 前期走升温线, 后期走降温线, 交点恰好在 $step = warmup$. 代入三个点的数值曲线 (第 2000 步约 $3.5 \times 10^{-4}$, 第 4000 步峰值约 $7.0 \times 10^{-4}$, 第 100000 步回落到约 $1.4 \times 10^{-4}$) 见第 15 篇 §7.

前 warmup_steps=4000 步线性升温, 之后按步数的负二分之一次方衰减. NoamOpt 把这个公式包成一个 optimizer wrapper, step() 里先算 rate, 写进 param_groups, 再调真正的 Adam. Adam 的超参是 β1=0.9, β2=0.98, eps=1e-9. 注意 β2=0.98 不是常见的 0.999, 二阶矩估计的窗口更短, 对非平稳的梯度适应更快. get_std_opt 里 factor 取 2, 还给了一段绘图代码对比 (512, 4000), (512, 8000), (256, 4000) 三条学习率曲线. Rush 在代码前特意加了一行 blockquote: "This part is very important. Need to train with this setup." 复现过 Transformer 的人都知道这句话的分量, warmup 不到位, 前几步就能发散.

LabelSmoothing 是正则化的主角, ε=0.1. 论文坦白说它会伤害困惑度, 因为模型变得更不确定, 但提升准确率和 BLEU. 实现用的是 KLDivLoss, 不是交叉熵:

```python
true_dist = x.data.clone()
true_dist.fill_(self.smoothing / (self.size - 2))
true_dist.scatter_(1, target.data.unsqueeze(1), self.confidence)
true_dist[:, self.padding_idx] = 0
```

先克隆预测的张量 (只是借个形状), 全部填上 0.1/(V-2), 再把正确词位置改成 0.9, padding 位置清零. 分母 V-2 而不是 V-1, 因为正确词和 padding 都不参与平滑质量的分配. 最后 index_fill_ 把 padding 位置对应的整行清零, 这些位置不产生损失. 博客附了两张可视化: 一张是 5 词词表、smoothing=0.4 的目标分布热力图, 另一张是 loss 随模型自信度上升的曲线, 模型越自信惩罚越大. label smoothing 的本质被一句话点破: "starts to penalize the model if it gets very confident".

## 10. 复制任务与贪婪解码

全部组件就位后, 博客先跑了一个合成任务: 复制. 词表 V=11, 随机生成长度 10 的序列, 首位置固定为 1 (起始符), 目标是原样输出. 模型只用 N=2 层, warmup 400 步, batch 30, 每个 epoch 20 个 batch.

10 个 epoch 的日志完整印在博客里: 训练 loss 从 3.02 一路降到 0.26 附近, 验证 loss 从 1.93 降到 0.27. 一个只有两层的玩具 Transformer 在几分钟内学会完美复制. 这个例子的教学价值在于闭环: 它证明前面 400 行代码没有一处写错, 整个系统端到端可训练.

贪婪解码的代码同样值得读:

```python
def greedy_decode(model, src, src_mask, max_len, start_symbol):
    memory = model.encode(src, src_mask)
    ys = torch.ones(1, 1).fill_(start_symbol).type_as(src.data)
    for i in range(max_len-1):
        out = model.decode(memory, src_mask, Variable(ys),
                           Variable(subsequent_mask(ys.size(1)).type_as(src.data)))
        prob = model.generator(out[:, -1])
        _, next_word = torch.max(prob, dim=1)
        ys = torch.cat([ys, ...], dim=1)
    return ys
```

每生成一个 token, 整个 decoder 对当前完整序列重跑一遍, 只取最后一个位置的输出. 这是 2018 年的写法, 没有 KV cache, 生成长度 n 的序列要做 n 次完整的前向. 今天的推理优化 (KV cache, 增量解码) 解决的正是这段代码里的浪费. encode 只调用一次, memory 复用, 这正是 EncoderDecoder 类把 encode 和 decode 拆开的原因. 输入 [1..10], 输出 [1..10], 复制成功.

## 11. 真实数据与多 GPU: 工程部分

合成任务之后是 IWSLT 德英翻译, 一个比 WMT 小得多的数据集, 但走完整个系统. 数据用 torchtext 加 spacy 分词, BOS/EOS/blank 三种特殊 token, 最大长度 100, 词表最小频率 2.

工程上最讲究的是 batching. 博客原话: "Batching matters a ton for speed." MyIterator 重写了 torchtext 的默认分批: 先取 batch_size×100 的大池子, 按长度排序, 再切成紧凑的 batch, 最后打乱 batch 顺序. 排序让同一个 batch 内句子长度接近, padding 浪费最小. batch_size_fn 统计的是 token 数加 padding 后的总元素数, 限制在 12000, 保证显存可控. 这和论文的 batching 策略一致: 按近似长度分组, 每个 batch 约 25000 源 token 加 25000 目标 token.

多 GPU 部分用了 PyTorch 的四个并行原语: replicate 把模块拷到各卡, scatter 切 batch, parallel_apply 并行算, gather 收回. MultiGPULossCompute 还把词级别的生成切成 chunk_size=5 的块分发, 输出投影是显存大头, 分块算避免单卡 OOM. Rush 诚实标注这段和 Transformer 本身无关, 不感兴趣的可以跳过. 在 AWS p3.8xlarge 的 4 张 V100 上, 这套代码跑到约 27000 tokens/s, batch 12000.

训练完翻译验证集第一句, 输出和 gold 只差语序: "In my language, that means, thank you very much." 对 "It means in my language, thank you very much." 小数据集加贪婪解码, 这个质量已经足够展示系统正确.

## 12. 没讲的四件事, 结果, 与遗产

博客最后列出四个没展开的部分, 全部指向 OpenNMT-py: BPE 子词切分 (Rico Sennrich 的 subword-nmt), 共享 embedding 的两行代码, beam search ("a bit too complicated to cover here"), 以及 checkpoint averaging, 把最后 k 个 checkpoint 的权重平均, 获得近似 ensemble 的效果. 这四项加上之后, OpenNMT-py 的复现达到 WMT 英德 26.9 BLEU. 论文 big 模型是 28.4, 差距来自模型尺寸 (base vs big) 和训练规模.

论文的成绩单回顾一下: WMT14 英德 4.5M 句对, BPE 共享词表 37000; 英法 36M 句对, 32000 word-piece. base 模型 8 张 P100, 每步 0.4 秒, 10 万步共 12 小时; big 模型每步 1.0 秒, 30 万步共 3.5 天. big 模型英德 28.4 BLEU, 超此前所有模型和 ensemble 2.0 以上; 英法 41.0 BLEU, 训练成本不到此前 SOTA 的四分之一. 英法用 dropout 0.1 而不是 0.3.

这份注解的遗产分三层. 第一层是直接用户: 2018 到 2020 年间, 无数研究者靠这份 notebook 完成了自己的第一个 Transformer 实现. 第二层是结构遗产: EncoderDecoder 基类, make_model 组装, SublayerConnection 包装, 这套组织方式渗进了后来的教程, 课程和库. 第三层是体裁遗产: 它证明了「论文段落 + 可运行代码」这种形式的教学效率. 后来的 llm.c, nanoGPT, 各种 from-scratch 系列, 精神上都是这份博客的后代. Rush 自己的组后来还出了现代化版本, 适配新版 PyTorch, 这份文档被维护至今.

局限也要说清楚. 这份代码是教学版, 不是生产版: 没有 KV cache, 没有 beam search 实现, 多 GPU 方案基于旧的 DataParallel, 学习率调度器要自己包. 2026 年今天, 任何人想上手 Transformer 都应该从 Hugging Face 或官方实现开始. 但想理解 mask 为什么填 -1e9, embedding 为什么乘 √d_model, norm 为什么可以放前面, 这份 400 行的注解仍然是最好的答案.

放回 Ilya 的清单, 第 15 篇和第 16 篇是唯一的「原文 + 注解」配对. 这个配对本身传递了一个信号: 理解一个架构, 读论文和读代码是两件不同的事, 都值得做. 论文给你公式和动机, 代码给你维度和数值. 两者之间的缝隙里, 住着复现失败的全部原因.

## 13. 扩展阅读

- Vaswani et al., "Attention Is All You Need", NeurIPS 2017. https://arxiv.org/abs/1706.03762 (本系列第 15 篇)
- The Annotated Transformer 现代化版本 (适配新版 PyTorch): http://nlp.seas.harvard.edu/annotated-transformer/
- Klein et al., "OpenNMT: Open-Source Toolkit for Neural Machine Translation", ACL 2017. https://doi.org/10.18653/v1/P17-4012
- Tensor2Tensor (Google, TensorFlow 官方实现): https://github.com/tensorflow/tensor2tensor
- Sockeye (AWS, MXNet 实现): https://github.com/awslabs/sockeye
- Jay Alammar, "The Illustrated Transformer" (可视化向的另一条注解路线): https://jalammar.github.io/illustrated-transformer/
- Karpathy, nanoGPT (from-scratch 体裁的当代代表): https://github.com/karpathy/nanoGPT
