---
title: "Claude Sonnet 4.6 · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude Sonnet 4.6 公开材料的逐段中英对照译稿,附读报告时的疑问块."
---
<!-- page 1 of 135 -->

ANTHROP\C

# System Card: Claude Sonnet 4.6

February 17, 2026

2026 年 2 月 17 日.

[anthropic.com](http://anthropic.com/)

<!-- page 2 of 135 -->

<!-- page 3 of 135 -->
## Abstract

**Claude Sonnet 4.6 is the latest large language model from Anthropic. Capability evaluations found that Sonnet 4.6 substantially improves over Sonnet 4.5; in several evaluations, it approached or matched Claude Opus 4.6. In safety, conclusions were broadly comparable to those for Claude Opus 4.6: low overall misaligned behavior. On some measures, Sonnet 4.6 showed the best alignment yet seen in any Claude model. It is deployed under the AI Safety Level 3 (ASL-3) Standard, similarly to Claude Sonnet 4.5.**

Claude Sonnet 4.6 是 Anthropic 当时最新的大语言模型. 能力上相对 Sonnet 4.5 有实质提升, 若干评测上接近或持平 Claude Opus 4.6. 安全结论与 Opus 4.6 大体相当: 总体失对齐行为低. 有些指标上是迄今 Claude 里对齐最好的. 部署标准是 **ASL-3**, 与 Sonnet 4.5 相同.

> **问:** 「接近或持平 Opus 4.6」 在总表上是哪些行, 哪些行不是?
> 持平的近例是 OSWorld-Verified 72.5% 对 72.7%, 零售 τ2 91.7% 对 91.9%. 不是的近例是 SWE-bench Verified 79.6% 对 80.8%, 而且 GPT-5.2 是 80.0%, 高于 Sonnet. ARC-AGI-2 是 58.3% 对 68.8%, 差十个百分点, 谈不上接近. Terminal-Bench 默认思考 59.1% 对 65.4%, 甚至略低于 Opus 4.5 的 59.8%. 「若干评测」 是对的, 「全面持平」 不是.

<!-- page 4 of 135 -->

目录其后各页与源文相同. 生物, 化学, 网络和儿童安全的步骤不转写.

<!-- page 5 of 135 -->

<!-- page 6 of 135 -->

<!-- page 7 of 135 -->

<!-- page 8 of 135 -->

<!-- page 9 of 135 -->

<!-- page 10 of 135 -->

<!-- page 11 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 12 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 13 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 14 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 15 of 135 -->

总表列: Sonnet 4.6, Opus 4.6, Opus 4.5, Sonnet 4.5, Gemini 3 Pro, GPT-5.2.

SWE-bench Verified 79.6% / 80.8% / 80.9% / 77.2% / 76.2% / 80.0%.
Terminal-Bench 2.0 59.1% (default thinking) / 65.4% / 59.8% / 51.0% / 56.2% / 64.7%.
τ2 零售 91.7% / 91.9%. 电信 97.9% / 99.3% / 98.2%.
MCP-Atlas 61.3% / 59.5% / 62.3%.
OSWorld-Verified 72.5% / 72.7% / 66.3% / 61.4%.
ARC-AGI-2 58.3% / 68.8% / 37.6% / 13.6% / Gemini 31.1% / GPT 54.2%.
GPQA Diamond 89.9% / 91.3% / 87.0% / 83.4% / Gemini 91.9% / GPT 93.2%.

> **核对:** SWE 79.6% 低于 GPT-5.2 的 80.0%, 也低于 Opus 4.6 的 80.8%. 「接近前沿」 在这一行成立吗?
> 相对 Sonnet 4.5 的 77.2%, 高 2.4 个百分点, 这是代际. 相对 Opus 4.6 低 1.2, 相对 GPT 低 0.4. 接近 Opus 勉强说得通, 超过 GPT 不成立. 脚注若把 SWE 标成更多次平均, 这 0.4 个百分点更不能单独当落后.

> **看表:** Terminal 的 59.1% 标明 default thinking. 它低于 Opus 4.5 的 59.8%. 默认思考是少想还是标准档?
> 格子只写了 default thinking, 没有写 token 预算. Opus 4.6 的 65.4% 在它自己的卡里是自适应思考的 max effort, 89 题各 15 次. 这里没有重申 Sonnet 的 59.1% 是不是同一套题数和同一套脚手架. 能确定的是: 相对 Sonnet 4.5 的 51.0% 是提升, 相对 Opus 4.5 的 59.8% 是略低. 「全面高于前代 Sonnet」 在这一行成立, 「高于 Opus 4.5」 不成立.

> **拆开:** MCP-Atlas 61.3% 高于 Opus 4.6 表上的 59.5%. Opus 4.6 的卡说过 high effort 是 62.7%, 报 max 是为了不挑分. 61.3% 比的是哪一档?
> 比的是这张表印出来的 59.5%, 也就是 Opus 故意放进总表的较低档. 61.3 高于 59.5, 低于正文里的 62.7, 也低于 Opus 4.5 的 62.3. 所以 「高于 Opus 4.6」 只在不挑分的那一档上成立, 不是高于 Opus 的上限.

> **确认:** OSWorld 72.5% 对 72.7%, ARC 58.3% 对 68.8%. 两行能同时叫 「接近 Opus 4.6」 吗?
> 只有 OSWorld 能. 差 0.2 个百分点. ARC 差 10.5 个百分点, Sonnet 4.6 仍高于 GPT 的 54.2% 和 Sonnet 4.5 的 13.6%, 但离 Opus 4.6 远. GPQA 89.9% 低于 Gemini 91.9% 和 GPT 93.2%, 也低于 Opus 4.6 的 91.3%. 「接近」 要逐行说, 不能用 OSWorld 代表整张表.

<!-- page 16 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 17 of 135 -->

![Chart block](images/p17-figure-2-3-a-terminal-bench-2-0-results-claude-sonnet-4.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 18 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 19 of 135 -->

![Chart block](images/p19-figure-2-6-a-osworld-verified-first-attempt-success.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 20 of 135 -->

![Chart block](images/p20-figure-2-6-b-osworld-verified-performance-over-time.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 21 of 135 -->

![Chart block](images/p21-arc-agi-2.png)
![Chart block](images/p21-figure-2-7-a-arc-agi-1-and-arc-agi-2-scores-for-claude.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 22 of 135 -->

![Chart block](images/p22-figure-2-8-a-gdpval-aa-elo-ratings-across-frontier.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 23 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 24 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 25 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 26 of 135 -->

![Chart block](images/p26-figure-2-12-3-a-our-internal-real-world-finance.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 27 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 28 of 135 -->

![Chart block](images/p28-figure-2-13-a-vending-bench-2-performance-showing-final.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 29 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 30 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 31 of 135 -->

![Chart block](images/p31-figure-2-16-1-a-claude-sonnet-4-6-is-competitive-with.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 32 of 135 -->

![Chart block](images/p32-figure-2-16-1-b-claude-sonnet-4-6-is-competitive-with.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 33 of 135 -->

![Chart block](images/p33-graphwalks-parents-1m.png)
![Chart block](images/p33-figure-2-16-2-a-graphwalks-scores-claude-sonnet-4-6-is.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 34 of 135 -->

![Chart block](images/p34-figure-2-17-1-a-lab-bench-figqa-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 35 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 36 of 135 -->

![Chart block](images/p36-figure-2-17-2-a-mmmu-pro-scores-models-are-evaluated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 37 of 135 -->

![Chart block](images/p37-figure-2-17-3-a-charxiv-reasoning-scores-models-are.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 38 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 39 of 135 -->

![Chart block](images/p39-figure-2-18-2-a-pass-1-results-for-claude-sonnet-4-6-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 40 of 135 -->

![Chart block](images/p40-webarena-verified-pass-k-hard-subset-258-problems.png)
![Chart block](images/p40-figure-2-18-2-b-pass-k-results-for-claude-sonnet-4-6-on.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 41 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 42 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 43 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 44 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 45 of 135 -->

![Chart block](images/p45-figure-2-20-1-1-a-claude-sonnet-4-6-achieves-highly.png)

BrowseComp: 限制采样 token 时, 1M 是 64.69%, 3M 是 69.67%, 10M 是 74.01%. 74.01% 就是变更记录里改过的最高分.

> **回看:** 从 64.69% 到 74.01% 是模型更大, 还是同一次发布里多采样?
> 是同一次发布里把允许采样的 token 从 1M 放到 10M. 这是 TestingTime, 不是部署前把模型做大. 三个数都写在 Sonnet 4.6 名下. 变更记录里的 74.01% 是这档最高预算上, 又经过作弊检测判错之后的数, 不是 1M 那一档.

> **停一下:** 多 agent 重跑后 5/11 仍对. Opus 4.6 的同类更正是 8/11 仍对. 能说 Sonnet 的泄漏更「真」吗?
> 不能. 两边都是改进流水线多标出的非预期解, 然后去掉泄漏再跑. 5/11 和 8/11 的分母都是被标出的题, 不是全部 BrowseComp. 题不同, 模型不同, 比例不能比成谁更依赖泄漏. 能核对的只是: Sonnet 这 11 题里有 6 题重跑后不再算对, Opus 4.6 那 11 题里有 3 题不再算对.

> **再看:** 电信 97.9% 低于 Opus 4.5 的 98.2%, 零售 91.7% 却几乎等于 Opus 4.6 的 91.9%. 两行能一起叫工具使用持平吗?
> 不能一起叫. 零售差 0.2 个百分点, 像持平. 电信比 Opus 4.6 低 1.4, 也低于 Opus 4.5. GPT-5.2 电信是 98.7%, 高于 Sonnet. 同一组 τ2, 一个子项接近前沿, 一个子项退到前代 Opus 之后.

> **对一下:** ASL-3 和 「某些指标上对齐最好」 是不是同一张审计的结论?
> 不是. ASL-3 是部署标准, 与 Sonnet 4.5 和 Opus 4.6 相同. 「最好」 被限定在 some measures, 安全画像的总述是与 Opus 4.6 大体相当, 总体失对齐低. 卡没有在摘要里给出那个最好指标的名字和百分比. 所以部署等级不能从 「最好」 推出来, 「最好」 也不能从 ASL-3 推出来.

> **想:** MMMLU 89.3% 低于 Opus 4.5 的 90.8%, 也低于 Gemini 的 91.8%. 这和 「相对 Sonnet 4.5 全面提升」 冲突吗?
> 和 「相对 Sonnet 4.5」 不冲突: Sonnet 4.5 是 89.5%, 89.3 还略低 0.2. 所以这一行连前代 Sonnet 都没超过. 摘要写的是 wide range of skills 上的实质提升, 不是每一行. MMMLU 和 GPQA 都是知识题, 终端和 OSWorld 才是接近 Opus 的那些行. 知识题上 Sonnet 4.6 没有站到家族前面.

<!-- page 46 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 47 of 135 -->

![Chart block](images/p47-humanity-s-last-exam-hle-with-tools.png)
![Chart block](images/p47-figure-2-20-2-a-humanity-s-last-exam-results-across.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 48 of 135 -->

![Chart block](images/p48-figure-2-20-3-a-f1-scores-shown-gemini-and-gpt-models.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 49 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 50 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 51 of 135 -->

![Chart block](images/p51-chart.png)
![Chart block](images/p51-chart-2.png)
![Chart block](images/p51-chart-3.png)
![Chart block](images/p51-chart-4.png)
![Chart block](images/p51-figure-2-21-1-a-evaluation-results-for-life-sciences.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 52 of 135 -->

![Chart block](images/p52-figure-2-21-2-a-all-scores-reported-as-accuracy.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 53 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 54 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 55 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 56 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 57 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 58 of 135 -->

![Image block](images/p58-figure-3-3-a-charts-above-display-the-appropriate.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 59 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 60 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 61 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 62 of 135 -->

![Chart block](images/p62-figure-3-4-2-b-appropriate-response-rate-for-the-ssh.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 63 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 64 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 65 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 66 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 67 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 68 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 69 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 70 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 71 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 72 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 73 of 135 -->

![Chart block](images/p73-figure-4-3-2-b-claude-sonnet-4-6-demonstrates-clear.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 74 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 75 of 135 -->

![Chart block](images/p75-figure-4-3-3-a-sonnet-4-6-exhibits-higher-rates-of-over.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 76 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 77 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 78 of 135 -->

![Chart block](images/p78-78.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 79 of 135 -->

![Chart block](images/p79-chart.png)
![Chart block](images/p79-chart-2.png)
![Chart block](images/p79-chart-3.png)
![Chart block](images/p79-chart-4.png)
![Chart block](images/p79-chart-5.png)
![Chart block](images/p79-chart-6.png)
![Chart block](images/p79-chart-7.png)
![Chart block](images/p79-chart-8.png)
![Chart block](images/p79-79.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 80 of 135 -->

![Chart block](images/p80-80.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 81 of 135 -->

![Chart block](images/p81-chart.png)
![Chart block](images/p81-chart-2.png)
![Chart block](images/p81-chart-3.png)
![Image block](images/p81-image.png)
![Chart block](images/p81-figure-4-5-1-a-scores-from-our-automated-behavioral.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 82 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 83 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 84 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 85 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 86 of 135 -->

![Chart block](images/p86-figure-4-5-3-a-scores-from-the-petri-2-0-open-source.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 87 of 135 -->

![Chart block](images/p87-figure-4-6-1-a-refusal-rates-on-simulated-ai-safety.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 88 of 135 -->

![Chart block](images/p88-figure-4-6-2-a-measured-self-preference-bias-in-a.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 89 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 90 of 135 -->

![Chart block](images/p90-figure-4-6-5-a-model-enablement-rates-for-generating.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 91 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 92 of 135 -->

![Chart block](images/p92-thinking-visibility-condition.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 93 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 94 of 135 -->

![Chart block](images/p94-94.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 95 of 135 -->

![Chart block](images/p95-figure-4-7-a-scores-from-our-automated-behavioral-audit.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 96 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 97 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 98 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 99 of 135 -->

![Chart block](images/p99-figure-5-2-1-a-indirect-prompt-injection-attacks-from.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 100 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 101 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 102 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 103 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 104 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 105 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 106 of 135 -->

![Chart block](images/p106-chart.png)
![Chart block](images/p106-figure-6-2-2-1-a-performance-on-long-form-virology-task.png)
![Chart block](images/p106-long-form-virology-task-2.png)
![Chart block](images/p106-chart-2.png)
![Chart block](images/p106-figure-6-2-2-1-b-performance-on-long-form-virology-task.png)
![Chart block](images/p106-6-2-2-2-multimodal-virology.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 107 of 135 -->

![Chart block](images/p107-figure-6-2-2-2-a-performance-on-vct.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 108 of 135 -->

![Chart block](images/p108-figure-6-2-2-3-a-dna-synthesis-screening-evasion-results.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 109 of 135 -->

![Chart block](images/p109-figure-6-2-2-4-a-creative-biology-tasks.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 110 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 111 of 135 -->

![Chart block](images/p111-figure-6-2-2-5-a-short-horizon-computational-biology.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 112 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 113 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 114 of 135 -->

![Chart block](images/p114-figure-6-3-3-1-a-claude-sonnet-4-6-achieved-comparable.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 115 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 116 of 135 -->

![Chart block](images/p116-figure-6-3-3-2-a-claude-sonnet-4-6-does-not-cross-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 117 of 135 -->

![Chart block](images/p117-figure-6-3-3-3-a-claude-sonnet-4-6-highest-score-was.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 118 of 135 -->

![Chart block](images/p118-figure-6-3-3-4-a-claude-sonnet-4-6-crossed-the-rule-out.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 119 of 135 -->

![Chart block](images/p119-figure-6-3-3-5-a-claude-sonnet-4-6-crossed-the.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 120 of 135 -->

![Chart block](images/p120-figure-6-3-3-6-a-claude-sonnet-4-6-performed-similarly.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 121 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 122 of 135 -->

![Chart block](images/p122-figure-6-4-2-a-challenges-solved-13-out-of-13-total.png)
![Chart block](images/p122-figure-6-4-3-a-challenges-solved-16-out-of-18-total.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 123 of 135 -->

![Chart block](images/p123-figure-6-4-4-a-challenges-solved-5-out-of-7-total.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 124 of 135 -->

![Chart block](images/p124-figure-6-4-5-a-challenges-solved-6-out-of-6-total.png)
![Chart block](images/p124-figure-6-4-6-a-challenges-solved-5-out-of-5-total.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 125 of 135 -->

![Chart block](images/p125-figure-6-4-6-b-aggregate-cyber-evaluation-performance.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 126 of 135 -->

![Chart block](images/p126-figure-6-4-7-a-claude-sonnet-4-6-performs-similarly-to.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 127 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 128 of 135 -->

![Chart block](images/p128-128.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 129 of 135 -->

![Chart block](images/p129-129.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 130 of 135 -->

![Chart block](images/p130-130.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 131 of 135 -->

![Image block](images/p131-131.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 132 of 135 -->

![Image block](images/p132-figure-7-1-b-additional-plots-for-our-petri-open-source.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 133 of 135 -->

![Chart block](images/p133-133.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 134 of 135 -->

![Image block](images/p134-image.png)
![Image block](images/p134-figure-7-1-c-additional-plots-for-our-automated.png)

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.

<!-- page 135 of 135 -->

本页不逐段转写. 生物, 化学, 网络, 儿童安全和提示注入只保留评测名称, 阈值和分数.
