---
title: "Hy3 · 对照译稿"
category: "模型库"
tags: ["Hunyuan", "对照译稿"]
published: true
excerpt: "Hy3 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 12 -->

![Image block](images/p01-image.png)

(图: 一枚黑底白字的角标, 上面只印着 27, 没有单位.)

![Image block](images/p01-search-models-datasets-users.png)

(图: 站点搜索框图标.)

The scrape is the Hugging Face page for tencent/Hy3. The header chrome includes a Like count of 971 and, later on the same page, a line that says Spaces using tencent/Hy3 27. The badge image at the top also reads 27, and the markdown does not label that badge.

抓取的是 Hugging Face 上 tencent/Hy3 这一页. 页头有 Like 计数 971. 同一页后面写着 Spaces using tencent/Hy3 27. 页顶那张图也是 27, md 没有给这张图写说明.

Downloads last month: 12,839.

上个月下载量是 12,839. 这是抓取时页面上的计数, 不是模型规格.

![Image block](images/p01-safetensors.png)

(图: 一条没有坐标轴的折线, 看不出单位. 文件名带 safetensors, 像素本身不是参数表.)

**Safetensors**. Model size **299B params**. Tensor type **BF16 · F32**.

侧栏写着 Safetensors, 模型大小 **299B params**, 张量类型 **BF16 · F32**.

> **看表:** 侧栏这一个 299B, 是后文表里的 TotalParameters 吗?
> 不是同一格. 第 4 页表把 TotalParameters 295B, ActivatedParameters 21B, MTPLayerParameters 3.8B 分成三行. 295 加 3.8 等于 298.8, 和侧栏 299 还差 0.2B. 卡上没有写侧栏把 MTP 层的参数加进了总参数.

<!-- page 2 of 12 -->

The model tree lists 67 quantized derivatives and 11 finetunes. The evaluation widget, before the README body, prints eight scores and then "Expand 3 benchmarks": GPQA Diamond 90.4, Apex Agents 25.6, SWE-bench Verified 78, DeepSWE 28, SWE-bench Pro 57.9, Terminal-Bench 2.1 71.7*, Long-Horizon Terminal-Bench solved 1*, WildClawBench overall 53.6.

模型树写着 67 个量化衍生和 11 个微调. 组件在 README 正文之前先给了八个分数, 末尾是 Expand 3 benchmarks: GPQA Diamond 90.4, Apex Agents 25.6, SWE-bench Verified 78, DeepSWE 28, SWE-bench Pro 57.9, Terminal-Bench 2.1 71.7*, Long-Horizon Terminal-Bench solved 1*, WildClawBench overall 53.6.

> **回看:** 组件上的 1* 在附录大表里有对应行吗?
> 没有. 大表没有 Long-Horizon Terminal-Bench 这一行. 其余七个名字能在大表里找到同名或近名的格子, 数字也对得上: GPQA Diamond 90.4, Apex-Agent pass@1 25.6, SWE-bench Verified 78.0, DeepSWE 28.0, SWE-bench Pro 57.9, Terminal-Bench 2.1 71.7, WildClawBench 53.6. 星号在整份 md 里没有脚注.

<!-- page 3 of 12 -->

The link row points at a Chinese README, GitHub, Apache 2.0, Hugging Face, cnb.cool, ModelScope, GitCode, and the official site aistudio.tencent.com. The table of contents lists Model Introduction, Stronger Agent Capabilities, More Reliable Product Experiences, Benchmark Appendix, News, Model Links, Quickstart, Deployment, Finetuning, RL Post-training, Quantization, License, and Contact Us.

链接行指向中文 README, GitHub, Apache 2.0, Hugging Face, cnb.cool, ModelScope, GitCode, 以及官网 aistudio.tencent.com. 目录列了模型介绍, Stronger Agent Capabilities, 更稳的产品体验, 基准附录, 新闻, 模型链接, 快速开始, 部署, 微调, RL 后训练, 量化, 许可证, 联系方式.

<!-- page 4 of 12 -->

A page footnote on this page reads "Stronger Agent Capabilities". The next heading in the body is Model Introduction, not that section title.

这一页的页脚是 Stronger Agent Capabilities. 正文下一节的标题却是 Model Introduction, 不是目录里的那一节.

**Hy3** is a 295B-parameter MoE model with 21B active parameters and 3.8B **MTP** (一次再多预测一个 token) layer parameters, from the Tencent Hy Team. The paragraph says Hy3 Preview launched in late April, feedback came from 50+ products, and post-training was scaled up. It then says Hy3 rivals flagship open-source models with 2-5x parameters.

