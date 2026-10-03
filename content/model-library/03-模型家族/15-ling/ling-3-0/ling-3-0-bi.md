---
title: "Ling 3.0 · 对照译稿"
category: "模型库"
tags: ["Ling", "对照译稿"]
published: true
excerpt: "Ling 3.0 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 13 -->

![Image block](images/p01-image.png)

(图: 页头标识.)

![Image block](images/p01-search-models-datasets-users.png)

(图: 站点搜索框图标.)

## [inclusionAI](https://huggingface.co/inclusionAI)/[Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)

这是 Hugging Face 上 inclusionAI/Ling-3.0-flash 的模型卡. 上个月下载量 16,399.

![Image block](images/p01-safetensors.png)

(图: 文件名带 safetensors. 旁边正文才是参数数字.)

**Safetensors**. Model size **127B params**. Tensor type **F32 · BF16**.

侧栏写 Safetensors, 模型大小 **127B params**, 张量类型 **F32 · BF16**.

> **看表:** 侧栏这一个 127B, 是后文的 Total 124B 吗?
> 不是同一格. 第 3 页和第 4 页写总参数 124B, 激活参数 5.1B. 127 减 124 等于 3, 卡上没有写这 3B 是舍入, 词表, 还是别的口径. 5.1B 是激活那一行, 和 124B, 127B 都不是同一个数.

<!-- page 2 of 13 -->

![Image block](images/p02-txt.png)

(图: 合集小卡片. 文字是 Ling 3.0 Collection, 20 items, Updated about 20 hours ago.)

The model tree lists 4 finetunes and 44 quantized derivatives. Spaces using this model: 21, of which four are named and the rest are "+ 16 Spaces".

模型树写 4 个微调和 44 个量化衍生. 使用这个模型的 Space 是 21 个, 点名了 4 个, 其余写成 + 16 Spaces.

> **问:** 「20 items」 和 「Updated about 20 hours ago」 是这个 flash 的发布信息吗?
> 不是. 20 items 写在 Ling 3.0 Collection 上, 这张卡只是其中的 Ling-3.0-flash. about 20 hours ago 是抓取时的相对时间, 没有绝对日期.

The evaluation widget, before the README body, prints SWE-Bench Pro 56.6, MathArena AIME 2026 93.2, HLE 22.7, HMMT Feb 2026 87, SWE-Bench Multilingual 72.4.

评测组件在正文之前印了 SWE-Bench Pro 56.6, MathArena AIME 2026 93.2, HLE 22.7, HMMT Feb 2026 87, SWE-Bench Multilingual 72.4.

![Chart block](images/p02-chart.png)

(图: 组件旁的小图, 文件名没有坐标.)

![Image block](images/p02-hugging-face.png)

(图: Hugging Face 标识.)

![Image block](images/p02-modelscope-https-modelscope-cn-organization-inclusionai.png)

(图: ModelScope 标识.)

<!-- page 3 of 13 -->

We're introducing Ling-3.0-flash, a native hybrid reasoning model, with 124B total and 5.1B active parameters, written as about 12.4% and 8.1% of the previous 1T-class flagship Ring-2.6-1T.

Ling-3.0-flash 是原生混合推理模型. 总参数 124B, 激活参数 5.1B, 写成上一代 1T 级旗舰 Ring-2.6-1T 的约 12.4% 和 8.1%.

> **核对:** 12.4% 和 8.1% 的分母是同一个 1T 吗?
> 不是. 第 7 页表的 Size 行把 Ring-2.6-1T 写成 **1T-A63B**. 124/1000 等于 0.124, 对上 12.4%. 5.1/63 约 0.081, 对上 8.1%. 两个百分比一个除总参数, 一个除激活参数. 这页没有印 Ring-1T 的约 50B, 不能拿来代 63B.

The architecture line says pretraining starts with a 5:1 stack of Kimi Delta Attention (KDA) and MLA, plus 1/64 sparse MoE. A later sentence says TTFT drops by 60% to over 80% in long-input scenarios. The training-environment count is 10,000+. Those are printed results and counts. The caching recipe is not transcribed.

架构那句写预训练从一开始就是 KDA 和 MLA 按 5:1 交替, 另加 1/64 的稀疏 MoE. 后文写长输入场景里 TTFT 下降 60% 到 80% 以上. 交互训练环境写成 10,000+. 这些是印出来的结果和计数. 缓存配方不转写.

<!-- page 4 of 13 -->

![Chart block](images/p04-note-thinking-mode-is-enabled-by-default.png)

(图: 文件名取自后文 Note. 图注写 Thinking mode is enabled by default.)

Note: Thinking mode is enabled by default.

