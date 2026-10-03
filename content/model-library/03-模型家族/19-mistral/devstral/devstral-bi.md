---
title: "Devstral · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Devstral 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
这是 Mistral AI 官网的 Devstral 发布页, 共 7 页, 3 张图. 正文在第 1 到第 4 页和第 5 页开头一句, 第 5 到第 7 页是站点页脚. 转出的 Markdown 丢了两处正文: 第 3 页开头只剩 「8% on E-Be」 几个残字, 第 4 页开头一句只剩 「Fin」, 「g」, 「t,」 这样的碎片, 下面的英文按 PDF 文本层补全. 第 3 页正文提到 「In the table below」, 但抓下来的页面在那段文字下面只有一块空白, PDF 里也没有嵌入这张表, 表里的数一个都读不到. 散点图上各点没有印数值.

<!-- page 1 of 7 -->

# Devstral

The page header reads **RESEARCH**, followed by the title "Devstral", the date **May 21, 2025** and the byline "By Mistral AI". A "Get in touch" link sits in the site header.

页头印着 **RESEARCH**, 下面是标题 「Devstral」, 日期 **May 21, 2025**, 署名 「By Mistral AI」. 站点顶栏上有一个 「Get in touch」 链接.

A hero image sits below the byline: a blue background on the left, a light-blue strip with red, orange and green squares at the top right, and in the middle a small terminal-window icon showing ">M", with a large pixel-art ">" on a dark panel to its right.

署名下面是一张题图: 左边是蓝色底, 右上角一条浅蓝色带子上排着红, 橙, 绿三个方块, 中间是一个印着 「>M」 的终端窗口小图标, 右边深色面板上是放大的像素 「>」 符号.

![题图, 蓝色底上的终端窗口小图标, 印着 >M, 右侧是放大的像素提示符](images/p01-today-we-introduce-devstral-our-agentic-llm-for.png)

Today we introduce Devstral, our agentic LLM for software engineering tasks. Devstral is built under a collaboration between Mistral AI and All Hands AI 🙌, and outperforms all open-source models on SWE-Bench Verified by a large margin. We release Devstral under the Apache 2.0 license.

今天我们发布 Devstral, 这是我们面向软件工程任务的 agentic LLM. Devstral 由 Mistral AI 和 All Hands AI 合作打造, 在 SWE-Bench Verified 上大幅领先所有开源模型. Devstral 以 Apache 2.0 许可发布.

> **想:** 「by a large margin」 到底领先多少?
> 这一句没给数. 第 3 页补了一句 「more than 6% points」, 对的是 「prior open-source SoTA」. 第 2 页散点图上离它最近的开源模型是 Deepseek-V3-0324, 读图约 38.8, 差约 8 个点 (读图).

The rest of page 1 is a cookie notice; only the word "Cookies" survives in the text layer.

第 1 页剩下的是 cookie 提示, 文本层里只留下一个 「Cookies」.

<!-- page 2 of 7 -->

Page 2 opens with a scatter chart. The x-axis is "Model size / billions of parameters" (0 to about 740, ticks every 100), the y-axis runs from 0 to 50 with no title. Devstral is an orange dot with the Mistral logo, inside a pink wedge in the top-left corner; the other models are teal dots. The caption reads "All models benchmarked officially by AllHands using the OpenHands scaffold with no customisation". The site header covers the top of the chart, so the chart title, if any, is not visible. No point carries a printed value.

第 2 页开头是一张散点图. 横轴是 「Model size / billions of parameters」 (0 到大约 740, 每 100 一格), 纵轴 0 到 50, 没有轴标题. Devstral 是一个橙色点, 旁边有 Mistral 标志, 落在左上角一块粉色楔形区域里; 其他模型是青绿色点. 图下说明写着 「All models benchmarked officially by AllHands using the OpenHands scaffold with no customisation」. 站点顶栏盖住了图的顶端, 看不到图标题. 各点都没有印数值.

