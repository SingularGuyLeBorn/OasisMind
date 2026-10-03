---
title: "Mistral Large 3 技术解析"
category: "模型库"
tags: ["Mistral", "技术解析"]
published: true
excerpt: "页面给了两套参数口径. 第一套在模型介绍段: 总参数 675B, 激活参数 41B, 说的是整个多模态模型."
---
这是 Hugging Face 上 Mistral-Large-3-675B-Instruct-2512 的模型卡, 9 页, 9 张图, 其中 4 张是数据图, 其余是页面图标.

- 仓库: `mistralai/Mistral-Large-3-675B-Instruct-2512`, 许可证 Apache 2.0.
- 规模 (整体): 总参数 675B, 激活参数 41B.
- 规模 (分部件): 细粒度 MoE 语言模型 673B, 激活 39B; 视觉编码器 2.5B.
- 训练: 「trained from the ground up with **3000 H200s**」, 没有时长和 token 数.
- 权重格式: 本仓库 **FP8**; 另有 **NVFP4** 和 **BF16** 两个仓库.
- 部署: FP8 用单个 B200 或 H200 节点 (第 7 页写明 **8xH200**); NVFP4 用单个 H100 或 A100 节点.
- 上下文: 256k, vLLM 默认 `--max-model-len` 262144.
- 评测: GPQA Diamond 67.17\*; Base 对比五项; Instruct 人评胜率四组; LMArena **1418 ± 11**.
- 工具链: vllm >= 1.12.0, mistral_common >= 1.8.6; Eagle 草稿模型, 每步投机 3 个 token.
- 模型树: 基座 Base-2512 下微调 13 个, 合并 1 个, 量化 7 个; 合集 4 个条目.
- 没印的: 层数, 隐藏维度, 专家个数, 路由方式, 注意力结构, 词表大小, 训练 token 数, 训练时长, 价格.

## 1. 参数账: 675 和 673 + 2.5

页面给了两套参数口径. 第一套在模型介绍段: 总参数 675B, 激活参数 41B, 说的是整个多模态模型. 第二套在 Key Features: 语言模型 673B, 激活 39B, 外加一个 2.5B 的视觉编码器. 两套放在一起, 读者自然会去做加法.

加出来是 673 + 2.5 = 675.5, 39 + 2.5 = 41.5. 如果顶部两个数都是向下取整, 账能对上; 如果是四舍五入, 675.5 应该写成 676. 页面没说取整规则, 也没说视觉编码器在纯文本请求里是否参与计算, 所以 「41B 激活」 究竟指图文请求还是纯文本请求, 从这页判断不了.

激活比例也可以粗算. 整体 41 / 675 约 6.1%, 语言模型 39 / 673 约 5.8%. 页面用 「granular」 形容这个 MoE, 通常意味着专家切得细, 每次激活的比例小, 这个比例和说法方向一致. 专家总数和每个 token 选几个专家, 页面都没印, 细粒度到什么程度无从验证.

## 2. 3000 张 H200 和 「从头训练」

训练信息只有一句: 「trained from the ground up with 3000 H200s」. 「from the ground up」 表明它不是在已有模型上继续训练出来的, 这句话想强调的是一个全新的底座. 3000 是卡数, 不是卡时.

光有卡数算不出训练量. 没有训练天数, 没有 token 数, 没有 MFU, 也没有数据配比, 就连 3000 张卡是同时在线还是累计使用过, 都没写. 页面在 Base 模型对比里给了分数, 但分数背后的训练账是空白, 和同规模模型比训练效率无从谈起.

## 3. 三种精度和单节点部署

这个仓库本身是 FP8. 页面另外链接了 NVFP4 和 BF16 两个仓库, 并给出部署对应关系: FP8 配 B200 或 H200 单节点, NVFP4 配 H100 或 A100 单节点. 第 7 页补了一句 FP8 可以跑在 「one 8xH200 node」 上.

按每参数字节数估算纯权重: FP8 每参数 1 字节, 约 675 GB; BF16 每参数 2 字节, 约 1350 GB; NVFP4 每参数 4 bit, 约 338 GB, 块缩放因子另算. FP8 分到 8 张卡, 每卡约 84 GB; NVFP4 若也分到 8 张卡, 每卡约 42 GB. 这些还没算 KV cache, 256k 上下文下 KV cache 会占多少, 页面没给注意力结构, 也就没法算.

页面对精度的取舍给了一条建议: 打算微调就用 FP8, 因为 「in some situations」 比 NVFP4 更精确. 这句话没有量化, 没给 FP8 和 NVFP4 的分数差. BF16 只说 「if needed」, 没说什么情况需要. 三个格式之间的精度损失, 这页一个数也没有.

## 4. 256k 上下文和 262144

能力清单写 「Supports a 256k context window」, 启动命令里 `--max-model-len` 是 262144. 256 × 1024 = 262,144, 两处一致, k 取 1024.

