---
title: "Step 5 Preview · 对照译稿"
category: "模型库"
tags: ["StepFun", "对照译稿"]
published: true
excerpt: "Step 5 Preview 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 20 -->

# Step 5 Preview: One Step Forward — A New Pareto Frontier for Intelligence Efficiency

# Step 5 Preview:向前一步, 智能效率的新一代「帕累托前沿」

StepFun / 阶跃星辰

Source URL: https://www.stepfun.com/step-5-preview

来源 URL: https://www.stepfun.com/step-5-preview

Capture stamp in source: 2026/9/25 11:43

抓取时间戳: 2026/9/25 11:43

<!-- page 2 of 20 -->

Today we formally release **Step 5 Preview**, a flagship foundation model aimed at real-world Agentic tasks. Step 5 Preview reaches frontier-level results on AI coding, software engineering, and professional knowledge work, and shows especially strong capability in finance. Step 5 Preview uses a sparse MoE architecture with 600B total parameters, activating 27B parameters per Token, and supports a 1M Token context window plus visual input.



今天, 我们正式发布 **Step 5 Preview**,一款面向真实世界 Agentic 任务的旗舰基座模型. Step 5 Preview 在 AI 编程, 软件工程, 专业知识工作等任务上达到前沿水平, 并在金融领域展现出尤为突出的能力. Step 5 Preview 采用稀疏 MoE 架构, 总参数量 600B,每个 Token 激活 27B 参数, 支持 1M Token 上下文窗口和视觉输入.

From public benchmarks to internal tests, Step 5 Preview posts competitive results across software engineering, Agent, professional work, and finance.



从公开评测到内部测试, Step 5 Preview 在软件工程, Agent, 专业工作和金融等多个方向上都取得了有竞争力的结果.

DeepSWE v1.1

![Chart block](images/p02-stepcodebench.png)

StepCodeBench

![Chart block](images/p02-programbench.png)

ProgramBench

![Chart block](images/p02-https-www-stepfun-com-step-5-preview.png)

https://www.stepfun.com/step-5-preview

> **想:** 页 2 给出稀疏 MoE, 总参 600B, 每 Token 激活 27B, 以及 1M 上下文与视觉输入. 后文有没有专家池大小, top-k, 共享专家, 或视觉编码器名?
> 没有. 全篇 20 页只在这一句重复规格口号. 没有层表, 没有路由公式, 没有视觉塔专名. 读这页只能记下公开规格是 600B / 27B / 1M + 视觉输入的稀疏 MoE 旗舰预览, 不能还原稀疏拓扑或视觉栈.

<!-- page 3 of 20 -->

Terminal-Bench v4

![Chart block](images/p03-agents-last-exam-ale-cli.png)

Agents' Last Exam (ALE-CLI)

![Chart block](images/p03-gdpval-aa-v2-1.png)

GDPval-AA v2.1

![Chart block](images/p03-frontierfinance.png)

FrontierFinance

![Chart block](images/p03-draco.png)

DRACO

https://www.stepfun.com/step-5-preview

<!-- page 4 of 20 -->

![Chart block](images/p04-gdpval-aa-v2-1-artificial-analysis-https.png)

