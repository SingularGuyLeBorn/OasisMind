---
title: "MiniCPM5-1B 模型卡分析"
category: "模型库"
tags: ["MiniCPM", "技术解析"]
published: true
excerpt: "页面给的信息集中在三块：规格表，一张 19 行的评测表，一段训练流程加四张图。剩下一半篇幅是启动命令和部署表。"
---
源文是一张模型卡，正文约 15 页，一半是命令和部署表。

# MiniCPM5-1B 模型卡分析

- 来源：Hugging Face 上 openbmb/MiniCPM5-1B 的模型卡，打印成 15 页，11 张图。这不是技术报告，页面引用的论文是 MiniCPM4。
- 规格：标准 LlamaForCausalLM，参数 1,080,632,832，非嵌入 679,552,512, 24 层，GQA 16 个 Q 头配 2 个 KV 头，上下文 131,072。
- 评测：19 项，四个模型都开 Thinking. MiniCPM5-1B 平均 42.57, 14 项第一，5 项不是第一。
- 训练：预训练印出 200B，75B，25B 三段衰减，中期训练 200B，SFT 两段各 200B，然后是 RL 教师加 OPD。
- 部署：8 个推理后端，5 个微调框架，工具调用推荐 SGLang。

页面给的信息集中在三块：规格表，一张 19 行的评测表，一段训练流程加四张图。剩下一半篇幅是启动命令和部署表。

下面按这三块展开，每一处数字都能在对照稿里找到对应页。自己算出来的数会标明是算的。

**目录**

- 1. 这一页是什么
  - 模型卡和技术报告
  - 页面自带的生态数字
- 2. 规格表能读出什么
  - 参数和非嵌入参数
  - GQA 和上下文长度
- 3. 评测表的平均分
  - 19 项简单平均
  - 分组的转写错误
- 4. 赢的行和没赢的行
  - 14 项第一
  - 智能体组的来源
- 5. 训练流程里印出来的 token 数
  - 预训练与中期训练
  - 两段 SFT
- 6. 两阶段推理 RL
  - 长度上限
  - 截断率与准确率
- 7. OPD 的做法
  - 反向 KL 当优势
  - 教师和数据
- 8. 两个汇总数字
  - 16 分
  - 29 个百分点
- 9. 思考模式和采样
- 10. 部署，工具调用与微调
- 11. 页面没有回答的问题

## 1. 这一页是什么

目录名是 minicpm5，源文是 Hugging Face 的模型卡页面。第 3 页的 「MiniCPM Tech Report」 链接指向 arXiv 2506.07900，第 2 页的论文列表写明这个编号是 「MiniCPM4: Ultra-Efficient LLMs on End Devices」。第 15 页的引用条目键名也是 minicpm4。页面挂了四篇论文：在线策略蒸馏的再思考（2604.13016），分层数据管理（2602.09003），JustRL (2512.16649), MiniCPM4 (2506.07900)。没有一篇标题写着 MiniCPM5。所以这份材料里关于 MiniCPM5-1B 的架构只有规格表那七行，其余细节不能从这里推。

页面自带一些生态数字。点赞 1.15k，OpenBMB 组织关注 5.36k，上个月下载 571,606。模型树里适配器 59 个，微调 56 个，量化 99 个。使用它的 Space 有 100 个，页面展示 5 个，其余折成 「+ 95 Spaces」。标签写 「4 datasets」，第 2 页只列出 Ultra-FineWeb，UltraData-Math，Ultra-FineWeb-L3 三个。第四个是哪个，页面没有交代；第 7 页提到的 SFT 数据 UltraData-SFT-2605 不在这张列表里。

侧栏的 「Model size」 写 1B params，张量类型 BF16. Inference Providers 一栏写还没有提供方部署，请求支持的讨论有 11 个。这些数字随抓取时间变化，只能说明打印那一刻的状态。

## 2. 规格表能读出什么

规格表给了七项：因果语言模型，标准 LlamaForCausalLM，参数 1,080,632,832，非嵌入参数 679,552,512, 24 层，GQA 的 16 个 Q 头和 2 个 KV 头，上下文 131,072。页面强调它是稠密模型，没有自定义 kernel，也没有分叉的模型代码，主流推理引擎直接加载。隐藏维度，词表大小，FFN 宽度，位置编码参数，是否共享输入输出嵌入，这些都没有印。这里不补。

两个参数数相减：1,080,632,832 减 679,552,512 等于 401,080,320。这部分约占总参数的 37.1%，非嵌入部分约占 62.9%。按字段名，这 4 亿出头的参数属于嵌入。对一个 1B 模型来说这个比例不小，说明词表相关的参数在小模型里占了很大一块。页面没有拆开这 401,080,320 是输入嵌入，输出头，还是两者之和，所以没法反推词表或隐藏维度。

