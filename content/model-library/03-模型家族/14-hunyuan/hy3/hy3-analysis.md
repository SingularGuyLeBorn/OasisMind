这是 Hugging Face 上 tencent/Hy3 的模型卡抓取, 不是技术报告.

## 1. 这一页同时是站点壳和 README

抓取把 Hugging Face 的页头, 模型树, 评测组件和 README 正文叠在同一份 md 里. 页头能读到的数字是 Like 971, 上个月下载 12,839, 以及一枚只印着 27 的角标. 后面 「Spaces using tencent/Hy3 27」 也是 27, 角标本身没有说明它计的是 Space 还是别的计数, 所以这两个 27 只能并列, 不能合成一个定义.

模型树写 67 个量化衍生, 11 个微调. 评测组件在正文之前先列了八个分数, 并写 Expand 3 benchmarks, 表示组件没有把卡里的基准列完. 中文 README 只有一个链接, 这次抓取的正文是英文卡.

## 2. 299B, 295B, 21B, 3.8B 是四次出现, 不是一个数

侧栏模型大小是 **299B params**, 张量类型 **BF16 · F32**. 导语和表把参数写成三行: 总参数 295B, 激活参数 21B, MTP 层参数 3.8B. 295 加 3.8 等于 298.8, 离侧栏 299 还差 0.2B. 卡上没有写这 0.2B 是舍入, 也没有写侧栏已经把 MTP 层加进总参数.

导语用 with 把 295B, 21B, 3.8B 并列, 表把它们分成三行. 两处都没有写 3.8B 在 295B 之内或之外. 激活的 21B 是单独一行, 不和总参数共用一个格子, 也不和 MTP 层共用一个格子. 21 除以 295 大约是 7.1%, 这是算出来的比例, 卡上没有印.

## 3. 结构表里还有哪些格子

层数 80, 括号写明不含 MTP 层. MTP 层数是 1. 把 80 和 1 相加得到 81, 表上没有这个和. 注意力头 64, 括号是 GQA, 8 个 KV 头, head dim 128. 64 乘 128 等于 8192, HiddenSize 印的是 4096, 两者差一倍, 这格没有再说明 head dim 乘的是查询头还是别的组.

中间维 13312. 上下文 256K, 这是窗口长度. 词表 120832. 专家 192, 激活 **top-8**. 表上的精度是 **BF16**. 专家个数和 top-8 是两列信息, 卡上没有把 8/192 印成一个稀疏度.

## 4. Preview 和这次发布各写了什么

导语只写 Hy3 Preview 在 **late April** 发布, 没有年份, 没有日. 反馈来自 50+ 个产品, 然后后训练加大, RL 也加大. 这两处加大都发生在发布之前, 是部署前的缩放. 正文没有写预训练 token 数, 所以不能从这张卡推出一个语料规模.

「参数量是自己 2 到 5 倍的开源旗舰」 没有附表. 大表里的对手列没有参数量. 因此 2 到 5 倍不能用 GLM-5.1, GLM-5.2 或其他列的名字去填. 生产力一句点了编程, 办公, 金融建模, 前端, 游戏开发, 五件事都没有分项分数.

## 5. 分数有三处, 彼此不完全重合

第一处是第 2 页组件: GPQA Diamond 90.4, Apex Agents 25.6, SWE-bench Verified 78, DeepSWE 28, SWE-bench Pro 57.9, Terminal-Bench 2.1 71.7*, Long-Horizon Terminal-Bench solved 1*, WildClawBench 53.6. 第二处是第 7 页大表, 列从 Hy3 preview 到 GPT-5.5. 第三处是第 5 页十二张小柱图, 图例只有 Hy3, Hy3 preview, GLM-5.2, Seed-2.1 Pro, DeepSeek-V4 Pro, Qwen-3.7 Max, GPT-5.5, Claude Opus 4.8.

组件上除了 1* 以外, 另外七个数字都能在大表的 Hy3 列对上: 90.4, 25.6, 78.0, 28.0, 57.9, 71.7, 53.6.1* 在大表里没有行. 星号在整份 md 里没有脚注, 所以带星的格子不能解释成某一种评测设置.

## 6. 柱图和斜线格

Hy3 对 preview, 十二张子图读数和大表的前两列一致: SWE-bench Pro 57.9 / 46.0, SWE-bench Multilingual 75.8 / 68.3, NL2Repo 45.6 / 35.3, Terminal-Bench 2.1 71.7 / 58.0, BrowseComp 84.2 / 67.1, MCP Atlas 79.1 / 66.1, ClawEval pass^3 68.5 / 55.0, SkillsBench 55.3 / 29.1, HLE with tools 53.2 / 35.4, FrontierScience-Olympiad 74.8 / 70.0, MathArena Apex 38.7 / 12.6, AA-LCR 73.4 / 66.3.

