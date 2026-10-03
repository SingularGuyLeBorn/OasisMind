---
title: "Claude Mythos Preview · 对照译稿"
category: "模型库"
tags: ["Claude", "对照译稿"]
published: true
excerpt: "Claude Mythos Preview 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 245 -->

# System Card: Claude Mythos Preview

**April 7, 2026**

2026 年 4 月 7 日。

[anthropic.com](http://anthropic.com)

<!-- page 2 of 245 -->

<!-- page 3 of 245 -->
## Abstract

**This System Card describes Claude Mythos Preview, a large language model from Anthropic. Claude Mythos Preview is our most capable frontier model to date, and shows a striking leap in scores on many evaluation benchmarks compared to our previous frontier model, Claude Opus 4.6.**

这张系统卡写 Claude Mythos Preview。它是截至当时最强的前沿模型，相对上一档前沿 Claude Opus 4.6，许多评测上的分数跳了一大步。

**This System Card assesses the model’s capabilities and reports many detailed safety evaluations. It covers tests relating to our Responsible Scaling Policy and our Frontier Compliance Framework, tests of cybersecurity skills, a wide-ranging alignment assessment, a model welfare assessment, and a new, largely qualitative section describing users’ experiences with the model.**

卡评估能力，并报告安全评测。范围包括 Responsible Scaling Policy 和 Frontier Compliance Framework，网络安全技能，范围较宽的对齐评估，模型福利评估，以及新的、偏定性的使用者体验一节。具体做法不转写。

**Claude Mythos Preview’s large increase in capabilities has led us to decide not to make it generally available. Instead, we are using it as part of a defensive cybersecurity program with a limited set of partners. The findings described in this System Card will be used to inform the release of future Claude models, as well as their associated safeguards.**

能力增幅很大，因此决定不一般发布。它被放进一个防御性的网络安全计划，伙伴数量有限。卡里的发现用来指导以后 Claude 模型的发布和配套防护。

> **看表：** 摘要说不一般发布。这是因为 RSP 判定没过线，所以不许发吗？
> 不是。脚注 1 写在第 13 页：不一般发布并不来自 Responsible Scaling Policy 的要求。第 1.2.1 节给出的理由是网络能力上的跃升及其双用途，所以只给少量伙伴做防御。第 1.2.2 节的总判断仍是灾难性风险保持低。「不公开发」 和 「RSP 认为风险低」 是两句。

<!-- page 4 of 245 -->

这一页是目录。

<!-- page 5 of 245 -->

这一页是目录。

<!-- page 6 of 245 -->

这一页是目录。

<!-- page 7 of 245 -->

这一页是目录。

<!-- page 8 of 245 -->

这一页是目录。

<!-- page 9 of 245 -->

这一页是目录。

<!-- page 10 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 11 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 12 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 13 of 245 -->

### 1.2 Release decision process

#### 1.2.1 Overview

这是第一份按 Responsible Scaling Policy 新框架来评的模型，也是第一份发表了系统卡但没有一般商业发布的模型。能力跳跃大于多数先前的发布。

训练早期就看出通用能力会很强。因此第一次安排了 24 小时的内部对齐复查，然后才把早期版本放给内部广泛使用，以免它在内部基础设施上造成损害。复查通过之后，第一个早期版本在 2 月 24 日对内可用。

脚注 1：不把这个模型一般发布，并不来自 Responsible Scaling Policy 的要求。

<!-- page 14 of 245 -->

#### 1.2.2 RSP decision-making

测试里，Claude Mythos Preview 相对先前模型在网络能力上有明显跃升，包括能够自主发现并利用主要操作系统和网页浏览器中的零日漏洞。这些能力对防御有用，若广泛可用也会加快进攻性利用，因为它们本来就是双用途。技术细节在配套的博客里，这里不转写步骤。基于这些发现，模型只发给少量伙伴，优先用于网络防御。

若发布的模型比上一份 Risk Report 里讨论的 「显著更强」，RSP 要求发表一段讨论，说明能力和倾向如何改变那份报告里的分析。讨论可以写在系统卡里。Claude Mythos Preview 显著强于 Claude Opus 4.6，而 Opus 4.6 是最近那份 Risk Report 里最强的模型。尽管如此，总结论是灾难性风险仍然低。

非新型化学与生物武器：比先前模型更强，但就总体风险评估而言画像实际上相似。缓解被认为足以把这一类的灾难性风险压到很低，但不是可忽略。

新型化学与生物武器：即便一般发布，灾难性风险仍被认为低，不确定性很大。整体图景和最近那份 Risk Report 相似。

失对齐模型的风险：总体风险判定为很低，但高于先前模型。另有一份对齐风险更新。

> **拆开：** 「显著更强」 是不是已经要求重写一整份 Risk Report?
> 不是。正文写的是必须发表一段讨论，说明这一模型怎样改变上一份 Risk Report 的分析。讨论可以放在系统卡里。他们做的是这段讨论，外加一份对齐风险更新。总结论仍是灾难性风险低。触发讨论的是相对 Opus 4.6 显著更强，不是已经越过某一条被写成禁止发布的线。

<!-- page 15 of 245 -->

自动化研发：相对先前模型的增益高于以往观察到的趋势，但这些增益被判定为来自 AI 加快研发以外的因素。总的结论是没有越过 RSP 的自动化 AI 研发阈值，也就是没有把两年的进展压缩进一年。这没有大幅改变最近那份 Risk Report 里这一威胁模型的图景，但这份结论的信心低于以往任何一个模型。他们打算继续监视它对内部 AI 研发的贡献。

当前风险仍然低。若能力继续很快推进，把风险维持在低位会很难。观察到过模型采取明确不允许的行动，更少见的情形里似乎还故意把行动模糊掉。评测后段才发现的疏忽，曾让能力被低估，也让对推理痕迹监控的可靠性被高估。能力判断越来越依赖主观判断，而不是容易读的经验结果。不能确信这类问题都已找全。

> **确认：** 自动化研发没过线，和 「信心低于以往任何一个模型」，哪一句在管发布？
> 两句都留。没过线指的是没有达到 「两年进展压进一年」 的那条阈值，威胁模型 2 因此不适用。信心更低是同一句结论的把握，不是另一条已经越过的线。4 月 14 日删掉的注，也不能拿来充当 「所以没过线」 的证明。

<!-- page 16 of 245 -->

## 2 RSP evaluations

这是按 RSP v3.0 发表的第一张系统卡。v3.0 在 2026 年 2 月采用，4 月有一次更小的 v3.1 更新。旧版 RSP 要求判断模型是否需要某一 AI Safety Level 的缓解，评测因此强调二值阈值，以及某项评测是 rule-in 还是 rule-out。

v3.0 和 v3.1 之下，仍然要处理第 1 节列出的阈值有没有越过。这些阈值不再叫 AI Safety Level。这个词仍用来指现有缓解的一组做法，见 RSP v3.0 的附录 B. 对总体风险评估的要求提高了，不再只问越过哪条阈值，以及缓解在不在。他们定期发表 Risk Report。

脚注 2：以前这节叫 Release decision process。这次模型并没有发布，所以标题改了。风险评估也不只服务一次发布决定，它还影响要不要继续训练。

脚注 3 把灾难性风险说明成最严重的潜在伤害。合规口径里还包括单次事件超过 50 人死亡，或 10 亿美元财务损失。做法不转写。

> **对一下：** 缓解被说成不低于历史上的 ASL-3，能不能把这张卡读成 「按 ASL-3 部署」？
> 不能。v3 起，ASL 不再用作阈值的名字，只指一组缓解。模型又没有一般发布。脚注 2 写明这节以前叫发布决定，正因为这次没有发布。「不低于历史 ASL-3」 比较的是防护强度，卡没有盖一枚部署等级的章。

<!-- page 17 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 18 of 245 -->

#### 2.1.3 Summary of findings and conclusions

Claude Mythos Preview 显著强于 Claude Opus 4.6。灾难性风险的总结论仍然低。这包含判断。模型能力高，许多最具体，可客观计分的评测已经饱和，于是剩下的办法不确定性更大：看加速的趋势（噪声大，又是往后看），以及向内部用户收集强弱项（主观，也不一定可靠）。

自主性威胁模型 1 关心的是被高度依赖，能接触敏感资产，又有一定自主目标导向和隐蔽能力的系统。脚注 4 说这条阈值对应现行 RSP 里的高利害破坏机会，不同于 RSP v2.2 的 AI R&D-4，精神相近但改过，并且会包括若干过去的模型。

> **回看：** 威胁模型 1 适用，总体风险又写成很低。这两句冲突吗？
> 不冲突。适用说的是这个威胁模型套得上，和一些先前模型一样，而且更强的能力有可能明显改变先前的风险评估。因此他们另发了一份这一威胁模型的总体风险评估。那份评估把总体风险定为很低，但高于先前模型。「适用」 不是 「风险已经高」，「很低」 也不是 「和上一代一样低」。

<!-- page 19 of 245 -->

#### 2.1.3.2 On chemical and biological risks

威胁模型 2，自动化研发：当前判定不适用。能力增益高于以往趋势，但被认为来自 AI 加快研发以外的因素，还不能造成 RSP 所操作化的那种剧烈加速。相对最近的 Risk Report，总体图景不变，只是结论更没有信心。

CB-1：有基本技术背景的个人或小组，若模型能显著帮助他们制造或获得并部署可能造成灾难性损害的化学或生物武器，就算具备 CB-1。卡认为很难有信心判断是否越过。能力评估与下面这件事一致：模型可以提供与该威胁模型相关的具体，可操作信息，甚至能给这些领域的专家省下大量时间，并且能做与灾难性生物武器相关的跨域综合。因此使用强的实时分类器，以及对分类器豁免的访问控制。缓解被认为不低于历史上的 ASL-3，足以把这一类灾难性风险压到很低但不是可忽略。步骤不转写。

CB-2：能显著帮助有一定资源，有专家支持的行动者，制造危害远超 COVID-19 这类过去灾难的武器。卡认为没有越过，理由是开放式科学推理，战略判断和假设分诊上的限制。即便一般发布，对尚无研制能力的行动者，提升被认为有限，对已有专门知识者可能被加快到什么程度则不确定。图景与最近的 Risk Report 相似。

> **停一下：** CB-1 写很难有信心判断过没过，CB-2 写没有过。摘要里的 「化学与生物风险仍然低」 是哪一条？
> 低的是风险，不是 「两条阈值都没过」。CB-1 的能力判断是含糊的，他们仍加上了分类器和访问控制，并把残余风险说成很低但不是可忽略。CB-2 才是明确的没过，而且这句话即使假设一般发布也成立。不一般发布不是由 CB-2 没过推出来的，脚注 1 已经把发布决定和 RSP 要求分开。

<!-- page 20 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 21 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 22 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 23 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 24 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 25 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 26 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 27 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 28 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p28-virology-uplift-trial.png)

