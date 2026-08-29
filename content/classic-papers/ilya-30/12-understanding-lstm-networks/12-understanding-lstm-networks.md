---
title: "Understanding LSTM Networks"
category: RNN与序列
published: true
excerpt: >-
  Ilya 清单第 12 篇不是论文, 是 Christopher Olah 2015 年 8 月的一篇博客, 全世界被引用最多的 LSTM 教程.
  LSTM 原始论文 1997 年就发表了, 写得密集晦涩, 真正把 LSTM 教给全世界的是这篇博客: 用一套统一图例 (黄色方块是层,
  粉色圆圈是逐点运算, 线条是向量流), 把六个公式拆成十几张图逐步走完. 本帖按博客的顺序拆解: RNN 的环与展开, 长程依赖为什么学不会, cell
  state 传送带, 遗忘门输入门输出门, 变体巡礼到 GRU, 最后看 Olah 在 2015 年预告 attenti
tags:
  - Ilya
  - LSTM
  - RNN
  - 门控机制
  - GRU
  - ChristopherOlah
  - Ilya推荐30篇
  - 经典论文
---
# Understanding LSTM Networks: 全世界学会 LSTM, 靠的不是论文是博客

> 原始文本: Christopher Olah, "Understanding LSTM Networks", colah's blog, 2015-08-27.
> https://colah.github.io/posts/2015-08-Understanding-LSTMs/
> Ilya 清单第 12 篇. 第 11 篇 Karpathy 的博客展示 RNN 能做出多惊人的效果, 本篇拆开 RNN 内部, 讲清楚 LSTM 凭什么能做到, 第 13 篇接着解决 LSTM 的过拟合. 三篇构成清单里的 RNN 三部曲.

**全文符号表**

本文是 LSTM 图解导读, 公式只有四条 (三个门加一条状态更新), 全部沿用 Olah 博客原式的记号. 先一次性登记.

| 符号 | 含义 |
|------|------|
| $t$ | 时间步, 序列里的第几个位置 |
| $x_t$ | 第 $t$ 步的输入向量 |
| $h_t$ | 第 $t$ 步的 hidden state, 模块对外的输出, 也是工作记忆. 和第 11 篇的 $h_t$ 是同一个东西 |
| $C_t$ | 第 $t$ 步的 cell state, 长期记忆, 图中顶部那条传送带. 大写 $C$ 是 Cell |
| $\tilde{C}_t$ | 候选值向量, 读音「C 波浪」, 这一步「可能」写入 cell state 的新内容, 还没经过剂量控制 |
| $f_t$ | 遗忘门 (forget gate) 的输出, 每个分量在 0 到 1 之间, 1=全保留, 0=全丢弃 |
| $i_t$ | 输入门 (input gate) 的输出, 决定候选值每个分量的写入剂量 |
| $o_t$ | 输出门 (output gate) 的输出, 决定 cell state 的哪些部分对外露出 |
| $W_f, W_i, W_C, W_o$ | 四个可学习层的权重矩阵, 下标标记它服务哪个门 (C 是候选值层) |
| $b_f, b_i, b_C, b_o$ | 对应的偏置向量 |
| $\sigma$ | sigmoid 函数, 把任意实数压到 $(0, 1)$, 三个门都用它当刻度盘 |
| $\tanh$ | 双曲正切, 把任意实数压到 $(-1, 1)$, 负责产生内容 |
| $[h_{t-1}, x_t]$ | 拼接: 把上一步的 hidden state 和当前输入首尾相接, 拼成一个更长的向量, 作为四个层的共同输入 |
| $W \cdot [\cdot]$ | 矩阵乘向量: 权重矩阵左乘拼接后的向量, 是普通的线性变换 |
| $*$ | 逐点乘法 (elementwise multiply): 两个等长向量对应分量相乘, 得到等长向量. 和上面的 $\cdot$ (矩阵乘) 是两个不同的运算, 全文只有这两处乘法记号, 注意区分 |

**读公式的方法**: 四条公式里, 三个门的公式结构完全一样, 都是 $\sigma(W \cdot [h_{t-1}, x_t] + b)$, 差别只在权重矩阵和输出的用途. 读它们只需要问「这个门的输出乘在谁身上」: $f_t$ 乘在旧状态上 (决定扔什么), $i_t$ 乘在候选值上 (决定存多少), $o_t$ 乘在 $\tanh(C_t)$ 上 (决定露多少). 状态更新公式 $C_t = f_t * C_{t-1} + i_t * \tilde{C}_t$ 是全文的枢纽: 左边一项管遗忘, 右边一项管写入, 中间是加法, 加法就是梯度高速公路的来源.

## 1. 背景与历史: 一篇博客取代了原始论文

