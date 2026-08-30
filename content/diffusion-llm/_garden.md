---
title: Diffusion LLM · 扩散语言模型
description: 写给已有自回归 LLM 基础、还没系统学过扩散大模型的人。原理、知识点、代表模型、和 AR 的对照。数字以论文表为准。
---
# Diffusion LLM · 扩散语言模型

读者假定会 next-token prediction、causal mask、KV Cache。本花园不从头讲 Transformer。目标是把「token 上的扩散」讲到能独立读论文，而不是把图像扩散的名词搬过来。

旧版五篇短文里有几处已按一手论文改过：MDLM 是 NeurIPS 2024 / arXiv:2406.07524，不是 ICML 2023；LLaDA 8B Base 的 MMLU / GSM8K 以 [LLaDA](https://arxiv.org/abs/2502.09992) Table 1 为准；「LLaDA 8B 推理快 2–8 倍」在原论文里找不到，已删。

## 怎么读

按编号走。每一层解决一个问题，不要跳着只记模型名。

| 层 | 读完应能回答 |
|---|---|
| 01 动机 | 自回归因式分解把什么写进了结构里，扩散换掉的是哪一步 |
| 02 机制 | $Q_t$、吸收态、ELBO 为何长得像加权 MLM、采样时如何揭开 / remask |
| 03 知识点 | 块扩散、AR 改编、缓存与并行解码、引导、对齐、失效模式 |
| 04 模型 | 从 D3PM 到 LLaDA 2.0 / Dream / Mercury 各自钉住哪件事 |
| 05 对照 | 十个维度里哪些是机制必然，哪些只是 2026 年的工程现状 |

🟢 **01 动机**

1. [为什么用扩散做语言生成](./01-overview/why-diffusion.md)  
   AR 的串行解码、反转诅咒、约束难注入；连续路线 vs 离散路线；2025 年以后能看的数字。两张总览图。先读这篇。

🟡 **02 机制**（离散噪声怎么定义、怎么训、怎么采）

2. [从图像扩散到离散 token](./02-mechanism/from-image-diffusion.md)  
   只保留读懂语言扩散所需的 DDPM 直觉：前向、反向、ELBO、步数旋钮。不讲 U-Net。

3. [离散扩散：转移矩阵在干什么](./02-mechanism/discrete-diffusion.md)  
   D3PM 的 $Q_t$：均匀、吸收态、离散化高斯。BERT 为何是单步扩散。

4. [掩码扩散：加权 MLM 为什么能当生成模型](./02-mechanism/masked-diffusion.md)  
   吸收态 + $1/t$ 交叉熵；和 BERT 差在日程；SFT 只掩回答。含 MaskedDiffusion 动画。

5. [采样与调度：揭开、重掩、步数](./02-mechanism/sampling.md)  
   低置信 remask、纯扩散 / AR / 块三种解码器；步数与并行诅咒。

🟠 **03 知识点**（机制之后仍容易混的几刀）

6. [块扩散：AR 与扩散之间的旋钮](./03-points/block-diffusion.md)  
   BD3-LM；可变长与真 KV Cache；$B=1$ 仍不等于训好的 AR。

7. [从自回归改编](./03-points/ar-to-diffusion.md)  
   DiffuLLaMA / Dream / LLaDA 2.0 / Fast-dLLM v2。

8. [双向注意力与反转诅咒](./03-points/bidirectional-attention.md)  
   Berglund 的 0% 反向；LLaDA 诗句表正向 48.8 / 反向 42.4，GPT-4o 为 82.7 / 34.3。

9. [推理加速：近似缓存与并行揭开](./03-points/inference-acceleration.md)  
   Fast-dLLM DualCache、dKV-Cache、CAP。27.6× 的对照物是原版 LLaDA，不是 AR。

10. [可控生成与引导](./03-points/controllable-generation.md)  
    Diffusion-LM 连续梯度；离散 D-CFG；8B 实际在用的掩码与定长。

11. [对齐与强化学习](./03-points/alignment-rl.md)  
    VRPO / LLaDA 1.5；d1 / diffu-GRPO。原版 Instruct 没有 RL。

12. [失效模式](./03-points/failure-modes.md)  
    定长与 EOS、并行搭配、PPL 不可比、近似缓存过期。

🔴 **04 模型**

13. [代表性扩散语言模型一览](./03-models/representative-models.md)
14. [LLaDA：8B 从头训到 100B 改编](./03-models/llada-frontier.md)
15. [Dream、Mercury、Gemini Diffusion、Seed](./03-models/dream-mercury-seed.md)

⚖️ **05 对照**

16. [扩散 vs 自回归](./04-comparison/diffusion-vs-autoregressive.md)  
   含 ArVsDiffusion 动画。对照数字已按论文表重校。知识点专文写完后，十个维度应对到 03。

动画源码在 `apps/algo-viz/src/compositions/`，预览：

```bash
pnpm --filter @oasismind/algo-viz dev
```

## 知识体系（一张图的文字版）

```text
P(x) 怎么因式分解
        │
        ├─ 自回归：∏ P(x_i | x_<i)     ← 本库 llm-guide 第 2 章
        └─ 扩散：正向腐蚀 + 反向去噪
                │
                ├─ 连续：嵌入空间 + 高斯     Diffusion-LM
                └─ 离散：词表上的 Q_t
                        │
                        ├─ 均匀跳转
                        ├─ 吸收态 [MASK]  ← 2024 后主流
                        │       ├─ 训练：加权 MLM（MDLM / LLaDA）
                        │       ├─ 采样：置信度揭开 / remask
                        │       └─ 变体：块扩散（块间 AR，块内扩散）
                        └─ score entropy（SEDD）等非掩码目标
```

llm-guide 第 2.4.7 只保留指针，不把本花园抄过去。

## 状态

- 创建：2025-07-29
- 重写起笔：2026-08-31（`feat/diffusion-llm`）
- 维护：按篇提交，不堆未提交正文