页面对这个长度的态度有点矛盾. 一方面把长上下文放在设计目标 (「long-context comprehension」) 和使用场景 (「Long Document Understanding」) 的首位; 另一方面又说默认的 262144 「quite large but not necessary for most scenarios」, 建议调小省显存. 投机解码那条命令里, Eagle 草稿模型的 `max_model_len` 只有 16384, 是 262144 的十六分之一. 用满长上下文时草稿模型还能不能帮上忙, 页面没交代.

## 5. Base 模型对比: 五项里赢两项

第 5 页的柱状图比较 Base 模型, 对手是 Deepseek-3.1 (670B) 和 Kimi-K2 (1.2T). Mistral Large 3 在 MMMLU (85.5) 和 GPQA-Diamond (43.9) 上第一; SimpleQA (23.8) 和 AMC (52.0) 排第二, 输给 Kimi-K2 的 26.0 和 54.4; LiveCodeBench (34.4) 排最后, Deepseek-3.1 是 35.6, Kimi-K2 是 40.2.

逐项差值: 对 Deepseek-3.1 依次是 +1.3, +2.0, +4.1, +5.6, -1.2; 对 Kimi-K2 依次是 +2.0, +8.3, -2.2, -2.4, -5.8. 五项简单平均, Mistral Large 3 约 47.92, Kimi-K2 约 47.94, Deepseek-3.1 约 45.56. 简单平均只是粗看, 不同基准的分数尺度不同, 这里只说明: 对 Deepseek-3.1 大体领先, 对 Kimi-K2 基本持平.

「similar sized models」 这句话对 Kimi-K2 不太成立. 图上标 1.2T, 约是 675B 的 1.78 倍. 图里只标了总参数, 没标激活参数, 而对 MoE 来说, 激活参数才更接近单 token 计算量. 设置上, GPQA-Diamond 标 「5-shot, no CoT」, LiveCodeBench 标 「no CoT」, 其余三项只写了 「8-lang average」 或 「Exact match」, shot 数没写.

## 6. Instruct 人评胜率

Instruct 对比换成了人评胜负. General Prompts 一组: 对 Deepseek V3.1 胜 53%, 对 Kimi K2 胜 55%. Multilingual Prompts 一组: 对 Deepseek V3.1 胜 57%, 对 Kimi K2 胜 60%. 脚注写 「Evaluations judged by humans conducted by a third party」.

换成胜负比: 53/47 约 1.13, 55/45 约 1.22, 57/43 约 1.33, 60/40 = 1.5. 多语言组的优势比通用组大, 这和页面把 Multilingual 列为能力之一相呼应. 奇怪的是, Base 对比里 Kimi-K2 和 Mistral Large 3 平均分几乎一样, 到了 Instruct 人评, Kimi K2 反而是输得更多的那个. Base 分数和 Instruct 人评测的是不同东西, 页面也没把两者联系起来.

这组数的短板是信息太少. 每组只有 Win 和 Lose, 加起来都是 100%, 没有平局. 样本量, 提示词来源, 评审人数, 第三方是谁, 都没写. 没有样本量就算不出误差, 53% 对 47% 这种 6 个点的差距是否显著, 这页判断不了.

## 7. LMArena: 误差棒最宽的那个

第 6 页的 LMArena ELO 图有五个模型, 除 Mistral Large 3 外其余四个都标 non-thinking; Mistral Large 3 这一根没标, 页面第 4 页自称它不是专门的推理模型. 分数: Mistral Large 3 1418 ± 11, Qwen3-VL 1394 ± 4, Qwen3 2507 1421 ± 4, Kimi-2 0905 1418 ± 7, DeepSeek v3.2 1423 ± 7.

按 ± 范围读区间: Mistral Large 3 为 1407 到 1429, Qwen3 2507 为 1417 到 1425, Kimi-2 0905 为 1411 到 1425, DeepSeek v3.2 为 1416 到 1430, Qwen3-VL 为 1390 到 1398. 前四者的区间两两重叠, 只有 Qwen3-VL 明显落在下面. Mistral Large 3 和 DeepSeek v3.2 差 5 分, 按标准 Elo 公式, 期望胜率约 49.3%, 实际上和平手没什么区别.

Mistral Large 3 的误差棒 ±11 是五个里最宽的, 通常意味着它参与的对战场次较少, 页面没给场次. ± 是 95% 置信区间还是别的统计量, 也没说. 另外, 这张图的对手和第 5 页不是同一批: 第 5 页是 Deepseek-3.1 和 Kimi-K2, 这里是 DeepSeek v3.2 和 Kimi-2 0905, 还多了两个 Qwen3 模型. 页面没解释为什么换对手.

## 8. 能力清单和自认的短板

能力清单有七项: Vision, Multilingual, System Prompt, Agentic, Frontier, Apache 2.0 License, Large Context Window. 其中 Agentic 和 Frontier 都写 「best-in-class」, 但两项都没有配对应的分数. 页面唯一和 agent 相关的数字是 「原生函数调用和 JSON 输出」, 没有工具调用类基准.

