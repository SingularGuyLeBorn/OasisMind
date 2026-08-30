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
| 03 知识点 | 块扩散、任意顺序、规划器、提交后能否改、改编、SDAR、D2F、ReFusion、缓存、SlowFast、APD/SSD、ParallelBench、serving、Eso-LM、少步蒸馏、伪轨迹/AUP、引导、对齐、代码向、离散流、score entropy、失效 |
| 04 模型 | 从 D3PM 到 LLaDA 2.0 / MoE / Dream / Mercury 各自钉住哪件事；多模态三条接法 |
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

7. [任意顺序：掩码扩散和自回归差在哪一种连乘](./03-points/any-order.md)  
   $1/t$ 损失是对所有生成顺序求期望；左到右只是一种排列。RADD / MD4。

8. [谁决定揭开哪一格](./03-points/plan-denoise.md)  
   低置信 remask 是冻结规划器。DDPD 另训脏净头；LoMDM 把顺序写进训练。8B 主表没有学顺序。

9. [提交之后还能不能改](./03-points/remask-revise.md)  
   低置信 remask 只盖本步预测。ReMDM 改反向后验，OWT MAUVE 0.656 对 MDLM 0.035；LLaDA Countdown 45.2→46.1。GIDD 训练见乱词才会自纠正。

10. [从自回归改编](./03-points/ar-to-diffusion.md)  
    DiffuLLaMA / Dream / LLaDA 2.0 / Fast-dLLM v2。

11. [SDAR：先把 AR 训满，再改成块扩散](./03-points/sdar.md)  
    不移位、不退火；2B 同数据 MATH 29.9 对 12.6；ChemBench 72.8 对同数据 AR 60.5。6600 TGS 是 H200 大 batch。

12. [D2F：脏前缀上接着写下一块](./03-points/d2f.md)  
    teacher forcing 推不出多块流水线。52.9× 在 MBPP（0.9→47.6 TPS）。2.5× 对 AR 是 Dream 119.9 对 LLaMA3 48.0，最大长度 512。

13. [ReFusion：槽级规划，槽内自回归](./03-points/refusion.md)  
    槽间任意顺序、槽内从左到右；因果注意力加原位置 RoPE。18× 对照 LLaDA / Dream 原版吞吐，不是 Qwen3。2.33× 是相对 Qwen3-8B 的逐任务 TPS 均值。单卡 A100。

14. [双向注意力与反转诅咒](./03-points/bidirectional-attention.md)  
    Berglund 的 0% 反向；LLaDA 诗句表正向 48.8 / 反向 42.4，GPT-4o 为 82.7 / 34.3。

15. [推理加速：近似缓存与并行揭开](./03-points/inference-acceleration.md)  
    Fast-dLLM DualCache、dKV-Cache、CAP。27.6× 的对照物是原版 LLaDA，不是 AR。

16. [SlowFast：慢探索，快揭开](./03-points/slowfast.md)  
    训练免费动态采样。15.63× 在 GPQA、长度 1024：1.60→25.00 TPS。叠缓存 34.22× 到 54.75，分掉到 28.79。GSM8K Table 1 只是 3.20×。RTX 4090。

17. [APD：倒置投机，小 AR 管联合](./03-points/apd.md)  
    Dream 边际草稿 × Qwen 0.5B 联合。有损。SSD 3.46× 在 MBPP，均值 2.43×。

18. [ParallelBench：GSM8K 测不出并行诅咒](./03-points/parallelbench.md)  
    一步 KL 下界是 $\mathcal{C}(Y|X)$。Shuffle 即使每步 2 token 也随 $n$ 趋向 0。微调修不好 $\mathcal{C}>0$。

19. [Serving：vLLM 的调度器接不上扩散](./03-points/serving.md)  
    dInfer 四块。8×H800、batch 1：680 TPS 对 Fast-dLLM 63、对 vLLM 上 Qwen2.5-3B 277。1100 是 TD 的 HumanEval 列。

20. [Eso-LM：任意顺序损失，因果注意力换精确 KV](./03-points/eso-lm.md)  
    洗牌 + 原位置 RoPE。65× 对照无缓存 MDLM。不是 LLaDA 8B。

21. [少步蒸馏：把老师的 1024 步塞进学生的几十步](./03-points/few-step-distill.md)  
    SDTT；32 步约 4× 于带 KV 的 GPT-2。863M 质量，不要抄到 8B。

22. [d3LLM：伪轨迹蒸馏与 AUP](./03-points/d3llm.md)  
    顺序来自老师、字来自标准答。GSM8K-CoT 单卡 H100：288.9 TPS 对原版 27.9 约 10.3×。AUP 切掉掉分超过 5 点的工作点。