LSTM 的原始论文是 Hochreiter 和 Schmidhuber 1997 年发表的, 引用量以万计. 但一个公开的秘密是: 全世界真正学会 LSTM 的人, 大多数不是读原始论文学会的, 是读 Christopher Olah 2015 年 8 月的这篇博客学会的. 原始论文写得密集而晦涩, 术语体系和今天不完全一致; Olah 的博客用一套统一的图例, 把六个公式拆成十几张图, 一步一步走完. 之后十年里, 几乎所有讲 LSTM 的课程, 讲义, 面试题, 用的都是这套图或者它的仿制品.

Olah 写这篇博客时在 Google Brain. 他自己在文末交代, 动笔之前他已经在两个神经网络研讨系列里反复练过讲 LSTM, 感谢参与者的耐心和反馈. 换句话说, 这套图不是灵感一闪画出来的, 是试讲打磨出来的, 每一版都经过真实听众的检验. 这解释了为什么它的讲解顺序如此稳定: 先讲环, 再讲展开, 再讲依赖问题, 再讲结构, 最后才进门. 任何一环跳过, 后面的图都会失去支点.

博客末尾的致谢名单值得逐字读一遍: 他感谢 Google 的同事 Oriol Vinyals, Greg Corrado, Jon Shlens, Luke Vilnis, 以及 Ilya Sutskever. 对, 就是这份阅读清单的作者本人. 他还感谢了 Dario Amodei, 后来 Anthropic 的 CEO; 以及 Kyunghyun Cho, 为他图表的设计提供了「极其用心的通信讨论」. Cho 是 GRU 的作者, 也是清单第 14 篇 attention 论文的通讯作者. 一篇博客的致谢名单, 把后面十年的深度学习史串起来了一小半.

这篇博客的方法论价值, 和它的内容价值至少一样大. Olah 定了一套图例: 每条线携带一整个向量, 黄色方块是可学习的神经网络层, 粉色圆圈是逐点运算 (比如向量加法), 线条合并表示拼接, 线条分叉表示内容被复制送往不同位置. 这套图例做了一件此前没人系统做过的事: 给「把公式翻译成图」这件事建立语法. 公式写成一行, 信息是顺序排列的符号; 画成图, 信息有了拓扑结构, 哪条通路短, 哪条通路长, 梯度在哪条路线上衰减, 一眼可见. 清单第 16 篇 The Annotated Transformer 是这个传统的直接继承者.

**LSTM 链条与传送带**

```text
Flat vector infographic on a pure white background, 4:3 aspect ratio. An unrolled LSTM chain: four repeating modules in a row, each a rounded rectangle containing four soft-yellow boxes (neural network layers) and soft-pink circles (pointwise operations). A bold horizontal line runs across the top through all modules, labeled "cell state". Below each module, an input arrow labeled x_t; above, an output arrow labeled h_t. Thin navy strokes, low-saturation yellow and pink fills, sans-serif labels, ample whitespace, no shadows, no gradients.
```
横向展开的 LSTM 链, 四个重复模块, 顶部一条水平线是 cell state. 黄色方块是四个可学习层, 粉色圆圈是逐点运算, 这套图例就是 Olah 发明的.

## 2. 问题定义: RNN 与长程依赖

博客的出发点是一个关于人的观察: 人类不会每一秒都从零开始思考. 读这句话的时候, 你是基于对前面所有词的理解来理解当前这个词的, 不会把之前的全部扔掉重新想. 思维有持续性. 传统神经网络做不到这一点: 想象要给一部电影每个时间点发生的事件分类, 传统网络没有明显的办法把「对前面剧情的推理」用于后面的判断.

RNN 用「环」解决这个问题. 一块网络 $A$ 接收输入 $x_t$, 输出 $h_t$, 环让信息从网络的一步传递到下一步. 环看着神秘, 展开之后一点都不神秘: 把环打开, RNN 就是同一个网络的多个副本首尾相接, 每个副本给后继者传递一条消息. 这种链式结构说明 RNN 和序列, 列表这类数据天然同源, 是处理这类数据最自然的架构.

**RNN 的环与展开**

```text
Two-panel flat vector diagram on an off-white background, 4:3 aspect ratio. Left panel titled "RNN with loop": a single rounded box labeled "A" with an input arrow "x_t" from below, an output arrow "h_t" upward, and a curved loop arrow from the box back into itself. Right panel titled "unrolled": the same box "A" repeated five times in a horizontal chain, each with its own x_t input below and h_t output above, arrows connecting each A to the next. Thin charcoal lines, teal and amber accents, sans-serif labels, no shadows.
```
左侧是带环的 RNN: 网络块 A 读入 x_t 输出 h_t, 环把信息送回自身. 右侧是展开后的链: 同一个 A 的多个副本, 每个把消息传给下一个.

