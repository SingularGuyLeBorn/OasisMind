---
title: LIVE · 计划（下一步三件事随时改）
date: 2026-08-30
tags: [ops, live, llm-guide]
published: false
excerpt: 当前计划。重复投喂 prompt 后按这里续做，不要从零盘点。
category: LLM 指南
---

# LIVE · 计划

> 始终只保留 **下一步 3 件** + 波次队列。做完一件就改本文件。

## 下一步 3 件（最上面最先做）

1. **立刻做：** 本波还剩三篇：**PyramidKV**、**FastGen**、**ScissorHands**。**TOVA**（2401.06104）已写入 `2.3.2/17-TOVA-注意力省略`。不要从全库盘点重来。
2. **下一阶段（本波三篇交完再开）：OPD 家族**（经检验）+ **MOPD** + 各家技术报告落地。落点 `4.6-OPD/`。G-OPD / SCOPE 未核一手不升格。V4 后训练不 mkdir。
3. **P2 余量 / 结构：** Connest5 仍留条。S1 不要和本波 2.3.2 专文抢同一文件。第 5 章禁止再新建根级 `01-型号`。

## 波次队列（未完成的留着）

- [x] 盘点：空壳、配图占位、过时断言、主题树、GPU/Infra 缺口（见 enrichment-log §3）
- [x] `知识图谱-2026-08.md` 草稿（表里仍标了缺专文的项，补文后回头改表）
- [x] P0-A 提纲写满（五篇磁盘上已是 `status: completed`；不要当空壳重写）
- [x] P1-GPU 9.1.2 / 9.1.3 / 9.1.4；9.4 服务栈自绘图
- [x] P0-C 自绘无水印图
- [x] P1：xHC；MuonClip/Polar Express；导论 14 章；DLM；omni
- [x] P1：QSA / Gated Residual / KDA 体系章
- [x] P2：Qwen3.8-Flash-Next 报告已读并拆进体系 + D2（云上 Flash = B，不另建目录）
- [x] P2：Kimi K3 报告已读；D2 + SiTU-GLU / LatentMoE / QB / Per-Head Muon
- [x] P2：GLM-5.3-Flash 官方文档+config 已读；D2 + IndexPool；非 Flash 5.3 = B
- [x] P1：FP4 独立推导（MXFP4/NVFP4）；AdamW LaTeX（1711.05101 Algorithm 2）
- [x] P0-B 空壳 D2/D5（Gemini/OpenAI/Claude/Mistral/xAI/国内 Step·Doubao·Ernie·Hunyuan-Pro·Ling·ABAB·Llama-3.1·Hunyuan-3D·MiniMax M2 线已写或枢纽）
- [x] P2 其余：Muse Spark = A；K2.7-Code = A；GPT-5.6 Sol = A；Fable 5 / Opus 5 = A
- [x] P3 互链与索引诚实化（本轮改完章首页剩余 `*家族演进总览.md` 404；Ling 那份真实存在可留）
- [x] 0.8 本轮：6.1.7 稳定性/训推 + 6.1.1 EP/CP；V4-Flash = B 记账；Gemini 表接到 3.1
- [x] 0.8 本轮：9.4.1 SGLang + PD（DistServe / SGLang 论文 / PD 文档）；章首页 4 条 Index 404；M2 Lightning 空壳并节
- [x] 0.8 本轮：3.4 评测改号（`3.3.x`→`3.4.x` 枢纽保留）；NIAH 换自绘图；RULER/Lost-in-the-Middle 修订；3.1.1 Grokking 换网图
- [x] 0.8 本轮：2.4.1 图 1–5 自绘；6.2.1 浮点/推理/训练显存三图；6.4.1 Hash 前缀树；Gemma-2 三篇 D5
- [x] 0.8 本轮：2.4.1 剩余概念图自绘；LBL/Upcycling/消融曲线不画假坐标；4.6 写入 V4 式 (29)
- [x] 0.8 本轮：6.1.6 DualPipe 自绘图 + V4 DualPipe 调整句；MLA 假 imgur → 自绘（2.3.5 本体）
- [x] 0.8 本轮：EAGLE-3 勘误（2503.01840）；2.4.6 接 V4/K3 MTP；6.1.1 CP/EP Wave 自绘图
- [x] 0.8 本轮：6.6.3 Flash-Decoding 按 CRFM/PyTorch 博文勘误；与 FA3 拆开
- [x] 0.8 本轮：2.3.4 / 04-FA3 钉 2407.08608 的 35%→75%、错号
- [x] 0.8 本轮：PagedAttention 吞吐/KV 占用按 2309.06180；SageAttention 按 2410.02367
- [x] 0.8 本轮：2.3.4 Mistral SWA「无限上下文」勘误；Mixtral 05 稠密 32k
- [x] 0.8 本轮：2.3.4 膨胀窗 / BigBird / Performer（2004.05150、2007.14062、2009.14794）
- [x] 0.8 本轮：2.3.4 Linformer（2006.04768）+ CSA/HCA 缩写勘误（V4 vs CLA）
- [x] 0.8 本轮：2.3.4 线性注意力（2006.16236）+ 2.3.3「分解 Softmax」/ 外积转置 / 85% 吞吐
- [x] 0.8 本轮：2.3.4 Reformer（2001.04451）LSH≠学习路由；MoBA 相关工作同步
- [x] 0.8 本轮：2.3.4 Routing Transformer（2003.05997）球面 k-means ≠ LSH ≠ MoE
- [x] 0.8 本轮：2.3.4 / 2.3.3 / 2.4.4 RWKV-4（2305.13048）通道衰减 ≠ $q^\top k$；推理不是一步 FLOPs $O(1)$
- [x] 0.8 本轮：2.3.4 §5.2.3 RFA（2103.02143）三角 RFF ≠ FAVOR+；分类表空节补上
- [x] 0.8 本轮：2.3.4 / 2.3.3 / 2.4.4 AFT（2105.14103）式 (2) pairwise $w$ ≠ $QK^\top$；AFT-full 不是 RNN；RWKV「式 (9)」改编号
- [x] 0.8 本轮：2.3.4 §5.1.5 Synthesizer（2005.00743）合成对齐 ≠ AFT 逐元素；时间仍二次；60% 对 DyConv
- [x] 0.8 本轮：2.3.4 §5.1.6 LightConv/DynamicConv（1901.10430）depthwise ≠ CVPR 2020；20% 对 P100 翻译；交叉注意力仍在
- [x] 0.8 本轮：2.3.4 Sparse Sinkhorn（2002.11296）学块置换仍局部 $QK$；不是 mHC 残差 Sinkhorn
- [x] 0.8 本轮：2.3.4 Star-Transformer（1902.09113）环+一个中继；不是 BigBird UA 星图；不是 2411.17116
- [x] 0.8 本轮：2.3.4 / 6.1.1 / 9.4 NVIDIA Star Attention（2411.17116）两阶段块稀疏；11×=相对 Ring 的 256K 10.8×
- [x] 0.8 本轮：6.1.1 Ring Attention（2310.01889）精确；$6bch$ 与 $s$ 无关；Reduce-Scatter 那步删掉
- [x] 0.8 本轮：6.1.1 DeepSpeed Ulysses（2309.14509）All-to-All 全序列少数头；每链路 $4Nh/P$；$P$ 不能大于头数
- [x] 0.8 本轮：6.1.1 Megatron-SP（2205.05198）$g$/$\bar g$ 与 TP 绑；$s=2048$；选择性重计算；530B×2240 MFU 54.2%
- [x] 0.8 本轮：6.1.1 ColAI-SP / RSA（2105.13120，ACL 2023）两段环物化 $S$；参数每卡一份；13.7× 是 64 卡对 12 卡 TP
- [x] 0.8 本轮：6.1.1 BPT（2305.19370，NeurIPS 2023）块内 attn+FFN；一层 $2bsh$；Table 2 同行 8× vanilla；不是 Ring / SP
- [x] 0.8 本轮：Memory Efficient Attention（Rabe & Staats 2112.05682）独立专文；2.3.4 §3.0；不是 FA / BPT / Ring / SP
- [x] 0.8 本轮：StreamingLLM / Attention Sink（2309.17453，ICLR 2024）；4+窗；不是 FA / H2O / gpt-oss 标量 $z'$
- [x] 0.8 本轮：H2O Heavy-Hitter Oracle（2306.14048，NeurIPS 2023）；local 累积；20% = H2+最近对半分；不是 FA / StreamingLLM
- [x] 0.8 本轮：Quest Query-Aware Sparsity（2406.10774，ICML 2024）；页 min/max；不驱逐；7.03× 自注意力 / 2.23× 4-bit e2e；PMLR 摘要对调
- [x] 0.8 本轮：SnapKV（2404.14469，NeurIPS 2024）；观测窗 + per-head 选簇；3.6×=16k·bs=2 ms/token；8.2×=16k→131k；380K=NIAH 单卡；不是观察头
- [x] 0.8 本轮：TOVA（2401.06104，EMNLP 2024）；当前步最低分；层内平均；1/8=512/4096；4.8×=V100 Table 1 的 512 列；是驱逐
- [ ] **结构 S1–S7**（S0 五章首页地图已交）：见 `notes/chapter-structure-plan.md`（撞号/文件名规范 → 5/14 分工已在 S0/S2 声明 → 综述改导航）。不删文件。

