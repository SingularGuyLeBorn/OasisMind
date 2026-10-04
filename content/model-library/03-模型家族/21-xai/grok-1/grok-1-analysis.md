---
title: "Grok-1 开源公告: 314B MoE 基座权重放了什么, 没放什么"
category: "模型库"
tags: ["xAI", "技术解析"]
published: true
excerpt: "这份材料能回答的问题很窄: xAI 在什么时候, 用什么许可证, 放出了哪个阶段的 Grok-1 权重, 这个模型有多大, 属于什么结构类型."
---
源文是 x.ai 2024 年 3 月 17 日的开源公告, 正文不到十句, 其余是 2026 年网站快照的页脚. 全页的模型数字只有 314 billion 总参数, 25% 激活比例, 2023 年 10 月预训练结束, Apache 2.0 许可证四项. 层数, 专家拓扑, 上下文长度, 训练数据和评测分数页面都没有.

# Grok-1 开源公告: 314B MoE 基座权重放了什么, 没放什么

来源: 同目录 `grok-1.md` (页标记 `page 1 of 3` 到 `page 3 of 3`), 对照译稿 `grok-1-bi.md`. 配图两张: `images/p02-2026-spacexai-llc.png` 是页脚的 SpaceX 字标, `images/p03-faqs-https-x-ai-legal-faq-enterprise.png` 是深色模式切换用的月亮图标, 都不是技术图. 数字一律回源 md.

这份材料能回答的问题很窄: xAI 在什么时候, 用什么许可证, 放出了哪个阶段的 Grok-1 权重, 这个模型有多大, 属于什么结构类型. 它回答不了 Grok-1 内部怎么搭, 训练用了多少数据和算力, 以及它在任何评测上表现如何.

## 1. 页面性质: 一段公告加一整页页脚

正文集中在第 1 页和第 2 页第一句. 顺序是: 日期 Mar 17, 2024, 标题「Open Release of Grok-1」, 一句副标题, 三段说明 (模型是什么, 权重来自哪个阶段, 许可证), 一个 GitHub 入口, 然后是「Model Details」下的三条要点. 第 2 页的 SpaceX 图之后全是网站导航, 产品, 法律条款和社交账号链接, 一直延续到第 3 页结束. 按字节算, 页脚占了源文的大半.

页脚本身也有信息量, 只是和 Grok-1 无关.「© 2026 SpaceXAI LLC」说明这是 2026 年抓的快照, 同家族 [xAI 新闻页分析](../xai/xai-analysis.md) 记录了 2026 年 2 月 SpaceX 收购 xAI, 网站署名随之改变. 页脚里的 Grok Bot, Imagine, Colossus, Grokipedia 等条目都是 2024 年 3 月之后才出现的产品. 读这份材料时要**把两层分开**: 正文反映 2024 年 3 月的发布, 页脚反映 2026 年的网站结构.

## 2. 这次放出的是什么: 预训练结束时的原始 checkpoint

公告反复强调的是「base」. 放出的是「raw base model checkpoint from the Grok-1 pre-training phase」, 预训练在 2023 年 10 月结束, 模型「not fine-tuned for any specific application, such as dialogue」. 换句话说, 拿到的是一个**只做过 next-token prediction 的底座**, 不会像聊天产品那样按指令回答, 要用于对话还得自己做 SFT 和后续对齐. 基座与后训练的分工可以对照 [预训练](../../../../llm-guide/3-预训练/3-预训练.md) 与 [SFT](../../../../llm-guide/4-后训练/4.2-SFT/4.2-SFT.md).

这里有一个容易读错的链接. 正文里「Grok-1」指向 `x.ai/news/grok`, 那是 2023 年 11 月发布 Grok 聊天产品的新闻. 聊天产品背后的模型做过面向对话的微调, 这次放出的是更早的预训练底座, **两者不是同一份权重**. 从 2023 年 10 月预训练结束到 2024 年 3 月 17 日发布, 中间约 5 个月, 本页没说这段时间 checkpoint 有没有再训练, 只说放出的是预训练阶段的产物.

