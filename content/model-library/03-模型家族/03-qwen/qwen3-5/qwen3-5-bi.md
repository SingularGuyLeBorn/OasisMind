<!-- page 1 of 22 -->

![Image block](images/p01-alibaba-cloud.png)

-Alibaba Cloud

-阿里云

[  Cart](https://cart.alibabacloud.com/) [Log In](https://account-intl.aliyun.com/login/login.htm?oauth_callback=https%3A%2F%2Fwww.alibabacloud.com%2Fblog%2F602894)

[购物车](https://cart.alibabacloud.com/) [登录](https://account-intl.aliyun.com/login/login.htm?oauth_callback=https%3A%2F%2Fwww.alibabacloud.com%2Fblog%2F602894)

Community

社区

[Community](https://community.alibabacloud.com/)  [Blog](https://www.alibabacloud.com/blog/)  Qwen3.5: Towards Native Multimodal Agents

[社区](https://community.alibabacloud.com/)  [博客](https://www.alibabacloud.com/blog/)  Qwen3.5: Towards Native Multimodal Agents

# Qwen3.5: Towards Native Multimodal Agents

[Alibaba Cloud Community](https://community.alibabacloud.com/users/5337701737861729) February 17, 2026 83,582  0

[阿里云社区](https://community.alibabacloud.com/users/5337701737861729) 2026 年 2 月 17 日 83,582  0

We are delighted to announce the official release of Qwen3.5, introducing the open-weight of the first model in the Qwen3.

我们高兴地宣布 Qwen3.5 正式发布, 并开放 Qwen3.5 系列首个开源权重.

![Image block](images/p01-we-are-delighted-to-announce-the-official-release-of.png)

We are delighted to announce the official release of **Qwen3.5**, introducing the open-weight of the first model in the Qwen3.5 series, namely **Qwen3.5-397B-A17B.** As a native vision-language model, Qwen3.5-397B-A17B demonstrates outstanding results across a full range of benchmark evaluations, including reasoning, coding, agent capabilities, and multimodal understanding, empowering developers and enterprises to achieve significantly greater productivity. Built on an innovative hybrid architecture that fuses linear attention (via Gated Delta Networks) with a sparse mixture-of-experts, the

我们高兴地宣布 **Qwen3.5** 正式发布, 并开放 Qwen3.5 系列首个开源权重 **Qwen3.5-397B-A17B**. 作为原生视觉-语言模型, Qwen3.5-397B-A17B 在推理, 代码, agent 能力与多模态理解等一整套评测上表现突出, 面向开发者与企业侧的生产力场景. 它建立在把线性注意力 (Gated Delta Networks) 与稀疏 MoE 融在一起的混合架构之上,

<!-- page 2 of 22 -->

model attains remarkable inference efficiency: although it comprises 397 billion total parameters, just 17 billion are activated per forward pass, optimizing both speed and cost without sacrificing capability. We have also expanded our language and dialect support from 119 to 201, providing broader accessibility and enhanced support to users around the world.

从而拿到很强的推理效率: 总参 397B, 每次前向只激活 17B, 在不牺牲能力的前提下压速度与成本. 语言与方言支持也从 119 扩到 201, 覆盖面更广.

**Qwen3.5-Plus** is the hosted model available via [Alibaba Cloud Model Studio](https://modelstudio.alibabacloud.com/?spm=a2ty_o06.30285417.0.0.72bcc921OM9kmZ), featuring:

**Qwen3.5-Plus** 是托管在 [阿里云 Model Studio](https://modelstudio.alibabacloud.com/?spm=a2ty_o06.30285417.0.0.72bcc921OM9kmZ) 上的型号, 具备:

a 1M context window by default

默认 1M 上下文窗口

official built-in tools and adaptive tool use

官方内置工具与自适应工具调用

![Chart block](images/p02-performance.png)

## Performance 表现

Below we present the comprehensive evaluation of our models against frontier models in a wide range of evaluation tasks, covering different tasks and modalities.

下面给出相对前沿模型的综合评测, 覆盖多种任务与模态.

Language

语言

G

G

> **想:** 开源旗舰写的是 397B 总参 / 17B 激活, 托管的 Plus 却默认给 1M 上下文; 文内有没有把这两个交付物写成同一套权重与同一套窗口?
> 没有. 页 1-2 把 open-weight 钉成 **Qwen3.5-397B-A17B**, 接着另起一段写 **Qwen3.5-Plus** 「hosted model」 与默认 1M 窗口, 内置工具. 后文预训练吞吐对比也只写 397B-A17B 相对 Max / 235B-A22B 的 32k/256k decode 倍率, 没有把 Plus 的 1M 回写到开源旗舰规格表. 读交付物时要把 「开源权重规格」 与 「托管产品默认窗口」 拆开.

<!-- page 3 of 22 -->

<table><tbody><tr><td></td><td>GPT5.2</td><td>Claude4.5Opus</td><td>Gemini-3 Pro</td><td>Qwen3-Max-Thinking</td><td>K2.5-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td colspan="7">Knowledge</td></tr><tr><td>MMLU-Pro</td><td>87.4</td><td>89.5</td><td>89.8</td><td>85.7</td><td>87.1</td><td>87.8</td></tr><tr><td>MMLU-Redux</td><td>95.0</td><td>95.6</td><td>95.9</td><td>92.8</td><td>94.5</td><td>94.9</td></tr><tr><td>SuperGPQA</td><td>67.9</td><td>70.6</td><td>74.0</td><td>67.3</td><td>69.2</td><td>70.4</td></tr><tr><td>C-Eval</td><td>90.5</td><td>92.2</td><td>93.4</td><td>93.7</td><td>94.0</td><td>93.0</td></tr><tr><td colspan="7">Instruction Following</td></tr><tr><td>IFEval</td><td>94.8</td><td>90.9</td><td>93.5</td><td>93.4</td><td>93.9</td><td>92.6</td></tr><tr><td>IFBench</td><td>75.4</td><td>58.0</td><td>70.4</td><td>70.9</td><td>70.2</td><td>76.5</td></tr><tr><td>MultiChallenge</td><td>57.9</td><td>54.2</td><td>64.2</td><td>63.3</td><td>62.7</td><td>67.6</td></tr><tr><td colspan="7">Long Context</td></tr><tr><td>AA-LCR</td><td>72.7</td><td>74.0</td><td>70.7</td><td>68.7</td><td>70.0</td><td>68.7</td></tr><tr><td>LongBench v2</td><td>54.5</td><td>64.4</td><td>68.2</td><td>60.6</td><td>61.0</td><td>63.2</td></tr><tr><td colspan="7">STEM</td></tr><tr><td>GPQA</td><td>92.4</td><td>87.0</td><td>91.9</td><td>87.4</td><td>87.6</td><td>88.4</td></tr><tr><td>HLE</td><td>35.5</td><td>30.8</td><td>37.5</td><td>30.2</td><td>30.1</td><td>28.7</td></tr><tr><td>HLE-Verified¹</td><td>43.3</td><td>38.8</td><td>48</td><td>37.6</td><td>--</td><td>37.6</td></tr></tbody></table>

> **看表:** 同页 STEM 组里 HLE 是 28.7, HLE-Verified 是 37.6; 能不能把 Verified 栏读成 「同一套 HLE 题改了评分口径」?
> 不能直接等同. 页 6 脚注把 HLE-Verified 写成 「verified and revised version of Humanity's Last Exam」, 另有 component-wise verification protocol 与 fine-grained error taxonomy, 并开源数据集. 表上两行对照模型集合也不完全一样 (Verified 行 K2.5 为 `--`). 引用时要标明是哪一行, 不要把 28.7 与 37.6 当成同一题集的两次打分.

<!-- page 4 of 22 -->

<table><tbody><tr><td></td><td>GPT5.2</td><td>Claude4.5Opus</td><td>Gemini-3 Pro</td><td>Qwen3-Max-Thinking</td><td>K2.5-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td colspan="7">Reasoning</td></tr><tr><td>LiveCodeBenchv6</td><td>87.7</td><td>84.8</td><td>90.7</td><td>85.9</td><td>85.0</td><td>83.6</td></tr><tr><td>HMMT Feb 25</td><td>99.4</td><td>92.9</td><td>97.3</td><td>98.0</td><td>95.4</td><td>94.8</td></tr><tr><td>HMMT Nov 25</td><td>100</td><td>93.3</td><td>93.3</td><td>94.7</td><td>91.1</td><td>92.7</td></tr><tr><td>IMOAnswerBench</td><td>86.3</td><td>84.0</td><td>83.3</td><td>83.9</td><td>81.8</td><td>80.9</td></tr><tr><td>AIME26</td><td>96.7</td><td>93.3</td><td>90.6</td><td>93.3</td><td>93.3</td><td>91.3</td></tr><tr><td colspan="7">General Agent</td></tr><tr><td>BFCL-V4</td><td>63.1</td><td>77.5</td><td>72.5</td><td>67.7</td><td>68.3</td><td>72.9</td></tr><tr><td>TAU2-Bench</td><td>87.1</td><td>91.6</td><td>85.4</td><td>84.6</td><td>77.0</td><td>86.7</td></tr><tr><td>VITA-Bench</td><td>38.2</td><td>56.3</td><td>51.6</td><td>40.9</td><td>41.9</td><td>49.7</td></tr><tr><td>DeepPlanning</td><td>44.6</td><td>33.9</td><td>23.3</td><td>28.7</td><td>14.5</td><td>34.3</td></tr><tr><td>Tool Decathlon</td><td>43.8</td><td>43.5</td><td>36.4</td><td>18.8</td><td>27.8</td><td>38.3</td></tr><tr><td>MCP-Mark</td><td>57.5</td><td>42.3</td><td>53.9</td><td>33.5</td><td>29.5</td><td>46.1</td></tr><tr><td colspan="7">Search Agent</td></tr><tr><td>HLE w/ tool</td><td>45.5</td><td>43.4</td><td>45.8</td><td>49.8</td><td>50.2</td><td>48.3</td></tr></tbody></table>

> **问:** General Agent 组里 DeepPlanning 34.3 高于 Claude 的 33.9, 但 Tool Decathlon 38.3 仍低于 GPT5.2 的 43.8; 页 10 用 「average ranking」 汇总时, 单格落后会不会被排名平均抹平?
> 会有这种效应. 页 10 明确说 overall performance 是对 BFCL-V4, VITA-Bench, DeepPlanning, Tool-Decathlon, MCP-Mark **五榜排名取平均**, 不是五榜原始分加权. 排名平均对 「某一格大幅落后, 其余格中上」 更友好; 读图 `images/p11-pretraining.png` 的曲线时, 不要把它当成 Tool Decathlon 分本身的 Scaling 曲线.

<!-- page 5 of 22 -->

<table><tbody><tr><td></td><td>GPT5.2</td><td>Claude4.5Opus</td><td>Gemini-3 Pro</td><td>Qwen3-Max-Thinking</td><td>K2.5-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td>BrowseComp</td><td>65.8</td><td>67.8</td><td>59.2</td><td>53.9</td><td>--/74.9</td><td>69.0/78.6</td></tr><tr><td>BrowseComp-zh</td><td>76.1</td><td>62.4</td><td>66.8</td><td>60.9</td><td>--</td><td>70.3</td></tr><tr><td>WideSearch</td><td>76.8</td><td>76.4</td><td>68.0</td><td>57.9</td><td>72.7</td><td>74.0</td></tr><tr><td>Seal-0</td><td>45.0</td><td>47.7</td><td>45.5</td><td>46.9</td><td>57.4</td><td>46.9</td></tr><tr><td colspan="7">Multilingualism</td></tr><tr><td>MMMLU</td><td>89.5</td><td>90.1</td><td>90.6</td><td>84.4</td><td>86.0</td><td>88.5</td></tr><tr><td>MMLU-ProX</td><td>83.7</td><td>85.7</td><td>87.7</td><td>78.5</td><td>82.3</td><td>84.7</td></tr><tr><td>NOVA-63</td><td>54.6</td><td>56.7</td><td>56.7</td><td>54.2</td><td>56.0</td><td>59.1</td></tr><tr><td>INCLUDE</td><td>87.5</td><td>86.2</td><td>90.5</td><td>82.3</td><td>83.3</td><td>85.6</td></tr><tr><td>Global PIQA</td><td>90.9</td><td>91.6</td><td>93.2</td><td>86.0</td><td>89.3</td><td>89.8</td></tr><tr><td>PolyMATH</td><td>62.5</td><td>79.0</td><td>81.6</td><td>64.7</td><td>43.1</td><td>73.3</td></tr><tr><td>WMT24++</td><td>78.8</td><td>79.7</td><td>80.7</td><td>77.6</td><td>77.6</td><td>78.9</td></tr><tr><td>MAXIFE</td><td>88.4</td><td>79.2</td><td>87.5</td><td>84.0</td><td>72.8</td><td>88.2</td></tr><tr><td colspan="7">Coding Agent</td></tr><tr><td>SWE-bench Verified</td><td>80.0</td><td>80.9</td><td>76.2</td><td>75.3</td><td>76.8</td><td>76.4</td></tr></tbody></table>

> **核对:** BrowseComp 格写成 69.0/78.6, K2.5 写成 `--/74.9`; 斜杠两边是不是同一种 context 管理策略下的两次跑分?
> 不是同策略. 页 6 写明: simple context-folding 得 69.0, 与 DeepSeek-V3.2 / Kimi K2.5 相同的 discard-all 得 78.6. K2.5 的 `--/74.9` 与脚注对齐时, 更像只公开了 discard-all 一侧. 同一权重换上下文折叠策略就能差约 9.6 分, 引用 BrowseComp 必须带策略名.

<!-- page 6 of 22 -->

|  | GPT5.2 | Claude4.5Opus | Gemini-3 Pro | Qwen3-Max-Thinking | K2.5-1T-A32B | Qwen3.5-397B-A17B |
| --- | --- | --- | --- | --- | --- | --- |
| SWE-bench Multilingual | 72.0 | 77.5 | 65.0 | 66.7 | 73.0 | 69.3 |
| SecCodeBench | 68.7 | 68.6 | 62.4 | 57.5 | 61.3 | 68.3 |
| Terminal Bench 2 | 54.0 | 59.3 | 54.2 | 22.5 | 50.8 | 52.5 |

HLE-Verified: a verified and revised version of Humanity’s Last Exam (HLE), accompanied by a transparent, component-wise verification protocol and a fine-grained error taxonomy. We open-source the dataset at [https://huggingface.co/datasets/skylenage/HLE-Verified.](https://huggingface.co/datasets/skylenage/HLE-Verified.)

HLE-Verified: Humanity's Last Exam (HLE) 的核实修订版, 带透明的分项核实协议与细粒度错误分类. 数据集开源在 [https://huggingface.co/datasets/skylenage/HLE-Verified.](https://huggingface.co/datasets/skylenage/HLE-Verified.)

TAU2-Bench: we follow the official setup except for the airline domain, where all models are evaluated by applying the fixes proposed in the Claude Opus 4.5 system card.

TAU2-Bench: 除 airline 域外跟官方设置; airline 域上所有模型都套用 Claude Opus 4.5 system card 提出的修复后再评.

MCP-Mark: GitHub MCP server uses v0.30.3 from api.githubcopilot.com; Playwright tool responses are truncated at 32k tokens.

MCP-Mark: GitHub MCP server 用 api.githubcopilot.com 的 v0.30.3; Playwright 工具回复截断在 32k tokens.

Search Agent: most search agents built on our model adopt a simple context-folding strategy(256k): once the cumulative Tool Response length reaches a preset threshold, earlier Tool Responses are pruned from the history to keep the context within limits.

Search Agent: 多数基于本模型的搜索 agent 用简单 context-folding 策略 (256k): 累计 Tool Response 长度触及预设阈值后, 剪掉更早的 Tool Response, 把上下文压回限额内.

BrowseComp: we tested two strategies, simple context-folding achieved a score of 69.0, while using the same discard-all strategy as DeepSeek-V3.2 and Kimi K2.5 achieved 78.6.

BrowseComp: 测了两种策略; simple context-folding 得 69.0, 与 DeepSeek-V3.2 / Kimi K2.5 相同的 discard-all 得 78.6.

WideSearch: we use a 256k context window without any context management.

WideSearch: 用 256k 上下文窗口, **不做**任何上下文管理.

MMLU-ProX: we report the averaged accuracy on 29 languages.

MMLU-ProX: 报告 29 种语言上的平均准确率.

WMT24++: a harder subset of WMT24 after difficulty labeling and rebalancing; we report the averaged scores on 55 languages using XCOMET-XXL.

WMT24++: 对 WMT24 做难度标注与再平衡后的更难子集; 用 XCOMET-XXL 在 55 种语言上报告平均分.

MAXIFE: we report the accuracy on English + multilingual original prompts (totally 23 settings).

MAXIFE: 报告 English + 多语原始 prompt 共 23 个设置上的准确率.

Empty cells (--) indicate scores not yet available or not applicable.

空单元格 (--) 表示分数尚未可得或不适用.

> **拆开:** Search Agent 脚注写 context-folding 阈值落在累计 Tool Response 长度, WideSearch 却 「256k without any context management」; 同文两条 agent 评测的上下文纪律是不是同一套?
> 不是. 页 6 把 Search Agent 默认写成 folding@256k (剪早先的 Tool Response), WideSearch 明确 「without any context management」. BrowseComp 又额外对比 folding 与 discard-all. 三处评测的脚手架不同, 不能把 WideSearch 的 74.0 与 BrowseComp 的 69.0/78.6 当成同一上下文协议下的可比格.

> **确认:** TAU2 的 airline 域 「all models」 都套 Claude Opus 4.5 system card 修复, 这是在抬 Qwen 还是在统一对照条件?
> 文内意图是统一条件: 页 6 写 「all models are evaluated by applying the fixes」. 它不是只给 Qwen 开小灶, 而是把对照列也拉到同一 airline 修复协议上. 读 TAU2 86.7 时要知道 airline 子域已不是未打补丁的官方原版设置.

<!-- page 7 of 22 -->

Vision Language

视觉语言

<table><tbody><tr><td></td><td>GPT5.2</td><td>Claude4.5Opus</td><td>Gemini-3 Pro</td><td>Qwen3-VL-235B-A22B</td><td>K2.5-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td colspan="7">STEM and Puzzle</td></tr><tr><td>MMMU</td><td>86.7</td><td>80.7</td><td>87.2</td><td>80.6</td><td>84.3</td><td>85.0</td></tr><tr><td>MMMU-Pro</td><td>79.5</td><td>70.6</td><td>81.0</td><td>69.3</td><td>78.5</td><td>79.0</td></tr><tr><td>MathVision</td><td>83.0</td><td>74.3</td><td>86.6</td><td>74.6</td><td>84.2</td><td>88.6</td></tr><tr><td>Mathvista(mini)</td><td>83.1</td><td>80.0</td><td>87.9</td><td>85.8</td><td>90.1</td><td>90.3</td></tr><tr><td>We-Math</td><td>79.0</td><td>70.0</td><td>86.9</td><td>74.8</td><td>84.7</td><td>87.9</td></tr><tr><td>DynaMath</td><td>86.8</td><td>79.7</td><td>85.1</td><td>82.8</td><td>84.4</td><td>86.3</td></tr><tr><td>ZEROBench</td><td>9</td><td>3</td><td>10</td><td>4</td><td>9</td><td>12</td></tr><tr><td>ZEROBench_sub</td><td>33.2</td><td>28.4</td><td>39.0</td><td>28.4</td><td>33.5</td><td>41.0</td></tr><tr><td>BabyVision</td><td>34.4</td><td>14.2</td><td>49.7</td><td>22.2</td><td>36.5</td><td>52.3/43.3</td></tr><tr><td colspan="7">General VQA</td></tr><tr><td>RealWorldQA</td><td>83.3</td><td>77.0</td><td>83.3</td><td>81.3</td><td>81.0</td><td>83.9</td></tr><tr><td>MMStar</td><td>77.1</td><td>73.2</td><td>83.1</td><td>78.7</td><td>80.5</td><td>83.8</td></tr><tr><td>HallusionBench</td><td>65.2</td><td>64.1</td><td>68.6</td><td>66.7</td><td>69.8</td><td>71.4</td></tr></tbody></table>

> **再看:** Vision 对照列从语言表的 Qwen3-Max-Thinking 换成了 **Qwen3-VL-235B-A22B**; 这是不是承认 397B-A17B 的多模态对位对象是 VL 线而不是 Max-Thinking?
> 是对照列 deliberately 换线. 页 7 起表头第四列是 Qwen3-VL-235B-A22B, 与页 3-6 语言表的 Qwen3-Max-Thinking 不同. 文内预训练段也写 「outperforming Qwen3-VL at similar scales」. 读跨表故事时不要把 Max-Thinking 的语言分直接叠到 VL 列上当同对照.

<!-- page 8 of 22 -->

<table><tbody><tr><td></td><td>GPT5.2</td><td>Claude4.5Opus</td><td>Gemini-3 Pro</td><td>Qwen3-VL-235B-A22B</td><td>K2.5-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td>MMBench<sub>EN-DEV</sub>-v1.1</td><td>88.2</td><td>89.2</td><td>93.7</td><td>89.7</td><td>94.2</td><td>93.7</td></tr><tr><td>SimpleVQA</td><td>55.8</td><td>65.7</td><td>73.2</td><td>61.3</td><td>71.2</td><td>67.1</td></tr><tr><td colspan="7">Text Recognition and Document Understanding</td></tr><tr><td>OmniDocBench1.5</td><td>85.7</td><td>87.7</td><td>88.5</td><td>84.5</td><td>88.8</td><td>90.8</td></tr><tr><td>CharXiv(RQ)</td><td>82.1</td><td>68.5</td><td>81.4</td><td>66.1</td><td>77.5</td><td>80.8</td></tr><tr><td>MMLongBench-Doc</td><td>--</td><td>61.9</td><td>60.5</td><td>56.2</td><td>58.5</td><td>61.5</td></tr><tr><td>CC-OCR</td><td>70.3</td><td>76.9</td><td>79.0</td><td>81.5</td><td>79.7</td><td>82.0</td></tr><tr><td>AI2D_TEST</td><td>92.2</td><td>87.7</td><td>94.1</td><td>89.2</td><td>90.8</td><td>93.9</td></tr><tr><td>OCRBench</td><td>80.7</td><td>85.8</td><td>90.4</td><td>87.5</td><td>92.3</td><td>93.1</td></tr><tr><td colspan="7">Spatial Intelligence</td></tr><tr><td>ERQA</td><td>59.8</td><td>46.8</td><td>70.5</td><td>52.5</td><td>--</td><td>67.5</td></tr><tr><td>CountBench</td><td>91.9</td><td>90.6</td><td>97.3</td><td>93.7</td><td>94.1</td><td>97.2</td></tr><tr><td>RefCOCO(avg)</td><td>--</td><td>--</td><td>84.1</td><td>91.1</td><td>87.8</td><td>92.3</td></tr><tr><td>ODInW13</td><td>--</td><td>--</td><td>46.3</td><td>43.2</td><td>--</td><td>47.0</td></tr><tr><td>EmbSpatialBench</td><td>81.3</td><td>75.7</td><td>61.2</td><td>84.3</td><td>77.4</td><td>84.5</td></tr></tbody></table>

> **回看:** MathVision 本模型 88.6 高于 Gemini-3 Pro 的 86.6, 但页 10 脚注说本模型用固定 boxed{} prompt, 别人取 「with/without boxed 更高分」; 这还算不算同协议?
> 不算严格同协议. 页 10: 本模型固定 「Please reason step by step, and put your final answer within boxed{}.」; 其他模型报告 with/without boxed 的更高分. 本模型没有享受 「两种格式取高」 的优惠, 对照列却可能吃到格式红利. 宣称领先时要把这条脚注绑上 88.6.

<!-- page 9 of 22 -->

<table><tbody><tr><td></td><td>GPT5.2</td><td>Claude4.5Opus</td><td>Gemini-3 Pro</td><td>Qwen3-VL-235B-A22B</td><td>K2.5-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td>RefSpatialBench</td><td>--</td><td>--</td><td>65.5</td><td>69.9</td><td>--</td><td>73.6</td></tr><tr><td>LingoQA</td><td>68.8</td><td>78.8</td><td>72.8</td><td>66.8</td><td>68.2</td><td>81.6</td></tr><tr><td>V*</td><td>75.9</td><td>67.0</td><td>88.0</td><td>85.9</td><td>77.0</td><td>95.8/91.1</td></tr><tr><td>Hypersim</td><td>--</td><td>--</td><td>--</td><td>11.0</td><td>--</td><td>12.5</td></tr><tr><td>SUNRGBD</td><td>--</td><td>--</td><td>--</td><td>34.9</td><td>--</td><td>38.3</td></tr><tr><td>Nuscene</td><td>--</td><td>--</td><td>--</td><td>13.9</td><td>--</td><td>16.0</td></tr><tr><td colspan="7">Video Understanding</td></tr><tr><td>VideoMME(w sub.)</td><td>86</td><td>77.6</td><td>88.4</td><td>83.8</td><td>87.4</td><td>87.5</td></tr><tr><td>VideoMME(w/o sub.)</td><td>85.8</td><td>81.4</td><td>87.7</td><td>79.0</td><td>83.2</td><td>83.7</td></tr><tr><td>VideoMMMU</td><td>85.9</td><td>84.4</td><td>87.6</td><td>80.0</td><td>86.6</td><td>84.7</td></tr><tr><td>MLVU (M-Avg)</td><td>85.6</td><td>81.7</td><td>83.0</td><td>83.8</td><td>85.0</td><td>86.7</td></tr><tr><td>MVBench</td><td>78.1</td><td>67.2</td><td>74.1</td><td>75.2</td><td>73.5</td><td>77.6</td></tr><tr><td>LVBench</td><td>73.7</td><td>57.3</td><td>76.2</td><td>63.6</td><td>75.9</td><td>75.5</td></tr><tr><td>MMVU</td><td>80.8</td><td>77.3</td><td>77.5</td><td>71.1</td><td>80.4</td><td>75.4</td></tr><tr><td colspan="7">Visual Agent</td></tr><tr><td>ScreenSpot Pro</td><td>--</td><td>45.7</td><td>72.7</td><td>62.0</td><td>--</td><td>65.6</td></tr></tbody></table>

> **停一下:** BabyVision 与 V* 都写成 `高分/低分`, 脚注都说高分开了 Code Interpreter; 这算模型能力还是 TestingTime 工具脚手架?
> 文内把它标成评测条件, 不是另训一条权重. 页 10: BabyVision 开 CI 为 52.3, 不开为 43.3; V* 开 CI 为 95.8, 不开为 91.1. 斜杠高侧吃的是推理期工具调用 (Code Interpreter), 属于 TestingTime 脚手架增益, 引用头条分时必须标明 CI on/off.

<!-- page 10 of 22 -->

<table><tbody><tr><td></td><td>GPT5.2</td><td>Claude4.5Opus</td><td>Gemini-3 Pro</td><td>Qwen3-VL-235B-A22B</td><td>K2.5-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td>OSWorld-Verified</td><td>38.2</td><td>66.3</td><td>--</td><td>38.1</td><td>63.3</td><td>62.2</td></tr><tr><td>AndroidWorld</td><td>--</td><td>--</td><td>--</td><td>63.7</td><td>--</td><td>66.8</td></tr><tr><td colspan="7">Medical VQA</td></tr><tr><td>SLAKE</td><td>76.9</td><td>76.4</td><td>81.3</td><td>54.7</td><td>81.6</td><td>79.9</td></tr><tr><td>PMC-VQA</td><td>58.9</td><td>59.9</td><td>62.3</td><td>41.2</td><td>63.3</td><td>64.2</td></tr><tr><td>MedXpertQA-MM</td><td>73.3</td><td>63.6</td><td>76.0</td><td>47.6</td><td>65.3</td><td>70.0</td></tr></tbody></table>

MathVision:our model’s score is evaluated using a fixed prompt, e.g., “Please reason step by step, and put your final answer within boxed{}.” For other models, we report the higher score between runs with and without the boxed{} formatting.

MathVision: 本模型用固定 prompt (例如 「Please reason step by step, and put your final answer within boxed{}.」 ) 评测. 其他模型报告 with/without boxed{} 两次中的更高分.

BabyVision: our model’s score is reported with CI (Code Interpreter) enabled; without CI, the result is 43.3.

BabyVision: 本模型分数为开启 CI (Code Interpreter); 不开 CI 时为 43.3.

V\*: our model’s score is reported with CI (Code Interpreter) enabled; without CI, the result is 91.1.

V*: 本模型分数为开启 CI; 不开 CI 时为 91.1.

Empty cells (--) indicate scores not yet available or not applicable.

空单元格 (--) 表示分数尚未可得或不适用.

Compared to the Qwen3 series, the post-training performance gains in Qwen3.5 primarily stem from our extensive scaling of virtually all RL tasks and environments we could conceive. Our approach placed strong emphasis on increasing the difficulty and generalizability of RL environments, rather than optimizing for specific metrics or narrow categories of queries. Below, we illustrate the improvements in general agent capabilities resulting from this RL environment scaling. The overall performance is calculated by averaging the ranking of each model on the following benchmarks: BFCL-V4, VITA-Bench, DeepPlanning, Tool-Decathlon, and MCP-Mark. Additional scaling results across a broader range of tasks will be detailed in our upcoming technical report.

相对 Qwen3 系列, Qwen3.5 后训练增益主要来自几乎把能想到的 RL 任务与环境都做了 Scaling. 重点放在提高 RL 环境的难度与可泛化性, 而不是盯着特定指标或窄查询类别刷分. 下面用 general agent 能力展示这种 RL 环境 Scaling 的改进. 总分算法是: 在 BFCL-V4, VITA-Bench, DeepPlanning, Tool-Decathlon, MCP-Mark 上对每个模型的**排名取平均**. 更广任务上的 Scaling 结果会写进后续技术报告.

> **对一下:** 这段把后训练增益归因于 「RL tasks and environments」 的 Scaling, 同时又说 「rather than optimizing for specific metrics」; 那页 11 图用五榜排名平均, 本身是不是又在优化一套汇总指标?
> 文内区分的是训练目标与展示指标. 训练叙事强调环境难度/可泛化, 反对只刷窄查询; 展示侧仍用五榜排名平均画曲线 (`images/p11-pretraining.png`). 它没有声称训练损失就是这五个榜, 也把更广 Scaling 留给 「upcoming technical report」. 读图时把它当 agent 子集的排名轨迹, 不要当成全后训练目标函数的直接可视化.

<!-- page 11 of 22 -->

Average Ranking vs. Environment Scaling

平均排名 vs. 环境 Scaling

![Chart block](images/p11-pretraining.png)

## Pretraining 预训练

Qwen3.5 advances pretraining across three dimensions—power, efficiency, and versatility:

Qwen3.5 在 power, efficiency, versatility 三个维度推进预训练:

**Power**: Trained on a significantly larger scale of visual-text tokens compared to Qwen3, with enriched Chinese/English, multilingual, STEM, and reasoning data under stricter filtering. This enables cross-generation parity: Qwen3.5-397B-A17B matches the >1T-parameter Qwen3-Max-Base.

**Power**: 相对 Qwen3, 视觉-文本 token 规模显著更大, 中英 / 多语 / STEM / 推理数据更密, 过滤更严. 由此拿到跨代持平: Qwen3.5-397B-A17B 能对齐总参 >1T 的 Qwen3-Max-Base.

**Efficiency**: Built on Qwen3-Next architecture—higher-sparsity MoE, Gated DeltaNet + Gated Attention hybrid attention, stability optimizations, and multi-token prediction. Under the 32k/256k context length, the decoding throughput of Qwen3.5-397B-A17B is 8.6x/19.0x that of Qwen3-Max, and the performance is comparable. The decoding throughput of Qwen3.5-397B-A17B is 3.5x/7.2 times that of Qwen3-235B-A22B.

**Efficiency**: 建立在 Qwen3-Next 架构上——更高稀疏度 MoE, Gated DeltaNet + Gated Attention 混合注意力, 稳定性优化, 以及 MTP. 在 32k/256k 上下文下, Qwen3.5-397B-A17B 的 decode 吞吐是 Qwen3-Max 的 8.6x/19.0x, 表现可比; 相对 Qwen3-235B-A22B 是 3.5x/7.2x.

**Versatility:** Natively multimodal via early text-vision fusion and expanded visual/STEM/video data, outperforming Qwen3-VL at similar scales. Multilingual coverage grows from 119 to 201 languages/dialects; a 250k vocabulary (vs. 150k) boosts encoding/decoding efficiency by 10–60% across most languages.

**Versatility:** 通过早期 text-vision 融合与扩展的视觉 / STEM / 视频数据做成原生多模态, 同规模上超过 Qwen3-VL. 多语覆盖 119→201; 词表 250k (相对 150k) 在多数语言上把编解码效率抬高 10–60%.

> **想:** 32k 时相对 Max 是 8.6x, 256k 时跳到 19.0x; 若瓶颈只是激活参从 Max 降到 17B, 倍率为何随上下文拉长而扩大?
> 文内把效率故事绑在 Qwen3-Next 混合注意力 (Gated DeltaNet + Gated Attention) 与更高稀疏 MoE 上, 而不仅是激活参数字. 线性/混合注意力侧对长上下文 KV 成本更敏感, 所以 256k 相对 32k 的倍率差 (19.0x vs 8.6x) 与页 12 两张 Decode Throughput 图一起读更合理: 长上下文下 hybrid 栈的相对优势被放大. 文内没有给出逐层 KV 字节拆分, 不能把倍率差单归因于 「17B vs Max 激活」.

> **问:** 「matches the >1T-parameter Qwen3-Max-Base」 对的是 Base 还是文首那些 Instruct/Thinking 对照表?
> 钉住的是 **Qwen3-Max-Base**. 页 11 Power 段写 cross-generation parity 对 Base; 页 3-6 的语言榜对照的是 Qwen3-Max-Thinking 等后训练型号. Base 持平叙事与 Instruct/Agent 榜不能串成同一句话.

<!-- page 12 of 22 -->

Decode Throughput (32K)

Decode 吞吐 (32K)

![Image block](images/p12-decode-throughput-256k.png)

Decode Throughput (256K)

Decode 吞吐 (256K)

![Chart block](images/p12-below-we-present-the-performance-of-the-base-models.png)

Below we present the performance of the base models.

下面给出 base 模型的表现.

<table><tbody><tr><td></td><td>Qwen3-235B-A22B</td><td>GLM-4.5-355B-A32B</td><td>DeepSeek-V3.2-671B-A37B</td><td>K2-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td colspan="6">General Knowledge &amp; Multilingual</td></tr><tr><td>MMLU</td><td>87.33</td><td>86.56</td><td>88.11</td><td>87.38</td><td>88.61</td></tr><tr><td>MMLU-Pro</td><td>67.73</td><td>65.00</td><td>62.82</td><td>67.64</td><td>76.01</td></tr><tr><td>MMLU-Redux</td><td>87.44</td><td>86.86</td><td>87.29</td><td>86.65</td><td>89.09</td></tr><tr><td>SuperGPQA</td><td>42.84</td><td>44.56</td><td>43.46</td><td>44.86</td><td>57.96</td></tr><tr><td>C-Eval</td><td>91.82</td><td>85.50</td><td>90.48</td><td>91.82</td><td>91.82</td></tr><tr><td>MMMLU</td><td>81.27</td><td>82.26</td><td>83.20</td><td>82.26</td><td>85.82</td></tr><tr><td>Include</td><td>75.26</td><td>73.41</td><td>76.52</td><td>72.05</td><td>79.27</td></tr><tr><td>Nova</td><td>66.52</td><td>60.96</td><td>60.40</td><td>61.44</td><td>67.55</td></tr></tbody></table>

> **看表:** Base 表 MMLU-Pro 76.01 远高于同表 DeepSeek-V3.2-671B-A37B 的 62.82, 但页 3 Instruct 表同名榜只有 87.8 且落后 Gemini 的 89.8; 两张表的 MMLU-Pro 能直接比代差吗?
> 不能直接比. 页 12 标题是 base models; 页 3 是后训练后的综合评测对照 (含 Thinking / 闭源旗舰). Base 的 76.01 与 Instruct 侧 87.8 不在同一训练阶段, 对照列集合也不同. 用 Base 表论证 「预训练已打赢 V3.2」, 用页 3 表论证 「后训练后相对前沿」, 两句话分开说.

<!-- page 13 of 22 -->

<table><tbody><tr><td></td><td>Qwen3-235B-A22B</td><td>GLM-4.5-355B-A32B</td><td>DeepSeek-V3.2-671B-A37B</td><td>K2-1T-A32B</td><td>Qwen3.5-397B-A17B</td></tr><tr><td colspan="6">Reasoning &amp; STEM</td></tr><tr><td>BBH</td><td>87.95</td><td>87.68</td><td>86.03</td><td>89.11</td><td>90.98</td></tr><tr><td>KoRBench</td><td>50.80</td><td>52.80</td><td>54.00</td><td>53.84</td><td>54.08</td></tr><tr><td>GPQA</td><td>47.47</td><td>44.63</td><td>44.16</td><td>46.78</td><td>54.64</td></tr><tr><td>MATH</td><td>71.84</td><td>61.84</td><td>64.40</td><td>71.50</td><td>74.14</td></tr><tr><td>GSM8K</td><td>91.17</td><td>89.31</td><td>89.12</td><td>92.12</td><td>93.71</td></tr><tr><td colspan="6">Coding</td></tr><tr><td>Evalplus</td><td>77.60</td><td>69.49</td><td>62.68</td><td>71.77</td><td>79.32</td></tr><tr><td>MultiPLE</td><td>65.94</td><td>62.51</td><td>61.88</td><td>70.64</td><td>79.39</td></tr><tr><td>SWE-agentless</td><td>31.77</td><td>29.23</td><td>34.67</td><td>28.54</td><td>43.26</td></tr><tr><td>CRUX-I</td><td>64.25</td><td>67.63</td><td>63.25</td><td>70.50</td><td>71.13</td></tr><tr><td>CRUX-O</td><td>78.88</td><td>77.13</td><td>73.88</td><td>77.13</td><td>82.38</td></tr></tbody></table>

> **核对:** Efficiency 段点名 MTP, 但这份博客有没有给出 MTP 深度, 损失权重, 或它主要服务预训练质量还是 decode 投机?
> 没有. 页 11 只在 Qwen3-Next 能力清单里并列写出 「multi-token prediction」, 与 higher-sparsity MoE / hybrid attention / stability optimizations 同列. 没有式号, 没有头数, 没有讲清 MTP 是训练目标还是推理加速主路径. 机制细节应外链 MTP 单独成篇, 不能从本博客反推实现.

## Infrastructure 基础设施

Qwen3.5 enables efficient native multimodal training via a heterogeneous infrastructure that decouples parallelism strategies across vision and language components, avoiding uniform approaches’ inefficiencies. By exploiting sparse activations for cross-component computation overlap, it achieves near 100%

Qwen3.5 用异构基础设施做高效原生多模态训练: 视觉与语言组件解耦并行策略, 避开一刀切并行的低效. 再靠稀疏激活做跨组件计算重叠, 在混合 text-image-video 数据上相对纯文本基线拿到接近 100%

<!-- page 14 of 22 -->

training throughput versus pure-text baselines on mixed text-image-video data. Complementing this, a native FP8 pipeline applies low precision to activations, MoE routing, and GEMM operations—with runtime monitoring preserving BF16 in sensitive layers—yielding \~50% activation memory reduction and >10% speedup while scaling stably to tens of trillions of tokens.

的训练吞吐. 配套的原生 FP8 管线把低精度用在激活, MoE routing 与 GEMM 上, 运行时监控仍在敏感层保留 BF16, 从而大约 50% 激活显存下降与 >10% 加速, 并能稳定扩到数十万亿 tokens.

To continuously unleash the power of reinforcement learning, we built a scalable asynchronous RL framework that supports Qwen3.5 models of all sizes, spanning text, multimodal, and multi-turn settings. By adopting a fully disaggregated training-inference architecture, the framework achieves significantly improved hardware utilization, dynamic load balancing, and finegrained fault recovery. It further optimizes throughput and enhances train–infer consistency via techniques such as FP8 end-to-end training, rollout router replay, speculative decoding, and multi-turn rollout locking. Through tight system-algorithm co-design, the framework effectively bounds gradient staleness and mitigates data skewness, preserving both training stability and performance. Moreover, it natively supports agentic workflows, facilitating seamless multi-turn interactions without framework-induced interruptions. This decoupled design enables the system to accommodate million-scale agent scaffolds and environments, substantially boosting model generalization. Collectively, these optimizations yield a 3×–5× end-to-end speedup, demonstrating superior stability, efficiency, and scalability.

为持续释放强化学习算力, 他们建了可扩展的异步 RL 框架, 覆盖 Qwen3.5 全尺寸, 以及文本 / 多模态 / 多轮设置. 训练-推理完全拆开后, 硬件利用率, 动态负载均衡与细粒度故障恢复都更好. 还用 FP8 端到端训练, rollout router replay, 投机解码, multi-turn rollout locking 等抬吞吐并加强 train-infer 一致性. 系统-算法共设计用来约束 gradient staleness, 缓解数据偏斜, 稳住训练. 框架原生支持 agentic 工作流, 多轮交互不被框架打断; 解耦设计能容纳百万级 agent scaffold 与环境. 合起来端到端加速约 3×–5×.

![Image block](images/p14-play-with-qwen3-5.png)

> **拆开:** 「near 100% training throughput versus pure-text baselines on mixed text-image-video data」 和 「FP8 ... ~50% activation memory reduction」 是同一套优化的两个读数吗?
> 文内写成两条互补路径. 页 13-14 先讲异构并行 + 稀疏激活重叠, 把混合模态吞吐追到接近纯文本基线; 再讲 FP8 管线降激活显存约 50% 并 >10% 加速. 前者回答 「多模态训练会不会把吞吐打穿」, 后者回答 「精度与显存」. 不要把 ~100% 吞吐读成 FP8 的直接结果.

> **确认:** rollout router replay 在异步 RL 段与 「bounds gradient staleness」 并列表述; 文内有没有说明 replay 的是旧路由还是预测路由?
> 没有细分. 页 14 只把 「rollout router replay」 列为抬 train-infer 一致性的技术之一, 与 FP8 e2e, speculative decoding, multi-turn rollout locking 并列, 并另说共设计约束 gradient staleness. 没有给出 replay 缓存的是 π_old 路由还是预测路由, 也没有式号. 只能记 「博客声称用了 router replay」, 机制细节不能从本页编造.

<!-- page 15 of 22 -->

## Play with Qwen3.5 试用 Qwen3.5

### Chat with Qwen3.5 与 Qwen3.5 对话

Feel free to use Qwen3.5 on Qwen Chat. We provide three modes, auto, thinking, and fast, to users to choose. With “Auto” mode, users can leverage adaptive thinking, which can think and use tools including search and code interpreter, while with “Thinking” mode, the model can think deeply for hard problems. With “Fast” mode, the model answers questions instantly without spending tokens on thinking.

可在 Qwen Chat 使用 Qwen3.5. 提供 auto, thinking, fast 三种模式. 「Auto」 走自适应思考, 可以思考并调用搜索与 code interpreter 等工具; 「Thinking」 对难题深想; 「Fast」 立刻作答, 不把 token 花在 thinking 上.

### ModelStudio

Users can experience our flagship model, Qwen3.5-Plus, by invoking it through Alibaba Cloud ModelStudio. To enable advanced capabilities such as reasoning, web search, and Code Interpreter, simply pass the following parameters:

可通过阿里云 ModelStudio 调用旗舰 **Qwen3.5-Plus**. 要打开推理, 网页搜索与 Code Interpreter 等能力, 传入下列参数:

enable\_thinking: Activates reasoning mode (chain-of-thought processing)

enable_thinking: 打开推理模式 (CoT 处理)

enable\_search: Enables web search and Code Interpreter functionality

enable_search: 打开网页搜索与 Code Interpreter

Example code is provided below:

示例代码如下:

```python
"""
Environment variables (per official docs):
    DASHSCOPE_API_KEY: Your API Key from https://bailian.console.aliyun.com
    DASHSCOPE_BASE_URL: (optional) Base URL for compatible-mode API.
    DASHSCOPE_MODEL: (optional) Model name; override for different models.
    DASHSCOPE_BASE_URL:
        - Beijing: https://dashscope.aliyuncs.com/compatible-mode/v1
        - Singapore: https://dashscope-intl.aliyuncs.com/compatible-mode/v1
        - US (Virginia): https://dashscope-us.aliyuncs.com/compatible-mode/v1
"""
from openai import OpenAI
import os

api_key = os.environ.get("DASHSCOPE_API_KEY")
if not api_key:
    raise ValueError(
        "DASHSCOPE_API_KEY is required. "
        "Set it via: export DASHSCOPE_API_KEY='your-api-key'"
    )

client = OpenAI(
    api_key=api_key,
    base_url=os.environ.get(
```

> **回看:** Chat 产品有 Auto / Thinking / Fast 三档, API 示例却只暴露 `enable_thinking` 与 `enable_search`; Fast 模式在兼容 API 里对应哪个开关组合?
> 博客没有给出一一映射. 页 15 产品侧写三模式; 同页 API 只示范 `enable_thinking: True`, `enable_search: False`. Fast 「without spending tokens on thinking」 更接近关闭 thinking, 但文内没有写 `enable_thinking=False` 就等于 Fast, 也没有第三参数. 集成时不能把产品三模式名直接当成两个布尔字段的枚举.

<!-- page 16 of 22 -->

```python
"DASHSCOPE_BASE_URL",
    "https://dashscope-intl.aliyuncs.com/compatible-mode/v1",
),
)

messages = [{"role": "user", "content": "Introduce Qwen3.5."}]

model = os.environ.get(
    "DASHSCOPE_MODEL",
    "qwen3.5-plus",
)
completion = client.chat.completions.create(
    model=model,
    messages=messages,
    extra_body={
        "enable_thinking": True,
        "enable_search": False
    },
    stream=True
)

reasoning_content = ""  # Full reasoning trace
answer_content = ""  # Full response
is_answering = False  # Whether we have entered the answer phase
print("\n" + "=" * 20 + "Reasoning" + "=" * 20 + "\n")

for chunk in completion:
    if not chunk.choices:
        print("\nUsage:")
        print(chunk.usage)
        continue

    delta = chunk.choices[0].delta

    # Collect reasoning content only
    if hasattr(delta, "reasoning_content") and delta.reasoning_content is
        if not is_answering:
            print(delta.reasoning_content, end="", flush=True)
        reasoning_content += delta.reasoning_content

    # Received content, start answer phase
    if hasattr(delta, "content") and delta.content:
        if not is_answering:
            print("\n" + "=" * 20 + "Answer" + "=" * 20 + "\n")
            is_answering = True
    print(delta.content, end="", flush=True)
    answer_content += delta.content
```

> **停一下:** 示例把 `reasoning_content` 与 `content` 拆成两相; 这是否意味着开源 397B-A17B 权重也保证同一套 delta 字段?
> 不能从本页推出. 示例挂在 ModelStudio / DashScope 兼容 API 与默认模型名 `qwen3.5-plus` 下. 开源旗舰段落没有给出等价的 transformers 生成接口字段. `reasoning_content` 是托管流式协议细节, 不是页 1 开源权重规格的一部分.

<!-- page 17 of 22 -->

You can effortlessly integrate the Bailian API with third-party coding tools, such as Qwen Code, Claude Code, Cline, OpenClaw, OpenCode, etc., to enable a seamless “vibe coding” experience.

可以把百炼 API 接到 Qwen Code, Claude Code, Cline, OpenClaw, OpenCode 等第三方编码工具, 做连贯的 「vibe coding」 体验.

## Summary and Future Work

Qwen3.5 provides a strong foundation for universal digital agents through its efficient hybrid architecture and native multimodal reasoning. The next leap requires shifting from model scaling to system integration: building agents with persistent memory for cross-session learning, embodied interfaces for real-world interaction, self-directed improvement mechanisms, and economic awareness to operate within practical constraints. The goal is coherent systems that function autonomously over time, transforming today’s task-bound assistants into persistent, trustworthy partners capable of executing complex, multi-day objectives with human-aligned judgment.

Qwen3.5 以高效的混合架构与原生多模态推理, 为通用数字 Agent 打下坚实基础. 下一步的跃迁在于从模型 scaling 转向系统集成: 构建带持久记忆的 Agent 实现跨会话学习, 具身接口打通真实世界交互, 自我改进机制与经济意识让系统在现实约束下运行. 目标是能长期自主运转的连贯系统, 把今天被任务绑住的助手, 变成可执行多日复杂目标, 具备人类对齐判断力的持久, 可信伙伴.

## Citation 引用

Feel free to cite the following article if you find Qwen3.5 helpful:

若觉得 Qwen3.5 有用, 可引用如下条目:

```bib
@misc{qwen35blog,
    title = {Qwen3.5: Accelerating Productivity with Native Multimodal Ag
    url = {https://qwen.ai/blog?id=qwen3.5},
    author = {Qwen Team},
    month = {February},
    year = {2026}
}
```

## [Source](https://qwen.ai/blog?id=qwen3.5)

[AI](https://community.alibabacloud.com/tags/type_blog-tagid_3219/)

[Open Source](https://community.alibabacloud.com/tags/type_blog-tagid_24234/)

[Generative AI](https://community.alibabacloud.com/tags/type_blog-tagid_36033/)

[AI models](https://community.alibabacloud.com/tags/type_blog-tagid_36298/)

[GenAI](https://community.alibabacloud.com/tags/type_blog-tagid_36358/)

[LLMs](https://community.alibabacloud.com/tags/type_blog-tagid_36362/)

[Qwen](https://community.alibabacloud.com/tags/type_blog-tagid_36919/)

[AI Agent](https://community.alibabacloud.com/tags/type_blog-tagid_37188/)

[Qwen3.5](https://community.alibabacloud.com/tags/type_blog-tagid_39642/)

[Native Multimodal Agents](https://community.alibabacloud.com/tags/type_blog-tagid_39643/)

[Vision-language model](https://community.alibabacloud.com/tags/type_blog-tagid_39644/)

> **再看:** Citation 的 title 截成 「Native Multimodal Ag」, 与文首标题 「Towards Native Multimodal Agents」 / qwen.ai 博客标题是否同一条目?
> 页 17 bib 块在抓取时被截断 (`Native Multimodal Ag`), url 仍是 `https://qwen.ai/blog?id=qwen3.5`. 页 1 社区标题是 「Towards Native Multimodal Agents」. 引用时应回 qwen.ai 原文补全 title, 不要把截断串当成官方定稿题名.

<!-- page 18 of 22 -->

 0  1  0

  

Share on

分享到

## Read previous post: 上一篇

[Qwen App's CNY Campaign Attracts Over 120 Million Orders](https://www.alibabacloud.com/blog/qwen-apps-cny-campaign-attracts-over-120-million-orders_602885) Read next post:

[Qwen App's CNY Campaign Attracts Over 120 Million Orders](https://www.alibabacloud.com/blog/qwen-apps-cny-campaign-attracts-over-120-million-orders_602885) 下一篇:

[Alibaba Unveiled Open-sourced Embodied Foundation Model for Robotics](https://www.alibabacloud.com/blog/alibaba-unveiled-open-sourced-embodied-foundation-model-for-robotics_602898)

[Alibaba Unveiled Open-sourced Embodied Foundation Model for Robotics](https://www.alibabacloud.com/blog/alibaba-unveiled-open-sourced-embodied-foundation-model-for-robotics_602898)

## You may also like 你可能还喜欢

[Qwen3.6-Plus: Towards Real World Agents](https://www.alibabacloud.com/blog/qwen3-6-plus-towards-real-world-agents_603005)

Alibaba Cloud Community - April 2, 2026

阿里云社区 - 2026 年 4 月 2 日

[Qwen-Robot Suite: A Foundation Model Suite for Physical World Intelligence](https://www.alibabacloud.com/blog/qwen-robot-suite-a-foundation-model-suite-for-physical-world-intelligence_603262)

Alibaba Cloud Community - June 17, 2026

阿里云社区 - 2026 年 6 月 17 日

[Alibaba Cloud Expands AI Infrastructure in Japan with Launch of Fifth Data Center and New Model Service Platform](https://www.alibabacloud.com/blog/alibaba-cloud-expands-ai-infrastructure-in-japan-with-launch-of-fifth-data-center-and-new-model-service-platform_603269)

Alibaba Cloud Community - June 18, 2026

阿里云社区 - 2026 年 6 月 18 日

## Comments 评论

Write your comment...

写下评论...

[Qwen3.8-Flash-Next: A New Architecture, Towards Ultimate Cost-Efficiency](https://www.alibabacloud.com/blog/qwen3-8-flash-next-a-new-architecture-towards-ultimate-cost-efficiency_603501)

Alibaba Cloud Community - August 27, 2026

阿里云社区 - 2026 年 8 月 27 日

[Qwen3.8-Omni-Flash: Omni Senses. Agentic Delivery.](https://www.alibabacloud.com/blog/qwen3-8-omni-flash-omni-senses--agentic-delivery-_603580)

Alibaba Cloud Community - September 20, 2026

阿里云社区 - 2026 年 9 月 20 日

[Qwen3.6-35B-A3B: Agentic Coding Power, Now Open to All](https://www.alibabacloud.com/blog/qwen3-6-35b-a3b-agentic-coding-power-now-open-to-all_603043)

Alibaba Cloud Community - April 17, 2026

阿里云社区 - 2026 年 4 月 17 日

![Image block](images/p18-post.png)

> **对一下:** 页 18-22 的相关文章链到 Qwen3.6 / 3.8; 这些后续型号的架构断言能反向解释本篇 Qwen3.5 的 Gated DeltaNet 配置吗?
> 不能. 本篇技术主张停在页 11-14 的 Qwen3-Next 表述与异步 RL 清单; 页 18 起是社区 「You may also like」 壳层. 后续博文标题出现在推荐位, 不构成本文的层比或专家数披露.

<!-- page 19 of 22 -->

Post

帖子

<!-- page 20 of 22 -->

[Alibaba Cloud Community](https://community.alibabacloud.com/users/5337701737861729) 1,543 posts | 517 followers

Follow

关注

Related Products

相关产品

![Image block](images/p20-qwen-https-community-alibabacloud-com-go-1-472.png)

## [Qwen](https://community.alibabacloud.com/go/1/472)

Full-range, open-source, multimodal, and multi-functional

全系列, 开源, 多模态, 多功能

[Learn More](https://community.alibabacloud.com/go/1/472)

了解更多

![Image block](images/p20-alibaba-cloud-model-studio-https-community-alibabacloud.png)

## [Alibaba Cloud Model Studio](https://community.alibabacloud.com/go/1/473)

A one-stop generative AI platform to build intelligent applications that understand your business, based on Qwen model series such as Qwen-Max and other popular models

一站式生成式 AI 平台, 基于 Qwen-Max 等 Qwen 系列与其他流行模型, 构建理解业务的智能应用

[Learn More](https://community.alibabacloud.com/go/1/473)

了解更多

![Image block](images/p20-token-plan-https-community-alibabacloud-com-go-1-480.png)

## [Token Plan](https://community.alibabacloud.com/go/1/480)

Build more, spend less. One plan, every modality.

做更多, 花更少. 一个方案, 覆盖各模态.

![Image block](images/p20-learn-more-https-community-alibabacloud-com-go-1-480.png)

[Learn More](https://community.alibabacloud.com/go/1/480)

了解更多

![Image block](images/p20-image.png)

![Image block](images/p20-qwenwork-https-community-alibabacloud-com-go-1-481.png)

## [QwenWork](https://community.alibabacloud.com/go/1/481)

QwenWork is dedicated to helping employees strengthen their professional competitiveness in the AI era and to enabling enterprises to improve organizational effectiveness.

QwenWork 致力于帮助员工在 AI 时代增强专业竞争力, 并帮助企业提升组织效能.

[Learn More](https://community.alibabacloud.com/go/1/481)

了解更多

> **想:** 词表从 150k 提到 250k 宣称多数语言编解码效率 10–60%; 文内有没有按语种给出效率表, 好判断谁接近 60%?
> 没有. 页 11 Versatility 只给区间 10–60% 与 「across most languages」, 没有语种分列, 也没有说明效率是按 token 数, 字节数还是吞吐测的. 只能记住词表扩容与效率区间主张, 不能点名某一语言拿到了上限.

<!-- page 21 of 22 -->

More Posts by Alibaba …

阿里云更多文章 …

[See All](https://community.alibabacloud.com/users/5337701737861729/article)

[AliViews: Eddie Wu Shares Alibaba's Strategic Full-Stack AI Roadmap at the 2026 Apsara Conference](https://www.alibabacloud.com/blog/aliviews-eddie-wu-shares-alibabas-strategic-full-stack-ai-roadmap-at-the-2026-apsara-conference_603595)

[Alibaba Cloud Expands Global Infrastructure and AI Portfolio to Accelerate Enterprise AI Adoption](https://www.alibabacloud.com/blog/alibaba-cloud-expands-global-infrastructure-and-ai-portfolio-to-accelerate-enterprise-ai-adoption_603594)

[Alibaba Unveils Roadmap on Full-Stack AI Strategy from Chips, Cloud Infrastructure, Models to Agents](https://www.alibabacloud.com/blog/alibaba-unveils-roadmap-on-full-stack-ai-strategy-from-chips-cloud-infrastructure-models-to-agents_603589)

[Qwen-Image-2.1: Compact, Efficient, and Unified Image Creation](https://www.alibabacloud.com/blog/qwen-image-2-1-compact-efficient-and-unified-image-creation_603586)

[Qwen3.8-LiveTranslate: Names the Speaker. Carries the Meaning.](https://www.alibabacloud.com/blog/qwen3-8-livetranslate-names-the-speaker--carries-the-meaning-_603581)

[Qwen3.8-Omni-Flash: Omni Senses. Agentic Delivery.](https://www.alibabacloud.com/blog/qwen3-8-omni-flash-omni-senses--agentic-delivery-_603580)

[Alibaba Cloud Named a Leader in Gartner® Magic Quadrant™ for Generative AI Model Providers](https://www.alibabacloud.com/blog/alibaba-cloud-named-a-leader-in-gartner%C2%AE-magic-quadrant%E2%84%A2-for-generative-ai-model-providers_603574)

[Choosing the Right Model for Your Work: A Guide to the Qwen Series](https://www.alibabacloud.com/blog/choosing-the-right-model-for-your-work-a-guide-to-the-qwen-series_603566)

[為你的工作選對模型:以 Qwen 系列為例](https://www.alibabacloud.com/blog/%E7%82%BA%E4%BD%A0%E7%9A%84%E5%B7%A5%E4%BD%9C%E9%81%B8%E5%B0%8D%E6%A8%A1%E5%9E%8B%EF%BC%9A%E4%BB%A5-qwen-%E7%B3%BB%E5%88%97%E7%82%BA%E4%BE%8B_603565)

[Still Running Your Own Hive Metastore? Point Spark Straight at OSS Tables and Iceberg Just Works 
$$
OSS Tables Deep Dive
$$
](https://www.alibabacloud.com/blog/still-running-your-own-hive-metastore-point-spark-straight-at-oss-tables-and-iceberg-just-works-oss-tables-deep-dive_603557)

## A Free Trial That Lets You Build Big! 一次能做大项目的免费试用!

![Image block](images/p21-start-building-with-80-products-and-up-to-12-months.png)

Start building with 80+ products and up to 12 months usage for Elastic Compute Service

从 80+ 产品起步, Elastic Compute Service 最长可用约 12 个月

[Get Started for Free](https://www.alibabacloud.com/campaign/free-trial/enterprise)

免费开始

> **问:** early text-vision fusion 被写成原生多模态相对 Qwen3-VL 的优势; 博客有没有层位置, 融合损失或视觉编码器是否仍独立可拆的信息?
> 没有. 页 11 只给定性句 「early text-vision fusion」 与 「outperforming Qwen3-VL at similar scales」, 加上视觉/STEM/视频数据扩展. 没有融合层号, 没有编码器是否冻结, 也没有对比 late fusion 的消融表. 「原生」 在本博客里是产品/数据叙事, 不是可复现的融合公式.

<!-- page 22 of 22 -->

![Image block](images/p22-image.png)

> **核对:** MCP-Mark 把 Playwright 回复截断在 32k tokens, Search Agent folding 阈值却写在累计 Tool Response; 若同一次 agent 轨迹既走 MCP 又走搜索, 两套截断谁先生效?
> 本博客把它们写成不同评测脚注, 没有给出统一的生产默认. 页 6: MCP-Mark 专测里 Playwright 截断 32k; Search Agent 脚注是 folding@累计 Tool Response 阈值 (并提到 256k 策略标签). 没有描述两条规则的优先级. 复现某一榜分时只能跟该榜脚注, 不能假设全局只有一种截断.