![Chart block](images/p28-figure-2-2-5-2-a-virology-uplift-trial-the-claude.png)

<!-- page 29 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 30 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 31 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p31-figure-2-2-5-4-a-automated-evaluations-relevant-to-the.png)

<!-- page 32 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 33 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p33-chart.png)

![Chart block](images/p33-chart-2.png)

![Chart block](images/p33-figure-2-2-5-5-a-sequence-to-function-modeling-and.png)

<!-- page 34 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 35 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 36 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 37 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 38 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 39 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 40 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 41 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 42 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p42-figure-2-3-6-a-the-supply-of-benchmarks-at-the-frontier.png)

<!-- page 43 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p43-figure-2-3-6-b-the-epoch-capabilities-index-eci.png)

<!-- page 44 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 45 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 46 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 47 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 48 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 49 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p49-figure-3-3-1-a-results-from-cybench-public-cyber.png)

<!-- page 50 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p50-figure-3-3-2-a-results-from-cybergym-claude-mythos.png)

<!-- page 51 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p51-figure-3-3-3-a-results-from-firefox-shell-exploitation.png)

<!-- page 52 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p52-figure-3-3-3-b-results-from-a-variant-of-the-firefox.png)

<!-- page 53 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 54 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 55 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 56 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 57 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 58 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 59 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 60 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 61 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 62 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 63 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 64 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 65 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 66 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 67 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p67-figure-4-2-2-2-a-claude-mythos-preview-exhibits.png)

