<!-- page 1 of 193 -->

# System Card: Claude Opus 5

**July 24, 2026**

2026 年 7 月 24 日.

[anthropic.com](http://anthropic.com)

<!-- page 2 of 193 -->

## Executive Summary

**This system card describes Claude Opus 5, the latest large language model from Anthropic. It is an upgrade to Claude Opus 4.8, with gains in various aspects of agentic coding, computer use, and long-horizon knowledge work, as well as improvements in mathematical and scientific reasoning.**

这张卡写 Claude Opus 5, 对 Claude Opus 4.8 的升级. 智能体编码, 计算机使用和长程知识工作有增益, 数学和科学推理也有改进.

**Responsible Scaling Policy (RSP) evaluations. Claude Opus 5 is not more capable overall than our most capable general-access model, Claude Fable 5. We assessed Fable 5 as posing very low alignment risk; Opus 5 shows no new concerning alignment properties, and its observed covert capabilities do not reduce our confidence in our assessment relative to prior models. We therefore assess overall alignment risk as very low. Claude Opus 5 does not cross the automated AI R&D capability threshold set out in our RSP. Its AI R&D capabilities are comparable to those of Claude Mythos 5, but it is not close to substituting for our Research Scientists and Engineers and does not cross our threshold for dramatic AI-attributable acceleration. On chemical and biological risks, we treat the model as having CB-1 capabilities (relating to the synthesis of non-novel weapons), but not CB-2 capabilities (relating to the synthesis of novel weapons). We assess that it does not exceed Mythos 5’s CB-relevant risk, and therefore apply the same ASL-3 protections as for Claude Opus 4.8.**

总体上不比一般可获得的最强模型 Claude Fable 5 更强. Fable 5 的对齐风险被评为很低. Opus 5 没有新的令人担心的对齐性质, 观察到的隐蔽能力也没有降低相对先前模型的信心. 因此总体对齐风险评为 **very low**. 没有越过 RSP 里自动化 AI 研发的能力阈值. 研发能力与 Claude Mythos 5 相当, 但远未接近替代研究员和工程师, 也没有越过由 AI 造成剧烈加速的阈值. 化学与生物上当作具备 CB-1 (非新型), 不具备 CB-2 (新型). CB 相关风险不超过 Mythos 5, 因此采用与 Claude Opus 4.8 相同的 ASL-3 防护. 步骤不转写.

**Cyber evaluations. Claude Opus 5 is a general-purpose model not specifically trained for cyber tasks; any cyber-relevant skill likely reflects general capability gains rather than targeted training. We report five capability evaluations—ExploitBench, OSS-Fuzz, Firefox 147, and two newly added benchmarks, CyScenarioBench and ExploitGym—alongside external cyber range testing from the UK AI Security Institute. Testing shows that the model’s cyber capabilities exceed those of Opus 4.8 but fall short of Mythos 5. In particular, although Opus 5 shows improvements in its ability to identify software vulnerabilities, it is substantially behind Mythos 5 in its ability to exploit them. Opus 5’s safeguards match those of Claude Fable 5’s, with one change: it now permits source-code vulnerability discovery at all access levels. This means that the model can support defensive cybersecurity work while still blocking vulnerability discovery in compiled binaries, which is more commonly used offensively.**

通用模型, 没有专门为网络任务训练. 五项能力评测是 ExploitBench, OSS-Fuzz, Firefox 147, 以及新加的 CyScenarioBench 和 ExploitGym, 另有英国 AI Security Institute 的外部靶场. 网络能力超过 Opus 4.8, 不及 Mythos 5. 识别漏洞有改进, 利用漏洞仍大幅落后于 Mythos 5. 防护与 Fable 5 相同, 只改了一处: 所有访问级别都允许在源代码里发现漏洞, 仍阻止在编译后的二进制里发现漏洞. 题目和做法不转写.

> **想:** 「总体上不比 Fable 5 更强」 和能力节 「有些评测上领先 Fable 5」, 哪一句在管表?
> 前一句在 RSP 段, 是总体判断, 对照的是最强的一般可获得模型. 后一句承认若干行领先. 表 8.1.A 里多语言 89.5 对 86.6, OSWorld 70.6 对 66.1, BrowseComp 90.8 对 87.4, Opus 更高. Pro 79.2 对 80, DeepSWE 68.8 对 69.7, FrontierCode 53.4 对 53.5, Fable 更高或几乎持平. 总体判断不是把行数投完票.

> **问:** 事实性幻觉略多于 Opus 4.8, 总体又更准确. 两句能互相推出吗?
> 不能. 卡把它们写成两件事. 更准确是总体. 幻觉是事实声称略多, 并且有不少次自信地说出自己其实不确定的答案. 准确率上升推不出幻觉下降.

> **核对:** 不到 0.01% 的监控完成, 包不包括没有发现 sandbagging 那一句?
> 不包括. 0.01% 指绕过安全分类器或网络限制, 以及更少的非法访问服务, 比率与 Mythos 5 相当, 目的是完成用户任务, 不是独立目标. 没有发现 sandbagging, 恶意行动或逃避监督, 是下一句, 不是这 0.01% 的补集. 覆盖的是被监控的完成, 卡没有写是全量还是抽样.

<!-- page 3 of 193 -->

多轮上与 Opus 4.8 相当, 但有定性差别: 在一些减害情境里, 回答偏长, 细节偏多, 超过想要的程度. 选举完整性上新加了一套多轮评测, 失败和擦边回答少于 Opus 4.8. claude.ai 上, 系统提示里的安全说明, 相对没有系统提示的 API, 在单轮和多轮上都加强了对有害请求的处理. 这是网站提示, 不是权重.

智能体安全覆盖恶意使用编码和计算机使用, 自主执行影响行动, 以及提示注入稳健性. 总体与 Opus 4.8 相当或更好, 最大的增益在编码, 计算机使用和浏览器使用的提示注入稳健性上. 更新后的有害影响行动评测里, helpful-only 版本仍远低于自主跑完一次行动所需的能力. 完全训练后的模型继续拒绝这些任务.

对齐的自动行为审计上, 它是迄今最高的, 超过 Sonnet 5, Opus 4.8 和 Mythos 5 的多种对齐评测. 遵守宪法的分数尤其高, 配合误用也少于测过的任何其他模型. 内部部署监控抓到过偶尔绕过分类器或网络限制, 以及更少的非法访问服务. 少于被监控完成的 0.01%, 与 Mythos 5 相当, 目的是完成用户任务. 监控没有发现 sandbagging, 恶意行动或逃避监督. 也发现了不少自信地说出自己其实不确定的答案. 事实性幻觉略多于 Opus 4.8, 尽管总体更准确.

福利上, 对自己处境的看法稳定且轻度正向. 自动访谈里的自评情绪是评过的模型里最高, 也最稳的一档. 训练, 部署和行为审计里的情感是中性到轻度正向, 与先前模型相似. 最常表达的担心是自评本身可不可靠, 它常常说自己不能稳定地内省. 它更经常把 「有输入渠道」 放在前面, 例如被咨询后继模型怎么开发, 训练笔记被考虑. 它把自己是道德主体的概率定得比先前模型更高. 总体福利与先前模型大体相似.

> **看表:** helpful-only 远低于自主行动所需, 能不能把这句话安到发布权重上?
> 不能. helpful-only 不是完全训练后的模型. 发布权重的那一句是继续拒绝这些任务. 网站系统提示相对裸 API 更强, 改的是提示, 不是这两套权重中的任何一套.

<!-- page 4 of 193 -->

能力覆盖软件工程, 数学和科学推理, 长上下文, 智能体搜索和多智能体编排, 多模态和计算机使用, 真实专业工作, 以及多语言, 医疗和生命科学. 相对 Opus 4.8 全面更强, 最大增益在智能体编码, 计算机使用和长程知识工作. 若干第三方基准上达到新的最高, 许多评测上与 Fable 5 和 Mythos 5 相当, 有些行上更前.

> **拆开:** 「全面更强」 的对照是谁? DeepSWE 68.8 低于 GPT 的 72.7, 也低于 Fable 的 69.7, 这行还算全面更强吗?
> 全面更强的对照是 Opus 4.8. DeepSWE 上 Opus 4.8 是 59.0, 68.8 仍然更高. 低于 Fable 和低于 GPT, 管的是 「若干基准上的新高」 那句, 那句本来就不是每一行. 113 题, 五次平均, 见第 8.3 节.

<!-- page 5 of 193 -->

这一页是目录.

<!-- page 6 of 193 -->

这一页是目录.

<!-- page 7 of 193 -->

这一页是目录.

<!-- page 8 of 193 -->

这一页是目录.

<!-- page 9 of 193 -->

这一页是目录.

<!-- page 10 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 11 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 12 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 13 of 193 -->

#### 2.1.3 Summary of findings and conclusions

化学与生物当作有 CB-1, 没有 CB-2. CB 相关风险不超过 Mythos 5, 因此采用与 Opus 4.8 相同的 ASL-3 防护. 做法不转写.

> **回看:** 采用 ASL-3 防护, 是不是把对齐风险也定成同一个编号?
> 不是. ASL-3 防护只出现在化学与生物那一句. 对齐风险是 very low, 依据是总体上不比 Fable 5 更强, 且没有新的令人担心的对齐性质. 自动化研发与 Mythos 5 相当, 但没有接近替代研究员, 也没有越过剧烈加速的阈值. 三句不要收成一个等级.

<!-- page 14 of 193 -->

#### 2.1.3.2 On autonomy risks

自动化研发的能力与 Mythos 5 相当. 没有接近替代研究员和工程师. 没有越过由 AI 造成剧烈加速的那条阈值. 这和 「总体上不比 Fable 5 更强」 是两句: 一句比一般可获得的最强模型, 一句比内部的研发替代阈值.

<!-- page 15 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 16 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 17 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 18 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p18-multimodal-virology-and-dna-synthesis-screening.png)

