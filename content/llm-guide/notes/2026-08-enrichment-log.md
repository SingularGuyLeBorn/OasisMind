---
title: "2026-08 补全进度账"
date: 2026-08-30
tags: [ops, llm-guide]
published: false
excerpt: llm-guide 2026-08 知识补全账本。只追加、不删除。
category: LLM 指南
---

# 2026-08 补全进度账

as_of: 2026-08-30

本账只记录**新增与写满**，不删任何既有文件。

## 1. 盘点（开工）

### 提纲占位（P0-A）

| 文件 | 状态 |
|------|------|
| `14.7-StepFun/02-Step-3/02-Step-3核心架构剖析.md` | 空六段 |
| `14.6-GLM/10-GLM-5V-Turbo/02-GLM-5V-Turbo多模态Agent架构剖析.md` | 空六段 |
| `14.6-GLM/04-GLM-4-Voice/02-GLM-4-Voice核心架构剖析.md` | 空六段 |
| `14.5-Kimi/02-Kimi-K2/02-Kimi-K2核心演化剖析.md` | 空六段 |
| `14.3-LLaMA/02-Llama-2/03-Llama-2-RLHF与安全对齐精读.md` | 空六段 |

另：`14.8-MiniMax/01-ABAB/04-ABAB-mineru-zh.md` 标 `status: pending` 是「无独立 PDF」说明，不是提纲空壳，保留。

### 配图占位（P0-C）

- `GPT-Image-2 Prompt`：自注意力 3、RoPE/位置编码 5、归一化 2、残差 3
- `IMAGE PLACEHOLDER`：Mistral-AI 3、Agent 安全 2
- 文末「图片占位建议」：2.2、2.3、2.3.1、2.3.2、2.3.3

### 空壳 D2/D5（P0-B）

约 120 篇 &lt;1.5KB 的第 14 章精译/专题/Index，集中在 Gemini、OpenAI 早期、Claude。同目录常已有长 D5，空壳仍按标题写满。

### 第 14 章家族（相对 2026-08，P2 差很远）

已有目录上限大约：DeepSeek→V4；Qwen→3.7；Kimi→K2.6（无 K3）；GLM-5.1 / 5V-Turbo；OpenAI→GPT-5.5；Claude→Mythos / Opus-4.7；Step-3.5-Flash；Llama-4。

作者点名、多数尚未按 0.4 精读拆技术：Qwen 3.8 系列与 **Flash Next**；Kimi **K3**、K2.7 coding；GPT-5.6 线；Claude 4.8 / Fable / Opus 5；Meta **Muse**；DeepSeek V4 Flash / 正式版是否独立报告；GLM-5.2 / 5.3 / 5.3 Flash。

下一步：按 `goal-maximize-value-extreme.md` 0.6 节先标 S/A/B，禁止为 B 档 SKU 建空目录。

### 导论漂移

第 1 章仍画「八章全景」；总索引已是 14 章。P1 改导论对齐，不删 13/14。

---

## 2. 本轮落地

（下面随工作追加）

---

## 3. 2026-08-30 会话：worktree + 主题树 + 知识图谱 + 9.1.2

- worktree：`D:\ALL IN AI\OasisMind-llmguide-2026-08`，分支 `feat/llm-guide-2026-08-notes`。未 commit。
- **P0-A 复核**：日志 §1 所列五篇提纲在磁盘上已是 `status: completed`（Step-3 / GLM-5V-Turbo / GLM-4-Voice / K2 / Llama-2 RLHF）。不要当空壳重写。
- **主题树**：打勾表见 `1.1-学习路线与知识图谱/知识图谱-2026-08.md`。**xHC、MuonClip/Polar Express 专文已补。** 仍缺：DLM 指针、omni 地图、第 14 章空壳、P2 S 档精读。**9.1.3 / 9.1.4 已成文。**
- **GPU/Infra 缺口**：第 9 章原 7 篇 md。已新增 `9.1.2`、`9.1.3`、`9.1.4`。9.1 勘误 B200 **180GB**（HGX/DGX），不是 192GB。Rubin ≠ B300。昇腾 910C 单卡 FLOPS **未找到一手**，9.1.4 只写 CloudMatrix 产品名。
- **口述名词**：xHC = Expanded Hyper-Connections，arXiv:2607.14530。未从主题树删除。
- **P2 分级**：Qwen3.8-Flash-Next S（已建）；Kimi K3 S（已建）；GLM-5.3-Flash S（已建）；Muse Spark A。详见 `notes/live/PROCESS.md`。
- 因水印停用：无删除。9.1.2 改引新图，旧金字塔图文件仍在。

## 4. 2026-08-30 续：9.1.3 / 9.1.4 + 部分 P0-C

- 新增 `9.1.3-卡间互联与集群拓扑.md` + `fig-nvlink-nvl72-ib-topology.png`。官方口径：NVLink 4/5/6 = 900 / 1800 / 3600 GB/s 每 GPU；GB200 NVL72 = 72 卡 / 130 TB/s；Vera Rubin NVL72 = 260 TB/s；IB NDR 400 Gb/s、XDR 800 Gb/s。
- 新增 `9.1.4-加速器全景.md`。AMD MI300X/MI350X、TPU v6e/TPU7x、Gaudi 3 用产品页；华为 CloudMatrix 有官方文章但 **910C 单卡数据表 Access Denied**，未编 FLOPS。
- P0-C 已嵌：自注意力 3 图、Agent 安全 2 图、残差对照图 1、LayerNorm vs RMSNorm、RoPE 2D 旋转。剩余 prompt 见 `notes/live/PLAN.md`。
- 未 commit。

## 5. 2026-08-30 续：xHC + MuonClip/Polar Express + 导论 14 章

- 新增 `2.1.3/02-xHC-Expanded-Hyper-Connections/02-xHC-Expanded-Hyper-Connections.md` + `fig-xhc-dense-read-sparse-write.png`。一手 arXiv:2607.14530。2.1.3 修订节改为链专文，不再写「尚未写成」。
- 新增 `6.5/Muon/05-MuonClip与PolarExpress.md` + `fig-muonclip-polar-express.png`。Polar Express HTML（2505.16932）+ K2 mineru Algorithm 1（2507.20534）+ Step-3.5-Flash BF16→float16。第 5 章 Kimi 文勘误：QK-Clip 不是梯度裁剪。
- 第 1 章 `1-导论与基础.md` / `index.md` 保留八章 ASCII，追加 14 章修订；`1.3` 追加 2025H2–2026-08 修订（S 档只点名、未 mkdir）。
- 知识图谱：XHC / MuonClip / Polar Express 三行从缺/薄改为已有。
- 新增 `2.4.7-扩散语言模型DLM指针.md`；2.4 索引补上本已存在的 2.4.6 MTP。LLaDA https://arxiv.org/abs/2502.09992。不抄 `diffusion-llm` 全书。
- 未 commit。

## 6. 2026-08-30 续：第 8 章 omni 地图 + Mistral-7B D2

- 新增 `8.7-Omni与全双工/8.7-Omni与全双工.md` + `images/fig-omni-cascade-e2e-duplex.png`（GenerateImage 自绘，无水印）。
- 一手：GLM-4-Voice arXiv:2412.02612（12.5 Hz / 175 bps）；MiniCPM-o 4.5 arXiv:2604.27393（$t=1.0$ s、LS、TAIL）；GPT-4o System Card arXiv:2410.21276（232 / 320 ms，无公开 tokenizer）；Astra 官方页（研究原型 → Gemini Live）。
- `8-多模态.md` / `8.3` / `8.5` 追加 2026-08 修订，不删 2025 原文。知识图谱 omni 行改为已有。
- 写满 `14.14/.../01-01-Mistral-7B-架构精译.md`（arXiv:2310.06825 Table 1：`context_len=8192`）。`05-01` 空壳改为枢纽，不造第三份 GQA/SWA D5。旧 D5 与第 5 章副本勘误 32K 窗口。
- 因水印停用：无（本篇新图）。未把 Mistral 博文直方图入库。
- 未 commit。

