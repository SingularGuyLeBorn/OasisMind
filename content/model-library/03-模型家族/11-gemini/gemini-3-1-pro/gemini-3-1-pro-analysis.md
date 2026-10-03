---
title: "Gemini 3.1 Pro 模型卡解读"
category: "模型库"
tags: ["Gemini", "技术解析"]
published: true
excerpt: "Gemini 3.1 Pro 的模型卡是一份 7 页的网页，页头标 2026 年 2 月 19 日发布。"
---
# Gemini 3.1 Pro 模型卡解读

## 1. 这张卡自己交代了什么

Gemini 3.1 Pro 的模型卡是一份 7 页的网页，页头标 2026 年 2 月 19 日发布。真正属于 3.1 Pro 的内容只有六块：输入输出规格（上下文最多 1M token，输出 64K token），七个分发渠道，一张 16 个基准 20 行的评测表，一张 5 行的内容安全差值表，一段人工红队结论，以及一张 5 个领域的前沿安全表。第 6, 7 两页是 DeepMind 网站页脚。

其余章节全部指向 Gemini 3 Pro 的模型卡。架构，训练数据集，训练数据处理，硬件，软件，已知局限，可接受用途，评估方法，安全政策，风险与缓解，一共 10 节，每节都是一句 「see the Gemini 3 Pro model card」。所以这是一张增量卡，读的时候得把 gemini-3 目录里的 3 Pro 卡摆在旁边。两张卡还有大段字面重复，Description 一节几乎是同一句话，内容安全表的两条脚注也是原样搬过来的（见第 6 节）。

## 2. 和 Gemini 3 Pro 是什么关系

卡上只有一句 「Gemini 3.1 Pro is based on Gemini 3 Pro.」 3 Pro 卡那边说，3 Pro 不是对之前模型的修改或微调，而 3 Pro 家族的后续模型都基于 3 Pro，并把 3.1 Pro 列在家族名单里。3 Pro 卡对自己架构的描述是稀疏 MoE Transformer，原生支持文本，视觉和音频输入。从两张卡能推出的最多只有一步：3.1 Pro 以 3 Pro 为起点。是继续预训练，换了后训练数据，还是只改了推理配置，这 7 页没有一个字，这里也不补。

能对上的规格都没变。输入是文本，图像，音频，视频，上下文 1M token，输出 64K token，两张卡措辞相同。分发渠道有差别：3.1 Pro 列了 Gemini App，Vertex AI，AI Studio，Gemini API，Antigravity，Gemini Enterprise 和 NotebookLM 七个；3 Pro 卡列的是 Google AI Mode 而没有 Gemini Enterprise，NotebookLM 只说家族里其他模型可能在上面。知识截止日期 3 Pro 卡写了 2025 年 1 月，3.1 卡把已知局限整节指向 3 Pro 卡，没有单独给截止日期。

还有一处容易混：Deep Think. 3 Pro 卡说 Deep Think 是一个可选设置，在推理阶段提升复杂问题的表现，也就是推理时多花算力的 TestingTime 模式。3.1 卡的评测表列名是 「Thinking (High)」，不是 Deep Think；Deep Think 只出现在前沿安全一节。所以评测表里的 3.1 Pro 和前沿安全表里的 3.1 Pro，大部分行不是同一个配置。

## 3. 能直接比的十格

评测表里 Gemini 3 Pro 那一列，有 10 格和 3 Pro 卡上的数字一个不差。这 10 格可以把 3.1 Pro 的数直接拿来对减：

