---
title: "Claude 3.5 Sonnet：中档模型越过旗舰"
category: "模型库"
tags: ["Claude", "技术解析"]
published: true
excerpt: "这份材料是 Anthropic 官网 Announcements 栏目下的发布稿，正文只占前 5 页：第 1 页标题，日期，题图和导语，第 2 到 3 页讲文本能力与编码，第 3 到 4 页讲视觉，第 4 页介绍 Artifacts，第 4 到 5 页讲安全，隐私和后续规划。"
---
# Claude 3.5 Sonnet：中档模型越过旗舰

> 本目录的源材料是 Anthropic 2024 年 6 月 21 日发布的公告 「Claude 3.5 Sonnet」 的抓取 `claude-3-5-sonnet.md`（10 页，6 图），属于产品博客，不是技术报告。全文没有架构描述和训练细节；能核对的只有第 3, 4 页两张评测表，两条脚注，正文里几个百分数和价格。对不上的写 「本页没有」。

来源：同目录 `claude-3-5-sonnet.md`（页标记 `page 1 of 10` 到 `page 10 of 10`）与 `claude-3-5-sonnet.pdf`。逐段双语对照和逐条疑问在 `claude-3-5-sonnet-bi.md`. md 与 PDF 对不上的地方以 PDF 为准，源文件本身不改。

## 1. 材料与定位

### 1.1. 材料性质：一篇产品公告，两层时间

这份材料是 Anthropic 官网 Announcements 栏目下的发布稿，正文只占前 5 页：第 1 页标题，日期，题图和导语，第 2 到 3 页讲文本能力与编码，第 3 到 4 页讲视觉，第 4 页介绍 **Artifacts**，第 4 到 5 页讲安全，隐私和后续规划。第 5 页 「X」 之后全是 「Related content」 和站点页脚。页首横幅 「UPDATE Consumer Terms and Privacy Policy Aug 28, 2025」，页脚 「© 2026 Anthropic PBC」 以及 Related content 里的 Claude Mythos，都属于抓取时的站点状态，只有正文和两张表算发布时的信息。

写法是 「结论 + 表格 + 用途」，没有方法章节。按 「数据，架构，算法，预训练，后训练，评测」 去对，评测一面相对充实，安全一面有过程描述，数据，架构和预训练全空。页面两次把读者引向 「Model_Card_Claude_3_Addendum.pdf」，一次是内部编码评测，一次是安全细节；本目录只有公告。能从公开资料补上的一条来自 Anthropic CEO Dario Amodei 2025 年 1 月的文章：他说 3.5 Sonnet 是一个中等规模的模型，训练花了 「a few $10M's」，并且训练过程没有用到任何更大或更贵的模型。这句话回答了当时社区对 「是否从 Opus 级模型蒸馏」 的猜测，但参数量和训练 token 数仍然没有公开。

### 1.2. 定位，渠道和价格

定位：「our first release in the forthcoming Claude 3.5 model family」，3.5 家族的第一款，Haiku 和 Opus 要到 「later this year」。渠道：Claude.ai 与 iOS 应用免费可用，Pro 和 Team 订阅有更高的速率限制；开发者可经 Anthropic API，Amazon Bedrock，Google Cloud Vertex AI 调用。价格：每百万输入 token \$3，输出 \$15。上下文 200K token。

速度和成本只有相对说法：导语说它有 「the speed and cost of our mid-tier model, Claude 3 Sonnet」，第 2 页说 「twice the speed of Claude 3 Opus」。同级目录的 Claude 3 公告印过 3 Sonnet 的价格，正是 \$3 / \$15，与这里一致；Opus 是 \$15 / \$75，所以按表价，3.5 Sonnet 的单价是 3 Opus 的 五分之一。第 2 页示意图横轴是价格，纵轴是 benchmark 分数，两轴都没有刻度；3.5 Sonnet 从 3 Sonnet 的位置竖直上移，高过 Opus。结合第 1.1 节那句 「没有用更大模型」，这张图想说的是：同一档位里，新一轮预训练和后训练就能越过上一代旗舰，不必等更大的模型。这个判断属于产品叙事，本页没给计算量对比。