## 7. 2026-08-30 续：Mixtral / Large D2 + Claude 1–2.1 + 9.4 服务栈图

- Mixtral D2（上轮已落盘，本轮补进台账）：arXiv:2401.04088；47B 总 / 13B 活跃；稠密 32k；Table 2 HumanEval **40.2%**；论文未声明 auxiliary loss。
- 写满 `01-03-Mistral-Large-架构精译.md`（公开材料）。Large 1 未公布参数；Large 2 = **123B dense / 128k / 预训练 MMLU 84.0%**；Large 3 = **2025-12-02、41B/675B、256k、Apache 2.0、3000×H200**。不为 Large 3 / Ministral 新建空目录。旧 D5 与第 5 章副本勘误 2026.01 / 参数未公开。
- 9.4 修订节嵌入自绘 `images/fig-llm-serving-stack-pd.png`（无水印；图内英文拼写以正文为准）。
- 写满 Claude-1 / Claude-2 / Claude-2.1 空 D2（公开材料）。CAI 论文 **52B 是实验模型不是产品参数**。9K 来自 100K 扩窗公告。Claude 2：Bar 76.5%、HumanEval 71.2%、GSM8k 88.0%。Claude 2.1：200K、虚假陈述 2x↓、长文档错误 30%↓。`05-02` 空壳改枢纽。
- 未 commit。

## 8. 2026-08-30 续：Claude 3 D2 + QSA/GR/KDA + Qwen3.8-Flash-Next

- Claude 3 Haiku/Sonnet/Opus 空 D2 写满。全家 2024-03-04；**Haiku GA = 2024-03-13**。Model card Table 1：Opus MMLU 86.8/88.2 CoT、GPQA Diamond 0-shot CoT **50.4%**（10 次平均）、Maj@32 59.5%、MATH Maj@32 73.7%、HumanEval 84.9%；Haiku HumanEval 75.9%>Sonnet 73.0%。知识截止 2023-08；ASL-2；生产 200K / 能力到 1M。不为 citations/tool-use 预告建空目录。
- 新增体系章：`03-Gated-Residual.md`（报告式 21–34、Table 5）；`08-QSA-Qwen稀疏注意力.md`（式 12–20，$r=4,K=2048$；1M kernel 7.6×/4.9×）；`01-Kimi-Delta-Attention-KDA.md`（2510.26692 式 1，通道级对角门）。禁止与 CSA/HCA 混名。
- 新增 `14.2/13-Qwen3.8-Flash-Next/01-...`（125B/6B 活跃+51B n-gram）。云上 `qwen3.8-flash` = B 档不另建。PDF 用 PyMuPDF 抽取，**未 OCR 进 git**。
- 知识图谱补 GR / QSA / KDA 行。未 commit。

## 9. 2026-08-30 续：Kimi K3 D2 + SiTU-GLU / LatentMoE / QB

- 精读 arXiv:2607.24653 HTML §1–5.2、Table 1、式 (1)–(17)、附录 B/C 开头；README 规格与评测表。**不 OCR 进 git。**
- 新增 `14.5/05-Kimi-K3/01-Kimi-K3-架构精译.md`。Table 1：2.78T / 104.2B、93 层、69 KDA+24 MLA、896/16/2、$\ell=3584$、SiTU-GLU、1M。摘要/README 的 2.8T/104B 并存，不合成第三个数。$2.5\times$ 是 scaling efficiency，不是墙钟。
- K3 相对 Linear 的两处（$g_{\min}=-5$、满秩门）写入 KDA 专文 §5，不倒灌 2510.26692。Block AttnRes 8×~12 写入 AttnRes 修订。Per-Head Muon 写入 05-MuonClip §1.1。MoonEP/KCP 写入 6.1 修订。
- 新体系章：`01-SiTU-GLU.md`（式 12，$\beta_1=4,\beta_2=25$，界 100）；`10-Stable-LatentMoE与Quantile-Balancing.md`（式 11–14；LatentMoE 前作 2601.18089）。自绘图三张无水印。
- 第 5 章 Kimi、K2.6 Index、1.3、知识图谱已接上。Fable 5 / GPT-5.6 Sol 仍不 mkdir。未 commit。

## 10. 2026-08-30 续：GLM-5.3-Flash D2 + IndexPool + Claude 3.5 空 D2

- 精读 Z.ai 文档、HF `config.json`、vLLM recipe、SGLang cookbook。`z.ai/blog/glm-5.3-flash` WebFetch 超时。没有独立 Flash 架构 PDF；2602.15763 是 GLM-5，不冒充 Flash。
- 新增 `14.6/12-GLM-5.3-Flash/01-...`。官方 **320B / 18B**（vLLM ~321B，不合成第三个数）；45 层 **34 KDA + 11 稀疏 MLA**（config `layer_types`，不要用第三方 34+11 以外的拆法）；288/8/1；`gate_lower_bound=-5.0`；mHC `hc_mult=4`。评测只抄文档：DeepSWE 63.4、AutomationBench 48.8、Code Bench 29.0 vs Opus 4.8 的 29.5、AA Index 57 / $0.045。注意力 3.01×/4.44× 与后文 3.0×/4.4× 两套并存。serving 3× ≠ 注意力 3.01×。优化器 **未找到**。GLM-5.3 非 Flash = B，不 mkdir。
- 新体系章 `09-IndexPool.md`：四条 indexer key 加权池化，$K=2048$；**没有**公开公式，禁止写成 QSA。自绘图两张无水印。
- 9.4 补 EPD 三分；第 5 章 GLM-5 端侧文加修订节；KDA/mHC/QSA/1.3/知识图谱已链。
- 写满 Claude 3.5 Sonnet（博文 **2024-06-21**；June Table 1 GPQA 59.4%/HumanEval 92.0%；十月 SWE-bench 33.4→49.0）/ 3.5 Haiku（SWE-bench 40.6%；Bedrock GA 11-04；$0.80/$4 是 12-03 修订）/ Computer Use（OSWorld 14.9%/22.0%）空 D2。空壳 05 改枢纽。3.5 Opus 不 mkdir。长 D5「6 月 20 日」加修订。未 commit。

## 11. 2026-08-30 续：Gemini 1.0/1.5 + GPT-1/3 + InstructGPT 空 D2

