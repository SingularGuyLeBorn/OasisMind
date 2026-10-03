<!-- page 1 of 11 -->

![Hugging Face 站点图标](images/p01-s.png)

Search models, datasets, users...

搜索模型, 数据集, 用户...

## [MiniMaxAI](https://huggingface.co/MiniMaxAI)/[MiniMax-M2.1](https://huggingface.co/MiniMaxAI/MiniMax-M2.1)

## MiniMaxAI / MiniMax-M2.1 (Hugging Face 模型页)

Like 1.36k · Follow MiniMax 10.9k

点赞 1.36k, 关注 MiniMax 的用户 10.9k.

[Text Generation](https://huggingface.co/models?pipeline_tag=text-generation) · [Transformers](https://huggingface.co/models?library=transformers) · [Safetensors](https://huggingface.co/models?library=safetensors) · [minimax\_m2](https://huggingface.co/models?other=minimax_m2) · [conversational](https://huggingface.co/models?other=conversational) · [custom\_code](https://huggingface.co/models?other=custom_code) · [Eval Results](https://huggingface.co/models?other=eval-results) · [fp8](https://huggingface.co/models?other=fp8) · arxiv:2509.06501 · License: modified-mit

标签: 文本生成, Transformers 库, Safetensors 格式, minimax_m2 架构标签, 对话, 自定义代码, 评测结果, fp8, arXiv 论文 2509.06501. 许可证是 modified-mit, 即修改版 MIT.

> **核对:** 标签里的 arxiv:2509.06501 是 M2.1 自己的技术报告吗?
> 不是. 第 2 页 「Paper for MiniMaxAI/MiniMax-M2.1」 写明这个编号对应 「WebExplorer: Explore and Evolve for Training Long-Horizon Web Agents」, 第 8 页 BrowseComp 的注释也只把它当评测用的 agent 框架出处. 这页没有挂 M2.1 自己的论文.

Deploy · Copy to bucket **NEW** · Use this model

部署, 复制到存储桶 (新功能), 使用此模型.

[**Model card**](https://huggingface.co/MiniMaxAI/MiniMax-M2.1) · [Files](https://huggingface.co/MiniMaxAI/MiniMax-M2.1/tree/main) · [**xet**](https://huggingface.co/MiniMaxAI/MiniMax-M2.1/tree/main)

模型卡, 文件, xet 存储三个标签页.

![社区标签页的挥手图标](images/p01-community.png)

Community

社区.

![社区讨论数角标, 图中数字为 35](images/p01-downloads-last-month.png)

> **拆开:** 这张图的文件名叫 downloads-last-month, 图里却只有一个 35, 它是下载量吗?
> 不是. PDF 文本层里 35 紧跟在 Community 后面, 应是社区讨论数的角标; 上月下载量是下一行单独印的 20,300. 图名是抽取时按邻近文字起的, 不代表图的内容.

Downloads last month 20,300

上月下载量 20,300.

## Safetensors

Model size: 229B params · Tensor type: F32 · BF16 · F8\_E4M3 · <u>Files info</u> · <u>Chat template</u>

模型大小 229B 参数. 张量类型有 F32, BF16, F8_E4M3 三种. 另有文件信息和对话模板两个入口.

> **想:** 229B 是这页自己印的数, 它从哪来, 这页还有别的规模信息吗?
> 229B 出自 Hugging Face 的 Safetensors 栏, 是按权重文件统计出的参数量. 11 页里没有激活参数, 层数, 专家数, 上下文长度中的任何一个, 本稿只记这一个 229B, 不从别处补.

> **问:** 三种张量类型并存, 哪些权重是 F8_E4M3, 哪些留在 BF16 或 F32?
> 这页没拆. 只能读出权重里有 FP8 (E4M3 格式) 的部分, 和标签里的 fp8 对得上; 各类张量占多少, 分在哪些层, 要去看 Files info 或配置文件, 不在这页.

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)

[Text Generation](https://huggingface.co/tasks/text-generation) · Novita

推理服务商 (新功能): 任务类型是文本生成, 目前只列了 Novita 一家.

Examples: Input a message to start chatting with **MiniMaxAI/MiniMax-M2.1**. Your prompt here... · Send · [Compare providers](https://huggingface.co/inference/models?model=MiniMaxAI%2FMiniMax-M2.1) · View Code

示例: 输入一条消息, 开始和 MiniMaxAI/MiniMax-M2.1 对话. 下面是输入框, 发送按钮, 服务商对比和查看代码入口.

<!-- page 2 of 11 -->

**Model tree for MiniMaxAI/MiniMax-M2.1**

**Adapters** [1 model](https://huggingface.co/models?other=base_model:adapter:MiniMaxAI/MiniMax-M2.1) · **Finetunes** [12 models](https://huggingface.co/models?other=base_model:finetune:MiniMaxAI/MiniMax-M2.1) · **Quantizations** [37 models](https://huggingface.co/models?other=base_model:quantized:MiniMaxAI/MiniMax-M2.1)

MiniMax-M2.1 的模型树: 适配器 1 个, 微调模型 12 个, 量化版本 37 个.

## Spaces using MiniMaxAI/MiniMax-M2.1 100

[embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer) · [pliny-the-prompter/obliteratus](https://huggingface.co/spaces/pliny-the-prompter/obliteratus) · [akhaliq/anycoder](https://huggingface.co/spaces/akhaliq/anycoder) · [ginigen-ai/open-router-leaderboard](https://huggingface.co/spaces/ginigen-ai/open-router-leaderboard) · enzostvs/deepsite · + 95 Spaces

## 使用 MiniMax-M2.1 的 Space: 100 个

页面列出 embedl/hfviewer, pliny-the-prompter/obliteratus, akhaliq/anycoder, ginigen-ai/open-router-leaderboard, enzostvs/deepsite 五个, 其余 95 个折叠, 合计 100.

**Collections including MiniMaxAI/MiniMax-M2.1**

- MiniMax-M2 Collection · https://arxiv.org/abs/2605.26494 • 4 items • Updated May 27 • 28
- [**MiniMax-M2.1** Collection](https://huggingface.co/collections/MiniMaxAI/minimax-m21) · 3 items • Updated Apr 15 • 16

收录本模型的合集有两个. 一个是 MiniMax-M2 合集, 附 arXiv 2605.26494, 共 4 项, 5 月 27 日更新, 28 个赞; 另一个是 MiniMax-M2.1 合集, 共 3 项, 4 月 15 日更新, 16 个赞. 两处日期都没印年份.

> **回看:** M2.1 被收进 「MiniMax-M2」 合集, 能不能据此把 M2 的参数直接套过来?
> 不能. 合集和第 1 页的 minimax_m2 标签只说明两者同属一条产品线, 共用一个架构代码名; 这页自己的规模数只有 229B params 一个. 合集附的 arXiv 2605.26494 是哪篇论文, 这页没印标题.

## Paper for MiniMaxAI/MiniMax-M2.1

## 与 MiniMax-M2.1 关联的论文

[**WebExplorer: Explore and Evolve for Training Long-Horizon Web Agents**](https://huggingface.co/papers/2509.06501)

[Paper • 2509.06501 • Published Sep 8, 2025 • 83](https://huggingface.co/papers/2509.06501)

论文 「WebExplorer: 通过探索与演化训练长程网页 Agent」, 编号 2509.06501, 2025 年 9 月 8 日发布, 83 个赞.

## Article mentioning MiniMaxAI/MiniMax-M2.1

## 提到 MiniMax-M2.1 的文章

[M2.1: Multilingual and Multi-Task Coding with Strong Generalization](https://huggingface.co/blog/MiniMaxAI/multilingual-and-multi-task-coding-with-strong-gen) · [MiniMaxAI • Jan 5 • 42](https://huggingface.co/blog/MiniMaxAI/multilingual-and-multi-task-coding-with-strong-gen)

博客 「M2.1: 多语言, 多任务编程与强泛化」, 作者 MiniMaxAI, 1 月 5 日发布, 42 个赞.

## Evaluation results

## 评测结果

- [Idavidrein/gpqa](https://huggingface.co/datasets/Idavidrein/gpqa) · Diamond · [source](https://huggingface.co/datasets/evaleval/EEE_datastore/blob/192329fb7d6b15b7b0936a1a58ae862aa7e8ba24/flat/objects/08/7b/087b0dc6-3c87-4f40-8458-16f19de92200.json) · [leaderboard](https://huggingface.co/datasets/Idavidrein/gpqa?eval_result=MiniMaxAI/MiniMax-M2.1&leaderboard_task_id=diamond) · 80.81 \*
- [SWE-bench/SWE-bench\_Verified](https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified) · Swe Bench Resolved · [leaderboard](https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified?eval_result=MiniMaxAI/MiniMax-M2.1&leaderboard_task_id=swe_bench_%_resolved) · 74
- [ScaleAI/SWE-bench\_Pro](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro) · SWE Bench Pro · [source](https://scale.com/leaderboard/swe_bench_pro_public) · [leaderboard](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro?eval_result=MiniMaxAI/MiniMax-M2.1&leaderboard_task_id=SWE_Bench_Pro) · 36.81
- [TIGER-Lab/MMLU-Pro](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro) · Mmlu Pro · [source](https://huggingface.co/datasets/evaleval/EEE_datastore/blob/192329fb7d6b15b7b0936a1a58ae862aa7e8ba24/flat/objects/dd/c9/ddc99cec-f5d3-4cc4-9cc5-bb534377b5f6.json) · [leaderboard](https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro?eval_result=MiniMaxAI/MiniMax-M2.1&leaderboard_task_id=mmlu_pro) · 88
- [harborframework/terminal-bench-2.0](https://huggingface.co/datasets/harborframework/terminal-bench-2.0) · Terminalbench 2 · [source](https://www.tbench.ai/leaderboard/terminal-bench/2.0) · [leaderboard](https://huggingface.co/datasets/harborframework/terminal-bench-2.0?eval_result=MiniMaxAI/MiniMax-M2.1&leaderboard_task_id=terminalbench_2) · 29.2 \*

Hugging Face 评测挂件里的分数: GPQA Diamond 80.81 (带星号), SWE-bench Verified 解决率 74, SWE-bench Pro 36.81, MMLU-Pro 88, Terminal-bench 2.0 29.2 (带星号). 每项附数据来源和榜单链接.

> **对一下:** 挂件里 Terminal-bench 2.0 是 29.2*, 第 5 页表里 M2.1 是 47.9, 差了 18.7, 哪个算数?
> 两个都印在这页, 口径不同. 挂件的 source 指向 tbench.ai 官方榜; 第 8 页说表里的 47.9 是在内部框架上用 Claude Code 测的, 修过环境问题, 去掉了超时限制, 取 4 次平均. 星号代表什么, 页面没解释.

> **看表:** GPQA Diamond 挂件印 80.81*, 第 7 页表里 GPQA-D 是 83.0, 这也对不上?
> 对不上, 差 2.19. 挂件的 source 是 evaleval 的 EEE_datastore 数据文件, 表里的 83.0 按第 9 页说明来自参照 Artificial Analysis 方法的内部测试. 对得上的只有 MMLU-Pro (88 对 88.0), SWE-bench Verified (74 对 74.0) 和下一页的 HLE (22.2 对 22.2); SWE-bench Pro 36.81 只出现在挂件里, 正文各表没有这一项.

<!-- page 3 of 11 -->

- [FutureMa/EvasionBench](https://huggingface.co/datasets/FutureMa/EvasionBench) · Evasion Bench · [source](https://arxiv.org/abs/2601.09142) · [leaderboard](https://huggingface.co/datasets/FutureMa/EvasionBench?eval_result=MiniMaxAI/MiniMax-M2.1&leaderboard_task_id=evasion_bench) · 71.31
- [cais/hle](https://huggingface.co/datasets/cais/hle) · Hle · 22.2

挂件续: EvasionBench 71.31, HLE 22.2.

MINIMAX

(MiniMax 标志字样.)

Join Our [WeChat](https://platform.minimaxi.com/docs/faq/contact-us) | [Discord](https://discord.com/invite/hvvt8hAye6) community.

欢迎加入我们的微信群或 Discord 社区.

[MiniMax Agent](https://agent.minimax.io/) | [API](https://platform.minimax.io/docs/guides/text-generation) | [MCP](https://github.com/MiniMax-AI/MiniMax-MCP) | [MiniMax Website](https://www.minimax.io/)

[Hugging Face](https://huggingface.co/MiniMaxAI) | [GitHub](https://github.com/MiniMax-AI/MiniMax-M2.1) | [ModelScope](https://www.modelscope.cn/organization/MiniMax) | [License: Modified-MIT](https://github.com/MiniMax-AI/MiniMax-M2.1/blob/main/LICENSE)

入口链接: MiniMax Agent, API, MCP, MiniMax 官网; Hugging Face, GitHub, ModelScope, 以及修改版 MIT 许可证全文.

## Meet MiniMax-M2.1

## 认识 MiniMax-M2.1

Today, we are handing **MiniMax-M2.1** over to the open-source community. This release is more than just a parameter update; it is a significant step toward democratizing top-tier agentic capabilities.

今天, 我们把 MiniMax-M2.1 交给开源社区. 这次发布不只是一次参数更新, 更是让顶级 Agent 能力走向大众的一大步.

M2.1 was built to shatter the stereotype that high-performance agents must remain behind closed doors. We have optimized the model specifically for robustness in coding, tool use, instruction following, and long-horizon planning. From automating multilingual software development to executing complex, multi-step office workflows, MiniMax-M2.1 empowers developers to build the next generation of autonomous applications—all while being fully transparent, controllable, and accessible.

M2.1 想打破一个成见: 高性能 Agent 只能关起门来做. 我们专门针对编程, 工具使用, 指令遵循和长程规划这几方面的稳健性优化了模型. 从自动化的多语言软件开发, 到执行复杂的多步办公流程, 开发者都能用 MiniMax-M2.1 搭建下一代自主应用, 同时整个过程完全透明, 可控, 人人可用.

We believe true intelligence should be within reach. M2.1 is our commitment to the future, and a powerful new tool in your hands.

我们相信真正的智能应当触手可及. M2.1 是我们对未来的承诺, 也是交到你手里的一件趁手新工具.

<!-- page 4 of 11 -->

![MiniMax-M2.1 与 M2, DeepSeek-V3.2, Claude Sonnet 4.5, Gemini 3 Pro, GPT-5.2 Thinking 在 SWE-bench Verified, Multi-SWE-bench, SWE-bench Multilingual, Terminal-bench 2.0 和 VIBE 六项上的十面板柱状对比图](images/p04-how-to-use.png)

(图里有 10 个面板: 上排 SWE-bench Verified, Multi-SWE-bench, SWE-bench Multilingual, Terminal-bench 2.0, VIBE (Average); 下排 VIBE-Web, VIBE-Simulation, VIBE-Android, VIBE-iOS, VIBE-Backend. 图例是 MiniMax-M2.1, MiniMax-M2, DeepSeek-V3.2, Claude Sonnet 4.5, Gemini 3 Pro, GPT-5.2 Thinking, 没有 Claude Opus 4.5; GPT-5.2 只出现在前四个面板里. 柱上数字和后面几张表逐一对得上, 唯一多出来的是 DeepSeek-V3.2 的 VIBE 六项: Average 76.4, Web 87.1, Simulation 87.4, Android 58, iOS 71, Backend 78.3, 这六个数在正文 VIBE 表里没有.)

## How to Use

## 使用方式

The MiniMax-M2.1 API is now live on the MiniMax Open Platform: [https://platform.minimax.io/docs/guides/text-generation](https://platform.minimax.io/docs/guides/text-generation)

MiniMax-M2.1 的 API 已在 MiniMax 开放平台上线, 地址见上.

Our product MiniMax Agent, built on MiniMax-M2.1, is now publicly available: [https://agent.minimax.io/](https://agent.minimax.io/)

我们基于 MiniMax-M2.1 打造的产品 MiniMax Agent 已公开可用, 地址见上.

The MiniMax-M2.1 model weights are now open-source, allowing for local deployment and use: [https://huggingface.co/MiniMaxAI/MiniMax-M2.1](https://huggingface.co/MiniMaxAI/MiniMax-M2.1)

MiniMax-M2.1 的模型权重已开源, 可以本地部署使用, 地址见上.

## Benchmarks

## 基准评测

MiniMax-M2.1 delivers a significant leap over M2 on core software engineering leaderboards. It shines particularly bright in multilingual scenarios, where it outperforms Claude Sonnet 4.5 and closely approaches Claude Opus 4.5.

在核心软件工程榜单上, MiniMax-M2.1 比 M2 有明显跃升. 多语言场景里表现尤其突出, 超过 Claude Sonnet 4.5, 并逼近 Claude Opus 4.5.

| Benchmark | MiniMax-M2.1 | MiniMax-M2 | Claude Sonnet 4.5 | Claude Opus 4.5 | Gemini 3 Pro | GPT-5.2 (thinking) | DeepSeek V3.2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SWE-bench Verified | 74.0 | 69.4 | 77.2 | 80.9 | 78.0 | 80.0 | 73.1 |
| Multi-SWE-bench | 49.4 | 36.2 | 44.3 | 50.0 | 42.7 | x | 37.4 |

(软件工程主表前两行. 源文表格把长名拆成两行, 这里合回一行, 数字不改; x 表示源文没给该模型的分数. 表在下一页接续.)

<!-- page 5 of 11 -->

| Benchmark | MiniMax-M2.1 | MiniMax-M2 | Claude Sonnet 4.5 | Claude Opus 4.5 | Gemini 3 Pro | GPT-5.2 (thinking) | DeepSeek V3.2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SWE-bench Multilingual | 72.5 | 56.5 | 68 | 77.5 | 65.0 | 72.0 | 70.2 |
| Terminal-bench 2.0 | 47.9 | 30.0 | 50.0 | 57.8 | 54.2 | 54.0 | 46.4 |

(主表续: SWE-bench Multilingual 和 Terminal-bench 2.0 两行.)

> **再看:** 开头那句说多语言场景 「closely approaches Claude Opus 4.5」, 两行多语言分数离 Opus 各差多少?
> Multi-SWE-bench 是 49.4 对 50.0, 差 0.6; SWE-bench Multilingual 是 72.5 对 77.5, 差 5.0. 前一行算得上逼近, 后一行差距和它领先 Sonnet 的 4.5 分差不多大.

We also evaluated MiniMax-M2.1 on SWE-bench Verified across a variety of coding agent frameworks. The results highlight the model's exceptional framework generalization and robust stability.

我们还在多种编程 Agent 框架下测了 MiniMax-M2.1 的 SWE-bench Verified. 结果显示, 模型的跨框架泛化能力很强, 表现也稳定.

Furthermore, across specific benchmarks—including test case generation, code performance optimization, code review, and instruction following—MiniMax-M2.1 demonstrates comprehensive improvements over M2. In these specialized domains, it consistently matches or exceeds the performance of Claude Sonnet 4.5.

此外, 在测试用例生成, 代码性能优化, 代码审查, 指令遵循这些专项基准上, MiniMax-M2.1 相对 M2 全面提升. 在这些专项领域里, 它始终与 Claude Sonnet 4.5 持平或更好.

| Benchmark | MiniMax-M2.1 | MiniMax-M2 | Claude Sonnet 4.5 | Claude Opus 4.5 | Gemini 3 Pro | GPT-5.2 (thinking) | DeepSeek V3.2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| SWE-bench Verified (Droid) | 71.3 | 68.1 | 72.3 | 75.2 | x | x | 67.0 |
| SWE-bench Verified (mini-swe-agent) | 67.0 | 61.0 | 70.6 | 74.4 | 71.8 | 74.2 | 60.0 |
| SWT-bench | 69.3 | 32.8 | 69.5 | 80.2 | 79.7 | 80.7 | 62.0 |
| SWE-Perf | 3.1 | 1.4 | 3.0 | 4.7 | 6.5 | 3.6 | 0.9 |
| SWE-Review | 8.9 | 3.4 | 10.5 | 16.2 | x | x | 6.4 |

(跨框架与专项表. 前两行是换脚手架后的 SWE-bench Verified: Droid 和 mini-swe-agent; 后三行分别对应测试用例生成, 代码性能优化, 代码审查. 表在下一页还有一行.)

> **拆开:** 说跨框架泛化 「exceptional」, 三种脚手架下 M2.1 的分数摆开是什么样?
> Claude Code 74.0, Droid 71.3, mini-swe-agent 67.0, 最高最低差 7.0. 同样三列, Sonnet 差 6.6, Opus 差 6.5, M2 差 8.4, DeepSeek V3.2 差 13.1. M2.1 比 M2 和 DeepSeek 稳, 和两个 Claude 差不多, 三种脚手架下都低于 Sonnet.

> **确认:** 「consistently matches or exceeds」 Sonnet 4.5, 专项几行都做到了吗?
> 没有全做到. SWE-Perf 3.1 对 3.0, 第 6 页 OctoCodingbench 26.1 对 22.8, 这两行领先; SWT-bench 69.3 对 69.5 基本持平; SWE-Review 8.9 对 10.5, 落后 1.6. 「始终持平或更好」 这句要去掉 SWE-Review 才成立.

> **问:** SWE-Perf 一栏最高只有 6.5, M2.1 是 3.1, 这个数的单位是什么?
> 这页没说. 第 8 页的评测说明只交代 SWE-Perf 用 Claude Code 作脚手架, 取 4 次平均, 没写指标是加速百分比, 通过率还是别的量. 所以只能在同一行里比大小, 不宜和其它行的分数放一起读.

<!-- page 6 of 11 -->

| Benchmark | MiniMax-M2.1 | MiniMax-M2 | Claude Sonnet 4.5 | Claude Opus 4.5 | Gemini 3 Pro | GPT-5.2 (thinking) | DeepSeel V3.2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OctoCodingbench | 26.1 | 13.3 | 22.8 | 36.2 | 22.9 | x | 26.0 |

(专项表最后一行 OctoCodingbench, 对应指令遵循. 表头 「DeepSeel」 是源文拼写, 指 DeepSeek V3.2.)

To evaluate the model's full-stack capability to architect complete, functional applications "from zero to one," we established a novel benchmark: [VIBE (Visual & Interactive Benchmark for Execution in Application Development)](https://huggingface.co/datasets/MiniMaxAI/VIBE). This suite encompasses five core subsets: Web, Simulation, Android, iOS, and Backend. Distinguishing itself from traditional benchmarks, VIBE leverages an innovative Agent-as-a-Verifier (AaaV) paradigm to automatically assess the interactive logic and visual aesthetics of generated applications within a real runtime environment.

为了评估模型 「从零到一」 搭出完整可用应用的全栈能力, 我们新建了一个基准 VIBE (应用开发执行的视觉与交互基准). 它包含五个核心子集: Web, Simulation, Android, iOS, Backend. 和传统基准不同, VIBE 采用 Agent-as-a-Verifier (AaaV, 以 Agent 充当验证者) 的新范式, 在真实运行环境里自动评估生成应用的交互逻辑和视觉美感.

MiniMax-M2.1 delivers outstanding performance on the VIBE aggregate benchmark, achieving an average score of 88.6—demonstrating robust full-stack development capabilities. It excels particularly in the VIBE-Web (91.5) and VIBE-Android (89.7) subsets.

MiniMax-M2.1 在 VIBE 总榜上表现出色, 平均分 88.6, 说明它的全栈开发能力扎实. 其中 VIBE-Web (91.5) 和 VIBE-Android (89.7) 两个子集尤其突出.

| Benchmark | MiniMax-M2.1 | MiniMax-M2 | Claude Sonnet 4.5 | Claude Opus 4.5 | Gemini 3 Pro |
| --- | --- | --- | --- | --- | --- |
| VIBE (Average) | 88.6 | 67.5 | 85.2 | 90.7 | 82.4 |
| VIBE-Web | 91.5 | 80.4 | 87.3 | 89.1 | 89.5 |
| VIBE-Simulation | 87.1 | 77.0 | 79.1 | 84.0 | 89.2 |
| VIBE-Android | 89.7 | 69.2 | 87.5 | 92.2 | 78.7 |
| VIBE-iOS | 88.0 | 39.5 | 81.2 | 90.0 | 75.8 |
| VIBE-Backend | 86.7 | 67.8 | 90.8 | 98.0 | 78.7 |

(VIBE 表: 平均分加五个子集, 只比五个模型, 没有 GPT-5.2 和 DeepSeek V3.2.)

> **核对:** VIBE (Average) 是五个子集的简单平均吗?
> 大多数列是. 估算简单平均: M2.1 88.6, Sonnet 85.18, Opus 90.66, Gemini 82.38, 都和表里一致; M2 的五个子集平均是 66.78, 表里印 67.5, 差 0.72. 页面没说平均分怎么算, 这一格对不上.

> **看表:** 第 4 页图里有 DeepSeek-V3.2 的 VIBE 分数, 这张表为什么没有这一列?
> 这页没解释. 图里 DeepSeek-V3.2 的 VIBE 平均是 76.4, 五个子集简单平均估算为 76.36, 自洽; 反过来, 表里的 Opus 列 (平均 90.7) 在图里没有. 图和表各缺一个对手, 引用时要分清数字出自哪里.

<!-- page 7 of 11 -->

MiniMax-M2.1 also demonstrates steady improvements over M2 in both long-horizon tool use and comprehensive intelligence metrics.

在长程工具使用和综合智能指标上, MiniMax-M2.1 相对 M2 也有稳步提升.

| Benchmark | MiniMax-M2.1 | MiniMax-M2 | Claude Sonnet 4.5 | Claude Opus 4.5 | Gemini 3 Pro | GPT-5.2 (thinking) | DeepSeek V3.2 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Toolathlon | 43.5 | 16.7 | 38.9 | 43.5 | 36.4 | 41.7 | 35.2 |
| BrowseComp | 47.4 | 44.0 | 19.6 | 37.0 | 37.8 | 65.8 | 51.4 |
| BrowseComp (context management) | 62.0 | 56.9 | 26.1 | 57.8 | 59.2 | 70.0 | 67.6 |
| AIME25 | 83.0 | 78.0 | 88.0 | 91.0 | 96.0 | 98.0 | 92.0 |
| MMLU-Pro | 88.0 | 82.0 | 88.0 | 90.0 | 90.0 | 87.0 | 86.0 |
| GPQA-D | 83.0 | 78.0 | 83.0 | 87.0 | 91.0 | 90.0 | 84.0 |
| HLE w/o tools | 22.2 | 12.5 | 17.3 | 28.4 | 37.2 | 31.4 | 22.2 |
| LCB | 81.0 | 83.0 | 71.0 | 87.0 | 92.0 | 89.0 | 86.0 |
| SciCode | 41.0 | 36.0 | 45.0 | 50.0 | 56.0 | 52.0 | 39.0 |
| IFBench | 70.0 | 72.0 | 57.0 | 58.0 | 70.0 | 75.0 | 61.0 |
| AA-LCR | 62.0 | 61.0 | 66.0 | 74.0 | 71.0 | 73.0 | 65.0 |
| τ²-Bench Telecom | 87.0 | 87.0 | 78.0 | 90.0 | 87.0 | 85.0 | 91.0 |

(工具使用与综合智能表. 前三行是长程工具与浏览, 后九行是综合智能指标; HLE w/o tools 指不用工具的 HLE, LCB 即 LiveCodeBench.)

> **停一下:** 说相对 M2 「steady improvements」, 十二行里 M2.1 全都比 M2 高吗?
> 不是. 九行上升; LCB 从 83.0 降到 81.0, IFBench 从 72.0 降到 70.0, 各降 2.0; τ²-Bench Telecom 两者都是 87.0. 升幅最大的是 Toolathlon, 16.7 到 43.5, 涨 26.8.

**Evaluation Methodology Notes.**

**评测方法说明.**

**SWE-bench Verified.** Tested on internal infrastructure using [Claude Code](https://github.com/anthropics/claude-code), [Droid](https://factory.ai/), or [mini-swe-agent](https://github.com/SWE-agent/mini-SWE-agent) as scaffolding. By default, we utilized Claude Code metrics. When using Claude Code, the default system prompt was overridden. Results represent the average of 4 runs.

**SWE-bench Verified.** 在内部基础设施上测, 脚手架用 Claude Code, Droid 或 mini-swe-agent. 默认报的是 Claude Code 下的分数. 用 Claude Code 时, 替换了它的默认系统提示. 结果为 4 次运行的平均.

<!-- page 8 of 11 -->

**Multi-SWE-Bench & SWE-bench Multilingual & SWT-bench & SWE-Perf.** Tested on internal infrastructure using Claude Code as scaffolding, with the default system prompt overridden. Results represent the average of 4 runs.

**Multi-SWE-Bench, SWE-bench Multilingual, SWT-bench, SWE-Perf.** 在内部基础设施上测, 脚手架用 Claude Code, 替换默认系统提示. 结果为 4 次运行的平均.

**Terminal-bench 2.0.** Tested using Claude Code on our internal evaluation framework. We verified the full dataset and fixed environmental issues. Timeout limits were removed, while all other configurations remained consistent with official settings. Results represent the average of 4 runs.

**Terminal-bench 2.0.** 在我们的内部评测框架上用 Claude Code 测. 我们核验了全部数据, 修掉了环境问题. 去掉了超时限制, 其余配置与官方设置一致. 结果为 4 次运行的平均.

> **对一下:** 这些说明写的都是 「我们」 怎么测 M2.1, 表里 Claude, Gemini, GPT, DeepSeek 的分数也是在同一套设置下测的吗?
> 这页没交代. 以 Terminal-bench 2.0 为例, M2.1 的 47.9 是去掉超时限制后的结果, 其它模型的 50.0, 57.8, 54.2 等若取自官方榜 (有超时), 两者就不在同一条件下; 第 2 页挂件给 M2.1 的官方榜分数是 29.2*.

**SWE Review.** Built upon the SWE framework, this internal benchmark for code defect review covers diverse languages and scenarios, evaluating both defect recall and hallucination rates. A review is deemed "correct" only if the model accurately identifies the target defect and ensures all other reported findings are valid and free of hallucinations. All evaluations are executed using Claude Code, with final results reflecting the average of four independent runs per test case. We plan to open-source this benchmark soon.

**SWE Review.** 这是基于 SWE 框架搭建的内部代码缺陷审查基准, 覆盖多种语言和场景, 同时考察缺陷召回率和幻觉率. 只有模型准确找出目标缺陷, 并且报出的其它问题全部成立, 没有幻觉, 这次审查才算 「正确」. 全部评测用 Claude Code 执行, 最终结果是每个用例 4 次独立运行的平均. 我们计划近期开源这个基准.

**OctoCodingbench.** An internal benchmark focused on long-horizon instruction following for Code Agents in complex development scenarios. It conducts end-to-end behavioral supervision within a dynamic environment spanning diverse tech stacks and scaffolding frameworks. The core objective is to evaluate the model's ability to integrate and execute "composite instruction constraints"—encompassing System Prompts (SP), User Queries, Memory, Tool Schemas, and specifications such as Agents.md, Claude.md, and Skill.md. Adopting a strict "single-violation-failure" scoring mechanism, the final result is the average pass rate across 4 runs, quantifying the model's robustness in translating static constraints into precise behaviors. We plan to open-source this benchmark soon.

**OctoCodingbench.** 这是内部基准, 考察 Code Agent 在复杂开发场景下的长程指令遵循. 它在横跨多种技术栈和脚手架框架的动态环境里, 对模型行为做端到端监督. 核心是评估模型整合并执行 「复合指令约束」 的能力, 约束来源包括系统提示 (SP), 用户查询, 记忆, 工具 schema, 以及 Agents.md, Claude.md, Skill.md 这类规范文件. 计分采用严格的 「一次违规即失败」, 最终结果是 4 次运行的平均通过率, 用来量化模型把静态约束落实成精确行为的稳健程度. 我们计划近期开源这个基准.

(源 md 在这段丢了 Agents.md, Claude.md, Skill.md 三个文件名, 只剩逗号; 这里按 PDF 文本层补回.)

**VIBE.** An internal benchmark that utilizes Claude Code as scaffolding to automatically verify a program's interactive logic and visual effects. Scores are calculated through a unified pipeline comprising requirement sets, containerized deployment, and dynamic interaction environments. Final results represent the average of 3 runs. We have open-sourced this benchmark at [VIBE](https://huggingface.co/datasets/MiniMaxAI/VIBE).

**VIBE.** 这是内部基准, 用 Claude Code 作脚手架, 自动验证程序的交互逻辑和视觉效果. 分数由一条统一流水线算出, 流水线包括需求集, 容器化部署和动态交互环境. 最终结果为 3 次运行的平均. 这个基准已开源, 见 VIBE 链接.

**Toolathlon.** The evaluation protocol remains consistent with the original paper.

**Toolathlon.** 评测协议与原论文一致.

**BrowseComp.** All scores were obtained using the same agent framework as [WebExplorer](https://arxiv.org/pdf/2509.06501) (Liu et al. 2025), with only minor fine-tuning of tool descriptions. We utilized the same 103-sample GAIA text-only validation subset as WebExplorer.

**BrowseComp.** 所有分数都用与 WebExplorer (Liu et al. 2025) 相同的 agent 框架取得, 只对工具描述做了小幅调整. 我们使用了与 WebExplorer 相同的 103 条 GAIA 纯文本验证子集.

> **回看:** BrowseComp 的说明为什么落在 「103 条 GAIA 纯文本验证子集」 上?
> BrowseComp 和 GAIA 是两个不同的评测集, 表里也没有 GAIA 一行. 这句话读起来像是从 WebExplorer 的 GAIA 设置搬过来的, 这页没说明它和 BrowseComp 分数是什么关系, 也没给 BrowseComp 本身用了多少题.

**BrowseComp (context management).** When token usage exceeds 30% of the maximum context window, we retain the first AI response, the last five AI responses, and the tool outputs, discarding the remaining content.

**BrowseComp (上下文管理).** 当 token 用量超过最大上下文窗口的 30% 时, 保留第一条 AI 回复, 最后五条 AI 回复和工具输出, 其余内容丢弃.

> **想:** 30% 的最大上下文窗口是多少 token?
> 这页算不出来. 全页没印 M2.1 的上下文长度, 所以触发阈值只能停在比例上; 「tool outputs」 是保留全部工具输出, 还是只保留和留下的回复配套的那部分, 原句也有两种读法.

<!-- page 9 of 11 -->

**AIME25 ~ τ²-Bench Telecom.** Derived from internal testing based on the evaluation datasets and methodology referenced in the [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/).

**AIME25 到 τ²-Bench Telecom.** 这几行来自内部测试, 评测数据集和方法参照 Artificial Analysis Intelligence Index 所引用的那一套.

## Local Deployment Guide

## 本地部署指南

Download the model from HuggingFace repository: [https://huggingface.co/MiniMaxAI/MiniMax-M2.1](https://huggingface.co/MiniMaxAI/MiniMax-M2.1)

从 Hugging Face 仓库下载模型, 地址见上.

We recommend using the following inference frameworks (listed alphabetically) to serve the model:

我们推荐用下列推理框架部署模型 (按字母顺序排列):

### SGLang

We recommend using [SGLang](https://docs.sglang.io/) to serve MiniMax-M2.1. Please refer to our [SGLang Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.1/blob/main/docs/sglang_deploy_guide.md).

推荐用 SGLang 部署 MiniMax-M2.1, 请参考我们的 SGLang 部署指南.

### vLLM

We recommend using [vLLM](https://github.com/vllm-project/vllm) to serve MiniMax-M2.1. Please refer to our [vLLM Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.1/blob/main/docs/vllm_deploy_guide.md).

推荐用 vLLM 部署 MiniMax-M2.1, 请参考我们的 vLLM 部署指南.

### Transformers

We recommend using [Transformers](https://github.com/huggingface/transformers) to serve MiniMax-M2.1. Please refer to our [Transformers Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.1/blob/main/docs/transformers_deploy_guide.md).

推荐用 Transformers 部署 MiniMax-M2.1, 请参考我们的 Transformers 部署指南.

### KTransformers

We recommend using [KTransformers](https://github.com/kvcache-ai/ktransformers) to serve MiniMax-M2.1. Please refer to [KTransformers Deployment Guide](https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/MiniMax-M2.1-Tutorial.md)

推荐用 KTransformers 部署 MiniMax-M2.1, 请参考 KTransformers 部署指南.

### Other Inference Engines

### 其它推理引擎

MLX-LM

(只列了 MLX-LM 一个名字, 没有附指南链接.)

<!-- page 10 of 11 -->

![系统主题切换图标, 笔记本电脑样式](images/p10-mathcal-q-inference-parameters.png)

## Inference Parameters

## 推理参数

We recommend using the following parameters for best performance: **temperature=1.0**, **top\_p = 0.95**, **top\_k = 40**. Default system prompt:

为取得最佳效果, 推荐参数: temperature=1.0, top_p=0.95, top_k=40. 默认系统提示:

**You are a helpful assistant. Your name is MiniMax-M2.1 and is built by**

(意为: 你是一个乐于助人的助手. 你的名字是 MiniMax-M2.1, 由 ... 构建.)

> **确认:** 默认系统提示停在 「built by」, 后面的公司名呢?
> PDF 文本层也停在 「built by 」 处, 不是抽取时漏的. 页面渲染时这一句就不完整, 完整原文要去看仓库里的对话模板或部署文档.

## Tool Calling Guide

## 工具调用指南

Please refer to our [Tool Calling Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.1/blob/main/docs/tool_calling_guide.md).

请参考我们的工具调用指南.

## Contact Us

## 联系我们

Contact us at [model@minimax.io](mailto:model@minimax.io).

联系邮箱 model@minimax.io.

System theme · **Company:** [TOS](https://huggingface.co/terms-of-service) · [Privacy](https://huggingface.co/privacy) · [About](https://huggingface.co/huggingface) · [Careers](https://apply.workable.com/huggingface/) · **Website:** [Models](https://huggingface.co/models) · [Datasets](https://huggingface.co/datasets) · [Spaces](https://huggingface.co/spaces) · [Pricing](https://huggingface.co/pricing)

(Hugging Face 页脚: 系统主题切换; 公司栏有服务条款, 隐私, 关于, 招聘; 网站栏有模型, 数据集, Space, 定价, 下一页还有文档.)

<!-- page 11 of 11 -->

[Docs](https://huggingface.co/docs)

(页脚最后一项: 文档.)