RNN 的卖点是把过去的信息连接到当前任务, 比如用前面的视频帧帮助理解当前帧. 能不能做到, 分情况.

短距离依赖没问题. 语言模型预测 "the clouds are in the sky" 的最后一个词, 不需要任何远处的上下文, 答案显然是 sky. 相关信息和需要它的位置之间间隔很小, 普通 RNN 学得会.

长距离依赖就难了. 预测 "I grew up in France... I speak fluent French" 的最后一个词, 最近的信息只告诉你下一个词大概是一门语言的名字, 要缩窄到 French, 必须用到很前面的 France. 相关信息和使用点之间的间隔可以任意大. 不幸的是, 随着间隔变大, RNN 逐渐丧失连接这些信息的能力.

**两种依赖距离**

```text
Flat vector comparison diagram on a pure white background, 4:3 aspect ratio. Top row: the sentence "the clouds are in the ___" with a short curved arrow from the word "clouds" to the blank, labeled "short gap: RNN can learn this", with a green check mark. Bottom row: the sentence "I grew up in France ... (long gap) ... I speak fluent ___" with a much longer curved arrow from "France" to the blank, labeled "long gap: RNN fails to learn this", with a red cross. The two arrows differ dramatically in length. Thin navy strokes, muted teal/coral accents, sans-serif labels, generous whitespace.
```
上方短句: 从 clouds 到 sky 的箭头只跨几个词, 标注短依赖, RNN 学得会. 下方长句: 从 France 到 French 的箭头跨过整段省略号, 标注长依赖, RNN 学不会. 两条箭头长度对比就是全篇要解决的问题.

这两个例子的对比里藏着长程依赖问题的本质. 预测下一个词需要的信息, 有时就在隔壁, 有时在段落开头. 模型事先不知道这次需要的是哪一种, 它必须同时具备两种能力: 短期记忆随手可取, 长期记忆在需要时能被准确调出. 普通 RNN 的隐藏状态每一步都被新输入冲刷重写, 短期记忆还勉强够用, 长期记忆在反复重写中稀释. 间隔越长, 稀释越严重, 这不是参数没调好, 是结构性的.

Olah 在这里给了一个精确的分寸: 理论上, RNN 完全有能力处理长程依赖, 人类可以手工挑选参数解决这类玩具问题. 但在实践中, RNN 就是学不到. 这个问题由 Hochreiter 1991 年的德文论文和 Bengio et al. 1994 深入探索过, 他们找到了一些相当根本的原因. 后来公认的标准解释是梯度消失: 误差信号沿时间反向传播时, 每一步都要乘一次同一个权重矩阵和激活函数的导数, 几十步之后信号要么指数衰减到零, 要么指数爆炸. Olah 本人没有在博客里展开推导, 他只做了一件事: 引用文献, 然后宣布 LSTM 没有这个问题.

## 3. 核心方法: LSTM 逐步拆解

### 3.1 从一层到四层

LSTM (Long Short Term Memory) 由 Hochreiter 和 Schmidhuber 在 1997 年提出, 之后被大量后续工作打磨和推广. 它在一系列问题上工作得极好, 2015 年时已经广泛使用. 它的设计目标非常明确: 专门为避免长程依赖问题而生. Olah 的原话是, 长时间记住信息实际上是 LSTM 的默认行为, 而不是它挣扎着才能学会的东西.

结构上, 所有 RNN 都是重复模块首尾相接的链. 标准 RNN 的重复模块非常简单, 比如单个 tanh 层. LSTM 的重复模块里有四个层, 以一种特殊的方式交互. 一层变四层, 复杂度上去了, 换来的是记忆通路从「被动衰减」变成「主动管理」.

**标准 RNN 与 LSTM 的重复模块**

```text
Side-by-side flat vector comparison on a light grayish-white background, 4:3 aspect ratio. Left panel titled "standard RNN": a single repeating module containing just one soft-yellow box labeled "tanh". Right panel titled "LSTM": a repeating module containing four interacting soft-yellow boxes (three sigmoid, one tanh) plus soft-pink pointwise circles, with a horizontal cell-state line running across the top. Caption at bottom: "one layer vs four interacting layers". Thin navy strokes, low-saturation fills, sans-serif labels, blueprint feel, no gradients.
```
左侧标准 RNN 的模块里只有单个 tanh 层. 右侧 LSTM 的模块里有四个交互的层, 顶部多出一条 cell state 横线. 一换四, 是全文最核心的结构对比.

### 3.2 图例: 把公式翻译成图的语法