23. [可控生成与引导](./03-points/controllable-generation.md)  
    Diffusion-LM 连续梯度；离散 D-CFG；8B 实际在用的掩码与定长。

24. [对齐与强化学习](./03-points/alignment-rl.md)  
    VRPO / LLaDA 1.5；d1 / diffu-GRPO。原版 Instruct 没有 RL。

25. [代码向扩散：DiffuCoder、AR-ness 与 coupled-GRPO](./03-points/code-dllm.md)  
    7B 代码专料约 130B；Table 1–2；互补掩码估对数概率。不要和 Nie 的 35.4 横减。

26. [离散流匹配：概率路径比 Q_t 更宽的那一族](./03-points/discrete-flow.md)  
    DFM；吸收态 $1/t$ 是一条路径。1.7B HumanEval Pass@1 为 6.7%。

27. [Score entropy：离散扩散在估比率](./03-points/score-entropy.md)  
    concrete score；$25\%{-}75\%$ 对照先前离散扩散。1BW 上界 $\leq 32.79$ 对 AR 31.98。不是 LLaDA 的损失。

28. [失效模式](./03-points/failure-modes.md)  
    定长与 EOS、并行搭配、PPL 不可比、近似缓存过期。

🔴 **04 模型**

29. [代表性扩散语言模型一览](./03-models/representative-models.md)
30. [LLaDA：8B 从头训到 100B 改编](./03-models/llada-frontier.md)
31. [LLaDA-MoE：从头训的稀疏掩码扩散](./03-models/llada-moe.md)
32. [Dream、Mercury、Gemini Diffusion、Seed](./03-models/dream-mercury-seed.md)
33. [多模态扩散：LLaDA-V、MMaDA、Dimple](./03-models/multimodal-dllm.md)

⚖️ **05 对照**

34. [扩散 vs 自回归](./04-comparison/diffusion-vs-autoregressive.md)  
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
                        │       ├─ 训练：加权 MLM（MDLM / LLaDA）= 对任意顺序求期望
                        │       ├─ 采样：置信度揭开 / 本步低置信 remask（冻结规划器）；DDPD 另训脏净头
                        │       ├─ 纠错：已提交再 MASK（ReMDM 套预训练权重）；训练见乱词（GIDD）；Seed 改前向后 20%
                        │       ├─ 变体：块扩散（块间 AR，块内扩散）；SDAR 先付 AR 再转，不移位
                        │       ├─ D2F：训练见脏前缀；52.9× 在 MBPP 原版 0.9 TPS；2.5× 是 Dream 119.9 对 LLaMA3 48.0
                        │       ├─ ReFusion：槽间任意、槽内 AR；18× 对照原版 LLaDA/Dream TPS，2.33× 对照 Qwen3-8B 逐任务均值
                        │       ├─ 注意力：全双向无精确 KV；Eso-LM 洗牌+因果换精确 KV
                        │       ├─ 采样器：SlowFast 慢探快揭；15.63× 在 GPQA 长度 1024（1.60→25.00），不是 GSM8K 的 3.20×
                        │       ├─ 验证并行：APD 小 AR 管联合（有损）；SSD 自验证（无损，3.46× 在 MBPP）
                        │       ├─ 评测轴：ParallelBench；C(Y|X)=0 可并行；Shuffle 的 C 发散，GSM8K 测不出
                        │       ├─ serving：dInfer 四块；10× 对照同节点 Fast-dLLM 63.61，2.5× 对照 vLLM Qwen2.5-3B
                        │       ├─ 少步：SDTT / FS-DFM 蒸老师多步；d3LLM 伪轨迹+AUP，10.3× 对照 HF 上原版 LLaDA
                        │       ├─ 稀疏：LLaDA-MoE 从零 20T，激活 1.4B，损失仍是 1/t
                        │       ├─ 代码向：DiffuCoder + coupled-GRPO
                        │       └─ 多模态：视觉塔+投影 / 图也离散化
                        ├─ 离散流匹配 DFM：先定路径 p_t，吸收态是其中一条
                        └─ score entropy（SEDD）：估 p_t(y)/p_t(x)；25%–75% 对照先前离散扩散，不是 GPT-2
```

llm-guide 第 2.4.7 只保留指针，不把本花园抄过去。

## 状态

- 创建：2025-07-29
- 重写起笔：2026-08-31（`feat/diffusion-llm`）
- 维护：按篇提交，不堆未提交正文