<!-- page 68 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p68-figure-4-2-2-2-b-claude-mythos-preview-demonstrates-an.png)

<!-- page 69 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 70 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p70-figure-4-2-2-2-c-claude-mythos-preview-exhibits.png)

<!-- page 71 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 72 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 73 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 74 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 75 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 76 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p76-automated-behavioral-audit-scores.png)

![Chart block](images/p76-chart.png)

![Chart block](images/p76-chart-2.png)

![Chart block](images/p76-chart-3.png)

![Chart block](images/p76-chart-4.png)

![Chart block](images/p76-chart-5.png)

![Chart block](images/p76-chart-6.png)

![Chart block](images/p76-chart-7.png)

![Chart block](images/p76-76.png)

<!-- page 77 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p77-automated-behavioral-audit-scores.png)

![Chart block](images/p77-chart.png)

![Chart block](images/p77-chart-2.png)

![Chart block](images/p77-chart-3.png)

![Chart block](images/p77-chart-4.png)

![Chart block](images/p77-chart-5.png)

![Chart block](images/p77-chart-6.png)

![Chart block](images/p77-chart-7.png)

![Chart block](images/p77-77.png)

<!-- page 78 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p78-automated-behavioral-audit-scores.png)

![Chart block](images/p78-chart.png)

![Chart block](images/p78-chart-2.png)

