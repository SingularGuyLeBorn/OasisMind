---
title: "Ling 2.5 · 对照译稿"
category: "模型库"
tags: ["Ling", "对照译稿"]
published: true
excerpt: "Ling 2.5 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 12 -->

[Text Generation](https://huggingface.co/models?pipeline_tag=text-generation)

[Safetensors](https://huggingface.co/models?library=safetensors)

[bailing\_hybrid](https://huggingface.co/models?other=bailing_hybrid)

[conversational](https://huggingface.co/models?other=conversational)

[custom\_code](https://huggingface.co/models?other=custom_code)

页面顶部的五个标签: 文本生成, Safetensors 权重格式, bailing_hybrid, 对话, 自定义代码. 每个标签都链到 Hugging Face 上按这个标签筛选的模型列表.

License: mit

许可证: MIT.

Deploy

Copy to bucket **NEW**

Use this model

三个页面按钮: 部署, 复制到 bucket (旁边标着 **NEW**), 使用这个模型.

[**Model card**](https://huggingface.co/inclusionAI/Ling-2.5-1T)

Community

两个标签页: 模型卡片 (链到 inclusionAI/Ling-2.5-1T) 和社区.

Tensor type

![Image block](images/p01-bf16-f32.png)

(图: 本目录只有 ling-2-5.md, 没有 images 文件夹, 这张图打不开. 抽取工具把它标成 Image block, 文件名取自紧跟的文字 「BF16 · F32」.)

BF16 · F32

张量类型: BF16 和 F32.

> **再看:** 这张 p01-bf16-f32.png 是正文配图, 还是页面界面上的一块?
> 更像界面. 它夹在 「Tensor type」 和 「BF16 · F32」 之间, 位置是 Hugging Face 模型页侧栏的文件信息区, 同一区还有 Chat template 和 Files info 两个入口. 抽取工具给它的标签是 Image block, 不是后面那些评测图用的 Chart block. 图文件不在目录里, 只能凭位置和文件名判断: 它展示的是权重的张量类型, 不是模型结构, 也不是评测结果. BF16 和 F32 各占多少, 页面没有给数字.

<u>Chat template</u>

<u>Files info</u>

对话模板, 文件信息. 两个都是侧栏里的入口.

[Text Generation](https://huggingface.co/tasks/text-generation)

This model isn't deployed by any Inference Provider.

[🙋 2 Ask for provider support](https://huggingface.co/spaces/huggingface/InferenceSupport/discussions/8416)

任务类型: 文本生成. 目前没有任何推理服务商部署这个模型. 下面的链接是 「请求服务商支持」 的讨论帖, 前面的数字是 2.

**Spaces using inclusionAI/Ling-2.5-1T** 3

[🦉 cafe3310/ling-open-studio](https://huggingface.co/spaces/cafe3310/ling-open-studio)

[🐨 Kalki2613/my-chatgpt](https://huggingface.co/spaces/Kalki2613/my-chatgpt)

imspsycho/ling-open-studio

**使用 inclusionAI/Ling-2.5-1T 的 Spaces** 共 3 个: cafe3310/ling-open-studio, Kalki2613/my-chatgpt, imspsycho/ling-open-studio. 第三个在抓取里没有链接.

## 品 Collection including inclusionAI/Ling-2.5-1T (收录 inclusionAI/Ling-2.5-1T 的合集)

## [Ling 2.5 Collection](https://huggingface.co/collections/inclusionAI/ling-25) (Ling 2.5 合集)

[The newest flagship non-reasoning mode… • 1 item • Updated 24 days ago • 11](https://huggingface.co/collections/inclusionAI/ling-25)

合集卡片: 最新的旗舰非推理模式... (简介在这里被截断), 1 个条目, 24 天前更新, 最后一个数字是 11. 标题前的 「品」 是抽取工具把图标识别成的字.

> **问:** 这个 「合集」 里到底有哪些模型?
> 只有一个. 合集卡片写 「1 item」, 链接是 collections/inclusionAI/ling-25. 卡片没列条目名, 但它挂在 「Collection including inclusionAI/Ling-2.5-1T」 下面, 说明这 1 个条目就是 Ling-2.5-1T. 第 4 页下载表也只有 Ling-2.5-1T 一行. 所以这 12 页的主体是 Ling-2.5-1T 的模型卡片, 合集只占第 1 页末尾一个小框. 后文出现的 Ling-2.0-1T, Ling-1T, Ringflash-linear-2.0, Ling-2.5-1T-base 是前代, 技术路线或中间产物, 页面没说它们在这个合集里. 末尾的 11 没有单位, 页面没写它是点赞数还是别的计数.

<!-- page 2 of 12 -->

ModelScope

ModelScope (页面上的一个链接文字, 指魔搭平台).

![Chart block](images/p02-ling-2-5-1t-inclusive-intelligence-instant-impact.png)

(图: 图文件不在本目录. 抽取工具标为 Chart block, 文件名取自紧跟的标语. 它排在正文最前面, 从位置看是发布头图, 画面内容无法核对.)

**Ling-2.5-1T, Inclusive Intelligence, Instant Impact.**

**Ling-2.5-1T: 普惠的智能, 即时的影响.**

Today, we launch Ling-2.5-1T and make it open source.

今天我们发布 Ling-2.5-1T, 并将它开源.

Thinking models raise the ceiling of intelligence, while instant models expand its reach by balancing efficiency and performance—making AGI not only more powerful, but also more accessible. As the latest flagship instant model in the Ling family, Ling-2.5-1T delivers comprehensive upgrades across model architecture, token efficiency, and preference alignment, designed to bring universally accessible AI to a new level of quality.

思考模型抬高智能的上限, instant 模型则在效率和性能之间取平衡, 扩大智能的覆盖面, 让 AGI 不只更强, 也更容易用上. 作为 Ling 家族最新的旗舰 instant 模型, Ling-2.5-1T 在模型架构, token 效率和偏好对齐三方面全面升级, 目标是把人人可用的 AI 提到新的质量水平.

Ling-2.5-1T features 1T total parameters (with 63B active parameters). Its pre-training corpus has expanded from 20T to 29T tokens compared to the previous generation. Leveraging an efficient hybrid linear attention architecture and refined data strategy, the model delivers exceptionally high throughput while processing context lengths of up to 1M tokens.

Ling-2.5-1T 总参数 1T, 激活参数 63B. 和上一代相比, 预训练语料从 20T token 扩到 29T token. 借助高效的混合线性注意力架构和改进的数据策略, 模型在处理最长 1M token 的上下文时仍有很高的吞吐.

> **核对:** 1T 总参数和 63B 激活参数, 是这一页自己印的吗?
> 是. 原文就是 「1T total parameters (with 63B active parameters)」. 第 5 页又说改造后激活参数从 51B 升到 63B, 两处的 63B 一致. 1T 除了这句, 只出现在模型名 Ling-2.5-1T, Ling-2.0-1T 和 「trillion-scale」 这个说法里, 页面没有给更精确的值. 页面也没说是什么结构让激活量小于总量: 全文没有 expert, routing 这类词, 也没给层数, 隐藏维, 头数和词表大小. 这些只能空着, 不能拿 Ling 2.0 技术报告里的配置来补.

> **拆开:** 「from 20T to 29T」 里, 20T 和 29T 各指什么, 多出来的 9T 在哪里?
> 20T 是上一代的预训练语料量, 29T 是 Ling-2.5-1T 的. 第 6 页写架构升级之后, 用 9T 高质量 token 在 Ling-2.5-1T-base 上继续预训练, 29 减 20 正好是 9. 页面没有明说 「29T 等于 20T 加 9T」, 只是数字对得上. 如果这样读, Ling 2.5 不是从头训练, 而是在上一代的 20T 之后再训了 9T, 这和第 4 页 「Through incremental training」 的说法一致. 这 9T 的数据成分, 配比和学习率, 页面都没给.

By introducing a composite reward mechanism combining "Correctness" and "Process Redundancy", Ling-2.5-1T further pushes the frontier of efficiencyperformance balance in instant models. At comparable token efficiency levels, Ling-2.5-1T’s reasoning capabilities significantly outperform its predecessor, approaching the level of frontier "thinking models" that typically consume \~4x the output tokens.

Ling-2.5-1T 引入把 「Correctness」 (正确性) 和 「Process Redundancy」 (过程冗余) 结合起来的复合奖励机制, 把 instant 模型在效率与性能之间的平衡又往前推了一步. 在相近的 token 效率下, Ling-2.5-1T 的推理能力明显强于前代, 接近那些通常要消耗约 4 倍输出 token 的前沿 「thinking models」.

> **停一下:** 「~4x the output tokens」 这个倍数, 页面上有出处吗?
> 没有. 这句只说前沿 thinking models 通常消耗约 4 倍的输出 token, 没点名是哪些模型, 也没有图或表给出 Ling-2.5-1T 自己的平均输出长度. 第 3 页评测表里没有输出长度这一列. 「At comparable token efficiency levels」 比的是前代, 前代的输出 token 数同样没印. 复合奖励里 「Correctness」 和 「Process Redundancy」 两项怎么加权, 冗余怎么度量, 页面也没写. 这一段只能当作厂商的定性说法.

Through refined alignment strategies—such as bidirectional RL feedback and Agent-based instruction constraint verification—Ling-2.5-1T achieves substantial

通过更精细的对齐策略, 比如双向 RL 反馈, 以及基于 Agent 的指令约束校验, Ling-2.5-1T 取得了明显的

<!-- page 3 of 12 -->

improvements over the previous generation in preference alignment tasks, including creative writing and instruction following.

(接上页) 进步: 在创意写作, 指令遵循等偏好对齐任务上, 比上一代好了很多.

Trained with Agentic RL in large-scale high-fidelity interactive environments, Ling-2.5-1T is compatible with mainstream agent platforms such as Claude Code, OpenCode, and OpenClaw. It achieves leading open-source performance on the general tool-calling benchmark, BFCL-V4.

Ling-2.5-1T 在大规模, 高保真的交互环境里用 Agentic RL 训练, 兼容 Claude Code, OpenCode, OpenClaw 等主流 agent 平台. 在通用工具调用基准 BFCL-V4 上, 它取得了开源模型中领先的成绩.

## Evaluation (评测)

We have conducted a comprehensive evaluation of Ling-2.5-1T across multiple authoritative benchmarks, covering domains such as knowledge, reasoning, agentic performance, instruction following, and long-context processing. Compared to its predecessor, Ling-1T, Ling-2.5-1T delivers a holistic upgrade in capabilities, standing as the most powerful instant model in the Ling family to date. Furthermore, when compared to mainstream models—including DeepSeek V3.2, Kimi K2.5, and GPT 5.2— Ling-2.5-1T demonstrates a distinct performance advantage in complex reasoning and instruction-following.

我们在多个权威基准上全面评测了 Ling-2.5-1T, 覆盖知识, 推理, agent 能力, 指令遵循和长上下文处理等领域. 和前代 Ling-1T 相比, Ling-2.5-1T 的能力整体升级, 是 Ling 家族迄今最强的 instant 模型. 此外, 和 DeepSeek V3.2, Kimi K2.5, GPT 5.2 等主流模型相比, Ling-2.5-1T 在复杂推理和指令遵循上有明显的性能优势.

<table><tr><td></td><td>Benchmark</td><td>Evaluation Config</td><td>Ling-2.5-1T</td><td>Ling-2.0-1T</td><td>DeepSeek-V3.2-nothink</td><td>Kimi-K2.5-Instant</td><td>GPT-5.2-chat</td></tr><tr><td rowspan="5">Knowledge</td><td>C-SimpleQA</td><td>Acc</td><td>78.97</td><td>64.60</td><td>68.37</td><td>76.80</td><td>67.77</td></tr><tr><td>SimpleQA_Verified</td><td>Acc</td><td>37.40</td><td>19.3</td><td>23.70</td><td>25.40</td><td>29.90</td></tr><tr><td>GPQA Diamond</td><td>EM-COT</td><td>75.57</td><td>73.48</td><td>77.11</td><td>80.52</td><td>77.15</td></tr><tr><td>SuperGPQA</td><td>Mean@4</td><td>60.34</td><td>57.22</td><td>61.37</td><td>66.40</td><td>60.59</td></tr><tr><td>Humanities_Last_Exam</td><td>Mean@4</td><td>11.33</td><td>6.92</td><td>10.47</td><td>12.92</td><td>8.62</td></tr><tr><td rowspan="6">Reasoning</td><td>livecodebench (2408-2505)</td><td>Mean@4</td><td>68.17</td><td>62.28</td><td>57.71</td><td>73.40</td><td>67.51</td></tr><tr><td>AIME26(32K)</td><td>Mean@64-COT</td><td>87.08</td><td>75.16</td><td>66.41</td><td>66.98</td><td>66.20</td></tr><tr><td>HMMT-Nov25</td><td>Mean@64-COT</td><td>80.21</td><td>66.46</td><td>53.44</td><td>61.20</td><td>53.18</td></tr><tr><td>IMO-AnswerBench</td><td>Mean@8-COT</td><td>62.31</td><td>54.81</td><td>46.66</td><td>52.56</td><td>43.41</td></tr><tr><td>ARCPrize</td><td>Mean@4</td><td>47.25</td><td>43.19</td><td>20.06</td><td>31.19</td><td>24.19</td></tr><tr><td>bbeh</td><td>EM-COT</td><td>51.99</td><td>47.25</td><td>48.04</td><td>48.43</td><td>43.12</td></tr><tr><td rowspan="3">Agentic</td><td>BFCL-v4(FC)</td><td>Overall Acc</td><td>69.87</td><td>45.99</td><td>60.05</td><td>62.96</td><td>63.05</td></tr><tr><td>tau2-bench</td><td>Mean@4 user_model gpt-4.1</td><td>59.78</td><td>34.58</td><td>68.10</td><td>62.94</td><td>56.47</td></tr><tr><td>terminal-bench 2.0</td><td>Acc</td><td>31.46</td><td>8.99</td><td>29.21</td><td>48.30</td><td>23.60</td></tr><tr><td rowspan="3">Instruction Following</td><td>LIFEBench</td><td>Length-Score</td><td>57.90</td><td>42.30</td><td>55.50</td><td>54.90</td><td>61.70</td></tr><tr><td>IFBench</td><td>Mean@5</td><td>46.67</td><td>36.00</td><td>50.00</td><td>42.53</td><td>71.47</td></tr><tr><td>Multi-IF</td><td>Acc@Turn_3</td><td>77.18</td><td>69.93</td><td>69.81</td><td>78.20</td><td>75.97</td></tr><tr><td rowspan="2">LongText</td><td>LongBenchV2</td><td>Acc</td><td>53.68</td><td>50.30</td><td>51.89</td><td>59.64</td><td>52.88</td></tr><tr><td>MRCR(16K-256K)</td><td>Acc</td><td>66.80</td><td>52.35</td><td>30.50</td><td>63.22</td><td>77.93</td></tr><tr><td rowspan="2">Alignment</td><td>Arena-Hard-V2</td><td>win-rate judge_model gemini-2.5-pro</td><td>77.92</td><td>74.85</td><td>71.04</td><td>78.66</td><td>72.54</td></tr><tr><td>MultiChallenge</td><td>Acc</td><td>52.01</td><td>54.95</td><td>43.59</td><td>53.11</td><td>51.28</td></tr></table>

(表: 前三列是能力组, 基准名, 评测配置, 后五列依次是 Ling-2.5-1T, Ling-2.0-1T, DeepSeek-V3.2-nothink, Kimi-K2.5-Instant, GPT-5.2-chat 的得分. 能力组六个: Knowledge 知识 5 行, Reasoning 推理 6 行, Agentic 智能体 3 行, Instruction Following 指令遵循 3 行, LongText 长文本 2 行, Alignment 对齐 2 行, 共 21 行. 评测配置一栏: Acc 是准确率, Mean@k 一般指 k 次采样取平均, 带 -COT 的表示答题时带 CoT, EM 是精确匹配, Acc@Turn_3 是第 3 轮的准确率, Length-Score 是长度得分. tau2-bench 的用户模拟模型是 gpt-4.1, Arena-Hard-V2 是胜率, 评审模型是 gemini-2.5-pro.)

> **看表:** 正文说前代是 Ling-1T, 表头却写 Ling-2.0-1T, 这是同一个模型吗?
> 页面没有明说. 正文写 「Compared to its predecessor, Ling-1T」, 表里只有一列前代, 表头是 Ling-2.0-1T. 第 10 页部署段又写 「run Ling-1T」. 按上下文, 两个名字指的应该是同一列, 但页面没有一句话把它们等同起来. 表里还有一处格式不齐: SimpleQA_Verified 一行前代写成 19.3, 只有一位小数, 其余格子都是两位.

> **对一下:** 正文说和主流模型相比, 在复杂推理和指令遵循上有 「distinct performance advantage」, 表里撑得住吗?
> 推理撑得住, 指令遵循撑不住. Reasoning 六行里, Ling-2.5-1T 在 AIME26, HMMT-Nov25, IMO-AnswerBench, ARCPrize, bbeh 五行最高, 只有 livecodebench 的 68.17 低于 Kimi-K2.5-Instant 的 73.40. Instruction Following 三行一个第一也没有: LIFEBench 57.90, 低于 GPT-5.2-chat 的 61.70; IFBench 46.67 排第三, 低于 GPT-5.2-chat 的 71.47 和 DeepSeek-V3.2-nothink 的 50.00; Multi-IF 77.18, 低于 Kimi 的 78.20. 这一组能说的是比前代强, 说不上比主流模型强.

> **回看:** 「holistic upgrade」 是说每一行都比前代高吗?
> 21 行里有 20 行比 Ling-2.0-1T 高. 例外是 Alignment 组的 MultiChallenge: Ling-2.5-1T 52.01, Ling-2.0-1T 54.95, 低了 2.94, 而且这一行前代是五列中最高的. 涨得最多的是 Agentic 三行: tau2-bench 加 25.20, BFCL-v4 加 23.88, terminal-bench 2.0 加 22.47. 涨得最少的是 GPQA Diamond, 加 2.09.

> **确认:** 第 3 页开头说 BFCL-V4 上是 「leading open-source performance」, 表里是这样吗?
> 是. BFCL-v4(FC) 一行 Ling-2.5-1T 69.87, 五列里最高, GPT-5.2-chat 63.05, Kimi-K2.5-Instant 62.96, DeepSeek-V3.2-nothink 60.05 都在它下面. 页面没标哪几列算开源, 但这一行它连 GPT-5.2-chat 也超过了, 「开源领先」 的说法不受影响. 要注意 「general tool-calling benchmark」 只挑了这一个, 同组的 tau2-bench 它排第三, 低于 DeepSeek 的 68.10 和 Kimi 的 62.94.

Model Downloads

模型下载

<!-- page 4 of 12 -->

You can download Ling-2.5-1T from the following table. If you are located in mainland China, we also provide the model on ModelScope.cn to speed up the download process.

可以从下表下载 Ling-2.5-1T. 如果你在中国大陆, 我们也在 ModelScope.cn 上提供了模型, 下载更快.

<table><tbody><tr><td rowspan="2">Model</td><td rowspan="2">ContextLength</td><td rowspan="2">Download</td></tr><tr></tr><tr><td rowspan="3">Ling-2.5-1T</td><td rowspan="3">256K-&gt;1M(YaRN)</td><td>🤗HuggingFace 🤖ModelScope</td></tr><tr><td rowspan="2"></td></tr><tr></tr></tbody></table>

(表: 只有一行. 模型 Ling-2.5-1T, 上下文长度 256K, 用 YaRN 可扩到 1M, 下载渠道是 HuggingFace 和 ModelScope. 表里剩下的是抽取出来的空行.)

Note: If you are interested in the previous version, please visit the past model collections on [Huggingface](https://huggingface.co/inclusionAI) or [ModelScope](https://modelscope.cn/organization/inclusionAI).

注: 如果想看之前的版本, 请到 Huggingface 或 ModelScope 上 inclusionAI 组织的历史模型合集.

## Trillion-scale Hybrid Linear Attention Architecture and Million-Token Context Window (万亿规模的混合线性注意力架构与百万 token 上下文窗口)

Building upon the Ling 2.0 architecture, Ling 2.5 introduces a Hybrid Linear Attention architecture. Through incremental training, we upgrade the GQA (Grouped Query Attention) of Ling 2.0 architecture to a 1:7 ratio of MLA (Multi-head Linear Attention) + Lightning Linear structure. Specifically, building upon the previously released Ringflash-linear-2.0 technical roadmap, we transform a subset of GQA layers into Lightning Linear Attention to significantly enhance throughput in long-horizon reasoning scenarios. To further compress the KV Cache, we approximately convert the remaining GQA layers to MLA while applying targeted adaptations for features such as QK Norm (Query-Kernel Normalization) and Partial RoPE (Rotational Positional Encoding), thereby strengthening the expressiveness of Ling 2.5 architecture.

Ling 2.5 在 Ling 2.0 架构的基础上引入混合线性注意力架构. 我们通过增量训练, 把 Ling 2.0 架构里的 GQA (Grouped Query Attention, 分组查询注意力) 升级成 MLA (页面写作 Multi-head Linear Attention) 加 Lightning Linear 的 1:7 结构. 具体做法是: 沿着此前发布的 Ringflash-linear-2.0 的技术路线, 把一部分 GQA 层改成 Lightning Linear Attention, 明显提升长程推理场景下的吞吐. 为了进一步压缩 KV Cache, 我们把其余的 GQA 层近似转换成 MLA, 同时针对 QK Norm (页面写作 Query-Kernel Normalization) 和 Partial RoPE (页面写作 Rotational Positional Encoding) 等特性做了专门适配, 以此增强 Ling 2.5 架构的表达能力.

> **想:** 「1:7 ratio of MLA + Lightning Linear」 里, 1 和 7 各对应哪一种?
> 按词序读, MLA 占 1, Lightning Linear 占 7. 后文说先把 「a subset of GQA layers」 改成 Lightning Linear, 再把 「the remaining GQA layers」 近似转成 MLA, 这和 7 份线性, 1 份 MLA 的读法不冲突. 页面没有给总层数, 所以算不出两种层各有几层, 也不知道它们是按 1 个 MLA 接 7 个线性层周期排列, 还是别的排法. 第 5 页的结构图 (p05) 也许画了排布, 但本目录没有图文件, 无法核对.

> **问:** MLA, QK Norm, RoPE 三个缩写的展开, 和常见写法一样吗?
> 不一样. 页面把 MLA 写成 Multi-head Linear Attention, 把 QK Norm 写成 Query-Kernel Normalization, 把 RoPE 写成 Rotational Positional Encoding. 常见文献里这三个分别是 Multi-head Latent Attention, Query-Key Normalization 和 Rotary Position Embedding. 页面说转成 MLA 是为了 「further compress the KV Cache」, 这和 latent 的读法更贴; 如果 MLA 真是一种线性注意力, 它和 Lightning Linear 就分不开了, 1:7 也就没法解释. 页面没有公式, 判断不了是笔误还是另有所指, 译文照原文保留, 不替它改.

<!-- page 5 of 12 -->

Architecture of Ling-2.5 1T

Ling-2.5 1T 的架构

![Image block](images/p05-after-modification-the-trillion-scale-version-of-ling-2.png)

(图: 图文件不在本目录. 上一行是它的图题 「Architecture of Ling-2.5 1T」, 文件名却取自下面那段正文的开头, 是抽取工具的命名习惯. 标签是 Image block. 层的排布, 1:7 的周期和各模块的连接都只能看图, 这里读不到.)

After modification, the trillion-scale version of Ling 2.5 architecture increases activation parameter count from 51B to 63B. However, leveraging the hybrid linear attention architecture, its inference efficiency has still achieved a significant improvement compared to Ling 2.0. Even when benchmarked against the KIMI K2 architecture with only 32B activation parameters, Ling 2.5 maintains notable advantages in throughput for long-horizon task execution; and the longer the generated length, the more pronounced this throughput benefit becomes.

改造之后, 万亿规模的 Ling 2.5 架构激活参数从 51B 增加到 63B. 不过借助混合线性注意力架构, 它的推理效率相比 Ling 2.0 仍有明显提升. 即使和激活参数只有 32B 的 KIMI K2 架构相比, Ling 2.5 在长程任务执行中的吞吐仍有明显优势, 而且生成长度越长, 这个吞吐优势越明显.

> **再看:** 激活参数从 51B 涨到 63B, 为什么还拿只有 32B 激活的 Kimi K2 来比吞吐?
> 页面的论点是: 激活参数多了, 但线性注意力省下的开销更大, 所以吞吐反而更高. 挑一个激活量更小的对手, 是为了把这一点说得更有力. 有两处要分清. 一是这里写的是 「KIMI K2 architecture」, 评测表里是 Kimi-K2.5-Instant, 名字不同, 页面没说两者结构是否相同. 二是 Kimi K2 的总参数页面没印, 这里只比激活参数这一项. 另外, 51B 到 63B 多出的 12B 来自哪些模块, 页面也没解释. 吞吐具体高多少, 要看第 6 页两张图, 正文没给数字.

<!-- page 6 of 12 -->

![Chart block](images/p06-on-a-single-machine-with-8-h20-3e-gpus-batch-size-64.png)

(图: 图文件不在本目录, 标签 Chart block, 文件名取自下面的图注.)

On a single machine with 8 H20-3e GPUs, batch size=64, comparison of decode throughput under different generation lengths.

单机 8 张 H20-3e GPU, batch size=64, 不同生成长度下的 decode 吞吐对比.

![Chart block](images/p06-on-a-single-machine-with-8-h200-gpus-batch-size-64.png)

(图: 同样打不开, 文件名取自下面的图注.)

On a single machine with 8 H200 GPUs, batch size=64, comparison of decode throughput under different generation lengths.

单机 8 张 H200 GPU, batch size=64, 不同生成长度下的 decode 吞吐对比.

> **核对:** 第 6 页这两张吞吐图, 能读出具体数字吗?
> 读不出. 两张图都不在目录里. 图注只给了条件: 单机 8 卡, 一张是 H20-3e, 一张是 H200, batch size 都是 64, 横向比的是不同生成长度下的 decode 吞吐. 图注没写参与比较的是哪几个模型, 按第 5 页正文推测是 Ling 2.0 和 Kimi K2 架构, 但这只是推测. 吞吐单位, 生成长度取了哪几档, 也都在图里. 第 5 页 「生成越长, 优势越明显」 这句, 要等看到图才能对.

Following the architectural upgrades, we conducted continued pre-training on Ling-2.5-1T-base using 9T high-quality tokens. This phase focused on enhancing the model's world knowledge coverage and fundamental agent capabilities. Simultaneously, leveraging the exceptional computational efficiency and scalability of the Hybrid Linear

架构升级之后, 我们用 9T 高质量 token 在 Ling-2.5-1T-base 上做了继续预训练. 这一阶段重点加强模型的世界知识覆盖和基础 agent 能力. 同时, 借助混合线性

<!-- page 7 of 12 -->

Attention architecture for long-context processing, we extended the training context window to 256K tokens. Furthermore, via YaRN extrapolation, the model achieves stable support for ultra-long contexts of up to 1M tokens.

(接上页) 注意力架构在长上下文处理上的计算效率和可扩展性, 我们把训练上下文窗口扩到 256K token. 再通过 YaRN 外推, 模型可以稳定支持最长 1M token 的超长上下文.

Previously, there has been some debate within the community regarding the efficacy of Hybrid Linear Attention for ultra-long context reasoning. To address this, we conducted a systematic evaluation of Ling-2.5-1T on ultra-long context benchmarks. The results indicate that Ling-2.5-1T demonstrates performance advantages across multiple ultralong context tasks when compared to large instant models utilizing MLA and DSA architectures (such as Kimi K2.5 and DeepSeek V3.2). However, we also acknowledge that a gap remains when compared to leading closed-source API models (such as GPT-5.2 and Gemini 3 Pro). We are committed to further enhancing these capabilities in future iterations.

此前社区对混合线性注意力在超长上下文推理上是否有效有过一些争论. 为此, 我们在超长上下文基准上系统评测了 Ling-2.5-1T. 结果显示, 和采用 MLA, DSA 架构的大型 instant 模型 (如 Kimi K2.5 和 DeepSeek V3.2) 相比, Ling-2.5-1T 在多项超长上下文任务上有性能优势. 但我们也承认, 和领先的闭源 API 模型 (如 GPT-5.2 和 Gemini 3 Pro) 相比仍有差距. 我们会在后续版本里继续提升这方面的能力.

> **对一下:** 这里说在多项超长上下文任务上优于 Kimi K2.5 和 DeepSeek V3.2, 评测表 LongText 组的两行对得上吗?
> 一行对得上, 一行对不上. MRCR(16K-256K) 一行, Ling-2.5-1T 66.80, 高于 Kimi 的 63.22 和 DeepSeek 的 30.50, 低于 GPT-5.2-chat 的 77.93, 和 「与闭源 API 仍有差距」 一致. LongBenchV2 一行, Ling-2.5-1T 53.68, 低于 Kimi 的 59.64, 只比 DeepSeek 的 51.89 高. 正文的 「multiple ultralong context tasks」 可能主要指第 7 到 9 页图里的 NIAH, RULER, MRCR, 那几张图打不开. Gemini 3 Pro 不在评测表里, 只可能出现在图中. 括号里的 Kimi K2.5 和 DeepSeek V3.2 与前面的 MLA, DSA 只是并列, 页面没有说哪个对应哪个.

![Chart block](images/p07-ling-2-5-1t-demonstrates-superior-niah-performance.png)

(图: 图文件不在本目录, 文件名取自下面的图注.)

Ling-2.5-1T demonstrates superior NIAH performance within a 1M-token context window.

在 1M token 的上下文窗口内, Ling-2.5-1T 的 NIAH (大海捞针) 表现更好.

<!-- page 8 of 12 -->

![Chart block](images/p08-performance-across-16k-1m-token-context-windows-on.png)

(图: 图文件不在本目录, 文件名取自下面的图注.)

Performance Across 16K–1M Token Context Windows on RULER and MRCR

RULER 和 MRCR 在 16K 到 1M token 各档上下文窗口上的表现

> **确认:** 16K 到 1M 和 16K 到 256K 两个区间, 哪个是评测表 MRCR 那一格的口径?
> 评测表 MRCR 行自带 「(16K-256K)」, 第 9 页图注也说 RULER 和 MRCR 是在 16K 到 256K 的窗口上取平均, 两处一致. 第 8 页这张图按 16K 到 1M 逐档展示, 范围更宽. 所以表里的 66.80 不含 256K 以上的窗口, 超过 256K 的部分靠 YaRN 外推, 只在第 8 页的图里. 第 9 页的平均值和表里的 66.80 是不是同一个数, 要看图, 页面文字没有再印一遍.

<!-- page 9 of 12 -->

![Chart block](images/p09-ruler.png)

(图: 图文件不在本目录, 文件名取自下面的 「Ruler」.)

Ruler

RULER (基准名, 这里像分图标题).

LongBenchv2

LongBenchv2 (基准名, 同样像分图标题).

Long-context benchmark comparison (RULER and MRCR scores averaged over 16K– 256K token windows)

长上下文基准对比 (RULER 和 MRCR 的分数取 16K 到 256K token 窗口的平均)

![Chart block](images/p09-quickstart.png)

(图: 图文件不在本目录, 文件名取自下面的 「Quickstart」.)

**Quickstart**

**快速上手**

Coming Soon

即将推出.

MRCR

MRCR (基准名, 像分图标题).

![Chart block](images/p09-txt.png)

(图: 图文件不在本目录, 文件名取自下一页开头代码块的语言标记 txt.)

> **想:** p09-quickstart.png 和 p09-txt.png 看名字像 Quickstart 按钮和代码框, 是界面图标吗?
> 多半不是. 抽取工具按紧跟在图后面的文字给图命名, p01 和 p05 都是这样. 第 9 页的顺序是: p09-ruler 图, 「Ruler」, 「LongBenchv2」, 长上下文对比的图注, p09-quickstart 图, 「Quickstart」, 「Coming Soon」, 「MRCR」, p09-txt 图, 然后第 10 页是 txt 代码块. 页上有 Ruler, LongBenchv2, MRCR 三个小标题, 图注又说这是长上下文基准对比, 这三张图更像同一组对比图的三个分图, Quickstart 一段被排版插到了中间. 两张图的标签都是 Chart block, 和 p01 的 Image block 不同. 图文件不在目录里, 这个判断只来自位置和命名, 不能算确认.

<!-- page 10 of 12 -->

```txt
API Usage
```

API 用法

```txt
Comming Soon
```

即将推出 (原文拼作 Comming).

```txt
Deployment
```

部署

```txt
SGLang
```

SGLang (推理服务框架)

```txt
Environment Preparation
```

环境准备

We will later submit our model to SGLang official release, now we can prepare the environment following steps:

我们之后会把模型提交到 SGLang 的官方版本, 现在可以按下面的步骤准备环境:

```shell
git clone -b ling_2_5 git@github.com:antgroup/sglang.git
cd sglang

# Install the python packages
pip install --upgrade pip
pip install -e "python"
```

(命令: 克隆 antgroup/sglang 仓库的 ling_2_5 分支, 进入目录, 升级 pip, 再以可编辑模式安装仓库里的 python 子目录. 注释那行意思是 「安装 python 包」.)

## Run Inference (运行推理)

Both BF16 and FP8 models are supported by SGLang now. It depends on the dtype of the model in \${MODEL\_PATH}. Here is the example to run Ling-1T with multiple GPU nodes, where the master node IP is \${MASTER\_IP} and server port is \${PORT}:

SGLang 现在同时支持 BF16 和 FP8 模型, 用哪一种取决于 `${MODEL_PATH}` 里模型的数据类型. 下面是在多个 GPU 节点上运行 Ling-1T 的示例, 主节点 IP 是 `${MASTER_IP}`, 服务端口是 `${PORT}`:

> **停一下:** 「Both BF16 and FP8 models are supported」, 页面上有 FP8 版本可以下载吗?
> 页面上没有. 第 4 页下载表只有 Ling-2.5-1T 一行, 第 1 页的张量类型是 BF16 和 F32, 没有 FP8. 这句说的是 SGLang 能加载 FP8 权重, 不等于这里发布了 FP8 权重. 同一句示例写的是 「run Ling-1T」, 用的是前代的名字, 看起来是从前代卡片沿用过来的写法, 页面没有改成 Ling-2.5-1T.

## Start server: (启动服务)

```shell
# Node 0:
python -m sglang.launch_server --model-path $MODEL_PATH --tp-size 8 --
# Node 1:
python -m sglang.launch_server --model-path $MODEL_PATH --tp-size 8 --
# Node 2:
python -m sglang.launch_server --model-path $MODEL_PATH --tp-size 8 --
# Node 3:
python -m sglang.launch_server --model-path $MODEL_PATH --tp-size 8 --p
```

(命令: Node 0 到 Node 3 四个节点各执行一行 sglang.launch_server, 模型路径取 `$MODEL_PATH`, `--tp-size 8`. 每行后面的参数都被页面截断了.)

> **回看:** 四个节点的启动命令完整吗?
> 不完整. 每一行都在 「--tp-size 8 --」 之后被页面右边界切断, Node 3 那行多露出一个 「p」. 能确定的只有: 四个节点, 每个节点的 tensor parallel 大小是 8, 模型路径取同一个 `$MODEL_PATH`. 被切掉的参数看不到, 这里不补. 还有一处和第 6 页不一样: 吞吐图是单机 8 卡, 这里的示例是四个节点, 页面没解释两种配置为什么不同. 第 11 页 client 的 curl 命令也在 「What」 之后被切断.

<!-- page 11 of 12 -->

```txt
# This is only an example. Please adjust arguments according to your ac
```

这只是一个示例, 请按你的实际环境调整参数 (原句在 「ac」 处被截断).

## Client: (客户端)

```shell
curl -s http://${MASTER_IP}:${PORT}/v1/chat/completions \
-H "Content-Type: application/json" \
-d '{"model": "auto", "messages": [{"role": "user", "content": "What More usage can be found here
```

(命令: 用 curl 向 `http://${MASTER_IP}:${PORT}/v1/chat/completions` 发 JSON 请求, model 填 「auto」, messages 里是一条 user 消息. 消息内容在 「What」 之后被截断, 后面直接接上了下一行的 「More usage can be found here」, 意思是 「更多用法见这里」, 链接没抓到.)

## Limitations & Future Plans (局限与未来计划)

Ling-2.5-1T achieves high-throughput decoding and leading capabilities in ultra-long context processing. With preliminary agentic interaction capabilities, it lays the groundwork for the era of general-purpose agents.

Ling-2.5-1T 做到了高吞吐的解码, 超长上下文处理能力领先. 它具备初步的 agent 交互能力, 为通用 agent 的时代打下基础.

However, in complex agent interactions and long-horizon tasks, it still lags behind frontier models. The next version will focus on enhancing long-horizon execution and task completion for real-world applications, while continuously improving token efficiency to deliver a superior balance between efficiency and performance.

但在复杂的 agent 交互和长程任务上, 它仍落后于前沿模型. 下一版本会重点加强真实应用里的长程执行和任务完成能力, 同时继续提升 token 效率, 在效率和性能之间取得更好的平衡.

Hugging Face:[https://huggingface.co/inclusionAI/Ling-2.5-1T](https://huggingface.co/inclusionAI/Ling-2.5-1T)

ModelScope:[https://modelscope.cn/models/inclusionAI/Ling-2.5-1T](https://modelscope.cn/models/inclusionAI/Ling-2.5-1T).

Hugging Face 和 ModelScope 上的模型地址, 见上面两行链接.

The chat experience page and API services on [Ling studio](https://ling.tbox.cn/chat) and [ZenMux](https://zenmux.ai/) will be launched in the near future.

Ling studio 和 ZenMux 上的对话体验页和 API 服务会在近期上线.

## License (许可证)

This code repository is licensed under [the MIT License](https://github.com/inclusionAI/Ling-V2.5/blob/main/LICENSE).

本代码仓库采用 MIT 许可证, 链接指向 inclusionAI/Ling-V2.5 仓库里的 LICENSE 文件.

<!-- page 12 of 12 -->

## Related training-content documentation (相关的训练内容文档)

The following document identifies the **Ling-2.5** model family. Its stated model/version scope should be consulted alongside this repository’s model card; the family name alone should not be read as an explicit listing of **Ling-2.5-1T**.

下面这份文档标明的是 **Ling-2.5** 模型家族. 它声明的模型与版本范围, 应当和本仓库的模型卡片对照着看; 不能只凭家族名, 就把它读成明确列出了 **Ling-2.5-1T**.

[Training-content summary (PDF)](https://huggingface.co/inclusionAI/AI-Transparency/resolve/main/Ling-2.5_TDS-Summary.pdf)

[Training-content documentation index](https://huggingface.co/inclusionAI/AI-Transparency)

训练内容摘要 (PDF), 训练内容文档索引. 两个链接都在 inclusionAI/AI-Transparency 下.

Coverage is limited to the models and versions explicitly identified in the linked document.

覆盖范围仅限链接文档里明确点名的模型和版本.

> **核对:** 第 12 页的训练内容文档, 能说明它覆盖 Ling-2.5-1T 吗?
> 不能. 这段自己就说了: 文档标明的是 Ling-2.5 模型家族, 不能只凭家族名就当作明确列出了 Ling-2.5-1T, 覆盖范围以文档里点名的模型和版本为准. 页面只给了 PDF 和索引两个链接, 没有摘录文档内容. 所以训练数据的成分在这 12 页里仍是空白, 20T, 29T, 9T 这三个数是仅有的数据量信息.

## System theme (系统主题)

页面底部的主题切换, 不是正文.