- Gemini 1.0（arXiv:2312.11805）：Nano-1 **1.8B** / Nano-2 **3.25B**；Ultra/Pro **参数未公布**（长 D5 ~1.5T/~180B 加修订）；32,768；MQA；TPUv4 SuperPod 4096；goodput 85%→97%；MMLU Ultra **90.04% CoT@32** / 83.7% 5-shot。空壳 05 改枢纽（Ring Attention 不是 1.0）。
- Gemini 1.5（2403.05530）：Pro = **稀疏 MoE**（专家数未公布）；研究上下文 **10M**；NIAH >99.7% 到 1M；MATH 58.5→**67.7**。Flash = **decoder + 并行 attn/FFN + 从 Pro 在线蒸馏**，不是 MoE 稀疏 SKU（长 D5 加修订）。
- Flash-8B：2024-10-03 开发者博文；$0.0375/$0.15、4000 RPM；**没有**端侧/精确 8.000B 表。
- GPT-1（Radford 2018 PDF）：12/768/12/3072/512；BooksCorpus >7000 本；PPL 18.4；MNLI-m **82.1**；Story Cloze **86.5**；RACE **59.0**；GLUE **72.8**。论文无 117M、无 SQuAD 主表。
- GPT-3（2005.14165）：**175B**、96 层、d=12288、ctx 2048、8 档均训 **300B token**；CC 60%/WebText2 22%；CoQA few-shot 85.0；TriviaQA 71.2%；PTB PPL 20.50。Medium 是 **350M**。
- InstructGPT（2203.02155）：SFT 13k / RM 33k / PPO 31k；**只用 6B RM**；1.3B 偏好于 175B GPT-3；175B InstructGPT vs GPT-3 **85±3%**；幻觉 21% vs 41%；PPO-ptx 对齐税。
- **GPT-2 官方 PDF 本轮未读成**，空 D2 未动。Claude 3.7 / Claude 4 仍三行空壳。未 commit。

## 12. 2026-08-30 续：GPT-2 + Gemini 2.0 线 + Claude 3.7

- GPT-2（Brown CS PDF）：Table 2 **117M/345M/762M/1542M**；WebText 初版 >800 万文档 / 40GB；CoQA zero-shot **55 F1**；仍 underfit。长 D5 124/355/774 加修订。
- Gemini 2.0 Flash：12-11 **experimental**，02-05 **GA**；约 2× 1.5 Pro 速度且关键基准更强；Trillium 训推 100%。开发者博文 SWE-bench **51.8%** = Flash+code execution 采样 agent。Flash-Lite 不 mkdir。
- 2.0 Pro Experimental：02-05；**2M** 窗；偏代码与复杂 prompt。Thinking：博文只有「Flash 速度 + 更长推理」，无预算 API。
- Astra：I/O 首秀 ≠ 2.0；12 月版 built with 2.0；会话记忆 **10 min**。Mariner WebVoyager **83.5%** 不要写成 Astra。
- Claude 3.7（2025-02-24）：$3/$15 含 thinking；预算到输出 **128K**；附录 SWE vanilla **63.7%** / high compute **70.3%**（n=489）。长 D5 62.3% 加修订。System card 未读。
- ChatGPT 官网超时，空 D2 未写。未 commit。

## 13. 2026-08-30 续：ChatGPT-3.5 / GPT-4 / Gemini 2.5 / Claude 4 空 D2

- ChatGPT（Wayback 20221130211011）：InstructGPT sibling；RLHF 同方法、数据收集略不同；基座 GPT-3.5 series（early 2022）；无参数量。openai.com 现页仍超时。
- GPT-4（2303.08774v6）：明文不公布架构/规模；Bar 298/400 ~90th；MMLU 86.4% 5-shot；HumanEval 67.0%；GSM-8K 92.0%\*。MoE 是推测，长 D5 加修订、不删。
- Gemini 2.5 Pro（2025-03-25）：thinking model；HLE 18.8% 无工具；SWE-bench Verified 63.8% custom agent；1M。GPQA/AIME 无百分数。空壳「物理世界模拟」作废。
- Gemini 2.5 Flash（2025-04-17 preview）：first fully hybrid；thinking_budget 0–24576。**不是**与 Pro 同日。空壳「端到端语音」不是这篇博文。长 D5「同时发布」加修订。
- Claude 4（2025-05-22）：一个目录盖 Opus 4 + Sonnet 4。SWE 无 thinking 72.5%/72.7%；high compute 79.4%/80.2%。脚手架不再用 3.7 planning tool。System card 未读。不为单档 mkdir。
- 空壳 05 改枢纽（ChatGPT / GPT-4 / 2.5 Pro / Claude 4）。2.5 Flash 的 05 本就是长文，只加修订。未 commit。

## 14. 2026-08-30 续：GPT-4V / Turbo / 4o / 4o-mini

- GPT-4V 系统卡（2023-09-25）：与 GPT-4 同训程；人物识别拒答 >98%；非法建议拒答 97.2%；无根据推断 100%。无 MMMU 主表。
- GPT-4 Turbo DevDay（2023-11-06 Wayback）：128K、知识 2023-04、$0.01/$0.03 per 1K tokens、`gpt-4-1106-preview`。长 D5 的 8×220B MoE 加修订。
- GPT-4o Hello（2024-05-13 Wayback）+ 系统卡 2410.21276：端到端同一网络；232/320 ms；MMLU 88.7% 0-shot CoT / 87.2% 5-shot；API 半价 2× 快。当天 API 只有 text+vision。
- GPT-4o mini（2024-07-18）：MMLU 82.0%、MGSM 87.0%、HumanEval 87.2%、MMMU 59.4%；$0.15/$0.60；**不是端侧**；无参数量。长 D5 8B/蒸馏加修订。
- 未 commit。

## 15. 2026-08-30 续：o1-preview / o1 / o1-mini

- Introducing + Learning to Reason（两条 Wayback）。产品博文 83% IMO / 89th Codeforces = **next model update = 附录 o1 列**，不是 preview。
- o1-preview Appendix：AIME cons@64 **56.7** / pass@1 **44.6**；Codeforces 1258 / 62nd；StrongREJECT 0.84 vs GPT-4o 0.22。
- o1：AIME 74%/83%/93%；Appendix 74.4/83.3；GPQA pass@1 77.3；MMMU 正文 78.2 / 附录 78.1；Codeforces 1673/89th。IOI 213 与 Elo 1807 是再训编程模型。隐藏 CoT，只给摘要。系统卡 PDF 未打开。
- o1-mini：只核 introducing（便宜 80%、偏代码、周 50 条）。独立评测博文超时；附录无 mini 列。
- 未 commit。

## 16. 2026-08-30 续：o3-mini / Operator / Gemini 3.x

- o3-mini（2025-01-31）：low/medium/high；无视觉；偏好 56%；major error −39%；SWE n=477 Agentless 39% / 内部 61%；FrontierMath >32% provisional；7.7s vs 10.16s。AIME 柱无百分数。长 D5 的 $1.10 加修订。
- Operator（2025-01-23）：GPT-4o 视觉+RL；OSWorld 38.1% / WebArena 58.1% / WebVoyager 87%。空壳 05 改枢纽。
- Gemini 3 Pro（2025-11-18）：1M；HLE 37.5%；GPQA 91.9%；SWE 76.2%；LMArena 1501。长 D5「2M / 年中」加修订。
- Gemini 3 Flash（2025-12-17）：SWE 78%；GPQA 90.4%；HLE 33.7%。
- Gemini 3.1 Pro（2026-02-19）：本篇几乎只有 ARC-AGI-2 77.1%。长 D5 MoE/Veo 加修订。
- 未 commit。

## 17. 2026-08-30 续：Grok 空 D2 + FP4 专文 + AdamW LaTeX

- Grok-1：产品卡 HumanEval 63.2% / MMLU 73% **不是**开源基座成绩。开源 314B、8 专家 Top-2、GQA 48/8、d=6144、8k、Apache 2.0、预训练 2023-10 结束。
- Grok-1.5V：zero-shot 无 CoT；RealWorldQA 68.7%；>700 图 CC BY-ND。无视觉塔公式。
- Grok-2：「黑林」= FLUX.1；Arena 化名 sus-column-r；表内 GPQA 56.0% / MMLU 87.5% 等。mini 不 mkdir。Elo 图不估。
- 新增 `6.1.2/03-MXFP4与NVFP4.md` + 自绘图。OCP：E2M1 bias 1、max ±6、k=32、E8M0。NVFP4：k=16、E4M3、张量 FP32。6.3.1「1-3-0」加修订。
- 6.5.1 追加 1711.05101 Algorithm 2 LaTeX；2025 ASCII/知乎段保留。
- 未 commit。

