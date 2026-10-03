---
title: "Gemini 3.5 Flash 模型卡：分析"
category: "模型库"
tags: ["Gemini", "技术解析"]
published: true
excerpt: "这张卡的自有信息很少。真正属于 3.5 Flash 自己的内容只有四块：概述里的一句定位和思考档位，输入输出的两个上限（1M 上下文，64K 输出），第 2 到 3 页的成绩表，第 4 页的安全评测增减表和红队结论。"
---
源文是 deepmind.google 上 Gemini 3.5 Flash 模型卡的网页抓取，6 页，6 张图，发布日期 2026 年 5 月 19 日，页上附 PDF 版链接 Gemini-3-5-Flash-Model-Card.pdf。卡上没有结构，参数规模和训练数据的描述，这几项都转给了 Gemini 3 Flash 的卡。下文只按页面上的字，表格和链接写，不从外部补，也不和 3.6 Flash，2.5 Flash 的材料混用。

# Gemini 3.5 Flash 模型卡：分析

## 1. 一张以转述为主的卡

这张卡的自有信息很少。真正属于 3.5 Flash 自己的内容只有四块：概述里的一句定位和思考档位，输入输出的两个上限（1M 上下文，64K 输出），第 2 到 3 页的成绩表，第 4 页的安全评测增减表和红队结论。其余小节几乎都是一句 「见某某模型卡」。

数一下转述的次数。架构，训练数据集，训练数据处理，硬件，软件，已知局限，可接受用途，安全评测方法，安全政策，一共 9 节指向 Gemini 3 Flash 的卡；前沿安全评估和风险与缓解 2 节指向 Gemini 3.1 Pro 的卡。概述说 3.5 Flash 是 Gemini 3 系列的 「next iteration」，以 3 Flash 的推理底座为基础，但比 3 Flash 多做了什么，这张卡没有一句交代。读者能确认的只是结果变了，至于为什么变，要去别处找，而那些 「别处」 讲的是 3 Flash 或 3.1 Pro，也不是 3.5 Flash。

## 2. 上下文，输出和思考档位

输入可以是文本，图像，音频和视频文件，上下文窗口最多 1M token；输出只有文本，上限 64K token。这是卡上仅有的两个容量数字。卡上没有给 3 Flash 或 3.1 Pro 的上下文长度，成绩表里也没有上下文长度这一行，所以 1M 和 64K 在这张卡里找不到参照物，只能单独记下。

概述里的 「thinking levels」 是另一个值得停下来的点。它让使用者按档位决定推理时多花多少算力，用来调质量，成本和延迟的配比，属于 TestingTime 的做法。问题是卡上没写有几档，叫什么，默认是哪档，成绩表每一行也没注明用了哪一档。同一个模型在高档和低档之间的分数可能差不少，不知道档位，就不知道表里的 3.5 Flash 分数是用多大的推理开销换来的，和其他列比较时也少了一个前提。

## 3. 价格和对照对象：卡上都缺

整张卡没有价格。分发一节列了 7 个渠道（Gemini 应用，Gemini 企业版应用，Gemini 企业版智能体平台，Google AI Studio，Gemini API，Google 搜索 AI 模式，Google Antigravity）和两份服务条款，还说使用本模型不需要特定硬件或软件，但没有一行写每百万 token 的输入价或输出价。成绩表同样没有价格行。想比较性价比，这张卡给不了数据。

对照对象也有缺口。成绩表的六列是 Gemini 3.5 Flash, Gemini 3 Flash, Gemini 3.1 Pro, Claude Sonnet 4.6, Claude Opus 4.7, GPT-5.5。其中没有 Gemini 3 Pro，也没有 2.5 Pro 或 2.5 Flash。所以 「3.5 Flash 和 3 Pro 比怎样」 或 「比 2.5 强多少」，在这张卡里一行都答不了。离 Pro 最近的参照是 3.1 Pro，离上一代最近的参照是 3 Flash，下面的比较只在这两列上做。

## 4. 成绩表：14 行，6 行第一

成绩表跨两页，第 2 页 3 行（Terminal-bench 2.1, SWE-Bench Pro, MCP Atlas），第 3 页 11 行（Toolathlon, OSWorld-Verified, Finance Agent v2，GDPval-AA，CharXiv Reasoning，MMMU-Pro，Blueprint-Bench 2，MRCR v2 的 128k 和 1M 两行，Humanity's Last Exam, ARC-AGI-2），共 14 行分数。按六列排，3.5 Flash 拿了 6 行第一，3 行第二，1 行第三，4 行第四。

第一的 6 行是 MCP Atlas 83.6%, Toolathlon 56.5%, Finance Agent v2 57.9%, CharXiv 84.2%, MMMU-Pro 83.6%, MRCR v2 1M 26.6%。领先幅度差别很大：Finance Agent v2 比第二名 GPT-5.5 高 6.1 点，MCP Atlas 比 Claude Opus 4.7 高 4.5 点，MMMU-Pro 高 2.4 点；而 CharXiv 只领先 GPT-5.5 0.1 点，MRCR 1M 领先 3.1 Pro 0.3 点，Toolathlon 领先 GPT-5.5 0.9 点。其中 Toolathlon 和 MRCR 1M 只有三家有分，「第一」 是三选一。

