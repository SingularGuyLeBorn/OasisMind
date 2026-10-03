---
title: "MiMo-V2.5-Pro · 对照译稿"
category: "模型库"
tags: ["MiMo", "对照译稿"]
published: true
excerpt: "MiMo-V2.5-Pro 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 10 -->

XiaomiMIMO

[Back to Home](https://mimo.xiaomi.com/)

April 27th, 2026

# Xiaomi MiMo-V2.5-Pro

**A leap in agentic and long horizon coherence.**

**Agentic 与长程连贯性的一次跃升.**

[**Try it now ›**](https://aistudio.xiaomimimo.com/)

[**Access API ›**](https://platform.xiaomimimo.com/)

[**Hugging Face ›**](https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro)

**Today, we are releasing and open-sourcing MiMo-V2.5-Pro. It is our most capable model to date, delivering significant improvements over its predecessor, MiMo-V2- Pro, in general agentic capabilities, complex software engineering, and longhorizon tasks. MiMo-V2.5-Pro is a 1.02T-parameter Mixture-of-Experts model with 42B active parameters, built on a hybrid-attention architecture with a 1M-token context window.**

**今天我们发布并开源 MiMo-V2.5-Pro. 这是我们迄今能力最强的模型, 相对前代 MiMo-V2-Pro, 在通用 agentic 能力, 复杂软件工程与长程任务上均有显著提升. MiMo-V2.5-Pro 是总参 1.02T 的 MoE 模型, 激活参数 42B, 采用 hybrid-attention 架构, 上下文窗口 1M token.**

![Chart block](images/p01-frontierswe-impl-rank.png)

<!-- page 2 of 10 -->

FrontierSWE (Impl., rank)

GENERAL AGENT

![Chart block](images/p02-chart.png)

![Chart block](images/p02-chart-2.png)

![Chart block](images/p02-reasoning.png)

REASONING

![Chart block](images/p02-in-internal-testing-v2-5-pro-demonstrated-a-new-level.png)

**In internal testing, V2.5-Pro demonstrated a new level of intelligence that, in turn, pushed our researchers to rethink how they work with it. When paired with a proper harness, V2.5-Pro can sustain complex, long-horizon tasks spanning more than a thousand tool calls. We also see substantial improvements in instruction following within agentic scenarios. It reliably adheres to subtle requirements embedded in context and maintains strong coherence across ultra-long contexts.**

**内部测试里, V2.5-Pro 表现出新一档智能, 反过来迫使研究者重新思考如何与之协作. 配上合适的 harness, V2.5-Pro 能撑起跨越一千次以上工具调用的复杂长程任务. Agentic 场景下的指令遵循也明显增强: 能可靠贴合上下文里的细微约束, 并在超长上下文中保持强连贯性.**

**MiMo-V2.5-Pro is now fully rolled out across our API Platform, AI Studio, and other surfaces, with no change in pricing. Simply replace the model tag with** mimo-v2.5- pro **to get started.**

**MiMo-V2.5-Pro 已在 API Platform, AI Studio 及其他入口全量上线, 定价不变. 把模型 tag 换成 mimo-v2.5-pro 即可开始使用.**

## Built to Solve Harder 为更难的目标而建

**MiMo-V2.5-Pro is built for harder goals. We've given it tasks that would take human experts days or weeks, and let it run autonomously. Here's what it delivers:**

**MiMo-V2.5-Pro 面向更难的目标. 我们把人类专家通常要花数天或数周的任务交给它自主跑. 下面是它交付的结果:**

### SysY Compiler in Rust 用 Rust 写 SysY 编译器

<!-- page 3 of 10 -->

**Sourced from Peking University's** [**Compiler Principles**](https://github.com/pku-minic) **course project, this task asks the model to implement a complete SysY compiler in Rust from scratch: lexer, parser, AST, Koopa IR codegen, RISC-V assembly backend, and performance optimization. The reference project typically takes a PKU CS major student several weeks. MiMo-V2.5-Pro finished in 4.3 hours across 672 tool calls, scoring a perfect 233/233 against the course's hidden test suite.**

**任务来自北京大学** [**编译原理**](https://github.com/pku-minic) **课程项目: 要求模型从零用 Rust 实现完整 SysY 编译器, 含 lexer, parser, AST, Koopa IR 代码生成, RISC-V 汇编后端与性能优化. 参考项目通常要一位北大计科本科生数周. MiMo-V2.5-Pro 用 4.3 小时, 经 672 次工具调用完成, 对课程隐藏测试集拿到满分 233/233.**

Building a complete SysY compiler in Rust, from scratch to 100%

从零到满分: 用 Rust 搭完整 SysY 编译器

![Chart block](images/p03-rather-than-thrashing-through-trial-and-error-the-model.png)

**Rather than thrashing through trial and error, the model built the compiler layer by layer: scaffold the full pipeline first, perfect Koopa IR (110/110), then the RISC-V backend (103/103), then performance (20/20). The first compile alone passed 137/233 tests, a 59% cold start that suggests the architecture was designed correctly before a single test was run. At turn 512 a refactoring pass regressed lv9/riscv by two tests; the model diagnosed the failures, recovered, and pushed on. Longhorizon work rewards this kind of structured, self-correcting discipline.**

**模型并未盲目试错, 而是分层搭建: 先搭起整条流水线骨架, 再把 Koopa IR 做到 110/110, 接着 RISC-V 后端 103/103, 最后性能 20/20. 第一次编译就过了 137/233, 约 59% 的冷启动通过率, 说明在跑任何测试前架构方向大致正确. 第 512 轮一次重构让 lv9/riscv 回退两测; 模型定位失败, 恢复后再推进. 长程工作奖励的正是这种结构化, 自校正的纪律.**

> **想:** 页 3 写第一次编译过 137/233 (约 59%), 又写分层满分 110/110 / 103/103 / 20/20. 这两组分数是同一套隐藏测的不同切分, 还是不同阶段的分项闸门?
> 页内把 110/110, 103/103, 20/20 写成分层完善的阶段目标, 把 137/233 写成 「first compile」 冷启动. 三者之和 233 与总分 233/233 对齐, 更像同一套房测按 IR / 后端 / 性能切分; 冷启动 137 是整套测的首轮通过数, 不是另一套榜.

<!-- page 4 of 10 -->

### A Full-Featured Video Editor 功能齐全的视频编辑器

**With just a few simple prompts, MiMo-V2.5-Pro delivered a working desktop app: multi-track timeline, clip trimming, cross-fades, audio mixing, and export pipeline. The final build is 8,192 lines of code, produced over 1,868 tool calls across 11.5 hours of autonomous work.**

**仅用少量简单提示, MiMo-V2.5-Pro 交付了一款可运行的桌面应用: 多轨时间线, 片段裁剪, 交叉淡化, 音频混音与导出流水线. 最终构建约 8,192 行代码, 经 1,868 次工具调用, 自主运行 11.5 小时.**

A demo of the video editor MiMo-V2.5-Pro wrote end-to-end, including AI voice-over driven by MiMo-V2-TTS.

演示: MiMo-V2.5-Pro 端到端写出的视频编辑器, 含由 MiMo-V2-TTS 驱动的 AI 旁白.

### Analog EDA: FVF-LDO Design & Optimization 模拟 EDA: FVF-LDO 设计与优化

**A graduate-level analog-circuit EDA task: design and optimize a complete FVF-LDO (Flipped-Voltage-Follower low-dropout regulator) from scratch in the TSMC 180nm CMOS process. The model has to size the power transistor, tune the compensation network, and pick bias voltages so that six metrics land within spec simultaneously — phase margin, line regulation, load regulation, quiescent current, PSRR, and transient response. A trained analog designer typically spends several days on a project of this scope.**

**研究生级模拟电路 EDA 任务: 在 TSMC 180nm CMOS 工艺上从零设计并优化完整 FVF-LDO (Flipped-Voltage-Follower 低压差稳压器). 模型需确定功率管尺寸, 调补偿网络, 选偏置电压, 使六项指标同时达标 — phase margin, line regulation, load regulation, quiescent current, PSRR, transient response. 训练有素的模拟设计师做同规模项目通常要数天.**

**We wired MiMo-V2.5-Pro into an ngspice simulation loop with Claude Code as the harness. In about an hour of closed-loop iteration — calling the simulator, reading**

**我们把 MiMo-V2.5-Pro 接入 ngspice 仿真闭环, 以 Claude Code 为 harness. 约一小时闭环迭代 — 调仿真器, 读**

<!-- page 5 of 10 -->

**waveforms, tweaking parameters — the model produced a design where every target metric is met, and the four shown below are improved by an order of magnitude over its own initial attempt.**

**波形, 改参数 — 模型给出各项目标均达标的设计, 且下方展示的四项相对其自身初稿提升约一个数量级.**

FVF-LDO Multi-Metric Optimization

FVF-LDO 多指标优化

![Chart block](images/p05-throughout-these-experiments-v2-5-pro-exhibits-a.png)

**Throughout these experiments, V2.5-Pro exhibits a remarkable "harness awareness": it makes full use of the affordances of its harness environment, manages its memory, and shapes how its own context is populated toward the final objective.**

**这些实验里, V2.5-Pro 表现出明显的 「harness awareness」: 充分利用 harness 环境提供的 affordance, 管理自身记忆, 并按最终目标塑造自己上下文的填充方式.**

> **问:** 页 4–5 写 FVF-LDO 闭环用 **Claude Code** 作 harness, 约一小时, 四项相对初稿提升 「an order of magnitude」. 文内有没有给出四项的初值 / 终值数值表, 还是只靠图示?
> 正文只给定性句与图 `images/p05-throughout-these-experiments-v2-5-pro-exhibits-a.png`. 没有把六指标或四展示项的初值, 终值写成可抄表格. 引用 「数量级提升」 必须连图一起读, 不能从文字单独还原精确倍数.

## Frontier Coding Intelligence 前沿编程智能

**We further advanced the model's coding intelligence by scaling post-training compute.**

**我们通过 Scaling 后训练算力, 进一步抬升模型的编程智能.**

**MiMo Coding Bench is our in-house evaluation suite for assessing models' ability to handle diverse coding tasks within agentic frameworks such as Claude Code. It covers repo understanding, project building, code review, structured artifact generation, planning, SWE, and more. MiMo-V2.5-Pro further enhances the user**

**MiMo Coding Bench 是我们的内部评测套件, 用于衡量模型在 Claude Code 一类 agentic 框架里处理多样编程任务的能力. 覆盖仓库理解, 项目构建, 代码审查, 结构化产物生成, 规划, SWE 等. MiMo-V2.5-Pro 进一步增强用户在**

<!-- page 6 of 10 -->

**experience in real-world coding scenarios, better handling a wide variety of development needs.**

**真实编程场景中的体验, 更好覆盖各类开发需求.**

MiMo Coding Bench — closing the gap to Opus 4.6

MiMo Coding Bench — 缩小与 Opus 4.6 的差距

![Chart block](images/p06-we-welcome-developers-worldwide-to-integrate-mimo-v2-5.png)

**We welcome developers worldwide to integrate MiMo-V2.5 series into scaffolds such as Claude Code, OpenCode, and Kilo — accessing top-tier intelligence at a lower cost.**

**我们欢迎全球开发者把 MiMo-V2.5 系列接入 Claude Code, OpenCode, Kilo 等 scaffold — 以更低成本获得一线智能.**

## Token Efficiency Token 效率

**Higher intelligence isn't just about higher scores — it's about getting there with fewer tokens. MiMo-V2.5-Pro reaches frontier-tier capability while spending dramatically less on tokens per trajectory. On ClawEval, V2.5-Pro lands at 64% Pass^3 using only \~70K tokens per trajectory — roughly 40–60% fewer tokens than Claude Opus 4.6, Gemini 3.1 Pro, and GPT-5.4 at comparable capability levels. The upper-left corner of the chart is where you want to be: higher score for lower cost.**

**更高智能不只是更高分 — 还要用更少 token 到达. MiMo-V2.5-Pro 摸到 frontier 档能力的同时, 每条 trajectory 的 token 消耗大幅更低. 在 ClawEval 上, V2.5-Pro 以约 \~70K token / trajectory 拿到 64% Pass^3 — 相对可比能力档的 Claude Opus 4.6, Gemini 3.1 Pro, GPT-5.4, token 大约少 40–60%. 图的左上角是理想区: 更高分, 更低成本.**

Pass^3 vs. Token Efficiency on ClawEval Pass^3 与 ClawEval 上的 Token 效率

**Upper-left is better · x = (total input + output tokens) / #trajectories**

**左上更好 · x = (总 input + output token) / trajectory 数**

> **核对:** 页 6 正文写 ClawEval 64% Pass^3 / 约 \~70K token; 页 10 总表写 Claw-Eval (pass^3) 63.8. 这两个数是同一评测的四舍五入, 还是不同协议?
> 页内未声明采样轮次或舍入规则. 最稳妥读法是把 64% 当叙事圆整, 把表内 63.8 当可抄精确值; x 轴定义 「 (total input + output tokens) / #trajectories 」 只解释散点横轴, 不解释 64 与 63.8 的差.

<!-- page 7 of 10 -->

![Chart block](images/p07-token-plan-updates.png)

## Token Plan Updates Token Plan 更新

**Alongside a stronger model, we've also upgraded our inference infrastructure. The Token Plan now comes with a few meaningful improvements:**

**更强模型之外, 我们也升级了推理基础设施. Token Plan 现有几项实质改进:**

<!-- page 8 of 10 -->

XiaomiMIMO NEW Token Plan Updates

New Models Now Supporting: MiMo-V2.5, V2.5-Pro, and V2.5-TTS

Unified Rates (All Context Windows) MiMo-V2.5: 1x consumption rate; MiMo-V2.5 Pro: 2x

IExclusive Surprise for current users All Token Plan credit usage has been reset.

ISub Discounts

Monthly (Next mo. only): Current 30% off I New 23% off;

Annual: 12% off year-round.

**All users who purchased a Token Plan before 14:00 UTC on April 21 will have their used Credit balance reset.**

**在 4 月 21 日 14:00 UTC 前购买 Token Plan 的用户, 已用 Credit 余额将重置.**

> **看表:** 页 1–2 写 「no change in pricing」, 页 8 又写 V2.5-Pro 消费倍率 2x (相对 V2.5 的 1x). 「定价不变」 指的是相对前代 Pro, 还是相对同系列 Flash 档?
> 页内两句并存: 上线段说换 tag 后定价不变; Token Plan 段给系列内 1x / 2x 倍率. 合理读法是 「相对此前 MiMo-V2-Pro 的对外价不涨」, 与 「Plan 内 Pro 相对 V2.5 记 2x 消耗」 不是同一比较轴. 文内没有把两轴合成一张价目表.

## Open Source 开源

**MiMo-V2.5-Pro is now fully open-sourced under a permissive license. Weights, tokenizer, and the full model card are available on Hugging Face.**

**MiMo-V2.5-Pro 现以宽松许可完整开源. 权重, tokenizer 与完整 model card 可在 Hugging Face 获取.**

### Model specifications 模型规格

<!-- page 9 of 10 -->

| Model | Total Params | Active Params | Context | Precision | Download |
| --- | --- | --- | --- | --- | --- |
| MiMo-V2.5-Pro-Base | 1.02T | 42B | 256K | FP8 (E4M3) Mixed | Hugging Face |
| MiMo-V2.5-Pro | 1.02T | 42B | 1M | FP8 (E4M3) Mixed | Hugging Face |

> **拆开:** 规格表里 Base 与 Pro 同为 1.02T / 42B, 但 Context 分别是 256K 与 1M. 页内有没有解释为何 Base 窗口更短, 或二者权重是否同一 checkpoint 再外扩?
> 没有. 页 9 架构段只说预训练原生 32K, 再外扩到 1M; 未说明 Base 停在 256K 的产品理由, 也未声明两行是否共享同一套权重文件. 选型时只能分行列抄 Context, 不能默认 「同一权重两种窗口开关」.

### Architecture & training 架构与训练

**MiMo-V2.5-Pro inherits the hybrid attention and Multi-Token Prediction (MTP) design from** [**MiMo-V2-Flash**](https://github.com/XiaomiMiMo/MiMo-V2-Flash)**. Local Sliding Window Attention (SWA) and Global Attention (GA) are interleaved at a 6:1 ratio with a 128-token window, which cuts KV-cache storage by nearly 7× at long context while preserving performance through a learnable attention-sink bias. A lightweight MTP module with dense FFNs is natively integrated for training and inference, roughly tripling output throughput and accelerating RL rollouts.**

**MiMo-V2.5-Pro 继承** [**MiMo-V2-Flash**](https://github.com/XiaomiMiMo/MiMo-V2-Flash) **的 hybrid attention 与 Multi-Token Prediction (MTP) 设计. 局部 Sliding Window Attention (SWA) 与 Global Attention (GA) 按 6:1 交织, 窗口 128 token; 长上下文下 KV-cache 存储约降 nearly 7×, 并用可学习的 attention-sink bias 保性能. 轻量 MTP 模块 (dense FFN) 原生接入训练与推理, 大致让输出吞吐提升约三倍, 并加速 RL rollout.**

**Pre-training runs on 27T tokens using FP8 mixed precision at a native 32K sequence length, with context extended up to 1M tokens. Post-training follows the three-stage paradigm introduced in MiMo-V2-Flash: (1) Supervised Fine-Tuning** to establish foundational instruction following on curated data pairs; (2) Domain **Specialized Training, where separate teacher models are each optimized via** domain-specific RL across math, safety, agentic tool-use, and more; and (3) Multi **Teacher On-Policy Distillation (MOPD), where a single student model learns onpolicy from its own rollouts under token-level guidance from every specialist teacher, merging their capabilities into one unified model.**

**预训练消费 27T token, 使用 FP8 mixed precision, 原生序列长度 32K, 上下文再外扩至 1M token. 后训练沿用 MiMo-V2-Flash 的三阶段范式: (1) Supervised Fine-Tuning (SFT), 在精选数据对上建立基础指令遵循; (2) Domain Specialized Training, 各领域独立 teacher 分别经领域 RL 优化 (math, safety, agentic tool-use 等); (3) Multi Teacher On-Policy Distillation (MOPD), 单一 student 在自身 rollout 上做 on-policy 学习, 并接受每位专科 teacher 的 token 级指导, 把能力并入统一模型.**

**See the** [**model card**](https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro) **on Hugging Face for architecture details, evaluation tables, and deployment guides for SGLang and vLLM.**

**架构细节, 评测表, 以及 SGLang / vLLM 部署指南, 见 Hugging Face 上的** [**model card**](https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro)**.**

> **确认:** 页 9 写 SWA:GA = 6:1, 窗口 128, KV-cache 「nearly 7×」. 若简单按层占比把全局层当成满缓存, 局部层当成窗口缓存, 「约 7」 从哪来? 文内有没有公式?
> 没有公式. 页内只并列 SWA:GA = 6:1, 窗口 128, 以及 nearly 7×. 6:1 与 「约 7」 在字面上挨着, 但页内没有把压缩比写成 (6 乘窗口 + 1 乘满上下文) / 满上下文, 也未给层数, 头数, 是否共享 KV, sink 位如何计入. 精确比只能回到 「本稿写 nearly 7×」, 细节见 Flash / model card.

> **回看:** MTP 段写 「lightweight MTP module with dense FFNs」 且 「roughly tripling output throughput」. 这是投机解码接受率表, 还是端到端 tokens/s?
> 页内只有这一句. 没有 draft 深度, 接受长度, 或与无 MTP 基线的对照表. 「约三倍」 应读作产品吞吐口号, 并指向继承自 MiMo-V2-Flash; 不能从本稿还原 MTP 深度或验收协议.

> **停一下:** 三阶段里第 (3) 步叫 Multi Teacher On-Policy Distillation (MOPD), student 「learns onpolicy from its own rollouts under token-level guidance from every specialist teacher」. 页内有没有损失形式, teacher 数量, 或与离线蒸馏的对照?
> 没有. 只有专名, on-policy / token-level guidance / 多 teacher 合并这几项定性. 机制背景可外链 OPD / MOPD 单独成篇, 但本稿不能当损失推导来源.

## Full benchmark results 完整基准结果

Best open-source

Best overall

<!-- page 10 of 10 -->

| Benchmark | MiMo-V2.5-Pro1.02T/42B | MiMo-V2-Pro1.02T/42B | DeepSeek V4 Pro 1.6T/49B | Kimi K2.6 1T/32B | GLM 5.1 Ge 744B/40B |
| --- | --- | --- | --- | --- | --- |
| GENERAL AGENT |  |  |  |  |  |
| GDPVal-AA (Elo) | 1581 | 1426 | 1554 | 1480 | 1535 |
| τ³-bench | 72.9 | 64.5 | 71.8 | 71.0 | 70.6 |
| Claw-Eval (pass^3) | 63.8 | 57.8 | 59.8 | 62.3 | 62.7 |
| Humanity's Last Exam | 48.0w.o.tools34.0 | 40.0w.o.tools28.0 | 48.2w.o.tools37.7 | 54.0w.o.tools34.7 | 52.3w.o. wtools31.0 |
| CODING AGENT |  |  |  |  |  |
| SWE-Bench Pro | 57.2 | 55.0 | 55.4 | 58.6 | 58.4 |
| SWE-bench Verified | 78.9 | 78.0 | 80.6 | 80.2 | - |
| Terminal-Bench 2.0 | 68.4 | 57.1 | 67.9 | 66.7 | 69.0 |
| FrontierSWE (Impl.) | #3.4 | #5.0 | - | - | - |

Higher is better unless marked (rank). "—" = not evaluated. DeepSeek V4 Pro numbers are with its max effort setting.

越高越好, 除非标为 (rank). 「—」 = 未评测. DeepSeek V4 Pro 分数取其 max effort 设置.

Xiaomi MiMo Team · 2026

> **再看:** FrontierSWE (Impl.) 格是 #3.4 / 前代 #5.0, 带小数的 rank. 这是多次跑的平均名次, 还是别的聚合?
> 页 1 图题与页 10 表都用 Impl. rank. 脚注只说 Higher is better unless marked (rank). 未解释小数 rank 的聚合方式. 引用时保留 #3.4 字面, 不要改成整数名次.

> **对一下:** Humanity's Last Exam 格写成 `48.0w.o.tools34.0` 这类粘连串. 应读成 「含工具 48.0 / 无工具 34.0」 吗?
> 与同列其他模型的 `w.o.tools` 粘连模式一致, 最合理是 「主分 + without tools 副分」. GLM 一格 OCR 成 `w.o. wtools31.0`, 仍按同模式读副分 31.0. 页内没有单独脚注定义 HLE 协议; DeepSeek 行另注 max effort 只覆盖该列整体, 未单说 HLE.
