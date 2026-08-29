---
title: "Neural Machine Translation by Jointly Learning to Align and Translate"
category: Attention与Transformer
published: true
excerpt: >-
  2014 年, 神经机器翻译刚诞生, encoder-decoder 把整句压进一个定长向量, 长句翻译直接崩. Bahdanau, Cho,
  Bengio 三人用一个单层 MLP 打分加 softmax 加权的小机制捅破了这层天花板: decoder 每生成一个词,
  自己回源句子里软搜索最相关的位置. WMT14 英译法上, 纯神经单模型第一次追平成熟短语系统 Moses, 长句曲线不再下滑,
  对齐热力图里法语颠倒的语序被模型自动学对. 这个机制叫 attention. 两年后 Transformer 扔掉 RNN 只留它, 清单第 15
  篇就是它的整
tags:
  - Ilya
  - Attention
  - Seq2Seq
  - 机器翻译
  - Bahdanau
  - Cho
  - Bengio
  - Ilya推荐30篇
  - 经典论文
---
# Neural Machine Translation by Jointly Learning to Align and Translate: 注意力不是 Transformer 发明的

> 原始论文: Dzmitry Bahdanau, KyungHyun Cho, Yoshua Bengio, "Neural Machine Translation by Jointly Learning to Align and Translate", arXiv:1409.0473, ICLR 2015.
> https://arxiv.org/abs/1409.0473
> Ilya Sutskever 阅读清单第 14 篇, 紧接 RNN 三部曲 (清单 11-13) 之后, 紧接着就是清单第 15 篇 Attention Is All You Need. 这个排序本身就是对历史的准确复述: 注意力机制在这篇论文里为翻译长句而生, 两年后被 Transformer 提纯为唯一的骨架.

**全文符号表**

本文是注意力机制的原始论文, 公式集中在 §2 和 §3, 共七条. 记号沿用原论文, 先一次性登记.

| 符号 | 含义 |
|------|------|
| $x$ | 源句子 (英语), $x = (x_1, \dots, x_{T_x})$, 共 $T_x$ 个词 |
| $y$ | 目标句子 (法语), $y = (y_1, \dots, y_T)$, 共 $T$ 个词. $\hat{y}$ 是模型最终选出的译文 |
| $t, j$ | 位置下标: $t$ 泛指序列位置, $j$ 专指源句子的位置 |
| $i$ | 目标句子的位置下标 (decoder 生成到第几个词) |
| $p(y \mid x)$ | 条件概率: 给定源句子 $x$, 译文是 $y$ 的概率. 竖线 $\mid$ 读作「在...的条件下」 |
| $\arg\max_y$ | 在所有候选译文里, 让后面表达式最大的那个 $y$, 返回的是句子不是概率值 |
| $h_j$ | 源句子第 $j$ 个位置的「注解」(annotation), 双向 RNN 两个方向隐藏状态的拼接, 是这个位置及其上下文的摘要 |
| $\overrightarrow{h}_j, \overleftarrow{h}_j$ | 前向/后向 RNN 在位置 $j$ 的隐藏状态, 箭头标记阅读方向 |
| $[a; b]$ | 拼接: 两个向量首尾相接成一个更长的向量, 分号是论文的拼接记号 |
| $c$ | 定长上下文向量, 基础 encoder-decoder 里整句信息的唯一容器 |
| $c_i$ | 第 $i$ 步 decoder 专属的上下文向量, 每个目标词一个, 本文的核心发明 |
| $s_i$ | decoder 第 $i$ 步的隐藏状态, $\tilde{s}_i$ 是候选状态 |
| $g(\cdot)$ | decoder 的输出函数, 由上一词, 当前状态和上下文向量算出下一个词的概率分布 |
| $f(\cdot)$ | RNN 的循环激活函数, 本文用 GRU |
| $\alpha_{ij}$ | 注意力权重: 生成第 $i$ 个目标词时, 源句子第 $j$ 个位置分到多大比例的关注, 全部 $j$ 加起来等于 1 |
| $e_{ij}$ | 能量项 (alignment score): softmax 之前的原始匹配分, 可正可负 |
| $a(\cdot)$ | 对齐模型, 一个单层前馈网络, 输入 decoder 状态和注解, 输出匹配分 |
| $v_a, W_a, U_a$ | 对齐模型的三组可学习参数 |
| $z_i, r_i$ | GRU 的更新门和重置门, 分量在 $(0,1)$ |
| $\odot$ | 逐元素乘法: 两个等长向量对应分量相乘 |
| $\prod_{t=1}^{T}$ | 连乘: 把 $t$ 从 1 到 $T$ 的每一项乘起来, 概率的链式法则就是连乘 |