GQA 这一行是 16 比 2，每个 KV 头被 8 个 Q 头共享。在头维度相同的前提下，和 16 个 KV 头的多头注意力相比，每层要缓存的 K 和 V 是八分之一。这是从头数直接算的比例，页面没有给头维度，也没有给具体的缓存字节数。

上下文 131,072 等于 128 乘 1024。第 7 页流程图里预训练最后一段叫 Long Decay (128K)，名字和规格表的长度对得上。训练里另外两个长度 30,720 和 38,912 是 RL 阶段的回答上限，放在第 6 节说。

## 3. 评测表的平均分

评测表有 19 个评测项，分七组：通用知识，领域知识，代码，指令遵循，数学推理，逻辑推理，智能体。对照模型是 Qwen3-0.6B，Qwen3.5-0.8B，LFM2.5-1.2B，四个模型都是 Thinking 模式。表上平均分 MiniCPM5-1B 42.57, LFM2.5-1.2B 35.61, Qwen3-0.6B 26.77, Qwen3.5-0.8B 25.14。

把 19 项逐列相加再除以 19: MiniCPM5-1B 得 42.571，LFM2.5-1.2B 得 35.606，Qwen3-0.6B 得 26.765，四舍五入都和表上一致，说明平均分就是 19 项的简单平均，没有按组加权。Qwen3.5-0.8B 一列 19 项之和是 477.96，平均 25.156，表上印的是 25.14，差 0.02。这个差很小，不改变排序，但它说明这一列的平均分和单项之间有一处对不齐，页面没有解释。

MinerU 转出来的 HTML 表格有一处分组错了。HTML 里 Coding & Programming 跨四行，把 IFBench 也包了进去，Instruction Following 只剩三行。看渲染页，Coding & Programming 的组名居中在 OJBench，对应三行；Instruction Following 的组名居中在 IFEval 和 Multi-IF 之间，对应 IFBench 到 MultiChallenge 四行。第 8 页的涨分图也把 IFBench 放在 Instruction Following 下面。对照稿的表按渲染页分组。

## 4. 赢的行和没赢的行

逐行比较，MiniCPM5-1B 在 14 项上是第一：MMLU-Pro, MMLU-Redux, SuperGPQA, LCB-Pro 25Q2 (Easy), OJBench, LCB-v6, IFBench, AIME-2025, AIME-2026, HMMT Feb 2026, MATH-500, BBH, BBEH, τ²-Bench Telecom-AA。渲染页上这 14 格正好是深蓝底色。没拿第一的 5 项：GPQA-Diamond 26.26，排第三，LFM2.5 是 34.85；IFEval 80.41，排第二，LFM2.5 是 84.84；Multi-IF 43.54，排第二，LFM2.5 是 55.61；MultiChallenge 19.48，排第三，Qwen3.5-0.8B 是 23.97；BFCLv4 25.15，排第三，Qwen3.5-0.8B 是 25.53。下划线标在 IFEval 和 Multi-IF 上，这两项正好都是第二。页面没有写图例，深蓝和下划线的含义是从数字对出来的。

代码和数学几项差距最大。LCB-Pro 25Q2 (Easy) 22.68 对 LFM2.5 的 6.19，Qwen3.5-0.8B 是 0.00. AIME-2025 40.42 对 31.88，HMMT Feb 2026 25.76 对 21.21。知识类差距小，MMLU-Pro 48.85 对 47.98，SuperGPQA 23.14 对 22.92，几乎打平。雷达图没有印数值，它的形状和表格一致：领域知识和指令遵循两轴紫色的 LFM2.5 更靠外，其余五轴蓝色顶到外圈。

亮点里说优势最明显的是智能体工具调用。智能体组两项里，BFCLv4 上 MiniCPM5-1B 反而排第三，三个模型都在 25 分附近。领先来自 τ²-Bench Telecom-AA: 79.53，第二名 Qwen3.5-0.8B 是 47.70，高出 31.83。去掉这一项重算 18 项平均，MiniCPM5-1B 40.52，LFM2.5-1.2B 36.50，差距从 6.96 缩到 4.02。所以 「工具调用最强」 这句话主要落在 τ²-Bench 一项上，BFCLv4 并不支持它。

AIME-2025 和 AIME-2026 两行都是 40.42。第 8 页的涨分图显示两者的 SFT 起点不同，一个 17.3，一个 15.6，增量一个 23.1，一个 24.8，终点都落在 40.4。两年题目不同，分数相同属于巧合，页面没有评论。

## 5. 训练流程里印出来的 token 数