## 4. 2026-08-30 续：国内空 D2 + Muse Spark A

- Step-1/2 空 D2 写满；长 D5 修订：6D 并行与 200B 激活不是官方句；MFU 57% 属 Step-1。
- Doubao Lite/Pro：lite **不是端侧**；7× = 同 9T 对照 Dense 总参/MoE 激活，不是生产总参表。
- Llama-3.1：HF 卡 Instruct MMLU 87.3 / HumanEval 89.0；长 D5 15.6T 配比与 16k H100 勘误。
- Muse Spark：`14.3/05-Muse-Spark`；安全报告 2026-05-26；无参数；自绘图 `fig-muse-spark-prep-framework.png`。Contemplating 不 mkdir。
- Hunyuan-Pro D2 用 Large 论文 389B/52B/1+16 Top-1；云上 Pro ≠ Large。长 D5 Mamba 保留+修订。
- Ling：inclusionAI 不是 Yi；Lite/Plus 01 写满；2.5 重复目录改枢纽；2.6 无论文。补 `14.16-Ling.md`。
- Ernie 3.5/4.0：无参数；4.5 不倒灌。ABAB 空 01 枢纽到博文分析。
- 未 commit。

## 18. 2026-08-30 续：Hunyuan-3D + MiniMax 勘误 + P3 + 作者点名 A 档

- Hunyuan-3D D2：1.0 = 2411.02293（6 视图、lite/std）；2.0 = 2501.12202（2025-01-21，ShapeVAE+flow DiT）；2.5 的 10B 不倒灌。自绘图 `fig-hunyuan3d-1-vs-2-pipeline.png`。
- MiniMax-M2：**229.9B/9.8B**，全层 GQA，离开 Lightning；长 D5 是 Text-01 误贴。2.4.1 补 sigmoid 8/256；2.3.3 补 M2 退回全注意力。
- P3：家族总览改为真实路径；第 14 章 D2 计数不当完成率；14.3 的 3.1/4 编号撞车只记账。
- K2.7 Code = A：同 K2.6 骨架；强制 thinking；官方内部基准表；自绘图。
- GPT-5.6 Sol = A：GA 2026-07-09；$5/$30；ultra 默认 4 agent；Preparedness High bio/cyber、未到 Critical。Terra/Luna 不 mkdir。
- Fable 5（2026-06-09，$10/$50，30 天留存）/ Opus 5（2026-07-24，$5/$25）。Mythos 5 = B 枢纽。Sonnet 5 不 mkdir。
- 未 commit。

## 19. 2026-08-30 续：0.8 稳定性/训推 + V4-Flash B + P3 总览链

- 新增 `6.1.7-训练稳定性与训推不一致.md` + `fig-stability-vs-train-infer-mismatch.png`。两条轴拆开：稳定性（V3 无不可恢复 spike；V4 Anticipatory Routing + SwiGLU $[-10,10]$ / gate 上限 10；K2 MuonClip）vs 训推（V4/K3 QAT；IcePop；`torch.topk`；MIS-PO）。EP Wave / CP 两阶段写进 `6.1.1` §2.6，不另起 EP 教材。
- V4-Flash = **B**：与 Pro 同一系列报告。家族页 + 第 14 章 V4 行记账，**不 mkdir**。
- Gemini `14.11` 表补 3.0 Pro / 3 Flash / 3.1 Pro；Flash-Lite 不 mkdir。xAI 写明磁盘上限 = Grok-2 三行。
- P3：章首页剩余 `*家族演进总览.md` 404 改到真实 `14.x-*.md`；新建 `14.18-MiniCPM.md` 枢纽（不是第三份精读）。MiniCPM-2B Index 链改为真实 `01-`。
- 知识图谱第 6 章表：稳定性 / 训推 / EP·CP 改为已有。
- 未 commit。

## 20. 2026-08-30 续：9.4.1 SGLang / PD + P3 Index 404

- 新增 `9.4.1-SGLang与Prefill-Decode分离.md` + `fig-pd-disaggregation-kv-transfer.png`。DistServe：goodput、共置 1.6 rps/GPU vs 理想 3.3（2.1×）、评测包络 7.4× / 12.6× SLO、式 (1)–(3)、OPT-66B 512 tok KV 1.13GB → 10 rps 需 ~90Gbps。SGLang 论文 6.4× 对照当时 Guidance/vLLM/LMQL；PD 文档：Mooncake/NIXL、异构 TP staging 2–5×、MLA 勿开、NVL72 env。EPD 只链 GLM-5.3-Flash。
- 9.4 §8.3 2025 动机保留；修订节去掉「尚未写成独立专文」。6.6 §6.4 / 6.1.7 / 9.1.2 加指针。知识图谱 SGLang / PD → 已有。
- P3：GLM-5 / Turbo / 5V-Turbo 链改到真实 `08`/`09`/`10` 目录；MiniCPM-V-4.5 链改到 `统一3D-Resampler…`。章首页再扫 MISSING=0。
- 碎片：`05-MiniMax-M2-LightningAttention解析.md` 并节——保留 2025 空壳段，修订写明 Lightning 属 Text-01，M2 全层 GQA。
- 未 commit。

## 21. 2026-08-30 续：3.4 评测改号 + NIAH/RULER + Grokking 自绘图

- 目录本是 `3.4-*`，文件名写成 `3.3.1`–`3.3.4`，和 Tokenizer 的 `3.3.1` 撞车。新正文 `3.4.x-*.md`；旧名改枢纽，不删。
- `3.4-预训练评估.md` H1 从「3.3」改成 3.4，补子专文表。章首页 `3-预训练.md` §5 链到四篇。
- NIAH：Contentful CDN 热力图换成 `fig-niah-protocol.png`。修订：Lost in the Middle（2307.03172）是多文档 QA + KV 检索的 U 型；RULER（2404.06654）四类、13 任务、vanilla NIAH 满分但 32K 只有一半满意。文末「Gemini 2.0 的 10M」未找到官方页，不升格。
- PPL 加 `fig-ppl-candidate-set.png`；GPT-1/2/3 PPL 表未核对原论文。3.4.2 / 3.4.4 HumanEval 数字互殴，GPT-4 以 67.0%（2303.08774）为准。
- 3.1.1 Grokking 的 Notion/S3 网图换成 `fig-grokking-schematic.png`（无数值刻度）。
- 知识图谱 PPL/NIAH 行改为已有。Connest5 仍未命中官方串，留条。
- 未 commit。

## 22. 2026-08-30 续：体系章网图 + Gemma-2 待补 D5

- `2.4.1` 图 1–5：语雀/Substack 换成 `fig-moe-dense-vs-sparse.png` / `fig-moe-router-top2.png` / `fig-moe-load-imbalance.png`。其余概念图在 §23 换完。
- `6.2.1`：微信浮点位图、CSDN 推理组成、CSDN 训练 gif → `fig-float-bit-layouts.png` / `fig-infer-vram-components.png` / `fig-train-vram-components.png`。无 GB 刻度。
- `6.4.1` 图 10：去掉 `picx.zhimg.com`，嵌 `fig-hash-prefix-tree.png`；`image_10.png` 注释保留。
- Gemma-2 Index 三句待补写成 D5：Local-Global（交错 KV 是 25% 不是 50%；Table 10）；Soft-Capping（50/30，报告无 FP8）；GQA（Table 1/8，9B 8K ≈ 2.63 GiB）。自绘图三张。`待补充专题` 标题改为已写入。
- 未 commit。