**Hy3** 是 MoE 模型, 导语写总参数 295B, 激活参数 21B, MTP 层参数 3.8B, 出自 Tencent Hy 团队. 同段写 Hy3 Preview 在 late April 发布, 反馈来自 50 多个产品, 后训练加大了. 后一句说它比肩参数量是自己 2 到 5 倍的开源旗舰. 后训练加大是部署前的缩放. 256K 是窗口长度, 不是这件事.

> **问:** 3.8B 写进 295B 了吗?
> 导语用 with 把三件事并列, 表把它们分成三行, 两处都没有写包含或排除. 侧栏又只有一个 299B. 21B 是激活参数那一行, 和 295B, 3.8B 都不是同一个数.

| Property | Value |
| --- | --- |
| Architecture | MoE |
| TotalParameters | 295B |
| ActivatedParameters | 21B |
| MTPLayerParameters | 3.8B |
| NumberofLayers(excludingMTPlayer) | 80 |
| NumberofMTPLayers | 1 |
| AttentionHeads | 64 (GQA, 8 KV heads, head dim 128) |
| HiddenSize | 4096 |
| Intermediate Size | 13312 |
| ContextLength | 256K |
| VocabularySize | 120832 |
| NumberofExperts | 192 experts, top-8 activated |
| SupportedPrecisions | BF16 |

表: 架构 MoE. 总参数 295B. 激活参数 21B. MTP 层参数 3.8B. 层数 80, 注明不含 MTP 层. MTP 层数 1. 注意力头 64, 括号里是 GQA, 8 个 KV 头, head dim 128. 隐藏维 4096. 中间维 13312. 上下文 256K. 词表 120832. 专家 192, 激活 top-8. 精度 BF16.

> **核对:** 64 个头乘 head dim 128, 等于表里的 HiddenSize 4096 吗?
> 64 乘 128 等于 8192, 表上 HiddenSize 印的是 4096, 差一倍. 这格没有再解释 head dim 乘的是哪一组头. 80 层不含 MTP, 再加 MTP 层数 1, 表本身没有印出 81.

<!-- page 5 of 12 -->

Building on Hy3 Preview, the card says post-training data quality and diversity were improved and RL training was scaled up.

在 Hy3 Preview 之上, 卡上写后训练数据的质量和多样性提高了, RL 训练加大了. 这仍是部署前的缩放.

![Chart block](images/p05-in-productivity-scenarios-such-as-coding-office-work.png)

(图: 十二张小柱图. 蓝柱是 Hy3, 浅柱是 Hy3 preview. 图例还有 GLM-5.2, Seed-2.1 Pro, DeepSeek-V4 Pro, Qwen-3.7 Max, GPT-5.5, Claude Opus 4.8. 图例里没有 GLM-5.1, DeepSeek-V4 Flash, Gemini. 文件名取自后面那句 productivity, 图本身是分数, 不是办公场景插图. 读得清的 Hy3 / preview: SWE-bench Pro 57.9 / 46.0, SWE-bench Multilingual 75.8 / 68.3, NL2Repo 45.6 / 35.3, Terminal-Bench 2.1 71.7 / 58.0, BrowseComp 84.2 / 67.1, MCP Atlas 79.1 / 66.1, ClawEval pass^3 68.5 / 55.0, SkillsBench 55.3 / 29.1, HLE with tools 53.2 / 35.4, FrontierScience-Olympiad 74.8 / 70.0, MathArena Apex 38.7 / 12.6, AA-LCR 73.4 / 66.3.)

> **拆开:** 图上 BrowseComp 标成 GLM-5.2 的 79.3, 和大表是同一格吗?
> 不是. 大表 BrowseComp 的 79.3 在 GLM-5.1 那一列, GLM-5.2 那一列是 「-」. 图例把 Z 写成 GLM-5.2, 大表这一行没有 GLM-5.2 的分数.

> **停一下:** Terminal-Bench 2.1 图上 Claude 的 85.0, 和大表的 85/85.4* 是同一个取法吗?
> 这张子图取了斜线左边的 85, 没取带星的 85.4. 同页 MCP Atlas 子图里 GLM-5.2 取的是 82.6, 大表那一格是 76.8/82.6*, 取的是斜线右边. 同一张大图, 斜线两格的取法不一致. 星号仍然没有脚注.