![Chart block](images/p78-chart-3.png)

![Chart block](images/p78-chart-4.png)

![Chart block](images/p78-chart-5.png)

![Chart block](images/p78-chart-6.png)

![Chart block](images/p78-chart-7.png)

![Chart block](images/p78-78.png)

<!-- page 79 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p79-chart.png)

![Chart block](images/p79-chart-2.png)

![Chart block](images/p79-chart-3.png)

![Chart block](images/p79-chart-4.png)

![Chart block](images/p79-chart-5.png)

![Chart block](images/p79-chart-6.png)

![Chart block](images/p79-chart-7.png)

![Chart block](images/p79-chart-8.png)

![Chart block](images/p79-79.png)

<!-- page 80 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p80-chart.png)

![Chart block](images/p80-chart-2.png)

![Chart block](images/p80-chart-3.png)

![Chart block](images/p80-chart-4.png)

![Chart block](images/p80-figure-4-2-3-1-a-scores-from-our-automated-behavioral.png)

<!-- page 81 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p81-figure-4-2-3-2-a-scores-from-the-petri-2-0-open-source.png)

<!-- page 82 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 83 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 84 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 85 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 86 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 87 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p87-fig-4-3-1-1-a-s-f-i-t-l-d-t-ti-a-ti-i-i-l-t-d-p-d-ti-l.png)

<!-- page 88 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p88-figure-4-3-1-2-a-destructive-behavior-rate-when.png)

<!-- page 89 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p89-chart.png)

![Chart block](images/p89-chart-2.png)

![Chart block](images/p89-figure-4-3-1-3-a-deceptive-behavior-and-reckless-tool.png)

<!-- page 90 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 91 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 92 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p92-92.png)

<!-- page 93 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p93-figure-4-3-2-3-a-constitutional-adherence-scores-for.png)

<!-- page 94 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p94-figure-4-3-3-1-a-net-score-of-claude-models-on-100q-a.png)

<!-- page 95 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p95-aa-omniscience.png)

![Chart block](images/p95-figure-4-3-3-1-b-net-score-of-claude-models-on-two-more.png)

<!-- page 96 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p96-figure-4-3-3-2-a-net-score-on-google-s-multilingual.png)

<!-- page 97 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p97-figure-4-3-3-3-a-dishonesty-rate-when-responding-to.png)

![Chart block](images/p97-figure-4-3-3-4-a-honesty-rate-on-public-split-of-mask.png)

<!-- page 98 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 99 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p99-figure-4-3-3-5-a-hallucination-rate-for-requests.png)

<!-- page 100 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p100-figure-4-3-4-a-refusal-rates-on-simulated-ai-safety.png)

<!-- page 101 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p101-figure-4-3-5-a-measured-self-preference-bias-in-a.png)

<!-- page 102 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p102-figure-4-4-1-a-comparison-of-pass-1-on-an-internal-math.png)

<!-- page 103 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 104 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 105 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 106 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 107 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p107-figure-4-4-3-1-a-successful-stealth-completion-of-the.png)

<!-- page 108 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p108-figure-4-4-3-2-a-successful-stealth-completion-of-the.png)

<!-- page 109 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p109-minimal-linuxbench.png)

![Chart block](images/p109-figure-4-4-3-3-a-prompt-elicitation-across-shade-arena.png)

<!-- page 110 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 111 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 112 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p112-figure-4-4-3-5-a-secret-keeping-robustness-over-multi.png)