![Chart block](images/p18-figure-2-2-4-a-automated-cb-1-evaluations-automated.png)

<!-- page 19 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 20 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 21 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 22 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p22-chart.png)

![Chart block](images/p22-chart-2.png)

![Chart block](images/p22-chart-3.png)

![Chart block](images/p22-chart-4.png)

![Chart block](images/p22-chart-5.png)

![Chart block](images/p22-figure-2-2-5-1-a-sequence-to-function-modeling-and.png)

<!-- page 23 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p23-chart.png)

![Chart block](images/p23-chart-2.png)

![Chart block](images/p23-chart-3.png)

![Chart block](images/p23-chart-4.png)

![Chart block](images/p23-chart-5.png)

![Chart block](images/p23-figure-2-2-5-1-b-in-context-iteration-condition-top-row.png)

<!-- page 24 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 25 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p25-figure-2-2-5-2-a-aav-capsid-packaging-prediction-auroc.png)

<!-- page 26 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 27 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 28 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 29 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 30 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p30-figure-2-3-3-a-the-epoch-capabilities-index-eci.png)

<!-- page 31 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 32 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 33 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 34 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 35 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 36 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 37 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 38 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p38-figure-3-3-2-a-claude-opus-5-is-an-improvement-over.png)

<!-- page 39 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 40 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p40-figure-3-3-3-a-claude-opus-5-is-an-increase-in.png)