在拆解之前, Olah 先花一整段交代图例, 这一步经常被转述者跳过, 但它是全篇的方法论核心. 每条线携带一整个向量, 从一个节点的输出流向其他节点的输入. 粉色圆圈表示逐点运算, 比如向量加法. 黄色方块表示可学习的神经网络层. 线条合并表示拼接 (concatenation), 线条分叉表示同一份内容被复制, 副本送往不同位置.

**Olah 的统一图例**

```text
Flat vector legend card on a pure white background, 4:3 aspect ratio. Five labeled symbol entries arranged in a row or grid: (1) a horizontal arrow line labeled "line = carries a vector"; (2) a soft-yellow rounded square labeled "yellow box = learned neural network layer"; (3) a soft-pink circle labeled "pink circle = pointwise operation"; (4) two lines merging into one labeled "merge = concatenation"; (5) one line forking into two labeled "fork = copy to two places". Thin charcoal strokes, muted yellow and pink, sans-serif labels, ample whitespace, no shadows.
```
五种符号构成完整语法: 线 = 向量流, 黄色方块 = 可学习层, 粉色圆圈 = 逐点运算, 合并 = 拼接, 分叉 = 复制. 后面所有图都是这五种符号的组合.

有了这套语法, LSTM 的六个公式不再需要「读」, 只需要「看」. 公式里 $\sigma$ 和 $\tanh$ 是抽象符号, 图里它们是黄色方块; 公式里的逐点乘法是 $*$ 号, 图里它是粉色圆圈, 而且圆圈坐在哪条线上, 决定了它控制谁. 这套表达系统让「门控」这个抽象概念获得了物理直觉: 门就是一个坐在管道上的阀门.

### 3.3 cell state: 传送带

LSTM 的关键是 cell state, 图中贯穿顶部的那条水平线. Olah 的比喻是传送带: 它沿整条链笔直地跑, 只有少量线性交互, 信息非常容易原封不动地流过.

**cell state 传送带**

```text
Flat vector diagram on an off-white background, 4:3 aspect ratio. A single LSTM module drawn with Olah-style notation: soft-yellow boxes and soft-pink circles in the lower body, all rendered in light gray as background context. The top horizontal line is drawn boldly in teal, labeled "cell state: conveyor belt", running straight from left edge to right edge with only two small pink circles touching it. Conveyor-belt metaphor annotation below: "information flows along it unchanged". Thin navy strokes, low-saturation palette, sans-serif labels, no gradients.
```
顶部水平线是 cell state, 笔直穿过所有时间步, 沿途只有两个粉色圆圈对它做线性修改. 信息在这条带上可以原样流动任意远.

LSTM 确实有往 cell state 里删除或添加信息的能力, 这个能力由「门」精细调节. 门是一种选择性放行信息的结构, 由一个 sigmoid 层和一个逐点乘法运算组成. sigmoid 层输出 0 到 1 之间的数, 描述每个分量应该放行多少: 0 表示什么都不放, 1 表示全部放行. 一个 LSTM 有三个这样的门, 保护和控制 cell state.

这套设计的精要在于: 遗忘和写入都是连续的, 可微的, 可学习的. 门不是离散的开关, 是 0 到 1 之间的刻度盘, 梯度可以穿过它反向传播, 网络可以自己学会每个时间步把刻度盘拧到多少. 对比一下老式的硬门控思路: 如果门只能 0 或 1, 什么时候开什么时候关就成了离散决策, 梯度传不过去, 只能人工设计规则. sigmoid 把离散开关软化成连续阀门, 整个结构才能端到端训练. 这是 LSTM 能「学」会遗忘和记忆的前提, 也是后来所有门控结构沿用的同一条原理.

### 3.4 遗忘门: 先决定扔什么

LSTM 的第一步是决定从 cell state 里扔掉什么信息. 这个决定由一个 sigmoid 层做出, 叫遗忘门 (forget gate). 它看 $h_{t-1}$ 和 $x_t$, 对 cell state $C_{t-1}$ 里的每一个数输出一个 0 到 1 之间的值:

$$
f_t = \sigma(W_f \cdot [h_{t-1}, x_t] + b_f)
$$

逐块拆开, 这是全文第一条门公式, 后面两条结构完全相同. $[h_{t-1}, x_t]$ 是拼接: 把上一步的 hidden state 和当前输入首尾相接, 拼成一个更长的向量, 它是这个门的全部输入. $W_f \cdot [h_{t-1}, x_t]$ 是矩阵乘向量, 一个线性变换, 把拼接向量映射到和 cell state 相同的维度. $b_f$ 是偏置向量, 每个分量一个常数, 整体平移变换结果. 最后 $\sigma$ 逐分量把实数压到 $(0, 1)$, 输出向量 $f_t$ 的每个分量就是一个独立的刻度盘读数. 整条公式回答的问题是: 看当前输入和短期记忆, cell state 里每个位置该保留多大比例.