短板一节写得比较坦白: 不是专门的推理模型, 严格推理场景会输给推理模型; 多模态任务落后于视觉优先的模型; 体量大, 部署复杂. 这三条和前面的数对得上: Base 对比里 LiveCodeBench 和 AMC 都没拿第一, LMArena 比的全是 non-thinking 模式, 视觉方面页面一个视觉基准都没给.

推荐设置也透露了使用边界. temperature 建议低于 0.1; 工具数量压到最少; 图像宽高比接近 1:1, 太窄太宽的图要先裁剪. 最后一条说明视觉编码器对长宽比敏感, 但分辨率上限和单图 token 数都没写. 投机解码那条命令里 `--limit-mm-per-prompt` 设的是每个提示 10 张图, 这是页面上唯一的图像数量数字.

## 9. 部署链路: vLLM 和 Eagle

页面只推荐 vLLM. transformers 还没支持, 原话是 「didn't have enough time」, 欢迎社区提 PR. 版本要求是 vllm >= 1.12.0, 装 vllm 时会自动带上 mistral_common >= 1.8.6. 服务默认监听 localhost 的 8000 端口.

最简启动命令有一处印刷问题: 第三行写成 `--load_format mistra`, 值少了末尾的 l, 行尾也没有续行反斜杠. PDF 文本层和渲染页都是这样, 照抄会出错. 第 8 页的完整命令写的是 `--load-format mistral`, 参数名用连字符; 第 7 页用下划线 (`--tokenizer_mode`, `--config_format`, `--load_format`). 两种写法 vLLM 是否都认, 页面没说.

加速方案是投机解码, 草稿模型 Mistral-Large-3-675B-Instruct-2512-Eagle, 方法 eagle, 每步投机 3 个 token. 页面称之为 「For maximum performance」, 但没给加速倍数, 没给接受率, 也没给草稿模型的参数量. 草稿模型的长度上限 16384 写成了字符串, 其余数字参数都没加引号.

## 10. 谱系: 这页里的模型树

这页能画出的谱系全在 Hugging Face 的模型树和链接里. 上游是 `Mistral-Large-3-675B-Base-2512`, 本仓库是它的 Instruct 后训练版本. 平行的有三个官方仓库: NVFP4, BF16 和 Eagle 草稿模型. 合集 「Mistral Large 3」 有 4 个条目, 页面没列是哪 4 个.

下游数字: 基座下面的微调模型 13 个, 本模型是其中之一; 以本模型为来源的合并模型 1 个, 量化版本 7 个; 引用它的 Space 100 个. 13 个微调里官方占几个, 7 个量化是否包括官方 NVFP4, 页面都没说.

往前追, 页面只有 「From our family of large models」 一句, 没点任何前代模型的名字, 也没说 Large 3 在结构上继承了什么. 本目录里虽然有更早的 Large 稿, 但这一页不提供任何连接前代的数字. 能确定的只有名字里的 「3」 和 「2512」, 以及这张卡写明的结构: 一个细粒度 MoE 语言模型加一个视觉编码器.

## 11. 本页对不上的数字

下面这些不一致都出在这一页内部, 或者出在 PDF 和转出的 Markdown 之间, 没有拿外部资料对照. 大部分只是口径没写清, 不一定是错; 真正会让人照抄出错的只有启动命令里的 mistra 那一处.

- **675B 与 673B + 2.5B.** 相加得 675.5, 页面没说取整规则.
- **41B 与 39B + 2.5B.** 相加得 41.5, 同上; 也没说纯文本请求的激活量.
- **GPQA Diamond 67.17\* 与 43.9.** 前者挂在 Instruct 仓库, 星号无脚注; 后者是 Base 模型 5-shot no CoT. 相差 23.27, 口径不同.
- **「dozens of languages」, 11 种, 8 种.** 正文说几十种, 标签和点名列表是 11 种, MMMLU 取 8 种平均.
- **「similar sized」 与 Kimi-K2 (1.2T).** 1.2T 约是 675B 的 1.78 倍.
- **两张对比图的对手版本.** Base 图用 Deepseek-3.1 和 Kimi-K2, LMArena 图用 DeepSeek v3.2 和 Kimi-2 0905.
- **`--load_format mistra`.** 第 7 页命令截断成 mistra 且缺续行符; 第 8 页是 `--load-format mistral`.
- **262144 与 16384.** 主模型默认长度和草稿模型长度相差 16 倍; 16384 写成了字符串.
- **转出的 Markdown 丢数.** Community 角标 14, Finetuned (13), Quantizations 7 models 在渲染页上有, 源 Markdown 里没有; 第 5 页 Base 对比图的文件名写成 「model-performance-comparison-instruct」, 内容其实是 Base 模型对比.