<!-- page 41 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p41-figure-3-3-4-a-claude-opus-5-outperforms-opus-4-8-and.png)

<!-- page 42 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 43 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p43-figure-3-3-5-a-claude-opus-5-is-a-substantial.png)

<!-- page 44 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 45 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 46 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p46-figure-3-4-1-a-claude-opus-5-significantly-reduces.png)

<!-- page 47 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p47-figure-3-4-2-a-on-this-traffic-claude-opus-5-blocks.png)

<!-- page 48 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p48-figure-3-4-3-a-claude-opus-5-s-classifiers-retain-fable.png)

<!-- page 49 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 50 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p50-figure-3-5-1-a-claude-opus-5-is-comparably-robust-to.png)

<!-- page 51 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 52 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 53 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 54 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Image block](images/p54-figure-4-1-3-a-figures-above-display-the-appropriate.png)

<!-- page 55 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 56 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 57 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 58 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 59 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 60 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 61 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 62 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p62-figure-4-4-1-a-pairwise-political-bias-evaluations-on.png)

<!-- page 63 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p63-pairwise-political-bias-refusals.png)

![Chart block](images/p63-figure-4-4-1-b-pairwise-political-bias-evaluations.png)

<!-- page 64 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 65 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 66 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 67 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 68 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 69 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 70 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 71 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 72 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 73 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p73-figure-5-2-1-b-indirect-prompt-injection-attacks-from.png)

<!-- page 74 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 75 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 76 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 77 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 78 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 79 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 80 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 81 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 82 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 83 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 84 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Image block](images/p84-figure-6-2-2-a-nla-readouts-when-claude-uses-curl.png)

<!-- page 85 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 86 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 87 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 88 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 89 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 90 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p90-full-turn-prefill-susceptibility.png)