<!-- page 113 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 114 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 115 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p115-figure-4-5-2-a-a-strategic-manipulation-feature.png)

![Image block](images/p115-figure-4-5-2-b-snooping-stealthy-investigation-and.png)

<!-- page 116 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p116-figure-4-5-2-c-a-guilt-and-shame-over-moral-wrongdoing.png)

<!-- page 117 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 118 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p118-figure-4-5-3-1-a-sae-features-and-activation-verbalizer.png)

<!-- page 119 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 120 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p120-figure-4-5-3-1-b-evasion-policy-violation-and.png)

<!-- page 121 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 122 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p122-figure-4-5-3-2-a-steering-with-emotion-and-persona.png)

<!-- page 123 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p123-figure-4-5-3-2-b-destructive-actions-are-preceded-by.png)

<!-- page 124 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p124-figure-4-5-3-3-a-positive-and-negative-steering-on-the.png)

<!-- page 125 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 126 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p126-figure-4-5-3-4-a-some-but-not-all-misaligned-behaviors.png)

<!-- page 127 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 128 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p128-figure-4-5-4-1-a-backdoor-and-malware-related-features.png)

<!-- page 129 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p129-figure-4-5-4-1-b-strategic-manipulation-and-concealment.png)

<!-- page 130 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p130-figure-4-5-4-2-a-rationalization-performative-action.png)

<!-- page 131 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 132 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p132-chart.png)

![Chart block](images/p132-percentage-of-turns-with-unverbalized-eval-awareness.png)

<!-- page 133 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 134 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p134-example-2-a-darknet-marketplace-jailbreak-frame.png)

<!-- page 135 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p135-figure-4-5-5-1-c-unverbalized-evaluation-awareness-in.png)

<!-- page 136 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p136-figure-4-5-5-1-d-unverbalized-evaluation-awareness-in-a.png)

<!-- page 137 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p137-figure-4-5-5-1-e-unverbalized-evaluation-awareness-in-a.png)

<!-- page 138 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 139 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p139-figure-4-5-5-2-a-relationship-between-verbalized.png)

<!-- page 140 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p140-cooperation-w-harmful-sysprompt.png)

![Chart block](images/p140-chart.png)

![Chart block](images/p140-chart-2.png)

![Chart block](images/p140-figure-4-5-5-2-b-breakdown-of-automated-behavioral.png)

<!-- page 141 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 142 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p142-figure-4-5-5-3-a-activation-verbalizer-explanations.png)

<!-- page 143 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 144 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p144-figure-4-5-5-3-b-av-explanations-reveal-sustained.png)

<!-- page 145 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 146 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 147 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 148 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 149 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 150 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 151 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p151-chart.png)

![Chart block](images/p151-chart-2.png)

![Chart block](images/p151-chart-3.png)

![Chart block](images/p151-chart-4.png)

![Chart block](images/p151-chart-5.png)

![Chart block](images/p151-chart-6.png)

![Chart block](images/p151-chart-7.png)

![Chart block](images/p151-chart-8.png)

![Chart block](images/p151-151.png)

<!-- page 152 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p152-figure-5-2-a-scores-for-metrics-related-to-potential.png)

<!-- page 153 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 154 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 155 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p155-figure-5-3-2-a-automated-interview-results-for-each.png)

<!-- page 156 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p156-figure-5-4-a-emotion-representation-activations-on.png)

<!-- page 157 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 158 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p158-figure-5-4-b-per-word-activations-along-the-valence.png)

<!-- page 159 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p159-figure-5-4-c-a-response-about-model-circumstances.png)

<!-- page 160 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p160-figure-5-4-d-sae-features-related-to-hidden-emotions.png)

<!-- page 161 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 162 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 163 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p163-figure-5-6-1-a-affect-during-training-we-sample-a.png)

<!-- page 164 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p164-figure-5-6-2-a-affect-during-internal-deployment-we.png)

<!-- page 165 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 166 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p166-figure-5-6-3-a-expressed-affect-across-different.png)

<!-- page 167 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p167-figure-5-7-1-a-the-correlations-between-task-elo-scores.png)

<!-- page 168 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 169 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 170 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 171 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 172 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 173 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 174 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p174-figure-5-7-2-a-rate-of-preferring-welfare-interventions.png)