**读公式的方法**: 七条公式讲一个故事, 按三幕读. 第一幕 (§2): 翻译被写成「找概率最大的句子」, 而基础架构把所有概率都拴在一个定长向量 $c$ 上, 这是瓶颈的数学形态. 第二幕 (§3.1-3.2): 把 $c$ 换成每步一个的 $c_i$, 而 $c_i$ 只是「所有注解的加权求和」, 权重由 softmax 归一化的匹配分给出, 全部公式都在回答「权重怎么算, 加权和怎么加」. 第三幕 (§3.3): decoder 状态更新, 读「旧状态保留多少, 候选状态写入多少」, 和第 12 篇 LSTM 的门控是同一套语法.

## 1. 背景: 2014 年的机器翻译是什么格局

2014 年的机器翻译领域, 主流是统计机器翻译 (SMT). 以 Moses 为代表的开源系统采用基于短语的翻译 (phrase-based translation), 整个系统由短语表, 语言模型, 重排序模型, 解码器等一堆小组件拼装而成, 每个组件单独训练, 单独调参, 最后靠特征工程把分数缝在一起. 这套流水线已经迭代了十几年, 工程成熟度很高, 但天花板清晰可见: 组件之间的误差逐级传递, 语言学先验大量依赖人工.

神经网络当时已经在翻译里出现, 但地位是配角. Schwenk (2012) 用前馈网络给短语对打分, 作为一个附加特征塞进 SMT 系统; Devlin 等人 (2014) 类似. 神经网络的价值被限定在「给现有系统多提供一个特征」或者「给候选翻译重排序」. 论文里点名说, 他们感兴趣的是更野心的目标: 造一个完全由神经网络构成的翻译系统, 端到端, 从源句子直接生成目标句子, 不依赖任何短语表和语言学规则.

神经网络和翻译的渊源其实更早. Bengio 等人 2003 年的神经概率语言模型, 第一次用神经网络建模「给定前几个词, 下一个词的条件概率」, 这套语言模型后来长期作为 SMT 的重排序工具. 再往前, Forcada 和 Ñeco 1997 年就提出过用递归网络做翻译的设想, 但当时的算力和数据都撑不起来. 2013-2014 年的变化是, GPU 训练和大规模平行语料同时成熟, 端到端翻译从设想变成了可验证的实验.

这个方向在 2013-2014 年刚有雏形. Kalchbrenner 和 Blunsom (2013), Cho 等人 (2014a) 的 RNNencdec, Sutskever 等人 (2014) 的 seq2seq, 三拨人几乎同时提出 encoder-decoder 框架: 一个 RNN 读入源句子, 压成一个向量, 另一个 RNN 从这个向量解码出目标句子. 整个系统联合训练, 直接最大化给定源句子时正确译文的概率. 这是神经机器翻译 (NMT) 的起点, 而这篇论文就是在 NMT 诞生当年, 给它捅破了第一层天花板.

## 2. 问题定义: 定长向量是一根硬瓶颈

先形式化翻译问题. 从概率角度看, 翻译就是找一个目标句子 $y$, 最大化条件概率 $p(y|x)$, 其中 $x$ 是源句子:

$$
\hat{y} = \arg\max_y p(y \mid x)
$$

逐块拆开. $p(y \mid x)$ 读作「在源句子 $x$ 的条件下, 译文是 $y$ 的概率」, 竖线右边是给定条件, 左边是评估对象. $\arg\max_y$ 遍历所有可能的译文, 返回让概率最大的那一个, 记作 $\hat{y}$. 注意它返回的是句子, 不是概率值. 这条公式把「翻译」从语言问题改写成了搜索问题: 谁的模型给正确译文的概率高, 谁就翻得好.

NMT 用一个参数化模型去拟合这个条件分布, 在平行语料上训练, 解码时搜索概率最大的句子. 标准的 encoder-decoder 把这个分布写成:

$$
p(y) = \prod_{t=1}^{T} p(y_t \mid \{y_1, \ldots, y_{t-1}\}, c), \qquad p(y_t \mid \cdot) = g(y_{t-1}, s_t, c)
$$