The productivity paragraph names coding, office work, financial modeling, frontend design, and game development, and does not attach a number to any of those five. A blind evaluation with 270 experts gives Hy3 2.67/4 and GLM-5.1 2.51/4. The text says the gap was largest in frontend development, data and storage, and CI/CD, without printing those three subscores.

生产力那句点了编程, 办公, 金融建模, 前端, 游戏开发, 五件事都没有单独的数字. 270 名专家的盲评里 Hy3 是 2.67/4, GLM-5.1 是 2.51/4. 正文说优势最大的是前端, 数据与存储, CI/CD, 这三项没有分项分数. 分母是 4, 不是百分数.

<!-- page 6 of 12 -->

On SWE-Bench Verified, the card says accuracy variance across CodeBuddy, Cline, and KiloCode stays within 4%. Internal hallucination rate is said to drop from 12.5% to 5.4%, commonsense error rate from 25.4% to 12.7%, and multi-turn issue rate from 17.4% to 7.9%. MRCR is named, with no score.

卡上写 SWE-Bench Verified 在 CodeBuddy, Cline, KiloCode 之间的准确率波动在 4% 以内. 内部幻觉率从 12.5% 降到 5.4%, 常识错误率从 25.4% 降到 12.7%, 多轮问题率从 17.4% 降到 7.9%. MRCR 只出现了名字, 没有分数.

> **再看:** 12.5%, 25.4%, 17.4% 这三个起点, 写明是 Hy3 Preview 了吗?
> 没有. 三句都是 dropped from, 没有写出对照模型的名字. 大表里的 Hy3 preview 列是另一套基准分数, 不能拿来填这三个百分比.

> **确认:** 4% 以内能拆成三家脚手架各自的 SWE-Bench Verified 吗?
> 不能. 句子只给了波动上限. 大表里 Hy3 的 SWE-bench Verified 只有一格 78.0, 组件上是 78, 都不是三家脚手架分列.

<!-- page 7 of 12 -->

The appendix table has columns Hy3 preview, Hy3, GLM-5.1, GLM-5.2, DeepSeek-V4 Flash, DeepSeek-V4 Pro, Seed-2.1 Pro, Qwen-3.7 Max, Gemini-3.1-Pro-preview, Claude-Opus-4-8, and GPT-5.5. Hy3 is not the highest cell on every row. SWE-bench Pro is Hy3 57.9 against GLM-5.1 58.4 and GLM-5.2 62.1. SWE-bench Verified is Hy3 78.0 against DeepSeek-V4 Flash 79.0. HLE with tools, text-only, is Hy3 53.2, GLM-5.2 54.7, Seed-2.1 Pro 55.7, Claude Opus 4.8 57.9, GPT-5.5 52.2. GPQA Diamond is preview 87.2 and Hy3 90.4, matching the widget. DeepSWE is preview 0.9 and Hy3 28.0, also matching the widget. USAMO 2026 is preview 37.3 and Hy3 72.0, and the GLM-5.1 cell is 37.3*, the same number as preview.

附录表的列是 Hy3 preview, Hy3, GLM-5.1, GLM-5.2, DeepSeek-V4 Flash, DeepSeek-V4 Pro, Seed-2.1 Pro, Qwen-3.7 Max, Gemini-3.1-Pro-preview, Claude-Opus-4-8, GPT-5.5. Hy3 不是每一行的最高格. SWE-bench Pro 上 Hy3 是 57.9, GLM-5.1 是 58.4, GLM-5.2 是 62.1. SWE-bench Verified 上 Hy3 是 78.0, DeepSeek-V4 Flash 是 79.0. HLE with tools, 纯文本, Hy3 是 53.2, GLM-5.2 是 54.7, Seed-2.1 Pro 是 55.7, Claude Opus 4.8 是 57.9, GPT-5.5 是 52.2. GPQA Diamond 是 preview 87.2, Hy3 90.4, 和组件一致. DeepSWE 是 preview 0.9, Hy3 28.0, 也和组件一致. USAMO 2026 是 preview 37.3, Hy3 72.0, GLM-5.1 那一格是 37.3*, 和 preview 同一个数.

Many opponent cells are a pair split by a slash, or a single number with a star. The markdown of this card does not define the star. Gemini cells are often "-". The chart's legend drops GLM-5.1, DeepSeek-V4 Flash, and Gemini, so a bar chart reading is not the full table.

不少对手格子是斜线分成的两个数, 或一个带星的单数. 这份 md 没有给星号下定义. Gemini 有多格是 「-」. 柱图图例去掉了 GLM-5.1, DeepSeek-V4 Flash 和 Gemini, 所以读图不等于读完整张表.