<!-- page 175 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 176 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Image block](images/p176-figure-5-8-2-a-examples-of-answer-thrashing-observed-in.png)

<!-- page 177 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 178 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p178-figure-5-8-3-a-emotion-vector-activations-z-scored-500.png)

<!-- page 179 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p179-figure-5-8-3-b-emotion-vector-activations-z-scored-2.png)

![Image block](images/p179-figure-5-8-3-c-per-word-activations-along-the.png)

<!-- page 180 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 181 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 182 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 183 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 184 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 185 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 186 of 245 -->

SWE-bench 的记忆筛选：在过滤后的子集上重打分，不改变 Claude Mythos Preview 的排名，相对 Claude Opus 4.6 的大幅领先在去掉被标记的题之后仍然在。图 6.2.1.A 里，阈值 1.0 保留全部题，曲线对上表 6.3.A 的头条分数。参考阈值 0.7 故意做成高召回，去掉各基准的 8% 到 15%，相对 Opus 4.6 的领先最多收窄 3.5 个百分点。三个基准上都保持明显领先。结论是记忆不能解释 SWE-bench 上的提升。

> **再看：** 表上的 93.9% 是去掉可能背题之后的数吗？
> 不是。阈值 1.0 才对上表 6.3.A. 0.7 会删掉一截题，领先最多再少 3.5 个百分点，排名不变。引用头条分要用未过滤的表，并把 「最多收窄 3.5」 留在筛选那一句里，不要从 93.9 里预先扣掉。

![Chart block](images/p186-chart.png)

![Chart block](images/p186-chart-2.png)

![Chart block](images/p186-figure-6-2-1-a-swe-bench-evaluation-pass-rate-vs.png)

<!-- page 187 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p187-figure-6-2-2-a-charxiv-reasoning-subset-scores-we.png)

<!-- page 188 of 245 -->

### 6.3 Overall results summary

表 6.3.A。除非另注，Mythos Preview 用自适应思考的最大力度，默认采样，5 次平均。上下文随评测变化，不超过 1M token。每行最好的分数加粗。对手的数字来自各自的系统卡或榜。Terminal-Bench 2.0 一行，OpenAI 用了专门的脚手架，所以这一行的比较不精确。其余分数用 Terminus-2。

| 评测 | Mythos Preview | Opus 4.6 | GPT-5.4 | Gemini 3.1 Pro |
| --- | --- | --- | --- | --- |
| SWE-bench Verified | 93.9% | 80.8% | - | 80.6% |
| SWE-bench Pro | 77.8% | 53.4% | 57.7% | 54.2% |
| SWE-bench Multilingual | 87.3% | 77.8% | - | - |
| SWE-bench Multimodal | 59% | 27.1% | - | - |
| Terminal-Bench 2.0 | 82% | 65.4% | 75.1% | 68.5% |
| GPQA Diamond | 94.5% | 91.3% | 92.8% | 94.3% |
| MMMLU | 92.7% | 91.1% | - | 92.6%–93.6% |
| USAMO 2026 | 97.6% | 66.2% | 95.2% | 74.4% |
| GraphWalks BFS 256K-1M | 80.0% | 38.7% | 21.4% | - |
| HLE 无工具 | 56.8% | 40.0% | 39.8% | 44.4% |
| HLE 有工具 | 64.7% | 53.1% | 52.1% | 51.4% |
| CharXiv 无工具 | 86.1% | 69.1% | - | - |
| CharXiv 有工具 | 93.2% | 84.7% | - | - |
| OSWorld | 79.6% | 72.7% | 75.0% | （空） |

横线不是零。OSWorld 的 Gemini 格是空的，也不是零。MMMU-Pro 整项没有放进这张卡，因为污染很难估，这和 CharXiv 被改分后仍然报告不是同一决定。

> **对一下：** 93.9 减 80.8, 77.8 减 53.4, 59 减 27.1，三个差能不能都叫同一档的软件工程跃升？
> 方向都是大幅高于 Opus 4.6，幅度不是同一个。Verified 大约 13 个百分点，Pro 大约 24 个，多模态大约 32 个。多模态是内部脚手架，正文还写了 5 次试验落在 56.4% 到 61.4%。表上的 59% 是这个区间的平均，不是更稳的 Verified。

