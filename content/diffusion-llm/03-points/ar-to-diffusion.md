---
title: "从自回归改编：DiffuLLaMA、Dream、LLaDA 2.0"
category: null
tags:
  - adaptation
  - DiffuLLaMA
  - Dream
  - LLaDA2
published: true
as_of: 2026-08-31
excerpt: "从头训扩散 LLM 贵。DiffuLLaMA 用不到 200B token 把 GPT-2 / LLaMA 改成扩散；Dream 加上移位对齐和按上下文重标定噪声；LLaDA 2.0 用块级 WSD 转到 100B；Fast-dLLM v2 把数据再收到约 1B。改编改的是注意力掩码和目标，不是另起一套词表。"
---
# 从自回归改编：DiffuLLaMA、Dream、LLaDA 2.0

LLaDA 8B 证明可以从噪声训到和 LLaMA3 同一张表。它没有证明每训一个扩散模型都应该付 13 万 H800 小时。开源 AR 权重已经把语言几何学进参数里。改编要解决的是两件结构冲突：因果掩码对双向去噪，以及「输入永远干净、预测下一个」对「输入是脏的、预测 $x_0$」。

## 1. 冲突在哪

AR：位置 $i$ 的隐状态 $h_i$ 用来预测 $x_{i+1}$，看不见右边。扩散：位置 $i$ 的隐状态通常用来还原 $x_i$ 自己，且要看见左右仍可见的 token。若直接把因果掩码撕掉、损失改成掩码交叉熵，作者观察到基座能力会掉光（DiffuLLaMA 文中引用的更早改编尝试）。

## 2. DiffuLLaMA：退火掩码 + 保持移位

Gong 等人（ICLR 2025，arXiv:2410.17891）做三件事。

把 AR 目标与吸收态扩散目标写成可以衔接的形式，连续时间极限仍是掩码位置上的加权交叉熵。

注意力掩码退火：训练过程中逐步把因果掩码放宽成双向，而不是第一步就全打开。

继承移位：损失仍按 $h_i$ 对 $x_{i+1}$ 算。扩散在「感知」上是还原信号，在「哪一格对齐哪一个词」上继续用 AR 已经学好的几何。Dream 后来把这叫 Shift Operation。

数据：不到 200B token，把 GPT-2（127M–355M）和 LLaMA2 7B 变成 DiffuGPT / DiffuLLaMA。能力上补了 infill（不必把填空改写成从左到右），速度上无条件生成 1024 token、256 步时与 AR 同级。这是「改编可行」的第一张 7B 成绩单，不是 2025 年最强开源 7B。

## 3. Dream：同一套移位，加上按上下文改噪声

Dream 7B（港大 NLP + 华为诺亚）在 DiffuLLaMA 配方上继续。AR 初始化加移位，使扩散训练不把 $h_i$ 的职责改去预测 $x_i$。第二件是 context-adaptive token-level noise：每个掩码位的有效噪声水平按「周围还有多少可信上下文」重标定，避免所有格子共用同一个 $t$。损失仍是吸收态加权交叉熵。发布 Base 与 Instruct。作者宣称通用、数学、代码上对得过同代 Qwen2.5 量级，并强调任意顺序、填空、步数换质量。具体分数以论文图 1 与表为准，本篇不抄未打开的细表。

Dream 的继续预训练量级，Fast-dLLM v2 写成约 580B token，用来对照自己的 1B。两个数字不在同一篇论文里时，引用时写清出处。

## 4. LLaDA 2.0：块大小当课程

2.0 不从 GPT-2 起步，从 Ling-mini / Ling-flash 的 AR MoE 起步，把 AR 看成 $B=1$ 的块扩散。WSD：warmup 加大块，stable 全序列，decay 收回部署块。这是改编与块扩散的乘积。100B 的知识主体仍是 AR 阶段，扩散阶段改生成过程。数字见 LLaDA 专文。

## 5. Fast-dLLM v2：数据再降两数量级

约 1B token 微调，块扩散 + 互补注意力掩码，分层缓存。相对 Dream 那种数百 B 的全注意力改编，卖点是「接上现有 AR、接上 KV、接上吞吐」，不是填空能力拉满。块扩散篇写过对照表。

## 6. 失效

退火太快：双向一上来，AR 特征塌。移位不加：每层隐状态的「预测对象」错位，继续预训练要重新学位置几何。只改 mask 不改目标：模型仍在做 next-token，测试时按扩散采样会分布外。改编预算过小又想全双向 32k：2.0 用文档边界切断注意力，就是在防打包作弊；小预算改编更容易学到这种捷径。

读完应能把四条工作放进同一句话：DiffuLLaMA 证明 7B 改得动；Dream 把移位和噪声日程做细；2.0 把块当课程接到 100B；v2 把 token 预算收到约 1B。没有一条改了 $Q_t$ 的吸收态定义。

## 参考文献

- [Gong et al., DiffuLLaMA, ICLR 2025](https://arxiv.org/abs/2410.17891) — <200B token；掩码退火；移位。
- [Ye et al., Dream 7B, 2025](https://arxiv.org/abs/2508.15487) — AR 初始化与上下文自适应噪声。
- [Bie et al., LLaDA 2.0, 2025](https://arxiv.org/abs/2512.15745) — 块级 WSD。
- [Wu et al., Fast-dLLM v2, 2025](https://arxiv.org/abs/2509.26328) — ~1B token；对照 Dream ~580B。

## 相关

- [块扩散](./block-diffusion.md)
- [Dream / Mercury / Seed](../03-models/dream-mercury-seed.md)
- [LLaDA 专文](../03-models/llada-frontier.md)