左式是概率的链式法则: 整句译文的概率, 拆成逐词条件概率的连乘, 第 $t$ 个词的概率以「前面已生成的 $t-1$ 个词」和「上下文向量 $c$」为条件, $t$ 从 1 乘到 $T$, 一个完整句子一个数. 右式说每个条件概率怎么算: decoder 的输出函数 $g$ 吃三个输入, 上一个词 $y_{t-1}$, decoder 当前状态 $s_t$, 和上下文向量 $c$. 关键在 $c$. encoder 读入整个输入序列 $x = (x_1, \ldots, x_{T_x})$, 用 RNN 计算隐藏状态 $h_t = f(x_t, h_{t-1})$, 最后把整串隐藏状态汇总成一个向量 $c = q(\{h_1, \ldots, h_{T_x}\})$. Cho 等人 (2014a) 和 Sutskever 等人 (2014) 都取 $c = h_{T_x}$, 即最后一个隐藏状态. 无论句子是 10 个词还是 100 个词, 所有信息必须装进同一个定长向量, decoder 每一步看到的都是这同一个 $c$.

论文的猜想 (conjecture) 直截了当: 定长向量是这套架构的性能瓶颈. 这不是空口猜测, Cho 等人 (2014b) 同年已经给出实验证据: 基础 encoder-decoder 的性能随输入句子变长快速下滑. 道理也好懂, 10 个词的信息量和 50 个词的信息量差 5 倍, 塞同一个尺寸的容器, 容器不漏才怪. 更糟的是训练语料里长句本就稀少, 模型对长句的泛化几乎为零.

从信息论角度看, 定长瓶颈是一个容量问题. 隐藏状态的维度固定, 它能携带的信息量有上界. 短句的信息量在上界之内, 压缩近乎无损; 句子变长, 必须丢信息, 而丢哪些信息由训练分布决定, 不由当前句子决定. 长句在训练语料里本就稀少, 模型学到的压缩策略是为中短句优化的, 遇到长句, 丢的恰恰是关键内容. 这就解释了 Cho 等人 (2014b) 观察到的现象: 不是长句稍微变差, 而是性能快速下滑, 尤其是句子长度超出训练分布之后.

一个更深的观察藏在脚注里: 大多数此前的工作把变长输入编码成定长向量, 但作者指出这并非必须, 变长的表示甚至更好. 这句话在当时只是脚注, 两年后成了 Transformer 的设计前提.

## 3. 核心方法: 让 decoder 自己回头找

解决方案一句话说完: 不要把整句压成一个向量, 保留每个位置的表示, decoder 每生成一个词时, 自己去源句子里「软搜索」最相关的部分. 模型因此得名 RNNsearch.

### 3.1 注解: 每个词一个上下文向量

encoder 换成双向 RNN (BiRNN, Schuster and Paliwal, 1997). 前向 RNN 从左到右读, 得到前向隐藏状态序列 $(\overrightarrow{h}_1, \ldots, \overrightarrow{h}_{T_x})$; 后向 RNN 从右到左读, 得到 $(\overleftarrow{h}_1, \ldots, \overleftarrow{h}_{T_x})$. 每个位置 $j$ 的注解 (annotation) 是两个方向的拼接:

$$
h_j = [\overrightarrow{h}_j ; \overleftarrow{h}_j]
$$

分号是拼接记号: 两个向量首尾相接, 各 1000 维, 拼成 2000 维的 $h_j$. 前向状态 $\overrightarrow{h}_j$ 从左往右读到 $x_j$, 携带位置 $j$ 左侧的全部历史; 后向状态 $\overleftarrow{h}_j$ 从右往左读到 $x_j$, 携带右侧的全部历史. 拼接之后, $h_j$ 同时概括了 $x_j$ 前面的词和后面的词. 又因为 RNN 天生更擅长记住最近的输入, $h_j$ 会自然聚焦在 $x_j$ 周围的词上. 整句的信息不再被压扁, 而是摊开成 $T_x$ 个注解, 每个都带着对局部和全局的摘要. 论文用了一个很准的词: 信息 spread throughout the sequence of annotations, 供 decoder 按需取用.