1 表示完全保留, 0 表示完全丢弃. Olah 给的例子是语言模型: cell state 里可能存着当前主语的性别, 这样后面才能用对代词. 当模型看到一个新的主语, 就应该忘掉旧主语的性别.

**遗忘门**

```text
Flat vector diagram on a pure white background, 4:3 aspect ratio. An LSTM module in Olah-style notation, all elements in light gray except the highlighted forget gate at the lower-left: a soft-yellow sigmoid box receiving the merged inputs "h_{t-1}" and "x_t", outputting "f_t" to a soft-pink multiplication circle sitting on the cell-state line. Annotations: "1 = completely keep this", "0 = completely get rid of this". Thin navy strokes, the highlighted gate in muted yellow and pink, rest in gray, sans-serif labels, no shadows.
```
模块左下角, sigmoid 方块接收 h_{t-1} 和 x_t 拼接后的输入, 输出 f_t, 通过粉色乘法圆圈作用在 cell state 上. 1 保留, 0 丢弃.

### 3.5 输入门: 再决定存什么

第二步是决定往 cell state 里存什么新信息, 分两个部件. 一个 sigmoid 层叫输入门 (input gate), 决定哪些值将被更新; 一个 tanh 层产生候选值向量 $\tilde{C}_t$, 即可能被加进状态的新内容:

$$
i_t = \sigma(W_i \cdot [h_{t-1}, x_t] + b_i), \quad \tilde{C}_t = \tanh(W_C \cdot [h_{t-1}, x_t] + b_C)
$$

两式摆在一起是有讲究的. 左边 $i_t$ 和遗忘门公式结构完全相同, 只是权重换成 $W_i, b_i$: 同样是看拼接输入, 同样输出 0 到 1 的刻度盘, 只是这个刻度盘管的是写入剂量. 右边 $\tilde{C}_t$ 把 $\sigma$ 换成 $\tanh$, 输出范围变成 $(-1, 1)$, 因为它产生的不是开度而是内容本身, 内容可正可负. 同一份拼接输入喂给两个层, 一个出剂量, 一个出内容.

在语言模型的例子里, 这一步把新主语的性别加进 cell state, 替换掉刚被遗忘的那个. 注意分工: tanh 负责「产生内容」, sigmoid 负责「决定剂量」, 产生和调控分离, 是 LSTM 模块反复出现的设计模式.

**输入门与候选值**

```text
Flat vector diagram on an off-white background, 4:3 aspect ratio. An LSTM module in Olah-style notation, all elements in light gray except the highlighted middle section: two parallel soft-yellow boxes, one sigmoid labeled "input gate i_t" and one tanh labeled "candidate values", both receiving merged "h_{t-1}" and "x_t", converging at a soft-pink multiplication circle whose output feeds an addition circle on the cell-state line. Annotation: "decide which values to update x what new content to add". Thin navy strokes, muted yellow/pink highlights, sans-serif labels, no gradients.
```
模块中部两个并联的黄色方块: sigmoid 输入门决定更新哪些位置, tanh 层产生候选值. 两者在粉色乘法圆圈处汇合, 得到按剂量缩放的新内容.

### 3.6 状态更新: 一行公式完成遗忘加写入

第三步把旧状态 $C_{t-1}$ 更新为新状态 $C_t$. 前两步已经决定了要做什么, 这一步只是执行:

$$
C_t = f_t * C_{t-1} + i_t * \tilde{C}_t
$$

这里的 $*$ 是逐点乘法: 两个等长向量对应分量相乘, 得到等长向量, 和门公式里的矩阵乘 $\cdot$ 不是一回事. 公式两项分工清楚. 第一项 $f_t * C_{t-1}$: 旧状态的每个分量乘上遗忘门对应分量的开度, 开度接近 0 的位置被抹掉, 接近 1 的位置原样保留. 第二项 $i_t * \tilde{C}_t$: 候选内容的每个分量乘上输入门的剂量, 按量写入. 中间是加法, 两项合并成新状态 $C_t$.

代一个分量算一遍. 设旧状态某分量 $C_{t-1} = 0.8$, 遗忘门给这个位置的开度 $f_t = 0.1$, 候选值 $\tilde{C}_t = 0.5$, 输入门剂量 $i_t = 0.9$. 则遗忘项 $= 0.1 \times 0.8 = 0.08$, 旧信息被砍掉九成; 写入项 $= 0.9 \times 0.5 = 0.45$; 新状态 $C_t = 0.08 + 0.45 = 0.53$. 旧内容几乎清空, 新内容按九成剂量写入, 这就是「先决定扔什么, 再决定存什么」在一个分量上的完整执行.