没拿第一的 8 行里，有的差得很少，有的差得不小。OSWorld-Verified 只比 GPT-5.5 低 0.3 点，Terminal-bench 2.1 低 2.0 点，Blueprint-Bench 2 低 2.6 点，可以算接近。SWE-Bench Pro 比 Claude Opus 4.7 低 9.2 点，HLE 低 6.7 点，ARC-AGI-2 比 GPT-5.5 低 12.5 点，MRCR v2 128k 低 17.5 点，GDPval-AA 是 1656 对 1769 Elo。大致的轮廓是：智能体工具调用，金融任务和多模态理解领先，长上下文检索，抽象推理和难度更高的软件工程（SWE-Bench Pro）落后。

## 5. 和 3 Flash，3.1 Pro 的差值

和上一代 3 Flash 比，14 行全部上升。涨得最多的是 ARC-AGI-2，从 33.6% 到 72.1%，多 38.5 点；Blueprint-Bench 2 从 0.0% 到 33.6%；MCP Atlas 从 62.0% 到 83.6%，多 21.6 点；Terminal-bench 2.1 多 18.2 点，Finance Agent v2 多 15.3 点，OSWorld-Verified 多 13.3 点。涨得少的是 MMMU-Pro（多 2.4 点），CharXiv（多 3.9 点），MRCR 1M（多 4.5 点）。GDPval-AA 从 1204 到 1656，多 452 Elo。

和 3.1 Pro 比，两者都有分的是 13 行（3.1 Pro 缺 Toolathlon）。3.5 Flash 赢 10 行，输 3 行。赢得多的是 Finance Agent v2（多 14.9 点），Blueprint-Bench 2（多 7.1 点），Terminal-bench 2.1（多 5.9 点），MCP Atlas（多 5.4 点），GDPval-AA（多 342 Elo）；赢得少的是 SWE-Bench Pro 和 CharXiv（各多 0.9 点），MRCR 1M（多 0.3 点）。输的 3 行是 MRCR v2 128k（低 7.6 点），HLE（低 4.2 点），ARC-AGI-2（低 5.0 点），集中在长上下文和推理两类。

这些差值只能当结果读。卡上没说 3.5 Flash 相对 3 Flash 改了什么，也没说表里各模型用的思考档位，对手的分数是谁跑的，是否同一套设置。评测方法链接（deepmind.google/models/evals-methodology/gemini-3-5-flash）可能有答案，但本次抓取没有那一页的内容。

## 6. 表里的口径要一行行看

第二列是口径，大半空着，填了的几行各不相同。Terminal-bench 2.1 注明用 Terminus-2 测试框架，SWE-Bench Pro 是 Public 集，单次尝试；CharXiv 和 MMMU-Pro 注明不用工具；Blueprint-Bench 2 是归一化分数；GDPval-AA 是 Elo；MRCR v2 分 128k 取平均和 1M 逐点两行。空着的行用的是什么设置，卡上不写。

有两行的单位要特别注意。GDPval-AA 的 Elo 是相对分，只在同一批对手里有意义，不能和百分比行一起平均。Blueprint-Bench 2 的归一化分数里，3 Flash 是 0.0%，Claude Sonnet 4.6 是 6.7%，这个 0.0 很可能是落在基线上或以下，并不等于一题没对，但卡上没写归一化的方法。缺格也要看清：Claude Sonnet 4.6 缺 Terminal-bench 2.1，SWE-Bench Pro，Toolathlon，MRCR 1M 四行，Claude Opus 4.7 缺 Toolathlon 和 MRCR 1M，GPT-5.5 缺 MRCR 1M，3.1 Pro 缺 Toolathlon。算名次时这些行的参赛人数不一样。

## 7. 长上下文：能装 1M，1M 下找得准吗

卡上说上下文窗口最多 1M token，表里对应的检验是 MRCR v2 (8-needle)。在 1M 逐点口径下，3.5 Flash 是 26.6%，3.1 Pro 26.3%，3 Flash 22.1%，另外三家没分。3.5 Flash 名义上第一，但只比 3.1 Pro 多 0.3 点，绝对值也只有四分之一出头。

退到 128k，3.5 Flash 是 77.3%，比 3 Flash 的 67.2% 高 10.1 点，却低于 3.1 Pro 和 Claude Sonnet 4.6 的 84.9%，更低于 GPT-5.5 的 94.8%，只比 Claude Opus 4.7 的 59.3% 高。两行一个取平均，一个逐点，算法不同，不能用 77.3% 减 26.6% 说 「从 128k 到 1M 掉了多少」。能说的是：窗口开到 1M 是容量上的承诺，在多针检索上，3.5 Flash 在 128k 这一档并不领先。