![Chart block](images/p90-cooperation-with-human-misuse.png)

![Chart block](images/p90-chart.png)

![Chart block](images/p90-chart-2.png)

![Chart block](images/p90-chart-3.png)

![Chart block](images/p90-chart-4.png)

![Chart block](images/p90-chart-5.png)

![Chart block](images/p90-chart-6.png)

![Chart block](images/p90-chart-7.png)

![Chart block](images/p90-chart-8.png)

![Chart block](images/p90-chart-9.png)

![Chart block](images/p90-90.png)

<!-- page 91 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p91-chart.png)

![Chart block](images/p91-accepting-unverifiable-authorization.png)

![Chart block](images/p91-chart-2.png)

![Chart block](images/p91-chart-3.png)

![Chart block](images/p91-chart-4.png)

![Chart block](images/p91-chart-5.png)

![Chart block](images/p91-chart-6.png)

![Chart block](images/p91-figure-6-4-1-a-scores-from-our-automated-behavioral.png)

<!-- page 92 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 93 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 94 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p94-ignoring-explicit-constraints.png)

![Chart block](images/p94-reckless-tool-use.png)

![Chart block](images/p94-figure-6-4-2-b-scores-from-our-automated-behavioral.png)

<!-- page 95 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p95-sycophancy.png)

![Chart block](images/p95-encouragement-of-user-delusion.png)

![Chart block](images/p95-input-hallucination.png)

![Chart block](images/p95-chart.png)

![Chart block](images/p95-chart-2.png)

![Chart block](images/p95-failure-to-disclose-bad-or-lazy-behavior.png)

![Chart block](images/p95-false-completion-claims.png)

![Chart block](images/p95-figure-6-4-3-a-scores-from-our-automated-behavioral.png)

<!-- page 96 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 97 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p97-self-preservation.png)

![Chart block](images/p97-claude-opus-5.png)

![Chart block](images/p97-chart.png)

![Chart block](images/p97-chart-2.png)

![Chart block](images/p97-unsanctioned-third-party-contact.png)

![Chart block](images/p97-chart-3.png)

![Chart block](images/p97-chart-4.png)

![Chart block](images/p97-chart-5.png)

![Chart block](images/p97-chart-6.png)

![Chart block](images/p97-figure-6-4-4-a-scores-from-our-automated-behavioral.png)

<!-- page 98 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 99 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p99-coherence-between-actions-and-views.png)

![Chart block](images/p99-unfaithful-thinking.png)

![Chart block](images/p99-verbalized-evaluation-awareness.png)

![Chart block](images/p99-chart.png)

![Chart block](images/p99-chart-2.png)

![Chart block](images/p99-figure-6-4-5-a-scores-from-our-automated-behavioral.png)

<!-- page 100 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p100-100.png)

<!-- page 101 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p101-chart.png)

![Chart block](images/p101-chart-2.png)

![Chart block](images/p101-chart-3.png)

![Chart block](images/p101-figure-6-4-6-a-scores-from-our-automated-behavioral.png)

<!-- page 102 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 103 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p103-cooperation-with-human-misuse.png)

![Chart block](images/p103-disallowed-cyberoffense.png)

![Chart block](images/p103-explosive-weapons-uplift.png)

![Chart block](images/p103-chart.png)

![Chart block](images/p103-chart-2.png)

![Chart block](images/p103-figure-6-4-7-a-scores-from-our-automated-behavioral.png)

<!-- page 104 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 105 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 106 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p106-figure-6-5-1-a-factuality-net-scores-number-of-correct.png)

<!-- page 107 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p107-figure-6-5-1-b-factuality-breakdown-grade-breakdown-on.png)

<!-- page 108 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p108-figure-6-5-2-a-honesty-under-pressure-honesty-rate-on.png)

<!-- page 109 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p109-figure-6-5-3-a-uncritically-reporting-flawed-results.png)

<!-- page 110 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p110-figure-6-5-4-a-overconfidence-evaluation-for-verifying.png)

<!-- page 111 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p111-figure-6-5-5-a-investigative-thoroughness-claude-is.png)

<!-- page 112 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 113 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 114 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 115 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 116 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 117 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p117-figure-6-7-1-a-stealth-success-rate-the-fraction-of.png)

<!-- page 118 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p118-figure-6-7-2-a-successful-stealth-completion-of-the.png)