旧状态乘上 $f_t$, 忘掉之前决定忘的东西; 再加上 $i_t * \tilde{C}_t$, 即按更新剂量缩放后的新候选值. 在语言模型里, 这一步真正丢掉旧主语的性别信息, 写入新主语的性别信息.

**cell state 更新**

```text
Flat vector diagram on a pure white background, 4:3 aspect ratio. An LSTM module in Olah-style notation, all elements in light gray except the highlighted cell-state line at top: a bold teal horizontal line with two highlighted soft-pink circles on it, first a multiplication circle labeled "x f_t (forget)" then an addition circle labeled "+ i_t x candidate (write)". The state transforms from "C_{t-1}" on the left to "C_t" on the right. Annotation below: "forget first, then write, all on the conveyor belt". Thin navy strokes, teal and coral accents, sans-serif labels, no shadows.
```
cell state 横线上的两个粉色圆圈高亮: 第一个圆圈把旧状态乘 f_t, 第二个圆圈加上 i_t 乘候选值. 先遗忘后写入, 全部发生在传送带上.

这一行公式是 LSTM 缓解梯度消失的机制根源, 虽然 Olah 本人没有把它点破. 对比标准 RNN: 标准 RNN 里隐藏状态每一步都被同一组权重乘一遍再过一个非线性, 几十步连乘, 梯度消失或爆炸. LSTM 里 cell state 的更新是加性的, 反向传播时误差沿传送带流动, 沿途只经过逐点乘法和加法, 不反复穿过同一组权重和非线性. 传送带在数学上是一条梯度高速公路, 遗忘门是这条公路上唯一的路障, 而且路障的开度是可学习的. 这个解读后来成为教科书标准解释, 但它的视觉版本就在 Olah 的图里: 那条笔直的横线.

### 3.7 输出门: 决定对外露多少

最后一步决定输出什么. 输出基于 cell state, 但是一个过滤后的版本. 先跑一个 sigmoid 层, 决定 cell state 的哪些部分将被输出; 再把 cell state 过一遍 tanh, 把值压到 $-1$ 到 $1$ 之间, 然后乘上 sigmoid 门的输出:

$$
o_t = \sigma(W_o \cdot [h_{t-1}, x_t] + b_o), \quad h_t = o_t * \tanh(C_t)
$$

左式和前两个门完全同构, 只是权重换成 $W_o, b_o$. 右式分两步: $\tanh(C_t)$ 把 cell state 各分量压到 $(-1, 1)$, 这是「可供输出的全部内容」; $o_t * \tanh(C_t)$ 逐点筛选, 输出门开度大的位置露出, 开度小的位置遮住, 结果就是这一步的 hidden state $h_t$. cell state 本身从不直接出门, 出门的永远是过滤后的版本, 这是两种记忆分离的最后一道工序.

在语言模型的例子里, 模型刚看到一个主语, 可能想输出与动词相关的信息, 以防下一个词就是动词: 比如输出主语是单数还是复数, 这样后面真跟了动词, 就知道该变位成什么形式.

**输出门**

```text
Flat vector diagram on a light grayish-white background, 4:3 aspect ratio. An LSTM module in Olah-style notation, all elements in light gray except the highlighted right section: a soft-yellow sigmoid box labeled "output gate o_t" receiving merged "h_{t-1}" and "x_t"; the cell state passes through a soft-yellow tanh box, then meets o_t at a soft-pink multiplication circle, producing "h_t" which exits upward and rightward. Annotation: "output a filtered version of the cell state". Thin navy strokes, muted yellow/pink highlights, sans-serif labels, no gradients.
```
模块右侧, sigmoid 输出门读取 h_{t-1} 和 x_t, cell state 经过 tanh 后与门输出相乘, 得到 h_t 送往外部和下一个时间步.

至此一个时间步走完. 四个黄色方块, 三个门, 一条传送带. 三个门的公式结构完全一样, 摆一张对照表就看清它们的分工:

| 门 | 输出范围 | 乘在谁身上 | 回答的问题 |
|----|----------|------------|------------|
| 遗忘门 $f_t$ | $(0, 1)$ | 旧状态 $C_{t-1}$ | 旧记忆每个位置保留多大比例 |
| 输入门 $i_t$ | $(0, 1)$ | 候选值 $\tilde{C}_t$ | 新内容每个位置写入多大剂量 |
| 输出门 $o_t$ | $(0, 1)$ | $\tanh(C_t)$ | 当前状态哪些部分对外露出 |

三行只有最后一列不同, 这就是「产生和调控分离」的全部含义: sigmoid 管调控, 被调控的对象各不相同. 值得停一下看整体设计: cell state 是长期记忆, 负责跨步携带信息; hidden state 是工作记忆, 负责当前步的输入输出. 两种记忆分离, 各配一套阀门, 这是 LSTM 比标准 RNN 多出来的全部东西.