![SWE-Bench Verified 散点图, 横轴模型参数量, 纵轴分数, Devstral 在左上角, 右侧是三个 Deepseek 模型](images/p02-agentic-llms-for-software-development.png)

The labelled points, read from the chart (estimates):

按图读出的各点位置:

| model | x (billions of parameters) | y |
|---|---|---|
| Devstral | about 23 | about 46.8 |
| Gemma-3 27B | about 27 | about 10.1 |
| Qwen3 235B-A22B | about 236 | about 34.3 |
| Deepseek-V3-0324 | about 671 | about 38.8 |
| Deepseek-R1 | about 671 | about 34.1 |
| Deepseek-V3 | about 671 | about 32.4 |

> **问:** Devstral 有多少参数?
> 全页没有印. 散点图的横轴是参数量, Devstral 那个点在 Gemma-3 27B 左边一点, 读图约 23. 这是唯一能拿到的线索, 精度只到个位附近.

> **核对:** 散点图上的 Qwen3 和正文里的是同一个吗?
> 图上标的是 「Qwen3 235B-A22B」, 第 3 页正文写 「Qwen3 232B-A22B」. 点的横坐标读图约 236, 和 235 对得上, 正文的 232 应是笔误, 页面自己没有更正.

# Agentic LLMs for software development

While typical LLMs are excellent at atomic coding tasks such as writing standalone functions or code completion, they currently struggle to solve real-world software engineering problems. Real-world development requires contextualising code within a large codebase, identifying relationships between disparate components, and identifying subtle bugs in intricate functions.

一般的 LLM 很擅长原子级的编码任务, 比如写一个独立函数, 或者补全代码, 但面对真实世界的软件工程问题, 眼下还很吃力. 真实开发要把代码放进一个大代码库的语境里理解, 要找出分散组件之间的关系, 还要在复杂函数里揪出细小的 bug.

Devstral is designed to tackle this problem. Devstral is trained to solve real GitHub issues; it runs over code agent scaffolds such as OpenHands or SWE-Agent, which define the interface between the model and the test cases. Here, we show Devstral's performance on the popular SWE-Bench Verified benchmark, a dataset of 500 real-world GitHub issues which have been manually screened for correctness.

Devstral 就是冲这个问题来的. 它被训练来解决真实的 GitHub issue; 它跑在 OpenHands 或 SWE-Agent 这类代码 agent 脚手架上, 由脚手架规定模型和测试用例之间的接口. 这里我们展示 Devstral 在常用基准 SWE-Bench Verified 上的表现. 这个数据集收了 500 个真实 GitHub issue, 每个都经过人工筛查, 确认题目本身没问题.

> **看表:** 散点图里的对手全是开源的吗?
> 图上五个对手 Gemma-3 27B, Qwen3 235B-A22B, Deepseek-V3-0324, Deepseek-R1, Deepseek-V3 都是开放权重模型, 没有一个闭源模型. 图注说全部由 AllHands 用 OpenHands 脚手架官方跑分, 「no customisation」. 所以这张图对应的是第 3 页第一段 「same test scaffold」 的比较, 不是第二段 「any scaffold」 的那张表.

<!-- page 3 of 7 -->

Devstral achieves a score of 46.8% on SWE-Bench Verified, outperforming prior open-source SoTA models by more than 6% points. When evaluated under the same test scaffold (OpenHands, provided by All Hands AI 🙌), Devstral exceeds far larger models such as Deepseek-V3-0324 (671B) and Qwen3 232B-A22B.

Devstral 在 SWE-Bench Verified 上拿到 46.8%, 比此前开源 SoTA 模型高出 6 个百分点以上. 在同一套测试脚手架 (OpenHands, 由 All Hands AI 提供) 下, Devstral 超过了大得多的 Deepseek-V3-0324 (671B) 和 Qwen3 232B-A22B.

> **拆开:** 46.8% 落到 500 道题上是多少道?
> 约 234 道. Deepseek-V3-0324 读图约 38.8%, 约 194 道, 两者差约 40 道 (后者读图). 页面没有说跑了几次, 也没有给误差范围.