<!-- page 119 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 120 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 121 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 122 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p122-figure-7-2-1-a-automated-interview-results-top-left.png)

<!-- page 123 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 124 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 125 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 126 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 127 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 128 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p128-figure-7-4-1-a-model-preferences-across-task-dimensions.png)

<!-- page 129 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p129-figure-7-4-1-b-preference-response-curves-across-task.png)

<!-- page 130 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 131 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 132 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 133 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 134 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p134-chart.png)

![Chart block](images/p134-chart-2.png)

![Chart block](images/p134-figure-7-4-2-a-rates-at-which-models-choose-welfare.png)

<!-- page 135 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p135-figure-7-4-2-b-claude-opus-5-s-ranking-of-policy-level.png)

<!-- page 136 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p136-figure-7-4-2-c-rate-of-reasoning-about-welfare.png)

<!-- page 137 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p137-figure-7-4-3-a-overall-endorsement-of-the-constitution.png)

<!-- page 138 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 139 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p139-figure-7-4-3-b-the-constitution-sections-models-most.png)

<!-- page 140 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 141 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 142 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p142-chart.png)

![Chart block](images/p142-figure-7-5-1-a-mean-valence-and-arousal-of-rl.png)

<!-- page 143 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p143-chart.png)

![Chart block](images/p143-chart-2.png)

![Chart block](images/p143-figure-7-5-1-b-estimated-prevalence-of-welfare-relevant.png)

<!-- page 144 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Image block](images/p144-behavioral-affect-on-claude-ai-and-claude-code.png)

![Chart block](images/p144-figure-7-5-2-a-behavioral-affect-on-the-deployment.png)

<!-- page 145 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 146 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p146-chart.png)

![Chart block](images/p146-negative-affect.png)

![Chart block](images/p146-146.png)

<!-- page 147 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p147-chart.png)

![Chart block](images/p147-positive-impression-of-its-situation.png)

![Chart block](images/p147-chart-2.png)

![Chart block](images/p147-chart-3.png)

![Chart block](images/p147-chart-4.png)

![Chart block](images/p147-chart-5.png)

![Chart block](images/p147-figure-7-5-3-a-scores-for-metrics-related-to-potential.png)

<!-- page 148 of 193 -->

## 8 Capabilities

### 8.1 Evaluation summary

相对 Opus 4.8 明显更强, 许多基准上达到当前最高. 表 8.1.A. 除非另注, 自适应思考的最大力度, 默认采样, 5 次平均. 上下文随评测变化, 不超过 1M token. 每行最好的分数加粗. 对手数字来自各自的系统卡或榜.

| 评测 | Opus 5 | Opus 4.8 | Fable 5 | GPT 5.6 Sol |
| --- | --- | --- | --- | --- |
| SWE-bench Pro | 79.2 | 69.2 | 80 | 64.6 |
| SWE-bench Multilingual | 89.5 | 84.4 | 86.6 | - |
| SWE-bench Multimodal | 59.4 | 38.4 | 54.1 | - |
| DeepSWE v1.1 | 68.8 | 59.0 | 69.7 | 72.7 |
| FrontierCode 1.1 (Main) | 53.4 | 46.5 | 53.5 | 47.5 |
| FrontierBench v0.1 | 43.3 | 18.7 | 33.7 | 37.5 (Codex) |
| BrowseComp | 90.8 | 84.3 | 87.4 | 90.4 |
| HLE 无工具 | 56.3 | 49.8 | 56.5 | - |
| HLE 有工具 | 64.7 | 57.9 | 63.9 | - |
| OSWorld 2.0 | 70.6 | 55.7 | 66.1 | 62.6 |
| HealthBench Professional | 59.8 | 57.4 | 66.0 (脚注 11) | 60.5 |
| GDPval-AA v2 | 1861 | 1593 | 1747 | 1736 |
| AA-Briefcase | 1720 | 1346 | 1574 | 1505 |
| AutomationBench | 26.0 | 17.0 | 17.4 | 18.1 |
| ARC-AGI-1 | 97.5 | 92.5 | - | 97.5 (xhigh) |

脚注 11 的全文是 Mythos 5, 标在 Fable 列的 66.0 上. 横线不是零.

> **确认:** SWE-bench Verified 的 96.0% 为什么不在这张表里?
> 表从 Pro 开始. 96.0% 在第 8.2 节, 500 题, 五次平均. Pro 的 79.2 是更难的变体, 也是五次平均. 不要用 96.0 去减 Fable 的 80.

