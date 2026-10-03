---
title: "Grok-1 · 对照译稿"
category: "模型库"
tags: ["xAI", "对照译稿"]
published: true
excerpt: "Grok-1 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 3 -->

A

A

[Back to news](https://x.ai/news)

[返回新闻](https://x.ai/news)

Mar 17, 2024

2024 年 3 月 17 日

# Open Release of Grok-1（Grok-1 开源发布）

We are releasing the weights and architecture of our 314 billion parameter Mixture-of-Experts model Grok-1.

我们公开发布 Grok-1 的权重和架构。Grok-1 是我们的 314 billion 参数 MoE 模型。

We are releasing the base model weights and network architecture of [Grok-1](https://x.ai/news/grok), our large language model. Grok-1 is a 314 billion parameter Mixture-of-Experts model trained from scratch by xAI.

我们公开发布大语言模型 [Grok-1](https://x.ai/news/grok) 的基座模型权重和网络架构。Grok-1 是由 xAI 从零训练的 314 billion 参数 MoE 模型。

> **问：** 标题说发布「weights and architecture」，本页给出的架构信息有哪些？
> 只有两条：总参数 314 billion，结构类型是 MoE。层数，隐藏维度，注意力头数，专家个数，每个 token 路由到几个专家，上下文长度，词表大小，本页一个都没写。这里的「architecture」指的是随权重一起放出的网络定义代码，具体数值要到文末的 GitHub 仓库里看，本页读不出来。

> **核对：** 页内链接指向的是 Grok 聊天产品的介绍页，这次放出的 checkpoint 和跑在产品上的模型是同一个东西吗？
> 不是同一个。第 1 段说这次放出的是「raw base model checkpoint ... not fine-tuned for any specific application, such as dialogue」，链接指向的却是 2023 年 11 月那篇介绍 Grok 对话产品的新闻（[xAI 新闻页](../xai/xai-bi.md) 记为 Nov 3, 2023）。产品上会对话的 Grok-1 经过了对齐和微调，本页明确说这次的权重没做这一步，两者不是同一份权重。推论：拿 grok.com 上 Grok 的表现去验证这个 checkpoint，前提不成立；2023 年 11 月产品公告里的分数测的是产品形态还是这个 base checkpoint，页内没有交代，引用时要分开算。

This is the raw base model checkpoint from the Grok-1 pre-training phase, which concluded in October 2023. This means that the model is not fine-tuned for any specific application, such as dialogue.

这是 Grok-1 预训练阶段得到的原始基座模型 checkpoint，该阶段于 2023 年 10 月结束。也就是说，这个模型没有针对任何具体应用（例如对话）做过微调。

> **看表：** 预训练 2023 年 10 月结束，发布日期是 2024 年 3 月 17 日，中间差了多久？
> 大约 5 个月。本页没有解释这段时间做了什么，也没说 checkpoint 之后是否继续训练过。另外本页只给了结束月份，没给起始时间，所以训练用了多长时间，花了多少算力，都算不出来。

> **停一下：** 全篇没有一个评测数字，「314B MoE trained from scratch」的成色靠什么核验？
> 只能靠外链，而外链的门槛不低。本页是权重发布公告，不带任何 benchmark 表；又因为放的是 base checkpoint，不能直接继承产品侧的分数——对照上一条核对，2023 年 11 月产品公告里的成绩测的是带对齐的产品形态，和这个没微调的底座不是一回事。读者唯一的核验路径是把权重跑起来自己评，而按 GitHub 仓库的说明，加载它需要多块 80GB 显存的 GPU（H100 量级）才装得下，这个门槛本身就筛掉了绝大多数想复核的人，「开源可验证」的实际可验证面比字面窄得多。评测口径上还有一个坑：base model 不做指令跟随，直接拿聊天类榜单测会系统性偏低，评它得用 few-shot 续写式口径，本页对此没有任何提示。

We are releasing the weights and the architecture under the Apache 2.0 license.

我们以 Apache 2.0 许可证发布权重和架构。

To get started with using the model, follow the instructions at [github.com/xai-org/grok](https://github.com/xai-org/grok).

要开始使用这个模型，请按照 [github.com/xai-org/grok](https://github.com/xai-org/grok) 上的说明操作。

## Model Details（模型细节）

Base model trained on a large amount of text data, not fine-tuned for any particular task.

基座模型，在大量文本数据上训练，没有针对任何特定任务做微调。

> **拆开：**「a large amount of text data」是多少 token?
> 本页没有数字。训练数据的 token 数，语种比例，数据来源，截止时间都没写。「large amount」只是形容词，不能拿去和其它模型的训练 token 数比。

314B parameter Mixture-of-Experts model with 25% of the weights active on a given token.

314B 参数的 MoE 模型，对任一给定 token，有 25% 的权重处于激活状态。

> **确认：** 314B 和 25% 各落在哪一列？激活参数的绝对值印在哪里？
> 314B 是总参数这一列，前文「314 billion parameter」是同一个数的两种写法。25% 是按 token 计的激活比例这一列。本页没有印出激活参数的绝对值，按 314B × 25% 算约 78.5B，这是换算结果，不是页面原文。还有一处说不清：前半句用「parameter」，后半句用「weights」，本页没说 25% 的分母是否把 embedding 和注意力这类所有 token 共用的部分也算了进去，所以 **78.5B 只能当估算**。

> **对一下：** 314B 总量配 25% 激活，这个稀疏度在同代 MoE 里算什么水平？
> 按 25% 激活换算，每 token 实际走的参数约 78.5B，总量与激活之比约 4:1。对比同代开放权重的 Mixtral 8x7B（约 47B 总量，约 13B 激活，约 3.5:1）和 Mixtral 8x22B（约 141B / 39B），Grok-1 的取舍明显在「更大的总量换更高的单 token 算力」这一侧：激活参数已接近一个稠密 70B 档模型，单步推理的 FLOPs 并不省，MoE 在这里省的是显存和训练成本，把模型容量与单步算力解耦。一个本页对不上的细节：按社区对开源仓库的解剖，Grok-1 实为每层 8 个 expert 选 2 个，加上常驻的 attention 与 embedding 后总激活约 86B，与 314 × 25% = 78.5B 并不相等，印证前一条确认里「25% 的分母说不清」的怀疑。为什么取 8 个 expert 而非 Switch 式的上百个小 expert，25% 激活率背后的负载均衡与路由 collapse 风险怎么权衡，本页都没提。

<!-- page 2 of 3 -->

Trained from scratch by xAI using a custom training stack on top of JAX and Rust in [October 2023.](https://x.ai/)

由 xAI 在 JAX 和 Rust 之上搭建的自研训练栈从零训练，时间是 [2023 年 10 月。](https://x.ai/)

> **回看：** 这里写「trained ... in October 2023」，第 1 页写的是预训练「concluded in October 2023」，训练到底是 10 月做的，还是 10 月结束的？
> 两句的口径不一样。第 1 页明说预训练阶段在 10 月**结束**；这句读起来像整个训练发生在 10 月一个月里。按第 1 页的读法更稳妥：**10 月是终点**，起始时间本页没有，训练总时长和算力都推不出来。只凭本页，这句话不能被当成「一个月训出 314B」的证据引用。

> **想：**「custom training stack on top of JAX and Rust」，JAX 和 Rust 在这个栈里各干什么？
> 本页没拆。按这两个技术的典型分工推断（只是推断，本页无依据）：JAX 负责模型计算本身——张量运算，自动微分，分布式设备调度；Rust 负责外围基础设施——数据加载管线，checkpoint 读写，节点间通信这类既要内存安全又要性能的部件；两者合起来替代 Megatron 之类的现成训练框架。为什么不用现成的，自研栈在 314B MoE 这种规模上解决了什么具体痛点（expert 并行的通信开销？大规模故障容错？），本页一句没提。验证路径：第 1 页文末指向的 GitHub 仓库能看到放出代码的形态——官方说明仓库提供的是 **JAX** 加载与运行示例，**Rust** 部分以分词组件的形式出现，训练侧代码并未放出，栈的分工只能从推理侧代码反推，无法验证训练时的真实架构。

![Image block](images/p02-2026-spacexai-llc.png)

© 2026 SpaceXAI LLC

© 2026 SpaceXAI LLC 版权所有

Products

产品

Solutions

解决方案

[Chat](https://x.ai/grok)

[聊天](https://x.ai/grok)

[Business](https://x.ai/grok/business)

[商业版](https://x.ai/grok/business)

[Build](https://x.ai/build)

[Build](https://x.ai/build)

[Imagine](https://x.ai/api/imagine)

[Imagine](https://x.ai/api/imagine)

[Government](https://x.ai/grok/government)

[政府](https://x.ai/grok/government)

[Customer Support](https://x.ai/solutions/customer-support)

[客服](https://x.ai/solutions/customer-support)

[Voice](https://x.ai/voice)

[语音](https://x.ai/voice)

[Legal](https://x.ai/solutions/legal)

[法律](https://x.ai/solutions/legal)

[Bot](https://x.ai/bot)

[Bot](https://x.ai/bot)

[Grokipedia](https://grokipedia.com/)

[Grokipedia](https://grokipedia.com/)

[Security](https://x.ai/solutions/security)

[安全](https://x.ai/solutions/security)

[Use Cases](https://x.ai/grok/use-cases)

[使用案例](https://x.ai/grok/use-cases)

Download

下载

Grok Bot

Grok Bot

[grok.com](https://grok.com/?referrer=website)

[grok.com](https://grok.com/?referrer=website)

[Overview](https://x.ai/bot)

[概览](https://x.ai/bot)

[iOS](https://apps.apple.com/app/apple-store/id6670324846)

[iOS](https://apps.apple.com/app/apple-store/id6670324846)

[Marketplace](https://x.ai/bot/marketplace)

[市场](https://x.ai/bot/marketplace)

[Android](https://play.google.com/store/apps/details?id=ai.x.grok)

[Android](https://play.google.com/store/apps/details?id=ai.x.grok)

[Guides](https://x.ai/bot/guides)

[指南](https://x.ai/bot/guides)

[Grok on X](https://x.com/i/grok)

[X 上的 Grok](https://x.com/i/grok)

[Use Cases](https://x.ai/bot/use-cases)

[使用案例](https://x.ai/bot/use-cases)

Developers

开发者

Company

公司

[API Overview](https://x.ai/api)

[API 概览](https://x.ai/api)

[About](https://x.ai/company)

[关于](https://x.ai/company)

[Pricing](https://x.ai/pricing)

[定价](https://x.ai/pricing)

[Colossus](https://x.ai/colossus)

[Colossus](https://x.ai/colossus)

[Models](https://docs.x.ai/developers/models)

[模型](https://docs.x.ai/developers/models)

[Careers](https://x.ai/careers)

[招聘](https://x.ai/careers)

[Console](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console)

[控制台](https://console.x.ai/?utm_source=website&utm_medium=referral&utm_campaign=site-footer&utm_content=developers-console)

[News](https://x.ai/news)

[新闻](https://x.ai/news)

[Changelog](https://x.ai/api/changelog)

[更新日志](https://x.ai/api/changelog)

[Contact](https://x.ai/contact)

[联系我们](https://x.ai/contact)

[Docs](https://docs.x.ai/)

[文档](https://docs.x.ai/)

[Status](https://status.x.ai/)

[服务状态](https://status.x.ai/)

Trust

信任

[Safety](https://x.ai/safety)

[安全性](https://x.ai/safety)

Enterprise

企业

[Security](https://x.ai/security)

[安全](https://x.ai/security)

[Contact Sales](https://x.ai/contact-sales)

[联系销售](https://x.ai/contact-sales)

[Privacy Portal](https://x.ai/privacy-portal)

[隐私门户](https://x.ai/privacy-portal)

<!-- page 3 of 3 -->

![Image block](images/p03-faqs-https-x-ai-legal-faq-enterprise.png)

[FAQs](https://x.ai/legal/faq-enterprise)

[常见问题](https://x.ai/legal/faq-enterprise)

[Subprocessors](https://x.ai/legal/subprocessor-list)

[分处理方](https://x.ai/legal/subprocessor-list)

BAA

BAA（商业伙伴协议）

[Help Center](https://docs.x.ai/grok/user-guide)

[帮助中心](https://docs.x.ai/grok/user-guide)

[DPA](https://x.ai/legal/data-processing-addendum)

[DPA（数据处理附录）](https://x.ai/legal/data-processing-addendum)

[Legal](https://x.ai/legal)

[法律](https://x.ai/legal)

[Terms](https://x.ai/legal/terms-of-service)

[服务条款](https://x.ai/legal/terms-of-service)

[Enterprise Terms](https://x.ai/legal/terms-of-service-enterprise)

[企业条款](https://x.ai/legal/terms-of-service-enterprise)

[Privacy](https://x.ai/legal/privacy-policy)

[隐私政策](https://x.ai/legal/privacy-policy)

[Cookies](https://x.ai/legal/cookie-policy)

[Cookie 政策](https://x.ai/legal/cookie-policy)

[AUP](https://x.ai/legal/acceptable-use-policy)

[AUP（可接受使用政策）](https://x.ai/legal/acceptable-use-policy)

[Brand](https://x.ai/legal/brand-guidelines)

[品牌规范](https://x.ai/legal/brand-guidelines)

Privacy choices

隐私选项

Social

社交

[@SpaceXAI](https://x.com/spacexai)

[@SpaceXAI](https://x.com/spacexai)

[@grok](https://x.com/grok)

[@grok](https://x.com/grok)

[Discord](https://discord.com/invite/kqCc86jM55)

[Discord](https://discord.com/invite/kqCc86jM55)

[Built with Grok](https://grok.com/?referrer=website)

[用 Grok 构建](https://grok.com/?referrer=website)
