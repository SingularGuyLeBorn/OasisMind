---
title: "GLM-Z1-32B-0414 模型卡: 四段介绍, 两张柱状图, 一份使用建议"
category: "模型库"
tags: ["GLM", "技术解析"]
published: true
excerpt: "页面上的控件都属于 Hugging Face 的仓库页: 页眉搜索框, Like 和 Follow 按钮, 任务和语言标签, Deploy 与 Use this model 按钮, Model card / Files / Community 三个标签页, Safetensors 信息栏, Infe…"
---
源材料是 Hugging Face 上 zai-org/GLM-Z1-32B-0414 的模型卡打印件, 共 7 页, 不是技术报告.

# GLM-Z1-32B-0414 模型卡: 四段介绍, 两张柱状图, 一份使用建议

来源是同目录的 `glm-z1.md`, 由 MinerU 从 `glm-z1.pdf` 抽出, 第 1 页到第 7 页, 引用了 5 张图. 逐段对照和疑惑记在 `glm-z1-bi.md`. md 丢字, 丢图例或认错的地方, 按 PDF 文字层和渲染页核对过, 源文件没有改动.

## 1. 这是一张 Hugging Face 模型卡

页面上的控件都属于 Hugging Face 的仓库页: 页眉搜索框, Like 和 Follow 按钮, 任务和语言标签, Deploy 与 Use this model 按钮, Model card / Files / Community 三个标签页, Safetensors 信息栏, Inference Providers 试用框, Model tree, Spaces, Collection, Paper, 最后是站点页脚. 真正由发布方写的正文从第 2 页的 「GLM-4-Z1-32B-0414」 标题开始, 到第 7 页的引用条目结束, 篇幅不到四页.

卡上没有作者列表, 没有发布日期, 没有方法节, 也没有结构表. 带数字的统计 (点赞 196, 关注 21.3k, 上月下载 34,976, 衍生仓库 5 + 1 + 17) 都是打印那一刻的快照, 打印日期本身没印. 关联论文是 2024 年 6 月发表的 ChatGLM 家族论文, 题目里没有 Z1, 也就不能当成 Z1 的技术报告来读.

## 2. 名字里的 32B 和 0414

参数量在卡上出现两次, 数字不一样. 第 1 页 Safetensors 栏写 「Model size 33B params」, 第 2 页正文说 GLM-4-32B-0414 系列 「featuring 32 billion parameters」, 仓库名里是 32B. Z1 以 GLM-4-32B-0414 为基础, 所以 32B 是沿用下来的名义规模, 33B 是文件信息栏的数. 两者都是取整, 卡上没有精确值, 也没说 33B 的统计口径.

0414 是整个系列共用的后缀, GLM-4-32B-0414, GLM-4-32B-Base-0414, GLM-Z1-Rumination-32B-0414, GLM-Z1-9B-0414 和合集名 「GLM-4-0414」 都带它. 读成 4 月 14 日符合常见命名习惯, 但卡上没有这样解释, 也没有年份. 名字写法本身也不统一: 仓库是 zai-org/GLM-Z1-32B-0414, 正文标题是 GLM-4-Z1-32B-0414, 示例代码里是 THUDM/GLM-4-Z1-32B-0414. 引用时建议照录仓库路径.

## 3. 卡上印了哪些训练描述

关于底座 GLM-4-32B-Base-0414, 卡上说它在 「15T of high-quality data」 上预训练, 其中有大量推理类合成数据. 15T 没有单位. 关于 GLM-4-32B-0414 的后训练, 卡上列了面向对话的人类偏好对齐, 以及用拒绝采样和强化学习加强指令遵循, 工程代码, 函数调用. 这些描述的主语都是 GLM-4 那一支, 不是 Z1.

关于 Z1 本身只有四个短语: 冷启动, 扩展的强化学习, 在数学, 代码, 逻辑任务上的进一步训练, 基于成对排序反馈的通用强化学习. 数据量, 算法名, 奖励形式, 训练步数全都没有. 结构方面, 标签 「glm4」 和 YaRN 一节里的 rope_scaling 字段是仅有的线索, 层数, 隐藏维度, 注意力头数, 词表大小一项也没印, 这里不补.