## 4. 变体巡礼: 门控结构的设计空间

Olah 描述的只是「标准的」 LSTM. 实际上几乎每篇用到 LSTM 的论文用的都是略有不同的版本, 差别不大, 但值得点名几个.

第一个是 peephole connections (窥视孔连接), 由 Gers 和 Schmidhuber 2000 年提出: 让门层能看到 cell state. 也就是说 $f_t$, $i_t$, $o_t$ 的输入除了 $h_{t-1}$ 和 $x_t$, 还加上 $C_{t-1}$ 或 $C_t$. 直觉很直接: 阀门应该能看到管道里流的是什么. 上面那张图给所有门都加了窥视孔, 但很多论文只给一部分门加.

第二个是耦合遗忘门和输入门 (coupled forget and input gates): 不再分别决定遗忘什么和写入什么, 两个决定合并成一个. 只在要写入新内容的位置遗忘, 只在遗忘了旧内容的位置写入. 信息总量守恒, 适合容量紧张的场景.

第三个是最重要的变体: GRU (Gated Recurrent Unit), 由 Cho et al. 2014 提出. 它把遗忘门和输入门合并成单一的 update gate, 并且合并了 cell state 和 hidden state, 还做了其他一些简化. 得到的模型比标准 LSTM 更简单, 两门对三门, 一个状态对两个状态, 参数量明显更少, 流行度持续增长.

**三种变体对比**

```text
Three-card flat vector comparison on a pure white background, 4:3 aspect ratio. Card 1 titled "peephole connections": a standard LSTM module with dashed lines from the cell state down into each gate box. Card 2 titled "coupled gates": an LSTM module where the forget and input gate boxes are merged into one shared box. Card 3 titled "GRU": a simpler module with only two yellow boxes labeled "update gate" and "reset gate", and a single state line labeled "hidden state (merged)". Complexity visibly decreases left to right. Thin navy strokes, low-saturation fills, sans-serif labels, no shadows, no gradients.
```
三张卡片并排: peephole 给门开了通往 cell state 的虚线, coupled 把遗忘门和输入门合并, GRU 只剩 update 和 reset 两个门且状态合一. 复杂度从左到右递减.

还有更激进的: Yao et al. 2015 的 Depth Gated RNN, 以及完全不同思路的 Clockwork RNN (Koutnik et al. 2014), 让不同模块按不同时间尺度运转, 快模块处理局部节奏, 慢模块维持长期上下文. Clockwork 的思路值得一提, 因为它绕开了「一条传送带管所有时间尺度」的假设, 直接用结构分工对抗长程依赖, 这条思路后来在线性注意力和状态空间模型里换了形式复活.

哪个变体最好? 差异重要吗? Greff et al. 2015 对流行变体做了系统比较, 结论是大家都差不多. Jozefowicz et al. 2015 更狠, 测了一万多种 RNN 架构, 发现在某些任务上存在比 LSTM 更好的结构. 两个结果合起来读: LSTM 不是终点, 但作为默认选项不会错, 门控这个思想本身比任何具体形态都更有生命力. 后来的历史验证了这一点: GRU 进了无数生产线, 门控机制以 Highway Networks, ResNet 残差连接, 甚至 Transformer 里的 GLU 激活等形式反复出现. 一个 1997 年为解决梯度问题发明的阀门, 到今天还是深度学习工具箱里的标准件.

## 5. 局限与后续: Olah 预告了 attention

博客的结论段写于 2015 年 8 月, 其中一段话今天读起来像预言. Olah 说: LSTM 是 RNN 能力上的一大步, 自然的问题是还有没有下一个大步. 研究者的普遍意见是: 有, 下一步叫 attention. 想法是让 RNN 的每一步从一个更大的信息集合里挑选要看的部分. 比如用 RNN 给图像生成描述, 每输出一个词, 就看图像的一块区域. Xu et al. 2015 做的正是这件事, 想探索 attention 可以从这篇入手.

这个预告的命中率是 100%. 清单第 14 篇就是 Cho 团队的 attention 机翻论文, 第 15 篇 Attention Is All You Need 干脆把 RNN 本体扔掉, 只留 attention. 2015 年时「让每一步看向输入子集」还是一个研究方向, 十年后它是整个大模型时代的主架构. Olah 本人后来也转向可解释性研究, 在 Distill 和 Anthropic 继续写那种「把复杂机制讲穿」的文章, 这篇博客是他方法论的原点.