## 续跑锚点（不是停机指令）

刚做完的上一件，以及现在该立刻做的下一件。**不要把本节理解成「本回合可以收工」。**

- 上一件：0.8 已补 **TOVA 2401.06104**（专文 `2.3.2/17-TOVA`；层内平均驱逐；1/8 与 4.8× 拆回 Table 1）。
- 现在立刻做：本波还剩 **PyramidKV / FastGen / ScissorHands**。OPD 等这三篇交完再开。不要 `move_agent_to_root`。不要 push。

## 路径租约（并行防撞）

派子代理**之前**由监工填写；收回后删行或改 `done`。路径集合必须两两不相交。`notes/live/*.md`、Skill、trusted-sources、supervisor **永不出租**（只许监工改）。`notes/live/inbox/<id>.md` 可租给对应切片。

| 切片 ID | 状态 | 只准改的路径（含该文 images/） | 禁止改 |
|---------|------|-------------------------------|--------|
| snapkv-12 | done | `2.3.2/12-SnapKV-生成前观测窗/` | 已交；不是观察头 |
| quest-13 | done | `2.3.2/13-Quest-查询感知稀疏/` | 已交；不是驱逐 |
| pyramidkv-14 | leased | `2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/14-PyramidKV-层间漏斗/`（含同名 md、`images/`）· `notes/live/inbox/pyramidkv-14.md` | 2.3.2 节首页、6.4.2、6.3.1.2、邻居专文、live 三份 |
| fastgen-15 | leased | `2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/15-FastGen-按头自适应/`（含同名 md、`images/`）· `notes/live/inbox/fastgen-15.md` | 同上 |
| scissorhands-16 | leased | `2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/16-ScissorHands-重要性持久/`（含同名 md、`images/`）· `notes/live/inbox/scissorhands-16.md` | 同上 |
| tova-17 | done | `2.3.2/17-TOVA-注意力省略/` | 已交；层内平均驱逐，不是 SnapKV per-head |
| s0-ch5 | done | `5-主流模型全解/5-主流模型全解.md` | 已交；禁止再 mkdir 根级 `01-型号` |
| s0-ch8 | done | `8-多模态/8-多模态.md` | 已交；`8.2` 撞号留给 S1 |
| s0-ch14 | done | `14-主流开源模型全景解析与技术报告精读/14-主流开源模型全景解析与技术报告精读.md` | 已交；Ernie/Erine 留给 S6 |