说明: 思考模式默认打开. 这是推理时多算, 写成 TestingTime. 上下文从 8K 到 256K 是窗口长度, 不是这件事.

| Architecture | Hybrid-linear MoE |
| --- | --- |
| Parameter scale | Total 124B, Activated 5.1B |
| Transformer layers | 35 KDA + 7 Gated MLA (5:1) |
| Dense layers | 2 |
| Routed experts | 512 |
| Shared experts | 1 |
| Activated experts | 8 |
| Attention heads | 32 |
| Hidden size | 2560 |

表: 架构是 Hybrid-linear MoE. 总参数 124B, 激活参数 5.1B. Transformer 层是 35 个 KDA 加 7 个 Gated MLA, 注明 5:1. 稠密层 2. 路由专家 512. 共享专家 1. 激活专家 8. 注意力头 32. 隐藏维 2560.

> **拆开:** 1/64 和 5.1B/124B 是同一个比例吗?
> 不是. 8/512 正好是 1/64, 对上 「1/64 sparse MoE」 和 「激活专家 8, 路由专家 512」 这两行. 共享专家 1 不在这 512 里. 5.1/124 约 4.1%, 是算出来的参数激活占比, 卡上没有印 4.1%, 也没有写它等于 1/64.

> **停一下:** 35 加 7 等于 42. 表上的稠密层 2 在这 42 层里面吗?
> 表没有写. 35:7 正好是 5:1, 和括号一致. 「Number of Dense Layers 2」 是另一行. 它是这 42 层里的 2 层, 还是额外的 2 层, 这页没说.

<!-- page 5 of 13 -->

| Expert intermediate size | 768 |
| --- | --- |
| Dense intermediate size | 6144 |
| Vocabulary size | 157184 |
| Context training schedule | 8K to 32K to 256K |

专家中间维 768. 稠密中间维 6144. 词表 157184. 上下文训练日程是 8K 到 32K 再到 256K. 这是训练时把窗口拉长, 属于部署前的缩放.

![Image block](images/p05-evaluation.png)

(图: 文件名是 evaluation. 它夹在架构标题和 Evaluation 标题之间.)

## Evaluation

The prose says the model is strong on SWE-Bench Pro, SWE-Bench Multilingual, Tau3-banking-AA, MCP-Atlas, and SkillsBench, and names the frameworks Claude Code, Kilo Code, Qwen Code, Hermes Agent, and OpenClaw. Framework steps are not transcribed.

正文点了 SWE-Bench Pro, SWE-Bench Multilingual, Tau3-banking-AA, MCP-Atlas, SkillsBench, 并点了 Claude Code, Kilo Code, Qwen Code, Hermes Agent, OpenClaw 这些框架. 框架里的步骤不转写.

<!-- page 6 of 13 -->

The sentence continues into general knowledge, mathematical reasoning, instruction following, and long-context understanding.

句子接到通用知识, 数学推理, 指令遵循, 长上下文理解.

<!-- page 7 of 13 -->

The comparison table's size row is Ling-3.0-flash **124B-A5.1B**, Ring-2.6-1T (xhigh) **1T-A63B**, MiniMax-M2.7 **230B-A10B**, Step-3.7-Flash (high) **198B-A11B**, Deepseek-V4-Flash-Preview (max) **284B-A13B**, Nemotron-3-Super **120B-A12B**. GPT-5.4-mini and Claude-Sonnet-4.6 have no size.

对照表的规模行: Ling-3.0-flash **124B-A5.1B**, Ring-2.6-1T (xhigh) **1T-A63B**, MiniMax-M2.7 **230B-A10B**, Step-3.7-Flash (high) **198B-A11B**, Deepseek-V4-Flash-Preview (max) **284B-A13B**, Nemotron-3-Super **120B-A12B**. GPT-5.4-mini 和 Claude-Sonnet-4.6 没有规模.

Selected cells, Ling-3.0-flash first: SWE-Bench Pro 56.6 (Ring 53.9, MiniMax 56.2). SWE-Bench Multilingual 72.4, tied with Step-3.7-Flash, below MiniMax 76.5. Terminal-Bench 2.1 57.0, below Deepseek-V4-Flash 62.0 and Claude-Sonnet-4.6 71.2. AIME26 93.2, below Ring 95.8, MiniMax 94.2, Step 95.0, Deepseek 96.5. MCP-Atlas 65.5, below Deepseek 69.0. SkillsBench 44.8, below Deepseek 53.5. IFBench 74.5, below MiniMax 75.7 and Deepseek 79.2.

