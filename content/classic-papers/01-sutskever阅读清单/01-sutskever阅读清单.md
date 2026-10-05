---
title: "01 · Sutskever–Carmack 阅读书目"
category: "索引"
published: true
excerpt: "区分未公开的私人原始清单,27 项社区重建版本与本站主题学习路线,并提供逐项一手资料入口."
tags: ["Ilya Sutskever", "John Carmack", "阅读书目", "经典论文", "来源核验"]
---
# Sutskever–Carmack 阅读书目:证据与社区重建版

这页采用目前能够逐项追溯的**27 项社区重建版本**.Ilya Sutskever 私下发送的原始邮件并未公开,因此这里不会把社区整理稿冒充私人原件.作者保留这条书目,因为它横跨复杂度,视觉,序列建模,Attention,结构化推理与规模训练,能够形成一条比“只读 Transformer 之后的论文”更宽的知识路径.它的教学价值来自材料之间可以检查的概念关系,并不依赖“官方书单”这层名号.

六个直属主题是本站重排后的入口.复杂度与信息论先建立描述长度,结构和智能的讨论坐标;CNN 与视觉基础展示数据规模,局部结构和残差训练;RNN 与序列建模处理状态传递及正则化;Attention 与 Transformer 把动态对齐发展成并行序列架构;结构,记忆与推理覆盖指针,集合,关系,图与外部记忆;训练,规模与生成再连接权重编码,流水线,语音系统,Scaling Laws 与生成表示.这条关系属于本站的 LLM Atlas 判断,与社区仓库的排列顺序分开保存.

## 目前能确认到哪一步

John Carmack 在 2023 年公开采访中回忆:他曾向 Ilya Sutskever 索要阅读清单,得到"大约 40 篇研究论文",并被告知如果真正学懂,就会知道当时约 90% 的重要内容.Carmack 后来又公开表示,他原本期待 Ilya 发布一份 canonical list.

这两条材料能支持"私人清单及 90% 说法确有 Carmack 本人的公开转述",却不能还原私人原件.Ilya 没有公开确认下表的 27 项就是原清单,也没有公开确认其顺序.

| 层次 | 本库采用的表述 | 证据限制 |
|---|---|---|
| 私人原始清单 | Carmack 回忆收到过约 40 项材料 | 原件,完整条目和顺序未公开 |
| 社区重建版本 | `dzyim/ilya-sutskever-recommended-reading` 当前列出 27 项 | 仓库 README 自身也使用 "It is said that";不能当作 Ilya 认证 |
| 本站学习路线 | 将 27 项按六个主题重新排序并逐篇精读 | 编号是本站教学设计,不是 Ilya 的编排意图 |

因此,下表中的"重建序号"只表示社区仓库的顺序;"本站路线"才对应本知识库的路径编号.其他网络版本多收或少收哪些材料,需要逐一说明来源,不能简单判作"自媒体加戏".

## 27 项社区重建版本与本站路线