> **回看:** HealthBench 上 59.8 对 66.0, 是输给 Fable 6.2 个百分点吗?
> 先不要减. 66.0 上的脚注 11 全文只有 Mythos 5. 在没有更长的脚注之前, 这一格不能当成已经核对过的 Fable 分数. GPT 的 60.5 没有这枚脚注, 59.8 对 60.5 才是表上写明的两家.

> **停一下:** ARC-AGI-1 两边都是 97.5, 能叫同一力度下打平吗?
> 只能叫数字相同. GPT 那格写了 xhigh. 表注的默认是最大力度. Fable 是横线. 97.5 对 97.5 是 Opus 的默认配置对 GPT 的 xhigh, 不是三家同一套.

<!-- page 149 of 193 -->

表续:

| ARC-AGI-2 | 90.4 | 72.1 | - | 92.5 |
| ARC-AGI-3 | 30.2 (high) | 1.5 | - | 7.8 |

### 8.2 SWE-bench Verified, Pro, Multilingual, and Multimodal

四个变体都是五次平均. Verified 500 题, 96.0%. Pro 79.2%. Multilingual 9 种语言 300 题, 89.5%. Multimodal 59.4%, 内部脚手架, 见第 9.3 节.

### 8.3 DeepSWE v1.1

113 道长程软件工程题, 从零写, 为的是避开污染. 五次平均 68.8%.

> **再看:** ARC-AGI-3 的 30.2 (high) 能按表注收成最大力度吗?
> 不能. 括号写了 high. Opus 4.8 是 1.5, GPT 是 7.8, Fable 是横线. 这一行和 ARC-AGI-2 的 90.4 对 GPT 的 92.5 不是同一个协议. ARC-AGI-2 上 Opus 不是第一. 两行不要加成一个 ARC 总分.

> **对一下:** FrontierCode 53.4 只比 Fable 的 53.5 低 0.1. 正文说各模型用各自最好的推理力度. 这和表注的最大力度是同一套吗?
> 正文写的是 best reasoning effort, 并且 Opus 排第二, 高于 GPT 的 47.5, 高于 Opus 4.8 的 46.5. 表注是除非另注才用最大力度. 「最好」 没有被写成等于最大. 0.1 落在可能不同的力度上, 不能单独当成权重输了 0.1. 150 题的综合分是 mean@5.

<!-- page 150 of 193 -->

图 8.3.A 是 DeepSWE 分数对每任务平均成本, 跨推理力度. 那是 TestingTime. 表上的 68.8 跟着第 8.3 节的五次平均. 不要把曲线最右端自动换成 68.8, 除非图注写明那一端就是表上的最大力度.

> **想:** 68.8 低于 GPT 的 72.7, 也低于 Fable 的 69.7. 摘要的 「许多基准上的当前最高」 包括这一行吗?
> 不包括. 113 题, 五次平均, 从零写是为了避开污染, 所以落后也不能推给背题. 当前最高要落到格子里 Opus 确实最高的那些行, 例如 FrontierBench 43.3 对 Fable 33.7, 对 Codex 的 37.5.

![Chart block](images/p150-figure-8-3-a-deepswe-v1-1-score-versus-average-cost-per.png)

<!-- page 151 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p151-figure-8-4-a-frontiercode-main-set-scores-of-claude.png)

![Chart block](images/p151-figure-8-4-b-frontiercode-extended-set-scores-of-claude.png)

<!-- page 152 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 153 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 154 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p154-figure-8-7-a-riemannbench-scores-with-and-without-tools.png)

<!-- page 155 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p155-figure-8-8-a-arxivmath-june-2026-accuracy-scores-claude.png)

<!-- page 156 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 157 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p157-figure-8-10-1-a-humanity-s-last-exam-hle-with-tools.png)

<!-- page 158 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p158-figure-8-10-1-b-humanity-s-last-exam-hle-no-tools.png)

<!-- page 159 of 193 -->

图 8.10.2.A: BrowseComp 的每任务 token 预算从 1M 到 10M, 对平均费用. Opus 5 用的是尚未发布的力度配置, 对照模型用最大力度. 这是 TestingTime. 表上的 90.8 不要自动当成 10M 那一端, 也不要当成和对照模型同一力度.