## 23. 2026-08-30 续：2.4.1 概念图收完 + V4 OPD 式 (29)

- `2.4.1` 外链配图：Expert-Choice / overflow / VRAM / DeepSeekMoE a–c / Switch Top-1 / ViT / V-MoE 优先 / Soft-MoE / Upcycling 架构 / Router z-loss 换成自绘。LBL 曲线、损失尖峰、微调过拟合、Upcycling 准确率、消融柱、缺失的 `img.png`/`img_1.png` **不画假坐标**，只留 2025 读图结论 + 论文链。
- `4.6-OPD`：写入 V4 mineru 式 (29) 多教师 reverse KL、全词表 logit、十余教师；QAT 仍指 6.1.7。**不 mkdir**。`01-OPD-学生前缀蒸馏` 本来就有正文，去掉「待补全」。
- Connest5 仍未命中官方串，留条。
- 未 commit。

## 24. 2026-08-30 续：DualPipe 自绘图 + MLA 假 imgur

- `6.1.6`：嵌 `fig-dualpipe-overlap.png`（双向流 + Attention/MLP 与 All-to-All 重叠，无时间轴）。V4 mineru：为 mHC 调整 DualPipe 1F1B overlapping，无新气泡表。EP Wave 指 6.1.1 §2.6。
- `01-DeepSeek-MoE` 图 4：去掉 `i.imgur.com/your_image_mla.png`，换成 `fig-mla-latent-cache.png`；`image_4.png` 注释保留。同一张图嵌进 `2.3.5` 文首（本体在体系章）。
- 未 commit。

## 25. 2026-08-30 续：EAGLE-3 勘误 + MTP 接到 K3/V4 + CP/Wave 图

- `6.6.2` / `6.6.2.1` / `02-EAGLE系列深度解析`：2025 把 EAGLE-3 写成「上下文分类器」或「树形验证才出现」或「Test-Time Training + 接受/拒绝损失」。按 ar5iv 2503.01840：丢掉 $l_{\mathrm{fea}}$、低中高三层融合、training-time test（把 $a$ 喂回）、草稿一层 decoder、树仍是 EAGLE-2（深 6→8）。论文数字：最高约 6.5×、相对 EAGLE-2 约 1.4×、SGLang bs=64 约 1.38×。知乎 tok/s 表不升格。自绘图 `fig-eagle3-ttt.png`。
- `2.4.6`：V4 MTP 与 V3 相同；K3 冻目标、AttnRes 块 1/4/末、$\mathcal{L}_{\mathrm{LK}}=-\log\sum_x\min(p,q)$、温度 1、无额外 CE。不编 K3 加速比。
- `6.1.1` §2.6：嵌 `fig-ep-wave.png`、`fig-cp-two-stage.png`（无数值轴）。
- 第 2/6/9 章再扫：无活的 `![](https://…)`。Connest5 仍留条。
- 未 commit。

## 26. 2026-08-30 续：6.6.3 Flash-Decoding 接到 FA3（拆开写）

- 2025 文：4K–8K 临界点、TMA、vLLM `--attention-backend flash_decoding` 不升格。CRFM/PyTorch：新并行轴是 KV 长度；view 切分 + 两 kernel；bs=1 时 FA 占不到 1% GPU（A100 108 SM）；CodeLlama-34B 生成最高约 8×，注意力最高约 50×。PyTorch 表 `B=1, 64k` 2300.6 vs 64.4 µs。
- FA3（2407.08608v2）是 Hopper 前向/反向核：35%→75%（740 TFLOPs FP16）、FP8 ~1.2 PFLOPs；论文写 inference 未优化完。自绘图 `fig-flash-decoding-splitkv.png`。FA3 pingpong 图已在 `2.3.1/04-FlashAttention-v3`，不重画。
- 未 commit。

## 27. 2026-08-30 续：2.3.4 / 04-FA3 钉数字

- `2.3.4`：「接近 roofline」改为 35%→**75% / 740 TFLOPs**，并链 6.6.3 与 04-FA3。
- `04-FlashAttention-v3`：参考文献 **2407.08691 → 2407.08608**；补 inference 未优化、split-KV 指 6.6.3。
- 未 commit。

## 28. 2026-08-30 续：PagedAttention 不是 GPU 90%+；SageAttention 钉 INT8

- `2.3.4` §3.2.2：40–60%→90%+ 不是 2309.06180。论文：吞吐 2–4×（同等延迟）；ShareGPT 请求率 vs Orca Oracle 1.7–2.7× / Max 2.7–8× / FT 最高约 22×；KV 占用 20.4–38.2%；浪费钉在最后一块；默认 block 16；kernel 慢 20–26%。共享用论文块数比，不用 50–90%。自绘图 `fig-pagedattention-blocks.png`。
- `01-PagedAttention与vLLM`：30%→80%+、100 张变 40 张/一年百万美元 **不在论文**。保留 2025 段。
- `6.4.1`：96% 不是论文数字（near-zero）。
- SageAttention（2410.02367）：INT8 $QK$ + 平滑 K（$<0.2\%$）+ $PV$ FP16 accumulator；OPS 约 2.1×/2.7× vs FA2/xformers；不是 H100 FA3 换皮。
- 未 commit。

## 29. 2026-08-30 续：Mistral SWA 不是无限上下文

- `2.3.4` §4.1.3：2310.06825 Table 1 是 `context_len=8192`、`window_size=4096`。理论注意跨度 $W\times k\approx 131K$ 是感受野上界。Rolling buffer 固定 $W$ 槽；32k 序列 cache 降 8× 是举例不是官方窗。式 (5) 双向窗 ≠ Mistral 因果左窗。自绘图 `fig-swa-rolling-buffer.png`。
- Mixtral `05`：没有继承 SWA；Table 1 稠密 32k。GQA 是 32/8 不是「8 个 Q 共享 1 个 KV」。
- 7B D5 勘误段补链到 2.3.4。
- 未 commit。

## 30. 2026-08-30 续：膨胀窗不是式 (6)；BigBird 不是三种边⇒图灵；Performer 不是错号 RFF

- `2.3.4` §4.2：式 (6) 把跨度钉在 $w$ 上，感受野不会变成 $w\times d$。Longformer dilated window（2004.05150）：空隙 $d$，固定 $d,w$ 时顶层 $\ell\times d\times w$；连接数仍约 $w$。字符 LM 才用膨胀（下层不用，上层 2 头）；RoBERTa 迁移 window 512、加 dilation 掉点。Child Sparse Transformer 是 $O(n\sqrt{n})$，不是 BigBird。自绘图 `fig-dilated-sliding-window.png`。
- `2.3.4` §4.3.1：2007.14062 Theorem 1 是 **星图 / 全局 token** 的 seq2seq 通用逼近，不是随机边。图灵完备要稀疏编解码器 + 任意精度。§3.4 最远向量：满注意力 $O(1)$ 层 vs 稀疏 $\tilde\Omega(n)$ 层。ITC/ETC；block-sparse；NLP **4096**（约 8× 当时的 512）。自绘图 `fig-bigbird-three-blocks.png`。`2.3.2` UA 句同步。
- `2.3.4` §5.2：式 (9) = Lemma 1 正随机特征；导语把高斯核 / SM / 三角 RFF 叠在一起。FAVOR+ = positive **Orthogonal** random features。参考文献 **2009.00094 → 2009.14794**，去掉「Tabular Data」。自绘图 `fig-favor-plus-prf.png`。`2.3.3` 参考文献号一并改。
- 未 commit。