GDPval-AA v2.1 uses the latest results published by [Artificial Analysis](https://artificialanalysis.ai/) as of 2026-09-20.



GDPval-AA v2.1 采用 [Artificial Analysis](https://artificialanalysis.ai/) 截至 2026 年 9 月 20 日 公布的最新结果.

DeepSWE v1.1 is evaluated with the [SWE-agent](https://github.com/SWE-agent/SWE-agent) harness, with temperature=1.0 and top_p=0.95.



DeepSWE v1.1 使用 [SWE-agent](https://github.com/SWE-agent/SWE-agent) harness 进行评测, 参数设置为 temperature=1.0 and top_p=0.95

On the Artificial Analysis Intelligence Index, Step 5 Preview scores 44. At a similar intelligence level, its Task Cost is clearly lower.



在 Artificial Analysis Intelligence Index 上, Step 5 Preview 获得 44 分. 而在相近智能水平下, 它的 Task Cost 明显更低.

Step 5 Preview Advancing the Pareto Frontier

![Chart block](images/p04-coding.png)

## Coding: Broader Coverage, Deeper Reach

## Coding:覆盖更广, 也能做得更深

Step 5 Preview's Coding ability is not limited to traditional code tasks. It can do software engineering, front-end and visual development, and enter programmable-hardware scenarios; when a task runs for hours and needs continual adjustment from feedback, the model can keep pushing forward.



Step 5 Preview 的 Coding 能力并不局限于传统代码任务. 它可以做软件工程, 前端和视觉开发, 也能进入可编程硬件场景; 当任务持续数小时, 需要不断根据结果调整时, 模型也能继续推进.

https://www.stepfun.com/step-5-preview

> **看表:** 页 4 写 Intelligence Index 44 分, 并称相近智能水平下 Task Cost 「明显更低」, 配图标题是 Advancing the Pareto Frontier. 正文有没有给出 Task Cost 的美元数, 或列出对照模型坐标?
> 没有. 数字只落到 Index 44; Task Cost 与 Pareto 是定性句 + 截图. GDPval-AA 的数据截止日期写成 2026-09-20, 抓取戳是 2026-09-25. 引用应保留 「44 + 更低成本」 的产品主张, 不要从截图臆造未转录的坐标值.

> **核对:** 页 4 把 temperature=1.0 and top_p=0.95 钉在 DeepSWE v1.1 + SWE-agent harness. 同页或后文有没有声明该采样设置适用于 StepCodeBench / Terminal-Bench / 金融榜?
> 没有. 采样句只挂在 DeepSWE v1.1 这一条. 其他榜要么给 avg@4 等度量名, 要么只出分表, 不复用这组 temperature / top_p. 不要把 DeepSWE 的 harness 设置抄到全表.

<!-- page 5 of 20 -->

### Real Software Engineering

### 真实软件工程

**Web** development and visual design



**Web** 开发与视觉设计

Step 5 Preview not only writes front-end code; it can also join visual-content generation and iteration directly. It can finish web UIs and data visualizations, call Blender to create and repeatedly adjust 3D assets, then wire those assets into interactive Three.js web apps and games.



Step 5 Preview 不只会写前端代码, 也能直接参与视觉内容的生成和迭代. 它可以完成网页界面和数据可视化, 也能调用 Blender 创建并反复调整 3D 资产, 再把这些资产接入基于 Three.js 的交互式 Web 应用和游戏.

![Image block](images/p05-1-room-planner.png)

Case 1: Room Planner — from a photo to an interactive space



案例 1:Room Planner — 从照片到可交互空间

Starting from a bedroom photo, this Room Planner turns the space into an editable 3D environment. You can move and rotate furniture with placement feedback, then walk into the finished layout and tour the room in first person.



从一张卧室照片出发, 这个 Room Planner 把空间变成可编辑的 3D 环境. 你可以在带摆放反馈的情况下移动和旋转家具, 再走进完成后的布局, 以第一人称视角参观房间.

#### StepCodeBench

https://www.stepfun.com/step-5-preview

<!-- page 6 of 20 -->

<table><tr><td colspan="2">StepCodeBench Coverage真实世界软件工程的多维视角</td></tr><tr><td>553</td><td>9</td></tr><tr><td>独立代码仓库</td><td>任务类别</td></tr><tr><td>20</td><td>33</td></tr><tr><td>应用领域</td><td>编程语言</td></tr><tr><td>任务类别</td><td></td></tr><tr><td>功能修改</td><td></td></tr><tr><td>Bug 修复</td><td></td></tr><tr><td>重构</td><td></td></tr><tr><td>文档生成</td><td></td></tr><tr><td>性能调优</td><td></td></tr><tr><td>代码生成</td><td></td></tr><tr><td>CI/CD 运维</td><td></td></tr><tr><td>代码转换</td><td></tr><tr><td>环境配置</td></tr><tr><td>应用领域</td><td></td></tr><tr><td>Web 开发</td><td>网络</td></tr><tr><td>移动应用</td><td>操作系统</td></tr><tr><td>云基础设施</td><td>编译器与工具链</td></tr><tr><td>DevOps 与 CI/CD</td><td>开发者工具</td></tr><tr><td>数据库</td><td>科学计算</td></tr><tr><td>分布式系统</td><td>金融科技</td></tr><tr><td>数据工程</td><td>电子商务</td></tr><tr><td>机器学习</td><td>多媒体</td></tr><tr><td>AI 应用</td><td>游戏开发</td></tr><tr><td>网络安全</td><td>嵌入式与 IoT</td></tr><tr><td>编程语言</td><td></td></tr><tr><td>Python</td><td>Swift</td></tr><tr><td>C++</td><td>Dart</td></tr><tr><td>Go</td><td>Objective-C</td></tr></table>

https://www.stepfun.com/step-5-preview

> **问:** 页 6 表给出 StepCodeBench Coverage: 553 独立代码仓库, 9 任务类别, 20 应用领域, 33 编程语言. 后文有没有披露仓库筛选规则, 难度分层, 或与 SWE-bench 家族的关系?
> 没有. 页 6–7 只列覆盖维与 avg@4 总分 / 分任务柱图. 没有题库构建协议, 没有与公开 SWE 基准的对照声明. 引用应保留自建 StepCodeBench 的覆盖口号与分数, 不要当成已对齐的外部标准题库.

<!-- page 7 of 20 -->

| Rust | Ruby |
| --- | --- |
| C | SQL |
| C# | R |
| Bash / Shell | Julia |
| Kotlin | MATLAB |
| Scala |  |
| Groovy |  |
| Clojure |  |
| Haskell |  |
| Erlang |  |
| Elixir |  |
| Lua |  |
| Perl |  |
| Solidity |  |
| Zig |  |
| Assembly |  |

![Chart block](images/p07-step-5-preview-stepcodebench-49-0-avg-4-bug-feature.png)

Step 5 Preview reaches 49.0% avg@4 on StepCodeBench. The figure above shows performance by task type; Bug fix, Feature change, and refactoring stand out relatively strongly.



Step 5 Preview 在 StepCodeBench 上取得 49.0% 的 avg@4.上图展示了不同任务类型下的表现, 其中 Bug 修复, Feature 修改和重构等任务较为突出.

https://www.stepfun.com/step-5-preview

> **拆开:** 页 7 主分是 49.0% avg@4, 正文说 Bug 修复 / Feature 修改 / 重构 「较为突出」. 有没有给出各任务类型的精确百分比, 或 pass@1 / best-of-n 对照?
> 正文没有转录分类型精确百分比; 只有总 avg@4 与柱图. 页 18–19 总表再列 StepCodeBench† 49.0%, 仍无分类型数字. 不要从图柱目测造分.

<!-- page 8 of 20 -->

いエカ,SepSPieveW历円近少ハエ.

(Source OCR noise; not translated.)



(源文 OCR 噪声; 不译.)

This capability also extends to programmable-hardware scenarios. After receiving development docs and user authorization, Step 5 Preview can directly call the camera, COM ports, screenshots, and simulated mouse input to finish on-device development and debugging.



这种能力也延伸到了可编程硬件场景. 在获得开发文档和用户授权后, Step 5 Preview 可以直接调用相机, COM 端口, 截图和模拟鼠标输入, 完成设备侧的开发与调试.

In the case below, Step 5 Preview worked continuously for more than 3 hours, writing, running, and revising code from device feedback.



下面这个案例中, Step 5 Preview 连续工作超过 3 小时, 根据设备反馈不断编写, 运行并修改代码.

![Image block](images/p08-image.png)

## Long-Horizon Task Execution

## 长程任务执行

What makes long tasks truly hard is not only "running for a long time," but whether the model can keep remembering earlier results, understand new feedback, and decide what to do next. We chose two quantifiable settings: optimizing a GPU Kernel, and optimizing a post-training data pipeline.



长任务真正难的, 不只是「跑得久」,而是模型能否一直记住前面的结果, 理解新的反馈, 并据此判断下一步该怎么做. 我们选择了两个可量化的场景: 一个是优化 GPU Kernel, 另一个是优化后训练数据流程.

### Optimizing an MLA GPU Kernel

### 优化 MLA GPU Kernel

We gave Step 5 Preview 24 hours to optimize an MLA GPU Kernel from scratch on one NVIDIA H100 GPU. The task config is Head Dimension 512, Batch Size 1, 64 Heads, 8,192 Tokens. The model started from



我们给 Step 5 Preview 24 小时, 让它在一张 NVIDIA H100 GPU 上从零优化一个 MLA GPU Kernel.任务配置为 Head Dimension 512,Batch Size 1,64 Heads,8,192 Tokens.模型从任

https://www.stepfun.com/step-5-preview

> **确认:** 页 8 把长程实验写成 「优化一个 MLA GPU Kernel」, 并给出 H100 / Head Dimension 512 / 64 Heads / 8,192 Tokens. 原文有没有声明 Step 5 Preview 自身注意力就是 MLA, 或给出层内 MLA 规格?
> 没有. MLA 在这里是被优化的 Kernel 作业对象专名, 不是模型自报的注意力架构. 页内也没有把 600B / 27B 与 MLA 绑定. 不要把作业题里的 MLA 读成 Step 5 的已公开骨干.

<!-- page 9 of 20 -->

Each model ran independently 4 times; the best result was kept. After about 22 hours, Step 5 Preview reached 508 TFLOPS combined forward and backward, the highest in this comparison.



每个模型独立运行 4 次, 最终取最佳结果. Step 5 Preview 在约 22 小时后达到前向与反向合计 508 TFLOPS, 为本次对比中的最高结果.

MLA-512 throughput vs solving time

![Chart block](images/p09-image.png)

### Optimizing a Post-Training Data Pipeline

### 优化后训练数据流程

In the second experiment, we gave Step 5 Preview 24 hours to improve a Qwen3-30B-A3B base model on AIME24 via automated post-training. The model could call an API annotator wired to production data, decide how to use the annotator and how to adjust post-training data, then keep iterating from downstream results.



第二个实验里, 我们给 Step 5 Preview 24 小时, 要求它通过自动化后训练, 提升一个 Qwen3-30B-A3B 基础模型在 AIME24 上的表现. 模型可以调用一个接入生产数据的 API annotator, 并自行决定如何使用 annotator, 如何调整后训练数据, 再根据下游效果继续迭代.

The resulting model reached 60% accuracy on the official AIME24 test set, up from 53.3% before post-training. This matches Claude Opus 5, while using fewer annotator tokens.



最终得到的模型在 AIME24 官方测试集上达到 60% 准确率, 相比后训练前的 53.3% 有明显提升. 这一结果与 Claude Opus 5 持平, 但消耗的 annotator tokens 更少.

https://www.stepfun.com/step-5-preview

> **回看:** 页 9 写 AIME24 60% 对前 53.3%, 「与 Claude Opus 5 持平」, 且 annotator tokens 更少. 原文有没有给出 Claude Opus 5 的具体配置, annotator token 绝对数, 或后训练算法名?
> 没有. 对照停在型号名 Claude Opus 5; tokens 只有 「更少」 的比较句; 后训练只写成自动化流程与 API annotator. 引用应保留三件可抄事实 (60% / 53.3% / 持平主张), 不要补训练配方.

<!-- page 10 of 20 -->

![Chart block](images/p10-bonus-case-coding.png)

### Bonus Case: Long-Horizon Execution Beyond Coding

### Bonus Case:Coding 之外的长程执行

Pokémon Red offers a long-horizon setting completely different from Coding. The hard part is not single-step actions, but sustaining a distant goal: remember earlier information, manage resources, finish interdependent tasks, and replan when the original plan fails. For human players, finishing the main story usually takes about 26 hours.



Pokémon Red 提供了一个和 Coding 完全不同的长程场景. 游戏的难点不在单步操作, 而在于需要持续推进一个很远的目标: 记住之前获得的信息, 管理资源, 完成相互依赖的任务, 并在原有计划行不通时重新调整. 对于人类玩家来说, 完成主线通常需要约 26 小时.

Without any Pokémon-specific optimization, Step 5 Preview has so far sustained more than 3,000 Turns, with cumulative interaction approaching 6 million Tokens. As of now, Step 5 Preview has unlocked Cut, and at step 3,082 defeated Gym Leader Bugsy to earn the third gym badge, reaching roughly one-third of the main-story progress.



在没有做任何 Pokémon 专项优化的情况下, Step 5 Preview 目 前已经持续完成超过 3,000 Turns, 累计交互接近 600 万 Tokens.截至 目 前, Step 5 Preview 已解锁「居合斩」,并在第 3,082 步击败枯叶道馆馆主马志士, 获得第三枚道馆徽章, 主线剧情进度约达三分之一.

The interactive Replay below shows how the run advances step by step, aligning concrete actions, key milestones, and cumulative Token use.



下方的交互式 Replay 展示了这一过程如何一步步推进, 并将具体操作, 关键里程碑和累计 Token消耗对应起来.

https://www.stepfun.com/step-5-preview

> **停一下:** 页 10 写无 Pokémon 专项优化, 3,000+ Turns, 约 600 万 Tokens, 第 3,082 步第三枚徽章. 原文有没有把它标成正式评测基准分, 或给出对照模型的同协议成绩?
> 没有. 小节标题是 Bonus Case, 叙事是进度里程碑 + Replay. 页 18–20 总表也不含 Pokémon. 应读成产品演示型长程案例, 不要当成可横向对比的榜内分.

<!-- page 11 of 20 -->

Explore the recorded decisions, from individual actions to milestones across 3,093 turns. The replay and token timeline follow the same run.

![Chart block](images/p11-image.png)

## Professional Work

## 专业工作

https://www.stepfun.com/step-5-preview

<!-- page 12 of 20 -->

Process Engineering

The cases shown here cover technical engineering, creative production, analytical reports, and public communication; content and presentation are adapted to each domain.



这里展示的案例覆盖技术工程, 创意制作, 分析报告和公共传播等不同类型, 内容与呈现方式都根据各自领域做了适配.

![Image block](images/p12-industrial-engineering.png)

Industrial Engineering

Click to view full artifact

![Image block](images/p12-creative-production.png)

Creative Production

**Music-video moodboard — Baroque Masquerade**

![Image block](images/p12-click-to-view-full-artifact.png)

Click to view full artifact

Live Production

Click to view full artifact

![Image block](images/p12-stage-plot-and-i-o-advance.png)

Stage plot and I/O advance

Six Sigma DMAIC Analyze tollgate

Click to view full artifact

https://www.stepfun.com/step-5-preview

<!-- page 13 of 20 -->

![Image block](images/p13-mechanical-engineering.png)

Mechanical Engineering

<table><tr><td colspan="5">S.1 Summary mobile temperatures</td></tr><tr><td colspan="5">State 7: Your temperature on the reporting lines (2) node model, are relevant to note state has for comparisons.</td></tr><tr><td>Count(s)</td><td>9.5 km (SD) - 0</td><td>4.6 km (SD) - 0</td><td>18 km (SD) - 0</td><td>28 km (SD) - 0</td></tr><tr><td>External line, have noted 3.1 (2 °C)</td><td colspan="2">301 ± 67.1</td><td colspan="2">380 ± 69.4</td></tr><tr><td>Back line, have noted 3.5 (2 °C)</td><td colspan="2">300 ± 69.1</td><td colspan="2">401 ± 69.9</td></tr><tr><td>Back line, after 300 km (mean ± SD)</td><td colspan="2">25.1 ± 28.5</td><td colspan="2">45.0 ± 55.9</td></tr><tr><td>Through distance (± 40 cm) (SD)</td><td colspan="2">—</td><td colspan="2">—</td></tr><tr><td>Chordline width after a length (± 3 cm)</td><td>0.90</td><td>0.30</td><td>0.50</td><td>0.00</td></tr></table>

Click to view full artifact

Click to view full artifact

![Image block](images/p13-manufacturing-engineering-robotic-cnc-work-cell-layout.png)

Manufacturing Engineering Robotic CNC work-cell layout

Click to view full artifact

![Image block](images/p13-video-editing-30-second-client-review-cut.png)

Video Editing 30-second client-review cut

Click to view full artifact

### Large-Scale Research

### 大规模研究

In a climate study covering 1,000 locations over a 25-year span, Step 5 Preview completed 950 Web Fetches in a single Agent Action and assembled a dataset spanning 11 variables and 300,000 monthly records.



在一项覆盖 1,000 个地点,25 年时间跨度的气候研究中, Step 5 Preview 在一次 Agent Action 中完成了 950 次 Web Fetch, 并整理出横跨 11 个变量,30 万条月度记录的数据集.

From that data, the model further analyzed solar-seasonality differences across regions and found that peak months for European and Oceanian samples fall in opposite parts of the year.



基于这些数据, 模型进一步分析不同地区的太阳季节性差异, 并发现欧洲和大洋洲样本的峰值月份分别落在一年中相反的时段.

https://www.stepfun.com/step-5-preview

> **再看:** 页 13 写一次 Agent Action 内 950 次 Web Fetch, 1,000 地点 / 25 年 / 11 变量 / 30 万条月度记录. 原文有没有定义 「一次 Agent Action」 的边界 (工具回合上限, 失败重试, 人工介入)?
> 没有. 数字落在案例叙事; 方法细节停在 NASA POWER 等图注口号 (见页 14). 不要把案例吞吐读成已公开的 Agent 运行时协议.

<!-- page 14 of 20 -->

![Chart block](images/p14-2026-9-25-11-43.png)

Higher latitudes, stronger seasonal swings.

![Image block](images/p14-seasonal-range-annual-mean.png)

Seasonal range / annual mean

Opposite seasons. Different intensity. Regional sample averages · 2001–2025

300,000 location-month records

Collected, validated & analyzed

Illustrated from the model’s research workflow · NASA POWER · URLs abbreviated

### Structured Analysis

### 结构化分析

https://www.stepfun.com/step-5-preview

<!-- page 15 of 20 -->

More importantly, the links among underlying data, computation, and final conclusions are kept intact. Analyses of coverage, data overlap, and regional price changes can keep being traced downward for contract and procurement review.



更重要的是, 底层数据, 计算过程和最终结论之间的关系被完整保留下来. 关于覆盖范围, 数据重叠和区域价格变化的分析, 都可以继续向下追溯, 用于合同和采购复核.

| X | EIA_Diesel_Surcharge_Analysis.xlsx A1 fx - | 1SH7EETS 1RDOE1WE, SP057 6CHARTS A31C95TI×V | E MROOERDNIEDGLEIRNDEAEDLLIFWVROEORRMKABBTOLHOEEK · click A CELL FOR ITS FORMULA |
| --- | --- | --- | --- |
| 123456789 | A Latest week snapshot by region The latest published week is found by formu Latest published week (Monday) Source used for that week Comparison weeks used Region (canonical) | B la, so this sheet re-points itself when Geograph | C a newer extract is dropped into2026-05-04Newer regional 2026-04-27 (pri y level Latest price ($/gal) |
| 10 | United States | National total | 5.640 |
| 11 | East Coast (PADD 1) | PADD | 5.504 |
| 17 SH | EETS Latest_Week_Snapshot 39×15 | LongTerm_Trend 265×11 | Transition_Jun2022 55×12 |
|  |  |  |  |

### Interactive Reports

### 交互式报告

In another research task, Step 5 Preview combined textual analysis, visualizations, data tables, method notes, and supporting materials into one interactive report.



在另一项研究任务中, Step 5 Preview 将文字分析, 可视化, 数据表, 方法说明和支撑材料整合成一份交互式报告.

Readers can move from core conclusions to the evidence behind them, then further inspect concrete methods and analysis details.



读者可以从核心结论继续查看背后的证据, 并进一步检查具体方法和分析细节.

https://www.stepfun.com/step-5-preview

<!-- page 16 of 20 -->

What models can do AI: reading the shift 2025-01 → 2026-08 is giving way to how AI enters the real world

**This is the largest single turn of the past twenty months, and the question it raises matters more than the answer: as model capability is commoditised and real demand explodes, the layer that ought to connect the two — agents, tool use, coding, memory, workflows, reliability — has not grown with them. This report argues that the gap is real, and draws four falsifiable judgements from it.**

Click · the figure folds back into the page the article takes over

F I G . 0 0 · T H E F O U N D A T I O N - M O D E L G A L A X Y FOURTEEN LABS · RADIUS = CURRENT SHARE OF VOICE**TRAIL = THE TWENTY-MONTH PATH · HUE = WHEN IT PEAKED**IN ORBIT

Finance is a professional scenario we focus on in this release.



金融是我们这次重点关注的专业场景之一.

A reliable finance analysis often needs three things at once: find timely, trustworthy information; correctly use accounting, valuation, and analysis methods; and make conclusions that survive audit. Finance information keeps changing, sources are scattered, and reporting periods, statistical calibers, and definitions often diverge. The model must first find reliable raw materials, then organize them into one analysis frame.



一项可靠的金融分析, 往往需要同时处理三件事: 找到足够及时, 可信的信息; 正确使用会计, 估值和分析方法; 最后还要让结论经得起复核. 金融信息持续变化, 来源分散, 不同报告期, 统计口径和定义之间也经常存在差异. 模型需要先找到可靠的原始材料, 再把这些信息整理到同一个分析框架里.

With data in hand, it still has to build forecasts and valuations. Whether assumptions are reasonable, calculations stay consistent, and dependencies among variables remain correct all affect the final answer. For finance analysis that truly supports decisions, "getting a number" is not enough. Key conclusions need to be traceable to original sources; facts and assumptions need clear separation; critical calculations should be reproducible. Places where evidence is thin, and sensitivity of conclusions to key assumptions, also need to be preserved.



有了数据之后, 还要进一步建立预测和估值. 假设是否合理, 计算是否一致, 不同变量之间的依赖关系能不能保持正确, 都会直接影响最终结论. 对于真正用于决策的金融分析, 仅仅「算出一个结果」还不够. 重要结论需要能够追溯到原始来源, 事实和假设需要明确区分, 关键计算也应该可以复现. 证据不足的地方, 以及结论对关键假设的敏感性, 也需要被保留下来.

https://www.stepfun.com/step-5-preview

> **对一下:** 页 16 源文 OCR 大量缺字 (如 「融」 代替 「金融」). 中文意译是否按上下文补全为金融段?
> 是. 同页英文制品标题与页 17 FinStepBench / FrontierFinance 已锁定专业场景为金融. 意译按可恢复的金融分析叙事书写; 不把 OCR 空洞当成新事实源, 也不发明页内未出现的估值公式.

<!-- page 17 of 20 -->

**FinStepBench - CorporateValuation** evaluates whether a model can turn finance data and reasonable assumptions into internally consistent forecasts and finish a reproducible valuation.



**FinStepBench - CorporateValuation** 评估模型能否将金融数据和合理假设转化为内部一致的预测, 并完成可复现的估值.

**FinStepBench - DeepResearch** evaluates the full finance-research workflow, from evidence collection and analysis to a complete, well-supported research report.



**FinStepBench - DeepResearch** 评估完整的金融研究流程, 从证据收集与分析, 到最终产出完整, 有充分依据的研究报告.

The suite focuses on accuracy, analytical rigor, and auditability, including whether sources are traceable, assumptions are explicit, and calculations are reproducible.



整套评测重点关注准确性, 分析严谨性和可审计性, 包括来源能否追溯, 假设是否明确, 以及计算是否可以复现.

We also tested Step 5 Preview on the external benchmark [FrontierFinance](https://samaya.ai/blog/frontier-finance). FrontierFinance covers 6 investment scenario types, 220 expert-designed questions, and 11,543 evaluation criteria, scoring complex finance answers with fine-grained rubrics, giving another reference for the internal suite.



除此之外, 我们也在外部评测 [FrontierFinance](https://samaya.ai/blog/frontier-finance) 上测试了 Step 5 Preview.FrontierFinance 覆盖 6 类投资场景,220 道专家设计的问题和 11,543 项评估标准, 通过细粒度 rubric 对复杂金融回答进行评估, 为内部评测提供了另一组参考.

Across these 4 finance evaluations, Step 5 Preview posts strong results on information retrieval, valuation, and the full finance-research workflow.



在这 4 项金融评测中, Step 5 Preview 在信息检索, 估值和完整金融研究流程上都取得了较强结果.

FrontierFinance

![Chart block](images/p17-finstepbench-livesearch.png)

FinStepBench - LiveSearch

Kimi K3 (Max)

![Chart block](images/p17-https-www-stepfun-com-step-5-preview.png)

https://www.stepfun.com/step-5-preview

> **想:** 页 17 先定义 CorporateValuation 与 DeepResearch, 又写 「4 项金融评测」, 同页图标题是 FinStepBench - LiveSearch, 另点名 FrontierFinance. 第四项是不是 LiveSearch, 正文有没有把四项名字列成清单?
> 正文没有写出 「四项 = A+B+C+D」 的显式名单. 可直接点名的是 CorporateValuation, DeepResearch, LiveSearch (图题), FrontierFinance (外评). 「4 项」 应读成产品汇总口径; 精确集合以页内出现的专名为准, 不要自行增删第五项.

<!-- page 18 of 20 -->

FinStepBench - CorporateValuation

![Chart block](images/p18-finstepbench-deepresearch.png)

FinStepBench - DeepResearch

![Chart block](images/p18-image.png)

## More Benchmark Results

## 更多评测结果

The sections above show part of Step 5 Preview's core capability. Below is a fuller result set covering Reasoning, Coding, Agent, Finance, and Multimodal.



前文展示的是 Step 5 Preview 的部分核心能力. 下面给出更完整的评测结果, 覆盖 Reasoning, Coding, Agent, Finance 和 Multimodal 等多个方向.

<table><tbody><tr><td>评测基准</td><td>Step 5 Preview (High)</td><td>GLM-5.3(Max)</td><td>Kim (Ma</td></tr><tr><td colspan="4">推理与知识</td></tr><tr><td>GPQA Diamond</td><td>93.5%</td><td>91.7%</td><td>93.5%</td></tr><tr><td>HLE</td><td>46.5%</td><td>42.3%</td><td>46.9%</td></tr></tbody></table>

https://www.stepfun.com/step-5-preview

<!-- page 19 of 20 -->

| AA-LCR v1.1 | 88.3% | 79.7% | 88.7% |
| --- | --- | --- | --- |
| CritPt | 20.9% | 19.1% | 23.4% |
| Coding |  |  |  |
| DeepSWE v1.1 | 67.7% | 66.9% | 67.5% |
| Terminal-Bench v2.1 | 85.0% | 83.9% | 85.0% |
| Terminal-Bench v4 | 33.3% | 41.9% | 12.6% |
| CyberGym | 84.7% | 84.5% | 80.0% |
| SciCode | 58.9% | 59.0% | 59.5% |
| RoadmapBench | 54.3% | 54.1% | 55.4% |
| ProgramBench (Pass Rate) | 80.5% | 72.0% | 77.8% |
| SWE-Marathon v1.1 (Partial Score) | 72.7% | 67.4% | 84.4% |
| MLS-Bench-Lite | 40.5% | 37.3% | 48.3% |
| SWE-Atlas-QnA | 63.6% | 59.6% | 59.5% |
| SWE-Atlas-Test-writing | 50.8% | 50.4% | 50.4% |
| StepCodeBench† | 49.0% | 40.2% | 43.9% |
| StepCode-Bench-Daily† | 64.9% | 69.1% | 57.7% |
| StepCode-Bench-General† | 65.0% | 62.0% | 65.2% |
| 通用 Agent |  |  |  |

https://www.stepfun.com/step-5-preview

> **看表:** 页 19 Terminal-Bench v4 一行 Step 5 Preview 33.3%, GLM-5.3(Max) 41.9%, 第三列 12.6%. 这与页 2–4 「前沿 / 有竞争力」 口号该怎么同时读?
> 应分榜读. 同表 DeepSWE v1.1 67.7%, Terminal-Bench v2.1 85.0%, ProgramBench 80.5%, StepCodeBench† 49.0% 等格 Step 5 并不全面落后; v4 这一格明确低于 GLM-5.3(Max). 「前沿」 是页 2 产品总述, 不是 「每一格全胜」 的表内定理. 第三列表头 OCR 截成 `Kim (Ma`, 全文未改正为完整型号.

<!-- page 20 of 20 -->

<table><tbody><tr><td>GDPval-AA v2.1</td><td>1566</td><td>1645</td><td>1524</td></tr><tr><td>τ³-Banking</td><td>42.5%</td><td>50.3%</td><td>46.0%</td></tr><tr><td>AutomationBench-AA</td><td>51.0%</td><td>62.2%</td><td>58.3%</td></tr><tr><td rowspan="2">AutomationBench (public)</td><td rowspan="2">44.0%</td><td>48.2%</td><td rowspan="2">46.7%</td></tr><tr><td></td></tr><tr><td>AA-Briefcase v1.1</td><td>1433</td><td>1526</td><td>1511</td></tr><tr><td>Toolathlon-Verified</td><td>74.1%</td><td>73.0%</td><td>76.5%</td></tr><tr><td rowspan="2">MCP-Atlas</td><td rowspan="2">85.6%</td><td>86.8%</td><td rowspan="2">85.3%</td></tr><tr><td></td></tr><tr><td>PresentBench</td><td>76.8%</td><td>74.5%</td><td>75.6%</td></tr></tbody></table>

https://www.stepfun.com/step-5-preview

> **问:** 页 20 Agent 表在 GDPval-AA / AutomationBench / AA-Briefcase 等多格 Step 5 低于 GLM-5.3(Max). 页 4 Intelligence Index 44 与这些分项是什么关系?
> 页内没有给出 Index 的加权公式, 也没有声明 44 由页 18–20 哪几行合成. Index 44 与分项表应分开引用: 前者是 Artificial Analysis 综合口号, 后者是页内转录的分基准数字. 不要用分项表反推未写出的 Index 权重.