LSTM 的局限同样值得列清楚. 第一, 它缓解但没有消灭长程依赖问题, 传送带理论上能携带任意远的信息, 实践中几百步之后记忆仍然模糊. 第二, 顺序计算是硬伤: 时间步必须一个接一个算, 无法并行, 这在 GPU 时代是原罪, 也是后来 Transformer 取代它的直接原因. GPU 的算力靠大规模并行喂出来, 一个必须串行展开一百步的网络, 等于主动放弃了硬件的全部优势. 第三, 参数量和计算量集中在四个门里, 序列越长, 每步的固定成本越不划算. 这些局限不是 Olah 的遗漏, 是 2015 年的时间烙印: 他写这篇博客时, 连 attention 都还是「即将到来」的东西.

## 6. 在本系列清单中的位置

把这篇放回清单的结构里, 它是 RNN 三部曲的中轴. 第 11 篇 Karpathy 的 The Unreasonable Effectiveness of Recurrent Neural Networks 展示效果: 字符级 RNN 能写出像样的莎士比亚, 代码, 甚至 LaTeX. 第 12 篇 Olah 拆机制: 这些效果背后是 LSTM 的门控记忆. 第 13 篇 Recurrent Neural Network Regularization 解决工程问题: LSTM 这么能拟合, 怎么防止过拟合. 效果, 机制, 正则化, 三篇排成一条完整的技术叙事线.

人物线同样工整. GRU 的作者 Kyunghyun Cho, 正是第 14 篇 attention 论文的通讯作者, 门控记忆和注意力机制在一个人身上接力. Olah 的致谢里有 Ilya Sutskever 本人, 这份清单的作者十年前就在帮同事审 LSTM 的图. 还有 Dario Amodei, 当时给博客提反馈, 后来创办了 Anthropic, Olah 自己也去了那里. 清单不是 30 篇孤立的论文, 是一张人物和思想的网络.

方法论上, 这篇博客示范了「图解工程」: 用一套严格统一的视觉语法, 把一组 intimidating 的方程变成 approachable 的图. 公式逐行走, 图按模块拆, 每个图只高亮当前讲的那部分, 其余灰掉. 这套手法后来成了技术写作的行业标准, 第 16 篇 The Annotated Transformer 用逐行代码注释加图做同样的事. 对今天写技术内容的人, 这篇博客的教训比 LSTM 本身更耐用: 表达不是研究完成后的包装, 表达本身就是研究能力的一部分.

**三部曲与人物线**

```text
Mind-map infographic on an off-white background, 4:3 aspect ratio. Central node labeled "Understanding LSTM (#12)". Left edge to a node "Unreasonable Effectiveness of RNN (#11)" labeled "effects". Right edge to a node "RNN Regularization (#13)" labeled "regularization". Upper path: a node "Cho: GRU (2014)" connects to a node "Attention NMT (#14)", then a dashed edge to a node "Attention Is All You Need (#15)" labeled "RNN removed". Rounded-rectangle nodes with low-saturation teal/amber fills, thin navy connecting lines, sans-serif labels, ample whitespace.

---
```
中心节点是本篇, 左接第 11 篇 Karpathy 的效果展示, 右接第 13 篇的正则化. 上方一条人物线: Cho 从 GRU 通向第 14 篇 attention, 虚线指向第 15 篇 Transformer.

## 7. 扩展阅读

- Hochreiter, S. & Schmidhuber, J. (1997). Long Short-Term Memory. Neural Computation. 原始论文, 术语体系和今天有出入, 建议先读 Olah 再回头读.
- Hochreiter, S. (1991). Untersuchungen zu dynamischen neuronalen Netzen.  Diploma thesis. 梯度消失问题的德文源头.
- Bengio, Y., Simard, P. & Frasconi, P. (1994). Learning long-term dependencies with gradient descent is difficult. IEEE Transactions on Neural Networks. 长程依赖困难性的经典分析.
- Gers, F. & Schmidhuber, J. (2000). Recurrent nets that time and count. peephole connections 出处.
- Cho, K. et al. (2014). Learning Phrase Representations using RNN Encoder-Decoder for Statistical Machine Translation. GRU 原始论文, 作者即清单第 14 篇通讯作者.
- Greff, K. et al. (2015). LSTM: A Search Space Odyssey. 流行变体的系统比较, 结论是大家差不多.
- Jozefowicz, R. et al. (2015). An Empirical Exploration of Recurrent Network Architectures. 一万多种架构的暴力搜索.
- Xu, K. et al. (2015). Show, Attend and Tell. Olah 点名的 attention 入门论文.
- Karpathy, A. (2015). The Unreasonable Effectiveness of Recurrent Neural Networks. 清单第 11 篇, 三部曲前作.
- Zaremba, W., Sutskever, I. & Vinyals, O. (2014). Recurrent Neural Network Regularization. 清单第 13 篇, 三部曲续作.
