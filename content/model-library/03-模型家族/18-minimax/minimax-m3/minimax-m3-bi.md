---
title: "MiniMax-M3 · 对照译稿"
category: "模型库"
tags: ["MiniMax", "对照译稿"]
published: true
excerpt: "MiniMax-M3 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
# MiniMax-M3 模型卡对照稿

源文是 Hugging Face 上 MiniMaxAI/MiniMax-M3 模型卡页面的浏览器打印件，8 页，5 张图，由 MinerU 转成 Markdown。这是模型卡，不是论文，页面上只有规格一句话，三条亮点，一张 32 行的评测表，评测方法说明，MSA 三张曲线图和部署说明。本稿只对照页面上印出来的文字和数字，不从 M2，M2.7 或 MiniMax-01 的目录搬参数。第 4 页和第 5 页在 PDF 里是整页图片，没有文字层，md 里评测方法有几条被截断或整条漏掉，本稿按 PDF 页面图像补回，改动处在该段中文里说明。5 张图里 2 张是网站界面的小图标，3 张是 MSA 与 GQA 的对比曲线。

<!-- page 1 of 8 -->

![深色圆角框里的数字 29，PDF 文字层里它紧跟在 Community 标签后面，应是社区讨论区的条数](images/p01-image.png)

![Hugging Face 站点左上角 logo 的黄色手形部分](images/p01-search-models-datasets-users.png)

Search models, datasets, users...

站点顶部搜索框的占位文字：搜索模型，数据集，用户。

## [MiniMaxAI](https://huggingface.co/MiniMaxAI)/[MiniMax-M3](https://huggingface.co/MiniMaxAI/MiniMax-M3)

模型仓库名：MiniMaxAI 组织下的 MiniMax-M3。

1.55k · Follow MiniMax · 10.9k

仓库名右侧的点赞数 1.55k，以及关注 MiniMax 组织的按钮，组织关注者 10.9k. md 把这几项拆成四行，这里合成一行；PDF 文字层在 10.9k 前面还有一个 Like 字样，md 没转出来。

