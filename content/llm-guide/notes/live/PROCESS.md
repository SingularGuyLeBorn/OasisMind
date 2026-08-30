---
title: LIVE · 过程（正在读什么、写什么、卡在哪）
date: 2026-08-30
tags: [ops, live, llm-guide]
published: false
excerpt: 过程账。每读一篇源、每写完一节就追加。重复投喂时用这张表续上，不要靠聊天记录。
category: LLM 指南
---

# LIVE · 过程

## 此刻

- 正在读：OPD 一手（MiniLLM / GKD / OPSD / SDPO）与各家报告 mineru。KV 四篇已交。
- 正在写：`4.6-OPD` 五切片（01/02/04 勘误 + 09-MOPD + 10 落地对照）。
- 卡住：`move_agent_to_root` **禁止再调**。本会话写在 `D:\ALL IN AI\OasisMind`。
- 上次刷新记忆的时间（读 GOAL+PLAN 的时刻）：2026-08-30 回收 ScissorHands，开 OPD

## 本会话已完成（追加，不要删旧行）

| 时间 | 动作 | 读过的源（URL） | 落到哪篇笔记 |
|------|--------|-----------------|--------------|
| 2026-08-30 | 建 worktree `feat/llm-guide-2026-08-notes` | git HEAD 5d1c25de | 仓库根外 `OasisMind-llmguide-2026-08` |
| 2026-08-30 | 主题树打勾 + 知识图谱草稿 | 本库文件系统 | `1.1/.../知识图谱-2026-08.md`、enrichment-log §3 |
| 2026-08-30 | 写 GPU 内存层次专文 + 自绘图 | 见下行台账 | `9.1.2-GPU内存层次与Roofline.md` |
| 2026-08-30 | 9.1 B200 180GB 勘误；9.2/9.3/9.4/6.1/2.1.3/6.5.1/1.1 修订节 | 同台账 | 各原文追加，未删 2025 段 |
| 2026-08-30 | 写 9.1.3 互联 + 自绘拓扑图 | 见下行 NVLink/NVL72/IB 台账 | `9.1.3-卡间互联与集群拓扑.md` |
| 2026-08-30 | 写 9.1.4 加速器全景 | AMD/TPU/Gaudi/华为云文 | `9.1.4-加速器全景.md` |
| 2026-08-30 | P0-C 嵌图：自注意力 3、Agent 安全 2、残差图 1、LN vs RMSNorm、RoPE 2D | GenerateImage | 各文 `images/fig-*.png` |
| 2026-08-30 | 写 xHC 专文 + 自绘图 | arXiv:2607.14530 HTML §1–3.3 / Algorithm 1 | `2.1.3/02-xHC-Expanded-Hyper-Connections.md` |
| 2026-08-30 | 写 MuonClip / Polar Express 对照 | Polar Express HTML；K2 mineru-en Algorithm 1；Step-3.5-Flash mineru-en | `6.5/Muon/05-MuonClip与PolarExpress.md` |
| 2026-08-30 | 第 1 章 / index / 1.3 追加 14 章与 2025H2–2026-08 修订 | 不删八章原文 | `1-导论与基础.md`、`1.3` |
| 2026-08-30 | 勘误：第 5 章 Kimi 把 QK-Clip 写成梯度裁剪 | K2 报告 | `5.2/.../月之暗面-Kimi.md` |
| 2026-08-30 | 写 DLM 指针；2.4 索引补 MTP + DLM | LLaDA arXiv:2502.09992 HTML §1–2.1 | `2.4.7-扩散语言模型DLM指针.md` |
| 2026-08-30 | 写第 8 章 omni 地图 + 自绘图 | GLM-4-Voice / MiniCPM-o 4.5 / GPT-4o SC / Astra 官方页 | `8.7-Omni与全双工.md` |
| 2026-08-30 | 写满 Mistral-7B D2；05-01 改枢纽；D5 32K 勘误 | arXiv:2310.06825 Table 1–4 | `01-01-Mistral-7B-架构精译.md` |
| 2026-08-30 | 写满 Mixtral-8x7B D2；05-02 改枢纽；HumanEval/辅助损失勘误 | arXiv:2401.04088 Table 1–2 | `01-02-Mixtral-8x7B-架构精译.md` |
| 2026-08-30 | 写满 Mistral Large 公开材料 D2；Large 3 日期/参数勘误 | mistral-large / 2407 / mistral-3 博文 + docs 256k | `01-03-Mistral-Large-架构精译.md` |
| 2026-08-30 | 9.4 嵌服务栈自绘图 | GenerateImage；SGLang/PD 修订节已有 | `9.4/.../images/fig-llm-serving-stack-pd.png` |
| 2026-08-30 | 写满 Claude 1/2/2.1 公开材料 D2；CAI 52B≠产品参数 | introducing-claude；2212.08073；claude-2；claude-2-1；100k 扩窗 | `01-01` / `01-02` / `01-03` Claude |
| 2026-08-30 | 写满 Claude 3 Haiku/Sonnet/Opus D2；Haiku GA 3-13 | family 博文 + model card PDF Table 1 + haiku 博文 | `01-04` / `01-05` / `01-06` |
| 2026-08-30 | 抽读 Qwen3.8 tech_report.pdf 28 页；写 QSA/GR/KDA 与 Flash-Next D2 | GitHub PDF + 2510.26692 | `08-QSA` / `03-GR` / `01-KDA` / `13-Qwen3.8-Flash-Next` |
| 2026-08-30 | 精读 K3 HTML §1–5.2；写 D2 + SiTU-GLU + LatentMoE/QB；KDA/AttnRes/Muon 补 K3 用法 | arXiv:2607.24653 HTML；README；2601.18089 摘要 | `05-Kimi-K3`；`01-SiTU-GLU`；`10-Stable-LatentMoE` |
| 2026-08-30 | 精读 GLM-5.3-Flash 文档+HF config+vLLM/SGLang；写 D2 + IndexPool；自绘图 2 | docs.z.ai；config.json；vLLM recipe；SGLang cookbook | `12-GLM-5.3-Flash`；`09-IndexPool` |
| 2026-08-30 | 写满 Claude 3.5 Sonnet/Haiku + Computer Use 空 D2；空壳 05 改枢纽 | 3.5 博文；June/Oct addendum PDF；Bedrock 卡 | `01-07` / `01-08` / `01-09` |
| 2026-08-30 | 写满 Gemini 1.0 / 1.5 Pro / 1.5 Flash / Flash-8B 空 D2；空壳 05 改枢纽；长 D5 修订 Ultra/Pro 参数、Flash≠MoE、8B≠端侧 | 2312.11805；2403.05530；developers.googleblog Flash-8B | `14.11/01`–`04` |
| 2026-08-30 | 写满 GPT-1 / GPT-3 / InstructGPT 空 D2；GPT-3/InstructGPT 空 05 改枢纽；GPT-1 D5 修订 117M/SQuAD | UBC GPT-1 PDF；2005.14165；2203.02155 | `14.12/01` / `03` / `04` |
| 2026-08-30 | 写满 GPT-2 D2；Table 2=117/345/762/1542M；长 D5 修订 124/355 | Brown CS GPT-2 PDF | `14.12/02` |
| 2026-08-30 | 写满 Gemini 2.0 Flash/Pro/Thinking + Astra 空 D2；Flash-Lite 不 mkdir | 12-11 + 02-05 Google 博文；developers 2.0 Flash | `14.11/05`–`07`、`10` |
| 2026-08-30 | 写满 Claude 3.7 空 D2；附录 SWE 63.7%/70.3%；空壳 05 改枢纽 | anthropic.com/news/claude-3-7-sonnet | `14.13/10` |
| 2026-08-30 | 写满 ChatGPT-3.5 / GPT-4 / Gemini 2.5 Pro+Flash / Claude 4 空 D2；空壳 05 改枢纽；长 D5 加修订 | Wayback ChatGPT；2303.08774v6；Gemini 3-25/4-17 博文；anthropic.com/news/claude-4 | `14.12/05`–`06`；`14.11/08`–`09`；`14.13/11` |
| 2026-08-30 | 写满 GPT-4V / Turbo / 4o / 4o-mini 空 D2；枢纽或长 D5 修订 | GPTV 系统卡 PDF；DevDay Wayback；Hello GPT-4o Wayback；4o mini Wayback；2410.21276 | `14.12/07`–`10` |
| 2026-08-30 | 写满 o1-preview / o1 / o1-mini 空 D2；o1 长 D5 修订；mini 独立博文未读成 | Introducing o1-preview Wayback；Learning to Reason Wayback Appendix A | `14.12/11`–`13` |
| 2026-08-30 | 写满 o3-mini / Operator 空 D2；空壳 05 改枢纽；o3-mini 与 Operator 长 D5 加修订 | openai.com/index/openai-o3-mini/；Operator + CUA 2025-01-23 | `14.12/14`–`15` |
| 2026-08-30 | 写满 Gemini 3.0 Pro / 3 Flash / 3.1 Pro 缺 01；长 D5 加修订 | blog.google Gemini 3 / 3 Flash / 3.1 Pro | `14.11/11`–`13` |
| 2026-08-30 | 写满 Grok-1 / 1.5V / Grok-2 空 D2；空壳 05 改枢纽 | x.ai grok / grok-os / grok-1.5v / grok-2；GitHub README | `14.15/01`–`03` |
| 2026-08-30 | 写 MXFP4/NVFP4 专文 + 自绘图；6.3.1「1-3-0」加修订 | OCP MX v1.0 PDF；NVIDIA NVFP4 博文 | `6.1.2/03-MXFP4与NVFP4.md` |
| 2026-08-30 | 6.5.1 追加 AdamW LaTeX（Algorithm 2） | arXiv:1711.05101 HTML §1–2 | `6.5.1` |
| 2026-08-30 | 写满 Step-1/2 空 D2；长 D5 加修订（6D/200B 不收） | 阶跃微信 2024-03-23；WAIC 转述 | `14.7/01` `14.7/02` |
| 2026-08-30 | 写满 Doubao Lite/Pro 空 D2；Lite≠端侧；7×=9T 对照实验 | team.doubao 1.5-pro；火山 746293… | `14.17/01` `14.17/02` |
| 2026-08-30 | 写满 Llama-3.1 薄壳；长 D5 勘误 HF 表 | HF Llama-3.1-405B 卡；herd 2407.21783 | `14.3/04-LLaMA-3.1` |
| 2026-08-30 | Muse Spark = A；自绘图；不 mkdir Contemplating | 安全报告 2026-05-26；arXiv:2606.12429 | `14.3/05-Muse-Spark` |
| 2026-08-30 | Hunyuan-Pro D2=Large 论文；Pro≠389/52 API | arXiv:2411.02265v2 Table 1 | `14.20/01` |
| 2026-08-30 | Ling-Lite/Plus 空 01 写满；占位 Yi 勘误；2.5 枢纽、2.6 无论文 | arXiv:2503.05139 | `14.16` |
| 2026-08-30 | Ernie 3.5/4.0 公开材料；无参数；4.5 不倒灌 | 千帆 267629；人民政协网王海峰转述 | `14.19` |
| 2026-08-30 | ABAB 空 01 改枢纽（无独立 PDF） | 同目录博文分析 | `14.8/01-ABAB` |
| 2026-08-30 | 写满 Hunyuan-3D D2（1.0+2.0）；长 D5 加修订；自绘图 | arXiv:2411.02293；2501.12202 | `14.20/02` |
| 2026-08-30 | MiniMax M2 纠正 Lightning；M2.1/2.5/2.7 枢纽；长 D5 勘误；2.4.1/2.3.3 一句 | arXiv:2605.26494 | `14.8/02`–`05` |
| 2026-08-30 | GLM-5.1 / Turbo 空 01 改枢纽 | z.ai/blog/glm-5.1 | `14.6/09` `11` |
| 2026-08-30 | P3：家族总览诚实化；第 14 章 D2 计数不当完成率 | 磁盘扫描 | `14.3` `14.5` `14.6` `14.8` 章首页 |
| 2026-08-30 | K2.7 Code = A；自绘图 | kimi.ai/resources/kimi-k2-7-code；HF README | `14.5/06` |
| 2026-08-30 | GPT-5.6 Sol = A；Terra/Luna = B；自绘图 | openai.com/index/gpt-5-6/；system card 枢纽 | `14.12/26` |
| 2026-08-30 | Fable 5 / Opus 5 = A；Mythos 5 = B 枢纽；自绘图 | anthropic.com/claude/fable；research/claude-opus-5；docs models overview | `14.13/19` `20` `18` |
| 2026-08-30 | 写 6.1.7 稳定性/训推 + 自绘图；6.1.1 补 EP Wave / CP 两阶段 | V4 mineru §4.2.3；V3 无 rollback 句；K2 05 文；GLM-5 IcePop；Step MIS-PO；K3 D2 训推表 | `6.1.7-训练稳定性与训推不一致.md`；`6.1.1` §2.6 |
| 2026-08-30 | V4-Flash = **B**：同一份系列报告，不 mkdir；家族页一行 | HF DeepSeek_V4.pdf / 库内 V4 D2+mineru | `14.1-DeepSeek.md`；章首页 V4 行 |
| 2026-08-30 | Gemini 家族表补 11–13；Flash-Lite 不 mkdir | 已有 3.0 Pro / 3 Flash / 3.1 Pro D2 | `14.11-Gemini.md` |
| 2026-08-30 | 写 9.4.1 SGLang+PD + 自绘图；M2 Lightning 空壳并节；章首页 4 条 404 | DistServe HTML；SGLang HTML；docs.sglang PD 页 | `9.4.1-SGLang与Prefill-Decode分离.md`；`05-MiniMax-M2-LightningAttention解析.md`；第 14 章首页 |
| 2026-08-30 | 3.4 评测改号；NIAH/PPL/Grokking 自绘图；RULER+Lost-in-the-Middle 修订 | arXiv:2307.03172；arXiv:2404.06654 HTML 摘要+§1 | `3.4.1`–`3.4.4`；`3.4-预训练评估.md`；`3.1.1` |
| 2026-08-30 | 2.4.1 图 1–5 自绘；6.2.1 三张网图；6.4.1 Hash 树；Gemma-2 三篇 D5 | GenerateImage；ar5iv 2408.00118 §2 + Table 1/8/10 | `2.4.1`；`6.2.1`；`6.4.1`；`14.10/02` 三篇 05 |
| 2026-08-30 | 2.4.1 剩余概念图自绘；数值曲线不画假坐标；4.6 写入 V4 式 (29) | GenerateImage；V4 mineru §5.1.2 | `2.4.1`；`4.6-OPD` |
| 2026-08-30 | DualPipe 自绘图；MLA 假 imgur 换成自绘 | GenerateImage；V4 mineru DualPipe 1F1B 调整句 | `6.1.6`；`01-DeepSeek-MoE`；`2.3.5` |
| 2026-08-30 | EAGLE-3 勘误；MTP 接到 V4/K3；CP/Wave 自绘图 | ar5iv 2503.01840 摘要+§1–3.2+Appendix；K3 D2 §8；V4 mineru MTP 句 | `6.6.2`；`6.6.2.1`；`02-EAGLE`；`2.4.6`；`6.1.1` |
| 2026-08-30 | 6.6.3 Flash-Decoding 修订 + 自绘图 | CRFM/PyTorch Flash-Decoding 博文；arXiv 2407.08608v2 摘要+§1+限制段 | `6.6.3` |
| 2026-08-30 | 2.3.4 / 04-FA3 钉 75%、改错号 | 同上 2407.08608v2 摘要 | `2.3.4`；`04-FlashAttention-v3` |
| 2026-08-30 | PagedAttention 90%+ 勘误；SageAttention INT8 | ar5iv 2309.06180 摘要+§1–2.3+§6–7.2；arXiv 2410.02367 摘要+§4 | `2.3.4`；`01-PagedAttention与vLLM`；`6.4.1` |
| 2026-08-30 | Mistral SWA「无限上下文」勘误；Mixtral 非 SWA | ar5iv 2310.06825 Table 1 + Figure 1–3 叙述；Mixtral D2 Table 1 | `2.3.4` §4.1；`05-Mixtral-8x7B-稀疏MoE…`；`05-Mistral-7B-GQA与SWA` |
| 2026-08-30 | 膨胀窗式 (6) 勘误；BigBird 拆 UA/图灵/ITC·ETC；Performer FAVOR+ 与错号 | ar5iv 2004.05150 §3；ar5iv 2007.14062 摘要+§2–3.4+Fig.1/3；ar5iv 2009.14794 Lemma 1 | `2.3.4` §4.2–5.2；`2.3.2` UA 句；`2.3.3` 参考文献号 |
| 2026-08-30 | Linformer 序列投影；$E,F$ 绑 $n$；CSA/HCA 不再当 Cross-Layer | ar5iv 2006.04768 摘要+§3–5.3+Table 1–3；库内 07 CSA-HCA；Hunyuan-Pro D2 CLA | `2.3.4` §5.3 / §6.2 / 图 1.1 |
| 2026-08-30 | Linear Transformer 换核不是分解 softmax；4000×=CIFAR；ICML 不是 ICLR | ar5iv 2006.16236 摘要+§3–4.3+Table 1–3 | `2.3.4` §5.1；`2.3.3` 年表/式 (5)(6)/吞吐 85% |
| 2026-08-30 | Reformer：LSH $O(L\log L)$ 非学习路由；可逆+FFN chunk；WMT 不用 LSH | ar5iv 2001.04451 摘要+§2–5+Table 1–4 | `2.3.4` §4.3.2 / §9.3；MoBA 01 相关工作 |
| 2026-08-30 | Routing Transformer：球面 k-means 非 LSH；$O(n^{1.5}d)$；一半头局部 | ar5iv 2003.05997 摘要+§2–6+Algorithm 1+Table 1–7 | `2.3.4` §4.3.2 / §9.3；MoBA 01 相关工作 |
| 2026-08-30 | RWKV-4：通道衰减 WKV 无 $q^\top k$；推理 $O(Td)/O(d)$ 不是一步 $O(1)$ | ar5iv 2305.13048 摘要+§2–9+Table 1–2+Appendix D | `2.3.4` §5.1；`2.3.3` §4.4/4.6/参考文献；`2.4.4` 式 (8) |
| 2026-08-30 | RFA：三角 RFF + 单位化 QK + Gate；12×=2048 解码；不是 Performer | ar5iv 2103.02143 摘要+§2–5+Table 1–3 | `2.3.4` §5.2.3；Performer 修订节一句；`2.3.3` 年表 |
| 2026-08-30 | AFT：式 (2) pairwise $w$ 无 $QK^\top$；AFT-full 不是 RNN；RWKV「式 (9)」改编号 | ar5iv 2105.14103 摘要+§3–5.3+Table 1–8 | `2.3.4` §5.1.4 / §7–8；`2.3.3` 年表；`2.4.4` 修订一句 |
| 2026-08-30 | Synthesizer：Dense/Random 合成对齐；时间仍二次；60% 对 DyConv | ar5iv 2005.00743 摘要+§3–5+Table 1–7 | `2.3.4` §5.1.5 / §7；Linformer 修订一句 |
| 2026-08-30 | LightConv/DynamicConv：depthwise softmax 核；$f(X_i)$；20% 对 P100 | ar5iv 1901.10430 摘要+§3–6+Table 1–5+Appendix A | `2.3.4` §5.1.6 / §7；Synthesizer C4 句补 20%≠60% |
| 2026-08-30 | Sparse Sinkhorn：学块置换仍局部 $QK$；不是去掉点积；不是 mHC | ar5iv 2002.11296 摘要+§3–5+Table 1–8 | `2.3.4` §4.3.2 / §7 / §9.3；xHC 一句拆开 |
| 2026-08-30 | Star-Transformer：环+一个中继 $O(6nd)$；不是 BigBird；不是 2411.17116 | ar5iv 1902.09113 摘要+§3–5.5+Table 1–6；ACL N19-1133 | `2.3.4` §4.3.1 / §7 / §9.3；`2.3.2` 一句 |
| 2026-08-30 | NVIDIA Star Attention：两阶段块稀疏；锚 $c_1$；11×=Table 5 256K 10.8× | ar5iv 2411.17116 摘要+§2–4+Table 1–6+Appendix A–B | `2.3.4` §4.3.1；`6.1.1` Ring 修订；`9.4` 长上下文句 |
| 2026-08-30 | Ring Attention：精确；$6bch$ 与 $s$ 无关；Table 3；不是 RS/AG | ar5iv 2310.01889 摘要+§2–5+Table 1–3+Appendix C | `6.1.1` §4.3；`6.1` 前瞻一句；`2.3.4` 对照表链本体 |
| 2026-08-30 | Ulysses：All-to-All 全序列少数头；$4Nh/P$；$P$≤头数；不是每卡只算一段 | ar5iv 2309.14509 摘要+§2–4+Table 1–3 | `6.1.1` §4.2；`6.1` 前瞻；`2.3.4` 一句链本体 |
| 2026-08-30 | Megatron-SP：与 TP 绑的 $g$/$\bar g$；$s=2048$；选择性重算；Table 5 | ar5iv 2205.05198 摘要+§3–6+Table 1–5+Appendix A | `6.1.1` §4.5 / §5；`6.1` 前瞻 |
| 2026-08-30 | ColAI-SP / RSA：两段环物化 $S$；参数每卡一份；13.7×=64 卡对 12 卡 TP | ar5iv 2105.13120 + ACL 2023.acl-long.134 摘要+§3–4+Table 1–4+Appendix B–E | `6.1.1` §4.6；`6.1` 前瞻；`2.3.4` 一句 |
| 2026-08-30 | BPT：块内 attn+FFN；一层 $2bsh$；不是 Ring/SP；Table 2 同行 8× | arxiv HTML 2305.19370 摘要+§2–5+Table 1–5+Algorithm 1+Related Work | `6.1.1` §4.7；`6.1` 前瞻；`2.3.4` FA 节一句 |
| 2026-08-30 | MEA 专文：lazy softmax + running max；$O(1)/O(\log n)/O(\sqrt{n})$；Table 2–3；不是 FA/BPT/Ring | arxiv HTML 2112.05682 摘要+§1–7+Table 2–3+Figure 1 代码；FA ar5iv 2205.14135 Appendix B.5；google-research README | `2.3.1/00-MEA`；`2.3.4` §3.0；`2.3.1` 索引；`01-FA`/`02-FA-v1`；`6.1.1`；Llama-1 §4.3；知识图谱 |
| 2026-08-30 | StreamingLLM 专文：式 (1) sink；4+窗；cache 内赋位；Table 1–6；22.2×；4M；不是 FA/H2O/标量 $z'$ | arxiv HTML 2309.17453；OpenReview NG7sS51zVF；github mit-han-lab/streaming-llm；Miller SoftMax1；gpt-oss model card PDF；V4 mineru 式 (27)；Gu 2410.10781；Barbero 2504.02732 Table 1；Star Attention 2411.17116 Table 2；hanlab blog | `2.3.2/10-StreamingLLM`；`2.3.2` 索引；综述 §5.1；`07-CSA-HCA`；`2.3.4` §4.1；`2.3` 演进表；知识图谱；`6.3.1.2` §7.2 |
| 2026-08-30 | H2O 专文：Algorithm 1 local $F_{\mathrm{score}}$；20% 对半分；Table 1–7、9；29× / 3× / 1.9×；4M 叠 StreamLLM；不是 FA/4+窗/未来求和 | arxiv HTML 2306.14048；abs 2306.14048；NeurIPS 2023 hash 6ceefa7b…；github FMInference/H2O；NVIDIA EAI KV 压缩博文 | `2.3.2/11-H2O`；`2.3.2` 索引 §0/§9；综述 §5.2；`6.4.2` §4.3.1–4.3.2；`6.4` NeurIPS 年；`2.3.4`；`2.3` 演进表；知识图谱；`10-StreamingLLM` 图 5 |
| 2026-08-30 | S0 第 5 章首页地图：厂商叙事 vs 第 14 章 D2；根级 `01-型号` 停新建；示例链 Claude-1/GPT-1/Gemini-1.0/Claude-2 | 库内路径确认（14.1/14.2/14.5/14.13；2.3.5；6.4） | `5-主流模型全解.md` §0 |
| 2026-08-30 | S0 第 8 章首页地图：CLIP/VLM 同号 8.2 分链；omni 链 8.7；精读只进第 14 章 | 库内路径确认（8.1–8.7；GLM-4-Voice Index；MiniCPM-o D2） | `8-多模态.md` §0 |
| 2026-08-30 | S0 第 14 章首页地图：D2 捆法；机制回 2/6/9.4；第 5 章叙事；Ernie/`14.21-Erine` 留 S6 | 库内路径确认（第 2/5/6 章首页；9.4；14.19；14.21 夹无家族首页） | `14-主流开源模型全景解析与技术报告精读.md` §0 |
| 2026-08-30 | Quest 专文：页 min/max 上界；不驱逐；Table 1 passkey；Fig 9 **7.03×** 自注意力 / Fig 10 **2.23×** 4-bit e2e；PMLR 摘要对调 | arxiv HTML/PDF 2406.10774；PMLR v235/tang24l；hanlab；github mit-han-lab/Quest；知乎两篇只学讲法 | `2.3.2/13-Quest`；`2.3.2` 索引；`2.3.4`；知识图谱 |
| 2026-08-30 | SnapKV 专文：观测**窗** + per-head Top-$k$ + 1D pooling；Listing `capacity-window`；Table 1 Mistral；**3.6×**=16k·bs=2 ms/token；**8.2×**=16k→131k；NIAH **380K** / 基线 33k OOM；纠正 6.4.2 观察头 | arxiv HTML v2 / abs 2404.14469；NeurIPS hash 28ab4182…；github FasterDecoding/SnapKV `snapkv_utils.py`；知乎两篇只学讲法（16K→380K 未采用） | `2.3.2/12-SnapKV`；`2.3.2` 索引；`6.4.2` §4.3.3 修订；`6.4`；`2.3.4`；知识图谱 |
| 2026-08-30 | TOVA 专文：unbounded MSRNN vs 政策；层内平均 $\arg\min$；Table 3 TOVA-layer；**1/8**=512/4096；**4.8×**=V100 Table 1 的 512 列；Quest passkey 当驱逐 | arxiv HTML/PDF 2401.06104；Anthology 2024.emnlp-main.1043；github schwartz-lab-NLP/TOVA；知乎只学讲法 | `2.3.2/17-TOVA`；`2.3.2` 索引；`2.3.4`；知识图谱 |
| 2026-08-30 | PyramidKV 专文：v4 式 (1) 等差漏斗；层内 Following SnapKV；**12%** 拆回 Table 2 的 1024/8192=12.5%；0.7% 弃用 0.8%；纠正 6.4.2 Sinks / 6.3.1.2 Maps | arxiv HTML v4 2406.02069；COLM 2025 Spotlight；github Zefan-Cai/KVCache-Factory；知乎只学讲法（2.5%/0.2% 未采用） | `2.3.2/14-PyramidKV`；`2.3.2` 索引；`2.3.4`；`6.4`；`6.4.2`；`6.3.1.2`；知识图谱 |
| 2026-08-30 | FastGen 专文：双阶段；式 (1)(2) 五种嵌套；Table 1 以 win>45% 的 $T=98\%$ 行为准；官方仓几乎空 | arxiv HTML/PDF 2310.01801；ICLR 2024 Oral hash 639a9a17…；github machilusZ/FastGen；知乎只学讲法 | `2.3.2/15-FastGen`；`2.3.2` 索引；`2.3.4`；知识图谱 |
| 2026-08-30 | ScissorHands 专文：pivotal；非重要计数 $I$；**5×**=OPT-66B KV 内存；**20×** 只在会场摘要；NeurIPS Table 3 C4 分桶 | arxiv 2305.17118；NeurIPS hash a452a7c6…；github lzcemma/Scissorhands；知乎只学讲法 | `2.3.2/16-ScissorHands`；`2.3.2` 索引；`2.3.4`；知识图谱 |



