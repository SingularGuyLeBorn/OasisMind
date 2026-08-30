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

1. **立刻做：** 质检入库 GSPO / GMPO / PPO（inbox 已交）；重写 `05-TRPO`（现 2620、零图、空标题）到 ≥4000 并配浅色图。
2. **并行：** 4.4 根上薄节（计算流程 / SFT-RL 融合 / RLVR / GSPO-DCPO）写满到 ≥4000，禁止空标题。`fig-moe-router-top2` **不要重画**。
3. **再下一波：** RAFT 专文（2304.06767）开 `4.4.1/07`；DPO/ORPO 配图；结构 S5/S6/S8。不要碰仍在租的 `4.4.5` / `4.6.2`。

## 续跑锚点（不是停机指令）

刚做完的上一件，以及现在该立刻做的下一件。**不要把本节理解成「本回合可以收工」。**

- 上一件：04-SimPO 专文入库（无 $\pi_{\mathrm{ref}}$、长度平均 $+\gamma$）；4.4 / 4.4.2 地图已链。GSPO/GMPO/PPO 子代理已交卷待监工入库。
- 现在立刻做：按主题 commit GSPO/GMPO/PPO；重写 TRPO；薄节写满。不要 `move_agent_to_root`。不要 push。

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
- [x] 0.8 本轮：PyramidKV（2406.02069，COLM 2025）；Information Funneling；层间等差 + 层内 SnapKV；12%=1024/8192；不是 Sinks/Maps
- [x] 0.8 本轮：FastGen（2310.01801，ICLR 2024 Oral）；按头 profiling；win>45% 才 negligible；不是 DeepSpeed-FastGen
- [x] 0.8 本轮：ScissorHands（2305.17118，NeurIPS 2023）；pivotal 持久；5×=KV 内存；20× 只在会场摘要
- [x] 0.8 本轮：01-OPD 勘误；On-Policy Distillation 不是 Online Preference；MiniLLM ≠ GKD 梯度；Table 21 = Qwen3-8B math+code 17920 vs 1800
- [x] 0.8 本轮：02-OPSD 勘误；特权上下文自教师；37.1→43.4 是三集平均；1/125=1×1024 vs GRPO 8×16k
- [x] 0.8 本轮：04-SDPO 勘误；环境 rich feedback 自教师；LCBv6 48.8 vs GRPO 41.2；不是塞进 DPO
- [x] 0.8 本轮：10-OPD-各家报告对照；Qwen3 Table 21 分母；V4=OPD 全词表 vs K3=MOPD token-level；1800/17920 不要安到 V4
- [x] 0.8 本轮：09-MOPD 新文；V4 全词表 OPD / K3 clip 对数比 / MiMo 训推比+ORM；三套超参不合成
- [x] **结构 S0b**：第 4、13 章首页按磁盘发 C 号；4.6 不是「开放领域对话」；`index.md` 停用当首页；13 正文 H1 跟路径走。
- [x] 0.8 本轮：03-SDFT 勘误；示范 $d$ 当特权上下文；70.6/65.4 = Table 5 单任务 Tool Use；理论 Reverse、实践 Forward KL
- [x] **结构 S1b**：4.4 节根 `4.4.1`–`4.4.4` 散文件去掉撞号（含冒号那份）；Muon 地图声明 = 6.5.2。
- [x] **结构 S2**：第 5 章首页已声明停止新建根级 `01-型号`，并抽样链到 14.x（不把 40 个扁平行今晚全表化）。
- [x] **结构 S3**：`2.3.4` 收成单轨导航（FA/H2O 链专文；无修订双轨）。
- [x] **结构 S4**：`6.4.2` 收成 KV 系统地图（H2O/StreamingLLM/SnapKV 链 2.3.2；无修订双轨）。
- [x] **结构 S7**：`7.3-Agent.md` 改成第 13 章应用入口（ReAct/schema/重试留本篇）。
- [ ] **配图接线（长期）：** llm-guide 约 300 张 `fig-*.png`，绝大多数架构图接线不合格。规范：`.cursor/skills/academic-diagrams`。好对照：`08-QSA/.../fig-qsa-hybrid-slot.png`。每波 4 张左右，覆盖原文件。不画假曲线。
- [x] wave-1：`fig-deepseek-moe-shared-routed` / `fig-moe-topk-ste` / `fig-moe-eng-ep-all2all` / `fig-spin-self-play`（用户点名；已覆盖入库）
- [ ] wave-2：`fig-deepseek-moe-ffn-slot` / `fig-moe-dense-vs-sparse` / `fig-moe-router-top2` / `fig-gated-residual`
- [ ] wave-3：MoE 工程其余（capacity / load / drop / aux-zloss）+ LatentMoE 插槽
- [ ] **结构 S5 / S6 / S8**：14 家族序号 / Ernie / 过满拆篮。成文：碰一篇折一篇修订块。编号：三层点分号 + 第四层 `01`–`10`。不删文件。

