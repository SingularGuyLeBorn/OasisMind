---
title: "01 · 混元 3D: 原生 3D 资产生成架构 架构精译"
date: 2026-08-30
as_of: 2026-08-30
tags: [Hunyuan3D, DiT, ShapeVAE, 公开材料精读]
---

> 来源快照：保留旧稿供事实追溯；公开、已校勘版本见 [公开校勘页](../../../../05-模型家族与选型/5.3-模型家族/hunyuan/3d-2/3d-2.md)。




# 混元 3D: 原生 3D 资产生成架构

>  **[返回 14.20-Hunyuan 家族总览](../../../../05-模型家族与选型/5.3-模型家族/hunyuan/hunyuan.md)** · 长 D5：[组件化管线](../../../../05-模型家族与选型/5.3-模型家族/hunyuan/3d-2/3d-2.md) · 语言 MoE 旗舰：[Hunyuan-Pro / Large](../../../../05-模型家族与选型/5.3-模型家族/hunyuan/large/large.md)

> 该家族依靠其独特的算力优势与数据护城河，在 LLM 红海中占据了核心生态位.

这不是 LLM。两条代际必须分开，**不要**把 2.0 的 DiT 写成 1.0。本文件夹只有一份 D2，覆盖开源报告轴。长 D5 把 2.5/3.0/Part/FlashVDM 写进同一张产品表——那些后出 SKU 未在本篇打开对应论文的，**不收进规格表**。

![Hunyuan3D 1.0 与 2.0 管线](./images/fig-hunyuan3d-1-vs-2-pipeline.png)

## 1. Hunyuan3D-1.0（[arXiv:2411.02293](https://arxiv.org/abs/2411.02293)）

两阶段、约 **10 秒**量级（摘要：多视图 ~4s + 前馈重建 ~7s；结果节：lite 在 A100 上约 **10s**，standard 约 **25s**；UV 展开 + 纹理烘焙另约 **15s**）。

| 阶段 | 做法 |
|------|------|
| 多视图扩散 | 条件图 → **6** 个固定位姿新视图；仰角 **0°**，方位 \(0,60,\ldots,300^\circ\)；3×2 网格。lite 骨干 **SD-2.1**，standard **SD-XL**（standard 参数约为 lite 的 **3×**） |
| 稀疏重建 | Transformer + triplane；混合输入：已标定多视图 **加上** 未标定条件图（全零相机 embedding）；NeuS SDF → marching cubes |
| 自适应 CFG | 前视图 \(w_t=2+16(t/1000)^5\)，其余视图乘 \(\tau_v\in[0.5,1]\)（背 \(\tau=0.5\)） |
| 训练 | **64×A100**；内部类 Objaverse 数据 |

GSO（论文 Table 1）：lite CD **0.199** / F@0.1 **0.661**；std CD **0.175** / F@0.1 **0.735**。文本条件走 Hunyuan-DiT 文生图，再进同一条图生 3D。

## 2. Hunyuan3D 2.0（[arXiv:2501.12202](https://arxiv.org/abs/2501.12202)，2025-01-21）

**换代**：不再「多视图 RGB → 前馈重建」，而是原生 3D 潜空间扩散。

1. **Hunyuan3D-ShapeVAE**：3DShape2VecSet 风格 vector set；表面均匀采样 + **重要性采样**（边、角）；FPS 分别做 query；解码 SDF → mesh。发布权重最长 latent **3072** token。
2. **Hunyuan3D-DiT**：在 VAE latent 上 **flow matching**（仿射 OT：\(x_t=(1-t)x_0+t x_1\)，\(u_t=x_1-x_0\)）。双流 + 单流 Transformer（FLUX 式）；latent **不加位置编码**（token 自己编码占据）。条件：DINOv2 Giant，输入 **518×518**，去背景居中。
3. **Hunyuan3D-Paint**：mesh 法线/位置图条件的多视图合成，再烘焙纹理；可给生成 mesh 或手做 mesh 贴图。平台：Hunyuan3D-Studio。代码：https://github.com/Tencent/Hunyuan3D-2

论文**没有**给 DiT 一个可抄的「X B 参数」总表。2.5 报告（[2506.16504](https://arxiv.org/abs/2506.16504)）里的 10B shape 模型是后文，**不要**倒灌进 2.0。

## 3. 失效条件

- 把 1.0 的 SD-XL 多视图写成 2.0 骨干。
- 把长 D5 的「2025.03 发布 2.0 / 1536³ / FlashVDM <1s」当成 2501.12202 原文。
- 把混元语言 MoE（389B）写进 3D 文件夹。

## 参考文献

- https://arxiv.org/html/2411.02293v2 （摘要、§3、Table 1、§4–5 时间与 GSO）
- https://arxiv.org/html/2501.12202 （摘要、§3 ShapeVAE/DiT、§4 Paint）