## 来源台账（只记真正打开读过的）

| 类型 | 标题 | URL 或本库路径 | 用于哪篇 | 读没读完 |
|------|------|----------------|----------|----------|
| 官方文档 | CUDA C++ Programming Guide · Memory Hierarchy | https://docs.nvidia.com/cuda/cuda-c-programming-guide/#memory-hierarchy | 9.1.2 | 读了层次相关节，未通读全书 |
| 官方文档 | Blackwell Tuning Guide | https://docs.nvidia.com/cuda/blackwell-tuning-guide/ | 9.1.2 shared 档位 / B200 180GB | 读了 HBM 与 shared 段 |
| 官方产品页 | NVIDIA H100 | https://www.nvidia.com/en-us/data-center/h100/ | 9.1.2 ridge point | 规格表 |
| 官方文档 | HGX AI Factory Components | https://docs.nvidia.com/enterprise-reference-architectures/hgx-ai-factory/latest/components.html | 9.1.2 / 9.1 勘误 | 表 1 读完 |
| 官方产品页 | DGX B200 | https://www.nvidia.com/en-us/data-center/dgx-b200/ | 9.1.2 1440GB | 规格表 |
| 官方 blog | Inside NVIDIA Rubin GPU Architecture | https://developer.nvidia.com/blog/inside-nvidia-rubin-gpu-architecture-powering-the-era-of-agentic-ai/ | 9.1.2 / 9.1 修订 | 读完博文正文 |
| 原论文 | FlashAttention | https://arxiv.org/abs/2205.14135 | 9.1.2 引用动机 | 未在本会话精读全文（库内 2.3.1 已有） |
| 原论文 | Roofline (Williams et al. 2009) | CACM 引用 | 9.1.2 公式 | 公式按经典形式写，未打开 PDF |
| 官方 blog | Qwen3.8-Flash-Next | https://qwen.ai/blog?id=qwen3.8-flash-next ；镜像 https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501 | PROCESS 分级；6.5.1 修订 | 读完博文架构四段 |
| 官方仓库 | Qwen3.8-Flash-Next tech_report.pdf | https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf | P2 S 档待精读 | **未读 PDF**（只确认存在） |
| 官方 HF | Qwen/Qwen3.8-Flash-Next | https://huggingface.co/Qwen/Qwen3.8-Flash-Next | 9.4 SGLang 一句 | 卡上 serving 建议 |
| 原论文 | Kimi K3 | https://arxiv.org/abs/2607.24653 HTML | K3 D2 | 见下行精读记录；本行保留以免丢链接 |
| 官方 GitHub | MoonshotAI/Kimi-K3 README | https://github.com/moonshotai/Kimi-K3 | 分级 | 规格表 |
| 原论文 | xHC: Expanded Hyper-Connections | https://arxiv.org/abs/2607.14530 HTML | 02-xHC 专文 | 读了 §1–3.3、Algorithm 1、xHC-Flash 流量数字 |
| 原论文 | Polar Express | https://arxiv.org/abs/2505.16932 HTML（ar5iv） | 05-MuonClip与PolarExpress | 读了摘要、§1–1.3、§2 多项式对照、§4.4、Figure 1、Algorithm 1；未证 Theorem 4.1 全文 |
| 原论文 | Kimi K2 | https://arxiv.org/abs/2507.20534 ；本库 `14.5/.../03-Kimi-K2-mineru-en.md` §2.1 + Algorithm 1 + 附录 D | 05 文 + 第 5 章勘误 | 读了 MuonClip/QK-Clip 段，未通读全部后训练 |
| 本库精读 | Step-3.5-Flash mineru-en Polar Express 段 | `14.7/.../03-Step-3.5-Flash-mineru-en.md` | 05 文 §2.3 | 读了 NS/Polar Express 与 float16 对策段 |
| 官方 blog | GLM-5.3-Flash | https://z.ai/blog/glm-5.3-flash | P2 分级 | **WebFetch 超时**；数字以 docs.z.ai 为准 |
| 官方安全报告 | Muse Spark Safety & Preparedness | https://ai.meta.com/static-resource/muse-spark-safety-and-preparedness-report | P2 分级 A | 只读开头定位段，未当架构精读 |
| 演进前作 | Hyper-Connections / mHC | 本库 `2.1.3/01-Hyper-Connections与mHC.md` | 2.1.3 修订 | 确认已有专文 |
| 中文解析 | （本会话未当事实源） | — | — | — |
| 官方产品页 | NVIDIA NVLink & NVLink Switch | https://www.nvidia.com/en-us/data-center/nvlink/ | 9.1.3 | 规格表读完 |
| 官方产品页 | GB200 NVL72 | https://www.nvidia.com/en-us/data-center/gb200-nvl72/ | 9.1.3 | 规格表 + GB300 段 |
| 官方文档 | GB200 NVL Multi-Node Tuning Guide | https://docs.nvidia.com/multi-node-nvlink-systems/multi-node-tuning-guide/overview.html | 9.1.3 | Overview |
| 官方文档 | NVL72 AI Factory Components | https://docs.nvidia.com/enterprise-reference-architectures/nvl72-ai-factory/latest/components.html | 9.1.3 | NVSwitch 托盘 / CX-8 |
| 官方产品页 | Vera Rubin NVL72 | https://www.nvidia.com/en-us/data-center/vera-rubin-nvl72/ | 9.1.3 | 规格表 |
| 官方 blog | Inside the NVIDIA Vera Rubin Platform | https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/ | 9.1.3 | 读完互联相关段 |
| 官方产品页 | Quantum InfiniBand Switches | https://www.nvidia.com/en-us/networking/infiniband-switching/ | 9.1.3 | 400/800 Gb/s + FAQ |
| 官方产品页 | Quantum-X800 | https://www.nvidia.com/en-us/networking/products/infiniband/quantum-x800/ | 9.1.3 | 平台页 |
| 官方产品页 | AMD Instinct MI300X | https://www.amd.com/en/products/accelerators/instinct/mi300/mi300x.html | 9.1.4 | 规格折叠页 |
| 官方产品页 | AMD Instinct MI350X | https://www.amd.com/en/products/accelerators/instinct/mi350/mi350x.html | 9.1.4 | 规格折叠页 |
| 官方文档 | Cloud TPU7x (Ironwood) | https://docs.cloud.google.com/tpu/docs/tpu7x | 9.1.4 | 对照表 + 架构 |
| 官方文档 | Cloud TPU v6e | https://docs.cloud.google.com/tpu/docs/v6e | 9.1.4 | 配置表（峰值数字以 TPU7x 对照列为准） |
| 官方 PDF | Intel Gaudi 3 HL-325L Product Brief | https://cdrdv2-public.intel.com/817487/gaudi-3-ai-accelerator-hl-325l-oam-mezzanine-card-product-brief.pdf | 9.1.4 | 读完简报 |
| 官方文章 | 华为云全栈服务架构与生态实践 | https://www.huawei.com/cn/huaweitech/publication/202503/full-stack-service-architecture-ecology-huaweicloud | 9.1.4 | CloudMatrix 段；无单卡数据表 |
| 企业文档 | Atlas 900 A2 PoD 技术规格 | https://support.huawei.com/enterprise/zh/doc/EDOC1100313984/cac4fa60 | 9.1.4 | **Access Denied，未读成**；不准用搜索摘要里的柜级 FLOPS |
| 原论文 | LLaDA | https://arxiv.org/abs/2502.09992 HTML | 2.4.7 DLM 指针 | 读了摘要、§1、§2.1 式 (1)–(4)、预训练规模；未读附录 A 全文 |
| 兄弟花园 | diffusion-llm 索引与机制文 | `content/diffusion-llm/_garden.md` 等 | 2.4.7 只链不抄 | 打开过 garden / why-diffusion / masked-diffusion / llada-frontier 开头 |
| 原论文 | GLM-4-Voice | https://arxiv.org/html/2412.02612 | 8.7 | 读了摘要、§1–3.1、Table 1 |
| 原论文 | MiniCPM-o 4.5 | https://arxiv.org/html/2604.27393 | 8.7 | 读了摘要、§1–3.4、Table 1 |
| 官方 System Card | GPT-4o | https://arxiv.org/html/2410.21276 | 8.7 | 读了开篇 232/320 ms；无 tokenizer 细节 |
| 官方页 | Project Astra | https://deepmind.google/models/project-astra/ | 8.7 | 能力列表 + 研究原型定位 |
| 官方博文 | GPT-4o hello | https://openai.com/index/hello-gpt-4o/ | 8.7 | **WebFetch 超时**；延迟数字以 System Card 为准 |
| 原论文 | Mistral 7B | https://arxiv.org/html/2310.06825 | 14.14 D2 | 读了摘要、§1–5、Table 1–4 |
| 官方博文快照 | announcing-mistral-7b | 本库 `14.14/.../pdfs/Mistral-7B.html` | 14.14 D2 | 读了正文列表与 SWA 段；未入库博文图 |
| 原论文 | Mixtral of Experts | https://arxiv.org/html/2401.04088 | Mixtral D2 | 读了摘要、§1–2、Table 1–2、路由段；未通读全部附录 |
| 官方博文 | Au Large（Mistral Large 24.02） | https://mistral.ai/news/mistral-large/ | Large D2 | 读完正文；基准只在图里，未转录柱高 |
| 官方博文 | Large Enough（Large 2 / 123B） | https://mistral.ai/news/mistral-large-2407/ | Large D2 | 读完；MMLU 84.0%、128k、并行+顺序 function calling |
| 官方博文 | Introducing Mistral 3 | https://mistral.ai/news/mistral-3/ | Large D2 | 读完；41B/675B、3000×H200、PD 分离、Apache 2.0 |
| 官方文档 | Mistral Large 3 25.12 | https://docs.mistral.ai/models/mistral-large-3-25-12 | Large D2 | 256k 上下文 |
| 官方博文 | Introducing Claude | https://www.anthropic.com/news/introducing-claude | Claude-1 D2 | 读完；无参数量、无 9K |
| 原论文 | Constitutional AI | https://arxiv.org/html/2212.08073 | Claude-1 D2 | 读了摘要、§1–3.5、§4.1 开头；52B=实验模型 |
| 官方博文 | Claude’s Constitution | https://www.anthropic.com/research/claudes-constitution | Claude-1 D2 | 读了正文至原则来源；产品宪法相对论文已更新 |
| 官方博文 | 100K context windows | https://www.anthropic.com/news/100k-context-windows | Claude-1/2 D2 | from 9K to 100K |
| 官方博文 | Claude 2 | https://www.anthropic.com/news/claude-2 | Claude-2 D2 | 读完；Bar 76.5%、HumanEval 71.2%、GSM8k 88.0% |
| 官方博文 | Introducing Claude 2.1 | https://www.anthropic.com/news/claude-2-1 | Claude-2.1 D2 | 读完；200K、2x 虚假陈述、30% / 3–4x 长文档、tool use beta |
| 官方博文 | Claude 3 family | https://www.anthropic.com/news/claude-3-family | Claude-3 D2 | 读完；定价、200K、Haiku soon、视觉 |
| 官方博文 | Claude 3 Haiku | https://www.anthropic.com/news/claude-3-haiku | Haiku D2 | 2024-03-13 GA；21K tok/s |
| Model card | Claude 3 Opus/Sonnet/Haiku | https://www-cdn.anthropic.com/de8ba9b01c9ab7cbabf5c33b80b7bbc618857627/Model_Card_Claude_3.pdf | Claude-3 D2 | 读了开篇、§5.1 Table 1、GPQA 方差、§5.8；未通读安全附录 |
| 技术报告 PDF | Qwen3.8-Next architecture | GitHub Qwen3.8-Flash-Next/tech_report.pdf | QSA/GR/Flash-Next D2 | PyMuPDF 抽 28 页；精读 §2.1–2.2 公式 |
| 官方博文镜像 | Qwen3.8-Flash-Next | https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501 | 同上 | 读完架构四段 + 引用 |
| 原论文 | Kimi Linear / KDA | https://arxiv.org/abs/2510.26692 | KDA 专文 | 读了摘要、§1–3.2、式 (1)–(9) |
| 原论文 | Kimi K3 | https://arxiv.org/html/2607.24653 | K3 D2 + 体系章补写 | 读了 §1–5.2、式 (1)–(17)、Table 1、附录 B 式 (18)–(19)、附录 C 开头；未通读 §6 评测附录与安全 |
| 官方 GitHub | MoonshotAI/Kimi-K3 README | https://github.com/MoonshotAI/Kimi-K3 | K3 规格与评测表 | 规格表 + 评测表 + 脚注 |
| 官方博文 | Kimi K3 Tech Blog | https://www.kimi.com/blog/kimi-k3 | K3 分级对照 | 读了架构四段 |
| 原论文 | LatentMoE | https://arxiv.org/abs/2601.18089 | 10 文 | 读了摘要、§1–2 开头；未通读硬件模型全文 |
| 官方仓库 | MoonEP | https://github.com/MoonshotAI/MoonEP | K3 D2 / 6.1 | 确认存在；未读源码 |
| 官方文档 | GLM-5.3-Flash | https://docs.z.ai/guides/vlm/glm-5.3-flash | Flash D2 | 读完 Overview + Key Advancements + Serving；博文 z.ai/blog 超时 |
| 官方 HF | zai-org/GLM-5.3-Flash `config.json` | https://huggingface.co/zai-org/GLM-5.3-Flash | Flash D2 / IndexPool | 读完 text_config + vision_config + layer_types |
| vLLM recipe | GLM-5.3-Flash | https://recipes.vllm.ai/zai-org/GLM-5.3-Flash | Flash serving | ~321B、KDA+NoPE sparse MLA、FP8 306 GiB、Hopper 无 FP8 KV |
| SGLang cookbook | GLM-5.3-Flash | https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3-Flash | Flash serving | 勿覆盖 linear_lower_bound；KDA 状态池与 KV 分开 |
| 官方博文 | Claude 3.5 Sonnet | https://www.anthropic.com/news/claude-3-5-sonnet | 3.5 Sonnet D2 | 读完；日期 2024-06-21 |
| Model card addendum | Claude 3.5 Sonnet June | https://www-cdn.anthropic.com/fed9cc193a14b84131812372d8d5857f8f304c52/Model_Card_Claude_3_Addendum.pdf | 3.5 Sonnet D2 | Table 1–5 |
| 官方博文 | 3.5 models and computer use | https://www.anthropic.com/news/3-5-models-and-computer-use | 3.5 / CU D2 | 读完；Haiku 定价修订 12-03 |
| Model card addendum | 3.5 Haiku + upgraded Sonnet | https://www-cdn.anthropic.com/c7822cdc35ad788ec87e14b3a9d45010f1f86c38.pdf | 3.5 Haiku / CU D2 | SWE-bench 表、OSWorld Table 1、Table 8 |
| 平台卡 | Bedrock Claude 3.5 Haiku | https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-anthropic-claude-3-5-haiku.html | Haiku GA 日 | launch 2024-11-04；200K / 8K out |
| 原论文 | Gemini 1.0 | https://arxiv.org/html/2312.11805 | Gemini 1.0 D2 | 摘要、§2–5.1、Table 1–3、MQA、goodput 97%；Ultra/Pro 参数未公布 |
| 原论文 | Gemini 1.5 | https://arxiv.org/html/2403.05530 | 1.5 Pro/Flash D2 | 摘要、§1–3.3、Table 1–2、NIAH/MATH 更新句；Flash=decoder 在线蒸馏 |
| 官方博文 | Gemini 1.5 Flash-8B GA | https://developers.googleblog.com/en/gemini-15-flash-8b-is-now-generally-available-for-use/ | Flash-8B D2 | 读完全文；无架构表、无端侧句 |
| 原论文 PDF | GPT-1 | https://www.cs.ubc.ca/~amuham01/LING530/papers/radford2018improving.pdf | GPT-1 D2 | 摘要、§3 式 1–5、§4.1–4.2、Table 2–3；无 117M / SQuAD 主表 |
| 原论文 | GPT-3 | https://arxiv.org/html/2005.14165 | GPT-3 D2 | 摘要、§1–2.2、Table 2.1–2.2、CoQA/TriviaQA/NQ/PTB |
| 原论文 | InstructGPT | https://arxiv.org/html/2203.02155 | InstructGPT D2 | 摘要、§1、§3.2–3.5 式 1–2、§4 偏好/幻觉/毒性/对齐税 |
| 原论文 PDF | GPT-2 | http://static.cs.brown.edu/courses/cs146/assets/papers/language_models_are_unsupervised_multitask_learners.pdf | GPT-2 D2 | 读了摘要、§2–3.8、Table 2–3；OpenAI CDN 仍超时 |
| 官方博文 | Introducing Gemini 2.0 | https://blog.google/innovation-and-ai/models-and-research/google-deepmind/google-gemini-ai-update-december-2024/ | 2.0 Flash / Astra D2 | 读完；Trillium 100%；Astra 10 min；Mariner 83.5% |
| 开发者博文 | Gemini era for developers | https://developers.googleblog.com/en/the-next-chapter-of-the-gemini-era-for-developers/ | 2.0 Flash D2 | SynthID；8 音色；SWE-bench 51.8% 是带工具 agent |
| 官方博文 | Gemini 2.0 model updates | https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-updates-february-2025/ | Flash GA / Pro / Thinking / Lite | 2025-02-05；Pro 2M experimental |
| 官方博文 | Claude 3.7 Sonnet and Claude Code | https://www.anthropic.com/news/claude-3-7-sonnet | Claude 3.7 D2 | 读完正文+SWE/TAU 附录；未读 system card PDF |
| 官方博文 | Introducing ChatGPT | https://openai.com/index/chatgpt/ | ChatGPT-3.5 D2 | openai.com 本轮仍超时；改读 Wayback |
| Wayback | ChatGPT: Optimizing Language Models for Dialogue | https://web.archive.org/web/20221130211011/https://openai.com/blog/chatgpt/ | ChatGPT-3.5 D2 | 读完 Methods / Limitations / Iterative deployment / 对照表；无参数量 |
| 技术报告 | GPT-4 Technical Report | https://arxiv.org/html/2303.08774v6 | GPT-4 D2 | 摘要、§1–4.1、Table 1–2、§2 不披露句 |
| 官方博文 | Gemini 2.5: Our most intelligent AI model | https://blog.google/innovation-and-ai/models-and-research/google-deepmind/gemini-model-thinking-updates-march-2025/ | 2.5 Pro D2 | 2025-03-25；HLE 18.8%；SWE 63.8% custom agent；1M |
| 开发者博文 | Start building with Gemini 2.5 Flash | https://developers.googleblog.com/en/start-building-with-gemini-25-flash/ | 2.5 Flash D2 | 2025-04-17；hybrid；budget 0–24576；preview-04-17 |
| 官方博文 | Introducing Claude 4 | https://www.anthropic.com/news/claude-4 | Claude 4 D2 | 读完正文+SWE/TAU/thinking 附录；未读 system card PDF |
| 系统卡 PDF | GPT-4V(ision) System Card | https://cdn.openai.com/papers/GPTV_System_Card.pdf | GPT-4V D2 | 读完 §1–3、拒答百分数、附录图注不估柱 |
| Wayback | DevDay 新模型 | https://web.archive.org/web/20231106235404/https://openai.com/blog/new-models-and-developer-products-announced-at-devday | GPT-4 Turbo D2 | 128K、April 2023、$0.01/$0.03 per 1K、vision-preview |
| Wayback | Hello GPT-4o | https://web.archive.org/web/20240514024319/https://openai.com/index/hello-gpt-4o/ | GPT-4o D2 | 232/320 ms；MMLU 88.7%/87.2%；tokenizer 表 |
| 系统卡 | GPT-4o System Card | https://arxiv.org/html/2410.21276 | GPT-4o D2 | §1–3.3.2 Table 2–3；知识截止 2023-10 |
| Wayback | GPT-4o mini | https://web.archive.org/web/20240719000627/https://openai.com/index/gpt-4o-mini-advancing-cost-efficient-intelligence/ | 4o-mini D2 | MMLU 82.0%；$0.15/$0.60；非端侧 |
| Wayback | Introducing o1-preview | https://web.archive.org/web/20240913000000/https://openai.com/index/introducing-openai-o1-preview/ | o1-preview / mini D2 | 限额 30/50；越狱 22 vs 84；mini 便宜 80%；83%/89th 属 next update |
| Wayback | Learning to Reason with LLMs | https://web.archive.org/web/20240912185410/https://openai.com/index/learning-to-reason-with-llms/ | o1 / preview D2 | Appendix A 三列；隐藏 CoT；IOI 特化模型不是主列 |
| 官方博文 | OpenAI o3-mini | https://openai.com/index/openai-o3-mini/ | o3-mini D2 | 读完产品/STEM 文字/延迟；AIME 柱无百分数；系统卡未打开 |
| 官方博文 | Computer-Using Agent / Operator | https://openai.com/index/computer-using-agent/ 与 Operator 2025-01-23 | Operator D2 | OSWorld 38.1%；WebArena 58.1%；WebVoyager 87%；系统卡未读 |
| 官方博文 | Gemini 3 Pro | https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3/ | 3.0 Pro D2 | 2025-11-18；HLE 37.5%；GPQA 91.9%；SWE 76.2%；1M；$2/$12 |
| 官方博文 | Gemini 3 Flash | Google 2025-12-17 Flash 博文 | 3.0 Flash D2 | SWE 78%；GPQA 90.4%；HLE 33.7% |
| 官方博文 | Gemini 3.1 Pro | https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-1-pro/ | 3.1 Pro D2 | 2026-02-19；ARC-AGI-2 77.1% |
| 官方博文 | Announcing Grok / Model Card | https://x.ai/news/grok ；https://x.ai/news/grok/model-card | Grok-1 D2 | 2023-11-03；HumanEval 63.2%；MMLU 73%；匈牙利 59%；K8s/Rust/JAX |
| 官方博文 | Open Release of Grok-1 | https://x.ai/news/grok-os | Grok-1 D2 | 2024-03-17；314B；25% 活跃；Oct 2023 基座；Apache 2.0 |
| 官方仓库 | xai-org/grok-1 README | https://github.com/xai-org/grok-1 | Grok-1 D2 | 8 专家 Top-2；64 层；48/8 GQA；d=6144；SP 131072；8k |
| 官方博文 | Grok-1.5 Vision Preview | https://x.ai/news/grok-1.5v | 1.5V D2 | 2024-04-12；整张视觉表；RealWorldQA 68.7%；>700 图 |
| 官方博文 | Grok-2 Beta | https://x.ai/news/grok-2 | Grok-2 D2 | 2024-08-13；整张表+脚注；sus-column-r；FLUX.1；Elo 图不估 |
| 规格 | OCP MX v1.0 | https://www.opencompute.org/documents/ocp-microscaling-formats-mx-v1-0-spec-final-pdf | 03-MXFP4 | §5.1–5.4；E2M1 Table 5；E8M0；k=32 |
| 官方博文 | Introducing NVFP4 | https://developer.nvidia.com/blog/introducing-nvfp4-for-efficient-and-accurate-low-precision-inference/ | 03-MXFP4 | Table 1；16+E4M3+FP32；R1-0528 PTQ；3.5×/1.8× footprint |
| 原论文 | AdamW | https://arxiv.org/html/1711.05101 | 6.5.1 | 摘要、§1–2、式 (1)、Algorithm 2 |
| 官方微信 | 阶跃 It's time to meet | https://mp.weixin.qq.com/s/buyqlgvKhqm7Zv3hDz_qHw | Step-1/2 D2 | MFU 57%；三件套；Step-1 Dense |
| 技术博客 | Doubao 1.5 Pro | https://team.doubao.com/zh/special/doubao_1_5_pro | Doubao Pro D2 | 7× 杠杆定义；四象限；ViT 2.4B |
| 火山文章 | 豆包 1.5 发布 | https://developer.volcengine.com/articles/7462939272262189083 | Lite/Pro | 2025-01-22；lite≠端侧 |
| HF 模型卡 | Llama-3.1-405B | https://huggingface.co/meta-llama/Llama-3.1-405B | 3.1 D2 | 15T+；128k；39.3M h；Instruct 表 |
| 安全报告 | Muse Spark Safety | https://ai.meta.com/static-resource/muse-spark-safety-and-preparedness-report/ | Muse Spark D2 | 摘要、§1、Table 1–2、Apollo 3/20 |
| 原论文 | Hunyuan-Large | https://arxiv.org/html/2411.02265v2 | Hunyuan-Pro D2 | Table 1；7T；recycle；GQA+CLA |
| 原论文 | Ling Every FLOP Counts | https://arxiv.org/html/2503.05139 | Lite/Plus D2 | 16.8/2.75；290/28.8；EDiT 66.1%；~20% |
| 千帆/转述 | 文心 4.0 | 千帆 topic/267629；rmzxw 2023-10-25 | Ernie 4.0 D2 | 逻辑近 3×；记忆 2×+；万卡飞桨 |
| 原论文 | Hunyuan3D-1.0 | https://arxiv.org/abs/2411.02293 | Hunyuan-3D D2 | 6 视图；lite/std；GSO CD |
| 原论文 | Hunyuan3D 2.0 | https://arxiv.org/abs/2501.12202 | Hunyuan-3D D2 | ShapeVAE 3072；flow DiT；2025-01-21 |
| 系列论文 | MiniMax-M2 | https://arxiv.org/abs/2605.26494 | M2 D2 | 229.9B/9.8B；8/256 sigmoid；全层 GQA；离开 Lightning |
| 官方页 | Kimi K2.7 Code | https://www.kimi.ai/resources/kimi-k2-7-code | K2.7 D2 | 规格表；内部基准；价表；FAQ |
| HF README | Kimi-K2.7-Code | https://huggingface.co/moonshotai/Kimi-K2.7-Code/raw/main/README.md | K2.7 D2 | 同 K2.5/K2.6 架构；评测脚注；preserve_thinking |
| 官方博文 | GPT-5.6 GA | https://openai.com/index/gpt-5-6/ | 5.6 Sol D2 | 2026-07-09；三档价；评测表；ultra=4 |
| System Card 枢纽 | GPT-5.6 | https://deploymentsafety.openai.com/gpt-5-6 | 5.6 Sol D2 | Preparedness High bio/cyber；低于 High RSI；未到 Critical |
| 官方产品页 | Claude Fable 5 | https://www.anthropic.com/claude/fable | Fable D2 | 06-09/12/07-01/08-06；$10/$50；30 天留存 |
| 官方博文 | Claude Opus 5 | https://www.anthropic.com/research/claude-opus-5 | Opus 5 D2 | 2026-07-24；$5/$25；Fast 2.5×；对齐 2.3 |
| 官方文档 | Claude models overview | https://platform.claude.com/docs/en/about-claude/models/overview | Fable/Opus | 1M/128K；effort；知识截止 |
| 本库 mineru | DeepSeek-V4 §4.2.3 稳定性 | `14.1/.../04-DeepSeek-V4-mineru-zh.md` | 6.1.7 | Anticipatory Routing；SwiGLU $[-10,10]$ / gate 10；rollback 不够 |
| 本库 mineru | DeepSeek-V3 预训练稳定性句 | `14.1/.../04-DeepSeek-V3-mineru-zh.md` | 6.1.7 | 无不可恢复 spike、无 rollback |
| 本库 D2 | GLM-5 IcePop / torch.topk | `14.6/08-GLM-5/01-GLM-5技术报告精译.md` | 6.1.7 | pop 区间；确定性 top-k；冻 indexer |
| 本库 D2 | Step-3.5-Flash MIS-PO | `14.7/.../01-Step-3.5-Flash技术报告精译.md` | 6.1.7 | 二元掩码；Routing Confidence |
| 本库 D2 | Kimi K3 训推表 | `14.5/05-Kimi-K3/01-Kimi-K3-架构精译.md` | 6.1.7 | QAT MXFP4/MXFP8；MTP→EAGLE-3 |
| 原论文 HTML | DistServe | https://arxiv.org/html/2401.09670 | 9.4.1 | 摘要、§1–3.3、式 (1)–(3)、1.13GB / 90Gbps；未通读评测附录 |
| 原论文 HTML | SGLang | https://arxiv.org/html/2312.07104 | 9.4.1 | 摘要、§1–3 Radix / Theorem 3.1 陈述；6.4×；未逐表抄分任务 |
| 官方文档 | SGLang PD Disaggregation | https://docs.sglang.ai/advanced_features/pd_disaggregation.html | 9.4.1 | Mooncake/NIXL、异构 TP 2–5×、NVL72 环境变量、MLA 勿开 staging |
| 原论文 | Lost in the Middle | https://arxiv.org/abs/2307.03172 | 3.4.3 | 摘要：开头/结尾好、中间差；多文档 QA + KV 检索 |
| 原论文 HTML | RULER | https://arxiv.org/html/2404.06654 | 3.4.3 | 摘要+§1 四类任务；17 模型 13 任务；vanilla NIAH 满分、32K 只有一半满意 |
| 原论文 HTML | Gemma 2 | https://ar5iv.labs.arxiv.org/html/2408.00118 | Gemma-2 三篇 D5 | §2 交错/soft-cap/GQA；Table 1 头表；Table 8 50.3/50.8；Table 10 PPL 1.63/1.63/1.64；无 FP8 表 |
| 本库 mineru | DeepSeek-V4 DualPipe 调整句 | `14.1/.../04-DeepSeek-V4-mineru-zh.md` | 6.1.6 | 为 mHC 调整 DualPipe 1F1B overlapping；无新气泡表 |
| 原论文 HTML | EAGLE-3 | https://ar5iv.labs.arxiv.org/html/2503.01840 | 6.6.2 / 6.6.2.1 / 02-EAGLE | 摘要、§1–3.2、Figure 3–6 叙述、Appendix 树深 6→8；未逐格抄 Table 1 |
| 本库 D2 | K3 MTP→EAGLE-3 / $\mathcal{L}_{\mathrm{LK}}$ | `14.5/05-Kimi-K3/01-Kimi-K3-架构精译.md` §8 | 2.4.6 / 6.6.2 | 冻目标；AttnRes 块 1/4/末；温度 1；无额外 CE |
| 本库 mineru | V4 MTP 与 V3 相同 | `14.1/.../04-DeepSeek-V4-mineru-zh.md` | 2.4.6 | 「采用相同策略，不做修改」；Flash/Pro $\lambda$ 0.3→0.1 |
| 官方博文 | Flash-Decoding | https://crfm.stanford.edu/2023/10/12/flashdecoding.html ；https://pytorch.org/blog/flash-decoding/ | 6.6.3 | 三步 split-KV；A100 108 SM；bs=1 FA <1% GPU；CodeLlama-34B 最高约 8×；注意力最高约 50×；FA ≥2.2 / xFormers ≥0.0.22；PyTorch 表 64k/128k µs |
| 原论文 HTML | FlashAttention-3 | https://arxiv.org/html/2407.08608v2 | 6.6.3 | 摘要+§1：FA2 H100 35%；FP16 1.5–2.0× / 740 TFLOPs 75%；FP8 ~1.2 PFLOPs；2.6× 误差；限制含 optimizing LLM inference |
| 原论文 HTML | PagedAttention / vLLM | https://ar5iv.labs.arxiv.org/html/2309.06180 | 2.3.4 / 01 / 6.4.1 | 摘要、§1–2.3、Fig.2 20.4–38.2%、§6.2 请求率、§6.3 共享%、§7.1 kernel 20–26%、§7.2 block 16；无 GPU 90% |
| 原论文 HTML | SageAttention | https://arxiv.org/html/2410.02367 | 2.3.4 §3.3 | 摘要、§4 平滑 K / INT8 QK / FP16 PV accumulator；OPS 2.1×/2.7× vs FA2/xformers；SageAttention2 不展开 |
| 原论文 HTML | Mistral 7B | https://ar5iv.labs.arxiv.org/html/2310.06825 | 2.3.4 §4.1 | Table 1 8192/4096；Fig.1 $W\times k$≈131K；rolling buffer 32k→8×；16K 时 FA/xFormers 2×；无「无限上下文」 |
| 原论文 HTML | Longformer | https://ar5iv.labs.arxiv.org/html/2004.05150 | 2.3.4 §4.2 | §3 滑窗 $O(n w)$、膨胀 $\ell\times d\times w$、下层不用 dilation、下游 window 512 加 dilation 掉点；字符 LM 2 头膨胀 |
| 原论文 HTML | BigBird | https://ar5iv.labs.arxiv.org/html/2007.14062 | 2.3.4 §4.3.1 / 2.3.2 | Fig.1 三积木；Theorem 1 星图 UA；§3.3 稀疏编解码+任意精度图灵；§3.4 最远向量 $\tilde\Omega(n)$ 层；ITC/ETC；Fig.3 block；NLP 4096 / 8× vs 512 |
| 原论文 HTML | Performers | https://ar5iv.labs.arxiv.org/html/2009.14794 | 2.3.4 §5.2 | Lemma 1 正特征恒等式；trig RFF 不稳定；FAVOR+ = PRF+ORF；$O(L d^2\log d)$ 陈述；号是 2009.14794 不是 2009.00094 |
| 原论文 HTML | Linformer | https://ar5iv.labs.arxiv.org/html/2006.04768 | 2.3.4 §5.3 | $E_i,F_i$ 沿序列 $n\to k$；默认每头一对；三级共享可选；Theorem 1 秩 $\Theta(\log n)$；Theorem 2 $k$ 可不随 $n$；MLM $n{=}512/1024$；$k{=}256$ 下游 92.30 vs RoBERTa 92.25；Table 3 $n{=}512,k{=}128$ 约 1.5×/1.7× |
| 本库专文 | CSA-HCA | `2.3.2/07-CSA-HCA-混合压缩注意力` | 2.3.4 §6.2 | Compressed Sparse / Heavily Compressed；不是 Cross-Layer / Hierarchical |
| 本库 D2 | Hunyuan-Pro CLA | `14.20/01-Hunyuan-Pro/01-01` | 2.3.4 §6.2 | Table 2：CLA 每 2 层共享 KV |
| 原论文 HTML | Linear Transformer | https://ar5iv.labs.arxiv.org/html/2006.16236 | 2.3.4 §5.1 / 2.3.3 | $\phi=\mathrm{elu}+1$ 换核；指数核无限维；$S$ 外积+$Z$；RNN 式 (16)–(20)；MNIST 317× / CIFAR 4462× images/sec；WSJ PER 8.08 vs 5.12；会场 ICML 2020 |
| 原论文 HTML | Reformer | https://ar5iv.labs.arxiv.org/html/2001.04451 | 2.3.4 §4.3.2 | 角哈希 $h=\operatorname{argmax}([xR;-xR])$；Q=K；块 $m=2L/n_{\mathrm{buckets}}$；多轮可在评估加；Table 3 $c=128^2$；RevNet 式 (9)；enwik8-64K / imagenet64 12K；WMT 句<128 不用 LSH；12 层 1.05 bits/dim |
| 原论文 HTML | Routing Transformer | https://ar5iv.labs.arxiv.org/html/2003.05997 | 2.3.4 §4.3.2 | 球面 k-means；质心 EMA $\lambda{=}0.999$；LayerNorm 关 scale/bias；top-k 每质心 $w=n/k$；因果 $K\leftarrow Q$；一半头局部；WT103 15.8；PG-19 33.2 seq 8192；IN64 3.43；enwik-8 0.99（正文 24 层 / Table 3 写 12） |
| 原论文 HTML | RWKV | https://ar5iv.labs.arxiv.org/html/2305.13048 | 2.3.4 §5.1 / 2.3.3 / 2.4.4 | Receptance Weighted Key Value；AFT 改通道衰减 $w_{t,i}=-(t-i)w$；式 (16) 无 $q^\top k$；token shift；Appendix D $(a,b)$；状态 $5DL$；Table 1 $O(Td)/O(d)$；训练 $O(BTd^2)+O(BTd)$；Pile 330B、1024 再微调到 8192；169M–14B；prompt F1 44.2→74.8 |
| 原论文 HTML | Random Feature Attention | https://ar5iv.labs.arxiv.org/html/2103.02143 | 2.3.4 §5.2.3 | Rahimi–Recht sin/cos；单位化 QK；学 $\bm{\sigma}$；$D$ 通常 ≥$d$；RFA-Gate 式 (7)；WT103 Gate-Gaussian 25.0 vs Base 26.2；WMT EN-DE 28.0 vs 28.1 vs elu 21.3；解码 1.8–1.9×；2048 模拟 12× / 显存 <10%；LRA 平均 53.0 |
| 原论文 HTML | Attention Free Transformer | https://ar5iv.labs.arxiv.org/html/2105.14103 | 2.3.4 §5.1.4 | 式 (2) $Y_t=\sigma_q(Q)\odot$ 加权 $V$；无 $QK^\top$；AFT-simple $O(Td)$；AFT-full $O(T^2d)$ 空间 $O(Td)$；AFT-local 窗外 $w=0$ 仍全局连通；分解 $w=u^\top v$ CIFAR 0.6M vs 9.6M；CIFAR 2.74 vs Transformer 2.86；enwik8 1.154 vs 1.130 窗 32 U 形；$T$=4096 测 1.134；IN AFT-conv small 81.0 vs DeiT 79.9；ft DeiT-base 83.4 vs 82.9 vs rand 81.6；窗外 $-\infty$ 79.9 vs 80.8 |
| 原论文 HTML | Synthesizer | https://ar5iv.labs.arxiv.org/html/2005.00743 | 2.3.4 §5.1.5 | ICML 2021；Dense 每 token FFN→$N$；Random 全局 $R$；Fac. Random $k{=}8$ 仍 softmax $N\times N$；WMT EnDe Random 27.27 vs Transformer 27.67；R+V 28.47；LM1B D+V 37.27 vs 38.21；C4 Syn(R) logPPL 1.972 / 4.26 step/s vs DyConv 2.040 / 2.65（摘要 3.5% / 60%）；LightConv 打平 1.972；GLUE R 75.1 vs T5 83.5 vs DyConv 69.4，R+V 84.1；交叉注意力换不掉；Table 7 FR vs Linformer 编码准确率不是 $O(nk)$ |
| 原论文 HTML | Lightweight and Dynamic Convolutions | https://ar5iv.labs.arxiv.org/html/1901.10430 | 2.3.4 §5.1.6 | ICLR 2019 FAIR；LightConv depthwise+softmax+$H\times k$ 共享（1024/7 时 112 权重）；DynamicConv $f(X_i)$ 线性；换自注意力、交叉注意力仍在；WMT En-De Dyn 29.7 vs Ott 29.3；IWSLT +0.8；Table 3 P100 62.6 vs 52.1 sent/s ≈20%；无 softmax 发散；Billion Word 26.67 vs 26.73；CNN-DM Dyn R1 39.84 vs 39.26，截 400 tok；不是 CVPR 2020 那篇 |
| 原论文 HTML | Sparse Sinkhorn Attention | https://ar5iv.labs.arxiv.org/html/2002.11296 | 2.3.4 §4.3.2 | ICML 2020；SortNet 块池化 + Sinkhorn–Knopp 得双随机 $R$；排完仍局部 $QK$+原局部；Mixture 二次；SortCut 编码 $O(\ell N_k)$；LM1B Base 40.79 vs Transformer 41.57；排序 EM 49.24 vs 45.69；CIFAR 正文写 3076 bits；$N_k{=}0$ PPL 52.40；不是 mHC |
| 原论文 HTML | Star-Transformer | https://ar5iv.labs.arxiv.org/html/1902.09113 | 2.3.4 §4.3.1 | NAACL 2019 N19-1133；卫星 context 长 5；中继 MultiAtt $n{+}1$；一层 $O(6nd)$；SST 52.9 vs 50.4；MTL-16 均 86.98 vs 82.78、时间 4.5×；SNLI 86.0 vs 82.2；消融去环/去径向；不是 BigBird、不是 NVIDIA Star Attention |
| 原论文 HTML | Star Attention | https://ar5iv.labs.arxiv.org/html/2411.17116 | 2.3.4 §4.3.1 / 6.1.1 / 9.4 | NVIDIA；Phase 1 锚 $c_1$ 拼块、丢掉锚 KV、host 不通信；Phase 2 query-host 聚合 $A_h,s_h$；相对 Ring：8B RULER 128K -1.90%/2.7×；70B 64K -1.44%/4.7×；1048K 模型 256K 10.8×、1M -5.32%/16.9×；无锚 NIAH 60.11；Table 6 128K vanilla OOM；不是 2019 编码器 |
| 原论文 HTML | Ring Attention | https://ar5iv.labs.arxiv.org/html/2310.01889 | 6.1.1 §4.3 | ICLR 2024；BPT 之后切序列维；`ppermute` KV；激活 $6bch$；A100 NVLink 最小 $s$ 6.2K、IB 149.5K；Table 3 7B 8×A100 256K、32×A100 4096K、TPUv4-1024 8192K（512× vs BPT）；1 亿是 $n\times$ 单机 BPT 外推；Table 4 MFU HTML 未转出；不是 Star Attention |
| 原论文 HTML | DeepSpeed Ulysses | https://ar5iv.labs.arxiv.org/html/2309.14509 | 6.1.1 §4.2 | 2023-09；序列 $N/P$ → All-to-All → 全序列少数头 → 再 A2A；每链路 $4Nh/P$；$N$ 与 $P$ 同比则体积不变；$P$ 不能大于头数；Table 1 vs ColAI-SP / Megatron-SP；Table 2 131072@64GPU 165.53 TFLOPs；Table 3 弱扩展 147.4；摘要 175/54%/2.5×/4× 图上没转表；ZeRO-3 跨 SP∪DP；不是 Ring、不是 Star Attention |
| 原论文 HTML | Reducing Activation Recomputation | https://ar5iv.labs.arxiv.org/html/2205.05198 | 6.1.1 §4.5 / §5 | Korthikanti et al.；SP 只切 LN/Dropout；$g$ AG↑ RS↓、$\bar g$ 相反；带宽=四个 All-Reduce；式 (4)(5)(6)；$s=2048$；Table 4 22B 一层 4% vs 整层 39%；Table 5 1T 32.1% / MFU 56.3%；530B×8 DP=2240 卡 39.15s MFU 54.2%；选择性重算 GPT-3 70%/2.7%；不是 Ulysses 换头 |
| 原论文 HTML + ACL | Sequence Parallelism / RSA | https://ar5iv.labs.arxiv.org/html/2105.13120 ；https://aclanthology.org/2023.acl-long.134/ | 6.1.1 §4.6 | Li/Xue/Baranwal/Li/You；ACL 2023 long 2391–2404；Ulysses 称 ColAI-SP；参数每卡一份；RSA 先转 K 得 $S\in\mathbb{R}^{L/N\times L}$ 再转 V；只写双向；通信合计 $8(N-1)BZ(L/N)A$；MLP 更省当 $BL>32H$；Piz Daint P100；13.7× batch=64 卡 SP vs 12 卡 TP（Base 头数）；3.0× 序列 64 卡 batch 64；Linformer 114K / 27× 在 32 卡 batch 4；Table 4 PP=8 弱扩展；4D 留作未来 |
| 原论文 HTML | Blockwise Parallel Transformer | https://arxiv.org/html/2305.19370 | 6.1.1 §4.7 | Liu/Abbeel；NeurIPS 2023；外层 $B_q$ 内层 $B_{kv}$；$\mathrm{Output}_i=\mathrm{FFN}(\mathrm{Attn}_i+Q_i)+\mathrm{Attn}_i+Q_i$；一层激活 $2bsh$（FA/ME 一层 $8bsh$）；KV 环内 $4bch$+$19bch$ 被 $2bsh$ 盖住；与 SP 正交；全精度无 DP；Table 1 13B $d_{\mathrm{model}}=5140$；Table 2 同行 vs vanilla **8×**（摘要 32× 不在同一行）、vs ME 2–4×；Table 3 131K 仅 BPT 79/78GB；Table 4 1B 8GPU 8K 1.17× / 16K 1.2× / 64K 仅 BPT 600；Table 5 ExoRL 32 轨均 **111.13**（HTML 散文 64/155.36 与表矛盾，以表为准）；不是 Ring、不是 FA |
| 原论文 HTML | Self-attention Does Not Need $O(n^2)$ Memory | https://arxiv.org/html/2112.05682 ；abs https://arxiv.org/abs/2112.05682 | 00-MEA | Rabe & Staats；lazy softmax 式 (1)；running max 分数 $\ge 89$；单 query $O(1)$、self-attn $O(\log n)$、TPU 实用 $O(\sqrt{n})$；默认 query 1024 / key 4096；`jax.checkpoint`；Table 2 $n=2^{14}$ 1GB→17MB、摘要 59×；Table 3 2.0GB→64MB、摘要 32×；WMT 100K acc 62.69 vs 62.59、lr 0.005、关 packing；Jang 2019 lazy softmax 再发现；不是 FA |
| 官方仓库 | google-research memory_efficient_attention | https://github.com/google-research/google-research/tree/master/memory_efficient_attention | 00-MEA | README：Colab 对照标准注意力；需 TPU runtime |
| 原论文 HTML | FlashAttention Appendix B.5 | https://ar5iv.labs.arxiv.org/html/2205.14135 | 00-MEA / 2.3.4 §3.0 | 三条差：峰值 vs IO；K 份摘要 vs 一份增量 $O$；checkpoint vs 解析反向；FA 2–4×，Rabe 同速或略慢 |
| 口述再搜 | Connest5 | WebSearch 2026-08-30 | 留条 | 未命中官方模型名；命中 Connic（connic.co / `connic/*` 托管 ID），不是 Connest5 |
| 原论文 HTML | Efficient Streaming Language Models with Attention Sinks | https://arxiv.org/html/2309.17453 ；abs https://arxiv.org/abs/2309.17453 ；https://openreview.net/forum?id=NG7sS51zVF | 10-StreamingLLM | ICLR 2024；式 (1) $x_1\gg x_j$；式 (2) SoftMax₁；默认 4 sink；Table 1 Llama-2-13B 0+1024 **5158.07** / 4+1020 **5.40** / 4\\n **5.60**；Table 2 Llama-2-7B 0+4096 **3359.95** / 4+4092 **9.59**；Falcon 1 个起始位已够；cache 内赋位 [0..7] 不是原文下标；RoPE 存未旋转 Key；ALiBi 连续偏置；Figure 5 4M token；§4.5 相对重算最多 **22.2×**、A6000、HF Transformers、Llama-2-7B/13B；160M×143k step、batch 256、Pile；Table 3 Learnable Sink 1+1023 **18.01**；Table 5 流式 ARC 7B-Chat 71.34 vs window 3.58；Table 6 加大 cache 不单调；Impact：TRT-LLM / Intel / HF / MLC；不是 FA / H2O |
| 官方仓库 | mit-han-lab/streaming-llm | https://github.com/mit-han-lab/streaming-llm | 10-StreamingLLM | ICLR 2024 代码 |
| 博文 | Attention Is Off By One | https://www.evanmiller.org/attention-is-off-by-one.html | 10-StreamingLLM | SoftMax₁；论文 Zero Sink |
| 官方 PDF | gpt-oss-120b & 20b Model Card | https://cdn.openai.com/pdf/419b6906-9da6-406c-a19d-1bb078ac7637/oai_gpt-oss_model_card.pdf | 10-StreamingLLM / 07-CSA-HCA | 每头 softmax 分母 learned bias；引 [16] Miller [17] 2309.17453；可 pay no attention |
| 库内 mineru | DeepSeek-V4 式 (27) | 库内 `14.1/.../03-DeepSeek-V4-mineru-en.md` | 07-CSA-HCA / 10-StreamingLLM | $s_{h,i,j}$ 分母 $+\mathrm{Exp}(z'_h)$；行和可 ≠1 |
| 原论文 HTML | When Attention Sink Emerges | https://arxiv.org/html/2410.10781 ；abs https://arxiv.org/abs/2410.10781 | 10-StreamingLLM | ICLR 2025 Gu et al.；key bias；sigmoid 注意力训到 1B 无 sink；小 lr 不明显、weight decay 助长 |
| 原论文 HTML | Why do LLMs attend to the first token? | https://arxiv.org/html/2504.02732 ；abs https://arxiv.org/abs/2504.02732 | 10-StreamingLLM | Barbero；over-mixing；Llama 3.1 Table 1 sink metric $\epsilon=0.8$：8B **45.97** / 70B **73.49** / 405B **78.29**（16128 头）；约 80% 头；典型 prompt 质量占比另写 80% 在 bos，不要混 |
| 已有台账 | Star Attention Table 2 | https://ar5iv.labs.arxiv.org/html/2411.17116 | 2.3.4 / 10-StreamingLLM | StreamingLLM 对照是 **1000 sink + 窗 8000**：RULER 均 **45.07** vs Full **85.21**；不是 Xiao 默认 4 |
| 博文 | How Attention Sinks Keep Language Models Stable | https://hanlab.mit.edu/blog/streamingllm | 10-StreamingLLM | 2025-08；对接 gpt-oss 标量 vs 占位 token |
| 原论文 HTML | H2O: Heavy-Hitter Oracle | https://arxiv.org/html/2306.14048 ；abs https://arxiv.org/abs/2306.14048 | 11-H2O | NeurIPS 2023；30B bs128 seq1024 → 180GB；阈值=行 max 的 1%、OPT Wiki-Text-103 稀疏 >95%；local H2 = 已见 token 累加，oracle 未来求和 impractical；Algorithm 1 $F_{\mathrm{score}}(T)=\sum o_s$ 每步最多踢 1；§5.1 evenly assigns H2 与最近 KV；20% = 总 cache；Table 1 caption 未点名模型 Full PiQA 80.09 / COPA 81.00 / Local 57.94 / H2O 79.22；Table 2 OPT-30B 20% Full COPA 85.00 / Local w.o. H2 48.00 / w. H2 84.00；Local 在 LLaMA-13B XSUM 与 LLaMA-7B CNN-DM 60% 崩、H2O 20% 仍贴满；Table 3 T4 512+512 30B Accel 0.6 vs H2O 18.83；Table 4 XSUM 6.7B FlexGen 10.80 vs 30.40；Table 5 A100 2048+2048 6.7B bs24 99.5s→53.5s、494.1→918.9、bs64 FlexGen OOM H2O 1161.0；Table 6 OPT-30B 4bit 可叠；Table 9 只 H2 或只 local 掉 2.85%–22.75%；Q1 叠 StreamLLM 到 4M、PG-19 PPL 优于原方法；Theorem 4.4 informal $(1-\alpha)(1-1/e)$；不 swap 填槽；不是 FA / StreamingLLM |
| 会议页 | NeurIPS 2023 H2O | https://proceedings.neurips.cc/paper_files/paper/2023/hash/6ceefa7b15572587b78ecfcebb2827f8-Abstract-Conference.html | 11-H2O | 会场 NeurIPS 2023，不是 2024 |
| 官方仓库 | FMInference/H2O | https://github.com/FMInference/H2O | 11-H2O | 论文摘要给出的代码 |
| 实验室博文 | KV Cache Compression and Its Infra Problems | https://research.nvidia.com/labs/eai/blogs/kv-cache-compression-and-its-infra-problems/ | 11-H2O §7 | FA 不落注意力分数；paged 驱逐还不了整页；H2O 参考实现退回 eager；H2O 论文系统实验是 FlexGen |
| 原论文 HTML | Quest: Query-Aware Sparsity | https://arxiv.org/html/2406.10774 ；abs https://arxiv.org/abs/2406.10774 ；PDF https://arxiv.org/pdf/2406.10774 | 13-Quest | ICML 2024；全量 KV 驻 GPU；页 min/max；Fig 9 32K/2048 **7.03×** 自注意力；Fig 10 同设置 4-bit **2.23×** e2e / FP16 **1.74×**；Table 1 10k/100k passkey；LongBench 正文 1K；§3.5 8× 按 token budget 4K |
| 会场页 | ICML 2024 Quest | https://proceedings.mlr.press/v235/tang24l.html | 13-Quest | PMLR 235:47901–47911；**网页摘要把 2.23× 与 7.03× 对调**，弃摘要 |
| 项目页 | HAN Lab Quest | https://hanlab.mit.edu/projects/quest | 13-Quest | LongBench 写 2k，正文 1K，弃项目页 |
| 官方仓库 | mit-han-lab/Quest | https://github.com/mit-han-lab/Quest | 13-Quest | FlashInfer kernel；2024-10 Llama-3.1/Mistral 是仓库后续 |
| 原论文 HTML | SnapKV: LLM Knows What You are Looking for Before Generation | https://arxiv.org/html/2404.14469v2 ；abs https://arxiv.org/abs/2404.14469 | 12-SnapKV | NeurIPS 2024；观测**窗**在 prompt 末尾；**每个 head** 选成簇 KV；Listing 1；Table 1 LongBench；§5.1.2 16k·bs=2 时 >100ms vs <40ms ≈3.6×，同 batch 16k OOM vs 131k ≈8.2×；NIAH 380k / 基线 33k OOM / cache 1024 |
| 会场页 | NeurIPS 2024 SnapKV | https://proceedings.neurips.cc/paper_files/paper/2024/hash/28ab418242603e0f7323e54185d19bde-Abstract-Conference.html | 12-SnapKV | hash `28ab418242603e0f7323e54185d19bde` |
| 会场 PDF | NeurIPS 2024 SnapKV PDF | https://proceedings.neurips.cc/paper_files/paper/2024/file/28ab418242603e0f7323e54185d19bde-Paper-Conference.pdf | 12-SnapKV | $k=\lfloor(1-p)L_{\mathrm{prefix}}\rfloor$（HTML 写 $p\times$）；实现以 Listing `max_capacity_prompt - window_size` 为准 |
| 会场海报 | NeurIPS 2024 poster 93531 | https://neurips.cc/virtual/2024/poster/93531 | 12-SnapKV | 作者与摘要一致 |
| 官方仓库 | FasterDecoding/SnapKV | https://github.com/FasterDecoding/SnapKV ；https://raw.githubusercontent.com/FasterDecoding/SnapKV/main/snapkv/monkeypatch/snapkv_utils.py | 12-SnapKV | `update_kv`：窗末 query 投票 → pool1d → topk(capacity−window) → cat 观测窗；默认 avgpool / 窗 32 / 容量 2048 / kernel 5；`transformers>=4.36` |
| 知乎（只学讲法） | 硅基捕手维克托 SnapKV | https://zhuanlan.zhihu.com/p/2036468489322501664 | 12-SnapKV | 末尾窗投票 + 1D pooling；「16K 扩到 380K」未采用 |
| 知乎（只学讲法） | Zachary SnapKV | https://zhuanlan.zhihu.com/p/704710823 | 12-SnapKV | 容量算术 256=240+16 与 Listing 一致；数字未进正文 |
| 原论文 HTML | Transformers are Multi-State RNNs | https://arxiv.org/html/2401.06104 ；abs https://arxiv.org/abs/2401.06104 ；PDF https://arxiv.org/pdf/2401.06104 | 17-TOVA | EMNLP 2024；式 (1)–(9)；Alg. 1 层内 mean+argmin；Table 3 TOVA-layer；Figure 3 的 1/8 距 topline 0.4 PPL |
| 会场 PDF | EMNLP 2024 Anthology | https://aclanthology.org/2024.emnlp-main.1043.pdf | 17-TOVA | Table 1 Maximal batch 139/70/35/17/8；吞吐 8.5/4.8/3.1/1.7/1；Memory 0.15/0.28/0.56/1.11/2.18 |
| 官方仓库 | schwartz-lab-NLP/TOVA | https://github.com/schwartz-lab-NLP/TOVA | 17-TOVA | `mean` + `topk(cache_size)`；`transformers==4.36.2` |
| 知乎（只学讲法） | 夕小瑶 TOVA 专栏 | https://zhuanlan.zhihu.com/p/677482083 | 17-TOVA | 只学讲法；数字未进正文 |
| 原论文 HTML v4 | PyramidKV Information Funneling | https://arxiv.org/html/2406.02069v4 ；abs https://arxiv.org/abs/2406.02069 | 14-PyramidKV | COLM 2025 Spotlight；式 (1)–(3)；Table 1–2；Appendix P Table 15 NIAH |
| 官方仓库 | Zefan-Cai/KVCache-Factory | https://github.com/Zefan-Cai/KVCache-Factory | 14-PyramidKV | `PyramidKVCluster`：min_num/max_num、窗 64、kernel 5、avgpool、β=20 |
| 知乎（只学讲法） | 量子位 PyramidKV | https://zhuanlan.zhihu.com/p/703313505 | 14-PyramidKV | 学层间不该均一；2.5%/0.2%/65.0 未采用 |
| 原论文 HTML | FastGen Adaptive KV | https://arxiv.org/html/2310.01801 ；abs https://arxiv.org/abs/2310.01801 ；ICLR hash 639a9a172c044fbb64175b5fad42e9a5 | 15-FastGen | ICLR 2024 Oral；式 (1)(2)；Table 1–4；Algorithm 1–2 |
| 官方仓库 | machilusZ/FastGen | https://github.com/machilusZ/FastGen | 15-FastGen | 几乎空；README 指 cold-compress / MInference |
| 知乎（只学讲法） | FastGen 双阶段 | https://zhuanlan.zhihu.com/p/697596163 ；https://zhuanlan.zhihu.com/p/1916511096921104528 | 15-FastGen | 44.9%/45% 与 Table 1 冲突，弃 |
| 原论文 | Scissorhands Persistence of Importance | https://arxiv.org/abs/2305.17118 ；NeurIPS https://proceedings.neurips.cc/paper_files/paper/2023/hash/a452a7c6c463e4ae8fbdc614c6e983e6-Abstract-Conference.html | 16-ScissorHands | NeurIPS 2023；Algorithm 2；$w=400$、$r=10$、$m=0.5B$；Table 1–4 |
| 官方仓库 | lzcemma/Scissorhands | https://github.com/lzcemma/Scissorhands | 16-ScissorHands | C4 `hf_opt_dropkv.py`；Generation Coming Soon；$w$ 脚本 100 vs 论文 400 |
| 知乎（只学讲法） | Scissorhands 专栏 | https://zhuanlan.zhihu.com/p/17195508439 ；https://zhuanlan.zhihu.com/p/708946312 | 16-ScissorHands | 8×A100-50G 未采用 |


**没出现在这张表里的数字和架构断言，不准写进正文。**

## 口述技术名词（搜索经常找不到，禁止删条）

| 口述 | 试过的别名 / URL | 档 已有/补写/未找到 | 落到哪 |
|------|-------------------|---------------------|--------|
| 优化器 Muon / MuonClip / Polar Express | Muon 库内专题；MuonClip=K2 arXiv:2507.20534；Polar Express=arXiv:2505.16932 | 已有 01 NS 推导 + **05 对照专文** | 第 6.5 |
| mHC / MHC | Manifold-Constrained Hyper-Connections；库内 01 文 | 已有专文 | 第 2.1.3 |
| XHC / xHC | **Expanded Hyper-Connections** arXiv:2607.14530；GitHub aHapBean/xHC | **专文已写** `02-xHC-Expanded-Hyper-Connections.md` | 第 2.1.3 |
| ResidualAttention / AttnRes | Attention Residuals arXiv:2603.15031；K3 用 Block 版 8×~12 层 | 已有 2.2.2 专文 + K3 用法修订 | 第 2.2 |
| HCA / CSA | Compressed Sparse + Heavily Compressed；DeepSeek-V4 | 已有 2.3.2/07 | 第 2.3 |
| QSA | Qwen Sparse Attention；tech_report §2.1.2 | **专文已写** `08-QSA-Qwen稀疏注意力.md` | 第 2.3.2 |
| Gated Residual / GR | Qwen3.8-Next §2.2；四分支逐元素读门、无 $H_{\mathrm{res}}$ | **专文已写** `03-Gated-Residual.md` | 第 2.1.3 |
| KDA | Kimi Delta Attention arXiv:2510.26692；K3 加 $g_{\min}=-5$ 与满秩门 | **专文已写** `01-Kimi-Delta-Attention-KDA.md`（含 §5 K3 改写） | 第 2.3.3 |
| SiTU-GLU | Sigmoid Tanh Unit GLU；K3 §2.3.2；$\beta_1=4,\beta_2=25$，界 100 | **专文已写** `01-SiTU-GLU.md` | 第 2.1.1 |
| Stable LatentMoE / QB | LatentMoE arXiv:2601.18089；K3 加 RMSNorm + SiTU + Quantile Balancing | **专文已写** `10-Stable-LatentMoE与Quantile-Balancing.md` | 第 2.4.1 |
| Per-Head Muon | K3 §2.5；按头 NS，不是新 polar | 已写入 05-MuonClip §1.1 | 第 6.5 |
| MoonEP | 完美均衡 EP；https://github.com/MoonshotAI/MoonEP | 6.1 修订指针，不另起教材 | 第 6.1 |
| IndexPool | GLM-5.3-Flash；四条 indexer key 加权池化；公式未公开 | **专文已写** `09-IndexPool.md` | 第 2.3.2 |
| Anticipatory Routing | V4 mineru §4.2.3；$\theta_t$ 算特征、$\theta_{t-\Delta t}$ 算路由；spike 时才开，约 20% wall-time | **已写入 6.1.7** | 第 6.1 |
| SwiGLU Clamping | V4：线性 $[-10,10]$，gate 上限 10 | **已写入 6.1.7**；不要写成 SiTU-GLU | 第 6.1 |
| IcePop | GLM-5 GRPO；$\rho$ pop 到 $[1/\beta,\beta]$；去 KL | 4.5 链路文 + GLM-5 D2；**6.1.7 收本体轴** | 第 6.1 / 4.5 |
| MIS-PO | Step-3.5-Flash；二元掩码过滤离分布样本 | D2 已有；**6.1.7 指针** | 第 6.1 |
| Routing Confidence | Step-3.5-Flash；激活专家概率质量平均，当 MoE RL 稳定性代理 | D2 已有；**6.1.7 一句** | 第 6.1 |
| Connest5 | WebSearch 2026-08-30；命中 Connic（connic.co / `connic/*`），不是模型名 | **未找到** 官方串 | 留条，禁止 mkdir |
| Attention Sink / StreamingLLM | arXiv:2309.17453；ICLR 2024；gpt-oss 标量；V4 $z'$ | **专文已写** `10-StreamingLLM与Attention-Sink.md` | 第 2.3.2 |
| Quest / Query-Aware Sparsity | arXiv:2406.10774；ICML 2024；页 min/max；不驱逐 | **专文已写** `13-Quest-查询感知稀疏.md` | 第 2.3.2 |
| TOVA / Token Omission Via Attention | arXiv:2401.06104；EMNLP 2024；当前步最低分；层内平均 | **专文已写** `17-TOVA-注意力省略.md` | 第 2.3.2 |
| PyramidKV / Information Funneling | arXiv:2406.02069；COLM 2025；层间等差；不是 Sinks | **专文已写** `14-PyramidKV-层间漏斗.md` | 第 2.3.2 |
| FastGen / Adaptive KV | arXiv:2310.01801；ICLR 2024 Oral；按头 profiling | **专文已写** `15-FastGen-按头自适应.md` | 第 2.3.2 |
| ScissorHands / Persistence of Importance | arXiv:2305.17118；NeurIPS 2023；pivotal；5×=内存 | **专文已写** `16-ScissorHands-重要性持久.md` | 第 2.3.2 |
| SnapKV / observation window | arXiv:2404.14469；NeurIPS 2024；观测窗 + per-head；不是观察头 | **专文已写** `12-SnapKV-生成前观测窗.md` | 第 2.3.2 |
| OPD / On-Policy Distillation | MiniLLM 2306.08543；GKD 2306.13649；**不是** Online Preference Distillation | **排队**：KV 四篇交完再勘误 `01-OPD基础原理` | 第 4.6 |
| OPSD | Self-Distilled Reasoner arXiv:2601.18734 | **排队** `02-OPSD-自蒸馏` | 第 4.6 |
| SDPO | Reinforcement Learning via Self-Distillation arXiv:2601.20802 | **排队** `04-SDPO` | 第 4.6 |
| MOPD | K3 式 (15)；MiMo-V2-Flash §4.1；V4 叫多教师 OPD 式 (29) | **排队** 新文 `09-MOPD` | 第 4.6 |

## 2026 模型分级（P2，先填再写）

| 口述/检索名 | 官方名（URL） | 档 S/A/B/不写 | 依据 | 落到哪 |
|-------------|---------------|---------------|------|--------|
| Qwen3.8 / Flash Next | Qwen3.8-Flash-Next；生产 API `qwen3.8-flash` | **S** | 新注意力 QSA + GR + N-gram Embedding + Muon 配方；开源权重；Qwen4 架构预览。报告已读 | `14.2/13-Qwen3.8-Flash-Next/01-...`；trick 在第 2/6 章 |
| Qwen3.8-Flash（云上 SKU） | 同报告的生产档，1M 默认 | **B** | 同一架构的 serving SKU | 禁止新开空文件夹 |
| Kimi K3 | Kimi K3 arXiv:2607.24653 | **S** | 2.8T MoE、KDA + AttnRes、Stable LatentMoE、开源权重 | `14.5/05-Kimi-K3/01-...`；trick 在第 2/4/6 章 |
| K2.7 coding | Kimi K2.7 Code；https://www.kimi.ai/resources/kimi-k2-7-code ；HF moonshotai/Kimi-K2.7-Code | **A** | 官方 built upon K2.6；HF：与 K2.5/K2.6 同架构 | **已写** `14.5/06-Kimi-K2.7-Code/01-...`；MLA 只链第 2 章 |
| GLM-5.3-Flash | https://docs.z.ai/guides/vlm/glm-5.3-flash ；HF zai-org/GLM-5.3-Flash | **S** | 新训基座；混合 KDA+稀疏 MLA、IndexPool、mHC、原生多模态、MIT | `14.6/12-GLM-5.3-Flash/01-...`；trick 在第 2/9 章 |
| GLM-5.3 非 Flash | vLLM：约 743B/39B，架构同 5.2 | **B** | serving 对照，不是 Flash 那套混合骨架 | 禁止 mkdir |
| Meta Muse | Muse Spark（安全/准备报告，非 MLA 级架构论文） | **A** | https://ai.meta.com/static-resource/muse-spark-safety-and-preparedness-report ；arXiv:2606.12429 | **已写** `14.3/05-Muse-Spark/01-Muse-Spark-公开材料精读.md` |
| Muse Spark Contemplating / 1.1 | 同家族推理/API 增量 | **B** | 同安全框架上的 SKU | 禁止空目录 |
| Claude Fable 5 | https://www.anthropic.com/claude/fable ；platform models overview | **A** | 第五代公开旗舰；无层表；2026-06-09 | **已写** `14.13/19-Claude-Fable-5/01-...` |
| Claude Opus 5 | https://www.anthropic.com/research/claude-opus-5 （2026-07-24） | **A** | 半价接近 Fable；Fast mode 不 mkdir | **已写** `14.13/20-Claude-Opus-5/01-...` |
| Claude Mythos 5 | 开发者文：同 Fable 能力、无分类器、Glasswing | **B** | 限量；不 mkdir | `18-Claude-Mythos` 枢纽 |
| Claude Sonnet 5 | 总览表有 ID | **B** | 同代速度档 | 禁止 mkdir |
| GPT-5.6 Sol | https://openai.com/index/gpt-5-6/ ；deploymentsafety.openai.com/gpt-5-6 | **A** | GA 2026-07-09；无架构 PDF；Preparedness High bio/cyber | **已写** `14.12/26-GPT-5.6-Sol/01-...` |
| GPT-5.6 Terra / Luna | 同篇三档 | **B** | 同代 SKU | 写在 Sol 篇，禁止 mkdir |
| Connest5 | WebSearch 2026-08-30；connic.co 是欧盟托管平台 `connic/*`，不是模型名 | **未找到** 官方模型串 | 留条，不写、不 mkdir |
| DeepSeek V4 Flash | 同一份 `DeepSeek_V4.pdf`（Pro+Flash） | **B** | 284B/13B、43 层、32T；1M 下相对 V3.2 FLOPs 10% / KV 7%；不另开目录 | `14.1-DeepSeek.md` 一行 + 已有 `10-DeepSeek-V4` |

## 预训练记忆拦截

若某段话没有上行来源：标 `[OM-FREEPLAY]` 或删掉去补读。不要用「模型内部知识」冒充读过。不要只记中文链接。稳定性事故与训推对策若报告里有、台账里没有，视为没读。