## 31. 2026-08-30 续：Linformer 沿序列投影；$E,F$ 绑 $n$；CSA≠Cross-Layer

- `2.3.4` §5.3：2006.04768 压缩的是序列维。默认每头 $E_i,F_i$；共享是可选项（头内 / KV 共用 / 整网 1 个）。式 (10) 的 $k\times T$ 乘法自洽；论文 $n\times k$ 再写 $E_i KW$ 乘不起来。Theorem 1：存在秩 $\Theta(\log n)$ 逼近，不做逐步 SVD。Theorem 2：$k$ 可不随 $n$。预训练 $k{=}128$（512）/ $k{=}256$（1024）几乎贴上 Transformer；固定 $k{=}256$、$n$ 到 4096 PPL 差不多。Table 2 layerwise $k{=}256$ 下游平均 92.30 vs RoBERTa 92.25。Table 3：$n{=}512,k{=}128$ 约 1.5× / 1.7×。MLM 编码器，$E,F$ 形状含 $n$，不是因果 decode。自绘图 `fig-linformer-seq-proj.png`。
- `2.3.4` §6.2 + 图 1.1：CSA/HCA 按 V4 = Compressed Sparse / Heavily Compressed（链 07 专文）。2025 的「隔层复用 KV」改叫 **CLA**（Hunyuan-Pro 每 2 层）。图注「硬件高效层(HCA)」不再当 Hardware-efficient。自绘图 `fig-csa-cla-hca-names.png`。
- 未 commit。

## 32. 2026-08-30 续：线性注意力是换核不是分解 softmax；4000× 是 CIFAR

- `2.3.4` §5.1：2006.16236 指数核特征无限维，精确线性化 softmax 做不到。$\phi=\mathrm{elu}+1$ 是另一套非负 $\mathrm{sim}$，Q/K 共用同一个 $\phi$。必须同时有 $S=\sum\phi(K)V^\top$ 和 $Z=\sum\phi(K)$。因果按 RNN 维护 $s,z$，每步 $\mathcal{O}(d^2)$ 对 $N$ 常数。MNIST 0.644 vs 0.621 bits/dim、**317×** images/sec；CIFAR **4462×**（17.85 vs 0.004），这才是摘要约 4000×；WSJ Linear PER **8.08** vs softmax **5.12**。参考文献 ICLR→ICML。自绘图 `fig-linear-transformer-elu.png`。
- `2.3.3`：年表「分解 Softmax」勘误；式 (5)(6) 外积转置；「64K 仍 85%」不是该论文。
- 未 commit。

## 33. 2026-08-30 续：Reformer 是 $O(L\log L)$ 随机哈希，不是学习路由

- `2.3.4` §4.3.2：2001.04451 三条 = 角 LSH + RevNet + FFN chunk。哈希 $h(x)=\operatorname{argmax}([xR;-xR])$ 不训练。Q=K、禁止自注意。排序后块 $m=2L/n_{\mathrm{buckets}}$ 看本块+前一块。Table 3 常数 $c=128^2$。enwik8-64K、imagenet64 约 12K；WMT 句短于 128 **不用 LSH**。12 层 enwik8 **1.05 bits/dim**。Sparse FlashAttention 无论文号。自绘图 `fig-reformer-lsh-chunks.png`。§9.3 与 MoBA 01 相关工作同步：LSH ≠ k-means。
- 未 commit。

## 34. 2026-08-30 续：Routing Transformer 是学质心的 $O(n^{1.5}d)$，不是 LSH 也不是 MoE

- `2.3.4` §4.3.2：2003.05997 TACL 2021。在线球面 $k$-means，质心 EMA $\lambda{=}0.999$。LayerNorm 关 scale/bias 投到单位球。每个质心 top-$k$ 取 $w=n/k$ 个 token（不保证互斥）。因果 $K\leftarrow Q$。$k=\sqrt{n}$ 时 $O(n^{1.5}d)$。主实验一半头局部、一半 routing；PG-19 只在最后两层留 2 个 routing 头。WT103 **15.8**；PG-19 **33.2**（8192）；ImageNet-64 **3.43** vs Reformer 约 3.65；enwik-8 **0.99**（正文 24 层 vs Table 3 的 12 层，对不上）。Random Transformer 差于局部。自绘图 `fig-routing-kmeans-clusters.png`。§9.3 / MoBA 01 补一句：不是专家门控。
- 未 commit。

## 35. 2026-08-30 续：RWKV-4 是通道衰减，不是 $q^\top k$，推理也不是一步 FLOPs $O(1)$

- `2.3.4` §5.1：2305.13048。AFT 的 pairwise $w_{t,i}$ 改成 $w_{t,i}=-(t-i)w$（$w\in(\mathbb{R}_{\ge 0})^{d}$）。式 (16) WKV 逐通道，当前 token 用 bonus $u$。$r$ 只做 $\sigma(r)\odot wkv$，再乘 $W_o$。Table 1 推理 $O(Td)/O(d)$；训练主项投影 $O(BTd^2)$，WKV 扫描 $O(BTd)$。Appendix D 的 $(a,b)$ 已经是 RNN；状态 $5DL$。Pile 330B、预训练 1024、再微调到 8192。169M–14B。§9 细账会丢；Appendix L F1 44.2→74.8。自绘图 `fig-rwkv4-wkv-rnn.png`。
- `2.3.3` §4.4 式 (9) 的 $r^\top k$ 标错；复杂度表 $O(d^2)$ 状态标错；参考文献年份 2021→以 2023 为准。
- `2.4.4` 补 $W_o$、定义域、$5DL$，把「$O(1)$」钉成不随 $T$ 涨。
- 未 commit。

## 36. 2026-08-30 续：RFA 是三角 RFF + 单位化，不是 FAVOR+，12× 不是 CIFAR

- `2.3.4` 新 §5.2.3：2103.02143 ICLR 2021，Hao Peng 不是 Bo Peng。2006.11239 是 DDPM。式 (2) Rahimi–Recht $\sin/\cos$ 维 $2D$；先 $\ell_2$ 单位化 $Q,K$ 再学 $\bm{\sigma}$。与 Performer 并发：FAVOR+ 用正特征，并写明三角 RFF 不适合注意力。RFA-Gate 式 (7) 近因偏置。WT103 Gate-Gaussian 测集 **25.0** vs Base **26.2**；WMT14 EN–DE **28.0** vs Base **28.1** vs $\phi_{\mathrm{elu}}$ **21.3**；解码 **1.8–1.9×**。12× 是 2048 greedy TPU 模拟。512 上下文不加速。自绘图 `fig-rfa-trig-gate.png`。Performer 修订节补并发句；`2.3.3` 年表补 RFA。
- 未 commit。

## 37. 2026-08-30 续：AFT 是 pairwise $w$ + 逐元素，不是 $QK^\top$，也不是 RWKV

