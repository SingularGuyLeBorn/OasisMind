---
title: "MiniMax-M2.7 · 对照译稿"
category: "模型库"
tags: ["MiniMax", "对照译稿"]
published: true
excerpt: "MiniMax-M2.7 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
源文是 Hugging Face 上 MiniMaxAI/MiniMax-M2.7 模型页的网页打印，8 页，13 张图（6 张网站图标，4 张柱状图，1 张系统示意图，1 张奖牌率曲线，1 张界面截图），由转写工具转成 Markdown。英文段在前，中文意译紧跟。网站导航，按钮和标签这类零碎文字合并成少数几行再译；标题前转写成 $\mathcal{Q}$ 的锚点图标删去；跨页断开的半句接回上一页的段落。柱状图里的数字是图上印出的柱顶标签，不是读图估计。

<!-- page 1 of 8 -->

![Hugging Face 页头左侧的方块图标](images/p01-image.png)

![搜索框前的图标，转写时被识别成字母 S](images/p01-s.png)

S · Search models, datasets, users...

页头搜索框，占位文字是 「搜索模型，数据集，用户...」。

## [MiniMaxAI](https://huggingface.co/MiniMaxAI)/[MiniMax-M2.7](https://huggingface.co/MiniMaxAI/MiniMax-M2.7)

模型仓库：MiniMaxAI 组织下的 MiniMax-M2.7。

Like 1.25k · Follow MiniMax 10.9k

点赞 1.25k；关注 MiniMax 组织的用户 10.9k。

![Transformers 库标签前的 Hugging Face 笑脸图标](images/p01-transformers-https-huggingface-co-models-library.png)