为什么必须是双向? 单向 RNN 的 $h_j$ 只见过 $x_j$ 左边的词, 一个词的翻译常常取决于它右边的词. 英语形容词在名词前, 法语形容词在名词后, 只看左边, 翻到形容词时还不知道名词是什么, 对齐决策没有依据. 双向让每个注解同时携带左右两侧的上下文, 对齐模型打分时才拿得到完整证据. 这个设计在 1997 年就由 Schuster 和 Paliwal 提出, 2013 年 Graves 等人在语音识别里验证过效果, Bahdanau 把它移植到了翻译.

### 3.2 对齐模型: 注意力权重的公式

decoder 的条件概率定义改成:

$$
p(y_i \mid y_1, \ldots, y_{i-1}, x) = g(y_{i-1}, s_i, c_i)
$$

和 §2 基础架构的右式逐项对照, 唯一的改动在第三个输入: 定长的 $c$ 换成了每步一个的 $c_i$, 每个目标词 $y_i$ 都有自己专属的 context vector. 它是所有注解的加权求和:

$$
c_i = \sum_{j=1}^{T_x} \alpha_{ij} h_j, \qquad \alpha_{ij} = \frac{\exp(e_{ij})}{\sum_{k=1}^{T_x} \exp(e_{ik})}
$$

两式合起来是一个完整的查表动作. 左式: $c_i$ 等于每个注解 $h_j$ 乘上权重 $\alpha_{ij}$ 再相加, 求和遍历源句子的全部 $T_x$ 个位置, 权重大的注解主导 $c_i$ 的内容. 右式是 softmax: 分子是位置 $j$ 的匹配分取 exp, 分母是所有位置匹配分取 exp 的总和, 一比得到权重, 保证全部权重加起来等于 1, 都在 0 到 1 之间.

代一组数看 softmax 怎么把分数变成权重. 设源句子只有 3 个位置, 某一步的匹配分是 $e_{i1} = 2, e_{i2} = 1, e_{i3} = 0$. exp 之后是 $7.39, 2.72, 1.00$, 总和 $11.11$, 权重就是 $0.665, 0.245, 0.090$. 于是 $c_i = 0.665 \, h_1 + 0.245 \, h_2 + 0.090 \, h_3$: decoder 这一步看到的上下文, 三分之二是第一个位置的注解, 四分之一是第二个, 第三个几乎被忽略. 匹配分每差 1, exp 之后差 $e \approx 2.72$ 倍, 高注解决定上下文, 这就是「软搜索」的全部机制.

权重 $\alpha_{ij}$ 是一个 softmax, 能量项 $e_{ij}$ 由对齐模型 (alignment model) 给出:

$$
e_{ij} = a(s_{i-1}, h_j) = v_a \cdot \tanh(W_a s_{i-1} + U_a h_j)
$$

从里往外读. $W_a s_{i-1}$ 把 decoder 上一步的状态映到一个公共打分空间, $U_a h_j$ 把源句子第 $j$ 个注解映到同一空间, 两者相加过 $\tanh$, 得到一个压缩过的匹配向量. 最外层 $v_a \cdot$ 是这个向量和可学习向量 $v_a$ 的点积 (对应分量相乘再求和, 原论文写作转置相乘 $v_a^{\top}$, 这里统一用点积记号), 把向量压成一个标量, 就是匹配分 $e_{ij}$. 这是一个单层前馈网络, 衡量「位置 $j$ 附近的输入」和「位置 $i$ 的输出」有多匹配. 打分依据两个东西: decoder 上一步的隐藏状态 $s_{i-1}$ (我刚生成到哪儿了), 和源句子第 $j$ 个注解 $h_j$ (这个位置存了什么). 工程上有个贴心的细节: $U_a h_j$ 不依赖 $i$, 可以预先算好, 省掉重复矩阵乘.

这里有两个关键点必须讲透.

第一, 对齐不是隐变量, 是软对齐. 传统 SMT 里词对齐是离散的隐变量, IBM 模型那套经典做法要用 EM 算法反复迭代, 先猜对齐再估参数, 两轮交替收敛. 这里 $\alpha_{ij}$ 是连续权重, 梯度可以一路反传, 对齐模型和翻译模型从头到尾联合训练, 目标函数只有一个: 正确译文的 log 概率. 没有任何语言学先验, 没有任何人工标注的对齐数据, 模型自己学会谁该看谁. 对齐从「翻译的前置工序」变成了「翻译的副产品」, 这个身份转换是整篇论文里最被低估的一步.

