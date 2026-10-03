---
title: "MiMo-V2.5-Pro：把 Flash 的配方放大到 1T，滑窗比例改成 6:1"
category: "模型库"
tags: ["MiMo", "技术解析"]
published: true
excerpt: "页 1 的身份声明：发布并开源，是小米迄今最强的模型，相对前代 MiMo-V2-Pro 在通用 Agent，复杂软件工程与长程任务上明显提升；"
---
# MiMo-V2.5-Pro：把 Flash 的配方放大到 1T，滑窗比例改成 6:1

> 源文 `mimo-v2-5-pro.md` 是 2026-04-27 的发布页（10 页标记，9 图）：发布口号，三个长程案例，Token 效率散点，Token Plan 更新，规格表，一段架构与训练说明，一张对照总表。没有层表，专家数，路由，消融或损失函数。用到 Flash 报告，V2.6 报告或 Hugging Face 模型卡的数字时逐处标明出处。

来源：同目录 `mimo-v2-5-pro.md`。对照译稿见 `mimo-v2-5-pro-bi.md`。入口：[AI Studio](https://aistudio.xiaomimimo.com/), [API](https://platform.xiaomimimo.com/), [Hugging Face](https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro)。同族报告：`../mimo-v2-flash/mimo-v2-flash.md`, `../mimo-v2-6/mimo-v2-6.md`。

## 1. 规格与结构

### 1.1. 规格与谱系

页 1 的身份声明：发布并开源，是小米迄今最强的模型，相对前代 MiMo-V2-Pro 在通用 Agent，复杂软件工程与长程任务上明显提升；1.02T 参数 MoE，激活 42B，hybrid attention，1M 上下文。页 9 规格表两行：Base 与正式版都是 1.02T / 42B，精度 FP8 (E4M3) Mixed，上下文分别为 256K 与 1M. 前代 MiMo-V2-Pro 在对照表里标的也是 1.02T/42B，所以 V2.5-Pro 相对前代没有换规模，提升来自训练。

放到家族里，V2.5-Pro 是 Flash 配方的放大版，又是 V2.6-Pro 的前身。页 9 写明继承 Flash 的 hybrid attention 与 MTP，预训练 27T tokens，与 Flash 报告的 27T 相同；后训练沿用 Flash 的三阶段范式。往后看，V2.6 报告的 Pro 档是 1.02T / 42B，预训练 30T tokens，其中文本阶段 27T，omni 阶段 3T，规模与文本数据量都和 V2.5-Pro 对得上，V2.6-Pro 很可能是在 V2.5-Pro 的文本预训练基础上接入视听再继续训练（两份材料都没明说）。这与 V2.5 和 V2.6-Flash 之间的关系是同一个模式。

### 1.2. 混合注意力从 5:1 改到 6:1

页 9 的架构句：SWA 与 GA 按 6:1 交织，窗口 128 token，长上下文 KV 缓存存储降近 7×，用可学习的 attention-sink bias 保住性能。Flash 报告是每个 block 5 个 SWA 接 1 个 GA，首层是 GA，逐层数为 39 SWA 与 9 GA. V2.6 报告 Tab. 1 给出 Pro 档 70/60/10 层（总层 / SWA / GA），即 6:1；Hugging Face 模型卡（外部材料）写 V2.5-Pro 70 层，1 层稠密加 69 层 MoE，GA 10 层，SWA 60 层，与 V2.6-Pro 一致。窗口两代都是 128。

「近 7×」 可以用层数比例核对一下（推算）。SWA 层只存最近 128 个位置，序列很长时其 KV 缓存可以忽略，长上下文的 KV 基本全来自 GA 层。全局层占比 $10/70=1/7$，相对全部层都用全局注意力，KV 约为 1/7，与页面的 「nearly 7×」 一致。同样的算法用在 Flash 上是 $9/48\approx0.19$，约 5.3×；Flash 报告的 「nearly 6×」 是按 5:1 的 block 模板说的，没有扣首层。从 5:1 到 6:1，小米在更大的模型上把全局层比例又压低了一些，这和 Flash 报告 §2.2 的消融方向一致（窗口 128 加 sink 不输全局注意力），但那组消融只做到 5:1, 6:1 是否在 1T 规模上重新验证过，本页没有写。sink 的机制背景见 [StreamingLLM 与 Attention Sink](../../../../llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/10-StreamingLLM与Attention-Sink/10-StreamingLLM与Attention-Sink.md)。

### 1.3. MTP，预训练与后训练

MTP 一句：轻量 MTP 模块用稠密 FFN，原生用于训练与推理，输出吞吐 「roughly tripling」，并加速 RL rollout. Flash 报告的 MTP 是 3 层，每层约 0.33B，稠密 FFN 加 SWA，接受长度最高约 3.6，解码加速在 1.82×–2.70× 之间；模型卡（外部）写 V2.5-Pro 也是 3 层 MTP。「约三倍」 比 Flash 的实测表略高，本页没有给测试条件，只能当产品口径。MTP 在 RL 中的用处承自 Flash 的论证：on-policy 小 batch 吃不满 GPU，长尾序列拖住整批，多 token 草稿能补回算术强度。到 V2.6，RL rollout 改用 DFlash 草稿模型，报告称接受长度比 MTP 配置高 31.3%. MTP 的一般机制见 [MTP 单独成篇](../../../../llm-guide/2-核心原理与架构/2.4-前沿架构与变体/2.4.6-多Token预测MTP深度解析.md)。

训练一段：预训练 27T tokens，FP8 混合精度，原生序列 32K，上下文扩到 1M；后训练三阶段，（1）SFT 建立基础指令遵循，（2）分域训练，各领域教师分别做 RL（点名数学，安全，agentic 工具调用等），（3）MOPD，一个学生在自己的 rollout 上接受每位专科教师的 token 级指导，合成统一模型。这和 Flash 报告的 Figure 3 一一对应。Flash 报告给了 MOPD 的具体形式：reverse KL 取负作为 token 级优势，叠加 ORM 优势，训练-推理比率越界的 token 置零；本页没有给教师数量，RL 算法或任何超参。Frontier Coding 一段写 「通过扩大后训练算力」 进一步提升了代码能力，同样没有算力数字。MOPD 背景见 [MOPD 多教师在线蒸馏](../../../../llm-guide/4-后训练/4.6-OPD/09-MOPD-多教师在线蒸馏/09-MOPD-多教师在线蒸馏.md)。

## 2. 案例，评测与发布

### 2.1. 长程案例：过程数字比结果更有信息

SysY 编译器来自北大 [编译原理](https://github.com/pku-minic) 课程项目：用 Rust 从零实现词法分析，语法分析，AST，Koopa IR 生成，RISC-V 后端与性能优化，页面称参考项目通常要本科生几周。模型用 4.3 小时，672 次工具调用，隐藏测试 233/233。过程是分层推进的：先搭完整流水线，再做 Koopa IR (110/110)，RISC-V 后端（103/103），性能（20/20），三项相加正好 233。第一次编译就过了 137/233（约 59%）；第 512 轮的重构让 lv9/riscv 回退两个测试，模型定位后恢复。页面据此说模型在跑测试之前就把结构设计对了。

视频编辑器：几条简单提示后交付可运行的桌面应用，含多轨时间线，剪辑，交叉淡化，混音与导出，8,192 行代码，1,868 次工具调用，11.5 小时，演示里的旁白由 MiMo-V2-TTS 生成。模拟电路 FVF-LDO：在 TSMC 180nm 工艺上从零设计，要同时让相位裕度，线性调整率，负载调整率，静态电流，PSRR，瞬态响应六项达标；harness 是 Claude Code 加 ngspice 仿真闭环，约一小时，全部指标达标，展示的四项相对模型自己的初稿提升一个数量级（精确值只在图里）。页面把这些表现归结为 「harness awareness」：用满 harness 提供的能力，管理记忆，按目标控制上下文里放什么。这三个案例都是单次演示，没有重复次数或失败率，读作能力上限的样例，不作为受控评测。

### 2.2. 评测：本页的表与 V2.6 报告的表

页 10 对照表：GDPVal-AA Elo 1581（前代 1426），τ³-bench 72.9 (64.5), Claw-Eval pass^3 63.8 (57.8), SWE-Bench Pro 57.2 (55.0), SWE-bench Verified 78.9 (78.0), Terminal-Bench 2.0 68.4 (57.1), FrontierSWE (Impl.) 排名 #3.4 (#5.0). HLE 格是 OCR 粘连的 「48.0 w.o. tools 34.0」，按同列模式读作带工具 48.0，不带工具 34.0。对照组是 DeepSeek V4 Pro（1.6T/49B，按最高推理档评），Kimi K2.6 (1T/32B), GLM 5.1 (744B/40B)。并非全胜：Verified 低于 DeepSeek 80.6 与 Kimi 80.2，SWE-Bench Pro 低于 Kimi 58.6 与 GLM 58.4，Terminal-Bench 2.0 低于 GLM 69.0。相对前代，最大的涨幅在 Terminal-Bench 2.0 (+11.3) 与 τ³-bench (+8.4)，SWE-bench Verified 几乎没动。

Token 效率段：ClawEval 上约 64% Pass^3，每条轨迹约 70K tokens，称比 Claude Opus 4.6，Gemini 3.1 Pro，GPT-5.4 在相近能力下少用约 40–60% token；横轴是（输入 + 输出 token 总数）/ 轨迹数。表里同一项是 63.8, 64% 是取整。这一点和 V2.6 的方向连得上：V2.6 的 GAR 与组相对长度惩罚专门把模型推向 「更短的解」，prompt-mean 聚合也是为了抑制长度增长。

V2.6 报告 Tab. 3 用一批更新的基准重测了 V2.5-Pro，给出另一面：DeepSWE v1.1 19.0, AutomationBench 16.0, Terminal Bench 4.0 1.5, Terminal Bench 2.1 65.2, Toolathlon-Verified 49.1, GDPval-AA 2.1 1107, CyberGym 40.0, MiMo Cyber Bench 0.0。本页的 GDPVal-AA 1581 与 V2.6 表的 GDPval-AA 2.1 1107 版本不同，不能直接比。这组数说明 V2.5-Pro 在长程开发（DeepSWE），跨应用流程（AutomationBench）与网络安全上基本是空白，本页的案例墙展示的是它擅长的一类任务，V2.6 的三轴 RL 才把这些领域补上。

### 2.3. 计费与开源

页 7–8 是 Token Plan 更新：支持 V2.5，V2.5-Pro，V2.5-TTS；所有上下文窗口统一倍率，V2.5 1x，V2.5 Pro 2x；4 月 21 日 14:00 UTC 前购买 Plan 的用户，已用额度重置；另有月付与年付折扣，截图有 OCR 噪声。页 2 同时写 API 与 AI Studio 全量上线，「定价不变」，模型名换成 mimo-v2.5-pro 即可。前者是 Plan 内的系列倍率，后者是相对前代 Pro 的对外价，两件事分开读。

开源一句：宽松许可，权重，tokenizer 与完整模型卡在 Hugging Face，模型卡里有 SGLang 与 vLLM 的部署指南。规格表的 Base (256K) 与正式版（1M）两行与 V2.5 页同一模式，对应后训练阶段才把窗口拉到 1M. 本页只谈产品能力与每条轨迹的 token 成本，没有 TestingTime 相关的开关或说明；对照表脚注说 DeepSeek V4 Pro 用了最高推理档，其他模型的推理设置没有注明。