抽几格, Ling-3.0-flash 在前: SWE-Bench Pro 56.6 (Ring 53.9, MiniMax 56.2). SWE-Bench Multilingual 72.4, 和 Step-3.7-Flash 打平, 低于 MiniMax 76.5. Terminal-Bench 2.1 57.0, 低于 Deepseek-V4-Flash 62.0 和 Claude-Sonnet-4.6 71.2. AIME26 93.2, 低于 Ring 95.8, MiniMax 94.2, Step 95.0, Deepseek 96.5. MCP-Atlas 65.5, 低于 Deepseek 69.0. SkillsBench 44.8, 低于 Deepseek 53.5. IFBench 74.5, 低于 MiniMax 75.7 和 Deepseek 79.2.

> **对一下:** 组件上的 56.6, 93.2, 72.4 和这张表是同一格吗? HLE 的 22.7 在表里吗?
> 前三个对得上: SWE-Bench Pro 56.6, AIME26 93.2, SWE-Bench Multilingual 72.4. HMMT Feb 2026 的 87 在组件上, 这张表的前几组里没有同名行. HLE 22.7 只出现在第 2 页组件, 大表里没有这一行.

<!-- page 8 of 13 -->

Thinking mode is enabled by default. The recommended line prints temperature as "0. 6", top_p as "0. 95", top_k as 20. SWE-Bench is described as OpenHands with a 256K window. Terminal-Bench 2.1 is described as the Terminus 2 harness, a **2-hour** timeout, and 3 runs. The harness steps are not transcribed.

思考模式默认打开. 推荐参数把 temperature 印成 「0. 6」, top_p 印成 「0. 95」, top_k 是 20. SWE-Bench 写成用 OpenHands, 窗口 256K. Terminal-Bench 2.1 写成 Terminus 2, 超时 2 小时, 3 次取平均. 具体步骤不转写.

> **确认:** 合集的 20 items, 和模型树的 4 个微调, 44 个量化, 是同一份名单吗?
> 不是. 20 写在 Ling 3.0 Collection. 4 和 44 写在 Ling-3.0-flash 的模型树, 一个是微调衍生, 一个是量化衍生. Space 另是 21. 四套计数没有互相对齐的名单.

> **再看:** 「0. 6」 和 0.6 是两个推荐值吗?
> 不是. 小数点后面多了一个空格, top_p 的 「0. 95」 是同一种拆法. 思考模式默认打开仍是 TestingTime. 256K 是这一段评测用的窗口.

<!-- page 9 of 13 -->

![Image block](images/p09-browsecomp-single-agent-evaluated-using-a-resume.png)

(图: 文件名取自后文 BrowseComp 那句.)

BrowseComp is described with a 64K threshold for the single-agent setting and 128K / 64K windows for the multi-agent setting. The table cell is 72.2 (w/ ctx) and 82.0 (MA). The resume steps are not transcribed.

BrowseComp 单智能体设定里有一个 64K 阈值, 多智能体设定的窗口写成 128K 和 64K. 表上这一格是 72.2 (w/ ctx) 和 82.0 (MA). 摘要和续跑的步骤不转写.

The deployment section names a cookbook URL, the image `lmsysorg/sglang:dev-Ling-3.0-flash`, 4 GPUs of the H20-3e class or 4-GPU Blackwell, context length 262144, and **--tp 8** on 80GB cards. The shell listings are not copied.

部署段点了 cookbook 链接, 镜像名 `lmsysorg/sglang:dev-Ling-3.0-flash`, 4 张 H20-3e 级别的 GPU 或 4 卡 Blackwell, 上下文长度 262144, 以及 80GB 卡上的 **--tp 8**. 命令行不抄.

<!-- page 10 of 13 -->

The command block continues. It is not transcribed. The printed context length on this page is 262144, the same number as 256×1024.

命令块还在继续, 不转写. 这一页印出的上下文长度是 262144, 和 256×1024 是同一个数.

> **回看:** 262144 和第 5 页日程末尾的 256K 是两个窗口吗?
> 不是. 256×1024 等于 262144. 日程写的是训练时从 8K 到 32K 再到 256K. 部署段写的是服务时的上下文长度 262144. 数字对得上, 一个是训练日程, 一个是服务配置.

<!-- page 11 of 13 -->

Another example says 4 GPUs and a port variable. The flags are not copied.

另一段示例写 4 张 GPU 和一个端口变量. 开关不抄.

<!-- page 12 of 13 -->

A training-content summary is linked as a PDF under inclusionAI/AI-Transparency, named Ling-3.0-LLM_TDS-Summary.pdf. This card does not paste that PDF's numbers.

训练内容摘要链到 inclusionAI/AI-Transparency 下的一份 PDF, 文件名是 Ling-3.0-LLM_TDS-Summary.pdf. 这份卡没有把那份 PDF 里的数字贴进来.

<!-- page 13 of 13 -->

![Image block](images/p13-image.png)

(图: 页脚图.)