[Text Generation](https://huggingface.co/models?pipeline_tag=text-generation) · [Transformers](https://huggingface.co/models?library=transformers) · [Safetensors](https://huggingface.co/models?library=safetensors) · [minimax\_m2](https://huggingface.co/models?other=minimax_m2) · [conversational](https://huggingface.co/models?other=conversational) · [custom\_code](https://huggingface.co/models?other=custom_code) · [Eval Results](https://huggingface.co/models?other=eval-results) · [fp8](https://huggingface.co/models?other=fp8) · License: other

任务标签是文本生成；库标签是 Transformers 和 Safetensors；架构标签是 minimax\_m2；另有对话，自定义代码，评测结果，fp8 四个标签。许可证一栏写的是 other（其他）。

Deploy · Copy to bucket **NEW** · Use this model

三个按钮：部署，复制到存储桶（标了 「新」），使用此模型。

[**Model card**](https://huggingface.co/MiniMaxAI/MiniMax-M2.7) · [Files](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/tree/main) · [**xet**](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/tree/main)

仓库标签页：模型卡，文件，文件页旁边的 xet 存储标记。

![Community 标签前的挥手图标](images/p01-community.png)

Community

社区讨论区。

![紧跟 Community 的数字徽标，印着 45](images/p01-downloads-last-month.png)

Downloads last month 1,326,813

上月下载量 1,326,813。

> **想：** 文件名叫 downloads-last-month 的那张小图印着 45，这是下载量吗？
> 不是。它在版面上紧跟 「Community」 这个词，形状是标签页上的计数徽标，更像讨论区的条目数。上月下载量是下面单独用粗体印的 1,326,813，两个数不要混用。

## Safetensors

Model size 229B params · <u>Files info</u> · Tensor type F32 · BF16 · F8\_E4M3 · <u>Chat template</u>

Safetensors 权重信息：模型大小 229B 参数；张量类型有 F32，BF16，F8\_E4M3 三种；另有 「文件信息」 和 「对话模板」 两个入口。

> **问：** 229B 参数，三种张量类型并列，权重下载下来大概多大？
> 本页没印文件总大小。如果主体按 F8\_E4M3 存，每个参数 1 字节，约 229GB；如果全按 BF16 存，约 458GB。页面只列类型不列各自比例，加上有 fp8 标签，实际大小应该靠近 229GB 这一头，但精确值得去 Files info 里看。

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)

Λ Novita · [Text Generation](https://huggingface.co/tasks/text-generation) · Examples · Input a message to start chatting with **MiniMaxAI/MiniMax-M2.7**. · Your prompt here... · Send · [Compare providers](https://huggingface.co/inference/models?model=MiniMaxAI%2FMiniMax-M2.7) · View Code

推理服务商（标了 「新」）：页面列出的是 Novita。下面是文本生成的试用组件：「输入一条消息，开始和 **MiniMaxAI/MiniMax-M2.7** 对话」，输入框占位 「在这里写提示词...」，一个发送按钮；再往下是 「比较服务商」 和 「查看代码」 两个链接。

<!-- page 2 of 8 -->

## Model tree for MiniMaxAI/MiniMax-M2.7（MiniMaxAI/MiniMax-M2.7 的模型树）

**Finetunes** [27 models](https://huggingface.co/models?other=base_model:finetune:MiniMaxAI/MiniMax-M2.7) · **Merges** [3 models](https://huggingface.co/models?other=base_model:merge:MiniMaxAI/MiniMax-M2.7) · **Quantizations** [115 models](https://huggingface.co/models?other=base_model:quantized:MiniMaxAI/MiniMax-M2.7)

以本模型为底座的社区衍生：微调 27 个，合并 3 个，量化 115 个。

## Spaces using MiniMaxAI/MiniMax-M2.7 100（使用本模型的 Space: 100 个）

[🟩 embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer) · sbrandeis/tokenizers-wasm-demo · VIDraft/global-llm-leaderboard · [💱 ginigen-ai/open-router-leaderboard](https://huggingface.co/spaces/ginigen-ai/open-router-leaderboard) · [😻 quickgrid/Tokenizer-Visualizer](https://huggingface.co/spaces/quickgrid/Tokenizer-Visualizer) · \+ 95 Spaces

页面展示了其中 5 个：embedl/hfviewer, sbrandeis/tokenizers-wasm-demo, VIDraft/global-llm-leaderboard，ginigen-ai/open-router-leaderboard，quickgrid/Tokenizer-Visualizer，其余写作 「另有 95 个 Space」。5 + 95 正好是标题里的 100。

## 品 Collection including MiniMaxAI/MiniMax-M2.7（收录本模型的合集）

[**MiniMax-M2** Collection](https://huggingface.co/collections/MiniMaxAI/minimax-m2) · [https://arxiv.org/abs/2605.26494 • 4 items • Updated May 27 • 28](https://huggingface.co/collections/MiniMaxAI/minimax-m2)

合集名是 **MiniMax-M2**；卡片副标题写着 arXiv 2605.26494, 4 项，5 月 27 日更新，末尾一个 28。标题前的 「品」 是合集图标被转写成的汉字。

## Evaluation results（评测结果）

[ScaleAI/SWE-bench\_Pro](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro) · SWE Bench Pro [leaderboard](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro?eval_result=MiniMaxAI/MiniMax-M2.7&leaderboard_task_id=SWE_Bench_Pro) 56.2

数据集 ScaleAI/SWE-bench\_Pro，指标 SWE Bench Pro，附排行榜链接，得分 56.2。

Overall [source](https://internlm.github.io/WildClawBench) 33.8 · Avg Time [source](https://internlm.github.io/WildClawBench) 551 · Avg Cost [source](https://internlm.github.io/WildClawBench) 7.2

三行都链到 WildClawBench：总分 33.8，平均耗时 551，平均花费 7.2。

[SWE-bench/SWE-bench\_Multilingual](https://huggingface.co/datasets/SWE-bench/SWE-bench_Multilingual) · Swe Bench Multilingual Resolved [leaderboard](https://huggingface.co/datasets/SWE-bench/SWE-bench_Multilingual?eval_result=MiniMaxAI/MiniMax-M2.7&leaderboard_task_id=swe_bench_multilingual_%_resolved) 76.5

数据集 SWE-bench/SWE-bench\_Multilingual，指标是解决率，得分 76.5。

[benchflow/skillsbench](https://huggingface.co/datasets/benchflow/skillsbench) · Skillsbench V1 1 [source](https://huggingface.co/datasets/benchflow/skillsbench-leaderboard/raw/main/leaderboard/skillsbench/v1.1/official.json) [leaderboard](https://huggingface.co/datasets/benchflow/skillsbench?eval_result=MiniMaxAI/MiniMax-M2.7&leaderboard_task_id=skillsbench_v1_1) 34.9 \*

数据集 benchflow/skillsbench，版本 v1.1，得分 34.9，后面跟一个星号。

> **核对：** WildClawBench 这三行的 551 和 7.2 是什么单位？
> 本页没写。三行前面也没写数据集名，只能从 source 链接知道它们属于 WildClawBench. 551 可能是秒，7.2 可能是美元（都是推断），引用时只能照印原数，不要替它补单位。

> **看表：** 这个评测面板和第 5 页正文的数字对得上吗？
> 对得上的两项：SWE Bench Pro 面板 56.2，正文 56.22%，四舍五入一致；SWE Multilingual 两处都是 76.5。另外两组（WildClawBench 33.8, SkillsBench 34.9）正文一字未提，SkillsBench 后面的星号在本页找不到脚注。

> **拆开：** 合集链接到 arXiv 2605.26494，本页 M2.7 的分数是出自那篇论文吗？
> 本页没有这样说。合集卡片只印了编号，项数，更新日期和一个 28（按卡片排版像是点赞数，推断），没说 4 项是哪 4 个模型，也没说论文里有没有 M2.7 的评测。所以这份对照稿只收本页自己印出的分数，论文里的数一律不搬。

## UMINIMAX

MiniMax 的标志，转写时变成了 「UMINIMAX」。

<!-- page 3 of 8 -->

Join Our [💬 WeChat](https://platform.minimaxi.com/docs/faq/contact-us) | [🧩 Discord](https://discord.com/invite/DPC4AHFCBw) community. [MiniMax Agent](https://agent.minimax.io/) | [⚡️ API](https://platform.minimax.io/docs/guides/text-generation) | [CLI](https://github.com/MiniMax-AI/cli) | [MiniMax Website](https://www.minimax.io/) [🤗 Hugging Face](https://huggingface.co/MiniMaxAI) | [🐙 GitHub](https://github.com/MiniMax-AI/MiniMax-M2.7) | [🤖 ️ ModelScope](https://www.modelscope.cn/organization/MiniMax) | [📄 LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/LICENSE)

加入我们的微信 | Discord 社区。入口：MiniMax Agent | API | CLI | MiniMax 官网；Hugging Face | GitHub | ModelScope | 许可证文件。

**MiniMax-M2.7** is our first model deeply participating in its own evolution. M2.7 is capable of building complex agent harnesses and completing highly elaborate productivity tasks, leveraging Agent Teams, complex Skills, and dynamic tool search. For more details, see our [blog post](https://www.minimax.io/news/minimax-m27-en).

**MiniMax-M2.7** 是我们第一个深度参与自身进化的模型。M2.7 能搭建复杂的 agent harness（让 agent 稳定干活的整套工作环境），借助 Agent Teams，复杂 Skills 和动态工具搜索，完成非常繁复的生产力任务。详见我们的[博客文章](https://www.minimax.io/news/minimax-m27-en)。

![SWE Bench Pro 与 GDPval-AA 两组柱状图，M2.7 对比 M2.5, Gemini 3.1 Pro, Sonnet 4.6, Opus 4.6, GPT-5.4](images/p03-chart.png)

![Multi-SWE Bench 与 Toolathlon 两组柱状图](images/p03-chart-2.png)

![VIBE-Pro 与 MM-ClawBench 两组柱状图](images/p03-chart-3.png)

![MLE-Bench lite 与 Artificial Analysis 两组柱状图](images/p03-model-self-evolution.png)

四张图各含上下两组柱状图，共 8 组。柱顶印出的数字整理如下，「-」 表示该组没有这个模型。

| 基准 | M2.7 | M2.5 | Gemini 3.1 Pro | Sonnet 4.6 | Opus 4.6 | GPT-5.4 |
| --- | --- | --- | --- | --- | --- | --- |
| SWE Bench Pro | 56.2 | 55.4 | 54.2 | 57.2 | 57.3 | 57.7 |
| GDPval-AA | 50 | 35 | 41 | 57 | 55 | 58 |
| Multi-SWE Bench | 52.7 | 51.3 | - | 51 | 50.3 | 49 |
| Toolathlon | 46.3 | 38.3 | 48.8 | 44.8 | 47.2 | 54.6 |
| VIBE-Pro | 55.6 | 54.2 | 41 | 56.1 | 55.6 | - |
| MM-ClawBench | 62.7 | 57.6 | 61.8 | 64.2 | 75.4 | 73.6 |
| MLE-Bench lite | 66.6 | 51.5 | 66.6 | 72.7 | 75.7 | 71.2 |
| Artificial Analysis | 50 | 42 | 57 | 52 | 53 | 57 |

最后一张图的文件名是 model-self-evolution，这是转写工具取了紧随其后的小标题，图的内容仍是两组基准柱状图。Artificial Analysis 这一组正文没有提到。

## Model Self-Evolution（模型自我进化）

M2.7 initiates a cycle of model self-evolution: during development, we let the model update its own memory, build dozens of complex skills for RL experiments, and improve its own learning process based on experiment results. An internal version of M2.7 autonomously optimized a programming scaffold over 100+ rounds — analyzing failure trajectories, modifying code, running evaluations, and deciding to keep or revert — achieving a **30% performance improvement**. On MLE Bench Lite (22 ML competitions), M2.7 achieved a **66.6% medal rate**, second only to Opus-4.6 and GPT-5.4.

M2.7 开启了一个模型自我进化的循环：开发过程中，我们让模型更新自己的记忆，为 RL 实验搭建几十个复杂 skill，并根据实验结果改进自己的学习流程。M2.7 的一个内部版本自主优化一套编程脚手架，跑了 100 多轮：分析失败轨迹，修改代码，跑评测，再决定保留还是回退，最终带来 **30% 的性能提升**。在 MLE Bench Lite（22 场机器学习竞赛）上，M2.7 拿到 **66.6% 的奖牌率**，仅次于 Opus-4.6 和 GPT-5.4。

> **确认：** 「30% 的性能提升」 是相对多少说的？
> 本页没交代。没写脚手架在哪个基准上评，起点分数是多少，也没说 30% 是相对提升还是绝对百分点。同样，「100 多轮」 只给了下限。这句只能当作定性描述引用。

> **回看：** 正文说 66.6% 「仅次于 Opus-4.6 和 GPT-5.4」，上面 MLE-Bench lite 那组柱子是这样排的吗？
> 不是。图里 Opus 4.6 是 75.7，Sonnet 4.6 是 72.7，GPT-5.4 是 71.2，三家都高于 66.6；Gemini 3.1 Pro 也是 66.6，与 M2.7 并列。按本页自己的图，M2.7 在 6 个模型里并列第 4，正文漏掉了 Sonnet 4.6。

> **停一下：** 22 场竞赛，66.6% 的奖牌率折合拿了几场？
> 22 × 0.666 ≈ 14.65 场，不是整数；14/22 约 63.6%，15/22 约 68.2%. 66.6% 很像 2/3，可 22 不是 3 的倍数。一种可能是多次运行取平均，本页没写运行次数。

<!-- page 4 of 8 -->

M2\* Model Iteration System

M2\* 模型迭代系统。

![M2* 模型迭代系统示意图：人在每一层掌舵，模型在每一层构建；上半是人与 Agent Harness，下半是 RL 团队的实验工作流](images/p04-image.png)

图顶的标语被裁掉一半，能读出 「Humans steer at every layer. Models build at every layer.」（人在每一层掌舵，模型在每一层构建）。左侧蓝框是人：配置 harness（写 skill 和护栏，定研究目标，设升级上报的边界），操控 agent（调用 /job-debug，/job-profile，用聊天描述任务），审阅与决策（看报告和仪表盘，批准或改道，排下一步优先级）。右侧是 Agent Harness，副标题写 「让 agent 可靠的工作空间，由 M2\* 通过 Dev Harness 构建（1 名工程师，4 天，人写代码 0 行）」；里面四个组件是分层 Skills，持久记忆，护栏，评测基础设施；中间绿框 Agent (M2\*) 的动作是读文档和日志，学习约定，自审代码，串联 skill，生成报告，构建并更新记忆，协同工作。下面列出 MCP: Canoe，mini-olap，Feishu，GitLab 等；团队：Data，Pretrain，RL，Infra，Engineering，各自构建自己的 skill 和 MCP；右下角写 「产出下一代模型（递归循环）」。

下半部分是 RL 团队的实验流程，五步：1 实验计划（人 + AI），2 实验开发与运行（AI），3 分析与报告（AI），4 审阅与讨论（人 + AI），5 实验迭代循环（人 + AI）。第 5 步有两条回路：agent 自己分析后自动继续，或由人触发下一轮。图底的分层 skill 链是 /job-debug → /issue-fix → /issue-report。

> **再看：** 图里的 M2\* 和标题里的 M2.7 是什么关系？「1 名工程师，4 天，人写代码 0 行」 又是谁的成绩？
> 本页没定义 M2\*。星号更像是指 M2 系列正在迭代的内部版本，和上一段 「M2.7 的一个内部版本」 呼应。「1 名工程师，4 天」 说的是搭 Agent Harness 这件事，不是训练 M2.7 本身；本页没有给训练算力或训练时长。

![Medal Rates Over Time 曲线：横轴是最大累计有效运行时长（小时），纵轴是金，银，铜和任意奖牌率](images/p04-professional-software-engineering.png)

这张曲线图的标题是 Medal Rates Over Time（奖牌率随时间变化）。横轴是最大累计有效运行时长，0 到约 25 小时；五条线分别是金牌率，银牌率，铜牌率，任意奖牌率，以及 「任意奖牌率（真实 / 按交叉验证选出）」。文件名取自下一个小标题，内容讲的其实是 MLE Bench 的奖牌。

> **对一下：** 这条曲线的终点和正文的 66.6%，22 场对得上吗？
> 对不上。读图，任意奖牌率的终点约 73.9%，按交叉验证选出的那条约 65.2%。曲线每一级台阶高约 4.35%，正好是 1/23；终点处金牌约 43.5% (10/23)，银牌约 21.7% (5/23)，铜牌约 8.7% (2/23)，三者相加 17/23 ≈ 73.9%，与任意奖牌率吻合（读图）。分母像是 23 而不是 22，两条终点也都不是 66.6。图上也没标这是哪个模型，跑了几次。

## Professional Software Engineering（专业软件工程）

M2.7 delivers outstanding real-world programming capabilities spanning log analysis, bug troubleshooting, refactoring, code security, and machine learning. Beyond code generation, M2.7 demonstrates strong system-level reasoning — correlating monitoring metrics, conducting trace analysis, verifying root causes in databases, and making SRE-level decisions. Using M2.7, we have reduced live production incident recovery time to **under three minutes** on multiple occasions.

M2.7 在真实编程场景里表现突出，覆盖日志分析，bug 排查，重构，代码安全和机器学习。除了生成代码，M2.7 还有很强的系统级推理：关联监控指标，做链路追踪分析，在数据库里核实根因，做出 SRE 级别的决策。用 M2.7，我们多次把线上生产事故的恢复时间压到 **三分钟以内**。

<!-- page 5 of 8 -->

On SWE-Pro, M2.7 achieved 56.22%, matching GPT-5.3-Codex, with even stronger performance on real-world engineering benchmarks: **SWE Multilingual (76.5)** and **Multi SWE Bench (52.7)**. On **VIBE-Pro (55.6%)**, M2.7 is nearly on par with Opus 4.6. On **Terminal Bench 2 (57.0%)** and **NL2Repo (39.8%)**, M2.7 demonstrates deep understanding of complex engineering systems. M2.7 also supports native **Agent Teams** for multi-agent collaboration with stable role identity and autonomous decision-making.

在 SWE-Pro 上，M2.7 拿到 56.22%，与 GPT-5.3-Codex 持平；在更贴近真实工程的基准上更强：**SWE Multilingual (76.5)** 和 **Multi SWE Bench (52.7)**。在 **VIBE-Pro (55.6%)** 上，M2.7 几乎与 Opus 4.6 持平。在 **Terminal Bench 2 (57.0%)** 和 **NL2Repo (39.8%)** 上，M2.7 显示出对复杂工程系统的深入理解。M2.7 还原生支持 **Agent Teams**，用于多 agent 协作，各角色身份稳定，能自主决策。

> **想：** 「与 GPT-5.3-Codex 持平」 在本页哪张图里能看到？
> 哪张都没有。本页的柱状图只放了 GPT-5.4，SWE Bench Pro 一组里 GPT-5.4 是 57.7，比 M2.7 的 56.2 高 1.5；Sonnet 4.6 的 57.2 和 Opus 4.6 的 57.3 也都更高。GPT-5.3-Codex 的分数本页没印，这句没法在本页核对。

> **问：** Terminal Bench 2 的 57.0% 和 NL2Repo 的 39.8% 有对照吗？
> 没有。这两项不在任何一张柱状图里，正文也没给其他模型的分数，只能单独记下 M2.7 自己的数。「深入理解复杂工程系统」 是作者的评价，本页没有据以比较的对象。

![Agent Team 界面截图：电商平台项目 Sprint #12 用户仪表盘，5 个 agent 分工协作](images/p05-professional-work.png)

截图是一个 Agent Team 界面：项目 e-commerce-platform, Sprint #12 「User Dashboard」。右侧列出 5 个 agent: Manager（协调者，正在分派），WebDev（架构师，思考中），Frontend（UI/UX，编码中），Backend（API，编码中），Tester（QA，等待中）。任务栏 2/6 已完成（项目脚手架，定义 API schema），进行中的是仪表盘 UI 和用户 API 接口，集成测试和端到端测试套件还没开始。活动日志两条：00:02 分析用户仪表盘需求；00:06 拆出子任务（UI 布局，API 接口，数据模型，测试套件）。终端里是 npm run dev，服务跑在 3000 端口。文件名取自下一个小标题，内容对应的是上一段的 Agent Teams。

## Professional Work（专业办公）

M2.7 achieved an **ELO score of 1495** on GDPval-AA (highest among open-weight models), surpassing GPT5.3. It handles Word, Excel, and PPT with high-fidelity multi round editing, producing editable deliverables. On Toolathon, M2.7 reached 46.3% accuracy (global top tier), and maintains **97% skill compliance** across 40+ complex skills on MM Claw. On the MM Claw end-to-end benchmark, M2.7 achieved 62.7%, close to Sonnet 4.6.

M2.7 在 GDPval-AA 上拿到 **1495 的 ELO 分**（开放权重模型中最高），超过 GPT5.3。它能对 Word，Excel，PPT 做高保真的多轮编辑，交付可继续编辑的文件。在 Toolathon 上，M2.7 准确率达到 46.3%（全球第一梯队）；在 MM Claw 上，面对 40 多个复杂 skill 保持 **97% 的 skill 遵循率**。在 MM Claw 端到端基准上，M2.7 拿到 62.7%，接近 Sonnet 4.6。

> **核对：** 正文 GDPval-AA 是 ELO 1495，柱状图里 GDPval-AA 却是 50，哪个对？
> 两个数的量纲不同，本页没说图里的 50 是什么分数（胜率，百分位还是某种归一化，都有可能）。图里 M2.7 的 50 低于 GPT-5.4 的 58，Sonnet 4.6 的 57 和 Opus 4.6 的 55；正文拿来比的 GPT5.3 不在图里。「开放权重中最高」 在图里只有 M2.5 (35) 一个同类可比。

> **看表：** Toolathon 的 46.3% 算 「全球第一梯队」 吗？
> 先对名字：正文写 Toolathon，图里写 Toolathlon，分数都是 46.3，应是同一个基准。图里 GPT-5.4 54.6，Gemini 3.1 Pro 48.8，Opus 4.6 47.2 都高于它，只有 Sonnet 4.6 (44.8) 和 M2.5 (38.3) 更低；M2.7 在 6 个模型里排第 4，离第一差 8.3。「第一梯队」 要看梯队怎么划，本页没给标准。

> **拆开：** MM Claw 有三个数：97% skill 遵循率，端到端 62.7%，还有第 2 页的 WildClawBench 33.8，是一回事吗？
> 不是一回事。97% 讲的是 40 多个 skill 上的遵循程度，本页没有对应的图；62.7 对应图里的 MM-ClawBench，接近 Sonnet 4.6 的 64.2 不假，但 Opus 4.6 (75.4) 和 GPT-5.4 (73.6) 高出十多分；33.8 来自 InternLM 的 WildClawBench，是另一个基准。三个数不能互相换算。

<!-- page 6 of 8 -->

## Entertainment（娱乐）

M2.7 features strengthened character consistency and emotional intelligence. We open-sourced [OpenRoom](https://github.com/MiniMax-AI/OpenRoom), an interactive demo that places AI interaction within a Web GUI space with real-time visual feedback and scene interactions. Try it at [openroom.ai](https://www.openroom.ai/).

M2.7 加强了角色一致性和情商。我们开源了 [OpenRoom](https://github.com/MiniMax-AI/OpenRoom)，一个交互演示，把 AI 交互放进 Web 图形界面空间，带实时视觉反馈和场景互动。可在 [openroom.ai](https://www.openroom.ai/) 试用。

## How to Use（使用方式）

MiniMax Agent: [https://agent.minimax.io/](https://agent.minimax.io/)

MiniMax API: [https://platform.minimax.io/](https://platform.minimax.io/)

Token Plan: [https://platform.minimax.io/subscribe/token-plan](https://platform.minimax.io/subscribe/token-plan)

三个入口：MiniMax Agent 网页产品，MiniMax API 开放平台，Token Plan 订阅页。

## Local Deployment Guide（本地部署指南）

Download the model from HuggingFace repository:

从 HuggingFace 仓库下载模型：

[https://huggingface.co/MiniMaxAI/MiniMax-M2.7](https://huggingface.co/MiniMaxAI/MiniMax-M2.7)

We recommend using the following inference frameworks (listed alphabetically) to serve the model:

我们推荐用以下推理框架（按字母顺序排列）部署服务：

## SGLang

We recommend using [SGLang](https://docs.sglang.io/) to serve MiniMax-M2.7. Please refer to our [SGLang Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/docs/sglang_deploy_guide.md).

推荐用 [SGLang](https://docs.sglang.io/) 部署 MiniMax-M2.7，见我们的 [SGLang 部署指南](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/docs/sglang_deploy_guide.md)。

## vLLM

We recommend using [vLLM](https://github.com/vllm-project/vllm) to serve MiniMax-M2.7. Please refer to our [vLLM Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/docs/vllm_deploy_guide.md).

推荐用 [vLLM](https://github.com/vllm-project/vllm) 部署 MiniMax-M2.7，见我们的 [vLLM 部署指南](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/docs/vllm_deploy_guide.md)。

## Transformers

We recommend using [Transformers](https://github.com/huggingface/transformers) to serve MiniMax-M2.7. Please refer to our [Transformers Deployment Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/docs/transformers_deploy_guide.md).

推荐用 [Transformers](https://github.com/huggingface/transformers) 部署 MiniMax-M2.7，见我们的 [Transformers 部署指南](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/docs/transformers_deploy_guide.md)。

> **确认：** 说是 「按字母顺序排列」，可本页的顺序是 SGLang，vLLM，Transformers，对吗？
> 不对。不分大小写时，字母顺序应是 SGLang，Transformers，vLLM；按 ASCII 区分大小写，大写的 S，T 也都排在小写的 v 前面。两种排法 Transformers 都该在 vLLM 前。可能是后加的 Transformers 直接接在了末尾，不影响内容，只是括号里的说明和实际顺序对不上。

<!-- page 7 of 8 -->

## ModelScope

You also can get model weights from [modelscope](https://modelscope.cn/models/MiniMax/MiniMax-M2.7).

也可以从 [ModelScope](https://modelscope.cn/models/MiniMax/MiniMax-M2.7) 获取模型权重。

## NVIDIA NIM

MiniMax M2.7 is also available on [NVIDIA NIM Endpoint](https://build.nvidia.com/minimaxai/minimax-m2.7).

MiniMax M2.7 也上了 [NVIDIA NIM 端点](https://build.nvidia.com/minimaxai/minimax-m2.7)。

## Inference Parameters（推理参数）

We recommend using the following parameters for best performance:

为获得最佳效果，推荐以下参数：

**temperature=1.0**, **top\_p = 0.95**, **top\_k = 40**. Default system prompt:

**temperature=1.0**, **top\_p = 0.95**, **top\_k = 40**。默认系统提示词：

**You are a helpful assistant. Your name is MiniMax-M2.7 and is built by**

**你是一个乐于助人的助手。你的名字是 MiniMax-M2.7，由...构建**（原文到 「built by」 就断了）。

> **回看：** 默认系统提示词停在 「is built by」，后面是什么？
> 本页打印到这里就断了，下一行直接是工具调用指南的标题。句子显然不完整，但本页没有给出后半句，这里不替它补。要用这段提示词，得去仓库原文里取完整版本。

## Tool Calling Guide（工具调用指南）

Please refer to our [Tool Calling Guide](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/docs/tool_calling_guide.md).

见我们的[工具调用指南](https://huggingface.co/MiniMaxAI/MiniMax-M2.7/blob/main/docs/tool_calling_guide.md)。

## Contact Us（联系我们）

Contact us at [model@minimax.io](mailto:model@minimax.io).

联系邮箱 [model@minimax.io](mailto:model@minimax.io)。

<!-- page 8 of 8 -->

System theme

页脚的主题切换：跟随系统。

## Company

[TOS](https://huggingface.co/terms-of-service) · [Privacy](https://huggingface.co/privacy) · [About](https://huggingface.co/huggingface) · [Careers](https://apply.workable.com/huggingface/)

Hugging Face 公司栏：服务条款，隐私，关于，招聘。

## Website

[Models](https://huggingface.co/models) · [Datasets](https://huggingface.co/datasets) · [Spaces](https://huggingface.co/spaces) · [Pricing](https://huggingface.co/pricing) · [Docs](https://huggingface.co/docs)

网站栏：模型，数据集，Space，价格，文档。

![页脚的 Hugging Face 笑脸标志](images/p08-image.png)