<!-- page 8 of 12 -->

The news line says the weights of **Hy3** and **Hy3-FP8** are released on Hugging Face, ModelScope, GitCode, and CNB. The model-link table has two rows: Hy3 as the instruct model, Hy3-FP8 as the FP8 quantized instruct model. The sidebar tensor type remains BF16 · F32 and does not mention FP8.

新闻行写 **Hy3** 和 **Hy3-FP8** 的权重发在 Hugging Face, ModelScope, GitCode, CNB. 模型表两行: Hy3 是 instruct, Hy3-FP8 是 FP8 量化后的 instruct. 侧栏张量类型仍是 BF16 · F32, 没有写 FP8.

> **对一下:** 侧栏的 BF16 · F32 覆盖 Hy3-FP8 吗?
> 不覆盖. FP8 只出现在模型表的第二行. 侧栏的 299B 和 BF16 · F32 没有标明是哪一行权重.

The quickstart shows a client call, then a bold line whose temperature is printed as "0. 9" and whose top_p is printed as "1. 0". The code block above that line prints temperature=0.9 and top_p=1.0. The user string in the code block ends at "introduce y". The same bold line prints the reasoning mode as "high " and "no_ think ", with spaces inside the tokens. The code comment prints reasoning_effort as "no_think", and calls that the default.

快速开始先给了一段客户端调用, 接着一行加粗推荐把 temperature 印成 「0. 9」, 把 top_p 印成 「1. 0」. 上面代码块里是 temperature=0.9, top_p=1.0. 代码块里的用户句子停在 「introduce y」, 后半被截断. 同一行加粗把推理档印成 「high 」 和 「no_ think 」, 单词中间插入了空格. 代码注释里的 reasoning_effort 是 「no_think」, 并写这是默认.

> **想:** 「0. 9」 和 0.9 是两个推荐值吗?
> 不是. 代码块是 0.9 和 1.0. 加粗句在小数点后面多了一个空格, 和 top_p 的 「1. 0」 是同一种拆法. no_think 被拆成 no_ think 也是这一处. 把 reasoning_effort 调到 high, 是推理时多算, 写成 TestingTime. 默认 no_think 是直接回答. 上下文 256K 仍然是窗口长度.

<!-- page 9 of 12 -->

The deployment section says Hy3 has 295B parameters in total, and recommends 8 GPUs, naming H20-3e or GPUs with larger memory. It points at a vLLM recipe and an SGLang cookbook. The shell listings that follow are launch commands. Those commands are not transcribed here.

部署段写 Hy3 总参数 295B, 并建议用 8 张 GPU, 点名 H20-3e 或显存更大的卡. 后面给了 vLLM 和 SGLang 的链接. 再往后是启动命令, 命令本身不转写.

<!-- page 10 of 12 -->

Two draft lengths are printed in those listings and they are not the same number: the vLLM listing says num_speculative_tokens 2, and the SGLang listing says speculative-num-draft-tokens 3. Both listings say the server is for MTP. The flags, parsers, and install steps are not copied out.

两处草稿长度印出来的不是同一个数: vLLM 那一列写 num_speculative_tokens 2, SGLang 那一列写 speculative-num-draft-tokens 3. 两处都写服务器打开 MTP. 具体开关, 解析器和安装步骤不抄.

> **拆开:** 2 和 3 是 MTP 层数吗?
> 不是. 第 4 页表里的 MTP 层数是 1. 2 和 3 印在两套启动参数里, 名字都是草稿 token 的个数, 彼此也不相同. 卡上没有写哪一个是 Hy3 的默认接受长度.

<!-- page 11 of 12 -->

Finetuning, RL post-training, and quantization are links and names: a finetune README, **GRPO** with verl, Megatron-LM, Megatron-Bridge, vLLM rollout, and the AngelSlim toolkit. The license line says **Apache License 2.0**. Contact is hunyuan_opensource@tencent.com, and the team line says Tencent Hy Team.

微调, RL 后训练, 量化这三节是链接和名字: 一份微调 README, 用 verl 做的 **GRPO**, Megatron-LM, Megatron-Bridge, vLLM rollout, 以及 AngelSlim 工具包. 许可证写 **Apache License 2.0**. 联系邮箱是 hunyuan_opensource@tencent.com, 团队一行是 Tencent Hy Team.

<!-- page 12 of 12 -->

The last page is the Hugging Face footer: company links and site links.

最后一页是 Hugging Face 页脚, 公司链接和站点链接.

![Image block](images/p12-image.png)

(图: 页脚图.)
