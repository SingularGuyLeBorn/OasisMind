---
title: "Mistral Medium 3.5 技术解析"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "没印的: 层数, 隐藏维度, 注意力头数, 词表大小, 位置编码方案, 训练数据量, 训练 token 数, SFT 或 RL 细节, 视觉编码器的参数量."
---
这是 Hugging Face 上 Mistral Medium 3.5 128B 的模型卡, 13 页, 10 张图, 其中 3 张柱状图, 其余是图标.

| 项目 | 本页印出的值 |
|---|---|
| 仓库 | mistralai/Mistral-Medium-3.5-128B |
| 结构 | 稠密 (Dense), 128B 参数 |
| 上下文 | 256k |
| 模态 | 文本 + 图像输入, 文本输出, 视觉编码器从零训练 |
| 推理强度 | 按请求配置, 页面列出 'none' 和 'high' 两档 |
| 张量类型 | BF16, F8_E4M3 |
| 推荐采样 | high: 温度 0.7, top p 0.95. none: 温度 0.0 到 0.7, top p 取 None 或 1.0 |
| 许可 | Modified MIT License, 大收入公司除外 |
| 取代 | Le Chat 里的 Mistral Medium 3.1 和 Magistral, Vibe 里的 Devstral 2 |
| 主要分数 | SWE-Bench Verified 77.6, τ³-Telecom 91.4 |
| 仓库数据 | 459 赞, 上月下载 99,235, 模型树 1 + 11 + 1 + 40, 21 个 Space |

没印的: 层数, 隐藏维度, 注意力头数, 词表大小, 位置编码方案, 训练数据量, 训练 token 数, SFT 或 RL 细节, 视觉编码器的参数量.

## 1. 这一页是什么

这是一张 Hugging Face 模型卡, 不是技术报告. 13 页里, 真正讲模型的是第 2 到第 7 页: 一段概述, 一组 Key Features, 推荐采样参数, 三张评测柱状图. 第 7 页往后全是部署说明, 包括 Mistral Vibe 配置, vLLM 和 SGLang 的启动命令, 微调工具列表和许可证. 首尾两页是 Hugging Face 的页头页脚和仓库统计.

所以这一页能回答的是 「它定位在哪, 和谁比过, 怎么跑起来」, 回答不了 「它是怎么训出来的」. 架构只有 「Dense 128B」 四个字, 没有任何超参数. 评测只有柱状图, 没有表格, 所有分数都要从图上读; 好在每根柱子顶上都印了数值, 读数没有歧义.

## 2. 定位: 一套权重顶三条产品线

页面把 Medium 3.5 称作 「first flagship merged model」. 从上下文看, merged 指的是能力合并: 指令遵循, 推理, 编码三件事 「in a single set of weights」. 这三件事原先分别由 Mistral Medium 3.1, Magistral, Devstral 2 承担, 现在 Le Chat 里的前两个和 Vibe 里的第三个都被它替掉. 训练上是否做了权重融合, 页面一个字没提.

「dense」 是这页唯一的结构信息, 也是它和同框竞品最大的差别. 竞品图的表头给了规模: Kimi K2.5 1000B - A32B, GLM 5.1 744B - A40B, Qwen3.5 397B - A17B, 都是总量远大于每 token 实际计算量的 MoE 写法. Medium 3.5 的 128B 每个 token 全部参与计算. 按表头数字算, 它每 token 的计算参数是 Kimi 的 4 倍, GLM 的 3.2 倍, Qwen3.5 的约 7.5 倍; 反过来, Kimi 的总参数约是它的 7.8 倍. 同框比较时, Mistral 这边是 「小总量, 大计算量」, 对面是 「大总量, 小计算量」.

## 3. 推理强度和采样参数

推理强度是按请求开关的. 页面只列了 'none' 和 'high' 两档: none 不推理, high 推理, 推荐用于复杂提示和智能体编码. Reasoning Mode 一条说, 开推理时靠推理时额外算力换成绩. 三张评测图的脚注都写 「maximum reasoning settings」, 按两档推断就是 high.

采样参数跟着档位走. high 档固定温度 0.7, top p 0.95, 页面说可以微调但别离太远. none 档温度按任务在 0.0 到 0.7 之间选, top p 放开 (None 或 1.0). Vibe 的本地配置里也写了 thinking = 「high」, temperature = 0.7, 和推荐值一致, 说明编码智能体默认就开推理.

## 4. 和自家旧模型比: 智能体评测