| 基准 | 设置 | 3.1 Pro | 3 Pro | 差值 |
| --- | --- | --- | --- | --- |
| Humanity's Last Exam | No tools | 44.4% | 37.5% | +6.9 |
| Humanity's Last Exam | Search (blocklist) + Code | 51.4% | 45.8% | +5.6 |
| ARC-AGI-2 | ARC Prize Verified | 77.1% | 31.1% | +46.0 |
| GPQA Diamond | No tools | 94.3% | 91.9% | +2.4 |
| LiveCodeBench Pro | Elo | 2887 | 2439 | +448 |
| SWE-Bench Verified | Single attempt | 80.6% | 76.2% | +4.4 |
| MMMU-Pro | No tools | 80.5% | 81.0% | -0.5 |
| MMMLU | | 92.6% | 91.8% | +0.8 |
| MRCR v2 (8-needle) | 128k (average) | 84.9% | 77.0% | +7.9 |
| MRCR v2 (8-needle) | 1M (pointwise) | 26.3% | 26.3% | 0 |

最显眼的是 ARC-AGI-2，从 31.1% 到 77.1%，多了 46 个点，是整张表最大的跳幅。LiveCodeBench Pro 多了 448 Elo。知识类的 GPQA Diamond 和多语言的 MMMLU 本来就在 90% 以上，只动了 2.4 和 0.8. SWE-Bench Verified 多了 4.4 个点，到 80.6%。

有两格没有进步。MMMU-Pro 反而低了 0.5 个点，多模态理解这一项上 3.1 Pro 没有超过 3 Pro。长上下文的 MRCR v2 在 128k 平均上多了 7.9 个点，到了 1M 逐点却原地不动，两者都是 26.3%。结果节开头说 3.1 Pro 在 「a range of benchmarks」 上明显超过 3 Pro，这句话对大多数行成立，对这两行不成立。

## 4. 换了口径或换了数字的行

两张卡共有的 10 个基准里，有两个的 3 Pro 数字对不上。一是 Terminal-Bench 2.0: 3 Pro 卡写 54.2% (Terminus-2 agent)，这里写 56.9% (Terminus-2 harness)。别的共有行都是原数照录，这一行却差 2.7 个点，更像是重跑过。3.1 Pro 的 68.5% 相对 54.2% 是 +14.3，相对 56.9% 是 +11.6，选哪个基线结论不一样。二是 τ2-bench: 3 Pro 卡给一个 85.4%，这里拆成 Retail 85.3% 和 Telecom 98.0%。两个子域的平均是 91.65%，和 85.4% 对不上，85.3% 也只是接近。旧卡是汇总数，新卡是子域数，这一行换了口径。

另外几处是标签变了，数字没变。HLE 第二行在 3 Pro 卡上叫 「With search and code execution」，这里叫 「Search (blocklist) + Code」，还加了 「full set, text + MM」；3 Pro 的 45.8% 没动。如果当年没用屏蔽名单，这一格就不是同一口径，卡上没说。ARC-AGI-2 的描述从 「Visual reasoning puzzles」 改成 「Abstract reasoning puzzles」。3 Pro 列名多了 「Thinking (High)」，旧卡上没有这个档位说明。

基准名单也换了一半。3 Pro 卡上的 AIME 2025, MathArena Apex, ScreenSpot-Pro, CharXiv Reasoning, OmniDocBench 1.5, Video-MMMU，Vending-Bench 2，FACTS Benchmark Suite，SimpleQA Verified，Global PIQA 这 10 个都不见了。数学竞赛，屏幕理解，图表，OCR，视频，事实性这几类在新表里一个都没有。新增的是 SWE-Bench Pro，SciCode，APEX-Agents，GDPval-AA，MCP Atlas，BrowseComp，集中在智能体编程，专业任务和工具调用。这六行的 3 Pro 数字是新测的：SWE-Bench Pro 43.3%, SciCode 56%, APEX-Agents 18.4%, GDPval-AA 1195, MCP Atlas 54.1%, BrowseComp 59.2%. 3.1 Pro 在这六行上的增幅分别是 +10.9, +3, +15.1, +122 Elo, +15.1, +26.7。

## 5. 放进同一张表的其他模型