## 4. 同一张卡上的另外四个名字

正文按名字介绍了五个模型. GLM-4-32B-0414 是新一代 32B 开源基座系列, 页面说它可比 GPT 系列和 DeepSeek V3/R1 系列, 部分基准能和 GPT-4o, DeepSeek-V3-0324 (671B) 相比, 但卡上没有给出这些比较的分数. GLM-4-32B-Base-0414 是它的预训练底座. 本仓库 GLM-Z1-32B-0414 是在 GLM-4-32B-0414 上训出来的推理模型.

GLM-Z1-Rumination-32B-0414 是 「沉思」 模型, 对标 OpenAI 的 Deep Research, 在深度思考时接入搜索工具, 用多种基于规则的奖励做端到端强化学习, 卡上没有它的任何分数. GLM-Z1-9B-0414 是用 「the aforementioned series of techniques」 训出来的 9B 小模型, 底座是哪个没写. 页面说它在同尺寸开源模型里领先, 能对上的数据只有第 4 页第二张图. 合集写 6 个条目, 正文只点名了这五个.

## 5. 第一张柱状图: Z1-32B-0414 对四个模型

`p04-chart.png` 的图例是 Z1-32B-0414, DeepSeek-R1, QwQ-32B, DeepSeek-R1-Distill-Llama-70B, o1-mini, 横轴十个基准, 下面分别标着中文类别: 数学推理 (AIME24, AIME25, Omni-MATH), 代码生成 (LCB 2408-2501), 指令遵循 (SysBench ISR, IFEval), 通用问答 (ArenaHard), 综合工具调用 (BFCL v3), 科学 (SuperGPQA, GPQA). Z1-32B-0414 的十个分数依次是 80.8, 63.6, 68.4, 59.1, 81.2, 84.5, 90.6, 70.5, 52.6, 66.1.

它在 AIME24, Omni-MATH, SysBench, BFCL 四项第一. AIME25 (70.0), LCB (65.9), ArenaHard (95.0), SuperGPQA (61.8), GPQA (71.5) 五项是 DeepSeek-R1 最高, IFEval 上 o1-mini 84.8 比 Z1 的 84.5 略高. 和同为 32B 的 QwQ-32B 比, Z1 十项里有七项更高, AIME25, LCB, ArenaHard 三项更低. SysBench 一栏 o1-mini 没有柱子. 图上没有纵轴名称, 没写分数的计算方式, 采样次数和解码设置, 所以这些数只能在图内横向比较.

## 6. 第二张柱状图: 图例被裁掉了

`p04-mathcal-q-model-usage-guidelines.png` 的文件名取自下一行标题, 截图也把图例裁掉了, 只看 md 不知道三种颜色是谁. 按 PDF 第 4 页, 图例是 Z1-9B-0414, DeepSeek-R1-Distill-Qwen-7B, DeepSeek-R1-Distill-Qwen-14B. PDF 里嵌入的原图是 1280x598 像素, MinerU 裁出的是 1174x469, 上方图例那一条没进来.

按图例读, Z1-9B-0414 的十个分数依次是 76.4, 56.6, 64.4, 51.8, 77.3, 81.9, 67.4, 66.6, 43.6, 58.5. 它十项全部高于 7B 蒸馏模型. 和 14B 蒸馏模型比, LCB (51.8 对 53.1) 和 GPQA (58.5 对 59.1) 略低, 其余八项更高, 差距最大的是 ArenaHard (67.4 对 50.4) 和 SysBench (77.3 对 53.6). 对照组里没有同为 9B 的模型, 「同尺寸领先」 这句话在图上只能间接看.

## 7. 使用建议: 采样参数, 强制思考, 历史裁剪

采样参数表给了四个推荐值: temperature 0.6, top_p 0.95, top_k 40, max_new_tokens 30000. 最后一项的说明是 「Leaves enough tokens for thinking」, 意思是思考过程会占掉不少输出长度. 表格跨在第 4 页和第 5 页之间, 表头印了两次. md 的说明栏里单词粘连, 例如 「Balancescreativityandstability」, PDF 文字层是正常分词的.

