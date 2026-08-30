---
title: "03 · Gated Residual：四分支残差上的逐元素读门"
date: 2026-08-30
as_of: 2026-08-30
tags: [Gated-Residual, Hyper-Connections, mHC, Qwen3.8]
---

# Gated Residual：单流残差被冲淡之后，把容量花在「怎么读」上

> 邻居：[01-HC 与 mHC](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md) · [02-xHC](../02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md) · [2.1.3 残差](../2.1.3-残差连接.md) · 不要和 [AttnRes](../../../2.2-基础注意力机制/2.2.2-多头注意力变体/Kimi-Attention-Residuals-深度维注意力聚合.md) 混成一个机制 · 模型捆：[Qwen3.8-Flash-Next](../../../../14-主流开源模型全景解析与技术报告精读/14.2-Qwen/13-Qwen3.8-Flash-Next/01-Qwen3.8-Flash-Next-架构精译.md)

Pre-Norm Transformer 里每一层都从**同一条**残差流读、再写回去。层一深，早期写进去的特征要和后面所有写入抢位置，信号被冲淡。加宽残差流（多条并行分支）能给早期特征留专用通道；问题变成：加宽之后，读/写还要不要再套一套像 Hyper-Connections 那样的 $n_r\times n_r$ 混合矩阵。

Qwen3.8-Flash-Next 的答案叫 **Gated Residual (GR)**：流加宽到 $n_r=4$，读用逐元素、数据依赖的 sigmoid 门，写用每分支一个标量，**丢掉混合算子 $H_{\mathrm{res}}$**。公式与消融来自技术报告 *On the Design of Qwen3.8-Next Architecture*（2026-08-26）§2.2。

## 1. 加宽本身就值钱

报告先用简化 AltUp：块前状态是 $n_r$ 条分支 $R^{(\ell)}\in\mathbb{R}^{n_r\times d}$。每块只有 $n_r$ 个可学标量 $h$，读

$$
x^{(\ell)}=\sum_{i=1}^{n_r} h_i R^{(\ell)}_i, \tag{21}
$$

写回按深度 round-robin 只更新一条分支。几乎不加矩阵乘。25B-A3B、400B token 上训练损失大约降 **0.01**。所以「变宽」不是装饰。

## 2. HC 的三个算子，GR 只留两个

Hyper-Connections 把读/写/混合写成三个可预测算子（报告式 (23)–(28)）：$H_{\mathrm{mix}}$ 读、$H_{\mathrm{combine}}$ 写、$H_{\mathrm{res}}\in\mathbb{R}^{n_r\times n_r}$ 在分支之间交换。mHC 再把 $H_{\mathrm{res}}$ 卡在双随机流形上，细节见 [01 文](../01-Hyper-Connections与mHC/01-Hyper-Connections与mHC.md)，这里不重推。

25B-A3B、560B token、同一套评测（报告 Table 5，$n_r=4$）：

| 残差 | Loss | 九项 Avg |
|------|------|----------|
| Pre-norm | 1.617 | 50.91 |
| mHC static | 1.596 | 52.49 |
| mHC dynamic | 1.594 | 54.47 |
| **GR** | **1.590** | **54.66** |

静态加宽已经值 **1.58** 平均分；再让读/写数据依赖又加 **1.98**。Loss 从 static 到 dynamic 只动 **0.002**，下游分却动得更大——报告特意写：只看 loss 会低估动态读/写。

消融里定下来的几条：

- 门用 **sigmoid** 比 tanh 稳（和 mHC、和他们 GDN 输出门的经验一致）。
- 读做成 **逐通道** 有用；写做成逐通道几乎没用，保持每分支一个标量。
- 用**全部**分支预测门，比只用最后一条或先 pooling 好；每条分支单独 RMSNorm（group RMSNorm）再加一点。
- 读/写够表达之后，再加 $H_{\mathrm{res}}$ **没有显著收益**。

## 3. GR 的读和写

报告把逐元素读门和他们另文里的 **GatedNorm** 合成一个算子。GatedNorm 是 RMSNorm 后接低秩自门：