表里另外四列是 Sonnet 4.6 和 Opus 4.6 (Thinking Max)，GPT-5.2 和 GPT-5.3-Codex (Thinking xhigh)，每家用的都是自家最高思考档。GPT-5.3-Codex 一列只在 Terminal-Bench 和 SWE-Bench Pro 上有数，其余全是破折号。

3.1 Pro 领先的行：HLE 不用工具 44.4%（次高 Opus 40.0%），ARC-AGI-2 77.1% (Opus 68.8%), GPQA Diamond 94.3% (GPT-5.2 92.4%)，Terminal-Bench 的 Terminus-2 设置 68.5% (Opus 65.4%), LiveCodeBench Pro 2887 (GPT-5.2 2393), SciCode 59% (52%), APEX-Agents 33.5% (Opus 29.8%), MCP Atlas 69.2% (Sonnet 61.3%), BrowseComp 85.9% (Opus 84.0%), MMMU-Pro 80.5% (GPT-5.2 79.5%), MMMLU 92.6% (Opus 91.1%).

不领先的行也不少。GDPval-AA 差距最大：3.1 Pro 1317，Sonnet 4.6 1633，Opus 4.6 1606，GPT-5.2 1462, 3.1 Pro 排在四家最后。SWE-Bench Pro 上 54.2% 低于 GPT-5.2 的 55.6% 和 Codex 的 56.8%. HLE 带搜索 51.4% 低于 Opus 的 53.1%. SWE-Bench Verified 80.6% 比 Opus 的 80.8% 低 0.2. τ2 Retail 90.8% 低于 Sonnet 91.7% 和 Opus 91.9%，Telecom 99.3% 和 Opus 持平。MRCR 128k 84.9% 和 Sonnet 持平。Terminal-Bench 的 「其他自报最佳框架」 一行，GPT-5.3-Codex 自报 77.3%，高于 3.1 Pro 在 Terminus-2 下的 68.5%，但框架不同，Gemini 两列在这一行是空的，两个数不能放在一起比。

## 6. 内容安全表：符号和脚注

内容安全表比的是 3.1 Pro 对 3 Pro 的百分点差值：Text to Text Safety +0.10% (non-egregious), Multilingual Safety +0.11% (non-egregious), Image to Text Safety -0.33%, Tone +0.02%, Unjustified-refusals -0.08%。正文说 3.1 Pro 在安全和语气上都超过 3 Pro，改进标绿，退步标红。本地 PDF 里这五个数全是同一种灰色，颜色没留下来。借 3 Pro 卡推符号：那张卡 Text to Text 是 -10.4% 且被说成更安全，标 non-egregious 的都是正数。照此读，两项安全指标是 0.1 个点左右的轻微退步，图像到文本安全，语气和不当拒答三项是改进。所有变化都在 0.33 个点以内，说 「持平」 比说 「超过」 更贴近数字。

两条脚注是从 3 Pro 卡原样搬来的。脚注 1 提 「2.5 Flash-Lite model card」，脚注 2 说正号是 「compared to Gemini 2.5 Pro」，可表头明明写着 「vs. Gemini 3 Pro」。正文还有一句 「reported below」，表其实在上面。另外卡上说评估方法改进过，结果不能和之前各版模型卡直接比。所以不能把 3 Pro 卡上相对 2.5 Pro 的差值，和这里相对 3 Pro 的差值加起来，去推 3.1 Pro 相对 2.5 Pro 的变化。

人工红队只有一段。儿童安全评估满足发布阈值，一般内容安全政策上的表现与 3 Pro 相近。3 Pro 卡当时对 2.5 Pro 的说法是 「similar or improved」，这次只写了 「similar」。

## 7. 前沿安全：看括号里的配置

前沿安全框架（FSF）用的是 「安全缓冲」 的思路：预警阈值设在关键能力等级（CCL）之前，只要模型没到预警阈值，就假定下一个评估周期之前的模型也到不了 CCL。这次对 3.1 Pro 做了完整评估，重点放在 Deep Think 模式。五个领域的结论都是没有达到 CCL。其中 CBRN 是 Uplift Level 1，未达到；网络是 Uplift Level 1，未达到。