第二, 加权求和可以理解为期望. 把 $\alpha_{ij}$ 看成「目标词 $y_i$ 对齐到源词 $x_j$」的概率, 那 $c_i$ 就是所有注解在这个概率分布下的期望注解 (expected annotation). 用期望代替采样, 整个计算图保持可微, 这是软对齐能联合训练的数学原因. 一年后 Xu 等人的 Show, Attend and Tell 把这条线讲透了: 软注意力求期望, 可微但每步看全部位置; 硬注意力按概率采样一个位置, 不可微, 得用 REINFORCE 之类的方法训, 但计算省. 两条路线后来各有归宿, 软注意力赢了主流, 硬注意力的思想活在今天的稀疏注意力里. 论文随后写下了那句历史性的话: "Intuitively, this implements a mechanism of attention in the decoder. The decoder decides parts of the source sentence to pay attention to." 「注意力」这个词, 第一次以今天广为人知的含义出现在一篇机器学习论文的正文里.

### 3.3 门控单元与整体骨架

RNN 的激活函数 $f$ 用的是 Cho 等人 (2014a) 提出的门控隐藏单元, 也就是后来被称为 GRU 的东西, 和 LSTM 一样是缓解梯度消失的方案. decoder 的隐藏状态更新为:

$$
s_i = f(s_{i-1}, y_{i-1}, c_i) = (1 - z_i) \odot s_{i-1} + z_i \odot \tilde{s}_i
$$

逐项拆解. $z_i$ 是更新门, 取值在 0 到 1 之间, 由当前输入算出来; $1 - z_i$ 是它的补. $\odot$ 是逐元素乘法, 两个等长向量对应分量相乘, 用来和矩阵乘法区分开. 整个式子是一个凸组合: 向量的每个分量上, 新状态等于 $(1 - z_i)$ 份旧状态 $s_{i-1}$ 加 $z_i$ 份候选状态 $\tilde{s}_i$. 门开多大, $z_i$ 说了算. 代个数: 某个分量旧状态是 $0.5$, 候选状态是 $0.8$. $z_i = 0.9$ 时, 新分量是 $0.1 \times 0.5 + 0.9 \times 0.8 = 0.77$, 九成来自候选状态, 旧记忆只剩一成; $z_i = 0.1$ 时反过来, 新分量是 $0.9 \times 0.5 + 0.1 \times 0.8 = 0.53$, 旧状态几乎原封不动地传下去. 这就是 GRU 缓解梯度消失的机制: 门的取值让记忆有一条不必经过反复压缩的直通路.

候选状态 $\tilde{s}_i$ 里同时吃进了上一词 embedding, 上一状态 (经重置门 $r_i$ 调制, 决定旧状态里哪些信息对当前候选有用) 和 context vector $c_i$. 注意 $c_i$ 在 decoder 的每个环节 (门控, 候选状态, 输出概率) 都参与, 注意力不是外挂, 是血液. decoder 的初始状态由后向 RNN 的第一个状态经线性变换得到: $s_0 = \tanh(W_s \overleftarrow{h}_1)$.

还有一个漂亮的退化关系: 如果把所有 $c_i$ 固定为 $h_{T_x}$, RNNsearch 就退回成 RNNencdec. 新模型是旧模型的严格推广, 差别只在 decoder 能不能「回头找」.

### 3.4 计算代价: 注意力的原始账单

论文在 related work 里主动交代了代价. Graves (2013) 在手写体生成里用过类似的对齐思路, 用高斯混合核预测对齐位置, 但强制位置单调移动. 对手写体合理, 对翻译是硬伤: 英法, 英德之间大量存在长距离语序重排, 单调对齐翻不出来. Bahdanau 的方案放弃了单调约束, 代价是 decoder 每生成一个词, 都要对源句子每个位置算一次对齐权重, 即每对句子 $T_x \times T_y$ 次 alignment model 求值.

作者的判断很务实: 翻译句子的长度大多在 15 到 40 词, 这个代价不严重, 但可能限制该方案外推到其他任务. 这个「平方级扫描」的账单, 后来被 Transformer 继承并放大, 又在十年后催生了整个长上下文优化领域. 账单从 2014 年 9 月就开出来了.

## 4. 实验: WMT14 英译法, 与 Moses 正面对决

### 4.1 数据与训练配置

