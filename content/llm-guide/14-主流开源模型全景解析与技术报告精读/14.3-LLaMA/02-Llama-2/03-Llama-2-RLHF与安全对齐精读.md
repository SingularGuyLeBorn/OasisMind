---
title: "03 · Llama-2 RLHF 与安全对齐精读"
date: 2026-08-30
status: completed
tags: [Llama-2, RLHF, PPO, 拒绝采样, GAtt, 安全对齐]
---

# Llama-2 RLHF 与安全对齐精读

>  **[返回 14.3-LLaMA 家族总览](../../14.3-LLaMA.md)**

> 本文档基于 D2 精译整理, 聚焦 RLHF 与安全, 不改六段提纲.
> 状态: completed.
> as_of: 2026-08-30
> 一手来源: [arXiv:2307.09288](https://arxiv.org/abs/2307.09288)

---

## 1 设计动机与核心洞察

人更擅长**比较**而不是**写完美答案**。Llama 2 轻 SFT（约 27,540 条）、重偏好（约 290 万对），RLHF 做成 **5 轮迭代**。有用性和安全性不可同尺度加和，故 **两个 RM + 分段奖励**。多轮忘系统消息，用 **Ghost Attention** 做数据侧记忆。架构见 [02-Llama-2核心架构剖析](./02-Llama-2核心架构剖析.md)。长笔记：[05-Llama-2-RLHF](./05-Llama-2-RLHF.md)。链 [4.4.1 PPO](../../../4-后训练/4.4-对齐技术/4.4.1-基于奖励模型的RL-RLHF-PPO/04-PPO.md)。

---

## 2 原理推导

### 2.1 Margin 排名损失

$$
\mathcal{L}=-\log\sigma\big(r_\theta(x,y_c)-r_\theta(x,y_r)-m(r)\big)
$$

$m(r)$ 随「显著更好 / 更好 / 稍好 / 几乎相同」增大。

### 2.2 分段奖励

$$
R_c(g\mid p)=\begin{cases}
R_s(g\mid p) & \text{is\_safety}(p)\ \text{或}\ R_s<0.15\\
R_h(g\mid p) & \text{否则}
\end{cases}
$$

0.15 对应精确率约 0.89、召回约 0.55：偏保守，后续过度拒绝与此一致。

### 2.3 PPO 的 KL

$$
R(g\mid p)=\tilde R_c(g\mid p)-\beta D_{\mathrm{KL}}(\pi_\theta\parallel\pi_0)
$$

7B/13B $\beta=0.01$，34B/70B $0.005$。RS 温度约 1.2–1.3，只在 70B 上做，小模型蒸馏其样本。

---

## 3 工程实现细节

- V1–V4 以拒绝采样为主，V4–V5 在 RS checkpoint 上 PPO。
- GAtt：每轮用户消息前贴指令，中间轮损失 mask，可撑 20+ 轮。
- Context Distillation：有系统提示采样，无系统提示微调到同一输出。
- 红队约 2000 对抗提示（论文 Section 4）。

---

## 4 与同类技术对比

| 维度 | InstructGPT | Llama 2-Chat | 后 2024（DPO 等） |
|------|------------|--------------|-------------------|
| RM | 单 | 双 | 常无显式 RM |
| 算法 | PPO | RS + PPO | 直接偏好 |
| 迭代 | 少 | 5 轮 | 视团队 |
| 多轮指令 | 弱 | GAtt | 系统层 / 记忆 |

---

## 5 局限性与风险

1. 召回 0.55 漏报；精确率导向造成无害拒答。
2. GAtt 是数据把戏，超长对话仍会漂。
3. 安全内化挡不住针对性 jailbreak。
4. 2023-07 报告；2026 对齐是后辈，本篇当史读。

---

## 6 知识库同步

- [01-Llama-2技术报告精译](./01-Llama-2技术报告精译.md)、[02-Llama-2核心架构剖析](./02-Llama-2核心架构剖析.md)、[05-Llama-2-RLHF](./05-Llama-2-RLHF.md)
- 第 5 章：[10-万字长文深入讲解Llama-1至Llama-3](../../../../5-主流模型全解/5.3-国外大模型/Meta-Llama/10-万字长文深入讲解Llama-1至Llama-3的技术细节与演进.md)