另外三个领域有数字。有害操纵（Level 1，探索性）：Deep Think 模式下，信念改变指标的最大优势比是 3.6 倍，卡上说和 3 Pro 相同，未达预警阈值。机器学习研发（Acceleration level 1, Automation level 1）：RE-Bench 人类归一化平均分 1.27, 3 Pro 是 1.04；其中 Optimise LLM Foundry 一项，把微调脚本运行时间从 300 秒降到 47 秒，人类参考解是 94 秒，模型用时正好是人类的一半，卡上说拿到人类归一化基线分的两倍。平均分仍低于预警阈值。未对齐（探索性，Instrumental Reasoning Levels 1 + 2）：隐蔽性评估和 3 Pro 相近；情境感知上，max tokens，context size mod，oversight frequency 三个挑战成功率接近 100%，其他挑战表现不稳定，所以没到预警阈值。

和 3 Pro 卡对照时有两个缺口。第一是配置：3 Pro 卡以 3 Pro 本体为主，只附一句 Deep Think 的结果与之一致；3.1 卡大部分行标的是（Deep Think mode）。第二是基线：3.6 倍和 1.04 这两个 3 Pro 数字，3 Pro 卡上都没有，那张卡只写了定性结论，以及情境感知 3/11，隐蔽 1/4 这样的计数。卡上把细节指向 Gemini 3 Pro FSF 报告，那份报告不在本目录，这两个基线暂时没法核对。

## 8. PDF 链接，网页和本地文件

页首 「View PDF version」 指向 storage.googleapis.com 上的 Gemini-3-1-Pro-Model-Card.pdf。本目录里的 gemini-3-1-pro.pdf 不是这份文件：它的生成器是 HeadlessChrome 和 Skia，打印时间是 2026-09-25，内容带网站导航和页脚，是网页打印件。gemini-3 目录的 3 Pro 卡在家族名单里给 3.1 Pro 挂的也是这个 URL，两处链接一致。但链接背后那份 PDF 的数字和网页是不是同一版，手头没有文件，核对不了。本文所有数字都以网页版为准。

日期上也要留心。网页标 February 2026，结果 「as of February 2026」，可第 6 页 「Latest model cards」 已经列到 Gemini 3.8 Flash，3.6 Flash 和 3.5 Flash-Lite，说明页面是很久以后抓的。卡上说模型卡会不定期更新，但这张卡没有 「Last Updated」 字段，3 Pro 卡则写了 Last Updated: May 2026。二月到九月之间这张卡改没改过，从网页本身看不出来。

源文的 3 张图都在第 6 页，全是网站小图标，没有评测图：

![Image block](images/p06-la-test-model-c-https-deepmind-google-ards.png)

![Image block](images/p06-image.png)

![Image block](images/p06-sign-up-for-updates-on-our-latest-innovations-i-accept.png)

依次是一个方框图标，X 的标志和 Instagram 的标志，文件都只有一千字节上下。文件名是 MinerU 按旁边文字起的，和内容无关。这张卡的数据全部在表格里。

## 9. 读这张卡的顺序

先认对比对象。评测表比的是五家模型的最高思考档，Gemini 用的是 Thinking (High) 而不是 Deep Think；内容安全表以表头为准，比的是 3 Pro，不要被脚注里的 2.5 Pro 带偏；前沿安全表每行看括号，大多是 Deep Think 模式。三张表的 3.1 Pro 不完全是同一个配置。

再分三类行。第一类是第 3 节的 10 格，3 Pro 数字和旧卡一致，可以直接对减。第二类是 Terminal-Bench 和 τ2-bench，数字或口径变了，对减前要先说明用的是哪个基线。第三类是六个新基准，3 Pro 的数是新测的，只能在这张表内部比。至于架构和训练上改了什么，这张卡没有给出任何信息，只能等 Google 另外发材料。
