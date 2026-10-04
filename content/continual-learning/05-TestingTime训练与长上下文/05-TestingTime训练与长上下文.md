---
title: "05 · TestingTime 训练与长上下文"
category: "持续学习"
published: true
excerpt: "把推理阶段的梯度更新写进序列模型本身: TTT layer 的隐状态是一个小模型的权重, LaCT 把更新块放大到上千 token, TTT-E2E 直接在 Transformer 的 MLP 上做下一个 token 预测的梯度步. 以及它们和线性注意力, SSM, RWKV, Titans 的边界."
tags: ["continual-learning", "test-time-training", "long-context", "fast-weights", "learning-path"]
---
# 05 · TestingTime 训练与长上下文

第 4 章的推理阶段更新面对的是分布偏移, 每个样本是一张图. 这一章面对的是长上下文: 输入是一条上万到上百万 token 的序列, 模型要一边读一边把前文压进一个固定大小的状态. TTT 这一支的做法是让状态本身是一个模型的权重, 让「读一段上下文」等于「在这段上下文上训练几步」.

这些方法里的学习只发生在一条序列内 (TTT-E2E 称之为序列内的持续学习), 序列结束状态就丢弃, 下一条序列从同一个初始化开始. 所以第 4 章的误差积累和跨样本遗忘在这里不出现, 跨请求的积累也同样不存在.

## 本章结构

- [5.1 TTT layers 与 fast weights](./5.1-TTT-layers与fast-weights.md): 隐状态是模型权重, 更新是一步自监督梯度; 从更新规则推到 delta rule 和线性注意力; mini-batch TTT 与 dual form; 125M 到 1.3B 的实验; fast weights 的来历.
- [5.2 LaCT 与 TTT-E2E](./5.2-LaCT与TTT-E2E.md): LaCT 用大块更新解决硬件利用率; TTT-E2E 在滑动窗口 Transformer 的后 1/4 块 MLP 上做下一个 token 预测的梯度步, 训练阶段元学习初始化; 两者在 S-NIAH 和训练成本上的边界.
- [5.3 与 attention, SSM, RWKV, Titans 的边界](./5.3-与attention-SSM-RWKV-Titans的边界.md): 按状态, 写入规则, 读出规则和生命周期, 把全注意力, 滑动窗口, 线性注意力, Mamba, DeltaNet, Gated DeltaNet, RWKV-7, Titans 和 TTT 系列放进一张表.

## 读法

按 5.1, 5.2, 5.3 的顺序读, 5.1 的式子在后两篇反复用到. 已经熟悉线性注意力和 DeltaNet 的读者可以先读 5.3 建立坐标, 再回 5.1 看 TTT 在这个坐标里的位置. 只关心长上下文结果的读者, 5.2 的「needle-in-a-haystack」和「延迟」两节给出了 TTT-E2E 能做到和做不到的边界.

TestingTime 适应的前一章见 [04 · TestingTime 适应](../04-TestingTime适应/04-TestingTime适应.md).