- `2.3.4` 新 §5.1.4：2105.14103，Zhai et al.，Apple。式 (2) 先用学到的 $w_{t,t'}$ 加权 $K,V$，再 $\odot\sigma_q(Q)$（默认 sigmoid）。没有 $QK^\top$。AFT-simple $O(Td)$；AFT-full 时间仍 $O(T^2d)$、空间 $O(Td)$。AFT-local 窗外 $w=0$ 不是 $-\infty$，全局连通还在（窗外改 $-\infty$ Top-1 79.9 vs 80.8）。分解 $w=u^\top v$：CIFAR 0.6M vs 9.6M，测 2.74 vs 2.84。CIFAR AFT-local-256 24×256 测 **2.74** vs Transformer **2.86**。enwik8 AFT-local-32 24×256 测 **1.154** vs Transformer **1.130**；窗 32 是 U 形谷底；$T{=}4096$ 测 **1.134**。ImageNet AFT-conv small kernel 15 **81.0** vs DeiT **79.9**；从 DeiT-base 微调 384 **83.4** vs **82.9** vs 随机 **81.6**。RWKV 论文把 AFT 编号成自己的式 (9)，原文是式 (2)；pairwise $w$ 不能当 RNN。自绘图 `fig-aft-pairwise-vs-rwkv.png`。`2.3.3` 年表、`2.4.4` 修订、§7–8 对照表补行。
- 未 commit。

## 38. 2026-08-30 续：Synthesizer 合成对齐矩阵，不是线性复杂度，60% 是对 DyConv

- `2.3.4` 新 §5.1.5：2005.00743 ICML 2021，Tay et al.。Dense：每 token 两层 ReLU 投到长度 $N$。Random：全局 $R$，可 Fixed。Fac. Random $k{=}8$ 仍 softmax $N\times N$，**不是** Linformer 的 $n\times k$。WMT EnDe Random **27.27** vs 复现 Transformer **27.67**；R+V **28.47**。LM1B D+V **37.27** vs **38.21**。C4 Syn(R) log PPL **1.972** / **4.26** step/s vs DyConv **2.040** / **2.65**（摘要 3.5% / 60%）；LightConv 打平 1.972。GLUE 纯 R **75.1** vs T5 **83.5**（句对当跨句）；R+V **84.1**。交叉注意力换不掉。PersonaChat 上 D 好过 Transformer，`+V` 反而掉。AFT Table 4 的 Synthesizer 1.298 bpc 是 AFT 复现，不是本篇表。自绘图 `fig-synthesizer-dense-random.png`。Linformer 修订补准确率对照。
- 未 commit。

## 39. 2026-08-30 续：LightConv/DynamicConv 是固定窗 depthwise，20% 是 P100 翻译

- `2.3.4` 新 §5.1.6：1901.10430 ICLR 2019，Wu/Fan/Baevski/Dauphin/Auli，fairseq。LightConv = depthwise + 时间维 softmax + $H$ 组共享（$d{=}1024,k{=}7,H{=}16$ 时 **112** 权重）。DynamicConv 的核 $f(X_i)$ 只看当前步。换自注意力，**交叉注意力仍在**。WMT En-De DynamicConv **29.7** vs Ott **29.3**。IWSLT +0.8。Table 3 P100 **62.6 vs 52.1** sent/s ≈ **20%**；无 softmax 发散。Billion Word test **26.67 vs 26.73**。CNN-DM 截 400 tok，Dyn R1 **39.84** vs **39.26**。不是 CVPR 2020 那篇。Synthesizer C4 的 60% 不是这张表。自绘图 `fig-lightconv-dynamicconv.png`。
- 未 commit。

## 40. 2026-08-30 续：Sparse Sinkhorn 仍做局部 $QK$，不是去掉点积，也不是 mHC

- `2.3.4` §4.3.2：2002.11296 ICML 2020。SortNet 块池化 → Sinkhorn–Knopp 双随机 $R$ → 按块置换后再做局部 $QK^\top$，并加上原局部项。Mixture 退回二次。SortCut 编码 $O(\ell N_k)$，因果 decode 不能直接用。算法排序 Sinkhorn(32) EM **49.24** vs Transformer 45.69。LM1B Base **40.79** vs **41.57**；Mixture **40.11**。CIFAR 正文写 3076 bits。消融 $N_k{=}0$ PPL **52.40**。自绘图 `fig-sinkhorn-block-sort.png`。
- AFT / Synthesizer 相关工作「去掉点积」名单里把 Sinkhorn 划出去。§7 / §9.3 补行。xHC 一句：残差混合 ≠ 注意力块排序。
- 未 commit。

## 41. 2026-08-30 续：Star-Transformer 是环+一个中继，不是 BigBird，也不是 NVIDIA Star Attention

- `2.3.4` §4.3.1：1902.09113 NAACL 2019（N19-1133）。卫星 $\mathbf{C}_i$ 长度 5；中继对 $n{+}1$ 做 MultiAtt；一层 $O(6nd)$。SST **52.9** vs Transformer **50.4**。MTL-16 均 **86.98 vs 82.78**，时间约 **4.5×**。SNLI **86.0 vs 82.2**。消融：去径向合成任务崩，去环形真实任务崩。不比 BERT。自绘图 `fig-star-transformer-ring-radial.png`。
- `2.3.2` 修订补一句：2019 编码器星 ≠ BigBird UA 星图 ≠ 2411.17116。
- 未 commit。

## 42. 2026-08-30 续：NVIDIA Star Attention 是推理两阶段块稀疏，11× 相对 Ring

- `2.3.4` §4.3.1：2411.17116，Acharya/Jia/Ginsburg。Phase 1：块前缀锚 $c_1$，host 不通信，丢掉锚 KV。Phase 2：query 广播，query-host 聚合 $A_h$ 与 $s_h$（实现走 log-sum-exp）。不微调。对照 Ring（2310.01889，精确、环上转 KV）。Table 1 8B RULER 128K $\Delta$ **-1.90% / 2.7×**；70B 64K **-1.44% / 4.7×**。摘要 11× = Table 5 **256K 10.8×**；1M **-5.32% / 16.9×** 不要套 97–100%。无锚 NIAH 64K **60.11**。Table 6：128K vanilla OOM，Star 20s vs Ring 53s；<32K 时 Star 可能慢于 vanilla。自绘图 `fig-star-attention-two-phase.png`。
- `6.1.1` Ring 节：精确 vs 近似。`9.4` 长上下文句：PagedAttention 不解 $O(n^2)$。`2.3.2` 补 NVIDIA ≠ UA 星图。
- 未 commit。

## 43. 2026-08-30 续：Ring Attention 是精确环，$6bch$ 与 $s$ 无关

- `6.1.1` §4.3：2310.01889 ICLR 2024，Liu/Zaharia/Abbeel。2025 第 4 步 Reduce-Scatter/All-Gather **不是**这篇。BPT 把一层收到 $2bsh$ 后，层间输出仍随 $s$；环上转 KV 与块内计算重叠，激活 **$6bch$**。$c\ge F/B$，每机 $s=6c$。Table 2：A100 NVLink 最小 6.2K，IB **149.5K**。Table 3：8×A100 7B **256K**（8× vs BPT）；32×A100 7B **4096K**；TPUv4-1024 7B **8192K**（512×）。实测最大 3B @ TPUv4-1024 **16384K**。摘要「1 亿」是设备数外推。Table 4 MFU 百分数 HTML 没转出，不编。自绘图 `fig-ring-attention-kv-rotate.png`。
- Ulysses 年号改 2309.14509 / 2023-09。`6.1` 前瞻、`2.3.4` 对照表链到 6.1.1。
- 未 commit。

## 44. 2026-08-30 续：Ulysses 是 All-to-All 换头，不是每卡只算一段

- `6.1.1` §4.2：2309.14509，Jacobs et al.，Microsoft，2023-09。2025 第 2 步「每个节点只计算自己片段」**反了**。切 $N/P$ → 本地 QKV → All-to-All → **全序列、互不重叠的头子集** → softmax → 再 All-to-All 回 $N/P$。每链路 **$4Nh/P$**；$N$ 与 $P$ 同比则不变。$P$ 不能大于头数（从 §3.1 推出，论文没写不等式）。Megatron-SP 在 Ulysses 账里是 $4Nh$（$P\gg1$ 时 AG/RS 仍是 $M$）。Table 2：131072、64 GPU **165.53** TFLOPs；256 GPU 136.09。Table 3：262144@256 **147.4**。摘要 175 / 54% / 2.5× / 4× 在 Figure 4–7，不估柱高。自绘图 `fig-ulysses-a2a-heads.png`。
- `2.3.4` Star 对照表下补一句链 §4.2。`6.1` 前瞻补 $4Nh/P$。
- 未 commit。

## 45. 2026-08-30 续：Megatron-SP 跟 TP 绑，$s=2048$，不是长上下文 SP

- `6.1.1` 新 §4.5 + §5 修订：2205.05198。LN/Dropout 沿 $s$ 切；$g$ 前向 All-Gather、反向 Reduce-Scatter。式 (4) 一层 $(sbh/t)(34+5as/h)$；1F1B 第一段仍 $L$ 层份。选择性重算只动 $QK^{\top}$/softmax/$PV$；GPT-3 70% / 2.7%。Table 4 22B 一层合招 **4%** vs 整层 **39%**。Table 5 1T 吞吐 +32.1%、MFU 56.3%。摘要 530B **2240** A100 MFU **54.2%** = Table 5 无 DP 再 ×8 DP。实验全 $s=2048$。自绘图 `fig-megatron-sequence-parallel.png`。
- 未 commit。

## 46. 2026-08-30 续：ColAI-SP 是两段环物化 $S$，参数每卡一份，不是 2024 Ring

- `6.1.1` 新 §4.6：2105.13120 / ACL 2023.acl-long.134。Li et al. NUS。Ulysses 称 ColAI-SP。Figure 1(c) 参数复制。RSA：先环传 K 得 $S^{n}\in\mathbb{R}^{L/N\times L}$，再环传 V；只写双向。通信合计 $8(N-1)BZ(L/N)A$。MLP 更省当 $BL>32H$。P100：13.7× batch = 64 卡 SP 对 12 卡 TP；3.0× 序列 64 卡 batch 64。Linformer 114K 是 32 卡 batch 4。「无限」只对线性注意力。Table 4 弱扩展 PP=8。4D 未做。自绘图 `fig-colai-rsa-two-stage.png`。
- `6.1` 前瞻、`2.3.4` Star 对照表下一句。对照表 Li 列改成两段环 / 参数复制。
- 未 commit。

## 47. 2026-08-30 续：BPT 是块内 attn+FFN，一层 $2bsh$，不是 Ring

- `6.1.1` 新 §4.7：2305.19370，Liu & Abbeel，NeurIPS 2023。外层 $Q_i$、内层 KV、在线 softmax 后立刻 FFN。一层激活 **$2bsh$**（FA/ME 仍 $8bsh$）。与 Korthikanti SP **正交**。全精度、无 DP。Table 1 13B $d_{\mathrm{model}}=5140$。Table 2 同一 PartitionSpec 对 vanilla **8×**；摘要 32× 不在同一行；对 ME 2–4×。Table 3 131K 仅 BPT 79/78 GB。Table 4 1B 8GPU：8K 1.17×、16K 1.2×、64K 仅 BPT 600。Table 5 ExoRL 32 轨均 **111.13**（HTML 散文 64/155.36 弃）。自绘图 `fig-bpt-blockwise-ffn.png`。
- `move_agent_to_root` 曾 `stash -u` + reset，本轮 `stash apply` 救回 worktree；**禁止再调**。
- 未 commit。

## 48. 2026-08-30 续：MEA 是 2112.05682，不是 FlashAttention

- 新增 `2.3.1/00-Memory-Efficient-Attention/01-MEA-显存高效注意力.md`。一手 [arxiv.org/html/2112.05682](https://arxiv.org/html/2112.05682)：lazy softmax 式 (1)；running max；分数 $\ge 89$；单 query $O(1)$、self-attn $O(\log n)$、TPU 实用 $O(\sqrt{n})$；默认 1024/4096；Table 2 $n=2^{14}$ 1GB→17MB（摘要 59×）；Table 3 2.0GB→64MB（32×）；WMT 62.69 vs 62.59。自绘 5 图。
- FA 附录 B.5（ar5iv 2205.14135）：峰值 vs IO；$K$ 份摘要 vs 一份 $O$；checkpoint vs 解析反向。
- `2.3.4` 新 §3.0；不再把 MEA 收进 FA 名下。`2.3.1` 索引 / `01-FA` / `02-FA-v1` / `04` xFormers API 名 / `6.1.1` / Llama-1 §4.3 / 知识图谱 交叉链接。
- Connest5 再搜未命中官方模型串，留条。
- 未 commit。

## 49. 2026-08-30 续：StreamingLLM 是 2309.17453，不是 FA，不是 H2O

- 新增 `2.3.2/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md`。一手 [arxiv.org/html/2309.17453](https://arxiv.org/html/2309.17453)：式 (1) sink；默认 4 个起始 KV；cache 内赋位；RoPE 存未旋转 Key。Table 1 Llama-2-13B `0+1024` **5158.07** / `4+1020` **5.40**。Figure 5 **4M** token。相对窗内重算最多 **22.2×**。自绘 5 图。
- 不是 FA/MEA/BPT（精确全注意力）；不是 H2O（累积分数驱逐）；gpt-oss / V4 是每头标量 $z'$ 进分母（模型卡 + mineru 式 (27)）。
- Gu 2410.10781：key bias、sigmoid 到 1B 无 sink。Barbero 2504.02732 Table 1：Llama 3.1 405B sink metric **78.29**（$\epsilon=0.8$）。Star Attention Table 2 的 StreamingLLM 是 1000+8000，RULER 45.07。
- `2.3.2` 索引 / 综述 §5.1 / `07-CSA-HCA` / `2.3.4` §4.1 / `2.3` 演进表 / 知识图谱 / `6.3.1.2` §7.2 交叉。vLLM/llama.cpp「广泛集成」未核一手。
- 未 commit。

## 50. 2026-08-30 续：H2O 是 2306.14048，不是 FA，不是 4+窗，不是对未来求和

- 新增 `2.3.2/11-H2O-Heavy-Hitter-Oracle/11-H2O-Heavy-Hitter-Oracle.md`。一手 [arxiv.org/html/2306.14048](https://arxiv.org/html/2306.14048)：Algorithm 1 local $F_{\mathrm{score}}$；§5.1 预算对半分；20% 是总 cache。Table 2 OPT-30B COPA Local w.o. H2 **48.00** / w. H2 **84.00**。Table 3 T4 512+512 30B Accelerate **0.6** vs H2O **18.83**（摘要 29×）。Table 4 XSUM 6.7B FlexGen **10.80** vs **30.40**（摘要 3×）。Table 5 同 batch 99.5s→53.5s（1.9×）。Table 9 只留一边掉 2.85%–22.75%。Q1 叠 StreamLLM 到 4M。自绘 5 图。
- 不是 FA/MEA/BPT（精确全注意力仍要大 cache）；不是 StreamingLLM（固定前 4 位）；综述「未来求和 / 主成分」已加修订。
- `6.4` 把 H2O 写成 NeurIPS 2024 → 修订为 **2023**。`6.4.2` §4.3.2 的 $\epsilon=0.01$ 不是 Xiao 论文数字。
- NVIDIA EAI 博文：FA 不暴露分数、page 驱逐还不了显存——写进专文失效模式，不把 TriAttention 数字倒进 H2O 表。
- 未 commit。