许可证是 Apache 2.0, 覆盖「the weights and the architecture」. 本页没有提训练数据, 数据处理脚本或训练代码是否一并放出. 公告说的「architecture」更接近网络定义, **能加载权重并跑前向, 和能复现训练是两回事**. 具体放了哪些文件, 要看文中给的 [github.com/xai-org/grok](https://github.com/xai-org/grok) 仓库, 本页读不到.

## 3. 结构信息: 314B 和 25% 之外本页没有

「Model Details」里和结构有关的只有一句:「314B parameter Mixture-of-Experts model with 25% of the weights active on a given token.」 314B 是总参数, 正文前面写成「314 billion」, 是同一个数. 25% 是每个 token 用到的权重比例. 页面没有印激活参数的绝对值, 按比例换算约 78.5B. 这个换算有一个前提页面没交代: 前半句说「parameter」, 后半句说「weights」, 25% 的分母是否包含 embedding, 注意力层这类每个 token 都要经过的共享部分, 页面没说. 如果共享部分不计入, 实际参与计算的参数会比 78.5B 多. MoE 为什么能让总参数和单 token 计算量分开, 可以看 [MoE](../../../../llm-guide/2-核心原理与架构/2.6-MoE/2.6-MoE.md).

本页没有的结构信息比有的多得多: 专家个数, 每个 token 选几个专家, 路由方式和负载均衡, 层数, 隐藏维度, 注意力头数, 是否用 GQA 或 RoPE, 上下文长度, 词表大小, 权重存储精度. 这些都**不能从总参数和激活比例反推出来**, 比如 25% 既可以对应「8 选 2」, 也可以对应「16 选 4」或共享专家加路由专家的其它组合, 本页没给任何能区分它们的线索. 同家族里, [xAI 新闻页分析](../xai/xai-analysis.md) 提到 Grok-1.5 的上下文是 128,000 token, 但那是另一个型号, 不能挪到 Grok-1 身上.

## 4. 训练: 自研 JAX + Rust 训练栈, 数据只有形容词

训练相关的原文是两句. 一句是「Base model trained on a large amount of text data」, 另一句是「Trained from scratch by xAI using a custom training stack on top of JAX and Rust in October 2023.」前一句只说是文本数据和「large amount」, 没有 token 数, 语种比例, 来源或截止时间. 后一句给了技术栈: 基于 JAX, 再用 Rust 写了定制部分. 至于 Rust 管的是调度, 数据管线还是容错, 本页没说. 训练框架的一般分工可以对照 [训练框架](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.3-训练框架/6.1.3-训练框架.md), MoE 训练时的专家并行与通信问题见 [MoE 系统与并行](../../../../llm-guide/6-训练与推理优化/6.1-训练基础设施/6.1.8-MoE系统与并行/6.1.8-MoE系统与并行.md).

时间口径上有一处不一致. 第 1 页说预训练「concluded in October 2023」, 第 2 页说「trained ... in October 2023」, 后者读起来像整个训练都在 10 月完成. 按第 1 页理解更稳妥: 10 月是结束时间, 起点本页没有, 所以**训练时长和算力都算不出来**. 第 2 页的「October 2023.」还连同句号一起被做成了指向 x.ai 首页的链接, 这是网页模板遗留, 不是训练记录的出处. 本页也没有 Scaling Laws 分析, 训练曲线或损失值.

## 5. 使用与部署: 本页只给了一个 GitHub 入口

「To get started with using the model, follow the instructions at github.com/xai-org/grok」是全文唯一的使用说明. 硬件要求, 推荐的推理框架, 需要几张卡, 支持什么精度, 本页都没写. 可以粗算一下量级: 314B 参数如果按每参数 2 字节存, 单权重就约 628 GB, 按 1 字节量化也要约 314 GB. 这是按参数量做的算术, 页面没说实际发布的存储格式. MoE 的激活比例降低的是每个 token 的计算量, **不降低需要装进显存或内存的总权重**, 所以部署门槛仍由 314B 决定. 量化的一般做法见 [量化](../../../../llm-guide/6-训练与推理优化/6.3-模型压缩/6.3.1-量化/6.3.1-量化.md), MoE 部署时的专家放置问题见 [MoE 的工程实践](../../../../llm-guide/2-核心原理与架构/2.6-MoE/03-MoE负载均衡与容量/03-MoE负载均衡与容量.md).

评测方面, 本页一个分数都没有. 没有和同期开源模型的对比表, 没有 MMLU 之类的通用评测, 也没有安全评估. 作为未经微调的基座, 它的直接用途是**继续训练或研究, 而不是开箱对话**. 同家族的 [Grok-1.5 Vision](../grok-1-5v/grok-1-5v-bi.md) 专页才开始出现评测表, 那是一个月后的另一个型号.

## 6. 本页对不上的数字

对不上或缺失的地方集中在这几处. 一是 Grok-1 链接指向 2023 年 11 月的 Grok 聊天产品新闻, 而本页放出的是未做对话微调的预训练底座. 二是训练时间的口径, 第 1 页「concluded in October 2023」, 第 2 页「trained ... in October 2023」, 起始时间缺失. 三是 25% 激活比例没有配套的激活参数绝对值, 且「parameter」与「weights」两个词混用, 78.5B 只能作估算. 四是「a large amount of text data」没有 token 数. 五是一篇 2024 年的公告挂着「© 2026 SpaceXAI LLC」页脚, 两张图的文件名和内容也对不上, `p03-faqs-...` 实际是月亮图标.

页脚里还有几处抓取问题: Download 与 Grok Bot, Products 与 Solutions 两组栏目的链接左右交错; Use Cases 和 Security 各出现两次, 地址不同; BAA 和 Privacy choices 是栏目里仅有的无链接条目. 这些和模型无关, 只影响阅读顺序. 除此之外, 314B 与 314 billion, Mar 17, 2024 与 Apache 2.0 这些正文数字彼此没有矛盾. 想知道 Grok-1 的层数, 专家数和路由细节, 本页没有, 需要去 GitHub 仓库的模型定义里找.