$$
\mathrm{GatedNorm}(u)=\mathrm{RMSNorm}(u)\odot\sigma\bigl(W_2\,\mathrm{SiLU}(W_1\,\mathrm{RMSNorm}(u))\bigr). \tag{29}
$$

GR 先对每条分支独立 RMSNorm（各自增益 $\gamma_i$），再从所有分支预测 $n_r\times d$ 的门 $G$，平均成块输入（瓶颈秩 $r=d/8$）：

$$
\tilde R_i=\mathrm{RMSNorm}(R_i;\gamma_i),\qquad
G=\mathrm{unvec}\,\sigma\bigl(W_u\,\mathrm{SiLU}(\tfrac1{n_r} W_d\,\mathrm{vec}(\tilde R))\bigr),
$$

$$
x=\frac1{n_r}\sum_{i=1}^{n_r} G_i\odot \tilde R_i. \tag{30--32}
$$

块输出 $y=F(x)$ 用每分支一个数据依赖标量写回**每一条**（不是 round-robin 只写一条）：

$$
s=2\sigma\bigl(\tfrac1{n_r} W_w\,\mathrm{vec}(\tilde R)\bigr)\in\mathbb{R}^{n_r},\qquad
R'_i=R_i+s_i y. \tag{33--34}
$$

没有静态偏置项 $H^s_\star$：报告说当前配置下随机初始化就够。注意力子层和 MLP 子层各用一套 GR。残差状态可以 **FP8** 存，减访存。Muon 管 2D 线性层；GR 的低秩门、Embedding、Router 仍走 **AdamW**（报告优化器分工，见 [MuonClip 文](../../../../6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md)）。

```mermaid
flowchart LR
  R["四条残差分支 R"] --> N["逐分支 RMSNorm"]
  N --> G["低秩 sigmoid 门 G"]
  G --> x["逐元素加权平均 → x"]
  x --> F["Attention 或 MLP"]
  F --> W["每分支标量 s_i"]
  W --> Rp["R'_i = R_i + s_i y"]
```

## 4. 和 mHC / xHC / AttnRes 的边界

| | 加宽 $N$ | 读 | 分支混合 $H_{\mathrm{res}}$ |
|--|----------|----|------------------------------|
| HC / mHC | 有（mHC 常 $N=4$） | 每分支标量 | 有；mHC 流形约束 |
| xHC | $N$ 可到 16，稀写 | 密读 | 见 02 文 |
| **GR** | $n_r=4$ | **逐元素门** | **没有** |
| AttnRes | 不靠加宽流 | 对**历史层**做 softmax | 深度维注意力，不是残差条数 |

丢掉 $H_{\mathrm{res}}$ 少一次整段残差状态的读，这是 serving 访存上的收益；也不再需要双随机约束那套稳定性补丁。GR **替换**块前的 Pre-Norm，不再叠一层 Norm。

同一份报告 Table 6 还把 GR 和 AttnRes 放在一张小表上对照（28 层 + GatedNorm）：Full AttnRes 与 GR 的 loss 都在 1.76 附近。那是残差设计消融，**不是**说 Qwen3.8 用了 AttnRes。AttnRes 本体仍在第 2.2。

## 5. 失效条件

- 把 GR 写成「就是 mHC」。读的粒度不同，而且没有 $H_{\mathrm{res}}$。
- 把四分支 GR 和 HCA（注意力压缩）混名。
- 用记忆补 $W_d$ 的具体形状而不指回报告式 (31)。
- 把 Table 5 的 25B-A3B 消融数字当成 125B 旗舰的线上分。

## 本篇来源

- Qwen Team, *On the Design of Qwen3.8-Next Architecture*（2026-08-26），本会话用 PyMuPDF 抽取 §2.2 式 (21)–(34)、Table 5–6
- 官方博文镜像：https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501
- GitHub：https://github.com/QwenLM/Qwen3.8-Flash-Next
- 前作：HC arXiv:2409.19606；mHC 见同目录 01 文
