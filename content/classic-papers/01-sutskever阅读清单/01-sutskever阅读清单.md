---
title: Sutskever–Carmack 阅读书目：证据与社区重建版
category: 索引
published: true
excerpt: 区分未公开的私人原始清单、27 项社区重建版本与本站主题学习路线，并提供逐项一手资料入口。
tags:
  - Ilya Sutskever
  - John Carmack
  - 阅读书目
  - 经典论文
  - 来源核验
---
# Sutskever–Carmack 阅读书目：证据与社区重建版

这页记录的是**证据状态和一个公开流传版本**，不是私人原始清单的复刻。

## 目前能确认到哪一步

John Carmack 在 2023 年公开采访中回忆：他曾向 Ilya Sutskever 索要阅读清单，得到“大约 40 篇研究论文”，并被告知如果真正学懂，就会知道当时约 90% 的重要内容。Carmack 后来又公开表示，他原本期待 Ilya 发布一份 canonical list。

这两条材料能支持“私人清单及 90% 说法确有 Carmack 本人的公开转述”，却不能还原私人原件。Ilya 没有公开确认下表的 27 项就是原清单，也没有公开确认其顺序。

| 层次 | 本库采用的表述 | 证据限制 |
|---|---|---|
| 私人原始清单 | Carmack 回忆收到过约 40 项材料 | 原件、完整条目和顺序未公开 |
| 社区重建版本 | `dzyim/ilya-sutskever-recommended-reading` 当前列出 27 项 | 仓库 README 自身也使用 “It is said that”；不能当作 Ilya 认证 |
| 本站学习路线 | 将 27 项按六个主题重新排序并逐篇精读 | 编号是本站教学设计，不是 Ilya 的编排意图 |

因此，下表中的“重建序号”只表示社区仓库的顺序；“本站路线”才对应本知识库的路径编号。其他网络版本多收或少收哪些材料，需要逐一说明来源，不能简单判作“自媒体加戏”。

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

重建版本把博客、课程、论文和教材交错列出，适合作为书目记录，却不一定适合第一次学习。本站将它们整理成六段依赖链：

1. 复杂度、信息论与智能；
2. CNN 与视觉基础；
3. RNN 与序列建模；
4. Attention 与 Transformer；
5. 结构、记忆与推理；
6. 训练、规模与生成。

这种重排是本站的教学判断。文章里出现的路线编号都应按这套坐标理解；如需核对社区版本位置，以本页“重建序号”列为准。

## 来源

- [John Carmack 访谈：私人清单约 40 项及“90%”回忆](https://dallasinnovates.com/exclusive-qa-john-carmacks-different-path-to-artificial-general-intelligence/)
- [John Carmack 公开帖：期待 Ilya 发布 canonical list](https://x.com/ID_AA_Carmack/status/1622673143469858816)
- [27 项社区重建仓库](https://github.com/dzyim/ilya-sutskever-recommended-reading)

来源状态核对日期：2026-09-01。