## 2. 评测表与脚注

### 2.1. 文本评测表：结构与口径

第 3 页的表有五列：Claude 3.5 Sonnet, Claude 3 Opus, GPT-4o, Gemini 1.5 Pro, Llama-400b (early snapshot)。行覆盖 GPQA Diamond, MMLU, HumanEval, MGSM, MATH, GSM8K, DROP (F1), BIG-Bench-Hard. 3.5 Sonnet 对 3 Opus 九格全部领先，幅度从 MGSM 的 0.9 个百分点到 MATH 的 11.0 个百分点；GPQA 59.4% 对 50.4%，HumanEval 92.0% 对 84.9%。对 GPT-4o，两者都有分数的六格里 3.5 Sonnet 赢四格，输 MMLU 0-shot CoT（88.3% 对 88.7%）和 MATH（71.1% 对 76.6%）两格。

难点在口径。左边三列同一行设置一致，右边两列经常不同：Gemini 在 MGSM，MATH，GSM8K 上分别用 8-shot，4-shot，11-shot，DROP 标 「Variable shots」；Llama 列有两格注明是预训练模型，也就是没做后训练的基座，和其余几列不在同一阶段。五列齐全且设置一致的只有 HumanEval 一行。预训练模型与后训练模型混在一张表里，本身就提醒读者：DROP，BIG-Bench-Hard 这类分数里，有多少来自预训练，有多少来自后训练对格式和推理习惯的塑造，表上分不开。通用问题见 [评测科学与证据](../../../../llm-guide/5-评测、安全与治理/5.1-评测科学与证据.md)。PDF 原图里 3.5 Sonnet 一列用橙框圈起，每行最高分印成绿色，md 转换丢了颜色，中文对照表在 bi 里按 PDF 拆开。

### 2.2. 视觉评测表

第 4 页的视觉表四列（没有 Llama），五行：MathVista (testmini), AI2D, MMMU (val)，Chart Q&A，文档视觉问答，设置统一为 0-shot 或 0-shot CoT，比文本表整齐。3.5 Sonnet 对 3 Opus 五项全部领先，提升在 5.9 到 17.2 个百分点之间，最大的是 MathVista（67.7% 对 50.5%）。对 GPT-4o 和 Gemini 1.5 Pro，它在 MMMU 上落后 GPT-4o（68.3% 对 69.1%），其余四项领先，但 AI2D 上三家都在 94% 以上，差距不到 1 个百分点。

正文的视觉卖点有两个：视觉推理（以图表解读为例）和从有瑕疵的图片里转写文字。前者有 MathVista 和 Chart Q&A 对应；后者没有专门评测，只能间接参考文档问答。MathVista 涨幅最大而 AI2D 几乎饱和，说明提升集中在 「看图后还要多步推理」 的任务上，纯识别类已经接近天花板（推测）。视觉接入方式和图文训练数据，本页没有。Chart Q&A 用 「Relaxed accuracy」，文档问答用 「ANLS score」，度量方式见 [VLM的评测与基准](../../../../llm-guide/8-多模态/8.2-视觉语言模型/8.2.5-VLM的评测与基准.md)。

### 2.3. 内部 agentic 编码评测与 TestingTime 脚注

表外还有一组编码数字：在一项内部 agentic 编码评测里，3.5 Sonnet 解决 64% 的问题，3 Opus 解决 38%。任务是按自然语言需求在开源代码库里修 bug 或加功能，模型可以借助工具写代码，改代码，运行代码。这是全页唯一一项 agent 形态的评测，也是和 HumanEval 差别最大的一项：HumanEval 上两者差 7.1 个点，这里差 26 个点。单函数补全已经接近饱和，多步调试才拉开差距，这指向后训练在工具调用和长轨迹上下了功夫（推测）。题量，轮数上限，判定标准和其他模型对照都没给。四个月后的升级版 3.5 Sonnet 改用公开的 SWE-bench Verified 报分，见同级目录 3.5 Haiku 与 **computer use** 两篇。评测形态见 [Benchmark与Eval](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.2-Benchmark与Eval.md) 与 [IDE与Coding-Agent](../../../../llm-guide/13-Agent/13.5-Agent应用与治理/13.5.1-IDE与Coding-Agent.md)。

