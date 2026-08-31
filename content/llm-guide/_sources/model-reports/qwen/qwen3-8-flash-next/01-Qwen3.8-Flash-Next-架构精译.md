---
title: "01 · Qwen3.8-Flash-Next：Qwen4 架构预览"
date: 2026-08-30
as_of: 2026-08-30
tags: [Qwen3.8-Flash-Next, QSA, Gated-Residual, Muon, MoE]
---

# Qwen3.8-Flash-Next：下一代架构的早鸟预览

>  **[返回 14.2-Qwen](../../../../_archive/model-knowledge/qwen/legacy-ch14/14.2-Qwen.md)** · 前代目录：[Qwen3.7](../qwen3-7/01-Qwen3.7技术报告精译.md) · [QSA](../../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/08-QSA-Qwen稀疏注意力/08-QSA-Qwen稀疏注意力.md) · [GR](../../../../2-核心原理与架构/2.1-深度学习基础组件/2.1.3-残差连接/03-Gated-Residual/03-Gated-Residual.md) · [Muon](../../../../6-训练与推理优化/6.5-优化器/Muon/05-MuonClip与PolarExpress.md) · [KDA/GDN 对照](../../../../2-核心原理与架构/2.3-高效与稀疏注意力/2.3.3-线性注意力机制/01-Kimi-Delta-Attention-KDA/01-Kimi-Delta-Attention-KDA.md)

权重 2026-08-26 开源。官方把它写成 **Qwen4 架构的早鸟预览**，角色类似当年 Qwen3-Next 之于 3.5。云上生产档 `qwen3.8-flash`（默认 1M、内置工具）是云上产品名，这里不另开目录。

有 28 页技术报告。数字以报告为准。

## 1. 这一次捆了哪些技术

| 面 | 这次用了什么 | 详见 |
|----|----------------|------|
| 结构 | 3 GDN : 1 全局；CPT 后全局→**QSA**；残差 **GR** $n_r=4$；一层 **N-gram Embedding** +51B | QSA / GR 专文 |
| 架构 | 125B 总 / **6B 活跃** / 另 51B n-gram 不常驻加速器；超稀疏 MoE + 共享专家；MTP 也换 QSA | 下文 |
| 数据 | 报告写相对 397B-A17B 前任，token 大约 1/3、FLOPs 大约 1/9；配比表未在本篇展开 | 以报告 Tab. 11 为准 |
| 优化器 | **Muon** 管 Attention/GDN/专家 2D 线性；Embedding / Router / GR 低秩走 **AdamW**；融合 QKV/SwiGLU/GDN 先拆再正交化 | 6.5 |
| Infra | FlashQLA 训 GDN；fused QSA kernel；serving 建议 SGLang / vLLM，上下文示例 262144 | 9.4 |
| 稳定性 | 零中心 RMSNorm；注意力输出门；归一化 MoE router；GR/GatedNorm；更大 lr 与 batch；**不再做 batch-size warmup**（省约 18.8% step） | 报告 § 优化与稳定性 |
| 训推 | MTP 多步、训练/推理一致以提高投机接受率；MTP 复用 QSA top-k | QSA 文 |

原生上下文 **262,144**，YaRN 可扩到 **1,000,000**（博文）。

## 2. 相对 Qwen3.7-Plus 的产品句

博文：训练成本大约 **1/9**，编码和办公任务更强。报告摘要：十四项预训练基准上赢前任八项，其余最多落后 2.6 分，激活参数约 1/3。问题在于，「1/9 FLOPs」和「1/9 墙钟」不是同一个数。

N-gram：按当前 token 加前面若干 token 查表，可预先算地址，表放 Host，和计算异步 prefetch。只在网络靠前放 **一层**。查表参数不进入每 token 矩阵乘预算。

## 3. 公式落在哪

- QSA 块因果 indexer、两阶段蒸馏：专文式 (12)–(20)
- GR 读门/写标量、为何丢掉 $H_{\mathrm{res}}$：专文式 (29)–(34)
- GDN 头级 $\alpha_t,\beta_t$：Qwen 报告式 (6)–(11)，与 KDA 通道级门的差别见 KDA 文

## 4. 容易搞混的地方

- 云上 `qwen3.8-flash` 不是另一套开源架构，不必再开目录。
- 7.6× kernel 和 8.6× 前缀缓存吞吐是两笔账，不是同一个加速比。
- n-gram 51B 不进「每 token 激活 6B」。
- 专家数 $n$、$K$：报告只写「大专家池 + 少量 routed + 一个共享专家」，公开材料里没有这两个整数。

## 参考文献

- 技术报告 PDF：https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- README：https://github.com/QwenLM/Qwen3.8-Flash-Next
- 博文镜像：https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501
- HF：https://huggingface.co/Qwen/Qwen3.8-Flash-Next