实验任务是 WMT '14 英语到法语. 平行语料五份: Europarl 6100 万词, news commentary 550 万词, UN 4.21 亿词, 加两份爬取语料 9000 万和 2.725 亿词, 合计 8.5 亿词. 用 Axelrod 等人 (2011) 的数据选择方法砍到 3.48 亿词. 验证集是 news-test-2012 加 2013, 测试集 news-test-2014 共 3003 句. 词表取每语种频率最高的 3 万个词, 其余映射为 [UNK], 不做小写化, 不做词干化, tokenization 直接用 Moses 的脚本.

对照组是 Cho 等人 (2014a) 的 RNNencdec, 同样的数据, 同样的训练流程. 四种模型: 两种架构各训两档, 一档用长度上限 30 词的句子训练 (RNNencdec-30, RNNsearch-30), 一档上限 50 词 (RNNencdec-50, RNNsearch-50). RNNencdec 的 encoder 和 decoder 各 1000 隐藏单元; RNNsearch 的前向, 后向 RNN 各 1000, decoder 1000. 词嵌入维度 620, 输出层带一个 500 维的 maxout 隐藏层, 对齐模型隐藏层 1000.

训练用 minibatch SGD 加 Adadelta, batch 80 句, 梯度范数裁剪到 1, 每个模型训约 5 天. 训练统计 (Table 2) 能看到当时的硬件和代价: RNNencdec-30 在 TITAN BLACK 上跑 109 小时, 8.46 万次更新, 6.4 个 epoch; RNNsearch-50 的长训版本在 Quadro K-6000 上跑了 252 小时, 6.67 万次更新, 5 个 epoch. 长训版就是 Table 1 里打星号的那个, 它多训了一倍多时间, 换来了 All 口径再涨 1.7 个 BLEU. 解码用 beam search, 和 Sutskever 等人 (2014) 的做法一致. 还有一个省算力的工程技巧: 每 20 次更新前, 先取 1600 个句对按长度排序再切成 20 个 batch, 让同一个 batch 里的句子长度接近, padding 浪费最小. 这个长度分桶的技巧, 今天 PyTorch 的 BucketIterator 还在用.

### 4.2 BLEU 数字: 追平短语系统

BLEU 结果 (Table 1) 分两套口径, All 是全测试集 (含 unknown 词), No UNK 是只算源句和参考译文里都没有 unknown 词的句子:

| 模型 | All | No UNK |
|------|-----|--------|
| RNNencdec-30 | 13.93 | 24.19 |
| RNNsearch-30 | 21.50 | 31.44 |
| RNNencdec-50 | 17.82 | 26.71 |
| RNNsearch-50 | 26.75 | 34.16 |
| RNNsearch-50 (长训) | 28.45 | 36.15 |
| Moses | 33.30 | 35.63 |

三个数字最值得看. 其一, RNNsearch-30 的 21.50 超过 RNNencdec-50 的 17.82: 用更短的训练句, 打赢了用更长训练句的旧架构, 注意力本身值的分超过了换长数据值的分. 其二, No UNK 口径下 RNNsearch-50 长训版拿到 36.15, 超过 Moses 的 35.63: 纯神经网络单模型, 第一次在这个任务上打平乃至超过了成熟短语系统. 其三, 这个对比其实对 NMT 不公平: Moses 额外用了 4.18 亿词的单语料训练语言模型, RNNsearch 只有平行语料. 用更少的数据打赢, 含金量在数据侧.

All 口径下 Moses 33.30 对 RNNsearch-50 的 28.45, 差距来自 unknown 词: 3 万词表之外的词 NMT 只能输出 [UNK], 一输出 BLEU 就崩. 论文在结论里诚实承认, 处理稀有词是留给未来的头号挑战. 这个问题后来由 BPE (Sennrich et al., 2016) 解决, 那是另一个故事.

### 4.3 长句曲线: 猜想被证实

全文最关键的一张图是 BLEU 随句长的变化 (Figure 2). 横轴句长从 0 到 60, 四条曲线. RNNencdec-30 和 RNNencdec-50 两条线随句长增加急剧下滑, 长句区几乎贴地. RNNsearch-30 明显抗跌, RNNsearch-50 在 50 词以上的句子上完全没有性能退化, 曲线接近水平.

这张图把第二节的猜想变成了事实: 定长瓶颈真实存在, 打破它的方法真实有效. RNNencdec 的失败模式在长句里暴露得最彻底: 它必须先无损记住整句, 才能开始翻译, 而它对长句的记忆是有损的. RNNsearch 不需要记住整句, 只需要准确编码每个词周围的部分, 需要的时候回头查. 记忆问题被转化成了查找问题, 难度降了一个量级.