文本表的两条脚注值得单独看。GPQA 在 「5-shot CoT ... with maj@32」 下是 67.2%，表中 0-shot CoT 是 59.4%；MMLU 在 5-shot CoT 下是 90.4%，表中是 88.7% 和 88.3%. maj@32 是同一题采样 32 次后多数投票，属于 **TestingTime** 投入，和部署前把模型做大的 Scaling 是两回事。GPQA 上多采样换来 7.8 个点，而 MMLU 只换来不到 2 个点，说明越难的题，推理阶段多花算力的回报越大。页面把这两个数放脚注不进表，是在分开两种口径。背景见 [推理与思考能力](../../../../llm-guide/4-后训练/4.5-推理与思考能力/4.5-推理与思考能力.md)。

## 3. 产品，安全与边界

### 3.1. Artifacts 与后续规划

Artifacts 是 Claude.ai 的界面功能：生成的代码，文档，网页设计放到对话旁的独立窗口里，用户可以查看，编辑，接着改，页面自称 「preview feature」，没有 API 表述和评测。它说明这次同时推了模型和产品界面，对理解模型能力没有增量。不过模型要稳定地产出能直接渲染的完整网页和代码，需要后训练里有对应的格式数据，这一点本页没有交代。

「Coming soon」 一节的目标是每隔几个月改善智能，速度，成本之间的权衡曲线；3.5 Haiku 和 3.5 Opus 年内发布；新模态与企业集成在开发中；Memory 功能在探索中。都没有日期和数字。事后看，3.5 Haiku 在 10 月发布，3.5 Opus 没有以这个名字发布，本页当然不知道这一点。跨会话记忆的一般做法见 [记忆系统](../../../../llm-guide/13-Agent/13.1-Agent核心组件/13.1.1-记忆系统.md)。

### 3.2. 安全与隐私

结论：红队评估认为 3.5 Sonnet 仍处于 **ASL-2**。过程：交给 UK AISI 做部署前安全评估，结果按美英两国 AISI 的谅解备忘录共享给 US AISI；吸收外部领域专家的政策反馈；按 Thorn 儿童安全专家的反馈更新分类器并微调模型。最后一条值得注意：它同时动了两层防线，一层是部署侧的分类器，一层是模型本身的微调，这是后来系统卡里 「模型层加系统层」 双层防护写法的早期形态。红队和部署前评估的做法见 [安全与对抗评测](../../../../llm-guide/5-评测、安全与治理/5.2-安全与对抗评测.md)。

没说的比说了的多：红队测了哪些风险类别，UK AISI 的结论，分类器指标，微调前后对比，都指向模型卡增补。隐私一段写 「privacy」 是 「core constitutional principles」 之一，承诺除非用户明确授权，不用用户提交的数据训练生成式模型。这句把隐私放进宪法原则，等于说它既约束数据收集，也在 **Constitutional AI** 的训练信号里出现。页首 2025 年 8 月的条款更新横幅没有展开，从这份材料判断不了两者关系。通用讨论见 [隐私数据与内容治理](../../../../llm-guide/5-评测、安全与治理/5.3-隐私数据与内容治理.md)。

### 3.3. 材料边界

这页能稳定回答：3.5 Sonnet 在家族中的定位，上线渠道，\$3 与 \$15 的单价，200K 上下文，两句相对速度说法，两张评测表的全部分数与设置，两条脚注，内部编码评测的 64% 与 38%，Artifacts 的产品形态，ASL-2 结论和外部安全合作过程。

回答不了：架构，参数量，训练数据与截止，预训练与后训练方法，上下文扩展方式，视觉输入方式，具体延迟与吞吐，内部编码评测的题量与判定标准，红队和 AISI 的具体结果。第 1.1 节的训练成本和 「没有用更大模型」 来自 Dario Amodei 的公开文章，不是本页原文。逐条疑问写在 `claude-3-5-sonnet-bi.md` 对应段落之后，共 18 处。