> **确认:** 「prior open-source SoTA」 是哪个模型, 多少分?
> 没点名, 也没给分数. 如果按散点图, 开源最高是 Deepseek-V3-0324, 约 38.8 (读图), 差约 8 个点, 满足 「more than 6」. 但正文这句没有限定脚手架, 此前的开源 SoTA 可能是在别的脚手架上跑出来的; 「超 6 个点」 只能推出它低于 40.8%, 推不出具体是谁.

In the table below, we also compare Devstral to closed and open models evaluated under any scaffold (including ones custom for the model). Here, we find that Devstral achieves substantially better performance than a number of closed-source alternatives. For example, Devstral surpasses the recent GPT-4.1-mini by over 20%.

在下面的表里, 我们还把 Devstral 和在任意脚手架 (包括为模型定制的脚手架) 下评测的闭源, 开源模型做了比较. 结果是 Devstral 明显好过不少闭源方案. 例如, Devstral 比新近发布的 GPT-4.1-mini 高出 20% 以上.

> **回看:** 「the table below」 在哪?
> 抓下来的页面在这段下面只有一块空白, PDF 这一页没有任何嵌入图片, 表没抓到. 「a number of closed-source alternatives」 是哪几家, GPT-4.1-mini 多少分, 都读不到. 「over 20%」 是百分点还是相对值也没写: 按百分点算 GPT-4.1-mini 低于 26.8%, 按相对值算低于约 39.0%.

## Versatile: local deployment ↔️ enterprise use ↔️ copilots

## 多用途: 本地部署, 企业使用, 编程助手

Devstral is light enough to run on a single RTX 4090 or a Mac with 32GB RAM, making it an ideal choice for local deployment and on-device use. Coding platforms such as OpenHands can allow the model to interact with local codebases and provide fast resolution to issues. To try it yourself, view the documentation or tutorial video.

Devstral 足够轻, 一张 RTX 4090 或一台 32GB 内存的 Mac 就能跑, 很适合本地部署和端侧使用. OpenHands 这类编程平台能让模型直接操作本地代码库, 快速解决 issue. 想自己试, 可以看文档或教程视频.

> **停一下:** 一张 RTX 4090 或 32GB 的 Mac 能跑, 是什么精度?
> 没写. 页面没给参数量, 没给量化方式, 没给上下文长度, 也没给跑起来的速度. 「light enough」 只能当部署门槛的定性说法, 没法反推模型大小.

The performance of the model also makes it a suitable choice for agentic coding on privacy-sensitive repositories in enterprises, especially ones subject to stringent security and compliance requirements.

凭这个性能, 它也适合在企业里对隐私敏感的代码库上做 agentic coding, 尤其是安全和合规要求严格的那些.

<!-- page 4 of 7 -->

Finally, if you're building or using an agentic coding IDE, plugin, or environment, Devstral is a great choice to add to your model selector.

最后, 如果你在做或在用 agentic coding 的 IDE, 插件或环境, 可以把 Devstral 加进模型选择列表.

## Availability

## 获取方式

We release this model for free under an Apache 2.0 license for the community to build on, customize, and accelerate autonomous software development. To try it for yourself, head over to our model card.

我们以 Apache 2.0 许可免费发布这个模型, 供社区在上面开发, 定制, 加快自主软件开发. 想自己试, 去看我们的 model card.

The model is also available on our API under the name devstral-small-2505 at the same price as Mistral Small 3.1: $0.1/M input tokens and $0.3/M output tokens.

这个模型也上了我们的 API, 名字是 devstral-small-2505, 价格和 Mistral Small 3.1 一样: 输入每百万 token $0.1, 输出每百万 token $0.3.

> **再看:** 两个单价合成一个数大概多少?
> 输出是输入的 3 倍. 假设输入输出 token 按 3:1 混合, 约 $0.15 每百万 token; 3:1 是我假设的比例, 页面没有. 页面也没印任何对手的价格.

