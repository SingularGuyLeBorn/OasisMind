---
title: "Kimi-K2-0905 · 对照译稿"
category: "模型库"
tags: ["Kimi", "对照译稿"]
published: true
excerpt: "Kimi-K2-0905 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 3 -->

![Image block](images/p01-kimi-k2-api.png)

# Kimi K2 model update: stronger coding, faster API # Kimi K2 模型更新, 带来更强的代码能力, 更快的 API

Published on September 5, 2025 • 3 min read



发表于 2025年09月05日 • 3 min read

[product](https://platform. kimi. com/blog/tags/product) [announcement](https://platform. kimi. com/blog/tags/announcement)



[product](https://platform. kimi. com/blog/tags/product) [announcement](https://platform. kimi. com/blog/tags/announcement)

Kimi-K2-0905 model is now available



Kimi-K2-0905模型上新

Coding capability upgraded again | context window 256k | up to 60-100 Token/s | Claude Code supported



Coding能力再升级|上下文窗口 256k |最高 60-100 Token/s| 支持 Claude Code

Today we release the latest Kimi K2 version, 0905, further improving performance on real-world programming tasks:



今天, 我们发布 Kimi K2 模型的最新版本 0905, 进一步提升其在真实编程任务中的表现:

**Stronger Agentic Coding**: better results on public benchmarks and on real programming tasks



**Agentic Coding 能力提升**: 在公开基准测试和真实的编程任务中均展现出更好的性能

**Better frontend coding experience**: higher visual quality and practicality of frontend code



**前端编程体验升级**: 提升了前端代码的美观度和实用性

**Longer context**: upgraded from 128K to 256K for more complex, long-horizon work



**扩展上下文长度**: 从 128K 升级到 256K, 为复杂长线任务提供更好的支持

**High-speed API**: output speed up to 60-100 Token/s



**提供高速版 API**: 支持高达 60-100 Token/s 的输出速度

On benchmarks that emphasize real software-engineering work, such as SWE-bench Verified, the new Kimi K2 results are as follows:



在侧重考察真实软件工程任务的 SWE-bench Verified 等基准测试中, 新版 Kimi K2模型的表现如下:

<!-- page 2 of 3 -->

![Chart block](images/p02-kimi-k2-0905-kimi-https-kimi-moonshot-cn-download-app.png)

The K2 model in the Kimi app and on the web has been fully upgraded to the latest 0905 build. [Download the Kimi app](https://kimi. moonshot. cn/download/app? from=wechat_official_account_menu) or visit [kimi. com](https://www. kimi. com/) to try the new model.



Kimi 应用和网页版中的 K2 模型已全量升级到 0905 最新版, [下载 Kimi 应用](https://kimi. moonshot. cn/download/app? from=wechat_official_account_menu) 或访问[kimi. com](https://www. kimi. com/) 即可体验新版模型.

The Kimi open platform at [pplatform. moonshot. cn](https://platform. moonshot. cn/) now lists the `kimi-k2-0905-preview` model API:



Kimi 开放平台 [pplatform. moonshot. cn](https://platform. moonshot. cn/) 已上架 kimi-k2-0905-preview 模型 API:

Context upgraded to 256K



上下文升级到 256K

Token Enforcer keeps tool-call format **100% correct**



Token Enforcer 保证 toolcall **100% 格式正确**

Fully compatible with the Anthropic API, with WebSearch Tool support, for a better K2 + Claude Code experience



完全兼容 Anthropic API, 并支持 WebSearch Tool, 提供更好的 K2 + Claude Code 使用体验

Full-automatic Context Caching to help save Input Tokens



支持全自动 Context Caching, 有助于节省 Input Token

Pricing is the same as the previous 0711 release



定价与之前的 0711 版相同

The high-speed API (up to 60-100 Token/s), `kimi-k2-turbo-preview`, has been upgraded to the new model in lockstep



速度达 60-100 Token/s 的高速版 API(kimi-k2-turbo-preview)已同步升级新模型

To self-host, download from [Hugging Face](https://huggingface. co/moonshotai), [ModelScope](https://www. modelscope. cn/organization/moonshotai), and similar platforms.



如需自行部署模型, 可在 [Hugging Face](https://huggingface. co/moonshotai), [ModelScope](https://www. modelscope. cn/organization/moonshotai) 等平台下载.

Kimi K2 first shipped on July 11 as an open-source MoE base model with 1 trillion total parameters and 32 billion activated. Coding tools such as Cursor, Windsurf, Trae, Cline, RooCode, and Kilo Code already embed or connect to Kimi K2. Cloud providers in China and abroad also host it, giving developers more choices.



Kimi K2 模型最初发布于 7 月 11 日, 它是一款 MoE 架构(MoE)的开源基础模型, 总参数 10000 亿, 激活参数 320 亿. 目前, AI 编程工具 Cursor, Windsurf, Trae, Cline, RooCode, Kilo Code 等已内置或接入了 Kimi K2 模型. 国内外云服务厂商均部署了 Kimi K2 模型, 为开发者提供更多选择.

(「0905」是源文给出的版本号;「0711」指同系列此前定价对照的上一代 API 版本. 源文正文未写出 SWE-bench Verified 的具体分数, 分数只出现在 p2 配图中, 以图为准.)

## Kimi K2 resource folder ## Kimi K2 资料夹

<!-- page 3 of 3 -->

Technical blog: [https://moonshotai. github. io/Kimi-K2/](https://moonshotai. github. io/Kimi-K2/)



技术博客: [https://moonshotai. github. io/Kimi-K2/](https://moonshotai. github. io/Kimi-K2/)

Technical report: [https://arxiv. org/abs/2507.20534](https://arxiv. org/abs/2507.20534)



技术报告: [https://arxiv. org/abs/2507.20534](https://arxiv. org/abs/2507.20534)

Github: [https://github. com/moonshotai/kimi-K2](https://github. com/moonshotai/kimi-K2)



Github: [https://github. com/moonshotai/kimi-K2](https://github. com/moonshotai/kimi-K2)

Zhihu discussion: [https://www. zhihu. com/question/1927140506573435010](https://www. zhihu. com/question/1927140506573435010)



知乎讨论: [https://www. zhihu. com/question/1927140506573435010](https://www. zhihu. com/question/1927140506573435010)

These four links are the source’s own resource shelf for the K2 line: blog, arXiv report, GitHub, and a Zhihu thread. This bilingual page only mirrors that shelf; it does not expand the linked documents.



以上四条链接是源文为 K2 系列自列的资料入口: 技术博客, arXiv 技术报告, GitHub 与知乎讨论. 对照译稿只复述这份清单, 不展开链接正文.

2026 © Moonshot AI



2026 © Moonshot AI

[Docs](https://platform. moonshot. cn/docs) [User center](https://platform. moonshot. cn/console)



[文档](https://platform. moonshot. cn/docs) [用户中心](https://platform. moonshot. cn/console)