第一张图拿 Medium 3.5 和 Magistral Medium 1.2, Mistral Small 4 119B A7B, Mistral Medium 3.1 比了五项. Medium 3.5 五项全部第一. 差距最大的是 BrowseComp: 48.6 对 10.0, 21.3, 7.8, 比 Medium 3.1 高 40.8 分. τ³-Telecom 91.4, 比 Magistral Medium 1.2 的 60.5 高 30.9, 比 Medium 3.1 的 46.9 高 44.5. τ³-Airline 72.0, 比 Medium 3.1 高 30.5.

差距最小的是 τ³-Retail, 76.1 对 Magistral 的 70.2, 只高 5.9. τ³-Banking 全体都低, Medium 3.5 也只有 13.4, 比 Medium 3.1 的 5.7 高 7.7, 翻了一倍多, 但绝对值仍然很小. 第二张图单看 SWE-Bench Verified: Medium 3.5 77.6, Devstral 2 72.2, Devstral Small 2 68.0, 分别高 5.4 和 9.6. 这张图纵轴从 60 起, 柱子高度差看着比实际大.

正文说 Medium 3.5 「across all benchmarks」 超过 Devstral. 但和 Devstral 同框的只有 SWE-Bench 一项, τ³ 和 BrowseComp 那张图里没有 Devstral. 所以 「all」 在本页的证据只有一个数: 77.6 对 72.2.

## 5. 和竞品比: 智能体评测

第三张图把 Medium 3.5 放进六个模型里比六项. 它哪一项都不是第一. SWE-Bench Verified 77.6 排第 3, 前面是 GLM-5.1 的 80.2 和 Claude Sonnet 4.6 的 79.6. τ³-Telecom 91.4 排第 3, GLM-5.1 98.7 和 Qwen3.5 97.8 都接近满分. τ³-Retail 76.1 排第 3, 次于 Qwen3.5 的 84.4 和 GLM-5.1 的 76.3, 和后者只差 0.2. τ³-Airline 72.0 和 Sonnet 4.5 并列最低. τ³-Banking 13.4 和 BrowseComp 48.6 都排倒数第二.

六项取平均, Medium 3.5 约 63.2, Sonnet 4.5 约 62.1, Sonnet 4.6 约 68.7, Kimi K2.5 约 67.1, GLM-5.1 约 71.7, Qwen3.5 约 71.4 (简单算术平均, 各项满分不同, 只作排序参考). 按这个口径 Medium 3.5 排第 5, 只领先 Sonnet 4.5. 拖后腿的主要是 BrowseComp: 其余四家都在 74.7 到 79.3 之间, 它只有 48.6, 差了 26 分以上.

脚注对这张图的可比性有几条限制. SWE-Bench 和 BrowseComp 都是自报; Mistral 跑 BrowseComp 时用了上下文管理, 在 100k token 处全部丢弃. Sonnet 4.5 和 Qwen3.5 的 τ³ 分数取自 Sierra 的报告, 其余模型用 gpt-5.2 (reasoning_effort: low) 做用户模拟器, 跑 4 次, 两组来源的测法不完全一样. Banking 用两种检索方式分别跑, 只报最高分. Sonnet 4.6 被外部 API 截断推理的比例更高, 页面承认影响了它的成绩, 它的 τ³-Telecom 只有 70.4, 比 Sonnet 4.5 还低 14.5.

## 6. 数学和指令遵循

第四张图比四项, 纵轴从 40 起. Collie 是 Medium 3.5 唯一拿第一的评测, 95.8, 比第二名 Sonnet 4.5 的 90.5 高 5.3. Beyond AIME avg@16 66.9 排第 2, 次于 Qwen3.5 的 72.3, 这一项没有 GLM 的柱子, 只有 5 个模型. Allenai Ifbench 69.0 排第 3, 次于 Qwen3.5 76.5 和 Kimi K2.5 70.1.

AIME25 avg@16 上六家挤在 83.1 到 87.1 之间, 最大差 4.0 分. Medium 3.5 86.3 排第 4, 前三是 GLM-5 87.1, Sonnet 4.6 86.9, Sonnet 4.5 86.7. 这一项差距小到几乎不构成区分. GLM-5 缺 Beyond AIME, 把它去掉, 其余五家四项取平均, Medium 3.5 约 79.5, Qwen3.5 约 80.2, Kimi K2.5 约 75.8, Sonnet 4.5 约 73.1, Sonnet 4.6 约 64.8, Medium 3.5 排第 2.

## 7. 部署: 精度, 并行, 上下文压缩

张量类型列了 BF16 和 F8_E4M3. 128B 参数按 BF16 每个 2 字节, 权重约 256 GB (约 238 GiB); 按 FP8 每个 1 字节约 128 GB (只算权重本身, 页面没说 128B 是否包含视觉编码器). vLLM 和 SGLang 的示例都用 8 路张量并行, BF16 权重摊到每张卡约 32 GB. vLLM 命令还设了 --gpu_memory_utilization 0.8, 给每张卡留 20% 余量.