| 重建序号 | 条目与一手资料 | 本站路线 |
|---:|---|---|
| 1 | [The Annotated Transformer](https://nlp.seas.harvard.edu/annotated-transformer/) | [`1.4.3`](1.4-attention与transformer/1.4.3-annotated-transformer/1.4.3-annotated-transformer.md) |
| 2 | [The First Law of Complexodynamics](https://scottaaronson.blog/?p=762) | [`1.1.1`](1.1-复杂度信息论与智能/1.1.1-first-law-of-complexodynamics/1.1.1-first-law-of-complexodynamics.md) |
| 3 | [The Unreasonable Effectiveness of Recurrent Neural Networks](https://karpathy.github.io/2015/05/21/rnn-effectiveness/) | [`1.3.1`](1.3-rnn与序列建模/1.3.1-rnn-effectiveness/1.3.1-rnn-effectiveness.md) |
| 4 | [Understanding LSTM Networks](https://colah.github.io/posts/2015-08-Understanding-LSTMs/) | [`1.3.2`](1.3-rnn与序列建模/1.3.2-understanding-lstm/1.3.2-understanding-lstm.md) |
| 5 | [Recurrent Neural Network Regularization](https://arxiv.org/abs/1409.2329) | [`1.3.3`](1.3-rnn与序列建模/1.3.3-rnn-regularization/1.3.3-rnn-regularization.md) |
| 6 | [Keeping Neural Networks Simple by Minimizing the Description Length of the Weights](https://www.cs.toronto.edu/~hinton/absps/colt93.pdf) | [`1.6.1`](1.6-训练规模与生成/1.6.1-mdl-weights/1.6.1-mdl-weights.md) |
| 7 | [Pointer Networks](https://arxiv.org/abs/1506.03134) | [`1.5.1`](1.5-结构记忆与推理/1.5.1-pointer-networks/1.5.1-pointer-networks.md) |
| 8 | [ImageNet Classification with Deep Convolutional Neural Networks](https://proceedings.neurips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html) | [`1.2.1`](1.2-cnn与视觉基础/1.2.1-alexnet/1.2.1-alexnet.md) |
| 9 | [Order Matters: Sequence to Sequence for Sets](https://arxiv.org/abs/1511.06391) | [`1.5.2`](1.5-结构记忆与推理/1.5.2-set-to-sequence/1.5.2-set-to-sequence.md) |
| 10 | [GPipe](https://arxiv.org/abs/1811.06965) | [`1.6.2`](1.6-训练规模与生成/1.6.2-gpipe/1.6.2-gpipe.md) |
| 11 | [Deep Residual Learning for Image Recognition](https://arxiv.org/abs/1512.03385) | [`1.2.2`](1.2-cnn与视觉基础/1.2.2-resnet/1.2.2-resnet.md) |
| 12 | [Multi-Scale Context Aggregation by Dilated Convolutions](https://arxiv.org/abs/1511.07122) | [`1.2.4`](1.2-cnn与视觉基础/1.2.4-dilated-convolution/1.2.4-dilated-convolution.md) |
| 13 | [Neural Message Passing for Quantum Chemistry](https://arxiv.org/abs/1704.01212) | [`1.5.5`](1.5-结构记忆与推理/1.5.5-message-passing-neural-network/1.5.5-message-passing-neural-network.md) |
| 14 | [Attention Is All You Need](https://arxiv.org/abs/1706.03762) | [`1.4.2`](1.4-attention与transformer/1.4.2-transformer/1.4.2-transformer.md) |
| 15 | [Neural Machine Translation by Jointly Learning to Align and Translate](https://arxiv.org/abs/1409.0473) | [`1.4.1`](1.4-attention与transformer/1.4.1-bahdanau-attention/1.4.1-bahdanau-attention.md) |
| 16 | [Identity Mappings in Deep Residual Networks](https://arxiv.org/abs/1603.05027) | [`1.2.3`](1.2-cnn与视觉基础/1.2.3-resnet-identity-mapping/1.2.3-resnet-identity-mapping.md) |
| 17 | [A Simple Neural Network Module for Relational Reasoning](https://arxiv.org/abs/1706.01427) | [`1.5.3`](1.5-结构记忆与推理/1.5.3-relation-networks/1.5.3-relation-networks.md) |
| 18 | [Variational Lossy Autoencoder](https://arxiv.org/abs/1611.02731) | [`1.6.5`](1.6-训练规模与生成/1.6.5-variational-lossy-autoencoder/1.6.5-variational-lossy-autoencoder.md) |
| 19 | [Relational Recurrent Neural Networks](https://arxiv.org/abs/1806.01822) | [`1.5.4`](1.5-结构记忆与推理/1.5.4-relational-rnn/1.5.4-relational-rnn.md) |
| 20 | [Quantifying the Rise and Fall of Complexity in Closed Systems](https://arxiv.org/abs/1405.6903) | [`1.1.2`](1.1-复杂度信息论与智能/1.1.2-coffee-automaton/1.1.2-coffee-automaton.md) |
| 21 | [Neural Turing Machines](https://arxiv.org/abs/1410.5401) | [`1.5.6`](1.5-结构记忆与推理/1.5.6-neural-turing-machines/1.5.6-neural-turing-machines.md) |
| 22 | [Deep Speech 2](https://arxiv.org/abs/1512.02595) | [`1.6.3`](1.6-训练规模与生成/1.6.3-deep-speech-2/1.6.3-deep-speech-2.md) |
| 23 | [Scaling Laws for Neural Language Models](https://arxiv.org/abs/2001.08361) | [`1.6.4`](1.6-训练规模与生成/1.6.4-scaling-laws/1.6.4-scaling-laws.md) |
| 24 | [A Tutorial Introduction to the Minimum Description Length Principle](https://arxiv.org/abs/math/0406077) | [`1.1.3`](1.1-复杂度信息论与智能/1.1.3-minimum-description-length/1.1.3-minimum-description-length.md) |
| 25 | [Machine Super Intelligence](http://www.vetta.org/documents/Machine_Super_Intelligence.pdf) | [`1.1.4`](1.1-复杂度信息论与智能/1.1.4-machine-super-intelligence/1.1.4-machine-super-intelligence.md) |
| 26 | [Kolmogorov Complexity and Algorithmic Randomness](https://www.lirmm.fr/~ashen/kolmbook-eng-scan.pdf) | [`1.1.5`](1.1-复杂度信息论与智能/1.1.5-kolmogorov-complexity/1.1.5-kolmogorov-complexity.md) |
| 27 | [CS231n: Convolutional Neural Networks for Visual Recognition](https://cs231n.github.io/) | [`1.2.5`](1.2-cnn与视觉基础/1.2.5-cs231n/1.2.5-cs231n.md) |

## 为什么本站另做主题排序

重建版本把博客,课程,论文和教材交错列出,适合作为书目记录,却不一定适合第一次学习.本站将它们整理成六段依赖链:

1. 复杂度,信息论与智能;
2. CNN 与视觉基础;
3. RNN 与序列建模;
4. Attention 与 Transformer;
5. 结构,记忆与推理;
6. 训练,规模与生成.

这种重排是本站的教学判断.文章里出现的路线编号都应按这套坐标理解;如需核对社区版本位置,以本页"重建序号"列为准.

## 六段路线怎样连接

复杂度,信息论与智能位于开头,因为这组材料讨论的不是某一网络结构,而是描述长度,可计算性,复杂结构和智能之间能否建立度量.《复杂度第一定律》与 Coffee Automaton 讨论封闭系统中复杂度的升降,MDL 教程把模型选择写成模型码长与数据残差码长之和,Machine Super Intelligence 与 Kolmogorov Complexity 又把问题推进到通用归纳与算法随机性.这组材料为后面“学习是压缩”提供定义边界,并不意味着深度学习目标等同于直接最小化 Kolmogorov complexity.

CNN 与视觉基础展示深度学习怎样由数据,硬件和结构共同推进.AlexNet 把 GPU,ReLU,dropout 与大规模 ImageNet 训练组合起来;ResNet 和 Identity Mapping 追踪深层网络的优化退化与恒等残差路径;空洞卷积处理不降低分辨率时扩大感受野;CS231n 作为课程材料补全卷积,反向传播与训练实践.它们的共同线索是局部结构和梯度路径,不是按年份排列的冠军榜.

RNN 与序列建模从可运行的字符级 RNN 开始,再用 LSTM 解释门控状态,最后讨论循环网络中的 dropout 应放在哪些连接上.这一段提供 Attention 出现前的参照:序列被逐步吸收进有限状态,长距离信息要沿时间反复传递.Bahdanau Attention 随后让解码器在每一步重新读取源序列状态,Transformer 再把序列位置之间的交互改造成并行 self-attention.Annotated Transformer 补足原论文到可运行实现之间的 mask,shape,学习率与 label smoothing 细节.

结构,记忆与推理不以 Transformer 为终点.Pointer Networks 让输出指向输入位置,Set-to-Sequence 研究无序集合的排列,Relation Networks 显式计算对象对,Message Passing Neural Networks 把节点和边纳入更新,Relational RNN 与 Neural Turing Machines 则把关系结构或外部地址空间加入循环控制器.这些工作共同追问:当任务输出不是固定类别,或推理对象不适合压进一个向量时,网络应保存和访问什么结构.

训练,规模与生成把单模型机制放进更大的资源系统.MDL Weights 用权重描述长度讨论正则化与精度,GPipe 用层切分,微批与重计算训练单设备放不下的模型,Deep Speech 2 展示数据规模,分布式训练与端到端目标如何共同形成系统,Scaling Laws 拟合参数,数据,算力与损失的经验关系,VLAE 则从有损表示和解码器能力分析生成模型中的信息分配.这一段连接算法,训练系统和资源决策.

## 怎样使用 27 项表

表格承担两项职责.左侧外链指向论文,作者文章,课程或教材本身,用于确认标题和原始内容;右侧路线链接指向本站精读,用于阅读中文分析和上下文.重建序号只复现指定社区仓库的排列,不补写 Ilya 的意图.某项材料是博客或课程而非论文时,仍按其真实体裁标注,不为整齐而全部称作论文.

第一次阅读可按六个主题首页推进,每个主题内部再按依赖阅读.查阅特定机制时可以直接使用表格跳转,但最好同时读其主题首页,确认前置概念.核对“这是否属于原始清单”时,答案只能停在证据允许的层级:私人约 40 项原件未公开;本站展示的是特定社区仓库的 27 项重建;六主题编号由本站编排.三者之间不能用“缺失项”“原排序”之类词语无条件互推.

作者将这条路线视为 LLM Atlas 的历史骨架,是因为现代模型中的残差,Attention,规模训练,并行和结构化计算都能在这些材料中找到较早的明确问题.这是一项教学判断,不是声称 27 项足以覆盖今天 LLM 的全部知识.后训练,检索,现代推理服务,状态空间模型和新一代 MoE 仍需由其他章节补足.

## 来源

- [John Carmack 访谈:私人清单约 40 项及"90%"回忆](https://dallasinnovates.com/exclusive-qa-john-carmacks-different-path-to-artificial-general-intelligence/)
- [John Carmack 公开帖:期待 Ilya 发布 canonical list](https://x.com/ID_AA_Carmack/status/1622673143469858816)
- [27 项社区重建仓库](https://github.com/dzyim/ilya-sutskever-recommended-reading)

来源状态核对日期:2026-09-01.