正文把训练分三段：基础训练，中期训练，后训练，并称之为 UltraData 分层数据管理的全链路实践。基础训练分稳定训练和衰减训练。第 7 页流程图把衰减拆成三格：Short Decay (4K) 200B token, Long Decay (32K) 75B token, Long Decay (128K) 25B token。括号里的 4K，32K，128K 看起来是各段的序列长度，长度越长，用的 token 越少。Stable Training 一格没有印 token 数。中期训练印的是 200B token。预训练语料以 Ultra-FineWeb，Ultra-FineWeb-L3，UltraData-Math 三个数据集放出。

能加起来的只有这几格：200B，75B，25B，200B，合计 500B. 稳定训练的量不知道，所以整个预训练用了多少 token 算不出来。流程图的第一段输出叫 MiniCPM5-1B-Base，对应模型列表里 「pre-training only」 的 Base 版。

后训练的 SFT 分两段：深度思考 SFT 200B token，混合思考 SFT 200B token，合计 400B. 正文说这两段用来建立深度思考，混合思考和日常对话能力，数据以 UltraData-SFT-2605 放出。两段之后得到 MiniCPM5-1B-SFT，对应模型列表里 「SFT-only checkpoint (before RL / OPD)」 那一版。这里的 400B 是训练数据量，和参数量 1,080,632,832 不是一类数。

混合思考 SFT 和后面的对话模板是一条线。模型卡说同一个 checkpoint 有 Think 和 No Think 两种模式，用 `enable_thinking` 切换。流程图里 SFT 先深后混，混合这一段应当就是让模型学会在两种模式间切换，页面没有把这层关系写成一句话。

## 6. 两阶段推理 RL

推理 RL 基于 DAPO-Math-17k，思路来自 JustRL 的极简配方，采用两阶段长度调度。第 8 页的 Response Length Control 图给出两个长度上限：第一段 30,720，第二段 38,912。两个数分别是 30 乘 1024 和 38 乘 1024。第二段上限约是上下文 131,072 的 29.7%。流程图里 Reasoning RL 1 的副标题是 Repetition Penalty，Reasoning RL 2 的副标题是 Reasoning Accuracy。

同一张图画了截断率。第一段的蓝线从约 0.9 起步，到第 300 步降到 0.2 以下。第二段换成更大的上限，紫线从约 0.05 开始，到第 650 步前后慢慢升到 0.2 左右。读法是：第一段在较紧的上限下把回答压短，第二段放宽上限，截断率先大幅下降，然后随训练回升。

旁边的 AIME 2026 Accuracy 图给出 pass@1。第一段从约 0.16 升到约 0.36，第二段在约 0.35 到 0.40 之间。第二段准确率的提升比第一段平缓得多。页面对这两段各自贡献多少没有给数字表，只有曲线。

RL 除了推理还有几路信号：闭卷问答用 TriviaQA 和 NQ-Open，写作用 LongWriter-Zero-RLData，另有合成的可验证 RLVR 数据和成对的 RLHF 信号。正文说这些用来提高可靠性，指令遵循和使用体验。流程图里对应的教师框是 RLHF, IF RL, General RL, Long Context RL。

## 7. OPD 的做法

OPD 的出发点是 Thinking Machines Lab 的在线策略蒸馏，并吸收了 2604.13016 那篇论文的实现改进。具体做法有三点。第一，在 RL 框架里把优势估计换成反向 KL 散度，替掉原来基于验证结果的优势。第二，在回答的每个位置，学生和教师各取 top-k logits，在两组 token 的并集上算反向 KL，用来在信号准确度和训练效率之间取平衡。第三，蒸馏数据直接复用训练各个 RL 教师时的领域内提示，不另外整理数据。

top-k 的 k 取多少，页面没有写。并集的意思是学生和教师各自概率最高的若干个 token 放在一起算，这样既不用在整个词表上算 KL，也不会漏掉只在一方排前面的 token。这是按句子字面的理解，具体实现要看引用的那篇论文。

正文说 RL 教师覆盖数学，代码，闭卷问答，写作等方向；流程图里的教师框是 Reasoning RL 2，RLHF，IF RL，General RL，Long Context RL 五个，学生是 MiniCPM5-1B-SFT。两边的列表对不上：图里没有单独的代码或写作框，正文也没有提 Long Context RL 这个名字（只在 RL 信号里提到长上下文理解）。还有一处命名不一致：流程图写的是 Online Policy Distillation，正文写的是 On-Policy Distillation，缩写都是 OPD。

从模型列表看，SFT 版和最终版都放出来了。最终版标注 「post-trained with RL + OPD」，所以用户能拿 SFT 版和最终版直接比，这也是第 8, 9 页两张对比图的两根柱子。

## 8. 两个汇总数字