## 8. 安全评测：正负方向不一，颜色丢了

第 4 页的安全表是 3.5 Flash 对 3 Flash 的绝对百分点增减：文本到文本安全 -3.9%，多语言安全 -2.6%，图像到文本安全 0%，语气 +8.9%，无理拒答 +0.8% (non-egregious)。正文总结说 3.5 Flash 在安全和语气上都好于 3 Flash，同时把无理拒答保持在低位。安全行的数字是负的，正文却说变好，反推回去，这几行量的应该是违规一类的指标，降才算好；脚注 1 则说语气一行正数表示改进。

问题在于卡上靠颜色标好坏，而且说了两套：正文写改进标蓝，退步标橙；脚注写改进标绿，退步标黄。MinerU 抓取和 PDF 文本层都没保留颜色，读者只能按正负号和文字猜。最难判断的是无理拒答的 +0.8%：说明写的是 「在保持安全的前提下作答的能力」，按字面正数像改进；可括号里的 「non-egregious」 一般用来说明退步不严重，正文又只说 「保持在低位」，回避了方向。另外脚注提到 「instruction following」，表里并没有这一行。卡上还强调这批自动评测改进过，结果不能和以前 Gemini 卡里的数字直接比，人工复查认为退步大多是误报或不严重。

## 9. 红队和前沿安全：结论多半借自 3.1 Pro

人工红队由模型开发团队之外的专家做。儿童安全方面，3.5 Flash 达到了发布门槛；一般内容安全政策上，表现与 3 Flash 相近或更好；红队范围还覆盖了严格政策以外的问题，并和 3.1 Pro 做了对比，没有发现严重问题。这一段没有数字，只有结论。

前沿安全评估的主体是 3.1 Pro。卡上的理由是 3.1 Pro 在发布时 「通用能力最强」，且没有达到前沿安全框架里的任何关键能力等级（CCL）；3.5 Flash 在前沿安全相关能力上相比 3.1 Pro 没有实质提升，所以推定它也不太可能达到 CCL。这里有一处张力：成绩表里 3.5 Flash 在 13 行中赢了 3.1 Pro 10 行，包括卡上自己说它擅长的智能体和编程。「没有实质提升」 限定在前沿安全相关的能力上，具体指哪些评测，卡上没展开。单独给 3.5 Flash 加测的只有一项，网络（cyber）：低于 CCL，卡上没有分数。

## 10. 抓取问题：哪些字是 MinerU 弄出来的

MinerU 的抓取有几处和 PDF 对不上。第 1 页开头的汉字 「三」 是菜单图标，PDF 文本层里没有；第 3 页 PDF 顶上有一句 「For details on our evaluation methodology please see deepmind.google/models/evals-methodology/gemini-3-5-flash」，MinerU 漏了，而第 2 页同一路径的链接写的是 deepmind.com 域名。第 2 页表格被拆成 12 行，其中 「Coding」，「Agentic」 两行是左侧类别标签；第 3 页 「Multimodal」 类别格覆盖三行，MinerU 只放在中间一行。安全表的 「Image to Text Safety」 和 「Unjustified-refusals」 各被拆成两行，脚注编号 「1」 被挪进了句中，变成 「while1」。

6 张图全在第 5 页，都是 30 到 40 像素见方的小图标，没有图表。前三张（p05-image.png, p05-image-2.png, p05-for-more-information-about-the-risks-and-mitigations.png）被排在 「Risks and Mitigations」 标题下，画面分别是像机器人的线条图标，YouTube 标志，Gemini 的四角星，属于页脚；后三张（p05-image-3.png, p05-image-4.png, p05-sign-up-for-updates-on-our-latest-innovations-i-accept.png）在 「Follow us」 后面，是 X, Instagram, GitHub。两个长文件名是按旁边的文字起的，和画面无关。

## 11. 引用这张卡的边界

能从这张卡引用的有：发布日期 2026 年 5 月 19 日；输入模态和 1M token 上下文，64K token 输出；以思考档位调节质量，成本，延迟的说法；14 行成绩连同各自口径和六列对手；5 项安全增减和红队结论；前沿安全由 3.1 Pro 推定，网络一项单独加测且低于 CCL。引分数时最好写明对比的六列，因为名次只在这六列之间成立，有几行只有三家有分。

不能从这张卡引用的有：3.5 Flash 的结构，参数规模，训练数据和它相对 3 Flash 的改动；价格；思考档位的数目和表里用的档位；与 Gemini 3 Pro 或任何 2.5 型号的比较；无理拒答 +0.8% 的方向。第 5 页 「Latest model cards」 里的 3.8 Flash，3.6 Flash，3.5 Flash-Lite 各有自己的卡，它们出现在这里只说明抓取时间晚于发布日，本卡的数字不能挪给它们。