Vibe 的本地配置把 auto_compact_threshold 设为 168000. 按 256k = 262,144 算约占 64.1%, 按 256,000 算约占 65.6%. 也就是说, 编码智能体不会把 256k 用满, 大约用到三分之二就开始压缩上下文. bash 工具默认超时 1200, 页面没写单位, 按秒算是 20 分钟.

版本依赖印了三处: mistral_common >= 1.11.1, transformers >= 5.4.0 (vLLM 和 SGLang 两处都要求), 以及 vllm nightly. SGLang 的首日镜像标签是 dev-cu13-mistral-medium-3.5, 注释列出 H100 / H20 和 B200 / B30 两组 GPU. 另有一个 EAGLE 模型, 页面只说它能 「speed up local inference」, 在三处推荐, 但没说原理, 也没给加速倍数.

## 8. 谱系: 这页能画出的关系

往前看, 页面点了四个被它取代的名字: Le Chat 里的 Mistral Medium 3.1 和 Magistral, Vibe 里的 Devstral 2. 评测图里出现的自家模型还有 Magistral Medium 1.2, Mistral Small 4 (标 119B A7B) 和 Devstral Small 2. 页面给的是 「谁被替换」 的关系, 不是 「谁是谁的底座」. Medium 3.5 是否从 Medium 3.1 继续训练, 页面没说; 视觉编码器倒是明说了 「from scratch」, 至少这一块不是沿用.

往下看, 模型树给了社区衍生: 适配器 1, 微调 11, 合并 1, 量化 40, 合计 53 个. 量化占了四分之三, 和 128B 稠密模型本地部署门槛高的现实相符. 官方自己放出了用于加速推理的 EAGLE 模型, Unsloth 做了 GGUF, Ollama 有官方库条目. 页面还警告, Transformers 配置修复前生成的 GGUF 长上下文会退化, 这意味着 40 个量化里有一部分可能要重做, 具体多少页面没统计.

横向看, 这页把 Medium 3.5 定在 「128B 稠密」 一档, 对手都是总量几百 B 到 1T 的 MoE. 在自家线里它是全面升级; 放到竞品里, 它在 Collie 上第一, Beyond AIME 第二, SWE-Bench, τ³-Telecom, τ³-Retail 都是第三, 在 BrowseComp 和 τ³-Airline 上落后. 页面的叙事重心也因此放在 「对比旧模型」 上, 第一张图五项全胜, 竞品图只一笔带过 「strong results」.

## 9. 本页对不上的地方

版本号: 文字要求 mistral_common >= 1.11.1, 链接却指向 releases/tag/v1.11.0. GLM 的版本: 智能体图表头和横轴写 GLM 5.1 / GLM-5.1, 数学图写 GLM 5 / GLM-5, 两处规模都是 744B - A40B, 页面没解释为何换版本. Kimi 的规模在表头写 1000B - A32B, 横轴写 1T A32B, 数值等价, 写法不同.

图和文件名错位: p05-agentic-benchmarks-vs-previous-mistral-coding-models.png 画的是和 Magistral, Small 4, Medium 3.1 的对比, 没有编码模型; 编码模型对比在 p05-chart.png. p06 的文件名是 instruction-following-reasoning-and-coding-benchmarks, 图标题却是 「Agentic Benchmarks vs competing models」; p07 文件名是脚注的第一句, 图本身是数学和指令遵循. p01-downloads-last-month.png 只是一个 「34」 徽标, 下载量 99,235 在文字里.

截断和笔误: vLLM 命令断在 「--reasoning-pars」, SGLang 命令的模型路径断在 「mistralai/Mistral-Medium-3」, GPU 注释 「B200 / B30」 可能也被截了一位. 合集简介把 flagship 拼成 flaship, Vibe 配置 description 把 model 写成 mode. 另外标签写 24 languages, 正文只点名 11 种, 说法是 「dozens」, 两者不矛盾, 但其余 13 种没有列出. 正文 「across all benchmarks」 超过 Devstral, 图里和 Devstral 同框的只有 SWE-Bench 一项.

能对上的也记一笔: SWE-Bench Verified 77.6 在评测结果栏, 正文, 编码模型图, 竞品图四处一致. τ³ 四项和 BrowseComp 在自家对比图和竞品图里五个数完全一致. 21 个 Space 等于列出的 5 个加 「+ 16」. 128B 在 Model size 标签和 Key Features 里一致, 256k 在概述, Key Features, Large Context Window 三处一致.
