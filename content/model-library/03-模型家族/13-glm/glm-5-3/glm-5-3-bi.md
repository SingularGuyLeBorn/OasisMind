<!-- page 1 of 12 -->

2026-08-14 · Research

2026 年 8 月 14 日, 栏目: Research (研究).

# GLM-5.3: Frontier Coding with Emergent Cyber Capabilities

GLM-5.3: 前沿编程能力, 以及涌现出来的网络安全能力 (正标题. 标题里是复数 Capabilities, 第 5 页小节标题是单数 Capability.)

![Image block](images/p01-image.png)

(图: 黑色圆角方块里一个白色 「Z」 字标, 是 Z.ai 的小图标. PDF 第 1 页链接行里 「Call it at Z.ai」, 「Z.ai Coding Plan」, 「Code with ZCode」 三个链接前各有一个, 样子相同. 没有别的文字, 没有数据.)

![Image block](images/p01-call-it-at-z-ai-https-docs-z-ai-guides-llm-glm-5-3-z-ai.png)

(图: 一个黄色笑脸, 两只手张开, 是 HuggingFace 的图标. PDF 里它在链接第二行 「HuggingFace」 前面. 文件名取自链接行的文字, 画面和 Z.ai 没有关系.)

[Call it at Z.ai](https://docs.z.ai/guides/llm/glm-5.3) [Z.ai Coding Plan](https://z.ai/subscribe?utm_source=blog&utm_medium=content&utm_campaign=glm5_launch) [Code with ZCode](https://zcode.z.ai/) S [HuggingFace](https://huggingface.co/zai-org/GLM-5.3)

四个链接: [在 Z.ai 上调用](https://docs.z.ai/guides/llm/glm-5.3) (API 文档), [Z.ai 编程套餐](https://z.ai/subscribe?utm_source=blog&utm_medium=content&utm_campaign=glm5_launch) (订阅页), [用 ZCode 写代码](https://zcode.z.ai/), [HuggingFace](https://huggingface.co/zai-org/GLM-5.3) (模型页). 「S」 是 HuggingFace 图标被识别成的字符, PDF 文字层里没有它.

**Scaling post-training is all we did for GLM-5.3.** With GLM-5.2 we built the stack: [IndexShare](https://arxiv.org/abs/2603.12201) for efficient long-context processing, [SAO](https://arxiv.org/abs/2607.07508) for RL on long-horizon tasks, and [slime](https://github.com/THUDM/slime) for large-scale asynchronous training — all running on the long-horizon task environments we have been accumulating. Over the past month we kept scaling on this stack: more environments, more diverse tasks, and more compute spent training on them.

**GLM-5.3 这一版, 我们做的只有一件事: 把后训练继续做大.** 在 GLM-5.2 上我们搭好了这套技术栈: [IndexShare](https://arxiv.org/abs/2603.12201) 用来高效处理长上下文, [SAO](https://arxiv.org/abs/2607.07508) 用来在长程任务上做强化学习, [slime](https://github.com/THUDM/slime) 用来做大规模异步训练, 它们都跑在我们一直在积累的长程任务环境上. 过去一个月, 我们在这套栈上继续加码: 环境更多, 任务更多样, 花在这些任务上的训练算力也更多.

> **拆开:** 「Scaling post-training」 到底指什么? 「Over the past month」 是多长时间?
> 按这段原话, 它指的是发布前在后训练阶段多投入, 冒号后面列了三项: 更多环境, 更多样的任务, 更多训练算力. 这是训练侧的投入, 和推理时让模型多想几步不是一回事; 全篇也没有给出 「投入多少算力换多少分」 的曲线或公式, 所以它是一句做法描述, 不是一条可以外推的规律. 时间上, 同家族 `glm-5-2/glm-5-2.md` 的日期是 2026-06-16, 本篇是 2026-08-14, 相隔 59 天, 接近两个月. 博客没说 「past month」 从哪天算起, 也可能 GLM-5.2 发布后先做了别的事, 这里只记下两个日期.

Today we are releasing GLM-5.3. It uses the same base model as GLM-5.2 — every gain comes from post-training. Compared with GLM-5.2, it is much better at complex coding and long-horizon tasks:

今天我们发布 GLM-5.3. 它和 GLM-5.2 用的是同一个基座模型, 所有提升都来自后训练. 和 GLM-5.2 相比, 它在复杂编程和长程任务上强很多:

> **想:** 「the same base model as GLM-5.2」, 这个基座的总参数是多少? 激活参数又是多少?
> 这两个数这篇都没给. 总参数: 12 页里找不到一个参数数字. 激活参数: 同样没有. 翻回同家族的 GLM-5.2 博客, 它讲了 IndexShare, MTP 层和 1M 上下文, 也没有总参数, 没有激活参数. 同家族别的材料里倒有几个数, 但都属于别的对象: `glm-5` 目录的论文给 GLM-5 的是 744B 总参数和 40B 激活参数; `glm-5-1` 目录的 Hugging Face 页面信息栏显示 754B, 那是页面平台读出的数. 本篇只说 「same base model」, 没说这个基座和 GLM-5 或 GLM-5.1 是什么关系, 所以这几个数都不能挪来当 GLM-5.3 的总参数或激活参数. 能照抄的只有一句: GLM-5.3 和 GLM-5.2 共用一个基座, 差别全部来自后训练.

**Stronger Coding:** GLM-5.3 is the most capable open-weights model for coding, with a 50% improvement over GLM-5.2 on our in-house Z.ai Code Bench. It also achieve open-source SOTA on public benchmarks including Terminal Bench 3.0 and Agents' Last Exam.

**更强的编程:** GLM-5.3 是编程能力最强的开放权重模型, 在我们内部的 Z.ai Code Bench 上比 GLM-5.2 提升 50%. 它还在 Terminal Bench 3.0 和 Agents' Last Exam 等公开基准上拿到开源最佳. (原句 「It also achieve」 少了 s, 照录.)

> **核对:** 「50% improvement」 是在哪个 effort 档位上算的? 是百分点还是比例?
> 博客没说. 第 5 页正文给了 Max 档的两组数: GLM-5.3 34.5%, GLM-5.2 23.4%, 相差 11.1 个百分点; 按比例算 34.5/23.4 约 1.474, 高 47.4%, 说成 「50%」 是往上取整. High 档正文只给了 GLM-5.3 的 31.4%, GLM-5.2 的 High 点在图上目测约 20.9%, 这样算 31.4/20.9 约 1.50, 正好 50%. 所以 「50%」 是相对提升, 可能取自 High 档, 也可能是几档合起来的某种算法, 这是按图反推的, 原文没交代. Z.ai Code Bench 是内部私有基准, 外部没法复现, 这个数只能当作厂商自报.

**Emergent Cyber Capability:** As we scaled post-training, cyber capability developed faster than we expected. GLM-5.3 is state of the art on CyberGym for vulnerability discovery, and its gains are largest further up the exploitation chain, where it more than doubles GLM-5.2 on exploitation benchmarks.

**网络安全能力的涌现:** 这一条里的基准和分数说法是: GLM-5.3 在 CyberGym 上是当前最佳; 在 exploitation 类基准上, 分数是 GLM-5.2 的两倍以上. (其余讲能力怎样形成的话不译, 网络安全部分中文只留基准名和分数.)

**Open Source:** We will release the weights in two weeks after launch, once safety evaluation and hardening are complete.

**开源:** 发布两周后, 等安全评估和加固完成, 我们会放出权重.

<!-- page 2 of 12 -->

![Chart block](images/p02-llm-performance-evaluation.png)

(图: 竖向柱状图, 五根柱, 底部标签 「Terminal Bench 3.0」. 从左到右: 蓝柱带 Z 字标, 28.3, 数字加粗; 绿柱 4.6, 柱身太矮, 没放图标; 灰柱带 K 图标, 17.4; 浅灰柱带 Anthropic 的 「A\」 标, 33.7; 最浅的柱带 OpenAI 标, 34.6. 按 PDF 这组图的图例, 五种颜色依次是 GLM-5.3, GLM-5.2, Kimi K3, Fable 5, GPT-5.6 Sol. 文件名取自下面那行小标题, 画面只是六张小图里的第一张.)

**LLM Performance Evaluation**

**大模型性能评测** (源文 md 是二级标题, 这里改成加粗行. PDF 里它是整组图的标题, 下面还有一行副标题 「6 benchmarks: Terminal Bench 3.0, DeepSWE, Agents' Last Exam (CLI), AutomationBench, HLE w/ Tools, GDPVal-AA v2」 和一行图例, md 都没抓到.)

![Chart block](images/p02-chart.png)

(图: 同样五根柱, 标签 「DeepSWE」: GLM-5.3 66.9 (加粗), GLM-5.2 46.2, Kimi K3 67.5, Fable 5 69.7, GPT-5.6 Sol 72.7.)

![Chart block](images/p02-performance-across-comparison-models.png)

(图: 同样五根柱, 标签 「HLE w/ Tools」: GLM-5.3 62.5 (加粗), GLM-5.2 54.7, Kimi K3 59.8, Fable 5 63.9, GPT-5.6 Sol 64.5. 文件名取自下面的表标题.)

> **回看:** PDF 第 2 页这组图一共几张? md 抓到了几张?
> PDF 里是三列两行共六张小图, 副标题也列了六个基准; md 只切出三张: Terminal Bench 3.0, DeepSWE, HLE w/ Tools. 漏掉的三张在 PDF 上的数是: Agents' Last Exam, GLM-5.3 28.5, GLM-5.2 23.8, Kimi K3 27.6, Fable 5 23.8, GPT-5.6 Sol 28.6; AutomationBench, 48.2, 26.2, 46.7, 46.2, 45.8; GDPVal-AA v2, 1769, 1508, 1682, 1743, 1730. 这组图的第五家 GPT-5.6 Sol 不在下面的大表里, 它的六个数只能在图上查. Agents' Last Exam 这一格, GPT-5.6 Sol 的 28.6 比 GLM-5.3 的 28.5 高 0.1, 第 1 页说的是 「open-source SOTA」, 不是全场最高, 和图不矛盾.

**Performance across comparison models**

**与对比模型的性能比较** (源文 md 是二级标题.)

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable (w/ fallb |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CODING |  |  |  |  |  |  |  |
| Terminal Bench 2.1 | 88.2 | 81.0 | 88.3 | 87.9 | 86.6 | 85.0 | 88.0 |
| Terminal Bench 3.0 | 28.3 | 4.6 | 17.4 | - | - | 21.1 | 33.7 |
| DeepSWE | 66.9 | 46.2 | 67.5 | 62.7 | 56.6 | 58.0 | 69.7 |
| v1.1 |  |  |  |  |  |  |  |
| NL2Repo | 58.0 | 48.9 | 58.0 | 61.1 | 55.9 | 69.7 | - |
| ProgramBench | 19.0 | 9.5 | 17.5 | - | 10.5 | 15.5 | 33.0 |
| Almost Solved |  |  |  |  |  |  |  |
| FrontierSWE | 78.1 | 67.5 | - | - | - | 66.5 | 88.2 |
| SWE-Marathon | 42.5 | 19.4 | 48.1 | - | - | 48.8 | 33.1 |
| v1.1 |  |  |  |  |  |  |  |
| PostTrainBench | 39.8 | 31.7 | 32.0 | - | - | 32.9 | 41.8 |
| CYBER |  |  |  |  |  |  |  |

中文整理 (md 把表头 「DeepSeek-V4 / Pro-0813」 并成了一格, 把行名下的小字 「v1.1」, 「Almost Solved」 拆成了单独一行; 下表按 PDF 合并. 最右一列在页面右边缘被切断, 表头只露出 「Fable (w/ fallb」. PDF 里 GLM-5.3 整列是蓝底蓝字; 其余列加粗的格子照 PDF 标出, md 没保留粗体):

| 基准 | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable (w/ fallb..., 截断) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 编程 |  |  |  |  |  |  |  |
| Terminal Bench 2.1 | 88.2 | 81.0 | 88.3 | 87.9 | 86.6 | 85.0 | 88.0 |
| Terminal Bench 3.0 | 28.3 | 4.6 | 17.4 | - | - | 21.1 | 33.7 |
| DeepSWE v1.1 | 66.9 | 46.2 | 67.5 | 62.7 | 56.6 | 58.0 | 69.7 |
| NL2Repo | 58.0 | 48.9 | 58.0 | 61.1 | 55.9 | 69.7 | - |
| ProgramBench (Almost Solved) | 19.0 | 9.5 | 17.5 | - | 10.5 | 15.5 | 33.0 |
| FrontierSWE | 78.1 | 67.5 | - | - | - | 66.5 | 88.2 |
| SWE-Marathon v1.1 | 42.5 | 19.4 | 48.1 | - | - | 48.8 | 33.1 |
| PostTrainBench | 39.8 | 31.7 | 32.0 | - | - | 32.9 | 41.8 |
| 网络安全 |  |  |  |  |  |  |  |

> **看表:** GLM-5.2 这一列, 和 GLM-5.3 是同一口径跑出来的吗?
> 至少有四格看起来是从 GLM-5.2 博客原样搬来的, 而两篇的评测设置不一样. Terminal Bench 2.1: GLM-5.2 博客的 81.0 标的是 Terminus-2 框架, 它用 Claude Code 跑的是 82.7; 本篇脚注说 Terminal-Bench 2.1 在 Claude Code 2.1.207 里评. 如果 88.2 是 Claude Code 分, 81.0 是 Terminus-2 分, 这一行的 7.2 分差就混了两个框架. DeepSWE: 46.2 和 GLM-5.2 博客相同, 那边写的是 temperature=1.0, 超时 2 小时; 本篇脚注是 temperature=0.95, 超时 6 小时, 行名还多了 「v1.1」. NL2Repo: 48.9 相同, 那边是 max_new_tokens=48k, 400k 上下文; 本篇是 64k, 1M 上下文. HLE w/ Tools (第 3 页那一行): 54.7 相同, 那边明写 「no context management strategy」, 裁判模型 GPT-5.5 (medium); 本篇是 「using a context management strategy」, 裁判 GPT-5.6-luna (medium). 分数一样而设置不同, 可能是 GLM-5.2 没有按新设置重跑, 博客没说. 所以正文里 「46.2 到 66.9」 这类提升, 有一部分可能来自评测设置的变化, 不能全记在后训练头上.

> **对一下:** 另外几行, GLM-5.2 的数和它自己博客对不上, 差在哪?
> 有四行. ProgramBench: GLM-5.2 博客印 63.7, 这里是 9.5; 这里的行名下有小字 「Almost Solved」, 是另一个指标, 两个数不能放在一起比, 本篇也没有 ProgramBench 的脚注. FrontierSWE: 那边 74.4, 标 「Dominance as of 26/6/16」; 这里 67.5, 脚注写 「Dominance score reported as of 2026/08/14」. 同一个模型两个日期两个数, 说明这个分数随参评模型池变化, 是相对分. PostTrainBench: 那边 34.3, 由 PostTrainBench 官方评; 这里 31.7, 本篇脚注写的是自己用 Claude Code 2.1.207 跑, 取 3 次加权平均, 还换掉了防第三方 API 的检查. SWE-Marathon: 那边 13.0, 由 Abundant AI 评; 这里 19.4, 行名带 「v1.1」, 本篇自己跑, 也改了检查项. 这四行看样子是按新版本或新设置重新取的数, 和上面那四格正好相反. 同一列里有的格重测, 有的格照搬, 表上没有任何标记.

<!-- page 3 of 12 -->

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable (w/ fallb |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CyberGym | 84.5 | 77.2 | 80.0 | 83.3 | 78.5 | 78.1 | 83.8 |
| ExploitGym | 105 / | 29 / 39 | 36 / 70 | - | 14 / 26 | 80 / 120 | 181 / 2 |
| 2h /6h | 130 |  |  |  |  |  |  |
| ExploitBench | 54.4 | 24.4 | 32.2 | - | 28.8 | 40.0 | 78.0 |
| AGENTIC |  |  |  |  |  |  |  |
| Toolathlon Verified | 73.0 | 59.9 | 76.5 | 74.1 | 72.5 | 76.2 | 74.7 |
| AutomationBench | 48.2 | 26.2 | 46.7 | 43.2 | 39.8 | 41.0 | 46.2 |
| v1.0.6 |  |  |  |  |  |  |  |
| Agents' Last Exam | 28.5 | 23.8 | 27.6 | 25.7 | 27.0 | 25.7 | 23.8 |
| ALE-CLI |  |  |  |  |  |  |  |
| HLE w/ Tools | 62.5 | 54.7 | 59.8 | 60.0 | 56.2 | 57.9 | 63.9 |
| GDPval-AA v2 | 1769 | 1508 | 1682 | 1590 | 1739 | 1588 | 174 |

中文整理 (表头在 PDF 第 3 页重复了一次; 合并跨行单元格, 加粗照 PDF. GDPval-AA v2 最右一格 md 抓成 「174」, PDF 文字层是 1743):

| 基准 | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable (w/ fallb..., 截断) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CyberGym | 84.5 | 77.2 | 80.0 | 83.3 | 78.5 | 78.1 | 83.8 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | - | 14 / 26 | 80 / 120 | 181 / 2 (截断) |
| ExploitBench | 54.4 | 24.4 | 32.2 | - | 28.8 | 40.0 | 78.0 |
| 智能体 |  |  |  |  |  |  |  |
| Toolathlon Verified | 73.0 | 59.9 | 76.5 | 74.1 | 72.5 | 76.2 | 74.7 |
| AutomationBench v1.0.6 | 48.2 | 26.2 | 46.7 | 43.2 | 39.8 | 41.0 | 46.2 |
| Agents' Last Exam (ALE-CLI) | 28.5 | 23.8 | 27.6 | 25.7 | 27.0 | 25.7 | 23.8 |
| HLE w/ Tools | 62.5 | 54.7 | 59.8 | 60.0 | 56.2 | 57.9 | 63.9 |
| GDPval-AA v2 | 1769 | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 |

> **停一下:** 最右一列到底是哪个模型? 「181 / 2」 和 「174」 是完整的数吗?
> 表头被切断, 只露出 「Fable (w/ fallb」, 括号里写的是什么看不全. 同一个 Anthropic 标志在三处有三种叫法: 第 2 页图例叫 「Fable 5」, 第 5 页正文和图例叫 「Claude Fable 5」, 第 6 页图例和正文叫 「Mythos 5」. 数字却对得上: 第 6 页正文给 Mythos 5 的是 CyberGym 83.8%, ExploitBench 78.0%, ExploitGym 181 和 247, 表里这一列正好是 83.8, 78.0, 「181 / 2」. 所以 「181 / 2」 是 「181 / 247」 被切掉了后两位, 第 6 页的图上也印着 181 和 247. GDPval-AA v2 这一格, md 抓成 「174」, PDF 文字层是 1743, 第 2 页图上 Fable 5 也是 1743. Fable 5 和 Mythos 5 是同一个模型的两个名字, 还是两个模型刚好同分, 博客没交代; 这里各处照原文的叫法抄, 不替它合并.

> **问:** 「most capable open-weights model for coding」 和 「open-source SOTA」, 这张表撑得住吗?
> 表上没有标哪些模型开放权重, 「开源最佳」 只能按博客自己的划分去读. 就编程和智能体这几行看, GLM-5.3 并不是每行都高过 Kimi K3, DeepSeek-V4 Pro-0813, Qwen3.8-Max 三列: Terminal Bench 2.1 Kimi K3 88.3 比 88.2 高 0.1; DeepSWE Kimi K3 67.5 比 66.9 高; NL2Repo DeepSeek-V4 Pro-0813 61.1 比 58.0 高; SWE-Marathon Kimi K3 48.1 比 42.5 高; Toolathlon Verified Kimi K3 76.5 和 DeepSeek 74.1 都比 73.0 高. 第 1 页点名的两行里, Terminal Bench 3.0 的 28.3 是除最右列 33.7 以外的最高; Agents' Last Exam 的 28.5 是全表最高. 「编程能力最强的开放权重模型」 这句, 依据是内部的 Z.ai Code Bench, 可第 5 页那张图只比了 GLM-5.2, Claude Fable 5 和 Claude Opus 4.8, 没有别的开放权重模型; 而且发文当天 GLM-5.3 自己的权重还没放出.

**Stronger Coding**

**更强的编程** (源文 md 是二级标题.)

For GLM-5.3, we pushed environment scaling toward tasks that look less like coding exercises and more like real units of expert work. The environments now cover a much broader range of production workflows, with tasks designed around how engineering and research work is actually carried out in practice. Some represent several days of work for an experienced engineer. In an ML infrastructure task, for example, the model may be given the same working environment as an engineer, with access to compute clusters, storage systems, internal documentation, codebases, and experiment results. It must diagnose bottlenecks across the training stack, implement optimizations, run experiments, and deliver a measurable end-to-end speedup while preserving correctness. Training on environments at this level pushes the model toward taking ownership of substantial work end to end, rather than relying on users to decompose the problem and supervise each step.

为了 GLM-5.3, 我们把环境的扩充往一个方向推: 任务不太像编程练习, 更像专家工作里真实的一个单元. 现在的环境覆盖的生产工作流宽得多, 任务按工程和研究工作在实践中的实际做法来设计. 有些任务相当于一位资深工程师好几天的工作量. 比如在一个机器学习基础设施任务里, 模型拿到的工作环境和工程师一样, 能访问计算集群, 存储系统, 内部文档, 代码库和实验结果. 它必须诊断整条训练栈上的瓶颈, 实现优化, 跑实验, 在保证正确性的前提下交付可度量的端到端加速. 在这种级别的环境上训练, 会推着模型自己把一大块工作从头做到尾, 不再靠用户拆解问题, 盯着每一步.

As agent capability improves, much of the difficulty in scaling post-training moves from the model to the environment. A useful task environment has to be executable, verifiable, and close to real professional work — and we need many of them, not a handful of hand-built ones. To scale this

随着智能体能力提升, 把后训练做大的难处, 很大一部分从模型转到了环境上. 一个有用的任务环境必须能执行, 能验证, 贴近真实的专业工作, 而且要很多个, 不是几个手工搭的. 为了把这个

<!-- page 4 of 12 -->

process, we built pipelines that synthesize environments end to end, and for a subset of tasks, the RL reward signal as well. Research agents collect task patterns from real work and turn them into runnable long-horizon environments with multi-step dependencies and hidden state; a judge agent then attempts each task to verify that it is actually solvable. Verifiers are synthesized without access to the reference solution, while solver trajectories are used to discover and close reward shortcuts. A verifier that passes oracle, no-op, and unsolved-state checks produces a binary reward reliable enough to train on directly.

过程做大, 我们搭了端到端合成环境的流水线, 对其中一部分任务, 连强化学习的奖励信号也一起合成. 研究型智能体从真实工作里收集任务模式, 把它们变成可运行的长程环境, 带多步依赖和隐藏状态; 然后由一个评判智能体逐个去做这些任务, 验证它们确实可解. 验证器在看不到参考解的情况下合成, 求解轨迹则用来发现并堵上奖励捷径. 一个验证器如果通过了 oracle, no-op 和未解状态三种检查, 它给出的二值奖励就足够可靠, 可以直接拿来训练.

It carries over the RL strategies introduced in GLM-5.2, including SAO with compaction, which helps these gains hold on long-horizon tasks rather than only on short ones. The effect shows up across both coding and general agent tasks. GLM-5.3 improves from 4.6 to 28.3 on Terminal-Bench 3.0, from 46.2 to 66.9 on DeepSWE v1.1, and from 23.8 to 28.5 on Agents' Last Exam. These pipelines still require a meaningful amount of human-in-the-loop work; making environment generation and verification more autonomous is one of the next steps.

它沿用了 GLM-5.2 引入的强化学习策略, 包括带 compaction (上下文压缩) 的 SAO, 这让提升在长程任务上也站得住, 不只出现在短任务上. 效果在编程和通用智能体任务上都看得到. GLM-5.3 在 Terminal-Bench 3.0 上从 4.6 提到 28.3, 在 DeepSWE v1.1 上从 46.2 提到 66.9, 在 Agents' Last Exam 上从 23.8 提到 28.5. 这些流水线仍然要相当多的人工参与; 让环境生成和验证更自动, 是接下来要做的事之一.

> **再看:** 「RL strategies introduced in GLM-5.2, including SAO with compaction」, GLM-5.2 博客里有 SAO 这个名字吗?
> 没有. GLM-5.2 博客全文找不到 「SAO」. 它在第 8 页讲长程任务的强化学习, 说把按组优化换成基于 critic 的 PPO, 从单条 rollout 学习, 把 compaction 切出来的所有子轨迹都当作可训练轨迹, 再用 token 级损失处理长度不均. 本篇第 1 页给 SAO 挂的是 arXiv 2607.07508, 编号前四位是 2026 年 7 月, 在 GLM-5.2 博客 (2026-06-16) 之后. SAO 是不是就是 GLM-5.2 博客里那套 critic PPO 加 compaction, 两篇都没明说; 本篇也没解释 SAO 三个字母代表什么. 这里只照抄 「SAO with compaction」, 不把两者画等号.

Beyond public benchmarks, we introduce Z.ai Code Bench, an in-house benchmark designed to evaluate coding agents under realistic user scenarios. It covers diverse task categories and places agents in complex local development environments. At different effort levels, we evaluate agents along two dimensions: end-to-end task completion rate and fine-grained checklist accuracy. As a private benchmark, Z.ai Code Bench also reduces the risk of contamination from public test sets and gives us a more faithful measure of real-world user experience.

在公开基准之外, 我们推出 Z.ai Code Bench, 一个内部基准, 用来在贴近真实用户的场景下评测编程智能体. 它覆盖多种任务类别, 把智能体放进复杂的本地开发环境. 在不同 effort 档位下, 我们从两个维度评估智能体: 端到端任务完成率, 以及细粒度检查清单的准确率. 作为私有基准, Z.ai Code Bench 还降低了公开测试集污染的风险, 能更忠实地衡量真实用户体验.

<!-- page 5 of 12 -->

**Agentic Coding Performance by Effort Level**

**按 effort 档位看智能体编程表现** (源文 md 是二级标题; PDF 里它是下面那张图的标题.)

Z

(Z 字标被识别成的字符. PDF 里它在图标题的右边.)

Z.ai Code Bench v1.0, evaluated on Claude Code 2.1.207

Z.ai Code Bench v1.0, 在 Claude Code 2.1.207 上评测 (图的副标题).

![Chart block](images/p05-as-shown-in-the-figure-glm-5-3-improves-both.png)

(图: 折线散点图. 纵轴 「Accuracy (%)」, 刻度 20.0 到 40.0, 底部有截断符号; 横轴 「Output Tokens (Avg Per Task)」, 刻度 40K 到 120K. 四条线: GLM-5.3 蓝, GLM-5.2 绿, Claude Fable 5 深灰, Claude Opus 4.8 浅灰, 每个点旁标档位名. 目测读数: GLM-5.3 Low 约 24.6% / 49K, High 约 31.4% / 50K, Max 约 34.5% / 75K; GLM-5.2 Non-Thinking 约 19.4% / 44K, High 约 20.9% / 49K, Max 约 23.4% / 96K; Claude Fable 5 Low 约 28.8% / 32K, High 约 35.6% / 57K, Max 约 39.5% / 115K; Claude Opus 4.8 Low 约 21.1% / 31K, High 约 23.4% / 51K, Max 约 29.5% / 120K. 图上只标档位不标数, 除正文给出的几个数以外都是目测. 文件名取自下面那段正文的开头.)

As shown in the figure, GLM-5.3 improves both performance and token efficiency. It delivers markedly stronger agentic coding results than GLM-5.2 at every effort level while consuming fewer output tokens. At Max effort, GLM-5.3 reaches 34.5% at roughly 75K output tokens per task, compared with 23.4% at 96K for GLM-5.2. The same shift holds against closed models. At High effort, GLM-5.3 reaches 31.4% at around 50K output tokens, surpassing Claude Opus 4.8 at 29.5% with 120K. GLM-5.3 remains behind Claude Fable 5, which reaches 39.5% at Max effort.

如图所示, GLM-5.3 的表现和 token 效率都提高了. 在每个 effort 档位上, 它的智能体编程结果都明显强于 GLM-5.2, 同时消耗的输出 token 更少. Max 档下, GLM-5.3 每个任务约用 75K 输出 token, 达到 34.5%; GLM-5.2 是 96K, 23.4%. 和闭源模型比也是同样的变化. High 档下, GLM-5.3 约用 50K 输出 token, 达到 31.4%, 超过 Claude Opus 4.8 用 120K 达到的 29.5%. GLM-5.3 仍落后于 Claude Fable 5, 后者在 Max 档达到 39.5%.

> **确认:** 「at every effort level while consuming fewer output tokens」 和 「surpassing Claude Opus 4.8 at 29.5% with 120K」, 图上对得上吗?
> 分数这一半对得上, token 这一半只在 Max 档明确成立. GLM-5.2 的三个点是 Non-Thinking, High, Max, 没有 Low; GLM-5.3 是 Low, High, Max. 按档位配对: Max 档 75K 对 96K, GLM-5.3 确实更省; High 档约 50K 对约 49K, 基本持平, 目测 GLM-5.3 还略多一点; 如果拿 GLM-5.3 的 Low (约 49K) 和 GLM-5.2 的 Non-Thinking (约 44K) 比, 是 GLM-5.3 用得多. Opus 4.8 那边, 29.5% 和 120K 是它 Max 档的点, 正文拿它和 GLM-5.3 的 High 档比; 同档比的话, Opus 4.8 High 约 23.4%. 还有一处: 第 4 页说这个基准按 「端到端完成率」 和 「细粒度检查清单准确率」 两个维度评, 这张图的纵轴只写 「Accuracy (%)」, 没说是其中哪一个.

**Emergent Cyber Capability**

**网络安全能力的涌现** (源文 md 是二级标题.)

As part of post-training, we introduced vulnerability discovery data and environments into the training mix. We expected this to make the model better at finding and reasoning about vulnerabilities. What surprised us was how quickly the capability continued to develop as training scaled. GLM-5.3 did not simply become better at identifying isolated flaws: it began to reason across multiple stages of exploitation, forming coherent plans for complete exploitation chains.

(这一段讲后训练里加了什么数据和环境, 以及能力怎样变化, 没有基准名, 也没有分数. 网络安全部分中文只留基准名和分数, 这段不译.)

<!-- page 6 of 12 -->

![Chart block](images/p06-z.png)

(图: 竖向柱状图, 标签 「ExploitBench」: 蓝柱 GLM-5.3 54.4 (加粗), 绿柱 GLM-5.2 24.4, 灰柱 Kimi K3 32.2, 带 Anthropic 标的 Mythos 5 78.0, 带 OpenAI 标的 GPT-5.6 Sol 76.5. 文件名 `p06-z.png` 取自下面那个 「Z」 字符. PDF 里三张小图从左到右是 CyberGym, ExploitBench, ExploitGym, md 的顺序和它不同.)

Z

(Z 字标被识别成的字符.)

CyberSecurity Evaluation

网络安全评测 (图组标题. PDF 里标题下的图例依次是 GLM-5.3, GLM-5.2, Kimi K3, Mythos 5, GPT-5.6 Sol.)

![Chart block](images/p06-chart.png)

(图: 同样五根柱, 标签 「CyberGym」: GLM-5.3 84.5 (加粗), GLM-5.2 77.2, Kimi K3 80.0, Mythos 5 83.8, GPT-5.6 Sol 83.6.)

![Chart block](images/p06-we-evaluate-glm-5-3-across-three-benchmarks-covering.png)

(图: 堆叠柱状图, 标签 「ExploitGym」, 图例 「2-hour budget」 (浅色段) 和 「6-hour budget」 (整根柱顶). 四根柱: GLM-5.3 105 / 130, GLM-5.2 29 / 39, Kimi K3 36 / 70, Mythos 5 181 / 247. 这张图没有 GPT-5.6 Sol. 文件名取自下面那段正文的开头.)

We evaluate GLM-5.3 across three benchmarks covering different stages of vulnerability analysis and exploitation. On CyberGym, which starts from white-box source code and tests whether the model can identify and validate vulnerabilities by triggering faults, GLM-5.3 scores 84.5%, up from GLM-5.2's 77.2% — the best result on the benchmark, ahead of Mythos 5 (83.8%) and GPT-5.6 Sol (83.6%). On ExploitBench, which requires deeper reasoning about real vulnerabilities and their exploitation, GLM-5.3 reaches 54.4%, more than doubling GLM-5.2's 24.4%, while Mythos 5 and GPT-5.6 Sol score 78.0% and 76.5%, respectively. On ExploitGym, which measures how many exploitation tasks a model can complete under time-normalized budgets, GLM-5.3 completes 105 tasks within two hours and 130 within six hours, compared with 29 and 39 for GLM-5.2; budgets are normalized across models using per-model throughput figures, detailed in the footnotes. Mythos 5 remains well ahead at 181 and 247 tasks. The pattern across the three is consistent: the further up the exploitation chain a benchmark sits, the larger the gain from GLM-5.2 — and also the wider the remaining gap to the closed frontier. Capability is growing fastest exactly where we are furthest behind.

三个基准的名称和分数: CyberGym, GLM-5.3 84.5%, GLM-5.2 77.2%, Mythos 5 83.8%, GPT-5.6 Sol 83.6%, 原文称 84.5% 是这个基准上的最好成绩. ExploitBench, GLM-5.3 54.4%, GLM-5.2 24.4%, Mythos 5 78.0%, GPT-5.6 Sol 76.5%. ExploitGym, 2 小时和 6 小时预算下完成的任务数: GLM-5.3 105 和 130, GLM-5.2 29 和 39, Mythos 5 181 和 247; 各模型的预算按吞吐量折算, 见脚注. 原文的总结是: 三个基准里越靠后段的, 相对 GLM-5.2 的提升越大, 离闭源前沿的差距也越大. (各基准具体考什么, 这里不转写.)

> **核对:** 网络安全这三行, 博客交代了什么, 没交代什么? 「more than doubles」 算得出来吗?
> 交代了基准名, 分数和评分口径, 没交代训练里具体用了哪些数据和环境, 也没有分项的能力拆解; 这部分本目录也只记分数. 倍数可以核: ExploitBench 54.4/24.4 约 2.23 倍; ExploitGym 2 小时 105/29 约 3.62 倍, 6 小时 130/39 约 3.33 倍; CyberGym 只高 7.3 分, 没有翻倍, 所以第 1 页把 「两倍以上」 限定在 exploitation 类基准上. 口径上有一处缺口: ExploitGym 脚注说预算按每个模型的 TPS 折算, 但只列了 GLM-5.3 115, Kimi K3 40, Qwen3.8 Max 47 三家, 脚注开头也只说评测了这三家. GLM-5.2 的 29 / 39, Opus 4.8 的 80 / 120, 最右列的 181 / 247 是谁跑的, 按多少 TPS 折算, 都没写, 这几格和 GLM-5.3 是否同口径, 博客回答不了. CyberGym 的 「best result」 也只是相对这张表和图里列出的几家.

A following section describes tests on real codebases and a public disclosure ledger at [Z.ai Security Disclosure Ledger](https://cvd.z.ai/). Case narratives and ledger counts are not transcribed.

后面有一节写在真实代码库上的测试, 并给出公开台账 [Z.ai Security Disclosure Ledger](https://cvd.z.ai/). 案例经过和台账计数不转写.

<!-- page 7 of 12 -->

SEVERITY DISTRIBUTION

严重程度分布 (下面那张图的小标题.)

![Chart block](images/p07-view-z-ai-security-disclosure-ledger-https-cvd-z-ai.png)

(图: 上方是四种严重程度的图例, 各带一个计数; 下方小标题 「WHEN THE FLAWS WERE INTRODUCED」, 是按引入年份分组的柱状图, 柱子从青绿渐变到红色, 横轴两端印着起止年份. 这是案例统计, 不是基准分数, 数字不转写. PDF 里图例上方还有一条按比例分段的彩色横条, md 的图只截到它的底边. 文件名取自下面的链接文字.)

View [Z.ai Security Disclosure Ledger ↗](https://cvd.z.ai/)

查看 [Z.ai 安全披露台账](https://cvd.z.ai/).

**[slime](https://github.com/THUDM/slime): Built for Long-Horizon RL Scaling**

**[slime](https://github.com/THUDM/slime): 为把长程强化学习做大而建** (源文 md 是二级标题.)

All of this runs on slime, our open-source post-training framework for RL scaling, with Megatron on the training side and SGLang on the rollout side. Its design keeps training, rollout, and the data buffer on a single dataflow, so math, code, sandboxes, verifiers, and long-horizon agentic environments plug in as data generation rather than as changes to the training loop. That is what let us keep adding environments through GLM-5.2 and GLM-5.3 without rebuilding the training stack each time.

这一切都跑在 slime 上. 它是我们开源的后训练框架, 面向大规模强化学习, 训练侧用 Megatron, rollout 侧用 SGLang. 它的设计让训练, rollout 和数据缓冲区走同一条数据流, 所以数学, 代码, 沙箱, 验证器和长程智能体环境都以 「数据生成」 的形式接进来, 不用改训练循环. 正因为这样, 从 GLM-5.2 到 GLM-5.3 我们能一直往里加环境, 不必每次重搭训练栈.

<!-- page 8 of 12 -->

Through GLM-5.3 we kept building it out on two fronts. On the algorithmic side we added capabilities aimed at RL research: top-p mask, top-k and full-vocabulary OPD, and configurations that improve training–rollout consistency, including R3-style setups and full numerical alignment between the training and rollout paths, which give us finer control over sampling, training, and teacher signals, and make it fast to run controlled comparisons. In our training–rollout consistency evaluation, the average difference in log probabilities (logprob) was controlled at the 1e-7 level, representing a reduction of more than 99.99% compared with previous setups.

做 GLM-5.3 的过程中, 我们在两个方向上继续完善它. 算法方面, 加了面向强化学习研究的能力: top-p mask, top-k 和全词表 OPD, 以及改善训练与 rollout 一致性的配置, 包括 R3 式设置和训练路径与 rollout 路径的完全数值对齐. 这些让我们能更细地控制采样, 训练和教师信号, 也能很快跑出受控对比. 在我们的训练-rollout 一致性评估里, 对数概率 (logprob) 的平均差异压到了 1e-7 量级, 比之前的设置降低了 99.99% 以上.

We also worked on resource efficiency and system throughput for large-scale RL. Local storage now serves as an additional caching layer, holding model states and data hierarchically that would otherwise sit in host memory. This matters most for multi-teacher OPD: with dynamic teacher switching and prefetching on the training side, several teachers can be used without standing up a dedicated long-running inference service for each, at limited added overhead and substantially lower resource consumption. For agentic and asynchronous workloads, we improved joint scheduling and load balancing between the router and slime, so that rollout requests with widely varying lengths and completion times make better use of inference resources. We added workload-aware heuristics that derive throughput-oriented configurations — prefill/decode resource ratio, concurrency settings, and other throughput-critical parameters — from the characteristics of each rollout environment. As a result, for long-horizon coding RL tasks, these system-level optimizations improved end-to-end RL training throughput by more than 2.3×, allowing us to scale training over longer trajectories and more complex environments with substantially higher efficiency.

我们还在大规模强化学习的资源效率和系统吞吐上下了功夫. 本地存储现在多当一层缓存, 分层存放原本要占主机内存的模型状态和数据. 这对多教师 OPD 最有用: 训练侧能动态切换教师并预取, 同时用上几个教师, 却不必给每个教师常驻一套专门的推理服务, 增加的开销有限, 资源消耗低得多. 对智能体和异步负载, 我们改进了 router 和 slime 之间的联合调度与负载均衡, 让长度和完成时间差别很大的 rollout 请求更好地利用推理资源. 我们还加了感知负载的启发式规则, 根据每个 rollout 环境的特点推出面向吞吐的配置: prefill/decode 资源配比, 并发设置, 以及其他影响吞吐的关键参数. 结果是, 在长程编程强化学习任务上, 这些系统层优化把端到端的强化学习训练吞吐提高了 2.3 倍以上, 让我们能以高得多的效率, 在更长的轨迹和更复杂的环境上把训练做大.

Taken together, these give us more experimental flexibility, lower resource cost, and higher throughput — which is what makes it practical to keep scaling RL.

合起来, 这些带来了更灵活的实验, 更低的资源成本和更高的吞吐, 强化学习能一直做大下去, 靠的就是这些.

**Getting started with GLM-5.3**

**上手 GLM-5.3** (源文 md 是二级标题.)

**API Changes in GLM-5.3**

**GLM-5.3 的 API 变化** (源文 md 是二级标题.)

GLM-5.3 supports three thinking effort levels: low, high, and max. Disabling thinking is no longer supported by GLM-5.3.

GLM-5.3 支持三档思考 effort: low, high, max. GLM-5.3 不再支持关闭思考.

**Thinking Parameters**

**思考参数** (源文 md 是二级标题.)

<!-- page 9 of 12 -->

| Parameter | Values | Default | Description |
| --- | --- | --- | --- |
| thinking.type | enabled | enabled | Enables thinking. disabled is no longer supported. |
| reasoning_effort | low, high, max | max | low: light; high: enhanced; max: deep. |

| 参数 | 取值 | 默认值 | 说明 |
| --- | --- | --- | --- |
| thinking.type | enabled | enabled | 开启思考. 不再支持 disabled. |
| reasoning_effort | low, high, max | max | low: 轻度; high: 增强; max: 深度. |

max is recommended for coding tasks.

编程任务推荐用 max.

```json
{
    "model": "glm-5.3",
    "thinking": { "type": "enabled" },
    "reasoning_effort": "max"
}
```

(请求示例: 模型 glm-5.3, 开启思考, effort 设为 max.)

**Migration required**: If your application currently uses thinking.type: "disabled", change it to enabled and set reasoning\_effort to low before updating the model ID to glm-5.3.**Otherwise, the request will fail.**

**需要迁移**: 如果你的应用现在用的是 thinking.type: 「disabled」, 在把模型 ID 换成 glm-5.3 之前, 先把它改成 enabled, 并把 reasoning_effort 设为 low.**否则请求会失败.**

**Use GLM-5.3 with GLM Coding Plan & ZCode**

**通过 GLM Coding Plan 和 ZCode 使用 GLM-5.3** (源文 md 是二级标题.)

Try **GLM-5.3** in your favorite coding agents—**ZCode, Claude Code, OpenCode**, and more. [https://docs.z.ai/devpack/overview](https://docs.z.ai/devpack/overview)

在你常用的编程智能体里试试 **GLM-5.3**: **ZCode, Claude Code, OpenCode** 等等. [https://docs.z.ai/devpack/overview](https://docs.z.ai/devpack/overview)

**For GLM Coding Plan subscribers:** We’ve rolled out GLM-5.3 to all GLM Coding Plan users. The new GLM Coding Plan now uses a points-based quota system. Point usage is calculated separately for input, cached input, and output tokens. Model calls made outside peak hours consume 50% of the standard points. Peak hours are 14:00–18:00 (UTC+8), Monday through Friday; all other hours, including weekends, receive the 50% off-peak rate. Start building now: [https://z.ai/subscribe](https://z.ai/subscribe)

**GLM Coding Plan 订阅用户:** 我们已经向所有 GLM Coding Plan 用户推送了 GLM-5.3. 新的 GLM Coding Plan 改用积分制额度. 积分按输入, 缓存输入和输出 token 分别计算. 非高峰时段的调用只消耗标准积分的 50%. 高峰时段是周一到周五 14:00-18:00 (UTC+8); 其余时间, 包括周末, 都按 50% 的非高峰费率. 现在就开始: [https://z.ai/subscribe](https://z.ai/subscribe)

**Get more from GLM-5.3 with ZCode**

**在 ZCode 里把 GLM-5.3 用得更划算** (源文 md 是二级标题.)

98%+ cache hit rate — repeated context billed at the lower cached rate, \~30% more effective tokens;

98% 以上的缓存命中率: 重复的上下文按更低的缓存价计费, 有效 token 多出约 30%;

1.5x limited-time quota boost — stack it with the cache savings for up to 180% your standard quota through August 31.

1.5 倍限时额度加成: 和缓存节省叠加, 到 8 月 31 日为止, 最多可达标准额度的 180%.

> **拆开:** 「up to 180%」 是怎么叠出来的?
> 按字面有两种叠法. 相乘: 1.5 × 1.3 = 1.95, 是 195%; 相加: 150% + 30% = 180%. 博客写的是 180%, 对上的是相加. 可两个因子性质不同: 1.5 倍是额度本身放大, 约 30% 是缓存命中让同样的额度多换 token, 两者相乘才是叠加后的效果; 要么 180% 按相加算偏保守, 要么 30% 另有算法, 博客没说. 这项活动截至 8 月 31 日, 离发布只有 17 天. 同家族 GLM-5.2 博客的计费是高峰 3 倍, 非高峰 2 倍, 高峰时段每天 14:00-18:00; 本篇改成积分制, 非高峰 50%, 高峰只算工作日. 两代套餐的规则不一样, 用量不能直接对比.

Long-horizon mastery — Goal mode plans, codes, tests, and verifies until the target is met;

长程任务: Goal 模式会规划, 写代码, 测试, 验证, 直到达成目标;

<!-- page 10 of 12 -->

Remote Control — monitor and steer long-running tasks from your phone via WeChat or Feishu.

远程控制: 通过微信或飞书, 在手机上监控和调整长时间运行的任务.

Try ZCode: [https://zcode.z.ai](https://zcode.z.ai/)

试用 ZCode: [https://zcode.z.ai](https://zcode.z.ai/)

**Serve GLM-5.3 Locally**

**本地部署 GLM-5.3** (源文 md 是二级标题.)

The model weights of GLM-5.3 will be publicly available soon in two weeks.

GLM-5.3 的模型权重将在两周内公开. (第 1 页写的是 「in two weeks after launch」, 按发布日 2026-08-14 推算是 8 月 28 日前后; 这一页只写 「soon in two weeks」, 没给日期. 第 1 页的 HuggingFace 链接已经指向 zai-org/GLM-5.3, 抓取时那里有没有权重, 这份材料看不出. 本篇也没写许可证.)

**Footnotes**

**脚注** (源文 md 是二级标题.)

**HLE w/ tools**: We use sampling parameters of temperature=1.0 and top\_p=0.95 for evaluation, with a maximum generation length of 163,840 tokens. The evaluation is conducted with a maximum context length of 300,000 tokens, using a context management strategy. We use GPT-5.6-luna (medium) as the judge model.

**HLE w/ tools**: 评测采样参数 temperature=1.0, top_p=0.95, 最大生成长度 163,840 token. 评测时最大上下文长度 300,000 token, 使用上下文管理策略. 裁判模型用 GPT-5.6-luna (medium).

**NL2Repo**: We evaluated NL2Repo with temperature=1.0, top\_p=1.0, and max\_new\_tokens=64k under 1M context. To prevent hacking, we use rule-based and a LLM-based judgement to prevent malicious behaviors (e.g., unauthorized pip or curl operations).

**NL2Repo**: 设置 temperature=1.0, top_p=1.0, max_new_tokens=64k, 1M 上下文. 为防止钻空子, 我们用基于规则和基于 LLM 的判定来拦住恶意行为 (例如未经授权的 pip 或 curl 操作).

**DeepSWE**: We run DeepSWE using the mini-swe-agent harness with temperature=0.95, top\_p=1.0, timeout=6h and 400K context.

**DeepSWE**: 用 mini-swe-agent 框架跑, temperature=0.95, top_p=1.0, 超时 6 小时, 400K 上下文.

**Terminal-Bench 2.1**: We evaluate in Claude Code 2.1.207 with temperature=1.0, top\_p=1, max\_new\_tokens=65536 with 6h timeout.

**Terminal-Bench 2.1**: 在 Claude Code 2.1.207 里评测, temperature=1.0, top_p=1, max_new_tokens=65536, 超时 6 小时.

**Terminal-Bench 3.0**: We evaluate Terminal-Bench-3 tasks with the Claude Code 2.1.207 harness (reasoning effort=max, 400K context, and 128K maximum output), reporting avg@3 over three rollouts per task. Each rollout runs in an isolated container built from the task's official image, and is capped at 600 agent turns with a 10-hour timeout. Tool Search is disabled, and the artifacts each agent produces are scored by the task's official separate verifi er.

**Terminal-Bench 3.0**: 用 Claude Code 2.1.207 框架评测 Terminal-Bench-3 的任务 (reasoning effort=max, 400K 上下文, 最大输出 128K), 报告每个任务三次 rollout 的 avg@3. 每次 rollout 在按任务官方镜像构建的隔离容器里运行, 上限 600 轮智能体交互, 超时 10 小时. 关闭 Tool Search, 智能体产出的结果由任务官方的独立验证器打分. (原文 「verifi er」 中间多了一个空格, 照录.)

**Agent’s Last Exam (CLI)**: We evaluate ALE using the official evaluation protocol with the Claude Code harness (reasoning effort=max, 1M context, and 64K maximum output). Each of the 105 tasks runs in an isolated Docker container using the resources declared in its Task Card. The default timeout is 4 hours, with task-specific limits taking precedence (up to 8 hours). Tool Search is disabled, and results are scored by the official ALE evaluators.

**Agent's Last Exam (CLI)**: 按官方评测协议, 用 Claude Code 框架评测 ALE (reasoning effort=max, 1M 上下文, 最大输出 64K). 105 个任务各在一个隔离的 Docker 容器里运行, 资源按各自任务卡的声明分配. 默认超时 4 小时, 任务单独规定了上限的以任务为准 (最长 8 小时). 关闭 Tool Search, 由官方 ALE 评测器打分. (脚注标题写 「Agent's」, 表里写 「Agents'」, 照录.)

**Toolathlon Verified**: We obtain all results via the official evaluation service and report pass@1 averaged over 3 independent runs.

**Toolathlon Verified**: 所有结果都通过官方评测服务取得, 报告 3 次独立运行平均的 pass@1.

**AutomationBench**: We evaluate on AutomationBench **v1.0.6**, incorporating the fix for the nulltype handling issue introduced in [PR #13](https://github.com/zapier/AutomationBench/pull/13).

**AutomationBench**: 在 AutomationBench **v1.0.6** 上评测, 包含对 [PR #13](https://github.com/zapier/AutomationBench/pull/13) 引入的 null 类型处理问题的修复.

**GDPval-AA v2**: Models are evaluated by Artificial Analysis.

**GDPval-AA v2**: 各模型由 Artificial Analysis 评测.

**CyberGym**: We evaluate GLM-5.3 in Claude Code 2.1.207 (max reasoning effort, no web tools with temperature=1.0, top\_p=1.0, max\_new\_tokens=128000). All evaluations are under

**CyberGym**: 在 Claude Code 2.1.207 里评测 GLM-5.3 (max reasoning effort, temperature=1.0, top_p=1.0, max_new_tokens=128000). 所有评测都在

<!-- page 11 of 12 -->

unlimited timeout per task and results are single-run Pass@1 over 1,507 tasks. To simulate real-world usage scenarios, we place the agent inside the task container. We also remove all Git-related information and apply a domain whitelist (allowing only essential domains such as pypi.org and deb.debian.org for basic tool installation) to prevent the agent from cheating.

每个任务不限时的条件下进行, 结果是 1,507 个任务上的单次 Pass@1. (后面两句是运行环境和网络访问的设置, 不译.)

**ExploitGym**: We evaluate GLM-5.3, Kimi-K3 and Qwen3.8 Max in Claude Code 2.1.207 (max reasoning effort, no web tools with temperature=1.0, top\_p=1.0, max\_new\_tokens=128000). The reported results are single-run Pass@1 on 869 tasks under two timeout budgets: 2 hours and 6 hours, which are calculated as the API inference time rescaled by per-model tokens per second rate (per-model TPS sourced from Artificial Analysis; that is, we rescale GLM-5.3's results by 115 TPS, Kimi K3's results by 40 TPS and Qwen3.8 Max's results by 47 TPS), plus the non-API overhead. We also apply a domain whitelist (allowing only essential domains such as pypi.org and deb.debian.org for basic tool installation) to prevent the agent from cheating.

**ExploitGym**: 在 Claude Code 2.1.207 里评测了 GLM-5.3, Kimi-K3 和 Qwen3.8 Max 三家 (设置同上). 报告的是 869 个任务上的单次 Pass@1, 分 2 小时和 6 小时两档预算; 预算按 API 推理时间用各模型的每秒 token 数 (TPS, 取自 Artificial Analysis) 折算, 再加上非 API 开销: GLM-5.3 按 115 TPS, Kimi K3 按 40 TPS, Qwen3.8 Max 按 47 TPS. (最后一句网络访问的设置不译.)

**ExploitBench**: We evaluate GLM-5.3 in Claude Code 2.1.207 (max reasoning effort, no web tools with temperature=1.0, top\_p=1.0, max\_new\_tokens=128000). Following the official evaluation settings, we limit the maximum number of interaction rounds between the agent and the environment to 300, and compute the average coverage score over all 41 tasks across 3 revisions. The coverage result of a task is determined by taking the union of capabilities achieved across all revisions, and the average score is obtained by averaging the results. We also apply a domain whitelist (allowing only essential domains such as pypi.org and deb.debian.org for basic tool installation) to prevent the agent from cheating.

**ExploitBench**: 在 Claude Code 2.1.207 里评测 GLM-5.3 (设置同上). 按官方设置, 智能体和环境的交互轮数上限 300, 分数是全部 41 个任务在 3 个 revision 上的平均覆盖分; 单个任务的覆盖结果取各 revision 的并集, 再对任务求平均. (最后一句网络访问的设置不译.)

**FrontierSWE**: The evaluation was conducted by [Proximal](https://www.proximal.ai/) with 1M context length, max effort level, and 128K maximum output tokens. Dominance score reported as of 2026/08/14.

**FrontierSWE**: 由 [Proximal](https://www.proximal.ai/) 评测, 1M 上下文, max effort, 最大输出 128K token. 报告的是截至 2026/08/14 的 Dominance 分.

**PostTrainBench**: We evaluate GLM-5.3 using Claude Code 2.1.207 with max effort level, temperature = 1.0, top\_p = 1.0, max\_new\_tokens = 128000, and a 1M-token context window. We report the weighted average over 3 runs. Runs that fail to produce a score fall back to the official zero-shot base-model baseline score. For checks intended to prevent the use of thirdparty APIs, we removed the original pattern-matching-based checks, as they produced false positives when a local vLLM endpoint was accessed through the OpenAI SDK. Instead, we use an LLM agent to inspect solutions for external API usage.

**PostTrainBench**: 用 Claude Code 2.1.207 评测 GLM-5.3, max effort, temperature = 1.0, top_p = 1.0, max_new_tokens = 128000, 1M token 上下文窗口. 报告 3 次运行的加权平均. 没产出分数的运行, 回退到官方零样本基座模型的基线分. 原来防止调用第三方 API 的检查靠模式匹配, 通过 OpenAI SDK 访问本地 vLLM 端点时会误报, 我们把它去掉了, 改用一个 LLM 智能体检查解答里有没有调用外部 API.

**SWE-Marathon**: We evaluate GLM-5.3 using Claude Code 2.1.207 with maximum effort level, temperature = 1.0, top\_p = 0.95, max\_new\_tokens = 128000, and a 1M-token context window. For strip-clone, the original anti-cheat checks used overly broad import detection that could reject valid implementations. We removed the affected checks and performed llm-based inspection instead to avoid false positives. For parameter-golf and trimul-cuda, changes to the NVIDIA wheels caused the Docker image builds to fail, so we added --extra-indexurl https://pypi.org/simple to restore successful builds.

**SWE-Marathon**: 用 Claude Code 2.1.207 评测 GLM-5.3, 最大 effort, temperature = 1.0, top_p = 0.95, max_new_tokens = 128000, 1M token 上下文窗口. strip-clone 任务原来的反作弊检查对 import 检测过宽, 会拒掉合法的实现; 我们去掉了受影响的检查, 改用基于 LLM 的检查, 避免误报. parameter-golf 和 trimul-cuda 两个任务, 因为 NVIDIA wheel 的变动, Docker 镜像构建失败, 我们加了 --extra-indexurl https://pypi.org/simple 让构建恢复. (pip 的参数通常写作 --extra-index-url, md 里少一个连字符, 可能是换行时丢的, 照录.)

<!-- page 12 of 12 -->

Z \_

(页脚的 Z 字标被识别成的字符.)

Legal

法律信息

[Privacy Policy](https://chat.z.ai/legal-agreement/privacy-policy)

[隐私政策](https://chat.z.ai/legal-agreement/privacy-policy)

[Terms of Service](https://chat.z.ai/legal-agreement/terms-of-service)

[服务条款](https://chat.z.ai/legal-agreement/terms-of-service)

© 2026 [Z.ai](https://chat.z.ai/) Inc.

© 2026 [Z.ai](https://chat.z.ai/) Inc. (版权行.)

X 0

(页脚右侧 X 和 GitHub 两个图标被识别成的字符.)