## 路径租约（并行防撞）

派子代理**之前**由监工填写；收回后删行或改 `done`。路径集合必须两两不相交。`notes/live/*.md`、Skill、trusted-sources、supervisor **永不出租**（只许监工改）。`notes/live/inbox/<id>.md` 可租给对应切片。

| 切片 ID | 状态 | 只准改的路径（含该文 images/） | 禁止改 |
|---------|------|-------------------------------|--------|
| snapkv-12 | done | `2.3.2/12-SnapKV-生成前观测窗/` | 已交；不是观察头 |
| quest-13 | done | `2.3.2/13-Quest-查询感知稀疏/` | 已交；不是驱逐 |
| pyramidkv-14 | done | `2.3.2/14-PyramidKV-层间漏斗/` | 已交；题是 Funneling，不是 Sinks/Maps |
| fastgen-15 | done | `2.3.2/15-FastGen-按头自适应/` | 已交；按头 profiling，不是 DeepSpeed-FastGen |
| scissorhands-16 | done | `2.3.2/16-ScissorHands-重要性持久/` | 已交；5× 是 KV 内存，不是吞吐 |
| tova-17 | done | `2.3.2/17-TOVA-注意力省略/` | 已交；层内平均驱逐，不是 SnapKV per-head |
| opd-01 | done | `4.6-OPD/01-OPD-学生前缀蒸馏/` | 已交；On-Policy Distillation；Table 21 分母 |
| opsd-02 | done | `4.6-OPD/02-OPSD-参考解自蒸馏/` | 已交；特权上下文自教师；37.1 是三集平均 |
| sdpo-04 | done | `4.6-OPD/04-SDPO-环境反馈蒸馏/` | 已交；rich feedback 自教师；不是塞进 DPO |
| mopd-09 | done | `4.6-OPD/09-MOPD-多教师蒸馏/` | 已交；三家损失分叉；不合成超参 |
| sdft-03 | done | `4.6-OPD/03-SDFT-示范持续学习/` | 已交；示范 $d$；70.6/65.4 是 Table 5 单任务 Tool Use |
| opd-10 | done | `4.6-OPD/10-OPD-各家报告对照/` | 已交；Table 21 分母；V4≠K3 损失 |
| s0-ch5 | done | `5-主流模型全解/5-主流模型全解.md` | 已交；禁止再 mkdir 根级 `01-型号` |
| s0-ch8 | done | `8-多模态/8-多模态.md` | 已交；`8.2` 撞号留给 S1 |
| s0-ch14 | done | `14-主流开源模型全景解析与技术报告精读/14-主流开源模型全景解析与技术报告精读.md` | 已交；Ernie/Erine 留给 S6 |
| s3-234-nav | done | `2-核心原理与架构/2.3-高效与稀疏注意力/2.3.4-高效注意力全景综述/2.3.4-高效注意力全景综述.md` | 已交；单轨导航 |
| s4-642-map | done | `6-训练与推理优化/6.4-KV缓存与内存优化/6.4.2-KVCache压缩与优化技术.md` | 已交；单轨地图 |
| s7-73-entry | done | `7-LLM应用开发/7.3-Agent/7.3-Agent.md` | 已交；应用入口，系统本体在第 13 章 |
| fold-46-opd | done | `4-后训练/4.6-OPD/4.6-OPD.md` | 已交；OPD = On-Policy Distillation 单轨 |
| pass-1234-b01 | done | batch 01 十篇 | 浅色冰山/技能树；2.1.1 改成 01–04 地图；未重画 146 张 |
| pass-1234-b02 | done | batch 02 见 inbox（SiTU + 2.1.2–2.1.4 + 2.2 节首页） | 已入库。SiTU/mHC/GR 汉字未满 4000（派工早于规矩）。mHC 图若写 mean-HC，正文已勘误为 Manifold-Constrained。 |
| moe-hp | done | `2.4.1-混合专家模型MoE/2.4.1-混合专家模型MoE.md` + inbox `moe-hp.md` | 已入库。地图汉字 3661；阅读序 01→02→03→10；04–09 已迁 6.1.8 / 6.3.1 / 9.1.5 |
| moe-01 | done | `2.4.1/01-DeepSeek-MoE/`（夹内 md+images）+ inbox `moe-01.md` | 已入库。16B $K_r=6$；V3 $N_r=256$；未 git add 节根散文件 |
| moe-02 | done | `2.4.1/02-MoE的工程实践/` + inbox `moe-02.md` | 已入库。$C$=槽数、$\gamma$=容量因子；drop/dropless/aux/z-loss；未改旧目录名 |
| moe-03 | done | `2.4.1/03-MoE-Top-K运算可导性分析/` + inbox `moe-03.md` | 已入库。STE 式 (5)–(7)；ReMoE=2412.14711；V3 Sigmoid 仍离散 |
| moe-10 | done | `2.4.1/10-Stable-LatentMoE与Quantile-Balancing/` + inbox `moe-10.md` | 已入库。$\ell\neq c^{KV}$；896/Top-16/2 共享，$\ell=3584$ |
| fuse-5-14 | done | `5-主流模型全解/5-主流模型全解.md`；`14-…/14-….md` | 已交；同一章两面；浅色 `fig-ch5-narrative-ch14-read.png` |
| pass-1234-b03 | done | batch 03 十篇见 inbox | 已交；AttnRes/MLA 浅色图；2.3 章地图 |
| pass-1234-b04 | done | batch 04 十篇见 inbox | 已交；FA3=2407.08608；Paged 只留 2309.06180 |
| pass-1234-b05 | done | batch 05 十篇见 inbox | 已交；Quest 不驱逐；QSA/DCA 浅色图 |
| pass-1234-b06 | done | batch 06 十篇见 inbox | 已交；2.3.3 地图 + KDA 通道门图 |
| pass-1234-b07 | done | batch 07 十篇见 `notes/live/inbox/pass-1234-batch-07.md` | 2.3.5 收成导航；2.4 四格图；MoE 01–07 成文；$\ell$≠MLA $c^{KV}$ |
| pass-1234-b08 | done | batch 08 十篇见 `notes/live/inbox/pass-1234-batch-08.md` | SonicMoE 2512.14080；QMoE 1.6T；$\ell$≠MLA $c^{KV}$；Jamba 52B/12B；V4 MTP≠EAGLE-3 |
| pass-1234-b09 | done | batch 09 第 3 章→3.2.5 | 后训练只链第 4 章；WSD=MiniCPM；Llama 3 405B 16K H100 |
| pass-1234-b10 | done | batch 10 3.2.6–3.4 + stub | $\sqrt{C/6}$ 量纲纠正；CPT≠SFT；GPT-4 HumanEval 67.0%；MATH 12500 |
| s9-fold-nnn | done | `{N.N.N}` 夹根散文件收同名夹：2.1 / 2.3.3 / 2.4.1 / 4.4.1 / 4.4.2 | 第 5 章扁平行、`2.3.1` 第五层、节根 `01` 未做 |
| ffn-act-02 | done | `2.1.1/02-激活函数谱系-从饱和到软门/` | 监工抽查：浅色四曲线图；Table 1 单路 1.677/1.679/1.683；未改节首页 |
| ffn-act-03 | done | `2.1.1/03-GLU家族-从GLU到SwiGLU/` | $8d/3$ 算术；Table 1 GEGLU 1.633 / SwiGLU 1.636；浅色两/三矩阵图 |
| ffn-act-04 | done | `2.1.1/04-PowLU-Ling对SwiGLU的稳定化改写/` | 式 (1) $m=3$；Ling-2.0 仍 SwiGLU；无 limit=7.0 官方超参 |
| fig-dp-611 | done | `6.1.1-分布式训练/6.1.1-分布式训练.md` + 该夹 `images/fig-*.png` + inbox `fig-dp-611.md` | DP/TP/PP/ZeRO 浅色图；气泡率标了 `[OM-FREEPLAY]`；未改 Ring/Ulysses/BPT |
| fig-fa-v14 | done | `2.3.1/01-FlashAttention/` 的 `02`–`05` md + 该夹 `images/fig-fa-*-mech.png` + inbox `fig-fa-v14.md` | FA3=2407.08608 35%→75%；v2 外循环改到 Q 行；旧 jpg 未删 |
| fig-kv-family | done | `2.2.2/01-MHA`、`02-MQA`、`03-GQA`、`04-MLA-低秩潜变量` 四篇 md + 各夹 images + inbox `fig-kv-family.md` | 两张浅色积木图；未改 05 / 节首页；32768 vs 576 与 Table 9 分口径 |
| fig-nsa-dsa | done | `2.3.2/02-原生稀疏注意力机制NSA/` + inbox `fig-nsa-dsa.md` | 三分支 + DSA indexer；DSA ≠ NSA 第四分支；MSA 口述未开夹 |
| fig-gated-attnres | done | `2.2.2/06-Gated-Attention-SDPA输出门控/`；AttnRes + inbox `fig-gated-attnres.md` | Table 1：PPL 5.761 / Hellaswag 74.64 / MMLU 60.82；Qwen3-Next 3:1 插槽已写 |
| engram-248 | done | `2.4-前沿架构与变体/2.4.8-条件记忆与Engram/` + inbox `engram-248.md` | 已入库。Qwen 点名 Cheng 2026；51B 不进 6B；V4 未出厂；监工补 2.4 首页行 |
| k3-d2-deep | done | `14.5-Kimi/05-Kimi-K3/`（01 精译 + 该夹 images）+ inbox `k3-d2-deep.md` | 已入库。2.78T/104.2B 与 2.8T/104B 分口径；QAT MXFP4/8；MTP→EAGLE-3 用 LK 不是 KL；未改 14.5 首页 |
| muse-spark-d2 | done | `14.3-LLaMA/05-Muse-Spark/` + inbox `muse-spark-d2.md` | 已入库。未 mkdir 1.1/1.2；无架构表，文首声明不够 4000；BioDesign 46.2/39.2 分口径 |
| gemini-37-flash | done | `14.11-Gemini/14-Gemini-3.7-Flash/` + inbox `gemini-37-flash.md` | 已入库。监工补 14.11 表行；不 mkdir 3.6；DeepSWE 65.3% / 对照 48.6%；无架构表，文首声明不够 4000 |
| rsi-origin | done | `content/rsi/0-导读/`；`content/rsi/1-坐标系与术语/01-RSI-术语辨析/` + inbox `rsi-origin.md` | 已入库。Good / 种子 / Gödel；未 Delete；监工改 garden 先读标题 |
| snapkv-thicken | done | `2.3.2/12-SnapKV-生成前观测窗/` + inbox `snapkv-thicken.md` | 已入库。4557 汉字；H 事后度量；3.6×/8.2× 分口径；不是观察头 |
| quest-thicken | done | `2.3.2/13-Quest-查询感知稀疏/` + inbox `quest-thicken.md` | 已入库。4082 汉字；7.03× 自注意力 / 2.23× 4-bit e2e；不驱逐；新图 algo1 + page collision |
| gated-07 | done | `2.2.2/07-Gated-Attention相关工作/` + inbox `gated-07.md` | 已入库。4017 汉字；FoT 在 logits、QT 是 BERT/ViT 量化门；未改 06；监工补 2.2.2 行 |
| situ-thicken | done | `2.1.1/01-SiTU-GLU/` + inbox `situ-thicken.md` | 已入库。4134 汉字；$\ell=3584$；报告无独立 SiTU 消融；监工补 2.1.1 表注 |
| mhc-thicken | done | `2.1.3/01-Hyper-Connections与mHC/`（夹内 md+images）+ inbox `mhc-thicken.md` | 已入库。4139 汉字；Table 4 MATH 26.0 vs HC 26.4；Manifold-Constrained；未碰节根散文件 |
| gr-thicken | done | `2.1.3/03-Gated-Residual/` + inbox `gr-thicken.md` | 已入库。4329 汉字；Table 5 25B-A3B/560B；丢掉 $H_{res}$；不是 $G_1$/mHC；监工补 2.1.3 一句 |
| qwen4-pred | done | `14.2-Qwen/14-Qwen4-架构预测/` + inbox `qwen4-pred.md` | 已入库。4305 汉字；51B 不进 6B；$K_B=512$≠专家；无出厂报告 |
| qsa-thicken | done | `2.3.2/08-QSA-Qwen稀疏注意力/` + inbox `qsa-thicken.md` | 已入库。4101 汉字；7.6×≠8.6×；$K_B=512$ 是块预算 |
| xhc-thicken | done | `2.1.3/02-xHC-Expanded-Hyper-Connections/` + inbox `xhc-thicken.md` | 已入库。4200 汉字；$N=16$/$k=4$；18B 44.8→48.8；未抄 mHC Table 4 |
| attnres-thicken | done | `2.2.2/08-AttnRes-深度维注意力聚合/`（先 git mv 节根散文件）+ inbox `attnres-thicken.md` | 已入库。4045 汉字；深度维 softmax；不是 $G_1$/mHC/GR |
| opd-state-dist | done | `4.6-OPD/4.6.3-状态从哪来/` | 已入库。读者只读一篇；≥10000 汉字；六图；一步 KL GSM8K 0.040；站住的是学生前缀上的教师续写 |
| fig-wave-2 | running | `2.4.1/01-DeepSeek-MoE/images/fig-deepseek-moe-ffn-slot.png`；`2.4.1/images/fig-moe-dense-vs-sparse.png`；`2.4.1/images/fig-moe-router-top2.png`；`2.1.3/03-Gated-Residual/images/fig-gated-residual.png` | 只覆盖这四张 png，不改专文数字 |
| gxpo-family | running | `4.4-对齐技术/4.4.5-GxPO家族/` + inbox `gxpo-family.md` | 综述 2606.16733；DAPO=2503.14476 全称 Clip+Dynamic Sampling；不改 4.4.1 的 01–05 |
| opd-survey | running | `4.6-OPD/4.6.2-OPD综述/` + inbox `opd-survey.md` | 综述 2604.00626；不在 4.6 根加 11；不改 01–10 |
| loop-tf | done | `2.4-前沿架构与变体/2.4.9-循环Transformer/` + inbox `loop-tf.md` | 5444 汉字；$N=KR$；Huginn 3.5B FLOP≠50B 参数；监工补 2.4 首页 |
| ttc-45 | done | `4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md` + inbox `ttc-45.md` | 已补 token 轴 vs 深度轴 $N=KR$；链 2.4.9 |
| rloo-44 | done | `4.4.1/06-RLOO-留一法基线/` + inbox `rloo-44.md` | 4021 汉字；2402.14740；k=4 Win-rate 77.9/43.7/64.1；监工链 4.4.1 |
| kto-442 | done | `4.4.2/03-KTO-前景理论对齐/` + inbox `kto-442.md` | 4227 汉字；2402.01306；$z_0=\mathrm{KL}(\pi_\theta\Vert\pi_{\mathrm{ref}})$；监工改 4.4.4 错公式 |
| simpo-442 | done | `4.4.2/04-SimPO-无参考长度平均/` | ≥4000；2405.14734；无 $\pi_{\mathrm{ref}}$；Table 4/5/16；监工链 4.4.2 / 4.4 首页 |
| gspo-thicken | running | `4.4.1/03-GSPO/` + inbox `gspo-thicken.md` | ≥4000；几何平均序列 IS；浅色 fig；不改 4.4.5 |
| trpo-fig | running | `4.4.1/05-TRPO/` + inbox `trpo-fig.md` | ≥4000；浅色信任域图；不改 04-PPO |
| gmpo-fig | running | `4.4.1/01-GMPO/` + inbox `gmpo-fig.md` | ≥4000；浅色几何均值图；不改 02-GRPO |
| ppo-fig | running | `4.4.1/04-PPO/` + inbox `ppo-fig.md` | 补浅色 Actor-Critic / GAE / clip 图；可改 md+images，不改 05 |
| rl-thin-44 | running | `4.4-对齐技术/4.4-GRPO计算流程全解析.md`；`4.4-SFT与RL的融合策略.md`；`4.4-GRPO变体与改进-GSPO与DCPO.md`；`4.4-RLVR的局限性与探索边界分析.md` + inbox `rl-thin-44.md` | 写满禁止空标题；不改 4.4.1/01–06、不改 4.4.5 |