斜线格的取法不统一. Terminal-Bench 2.1 上 Claude 的大表格子是 85/85.4*, 柱图取了左边的 85.0. MCP Atlas 上 GLM-5.2 的大表格子是 76.8/82.6*, 柱图取了右边的 82.6. BrowseComp 上柱图把 79.3 放在 GLM-5.2, 大表的 79.3 在 GLM-5.1, GLM-5.2 是 「-」. 图例本来就没有 GLM-5.1, 所以这根柱对不上任何一列已经印出的 GLM-5.2 分数.

## 7. Hy3 不是每一行的最高分

SWE-bench Pro: Hy3 57.9, GLM-5.1 58.4, GLM-5.2 62.1. SWE-bench Verified: Hy3 78.0, DeepSeek-V4 Flash 79.0. HLE with tools, 纯文本: Hy3 53.2, GLM-5.2 54.7, Seed-2.1 Pro 55.7, Claude Opus 4.8 57.9, GPT-5.5 52.2. 这一行 Hy3 高于 GPT-5.5, 低于 Claude. GPQA Diamond 的 Hy3 是 90.4, 高于 preview 的 87.2, 低于表里的 Qwen-3.7 Max 92.4 和 Gemini 94.3.

DeepSWE 从 preview 0.9 到 Hy3 28.0, 和组件上的 28 一致. USAMO 2026 从 preview 37.3 到 Hy3 72.0, GLM-5.1 那一格是 37.3*, 和 preview 同一个数. 这些是格子对照. 导语写的是超过相近规模, 并比肩 2 到 5 倍参数的旗舰. 相近规模和 2 到 5 倍都没有参数列, 上面几行里 Hy3 也低于同表的对手.

## 8. 盲评, 幻觉率和脚手架

270 名专家的盲评是 Hy3 2.67/4, GLM-5.1 2.51/4. 分母是 4. 正文说优势最大的三项是前端, 数据与存储, CI/CD, 没有分项. 对手只印了 GLM-5.1, 没有 GLM-5.2.

幻觉率从 12.5% 到 5.4%, 常识错误率从 25.4% 到 12.7%, 多轮问题率从 17.4% 到 7.9%. 三句都没有写出起点模型. 不能把 Hy3 preview 列的基准分数填进这三个百分比. MRCR 只被点名. SWE-Bench Verified 在 CodeBuddy, Cline, KiloCode 之间的波动写成 4% 以内, 三家各自的分数没有印. 大表和组件都只有一个 Hy3 的 78.

## 9. 推理档和两套草稿长度

代码注释把 reasoning_effort 的默认写成 **no_think**, 加粗推荐句把同一档印成带空格的 「no_ think」, 把 **high** 印成 「high 」. temperature 在代码块里是 0.9, 在加粗句里被拆成 「0. 9」. top_p 同样从 1.0 被拆成 「1. 0」. 这是抓取把小数点拆开, 不是两套推荐值. 用户句子停在 「introduce y」, 后半不在 md 里.

把 reasoning_effort 调到 high, 是推理时多算, 也就是 TestingTime. 默认 no_think 是直接回答. 上下文 256K 不属这一档. 部署段另印了两个草稿长度: vLLM 一列是 2, SGLang 一列是 3. 表里的 MTP 层数是 1, 和 2, 3 都不是同一个数. 8 张 GPU 和 **H20-3e** 是卡上的服务建议. 命令行本身不在这篇笔记里.

## 10. 两套权重和目录里没有落地的那一节

新闻行同时发布 **Hy3** 和 **Hy3-FP8**. 模型表第二行写明 FP8 量化. 侧栏的 BF16 · F32 和 299B 没有标明属于哪一行, 所以不能把 FP8 读成侧栏那一种张量类型. 许可证是 **Apache License 2.0**. 邮箱是 hunyuan_opensource@tencent.com.

目录里有 Stronger Agent Capabilities, 第 4 页页脚也是这几个词, 正文没有这个标题. 第 5 页的柱图落在 Model Introduction 和 More Reliable Product Experiences 之间, 图文件名取自后一句生产力场景, 图的内容是十二个基准. 微调, GRPO, AngelSlim 都只有名字和链接, 卡上没有训练步数, 也没有压缩比.