[Image-Text-to-Text](https://huggingface.co/models?pipeline_tag=image-text-to-text) · [Transformers](https://huggingface.co/models?library=transformers) · [Safetensors](https://huggingface.co/models?library=safetensors) · [minimax\_m3\_vl](https://huggingface.co/models?other=minimax_m3_vl) · [multimodal](https://huggingface.co/models?other=multimodal) · [Mixture of Experts](https://huggingface.co/models?other=moe) · [agent](https://huggingface.co/models?other=agent) · [coding](https://huggingface.co/models?other=coding) · [video](https://huggingface.co/models?other=video) · [conversational](https://huggingface.co/models?other=conversational) · [custom\_code](https://huggingface.co/models?other=custom_code) · [Eval Results](https://huggingface.co/models?other=eval-results)

模型标签：任务类型是图文到文本（Image-Text-to-Text）；支持的库是 Transformers；权重格式 Safetensors；模型类型 minimax_m3_vl；其余标签依次是多模态，MoE，agent，编程，视频，对话，自定义代码，带评测结果。md 在 Mixture of Experts 前面多出一个 「器」 字，那是标签图标被识别成了汉字，本稿删去。

> **想：** 这里的模型大小写 427B params，第 3 页正文却写约 428B，差的 1B 是什么？
> 本页没有解释。427B 来自 Hugging Face 按 Safetensors 文件统计的数，428B 是正文里带 「~」 的约数，两者差约 0.2% (1 / 428)。页面没说两个数各自的统计范围，所以只能记下两个数都出现过，不去猜是谁算漏了。

arxiv:2606.13392 · License: minimax-community

关联论文 arXiv 2606.13392；许可证 minimax-community。

Deploy · Copy to bucket **NEW** · Use this model

页面按钮：部署，复制到存储桶（标了 NEW），使用此模型。

[**Model card**](https://huggingface.co/MiniMaxAI/MiniMax-M3) · [Files](https://huggingface.co/MiniMaxAI/MiniMax-M3/tree/main) · [**xet**](https://huggingface.co/MiniMaxAI/MiniMax-M3/tree/main) · Community

标签页：模型卡（当前页），文件，xet 存储标记，社区。社区旁边的数字 29 就是页首第一张图。

Downloads last month 167,808

上月下载量 167,808。

**Safetensors** · Model size 427B params · Tensor type BF16 · F32

Safetensors 信息栏：模型大小 427B 参数，张量类型 BF16 和 F32。

<u>Chat template</u> · <u>Files info</u>

聊天模板，文件信息，两个带下划线的链接。

## Inference Providers [NEW](https://huggingface.co/docs/inference-providers)

推理服务商（标了 NEW）。

Novita +2

服务商 Novita. PDF 文字层在它后面还有 「+2」，表示另有两家没有展开，md 漏了这一项，按 PDF 补回。

[Image-Text-to-Text](https://huggingface.co/tasks/image-text-to-text) · Examples

在线试用组件：任务类型图文到文本，下面是示例区。

Input a message to start chatting with **MiniMaxAI/MiniMax-M3**.

输入一条消息，开始和 MiniMaxAI/MiniMax-M3 对话。

Your prompt here... · Send · View Code · [Compare providers](https://huggingface.co/inference/models?model=MiniMaxAI%2FMiniMax-M3)

输入框占位文字 「在这里写提示词」，发送按钮，查看代码，比较服务商。

> **问：** 任务标签只写了图文到文本，可标签列表里又有 video，这个模型到底收不收视频？
> 收。第 3 页正文说 M3 从第一步就在文本，图像，视频上混合训练，第 4 页评测表也有 Video-MMMU 和 VideoMME 两行。任务标签这里只填了一个，是图文到文本，视频能力体现在 video 标签和正文里。页面没有提音频。

<!-- page 2 of 8 -->

## Model tree for MiniMaxAI/MiniMax-M3

MiniMax-M3 的模型树。

**Adapters** [1 model](https://huggingface.co/models?other=base_model:adapter:MiniMaxAI/MiniMax-M3) · **Finetunes** [14 models](https://huggingface.co/models?other=base_model:finetune:MiniMaxAI/MiniMax-M3) · **Quantizations** [58 models](https://huggingface.co/models?other=base_model:quantized:MiniMaxAI/MiniMax-M3)

以 M3 为基座的衍生模型：适配器 1 个，微调 14 个，量化 58 个。

## Spaces using MiniMaxAI/MiniMax-M3 52

使用 MiniMax-M3 的 Space 共 52 个。

[MiniMaxAI/MiniMax-Music3-workflow](https://huggingface.co/spaces/MiniMaxAI/MiniMax-Music3-workflow) · [embedl/hfviewer](https://huggingface.co/spaces/embedl/hfviewer) · smolagents/ml-intern · [ginigen-ai/open-router-leaderboard](https://huggingface.co/spaces/ginigen-ai/open-router-leaderboard) · [akhaliq/MiniMax-Music3-workflow](https://huggingface.co/spaces/akhaliq/MiniMax-Music3-workflow) · + 47 Spaces

页面展开了 5 个 Space: MiniMax 官方的 MiniMax-Music3 工作流，embedl 的 hfviewer，smolagents 的 ml-intern，ginigen-ai 的 OpenRouter 排行榜，akhaliq 转载的 MiniMax-Music3 工作流，其余 47 个折叠。5 加 47 等于 52，和标题的数对得上。每个 Space 名前的彩色小图标本稿删去。

## Collection including MiniMaxAI/MiniMax-M3

收录本模型的合集。md 在标题前多出一个 「品」 字，是合集图标被识别成了汉字，删去。

[**MiniMax-M3** Collection](https://huggingface.co/collections/MiniMaxAI/minimax-m3) · [7 items • Updated Aug 15 • 22](https://huggingface.co/collections/MiniMaxAI/minimax-m3)

MiniMax-M3 合集，共 7 项，8 月 15 日更新，22 个赞。页面没印年份。

## Paper for MiniMaxAI/MiniMax-M3

本模型对应的论文。

## [MiniMax Sparse Attention](https://huggingface.co/papers/2606.13392)

论文标题：MiniMax Sparse Attention（MiniMax 稀疏注意力）。

[Paper • 2606.13392 • Published Jun 11 • 168](https://huggingface.co/papers/2606.13392)

论文编号 2606.13392, 6 月 11 日发布，168 个赞。

## Evaluation results

评测结果（模型卡元数据里登记的榜单成绩）。

[mercor/apex-agents](https://huggingface.co/datasets/mercor/apex-agents) · Apex Agents [leaderboard](https://huggingface.co/datasets/mercor/apex-agents?eval_result=MiniMaxAI/MiniMax-M3&leaderboard_task_id=apex-agents) 27.7 \*

mercor 的 Apex Agents 数据集，成绩 27.7，带星号。

[SWE-bench/SWE-bench\_Verified](https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified) · Swe Bench Resolved [leaderboard](https://huggingface.co/datasets/SWE-bench/SWE-bench_Verified?eval_result=MiniMaxAI/MiniMax-M3&leaderboard_task_id=swe_bench_%_resolved) 80.5 \*

SWE-bench Verified 的解决率 80.5，带星号。

[ScaleAI/SWE-bench\_Pro](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro) · SWE Bench Pro [leaderboard](https://huggingface.co/datasets/ScaleAI/SWE-bench_Pro?eval_result=MiniMaxAI/MiniMax-M3&leaderboard_task_id=SWE_Bench_Pro) 59\*

ScaleAI 的 SWE-bench Pro，成绩 59，带星号。第 4 页表里写成 59.0。

## [IntelligenceLab/Long-Horizon-Terminal-Bench](https://huggingface.co/datasets/IntelligenceLab/Long-Horizon-Terminal-Bench) [leaderboard](https://huggingface.co/datasets/IntelligenceLab/Long-Horizon-Terminal-Bench?eval_result=MiniMaxAI/MiniMax-M3)

IntelligenceLab 的长程终端基准（Long-Horizon-Terminal-Bench，下文简称 LHTB）。

Lhtb [source](https://zli12321.github.io/LHTB/leaderboard.html) mean reward x100 over 4… 38.5 \*

LHTB 平均奖励乘以 100，成绩 38.5，带星号。说明文字在 「over 4」 后面被截断，页面没印完。

Lhtb Solved [source](https://zli12321.github.io/LHTB/leaderboard.html) 3/46 tasks solved at rew… 3\*

LHTB 解决数：46 个任务解决了 3 个，成绩记 3，带星号。说明文字同样在 「at rew」 处截断。

[MME-Benchmarks/Video-MME-v2](https://huggingface.co/datasets/MME-Benchmarks/Video-MME-v2) · Video Mme V2 [leaderboard](https://huggingface.co/datasets/MME-Benchmarks/Video-MME-v2?eval_result=MiniMaxAI/MiniMax-M3&leaderboard_task_id=video-mme-v2) 85.4 \*

Video-MME-v2 数据集，成绩 85.4，带星号。md 这一行没有分数，PDF 文字层的分数列按顺序是 27.7, 80.5, 59, 38.5, 3, 85.4, 78.1，第 6 个 85.4 对应这一行，按 PDF 补回。

[MMMU/MMMU\_Pro](https://huggingface.co/datasets/MMMU/MMMU_Pro) · Mmmu Pro Standard 10 Options [leaderboard](https://huggingface.co/datasets/MMMU/MMMU_Pro?eval_result=MiniMaxAI/MiniMax-M3&leaderboard_task_id=mmmu_pro_standard_10_options) 78.1 \*

MMMU-Pro 标准 10 选项设置，成绩 78.1，带星号。页面没有解释星号的含义。

Expand 4 benchmarks

展开另外 4 项基准。打印件没有展开，这 4 项的名字和分数页面上没有。

> **核对：** 这里 Video-MME-v2 记 85.4，第 4 页表里 85.4 却记在 「VideoMME (w/ sub)」 名下，第 5 页方法说明又说 M3 在 512 帧下是 84.6，到底哪个数配哪个设置？
> 第 4 页表的 VideoMME (w/ sub) 是 85.4，第 5 页方法说明给的最大帧数是 1024，并单独注明 「MiniMax M3 scored 84.6 at 512 frames」。合起来读，85.4 应是 1024 帧带字幕的成绩，84.6 是 512 帧的成绩。但元数据把 85.4 挂在 Video-MME-v2 数据集下，表格和方法说明里都没有出现 「v2」 字样，页面没说两者是不是同一个基准。另外 Video-MMMU 那一行碰巧也是 84.6，读的时候别把两个 84.6 混在一起。

> **看表：** LHTB 的 38.5 和 3/46 在第 4 页的大表里找不到，这两个数该怎么放？
> 大表 32 行里没有 LHTB，这两个数只出现在元数据里。3/46 约是 6.5% (3 / 46). 38.5 是 「平均奖励乘以 100」，说明在 「over 4」 处被截断，可能是 4 次运行的平均，但页面没印完，不能确定。两个数一个是平均奖励，一个是完全解决的任务数，差距说明多数任务拿到了部分奖励但没有解完。

<!-- page 3 of 8 -->

MINIMAX

模型卡正文顶部的 MiniMax 字标。md 把它转成 「UMINIMAX」 并当成二级标题，多出的 U 是 logo 图形，本稿删去并去掉标题格式。

[MiniMax Agent](https://agent.minimax.io/) · [API](https://platform.minimax.io/docs/guides/text-generation) · [MiniMax Website](https://www.minimax.io/) · [ModelScope MiniMax AI](https://modelscope.cn/organization/minimax) · [WeChat](https://platform.minimaxi.com/docs/faq/contact-us) · [Discord](https://discord.com/invite/DPC4AHFCBw) · [Hugging Face](https://huggingface.co/MiniMaxAI) · [GitHub](https://github.com/MiniMax-AI/MiniMax-M3) · [arXiv 2606.13392](https://arxiv.org/abs/2606.13392) · [LICENSE](https://huggingface.co/MiniMaxAI/MiniMax-M3/blob/main/LICENSE)

一排徽章链接：MiniMax Agent 产品，API 文档，MiniMax 官网，魔搭社区的 MiniMax 组织，微信联系方式，Discord，Hugging Face 组织页，GitHub 仓库，arXiv 论文 2606.13392，许可证文件。

MiniMax-M3 is a native multimodal model with 1M context. It has \~428B parameters and \~23B activated parameters.

MiniMax-M3 是原生多模态模型，上下文长度 1M. 总参数约 428B，激活参数约 23B。

> **拆开：** 23B 占 428B 的多少，这个比例能拆到专家层面吗？
> 约 5.4% (23 / 428)。页面只打了 Mixture of Experts 标签，没有给专家数，每 token 选几个专家，层数，隐藏维度或视觉编码器的大小，所以拆不下去：分不清 23B 里多少是每个 token 必经的注意力和嵌入，多少是被选中的专家。同家族其他型号的配置不能代入，那不是本页的数。

## Highlights:

亮点。

**Native Multimodality:** M3 undergoes mixed-modality training from the very first step, enabling deeper semantic fusion across text, image, and video.

**原生多模态：** M3 从训练的第一步起就混合多种模态，让文本，图像，视频之间的语义融合得更深。

**Context Scaling via Sparse Attention:** M3 introduces MiniMax Sparse Attention (MSA) to improve long context efficiency. M3 delivers 9× prefill and 15× decode speedups compared to M2 at 1M context, reducing per-token compute to 1/20.

**用稀疏注意力做上下文 Scaling:** M3 引入 MiniMax 稀疏注意力（MSA）来提升长上下文效率。在 1M 上下文下，和 M2 相比，M3 的 prefill 快 9 倍，decode 快 15 倍，每个 token 的计算量降到 1/20。

**Coding & Cowork Capability:** M3 achieves frontier-level performance across long-horizon agentic benchmarks, excelling in both coding and cowork.

**编程与协作办公能力：** M3 在长程 agent 基准上达到前沿水平，编程和协作办公（cowork）两方面都表现突出。md 把 「long-horizon」 跨行时的连字符丢了，写成 「longhorizon」，这里按 PDF 文字层恢复。

> **确认：** 「compared to M2」 里的 M2，用的是什么注意力，在什么硬件上测的？
> 本页都没说。这句话只给了 M3 相对 M2 的两个倍数和一个比例，M2 的注意力结构，测速硬件，batch 大小，是整模型端到端还是只测注意力，页面上一概没有。所以 9 倍和 15 倍只能原样记下，不能拿 M2 目录里的配置去反推。

<!-- page 4 of 8 -->

<table><tr><td></td><td>MiniMax M3</td><td>MiniMax M2.7</td><td>Claude Opus 4.7</td><td>GPT 5.5</td><td>Gemini 3.1 Pro</td><td>Claude Sonnet 4.6</td><td>DeepSeek V4 Pro</td><td>GLM 5.1 Thinking</td><td>Kimi K2.6 Thinking</td></tr><tr><td>Coding</td><td></td><td colspan="8"></td></tr><tr><td>SWE-Bench Verified</td><td>80.5</td><td>79.9</td><td>87.6</td><td>82.9</td><td>80.6</td><td>79.6</td><td>80.6</td><td>-</td><td>80.2</td></tr><tr><td>SWE-Bench Pro</td><td>59.0</td><td>56.2</td><td>64.3</td><td>58.6</td><td>54.2</td><td>-</td><td>55.4</td><td>58.4</td><td>58.6</td></tr><tr><td>Terminal Bench 2.1</td><td>66.0</td><td>51.1</td><td>66.1</td><td>78.2</td><td>70.3</td><td>-</td><td>59.6</td><td>48.3</td><td>53.9</td></tr><tr><td>SWE Atlas-QnA</td><td>37.9</td><td>11.3</td><td>45.2</td><td>45.4</td><td>13.5</td><td>31.2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>NL2Repo</td><td>42.1</td><td>35.0</td><td>56.3</td><td>52.9</td><td>21.6</td><td>-</td><td>35.5</td><td>41.0</td><td>42.8</td></tr><tr><td>SWE Atlas-Test Writing</td><td>30.8</td><td>18.9</td><td>38.21</td><td>42.6</td><td>29.8</td><td>31.8</td><td>-</td><td>-</td><td>-</td></tr><tr><td>SWE-efficiency</td><td>34.8</td><td>14.0</td><td>42.2</td><td>46.6</td><td>19.7</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>LiveSQLBench</td><td>40.2</td><td>33.2</td><td>41.0</td><td>40.2</td><td>39.8</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>CL-bench</td><td>20.5</td><td>15.4</td><td>22.9</td><td>25.4</td><td>21.1</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>VIBE-V2</td><td>50.1</td><td>37.9</td><td>55.9</td><td>50.5</td><td>28.0</td><td>42.8</td><td>45.0</td><td>48.2</td><td>46.0</td></tr><tr><td>SVG-Bench</td><td>63.7</td><td>48.0</td><td>62.3</td><td>58.2</td><td>59.2</td><td>64.1</td><td>61.7</td><td>56.9</td><td>60.0</td></tr><tr><td>PostTrainBench</td><td>37.1</td><td>13.1</td><td>42.4</td><td>39.3</td><td>15.2</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>KernelBench Hard</td><td>28.8</td><td>10.5</td><td>30.7</td><td>20.9</td><td>18.6</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>PaperBench</td><td>52.6</td><td>30.6</td><td>58.5</td><td>57.5</td><td>46.7</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Cowork</td><td></td><td colspan="8"></td></tr><tr><td>BrowseComp</td><td>83.5</td><td>76.3</td><td>79.3</td><td>84.4</td><td>85.9</td><td>74.7</td><td>83.4</td><td>79.3</td><td>83.2</td></tr><tr><td>DRACO</td><td>73.2</td><td>66.8</td><td>77.7</td><td>-</td><td>-</td><td>75.8</td><td>-</td><td>-</td><td>-</td></tr><tr><td>GDPval rubrics</td><td>74.8</td><td>66.4</td><td>79.8</td><td>80.7</td><td>57.8</td><td>75.7</td><td>70.3</td><td>68.3</td><td>65.1</td></tr><tr><td>BankerToolBench</td><td>76.1</td><td>63.9</td><td>81.3</td><td>70.0</td><td>67.0</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>OfficeQA Pro</td><td>45.1</td><td>-</td><td>43.6</td><td>52.6</td><td>18.1</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>SpreadSheetBench-v1</td><td>89.4</td><td>84.9</td><td>88.5</td><td>88.1</td><td>56.1</td><td>-</td><td>84.9</td><td>85.2</td><td>84.5</td></tr><tr><td>YC-Bench</td><td>2.1M</td><td>0.0M</td><td>2.2M</td><td>1.3M</td><td>1.1M</td><td>0.1M</td><td>0.5M</td><td>-</td><td>-</td></tr><tr><td>LOCA-Bench (256k)</td><td>49.3</td><td>-</td><td>57.0</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>MCP Atlas</td><td>74.2</td><td>49.4</td><td>77.0</td><td>75.3</td><td>69.2</td><td>61.3</td><td>73.6</td><td>71.8</td><td>66.6</td></tr><tr><td>Apex-Agents</td><td>27.7</td><td>5.6</td><td>37.2</td><td>41.7</td><td>33.4</td><td>26.2</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Claw-Eval</td><td>74.5</td><td>49.7</td><td>71.6</td><td>-</td><td>57.8</td><td>68.3</td><td>58.4</td><td>62.7</td><td>61.5</td></tr><tr><td>GUI</td><td></td><td colspan="8"></td></tr><tr><td>OSWorld-Verified</td><td>75.2</td><td>-</td><td>82.8</td><td>78.7</td><td>76.2</td><td>72.5</td><td>-</td><td>-</td><td>73.1</td></tr><tr><td>MultiModal</td><td></td><td colspan="8"></td></tr><tr><td>OmniDocBench</td><td>91.6</td><td>-</td><td>89.3</td><td>87.5</td><td>88.1</td><td>86.9</td><td>-</td><td>-</td><td>-</td></tr><tr><td>MMMU-Pro</td><td>78.1</td><td>-</td><td>77.0</td><td>81.2</td><td>80.5</td><td>74.5</td><td>-</td><td>-</td><td>79.4</td></tr><tr><td>Video-MMMU</td><td>84.6</td><td>-</td><td>83.0</td><td>86.4</td><td>87.9</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>VideoMME (w/ sub)</td><td>85.4</td><td>-</td><td>-</td><td>89.4</td><td>87.9</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>Reasoning</td><td></td><td colspan="8"></td></tr><tr><td>IMO 2025</td><td>35 / 42</td><td>-</td><td>17.4%</td><td>76.1%</td><td>42.4%</td><td>-</td><td>-</td><td>-</td><td>-</td></tr><tr><td>USAMO 2026</td><td>36 / 42</td><td>-</td><td>52.8%</td><td>98.2%</td><td>74.4%</td><td>-</td><td>-</td><td>-</td><td>-</td></tr></table>

这张表把 MiniMax M3 和 8 个模型放在一起比：自家上一代 MiniMax M2.7, Claude Opus 4.7, GPT 5.5, Gemini 3.1 Pro, Claude Sonnet 4.6, DeepSeek V4 Pro, GLM 5.1 Thinking, Kimi K2.6 Thinking. 32 行基准分 5 组：编程（Coding）14 行，协作办公（Cowork）11 行，图形界面操作（GUI）1 行，多模态（MultiModal）4 行，推理（Reasoning）2 行。横杠 「-」 表示该模型在这一行没有成绩。页面原图里 M3 一列用红框框出。YC-Bench 的单位是最终资产（M 应是百万），IMO 2025 和 USAMO 2026 两行 M3 写成 「得分 / 满分 42」，其他模型写成百分比。各行的具体口径见下面的评测方法。

> **回看：** IMO 那两行，M3 写 35 / 42，别人写百分比，能直接比吗？
> 换算成百分比，M3 在 IMO 2025 约 83.3%，USAMO 2026 约 85.7% (35 / 42, 36 / 42)。但下面方法说明写得很清楚：M3 用了最多 10 轮迭代的推理时额外算力框架（test-time-scaling），最大输出 512k token；其他闭源模型报的是 avg@k. 一边是加了额外推理算力后的单次得分，一边是 k 次平均，口径不同，83.3% 对 76.1% 这种比较不成立。

> **停一下：** SWE Atlas-Test Writing 里 Claude Opus 4.7 写成 38.21，为什么别的格子都是一位小数？
> 页面原图也是 38.21，不是转写错误。全表只有这一格是两位小数，页面没解释，可能是从外部来源照抄没有统一格式。同样要留意 YC-Bench 里 M2.7 的 0.0M：按方法说明这一行的指标是最终资产，0.0M 意味着 M2.7 几乎没有剩下资金，和 M3 的 2.1M 差距在这张表里最悬殊。

Evaluation Methodology:

评测方法。

**SWE-Bench Verified:** Tested on internal infrastructure using Claude Code as the scaffolding. When using Claude Code, the default system prompt was overridden. Each test was run 4 times and the average was taken.

**SWE-Bench Verified:** 在内部基础设施上评测，用 Claude Code 作脚手架，覆盖了 Claude Code 的默认系统提示。每个测例跑 4 次取平均。md 在 「Each test was」 处截断，后半句按 PDF 页面图像补回。

**SWE-Bench pro:** Tested on internal infrastructure using Claude Code as the scaffolding. Testing logic is aligned with the official evaluation.

**SWE-Bench Pro:** 在内部基础设施上评测，用 Claude Code 作脚手架，评测逻辑与官方一致。

**Terminal-bench 2.1:** Evaluated on internal infrastructure with a sandbox configured as 8C16G, a timeout of 2 hours, and max output tokens set to 128K, using Terminus 2 as the scaffolding. Scores for GPT-5.5, Gemini 3.1 Pro, and Claude Opus 4.7 are taken from the official Terminal-bench 2.1 leaderboard; all other models were tested via official API on the same infrastructure.

**Terminal-bench 2.1:** 在内部基础设施上评测，沙箱配置 8 核 16G 内存，超时上限 2 小时，最大输出 128K token，脚手架用 Terminus 2. GPT-5.5，Gemini 3.1 Pro，Claude Opus 4.7 的分数取自 Terminal-bench 2.1 官方排行榜；其余模型在同一套基础设施上通过官方 API 评测。md 把 「API」 识别成 「APl」，这里改正。

> **再看：** Terminal Bench 2.1 上 M3 是 66.0，Claude Opus 4.7 是 66.1，只差 0.1，这两个数是同一套环境跑的吗？
> 不是。按这条说明，Opus 4.7 的 66.1 取自官方排行榜，M3 的 66.0 是 MiniMax 内部用 Terminus 2 在 8 核 16G 沙箱里跑的。两个数来源不同，0.1 的差距小于环境差异可能带来的波动，只能说两者接近，不能说谁高谁低。

**SWE Atlas-Codebase QNA:** Evaluated on internal infrastructure with a sandbox configured as 4C8G and a 3-hour timeout. Scores for Claude Sonnet 4.6, GPT-5.5, and Gemini 3.1 Pro are taken from labs.scale.com. Claude Opus 4.7, MiniMax-M2.7, and MiniMax-M3 used Mini-SWE-Agent as scaffolding, with evaluation logic aligned with the official method.

**SWE Atlas-Codebase QnA:** 在内部基础设施上评测，沙箱 4 核 8G 内存，超时上限 3 小时。Claude Sonnet 4.6，GPT-5.5，Gemini 3.1 Pro 的分数取自 labs.scale.com. Claude Opus 4.7，MiniMax-M2.7，MiniMax-M3 用 Mini-SWE-Agent 作脚手架，评测逻辑与官方方法一致。

<!-- page 5 of 8 -->

**NL2Repo:** Scores for DeepSeek-V4-pro, Kimi-k2.6, and GLM-5.1 are taken from https://qwen.ai/blog?id=qwen3.7. Other models were evaluated on internal infrastructure with a sandbox configured as 1C2G and a 4-hour timeout. Claude Opus 4.7, MiniMax-M2.7, MiniMax-M3, and Gemini 3.1 Pro used Claude Code scaffolding; GPT-5.5 used Codex scaffolding. To prevent potential model "hacks," the following modifications were made based on official evaluation logic: (1) prompts included constraints prohibiting the model from using external information via git clone, pip install, etc.; (2) at the scaffolding level, system-monitored Bash commands executed by the model were analyzed for potential cheating. Commands determined as cheating were intercepted, and the model was warned to complete the task within the restricted environment.

**NL2Repo:** DeepSeek-V4-pro，Kimi-k2.6，GLM-5.1 的分数取自 Qwen 博客（qwen.ai/blog?id=qwen3.7）。其他模型在内部基础设施上评测，沙箱 1 核 2G 内存，超时上限 4 小时。Claude Opus 4.7，MiniMax-M2.7，MiniMax-M3，Gemini 3.1 Pro 用 Claude Code 作脚手架，GPT-5.5 用 Codex。为防止模型钻空子，在官方评测逻辑上做了两处修改：一是提示里明确禁止模型通过 git clone，pip install 之类的方式获取外部信息；二是在脚手架层面由系统监控模型执行的 Bash 命令，判定为作弊的命令会被拦下，并提醒模型在受限环境里完成任务。md 这一条丢了开头的 「NL2Repo: Scores for ... are taken from」，只剩网址和后文，按 PDF 页面图像补回。

**SWE Atlas-Test Writing:** Scores for GPT-5.5, Claude Sonnet 4.6, and Gemini 3.1 Pro are from labs.scale.com. Claude Opus 4.7, MiniMax-M2.7, and MiniMax-M3 were evaluated on internal infrastructure using Claude Code scaffolding with a sandbox of 4C8G and a 3-hour timeout, aligned with official logic, run 4 times and averaged.

**SWE Atlas-Test Writing:** GPT-5.5，Claude Sonnet 4.6，Gemini 3.1 Pro 的分数来自 labs.scale.com. Claude Opus 4.7，MiniMax-M2.7，MiniMax-M3 在内部基础设施上评测，用 Claude Code 作脚手架，沙箱 4 核 8G 内存，超时上限 3 小时，逻辑与官方一致，跑 4 次取平均。md 在 「were evaluated」 处截断，后半句按 PDF 补回。

**SWE-fficiency:** Evaluated on internal infrastructure using the open-source SWE-fficiency dataset and workflow. Sandbox: 1C2G, timeout: 2 hours. Claude Code used as scaffolding; scores are from internal testing.

**SWE-fficiency:** 在内部基础设施上评测，用开源的 SWE-fficiency 数据集和流程。沙箱 1 核 2G 内存，超时上限 2 小时，Claude Code 作脚手架，分数来自内部评测。md 截断的末句按 PDF 补回。

**LiveSQLBench:** Evaluated on internal infrastructure using the open-source LiveSQLBench-Base-Full v1 dataset (600 questions / 22 PostgreSQL databases) and official workflow. Claude Code used as scaffolding, with task description prompts overriding default system prompts. Each question ran in a dedicated sandbox with pre-installed PostgreSQL, timeout 25 minutes. Scores from internal testing.

**LiveSQLBench:** 在内部基础设施上评测，用开源的 LiveSQLBench-Base-Full v1 数据集（600 道题，22 个 PostgreSQL 数据库）和官方流程。Claude Code 作脚手架，用任务描述提示覆盖默认系统提示。每道题在预装 PostgreSQL 的独立沙箱里运行，超时上限 25 分钟。分数来自内部评测。

**VIBE-V2:** Internal benchmark covering pure front-end and full-stack Web/Android/iOS projects, task type: build from scratch. Claude Code used as scaffolding, with Agent-as-a-Verifier paradigm for automated verification of program interaction logic and visual output. Scores computed via unified pipeline including requirement set, containerized deployment, and dynamic interaction environment, averaged over 3 runs.

**VIBE-V2:** 内部基准，覆盖纯前端和全栈的 Web，Android，iOS 项目，任务类型是从零构建。Claude Code 作脚手架，用 Agent-as-a-Verifier 的方式自动验证程序的交互逻辑和视觉输出。分数经统一管线计算，管线包括需求集，容器化部署和动态交互环境，取 3 次运行的平均。

**SVG-Bench:** Internal benchmark, input types: text and images, tasks: build from scratch or edit based on existing assets. Claude Code used as scaffolding, VLM used to verify rendering accuracy, averaged over 3 runs.

**SVG-Bench:** 内部基准，输入是文本和图像，任务是从零绘制或在已有素材上修改。Claude Code 作脚手架，用视觉语言模型检查渲染是否准确，取 3 次平均。md 在 「VLM used to verify」 处截断，按 PDF 补回。

**CL-bench:** Evaluated on internal infrastructure using open-source CL-bench data and rubrics. Evaluation setup fully aligned with official procedure. Scores from internal testing.

**CL-bench:** 在内部基础设施上评测，用开源的 CL-bench 数据和评分细则，评测设置与官方流程完全一致，分数来自内部评测。md 行首多出的 「0」 是列表圆点被识别成数字，删去，下一条同理。

**PostTrainBench:** Evaluated on Claude Code using Ralph-Loop mechanism for 12 hours, testing 4 Base Models across 5 benchmarks not requiring LLM-As-Judge (AIME2025, BFCL, GPQA Main, GSM8K, HumanEval).

**PostTrainBench:** 在 Claude Code 上用 Ralph-Loop 机制跑 12 小时，对 4 个基座模型做后训练，在 5 个不需要 LLM-As-Judge 的基准上检验（AIME2025, BFCL, GPQA Main, GSM8K, HumanEval）。

**Kernelbench-Hard:** Evaluated on Claude Code on NVIDIA Blackwell architecture GPUs with CUDA capability sm\_120. Score per question = Agent's submitted operator TFLOPs relative to theoretical peak of current hardware; benchmark score = average of 9 questions.

**KernelBench Hard:** 在 Claude Code 上评测，硬件是 NVIDIA Blackwell 架构 GPU，CUDA 计算能力 sm_120。每题得分 = agent 提交的算子达到的 TFLOPs 占当前硬件理论峰值的比例；基准得分 = 9 道题的平均。md 在 「TFLOPs」 后截断，按 PDF 补回。

**PaperBench:** Evaluated on Claude Code using Ralph-Loop mechanism for 12 hours. Dataset: 19 papers reproducible without external API. Rubrics: official open-source human expert rubrics. Scoring model: Opus-4.6.

**PaperBench:** 在 Claude Code 上用 Ralph-Loop 机制跑 12 小时。数据集是 19 篇不依赖外部 API 就能复现的论文，评分细则用官方开源的人类专家细则，打分模型是 Opus-4.6。

**GPDval-Rubrics:** Internal evaluation using cases from the public GDPval dataset, pointwise scoring based on public rubrics, environment aligned with GDPval-AA scaffolding.

**GDPval rubrics:** 内部评测，用公开 GDPval 数据集里的案例，按公开细则逐条打分，环境与 GDPval-AA 的脚手架一致。方法说明的标题写成 「GPDval」，表里写 「GDPval」，页面原图就是这样。md 行首的 「●」 是列表圆点，删去。

**BrowseComp:** Uses same agent framework as WebExplorer (Liu et al., 2025). When token usage exceeds 64K, all history is discarded.

**BrowseComp:** 用和 WebExplorer (Liu et al., 2025) 相同的 agent 框架。token 用量超过 64K 时，丢弃全部历史。

**DRACO:** MiniMax M3 results evaluated using internal scaffolding (accessible via Deep Research Skill in MiniMax Code). Scoring based on official rubrics per question, final score = average across all questions. Scoring model: Claude Opus 4.6. Claude Opus 4.7 results taken from Opus 4.7 model card.

**DRACO:** MiniMax M3 的结果用内部脚手架评测（在 MiniMax Code 里通过 Deep Research Skill 可以用到）。每道题按官方细则打分，最终得分是所有题目的平均，打分模型是 Claude Opus 4.6. Claude Opus 4.7 的结果取自 Opus 4.7 的模型卡。

**BankerToolBench:** Tested on public BankerToolBench dataset. All models except GPT-5.5 used Claude Code scaffolding; GPT-5.5 used Codex. Scoring based on dataset rubrics, using MiniMax M2.7 as scoring model.

**BankerToolBench:** 在公开的 BankerToolBench 数据集上评测。除 GPT-5.5 用 Codex 外，其余模型都用 Claude Code 作脚手架。按数据集自带的细则打分，打分模型是 MiniMax M2.7。

**OfficeQA Pro:** To simulate realistic scenarios, relevant files provided as a file system to the model, evaluated using Claude Code scaffolding. Scoring required exact match with answers.

**OfficeQA Pro:** 为模拟真实场景，相关文件以文件系统的形式交给模型，用 Claude Code 作脚手架。得分要求和标准答案完全一致。

**SpreadSheetBench-v1:** Evaluated on public dataset using Claude Code scaffolding.

**SpreadSheetBench-v1:** 在公开数据集上评测，用 Claude Code 作脚手架。

**YC-Bench:** Evaluated using official YC-Bench codebase and configuration, environment aligned with official setup. Metric: final assets (fund).

**YC-Bench:** 用官方 YC-Bench 代码和配置评测，环境与官方一致。指标是最终资产（资金）。

**LOCA-Bench(256k):** Evaluated using official LOCA-bench codebase, official react mode, Environment Description Length = 256k.

**LOCA-Bench (256k):** 用官方 LOCA-bench 代码，官方 react 模式评测，环境描述长度 256k。

**MCP Atlas:** Evaluated using official MCP Atlas codebase. Public Set scores using Gemini 2.5 Pro as scoring model, aligned with official model.

**MCP Atlas:** 用官方 MCP Atlas 代码评测。公开集的分数用 Gemini 2.5 Pro 打分，与官方打分模型一致。

**Apex-Agents:** Uses archipelago codebase, ReAct Toolbelt framework, scoring model Claude Sonnet 4.6.

**Apex-Agents:** 用 archipelago 代码和 ReAct Toolbelt 框架，打分模型是 Claude Sonnet 4.6。

**Claw-Eval:** Evaluated using official Claw-Eval codebase, General Task Group (161 tasks), scoring model Gemini 3.0 Flash, aligned with official model. Metric: Pass^3 score.

**Claw-Eval:** 用官方 Claw-Eval 代码，通用任务组（161 个任务），打分模型 Gemini 3.0 Flash，与官方一致。指标是 Pass^3 分数。原图里 3 是上标，md 转成 「Pass3」，这里写成 Pass^3。

**OSWorld-Verified:** Tested on 361 samples from nogdrive collection using OSWorld-Verified official codebase (testing script soon to be open-sourced). M3 uses relative coordinates 0-1000, image resolution 1920×1080.

**OSWorld-Verified:** 用 OSWorld-Verified 官方代码，在 nogdrive 集合的 361 个样本上评测（评测脚本即将开源）。M3 使用 0 到 1000 的相对坐标，截图分辨率 1920×1080。

**OmniDocBench:** Image long edge max = 3584 pixels, using public OmniDocBench v1.5 dataset and official evaluation logic. Added reasonable formatting constraints on top of official prompts. Gemini 3.1 Pro, GPT-5.5, Claude Opus 4.7 used default API parameters.

**OmniDocBench:** 图像长边最大 3584 像素，用公开的 OmniDocBench v1.5 数据集和官方评测逻辑。在官方提示之上加了合理的格式约束。Gemini 3.1 Pro，GPT-5.5，Claude Opus 4.7 用 API 默认参数。md 在 「on top of」 处截断，按 PDF 补回。

**MMMU Pro:** Aligned with official evaluation. Prompt enforces format constraint on model's last line for easier parsing.

**MMMU-Pro:** 与官方评测一致。提示要求模型在最后一行按固定格式作答，方便解析答案。md 整条漏掉，按 PDF 补回。

**VideoMMMU:** Video frame rate = 1 FPS, max 512 frames, single-frame long edge 672-1008 pixels. Official VideoMMMU prompt used, LLM-as-a-Judge scoring. MiniMax M3: max output tokens = 32K, temperature = 1.0, top\_p = 0.95. External models: max output tokens = 64K, temperature = 0.7, top\_p = 0.95, highest thinking mode.

**Video-MMMU:** 视频采样 1 帧每秒，最多 512 帧，单帧长边 672 到 1008 像素。用官方 VideoMMMU 提示，LLM-as-a-Judge 打分。MiniMax M3：最大输出 32K token, temperature 1.0, top_p 0.95。外部模型：最大输出 64K token，temperature 0.7，top_p 0.95，开最高档思考模式。md 在 「MiniMax M3: max」 处截断，按 PDF 补回。

**Video-MME:** Video frame rate = 1 FPS, max 1024 frames (\*external API limit 640 frames; MiniMax M3 scored 84.6 at 512 frames), single-frame long edge 336-672 pixels, subtitles inserted every 30 seconds interleaved into frames. Official Video-MME prompt used, LLM-as-a-Judge scoring. MiniMax M3: max output tokens = 16K, temperature = 1.0, top\_p = 0.95. External models: max output tokens = 64K, temperature = 0.7, top\_p = 0.95, highest thinking mode. \*Note: Claude Opus 4.7 API error rate >20%, results not reported.

**Video-MME:** 视频采样 1 帧每秒，最多 1024 帧（外部模型 API 上限 640 帧；MiniMax M3 在 512 帧下得 84.6），单帧长边 336 到 672 像素，每 30 秒插入一次字幕，与画面帧交错。用官方 Video-MME 提示，LLM-as-a-Judge 打分。MiniMax M3：最大输出 16K token, temperature 1.0, top_p 0.95。外部模型：最大输出 64K token，temperature 0.7，top_p 0.95，开最高档思考模式。注：Claude Opus 4.7 的 API 报错率超过 20%，不报告其结果。

**IMO 2025 & USAMO 2026:** Aligned with MathArena official evaluation. Each contest: 6 problems, max score 42. Model proof output: (1) Solution Normalization → (2) dual strong models graded using human expert rubrics (GPT-5.4 high reasoning effort, Gemini 3.1 Pro high reasoning effort) → (3) dual judges take minimum as final score. M3 evaluation: 512k max output tokens, temperature = 1.0, test-time-scaling framework up to 10 iterations. Other closed-source model metrics: avg@k results.

**IMO 2025 与 USAMO 2026:** 与 MathArena 官方评测一致。每场比赛 6 道题，满分 42。模型输出的证明依次经过：（1）解答规范化；（2）由两个强模型按人类专家细则分别打分（GPT-5.4 高推理强度，Gemini 3.1 Pro 高推理强度）；（3）取两位裁判中的较低分作为最终得分。M3 的设置：最大输出 512k token，temperature 1.0，使用推理时额外算力框架（test-time-scaling），最多迭代 10 轮。其他闭源模型报的是 avg@k 结果。

> **对一下：** 表头和方法说明里的基准名，是一一对上的吗？
> 有三处没对齐，页面原图就是这样。表里的 「SWE Atlas-QnA」 在方法说明里叫 「SWE Atlas-Codebase QNA」；表里的 「SWE-efficiency」 在说明里叫 「SWE-fficiency」；表里的 「GDPval rubrics」 在说明里叫 「GPDval-Rubrics」。按内容能一一对应，但读的时候要知道这是同一个基准的不同写法。

> **想：** BankerToolBench 用 MiniMax M2.7 当打分模型，给 M3 打分会不会偏向自家？
> 页面没讨论这个问题。能确认的只有：这一行 M3 得 76.1，高于 GPT-5.5 的 70.0，低于 Claude Opus 4.7 的 81.3，打分模型对所有参评模型是同一个。其他行的打分模型分别是 Opus-4.6 (PaperBench), Claude Opus 4.6 (DRACO), Gemini 2.5 Pro (MCP Atlas), Claude Sonnet 4.6 (Apex-Agents), Gemini 3.0 Flash (Claw-Eval)，只有这一行用了自家模型。

> **问：** M3 标称 1M 上下文，表里哪一行真正考到了长上下文？
> BrowseComp 这一行考不到：说明写明 token 用量超过 64K 就丢弃全部历史，上下文始终压在 64K 以内。表里明确带长度的只有 LOCA-Bench (256k)，M3 得 49.3，Claude Opus 4.7 得 57.0，其余模型空缺。1M 这一档，表里没有任何一行直接评测。

> **核对：** 视频两行里，M3 和外部模型的生成参数一样吗？
> 不一样。Video-MMMU 里 M3 最大输出 32K，Video-MME 里是 16K，temperature 都是 1.0；外部模型两行都是最大输出 64K，temperature 0.7，并开最高档思考模式。帧数上，Video-MME 的上限是 1024 帧，外部 API 却限在 640 帧，M3 在 512 帧下的成绩另外注明是 84.6。双方的输出预算和帧数都不对等，比较时要把这些条件带上。

## MiniMax Sparse Attention (MSA)

MiniMax 稀疏注意力（MSA）。

M3 is powered by [**MiniMax Sparse Attention (MSA)**](https://github.com/MiniMax-AI/MSA), a high-performance sparse attention operator designed for million-token contexts. Compared with GQA, MSA dramatically reduces the attention compute and memory footprint while preserving model quality.

M3 的注意力用的是 MiniMax 稀疏注意力（MSA），一个为百万 token 上下文设计的高性能稀疏注意力算子。和 GQA 相比，MSA 大幅降低了注意力的计算量和显存占用，同时保持模型质量。

![每 token 注意力 FLOPs 随序列长度变化的曲线，GQA 与 MSA 各一条，1M token 处标注降低 28.4 倍](images/p05-chart.png)

Per-Token Attention FLOPs. Y axis: Attention FLOPs / Token (2 G to 18 G); X axis: Sequence Length (32k, 512k, 1M). Annotation: 28.4× FLOPs reduction at 1M tokens.

图一：每个 token 的注意力 FLOPs。纵轴是每 token 的注意力 FLOPs，刻度印着 2G，5G，8G，10G，12G，15G，18G；横轴是序列长度，标了 32k, 512k, 1M. 深蓝线 GQA 随长度近似直线上升，1M 处接近 18G；绿线 MSA 几乎贴着底部缓慢上升。1M token 处标注：FLOPs 降低 28.4 倍。

![Prefill 阶段注意力延迟随序列长度变化的曲线，1M token 处 MSA 比 GQA 快 14.2 倍](images/p05-chart-2.png)

Prefilling. Y axis: Attention Latency (5 s to 30 s); X axis: Sequence Length (32k, 512k, 1M). Annotation: 14.2× speedup at 1M tokens. Legend: GQA, MSA.

图二：Prefill 阶段。纵轴是注意力延迟，刻度 5 秒到 30 秒；横轴是序列长度。GQA 曲线向上弯，1M 处约 29 秒；MSA 在 1M 处约 2 秒。1M token 处标注：提速 14.2 倍。图例：深蓝 GQA，绿色 MSA，三张图共用这组图例。

![Decode 阶段注意力延迟随 KV 长度变化的曲线，1M token 处 MSA 比 GQA 快 7.6 倍](images/p05-read-the-technical-report-arxiv-2606-13392-https-arxiv.png)

Decoding. Y axis: Attention Latency (0.1 ms to 0.9 ms); X axis: KV Length (32k, 512k, 1M). Annotation: 7.6× speedup at 1M tokens.

图三：Decode 阶段。纵轴是注意力延迟，刻度 0.1 毫秒到 0.9 毫秒；横轴是 KV 长度。GQA 近似直线上升，1M 处约 0.83 毫秒；MSA 在 1M 处约 0.11 毫秒。1M token 处标注：提速 7.6 倍。这张图的文件名来自下一页开头 「Read the technical report」 那行字，和画面内容无关。

> **看表：** 三张图只标了 1M 处的倍数，MSA 在 1M 处的绝对值大概是多少？
> 按图上读出的 GQA 端点反推：FLOPs 约 17.7G / 28.4 ≈ 0.62G；prefill 约 29 秒 / 14.2 ≈ 2.0 秒；decode 约 0.83 毫秒 / 7.6 ≈ 0.11 毫秒。这三个反推值和图上绿点的位置对得上。要注意第一张图纵轴刻度印的是 2, 5, 8, 10, 12, 15, 18，间距不均，像是把 2.5, 7.5, 12.5, 17.5 取整后印出来的，读 GQA 端点时会有零点几 G 的误差。32k 一端两条线几乎重合，页面没给短上下文下的倍数。

> **拆开：** 亮点说比 M2 prefill 快 9 倍，decode 快 15 倍；图上 MSA 比 GQA prefill 快 14.2 倍，decode 快 7.6 倍。两组数为什么大小顺序正好反过来？
> 两组数的比较对象和范围都不同。图上是注意力算子单独计时，对象是 GQA；亮点是和 M2 比，页面没说是整模型还是只算注意力。如果亮点是整模型端到端，prefill 从 14.2 倍降到 9 倍说得通，因为 MoE 前馈层等部分没有被 MSA 加速。但 decode 从注意力层面的 7.6 倍变成 15 倍，整体反而比局部快，靠 MSA 本身解释不了，说明 M2 这个基线和图里的 GQA 不是一回事，或者 M3 在注意力以外还有别的提速。页面没给答案。

> **确认：** 「per-token compute to 1/20」 和图上 「28.4× FLOPs reduction」 说的是同一个量吗？
> 看来不是。1/28.4 约 3.5%，1/20 是 5%。图上的 28.4 倍只算注意力 FLOPs，对象是 GQA；亮点的 1/20 是和 M2 比的每 token 计算量，页面没说包不包括注意力以外的部分。如果 1/20 是整模型的计算量，它比注意力单项的降幅小，方向上合理。但页面没有写明，两个数不能互相换算。

<!-- page 6 of 8 -->

Read the technical report: [**arXiv:2606.13392**](https://arxiv.org/abs/2606.13392) · [**Hugging Face Papers**](https://huggingface.co/papers/2606.13392)

阅读技术报告：arXiv 2606.13392，或 Hugging Face Papers 页面。md 里这一行两端的弯引号和文档小图标，本稿删去。

> **回看：** 这里叫它 「technical report」，第 2 页 Hugging Face 登记的论文标题却是 「MiniMax Sparse Attention」，这是 M3 的完整技术报告，还是只讲 MSA 的论文？
> 本页只能看到标题。编号 2606.13392 在两处一致，Hugging Face 上的标题是 MiniMax Sparse Attention，模型卡也把它放在 MSA 小节末尾。按标题判断，它的主题是稀疏注意力，是否覆盖 M3 的多模态训练和 agent 能力，本页没有信息。

**How to Use**

使用方式。

[MiniMax Agent](https://agent.minimax.io/) · [MiniMax API](https://platform.minimax.io/)

两个入口：MiniMax Agent 产品和 MiniMax API 平台。

M3 supports three reasoning modes through the **thinking** parameter:

M3 通过 **thinking** 参数支持三种推理模式：

**enabled** — Reasoning is always enabled.

**enabled:** 始终开启推理。

**adaptive** — M3 automatically determines when additional reasoning is beneficial.

**adaptive:** 由 M3 自己判断什么时候多推理一步有好处。

**disabled** — Reasoning is disabled to minimize latency and maximize throughput.

**disabled:** 关闭推理，把延迟压到最低，吞吐提到最高。

## Local Deployment

本地部署。

Download the model:

下载模型：

**hf download MiniMaxAI/MiniMax-M3 --local-dir MiniMax-M3**

用 hf 命令行把 MiniMaxAI/MiniMax-M3 下载到本地的 MiniMax-M3 目录。

We recommend the following inference frameworks to serve the model:

推荐用以下推理框架部署：

[SGLang](https://docs.sglang.io/) - see [SGLang cookbook](https://docs.sglang.io/cookbook/autoregressive/MiniMax/MiniMax-M3).

SGLang，见 SGLang cookbook 里的 MiniMax-M3 条目。

[vLLM](https://github.com/vllm-project/vllm) - see [vLLM recipes](https://recipes.vllm.ai/MiniMaxAI/MiniMax-M3).

vLLM，见 vLLM recipes 里的 MiniMax-M3 条目。

[Transformers](https://github.com/huggingface/transformers) - see [Transformers docs](https://huggingface.co/docs/transformers/model_doc/minimax_m3_vl).

Transformers，见 Transformers 文档里的 minimax_m3_vl 模型页。

<!-- page 7 of 8 -->

[KTransformers](https://github.com/kvcache-ai/ktransformers) - see [KTransformers MiniMax-M3 tutorial](https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/MiniMax-M3-Tutorial.md).

KTransformers，见其 MiniMax-M3 教程。

[unsloth](https://unsloth.ai/) - see [tutorial](https://unsloth.ai/docs/models/minimax-m3)

unsloth，见其教程。

[ATOM](https://github.com/ROCm/ATOM/tree/main) - see [MiniMax-M3 MXFP4/MXFP8 Usage Guide](https://github.com/ROCm/ATOM/blob/main/recipes/MiniMax-M3.md)

ATOM（ROCm 组织下的项目），见 MiniMax-M3 的 MXFP4/MXFP8 使用指南。

> **停一下：** Hugging Face 上的张量类型是 BF16 和 F32，这里又出现 MXFP4 和 MXFP8，权重到底有多大？
> 按 427B 参数粗算，全部用 BF16 存约 854GB（427B × 2 字节），实际还有一部分 F32 张量，只会更大。MXFP8 约为一半，MXFP4 约为四分之一再加分块 scale 的开销。页面没有给文件总大小，也没说 F32 占多少；第 2 页的 58 个量化衍生模型和 ATOM 的 MXFP4/MXFP8 指南说明低精度部署是常见用法，但具体体积以文件列表为准。

## Inference Parameters

推理参数。

We recommend the following parameters for best performance: **temperature=1.0**, **top\_p=0.95**.

推荐参数：temperature 1.0, top_p 0.95。这和评测方法里 M3 在 Video-MMMU，Video-MME，IMO，USAMO 上用的 temperature，top_p 一致。

**Contact Us**

联系我们。

Contact us at [model@minimax.io](mailto:model@minimax.io).

联系邮箱 model@minimax.io。

## System theme

页脚的主题切换（跟随系统）。PDF 文字层在这里还有一排页脚链接：Company，TOS，Privacy，About，Careers，Website，Models，Datasets，Spaces，Pricing，Docs，md 只转出了 System theme。

<!-- page 8 of 8 -->

第 8 页是空白页，没有内容。