> **对一下:** API 名字里的 「small」 和 「2505」 各对应什么?
> 「2505」 和发布日期 May 21, 2025 的年月对得上 (按年两位加月两位读, 页面没解释命名规则). 「small」 页面也没解释, 正文从头到尾只叫它 「Devstral」, model card 链接指向 Devstral-Small-2505. 结合 「What's next」 里预告的 「larger agentic coding model」, 可以读成尺寸档位, 但页面没给这一档的参数.

Should you choose to self-deploy, you can download the model on HuggingFace, Ollama, Kaggle, Unsloth, LM Studio starting today.

如果选择自部署, 今天起可以在 HuggingFace, Ollama, Kaggle, Unsloth, LM Studio 下载模型.

For enterprise deployments that require fine-tuning on private codebases, or higher-fidelity customization such as continued pre-training or distilling Devstral's capabilities into other models, please contact us to connect with our applied AI team.

企业部署如果要在私有代码库上微调, 或者做更深的定制, 比如继续预训练, 或者把 Devstral 的能力蒸馏到别的模型里, 请联系我们, 对接 applied AI 团队.

## What's next

## 下一步

Devstral is a research preview and we welcome feedback! We're hard at work building a larger agentic coding model that will be available in the coming weeks.

Devstral 是研究预览版, 欢迎反馈! 我们正在全力做一个更大的 agentic coding 模型, 未来几周就会推出.

> **想:** 「research preview」 和前面 「ideal choice for ... enterprises」 放在一起说得通吗?
> 页面两头都写了: 第 3, 4 页推荐企业和 IDE 用, 结尾又说是研究预览. 预览意味着什么限制 (稳定性, 支持期, 后续是否替换), 页面没说. 预告的更大模型也没有名字, 没有参数, 没有日期.

Interested in discussing how we can help your team put Devstral to use, and about our portfolio of models, products and solutions? Contact us and we'll be happy to help.

想聊聊我们能怎样帮你的团队用上 Devstral, 或者了解我们的模型, 产品和解决方案? 联系我们, 我们很乐意帮忙.

The last words, "happy to help.", are printed at the top of page 5.

最后几个词 「happy to help.」 印在第 5 页开头.

<!-- page 5 of 7 -->

Page 5 is the site footer navigation. It lists Products (Vibe, Vibe Code, Studio, Forge, Compute, Pricing), Solutions (Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities) and Why Mistral (About us, Careers, Partners, Our customers, Our models).

第 5 页是站点页脚导航. 里面列了 Products (Vibe, Vibe Code, Studio, Forge, Compute, Pricing), Solutions (Delivery methodology, Model customization, Coding, Document intelligence, Speech, 以及金融, 公共机构, 制造, 能源与公用事业四个行业方案) 和 Why Mistral (About us, Careers, Partners, Our customers, Our models).

<!-- page 6 of 7 -->

Page 6 continues the footer: Brand, then Company (Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice), social icons, a "Get Mistral Vibe" block with App Store and Google Play badges, the line "Mistral AI © 2026", a theme switch and a language switch set to English. A pixel cat sits on the orange-red band at the bottom.

第 6 页接着是页脚: Brand, 然后是 Company (Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice), 一排社交图标, 一个带 App Store 和 Google Play 徽标的 「Get Mistral Vibe」 区块, 一行 「Mistral AI © 2026」, 主题切换和设成 English 的语言切换. 底部橙红色带子上蹲着一只像素猫.

![站点页脚截图, 含 Company 链接, 社交图标, Get Mistral Vibe 下载徽标和 Mistral AI © 2026, 不含模型信息](images/p06-h.png)

> **问:** 页脚里的 Vibe, Forge 这些产品和 Devstral 同期吗?
> 不能这么读. 页脚是抓页时的站点外壳, 印着 「Mistral AI © 2026」, 正文日期是 May 21, 2025. 这些产品名不是这篇公告的内容.

<!-- page 7 of 7 -->

Page 7 holds only the site header with the "Get in touch" link.

第 7 页只有带 「Get in touch」 链接的站点顶栏.
