---
title: 经典论文
description: 以原始论文和作者资料为依据的经典工作精读，包含 Sutskever–Carmack 社区重建书目与补充专题
---
# 经典论文 Classic Papers

这是一个按问题与知识依赖组织的经典工作精读库。当前主体来自一份与 Sutskever–Carmack 轶事相关的 **27 项社区重建书目**，另收 HiPPO、稀疏门控 MoE 等补充专题。

必须先说明证据边界：John Carmack 在公开采访中回忆，Ilya Sutskever 曾给他一份“大约 40 篇研究论文”的私人清单；Carmack 也曾公开期待 Ilya 发布一份 canonical list。该私人原件并未完整公开。因此，本库不把网络流传的 27 项版本称为“权威原始清单”，也不声称它保存了 Ilya 的精确顺序。

## 怎么读

1. 先读 [阅读指南](00-阅读指南/00-阅读指南.md)，分清私人原始清单、社区重建书目与本站学习路线。
2. 再看 [Sutskever–Carmack 阅读书目](01-sutskever阅读清单/01-sutskever阅读清单.md)，逐项核对社区版本与一手材料。
3. 按六个主题学习；章节编号只表示本站建议顺序，不代表 Ilya 的排序或编排意图。
4. 用 [补充经典](02-补充经典/02-补充经典.md) 连接状态空间模型与 MoE 等后续技术路线。

## 三套坐标不要混用

| 坐标 | 能确认什么 | 不能据此断言什么 |
|---|---|---|
| 私人原始清单 | Carmack 确认曾收到过一份材料清单 | 精确条目、篇数和原始顺序 |
| 社区重建书目 | 某个公开重建版本当前列出 27 项 | 它就是私人原件，或未收录项目都是错误版本 |
| 本站学习路线 | 本库按知识依赖组织的阅读次序 | Ilya 的作者意图或私人排序 |

## 本站主题学习路线

- `1.1` [复杂度、信息论与智能](01-sutskever阅读清单/1.1-复杂度信息论与智能/1.1-复杂度信息论与智能.md)：先建立“结构、随机性、描述长度”的语言。
- `1.2` [CNN 与视觉基础](01-sutskever阅读清单/1.2-cnn与视觉基础/1.2-cnn与视觉基础.md)：从 AlexNet 到残差网络与感受野。
- `1.3` [RNN 与序列建模](01-sutskever阅读清单/1.3-rnn与序列建模/1.3-rnn与序列建模.md)：现象、机制与正则化。
- `1.4` [Attention 与 Transformer](01-sutskever阅读清单/1.4-attention与transformer/1.4-attention与transformer.md)：从对齐机制到纯注意力架构与代码实现。
- `1.5` [结构、记忆与推理](01-sutskever阅读清单/1.5-结构记忆与推理/1.5-结构记忆与推理.md)：指针、集合、关系、图与外部记忆。
- `1.6` [训练、规模与生成](01-sutskever阅读清单/1.6-训练规模与生成/1.6-训练规模与生成.md)：描述长度正则、并行训练、端到端系统、规模律与生成表示。

## 补充经典

- `2.1` [状态空间模型](02-补充经典/2.1-状态空间模型/2.1-状态空间模型.md)：以 HiPPO 连接连续时间记忆与现代 SSM。
- `2.2` [混合专家模型](02-补充经典/2.2-混合专家模型/2.2-混合专家模型.md)：从稀疏门控 MoE 到 Switch Transformer。

## 证据入口

- [John Carmack 访谈](https://dallasinnovates.com/exclusive-qa-john-carmacks-different-path-to-artificial-general-intelligence/)：Carmack 对私人清单规模和“90%”说法的公开回忆。
- [John Carmack 公开帖](https://x.com/ID_AA_Carmack/status/1622673143469858816)：他期待 Ilya 公开 canonical list，也侧面说明流传书目并非已认证原件。
- [27 项社区重建仓库](https://github.com/dzyim/ilya-sutskever-recommended-reading)：只能作为该重建版本的来源说明。