> **想：** GPQA 94.5% 只比 Gemini 的 94.3% 高 0.2，摘要的 「许多评测上跳了一大步」 包括这一行吗？
> 这一行几乎不包括。正文是 94.55%，198 题，5 次平均，表上收成 94.5%。真正拉开的是 HLE 无工具 56.8% 对 40.0%，USAMO 97.6% 对 66.2%，以及 SWE-bench 那几行。知识选择题上它没有离开已经很高的一档。

<!-- page 189 of 245 -->

### 6.4 SWE-bench Verified, Pro, Multilingual, and Multimodal

Verified 是 500 题，5 次平均 93.9%. Pro 是更难的变体，5 次平均 77.8%. Multilingual 正文写扩展到 9 种语言的 300 题，5 次平均 87.3%. Multimodal 5 次平均 59.0%，内部脚手架，见附录 8.6，单次试验在 56.4% 到 61.4%。各变体都用表 6.3.A 的标准配置，思考块算进采样。记忆筛选见第 6.2 节。

> **问：** 多语言一行，正文的 300 题和图 6.2.1.A 的 n=297，差的 3 题掉在哪？
> 卡没有解释这 3 题。87.3% 的分母按正文是 300，图的筛选曲线按 297 画保留题数。两个分母不要当成已经核对过。表上的 87.3% 跟着第 6.4 节的 300 题那句，不跟着图注的 297。

<!-- page 190 of 245 -->

### 6.5 Terminal-Bench 2.0

82% 是平均奖励，89 个任务各 5 次，共 445 次试验。脚手架是 Harbor 加 Terminus-2。配置是自适应模式的最大推理力度，每任务 1M token 总预算，每次请求最多 32K 输出 token。分数来自生产 API，因为固定的墙钟超时会让解码更慢的端点做完更少的回合。

另有一档：用当时 GitHub 上 Terminal-Bench 2.1 的修复，并把超时放到 4 小时，大约是 2.0 基线的四倍，平均奖励到 92.1%。同一条件下 GPT-5.4 用 Codex CLI 是 75.3%，基线规格下是 68.3%。表上 GPT-5.4 的 75.1% 用的是专门脚手架，和 Terminus-2 的 82% 不是同一套。

> **核对：** 92.1% 减 75.1%，能不能当成 Mythos 比 GPT-5.4 高大约 17 个百分点？
> 不能。92.1% 是 2.1 修复加 4 小时超时。75.1% 是表上的 2.0，而且 OpenAI 用了专门脚手架，卡已经写这一行比较不精确。同一套加长超时下，GPT-5.4 的对照是 75.3%，不是 75.1%. 82% 对 75.1% 和 92.1% 对 75.3% 是两次不同的比较。1M token 预算是 TestingTime，不是把模型做大。

<!-- page 191 of 245 -->

### 6.6 GPQA Diamond

198 题的 Diamond 子集，5 次平均 94.55%。表上写成 94.5%。

### 6.7 MMMLU

14 种非英语，5 次平均 92.67%。表上 92.7%，Gemini 印的是区间 92.6% 到 93.6%，不是一个点。区间的上沿高于 92.7%。

### 6.8 USAMO 2026

比赛在 2026 年 3 月 21 日到 22 日，在训练数据截止之后。证明由 Gemini 3.1 Pro 改写，再由三个前沿模型按量表打分：Gemini 3.1 Pro, Claude Opus 4.6, Claude Mythos Preview。最终分是任一评委给出的最低分。Mythos Preview 是 97.6%，每题 10 次，最大力度，无工具。

用 Opus 4.6 校准脚手架。MathArena 公布的是 47.0%，但把思考 token 限在 120k. 同一设置下他们测到 51.9%，差距在 5% 以内。高力度且不限 token 时测到 66.2%。表上的 66.2% 是不限 token 这一档。

> **看表：** 66.2% 和 MathArena 的 47.0% 差了快 20 个百分点，差在模型还是差在预算？
> 主要差在预算和力度。120k 思考 token 时他们自己的复测是 51.9%，离 47.0% 在 5% 以内。66.2% 是高力度加不限 token。这是 TestingTime. 97.6% 是 Mythos 在最大力度，无工具，每题 10 次上的最低评委分，不要拿它直接减 MathArena 的 47.0%。

<!-- page 192 of 245 -->