强制思考一节要求在第一行加 `<think>\n`, 用 chat_template.jinja 时会自动注入. 历史裁剪一节要求历史里只留最终可见回复, 隐藏的思考内容不存进历史, 同样说模板里已经实现. 这两节都依赖仓库里的模板文件, 而模板原文不在这份 PDF 里. 「first line」 指提示末尾还是回复开头, 卡上没写清, 自己写模板时要去看原文件.

## 8. YaRN: 8,192 和 32768

长上下文一节说, 输入超过 8,192 个 token 时可以考虑开 YaRN, 做法是在 config.json 里加一段 rope_scaling: type 为 yarn, factor 为 4.0, original_max_position_embeddings 为 32768. 页面还提醒静态 YaRN 对所有文本统一生效, 可能让短文本表现略降, 所以按需开启.

两个数字的关系卡上没解释. 字段名显示原始位置长度是 32768, 建议开启的门槛却是 8,192. factor 乘原始长度得 131072, 这只是算术, 卡上没写开启后的最大长度, 也没给开与不开的长文本分数. 开 YaRN 对哪类任务有帮助, 短文本掉多少, 都要另找来源.

## 9. 示例代码和引用条目

示例代码要求 「transforemrs>=4.51.3」, 拼写错误在 PDF 上也存在, 是页面原有的. 代码用 AutoModelForCausalLM 和 AutoTokenizer 加载 「THUDM/GLM-4-Z1-32B-0414」, 走 apply_chat_template, 然后以 max_new_tokens 4096, do_sample False 调用 generate. 这一组设置和第一节推荐的采样参数不一致: 不采样时 temperature, top_p, top_k 都不起作用, 4096 也远小于推荐的 30000. 卡上没说以哪处为准.

代码框在打印时只印出了可见宽度, 有三行在右端截断. md 在 message 行末尾补了一个 PDF 里没有的右括号, device_map 那行截断位置也和 PDF 差一个字母. 引用条目同样被截断, 题目在 md 里变成 「GLM-130B +」, PDF 是 「GLM-130B t」, 条目指向的是 arXiv 2406.12793, 也就是第 2 页那篇 ChatGLM 家族论文.

## 10. 五张图里三张是界面图标

第 1 页两张: `p01-image.png` 是黑底白字的数字 3, 即 Community 标签的讨论数徽标; `p01-search-models-datasets-users.png` 是黄色手形图标, 画面和 Community 标签左侧的图标一致, 文件名却取自页眉搜索框. 第 7 页一张: `p07-system-theme.png` 是笔记本电脑形状的灰色图标, 在页脚 「System theme」 按钮上. 这三个文件都在 378 到 1409 字节之间, 尺寸不超过 44x47 像素.

另外两张是第 4 页的柱状图, 分别是 178311 和 131296 字节. 前者带图例, 后者图例被裁掉, 要回到 PDF 才能认出是 9B 的对比图. 全卡没有结构图, 没有训练曲线, 也没有流程图. md 还漏了一些页面元素: 两个 Space 名前的 emoji, 第 7 页页脚的 TOS, Privacy, About, Models, Datasets, Spaces, Pricing, Docs, 以及行首被认成 「曲」 和 「品」 的两个图标.

## 11. 这张卡能支撑的说法

能直接引用的有: 仓库是 zai-org/GLM-Z1-32B-0414, 许可证 MIT, 张量类型 BF16, 信息栏显示 33B 参数; 它是基于 GLM-4-32B-0414, 经冷启动, 强化学习和数学/代码/逻辑任务训练得到的推理模型; 第 4 页图上的十个基准分数; 推荐采样参数 temperature 0.6, top_p 0.95, top_k 40, max_new_tokens 30000; 超过 8,192 token 时可按给出的配置开启 YaRN; transformers 版本不低于 4.51.3.

不能从这张卡得出的有: 精确参数量, 层数和其他结构参数, 15T 的单位, 发布日期, 0414 的确切含义, 冷启动和强化学习的具体配置, Rumination 的分数, 9B 的底座, 与 GPT-4o 和 DeepSeek-V3-0324 比较的数据. 这些要么没印, 要么只有一句描述. 需要时要另找来源, 并注明来源不是这张模型卡.
