---
title: "Explorative Modeling：预训练第三轴「探索次数 K」"
category: "生成模型 · 预训练"
published: true
excerpt: "Explorative Modeling（UIUC Alexi Gladstone + Heng Ji、Harvard Yilun Du，arXiv:2607.27372）：每步采样 K 个候选、只对最接近数据的那个反传，把 generative expressivity 变为可扩展第三轴；K=1 即 baseline，--xm_best_of_k K 即实现。"
tags: ["Explorative Modeling", "预训练", "best-of-K", "UIUC", "Harvard"]
---
# Explorative Modeling：预训练第三轴「探索次数 K」

> **论文**：*Explorative Modeling: Unlocking a Third Pretraining Axis and End-to-End Generation*（Alexi Gladstone, Heng Ji, Yilun Du 等，**arXiv:2607.27372**，2026-07）
> **代码**：[alexiglad/XM](https://github.com/alexiglad/XM)（`--xm_best_of_k K`，K=1 为无探索 baseline）
> **注**：用户素材曾未标注 arXiv ID；现已核实为 **2607.27372**

## 原文精读

传统生成模型 scaling 两轴：**参数量**、**数据量**。第三轴 **generative expressivity**（一次训练步能「承诺」多 distinct 的模式）长期被忽视——多模态分布若只靠 factorized generation procedure（扩散多步、自回归 teacher forcing），训练与推理 sampling **不对齐**，且 expressivity 在架构设计时即冻结。

**Explorative Modeling（XM）** 改 factor **训练循环**：每步生成 **K** 个候选匹配，**只对 loss 最低的那个反传**，使预测 commit to single mode 而非 blur 平均。

两种用法：

1. **加在现有模型上**：scaling K 在图像/视频/语言上单调增益；随数据 scale 增益 7%→36%，随参数 13%→23%；FLOP 效率 ~4.1×、样本效率 ~6.2×、参数效率 +47%；ImageNet FID 1.43（无 guidance）。
2. **端到端 reconstructive 生成**：控制任务上匹配 diffusion，推理步数少 **16–256×**。

**Forward XM**：固定数据 x，探索 K 次 `y = model(sample_latent())`，选 recon_loss 最小者 backward。**Reverse XM**：固定生成，在 K 个数据目标中搜最佳（论文 §3.2）。

## 方法/架构解析

```python
losses = []
for _ in range(K):
    y = model(sample_latent())
    losses.append(recon_loss(y, x))
min(losses).backward()  # 只训练最接近数据的候选
```

与 Agent 语境的 loose 类比：XM 是 **训练时的 best-of-K search**；ReOPD 是 **蒸馏时的 prefix 分布设计**；RSIBench agent 是 **数据尝试上的 heuristic search**——三者都在解决「单条轨迹不够表达多模态/improvement 空间」。

对 LLM 预训练/engineering 启示：探索轴可在**不改架构**下用 compute 换 expressivity；是否适用于 tool-agent RL 仍是开放问题。

### Reverse XM 与 Forward XM

- **Forward XM**：固定 ground-truth 数据点，在 latent/noise 上采样 K 次生成，选 recon 最优。
- **Reverse XM**：固定一次生成，在 K 个数据候选（或 augmentation）里选最匹配——适合某些 control / inverse 问题。

仓库 `alexiglad/XM` 用 `--xm_best_of_k K` 开关；K>1 时训练 compute 近似线性涨，但论文报告 FLOP-efficiency 仍净赢，因 sample/param efficiency 大幅提升。

### 与 diffusion「多步因子分解」的对比

扩散把 multimodality 交给 **1000 步去噪链**；XM 把 expressivity 交给 **训练循环内 K 次试探**。后者让 inference 步数可远小于扩散（论文报告 16–256×），但训练 step 更贵——适合 inference-bound 或 edge 部署场景。

对 LLM 读者的 takeaway：XM 证明「训练时多试几次再反传」可以是与加数据、加参数同级的旋钮；与 Agent 里 pass@k、best-of-N tool plan 在**算法精神**上相近，但是否直接用于 RLHF/GRPO 尚无系统研究。跟进时可读 BLENDER Lab 博客与 `alexiglad/XM` 的 ImageNet / MDLM 实验脚本。

## 补充

Explorative Modeling 给预训练从业者一条「不加数据不加参数、加 K」的试验路径；Harvard/UIUC 作者在图像、视频、语言、机器人策略上报告一致增益，说明 phenomenon 跨模态。 arXiv **2607.27372** 已核实。对 Agent 训练的直接应用仍属推测，但 best-of-K 思想与 test-time compute、pass@k 讨论可对照阅读。实现上仅需训练循环外包一层采样循环，适合作为现有 diffusion/flow 训练脚本的 ablation 开关。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../../essays/oasis-improvements-2026-08-harness-wave.md)。