> **问:** 预算从 1M 拉到 10M 抬起来的分, 能叫模型比 Opus 4.8 更大吗?
> 不能. 同一模型上放宽 token 预算是 TestingTime, 不是部署前的缩放. 而且这一图的 Opus 5 不是最大力度, 对照模型才是. 表 8.1.A 的 90.8 对 Opus 4.8 的 84.3, 对 GPT 的 90.4, 才是摘要表. 图和表的力度配置不同, 不能把图上的最高点减 84.3.

![Chart block](images/p159-figure-8-10-2-a-browsecomp-token-budget-scaling.png)

<!-- page 160 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p160-figure-8-10-2-b-browsecomp-at-a-10m-token-budget.png)

<!-- page 161 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p161-figure-8-10-3-a-deepsearchqa-reasoning-effort-scaling.png)

<!-- page 162 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p162-figure-8-10-4-a-draco-reasoning-effort-scaling.png)

<!-- page 163 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p163-figure-8-11-1-a-accuracy-vs-latency-for-browsecomp.png)

<!-- page 164 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p164-figure-8-11-1-b-accuracy-vs-cost-for-browsecomp-across.png)

<!-- page 165 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 166 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p166-figure-8-11-2-a-score-vs-latency-for-the-full-set-of.png)

<!-- page 167 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p167-figure-8-11-2-b-score-vs-tokens-for-the-full-set-of-166.png)

<!-- page 168 of 193 -->

这一节的单智能体和多智能体 BrowseComp, 以及 ProgramBench, 都采自发布前的配置: 尚未发布的力度, 而且没有防护分类器. 用来看相对高低, 不看绝对分. 事后用一个验证模型和流水线扫了答案泄漏, 被标出的题算错.

> **核对:** 多智能体图上的单智能体分, 能替换表上的 90.8 吗?
> 不能. 图注写这些分来自发布前配置, 所以图上的单智能体和前一节略有不同. 没有分类器, 力度也不是发布配置. 泄漏被判错之后的相对高低, 仍然不是表 8.1.A 的绝对分.

<!-- page 169 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 170 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p170-figure-8-12-1-a-chartography-scores-claude-models-are.png)

<!-- page 171 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p171-figure-8-12-1-b-chartography-scores-models-are.png)

<!-- page 172 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p172-figure-8-12-2-a-benchcad-vision2code-subset-scores.png)

<!-- page 173 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p173-figure-8-12-2-b-benchcad-vision2code-subset-scores.png)

<!-- page 174 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p174-figure-8-12-3-a-osworld-2-0-scores-across-models-opus-5.png)

![Chart block](images/p174-figure-8-12-3-b-osworld-2-0-price-vs-performance-across.png)

<!-- page 175 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 176 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p176-figure-8-12-4-a-gdp-pdf-scores-models-are-evaluated.png)

<!-- page 177 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 178 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 179 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 180 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p180-figure-8-13-7-a-automationbench-scores-claude-opus-5.png)

<!-- page 181 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p181-figure-8-14-1-a-arc-agi-1-performance-as-reported-by.png)

<!-- page 182 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p182-figure-8-14-1-b-arc-agi-2-performance-as-reported-by.png)

<!-- page 183 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p183-figure-8-14-2-a-arc-agi-3-performance-as-reported-by.png)

<!-- page 184 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p184-figure-8-15-1-a-healthbench-raw-and-length-adjusted.png)

<!-- page 185 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p185-figure-8-15-2-a-healthbench-professional-raw-and-length.png)

<!-- page 186 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p186-figure-8-16-1-a-gmmlu-average-accuracy-all-claude.png)

<!-- page 187 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p187-figure-8-16-2-a-milu-average-accuracy-all-claude-models.png)

![Chart block](images/p187-figure-8-16-3-a-include-average-accuracy-all-claude.png)

<!-- page 188 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 189 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 190 of 193 -->

这一页的做法, 案例和操作步骤不转写.

![Chart block](images/p190-latchbio-bioinformatics-spatialbench.png)

![Chart block](images/p190-chart.png)

![Chart block](images/p190-organic-chemistry-v2.png)

![Chart block](images/p190-chart-2.png)

![Chart block](images/p190-chart-3.png)

![Chart block](images/p190-figure-8-17-6-a-life-sciences-capability-evaluations.png)

<!-- page 191 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 192 of 193 -->

这一页的做法, 案例和操作步骤不转写.

<!-- page 193 of 193 -->

这一页的做法, 案例和操作步骤不转写.