正文说在数学，代码，指令遵循任务上，RL + OPD 让平均分提高 16 分。第 8 页的涨分图有八项增量：23.1, 24.8, 13.8, 13.0, 12.4, 12.2, 13.0, 15.1。加起来 127.4，除以 8 得 15.9，取整是 16。用柱顶算也一样：SFT 八项平均 25.76，最终八项平均 41.68，差 15.91。图上八个终点分数和第 6 页表格四舍五入后一致。这个数对得上。

正文还说撞到 max-tokens 上限的回答比例下降 29 个百分点。第 9 页的 Overlong Response Rate Drop 图有八项降幅：32.7, 30.4, 40.5, 29.0, 34.0, 1.9, 13.1, 0.7。八项平均 22.8。只算数学和代码五项得 33.3，只算数学三项得 34.5。八项的中位数是 29.0 和 30.4 之间的 29.7。恰好等于 29.0 的只有 LCB-v6 一项。正文没有说明 29 这个数怎么来的，用同一句话里 「平均分提高 16 分」 的算法去算，得到的是 22.8，不是 29。

降幅在三组之间差别很大。数学和代码五项的 SFT 截断率都在 37% 到 51% 之间，RL + OPD 之后降到 7% 到 17%。指令遵循三项的 SFT 起点本来就低，IFEval 3.7，Multi-IF 1.3，降幅也就只有 1.9 和 0.7. IFBench 是例外，从 20.5 降到 7.4。

## 9. 思考模式和采样

推荐采样分两档。Think 模式 temperature 0.9, top_p 0.95, `enable_thinking=True`. No Think 模式 temperature 0.7, top_p 0.95, `enable_thinking=False`。评测表四个模型都是 Thinking 模式，所以第 6 页的分数对应的是 Think 这一档，No Think 模式的分数页面没有给。

快速开始里的例子都偏向 No Think. vLLM 和 SGLang 的 curl 请求用 `temperature` 0.7，`max_tokens` 128；Transformers 例子在套模板时显式传了 `enable_thinking=False`，生成 `max_new_tokens=128`。两段 curl 都没有传 `enable_thinking`，服务端在不传参数时默认走哪种模式，页面没有写。

版本要求也印在命令里：vLLM 0.21 及以上，sglang[srt] 0.5.12 及以上，transformers 5.6 及以上。vLLM 示例端口 8000，SGLang 的启动命令在 `--port` 后被页边截断，从它的 curl 地址看是 30000. Transformers 例子里 `torch_dtype` 和 `device_map` 都设成 「auto」。

## 10. 部署，工具调用与微调

工具调用推荐 SGLang。模型输出 XML 风格的工具调用，SGLang 内置的 `minicpm5` 解析器把它转成 OpenAI 兼容的 `tool_calls`，启动时加 `--tool-call-parser minicpm5`，也可以写 `--tool-call-parser auto`。部署表里 SGLang 一行也注明 「recommended for tool calling」。其他后端能不能解析这种 XML 输出，页面没有说。

部署表列了八个后端：Transformers，vLLM，SGLang 用 BF16 或 FP16；llama.cpp，Ollama，LM Studio，ArcLight 用 GGUF；MLX 用 4bit，跑在 Apple Silicon 上。每个后端配一份单页教程和一个 Agent Skill，命名规则是 minicpm5-deploy 加后端名。微调表五个框架：TRL + PEFT（LoRA 或 SFT），LLaMA-Factory，ms-swift，unsloth，xtuner，Agent Skill 的命名是 minicpm5-finetune 加框架名。模型用标准 Llama 结构，这是这些框架能直接接上的前提。

另外两块是 FlagOS 和桌宠。FlagOS 是北京智源研究院联合多方发起的开源社区，做面向各类 AI 芯片的统一系统软件栈，页面说 MiniCPM5-1B 被它支持，可以多芯片部署，具体用法那一行在打印稿里是折叠的。桌宠 MiniCPM-Desk-Pet 由 MiniCPM5-1B 本地驱动，支持 Apple Silicon，NVIDIA GPU，CPU，能配合 Cursor，Claude Code，Codex，还能用 LoRA 切换人设。

## 11. 页面没有回答的问题

这份模型卡留下几处空白。架构层面，除了层数，头数和上下文，其余维度都没给，401,080,320 个嵌入相关参数怎么分布也没说。训练层面，稳定训练的 token 数缺失，top-k 的 k 没有写，流程图的五个教师框和正文列出的方向对不上。

数字层面有两处对不齐：Qwen3.5-0.8B 的平均分按 19 项算是 25.16，表上印 25.14；超长回答的降幅按八项平均是 22.8，正文写 29。标签写 4 个数据集，列表只有 3 个。这些都不影响 MiniCPM5-1B 在这组对照里平均分第一的结论，但引用具体数字时要注明出处和算法。另外，这份材料只和三个同尺寸模型比，对照集合之外的情况页面没有给。