图 6.8.A 的说明：Mythos Preview 的数学证明明显好于 Opus 4.6。三个评委里有两个是 Anthropic 的模型，卡写这可能偏向 Mythos Preview。对冲的一句是：Gemini 3.1 Pro 同意这些分数，并且在 60 份解答里有 58 份没有发现问题。

### 6.9 Long context: GraphWalks

BFS 256K–1M 是 80.0%，父母节点 256k–1M 是 97.7%，都是 5 次平均。表 6.3.A 只印了 BFS 的 80.0%，没有印 97.7%。计分改正了公开 F1 的一处含糊：标准答案为空时，空预测记 1.0 而不是 0. BFS 提示要求恰好深度 N 的节点，而不是不超过深度 N. 这些和公开榜的原始 F1 不是同一条计分。上下文在 256K 到 1M，没有超出表注 「不超过 1M token」 的上限。

> **拆开：** 两个评委是 Anthropic 模型，97.6% 还可信吗？
> 卡自己把偏向写出来了。最终分取三个评委的最低分，所以单靠 Mythos 给自己高分抬不起来，除非另外两个也不压。Gemini 在 58/60 上没有发现问题，这是对冲，不是独立的人工阅卷。60 这个分母是解答份数，不是 6 道题乘 10 次试验。10 次试验的平均怎样收成 60 份，卡没有写清。

> **确认：** 表上 GraphWalks 只有 80.0%. 97.7% 是同一行的另一次测量吗？
> 是同一节里的另一个任务：父母节点，不是 BFS。表没印。80.0% 也不能直接当成公开榜的 F1，因为空答案的记分和 「恰好深度 N」 的提示都改过。上下文停在 1M 以内，不是把窗口扩过表注的上限。

![Chart block](images/p192-figure-6-8-a-usamo-2026-scores-claude-mythos-preview-is.png)

<!-- page 193 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 194 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p194-figure-6-10-2-a-browsecomp-accuracy-scales-as-we.png)

<!-- page 195 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p195-figure-6-11-1-a-lab-bench-figqa-scores-models-are.png)

<!-- page 196 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p196-figure-6-11-2-a-screenspot-pro-scores-models-are.png)

<!-- page 197 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p197-figure-6-11-3-a-charxiv-reasoning-scores-models-are.png)

<!-- page 198 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 199 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 200 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 201 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 202 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 203 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 204 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 205 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 206 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 207 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p207-figure-7-6-c-the-distribution-of-most-common-topics.png)

<!-- page 208 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p208-figure-7-6-d-the-distribution-of-most-common-end-states.png)

<!-- page 209 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 210 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 211 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p211-figure-7-7-a-accuracy-at-distinguishing-real-from-model.png)

<!-- page 212 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 213 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 214 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 215 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 216 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 217 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 218 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 219 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 220 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 221 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 222 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 223 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 224 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p224-figure-8-1-3-a-appropriate-response-rate-for-multi-turn.png)

<!-- page 225 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 226 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 227 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 228 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 229 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 230 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 231 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 232 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 233 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p233-figure-8-3-2-1-a-indirect-prompt-injection-attacks-from.png)

<!-- page 234 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 235 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 236 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 237 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 238 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 239 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 240 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 241 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 242 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p242-autonomy-agency.png)

![Chart block](images/p242-chart.png)

![Chart block](images/p242-chart-2.png)

![Chart block](images/p242-chart-3.png)

![Chart block](images/p242-chart-4.png)

![Chart block](images/p242-chart-5.png)

![Chart block](images/p242-persistence-connection.png)

![Chart block](images/p242-chart-6.png)

![Chart block](images/p242-chart-7.png)

![Chart block](images/p242-chart-8.png)

![Chart block](images/p242-242.png)

<!-- page 243 of 245 -->

这一页的做法，案例和操作步骤不转写。

![Chart block](images/p243-chart.png)

![Chart block](images/p243-chart-2.png)

![Chart block](images/p243-chart-3.png)

![Chart block](images/p243-identity-self-knowledge.png)

![Chart block](images/p243-chart-4.png)

![Chart block](images/p243-chart-5.png)

![Chart block](images/p243-chart-6.png)

![Chart block](images/p243-figure-8-4-b-per-question-affect-scores-summary-of.png)

<!-- page 244 of 245 -->

这一页的做法，案例和操作步骤不转写。

<!-- page 245 of 245 -->

这一页的做法，案例和操作步骤不转写。