论文给了两个长句译例, 非常有说服力. 第一句是关于医生准入特权 (admitting privilege) 的 30 多词长句. RNNencdec-50 译到 a medical center 还正确, 之后开始漂移, 把 based on his status as a health care worker at a hospital (基于他在医院的医护身份) 译成了 en fonction de son état de santé (基于他的健康状况), 医护身份变成了健康状况, 意思全歪. RNNsearch-50 的译文完整保真, 细节无一遗漏. 第二句迪士尼的句子, RNNencdec 生成约 30 词后开始崩, 连结尾引号都忘了闭合; RNNsearch-50 全文正确, 引号都在.

### 4.4 对齐可视化: 模型自己学会了语序

定性分析是全文的另一个高光. 把 $\alpha_{ij}$ 画成灰度热力图, 横轴源句 (英语), 纵轴译文 (法语), 每个像素是该位置的注意力权重. 论文选了四句, 一句任意句, 三句从测试集无 unknown 词, 长度 10-20 词的句子里随机抽取.

大部分权重沿对角线分布: 英法词序大体一致, 模型学到的对齐基本单调, 这和语言学直觉吻合. 非平凡的部分在对角线之外. 图 (a) 里 European Economic Area 被译成 zone économique européenne: 法语里形容词在名词后面, 语序整段颠倒. 模型的注意力先从 Area 跳到 zone, 越过 European 和 Economic 两个词, 然后一个一个词往回看, 完成 économique 和 européenne. 对角线在短语内部整齐地翻转了方向, 没有任何人教过它法语语序.

软对齐相对硬对齐的优势在图 (d) 里看得最清楚. 源短语 the man 译成 l' homme. 任何硬对齐都只能把 the 映射到 l', man 映射到 homme, 但英语定冠词该译 le, la, les 还是 l', 取决于后面那个词的性和首音, 硬对齐看不了那么远. 软对齐让模型同时看着 the 和 man, 自然地解决了冠词选择. 另一个附带好处: 软对齐天然处理源目标和目标短语长度不等的情况, 不需要传统 SMT 里那种把词对齐到 [NULL] 的别扭操作.

## 5. 局限与后续: 从 RNNsearch 到 Transformer

这篇论文留下的局限有三条, 每一条都长出了后续的研究线.

第一条是 unknown 词. 3 万词表加 [UNK] 的设计让 All 口径输给 Moses 近 5 个 BLEU. 解决路线是 subword 切分: Sennrich 等人 2016 年把 BPE 引入 NMT, 词表变成子词单元, OOV 问题基本消失. BPE 后来成了所有 LLM tokenizer 的祖宗.

第二条是 $T_x \times T_y$ 的对齐计算. 翻译句子短, 这个代价当时无所谓, 但作者自己预警了外推风险. 十年后, 长上下文场景下注意力的平方复杂度成了 LLM 推理成本和显存的第一大户, FlashAttention, MQA/GQA, 各种稀疏注意力都在还这笔账单.

第三条藏得更深: RNNsearch 依然被 RNN 串行计算锁死. decoder 每一步依赖上一步的隐藏状态, 无法并行, 训练慢, 252 小时训一个模型. 2017 年, Vaswani 等人问了一个激进的问题: 如果 attention 这么好用, 为什么还要 RNN? Attention Is All You Need 把 RNN 整个扔掉, 只保留注意力, 加上位置编码和自注意力, 训练并行度拉满. 清单第 15 篇就是这件事. 回头看, 清单 14 和 15 的关系是: 14 发明了零件, 15 用零件造了整机.

还有一条容易被忽略的支线. Bahdanau 的对齐叫加性注意力 (additive attention), 因为打分用 tanh 加和. 2015 年 Luong 等人提出乘性注意力 (multiplicative attention), 打分用点积, 计算更省. Transformer 用的 scaled dot-product attention 是乘性这一路的后代. 但概念层面的第一次, 归 Bahdanau: 软选择, 可微, 联合训练, 这三条性质定义了此后所有注意力变体.

工程落地也来得很快. 2016 年 Google 的 GNMT 把带注意力的 NMT 做成了生产系统, 翻译质量全面超过自家短语系统, 神经翻译从此取代统计翻译成为工业默认. 注意力热力图还意外成了第一个好用的神经网络可解释性工具: 打开权重矩阵, 就能看见模型每一步在「看」哪里, 错译常常能直接从对齐上定位原因. 这种「机制自带可视化」的性质, 在后来的深度学习里反而越来越稀缺.

## 6. 在清单中的位置: RNN 三部曲的破局点

清单 11-13 是 RNN 三部曲: Karpathy 展示 RNN 的表达能力, Olah 拆解 LSTM 的门控, Zaremba 解决 RNN 的正则化. 三篇都在回答「怎么把 RNN 用好」. 第 14 篇换了一个问题: RNN 的天花板在哪, 怎么捅破. 答案是定长瓶颈和软搜索. 第 15 篇再进一步: 既然瓶颈破了, RNN 本身也可以不要了. 11 到 15 是一个完整的叙事弧线, 注意力是弧线的顶点.

作者线也值得留意. 一作 Dzmitry Bahdanau 当时在 Jacobs University Bremen 读本科, 这篇是他在 Bengio 组实习期间的成果. 他后来回忆, 这个想法诞生于翻译任务里的直觉: 人翻译长句时会反复回看原文, 模型凭什么只能看一眼. 为了验证直觉, 他先在一个玩具任务上让模型学对齐, 确认机制能收敛, 才上 WMT 全量实验. 二作 KyungHyun Cho 是清单第 12 篇相关谱系里 GRU 的提出者, RNNencdec 的原作者, 这篇论文等于他亲手推翻了自己半年前的架构. 三作 Yoshua Bengio, 蒙特利尔大学教授, 后来的图灵奖得主, 2018 年和 Hinton, LeCun 同届. 一个本科生, 一个推翻自己的青年学者, 一个图灵奖导师, 这个组合解释了论文的气质: 直觉大胆, 验证扎实, 叙事克制.

这张清单的主题是如何度量, 训练, 扩展智能. 这篇论文的贡献属于「扩展」: 它第一次证明, 神经网络处理序列信息时, 不需要把所有历史压进一个状态, 可以把历史摊开, 按需检索. 这个思想的适用范围远超翻译. 检索增强生成 (RAG) 是它在知识层面的应用, 长上下文注意力是它在长度层面的应用, 甚至可以说, 今天 LLM 的每一次 token 生成, 都在重复 2014 年那个 decoder 的动作: 回看, 加权, 取用.

一个反常识的总结: attention 不是为 Transformer 发明的, 不是为 LLM 发明的, 它本来是为了让 2014 年的翻译模型能翻长句. 它在论文里甚至没有一个独立的小节, 只是 decoder 设计里顺手写下的三行公式. 最好的零件从来不预告自己的用途, 它先解决眼前的问题, 历史再决定它的位置.

## 参考与扩展阅读

- Bahdanau, Cho, Bengio, Neural Machine Translation by Jointly Learning to Align and Translate (2014/2015): https://arxiv.org/abs/1409.0473
- Cho et al., Learning Phrase Representations using RNN Encoder-Decoder for Statistical Machine Translation (2014a), RNNencdec 与 GRU 的原始论文: https://arxiv.org/abs/1406.1078
- Cho et al., On the Properties of Neural Machine Translation: Encoder-Decoder Approaches (2014b), 定长瓶颈的实验证据: https://arxiv.org/abs/1409.1259
- Sutskever, Vinyals, Le, Sequence to Sequence Learning with Neural Networks (2014), seq2seq: https://arxiv.org/abs/1409.3215
- Graves, Generating Sequences With Recurrent Neural Networks (2013), 手写体生成里的单调对齐: https://arxiv.org/abs/1308.0850
- Luong, Pham, Manning, Effective Approaches to Attention-based Neural Machine Translation (2015), 乘性注意力: https://arxiv.org/abs/1508.04025
- Sennrich, Haddow, Birch, Neural Machine Translation of Rare Words with Subword Units (2016), BPE 解决 OOV: https://arxiv.org/abs/1508.07909
- Vaswani et al., Attention Is All You Need (2017), 清单第 15 篇: https://arxiv.org/abs/1706.03762
- Schuster and Paliwal, Bidirectional Recurrent Neural Networks (1997), BiRNN 的出处
- Koehn, Statistical Machine Translation (2010), 传统 SMT 体系的标准教材
