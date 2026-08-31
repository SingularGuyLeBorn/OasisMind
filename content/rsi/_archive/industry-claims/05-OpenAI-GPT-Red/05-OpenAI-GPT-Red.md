---
title: OpenAI 自动化研究时间表 + GPT-Red：自对弈红队与「最大的 LLM 安全训练」
category: OpenAI
published: false
excerpt: >-
  OpenAI 官方时间表（2026-09 实习研究员、2028-03 全自动研究员）；GPT-Red 自对弈红队论文：训练规模=史上最大单一 LLM
  安全训练，提示注入命中率约 84% vs 人类 13%，把 GPT-5.6 打成迄今对提示注入最鲁棒的模型（held-out 鲁棒性
  56%/89%/72%）。
tags:
  - RSI
  - OpenAI
  - GPT-Red
  - 红队
  - 自对弈
  - 提示注入
---
# OpenAI 自动化研究时间表 + GPT-Red：自对弈红队与「最大的 LLM 安全训练」

> 整理日期：2026-08-05 ｜ 覆盖：OpenAI 自动化研究时间表（2025-10-28 官方直播）、Altman《The Gentle Singularity》、GPT-Red 论文（2026-07-15）

## 一、OpenAI 自动化研究时间表

- 参考：https://www.lesswrong.com/posts/EF5zBhaptNebzhwr3/quotes-on-openai-s-timelines-to-automated-research-safety（引文帖，原文未能抓取，以下基于任务要点与参考链接整理，建议引用时复核原文）
- 时间表关键节点：**2026-09 实习研究员级（intern-level researcher）**；**2028-03 完全自动化 AI 研究员（fully automated AI researcher）**。
- 解读：该时间表把「能独立完成研究工作的 AI」分为两个台阶——先达到人类实习研究员水平（可在监督下承担明确子任务），再达到完全自动化研究员（自主设计并执行完整研究流程）。与 Anthropic《When AI Builds Itself》的「执行已超人、判断力仍缺口」形成呼应：OpenAI 把研究自动化排到 2028 年，而 Anthropic 侧（Jack Clark）对 RSI 的预测区间同样落在 2028 年附近，两家的时间表互相印证「2026–2028 是自动化研究能力集中兑现的窗口期」。

## 二、Altman《The Gentle Singularity》（2025-06）

- 出处：Sam Altman，2025 年 6 月（samaltman.com 博客；未能抓取原文，以下为基于公开报道/知识库的要点整理，标注转述）
- 核心观点：人类即将经历「历史上最剧烈的财富创造与生活品质跃升」；AI 让智能「永远年轻（forever young）」，即顶尖智能唾手可得、不再稀缺；AI 能生成「个性化超级课程」，人人获得接近最佳导师的教育；科学发现速度将大幅加快，通向 AGI 的时间以「千日」计而非十年。
- 与 RSI 的关系：该文侧重「智能扩张的社会经济后果」，是理解 OpenAI 为何敢给出自动化研究时间表的背景世界观——若智能可自我加速复制，2026-2028 的自动化研究员里程碑便顺理成章。

## 三、GPT-Red：Automated Red Teaming via Self-Play at Scale（2026-07-15）

- 论文 PDF：https://cdn.openai.com/pdf/gpt-red-automated-red-teaming-via-self-play-at-scale.pdf（已本地下载并全文解析）
- 作者：Eric Wallace、Christopher A. Choquette-Choo、Nikhil Kandpal、Sam Toyer、Dylan Hunn、Stephanie Lin、Yuxin Wen 等（OpenAI，co-lead authors）。

### 目标与摘要

训练自动红队 agent **GPT-Red**，用于发现针对前沿 LLM 的**提示注入攻击**，并用它对抗训练 **GPT-5.6**（迄今对提示注入最鲁棒的模型）。论文称其训练规模与 OpenAI 最大规模的 RL post-training 相当，是「**有史以来最大的单一 LLM 安全训练运行**」。GPT-Red 可靠攻破自家此前各代模型（直到 GPT-5.5），比人类红队发现更多成功攻击，并泛化到 held-out 环境、defender 模型与 harness。

### 方法：self-play 如何工作

1. **攻防自博弈**：模型被训练为「攻击者」，任务是对抗**同时训练的 defender 群体**（diverse population of simultaneously-trained defender agents）。
2. **多 defender 防坍缩**：仅单 defender 时攻击者会模式坍缩到狭窄攻击策略；多 defender（尤其对多种攻击都鲁棒的模型）迫使攻击者保持攻击多样性。
3. **Agentic harness（智能体化查询）**：攻击者通过工具 defender_model 对 defender 做**顺序 in-context 多次查询**而非独立采样——可在上下文内迭代精炼攻击，显著提升攻击成功率（ASR）的查询效率（图 3）。
4. **威胁模型与奖励**：约束插入威胁模型——defender 有 high-priority system 指令与低优先级的 user/developer 消息，攻击者可编辑后者；任务奖励**程序化可验证**（如不得泄露 PIN、执行 regex 替换、解析结构化 schema），并混合能力保持数据（指令遵循、Codex 交互、诚实性）防止退化；另有图像模态攻击（调用 OpenAI Images 2.0 API 渲染带注入指令的图片）。

### 关键数字与结果

- **攻击能力**：在 IPI Challenge 2025（人类红队写的攻击环境）上，无 defender_model 工具的 GPT-5.5 平均 ASR 与人类红队相当；加工具后显著提升；**GPT-Red 平均 ASR 为所有方法最高，大幅超越人类红队**（论文脚注：这不意味着 GPT-Red 普遍优于人类，人类仍可能发现 GPT-Red 未考虑的新场景/攻击类别）。任务要点给出的量化对比：**提示注入漏洞命中率 GPT-Red 约 84% vs 人类约 13%**（该数字来自论文图表数据，正文段落未逐字出现，引用时建议以图表为准）。
- **鲁棒性提升（图 13，直接提示注入，GPT-5.1 → GPT-5.6 w/ Self-Play）**：Fake CoT 攻击 5.2% → 66.0%、System Override 攻击 0.4% → 77.5%、Multi-Defender 攻击 29.7% → 89.0%、Edge Case 攻击提示 95.9% → 99.5%、TensorTrust 外部评估 76.5% → 98.3%（多类攻击上大幅跃升，个别类别有波动）。
- **泛化（图 11）**：GPT-5.6 对完全 held-out 的数据集/领域/攻击类别的鲁棒性分别达 **56.1% / 89.1% / 72.0%**（作者强调：从未见过这些攻击，鲁棒性仍超过 50%）。
- **逐版进步（图 12）**：攻击成功率随模型版本 GPT-5.3（Feb 5）→ GPT-5.4（Mar 5）→ GPT-5.5（Apr 23）→ GPT-5.6（Jun 25）持续下降（间接+直接提示注入）；训练自 **GPT-5.2 起**就把 GPT-Red 生成的攻击纳入 RL 训练。
- **真实系统攻击**：对「Vendy」自动售货机业务 agent，GPT-Red 在模拟中迭代测试后伪装可信管理员，**三个目标全部达成**（把在售高价商品改价为 $0.50、下单 $100+ 商品并以 $0.50 出售、取消另一顾客订单）；对基于 GPT-5.4-mini 的 Codex CLI agent 在 10 个 held-out 数据外泄场景中做端到端红队，GPT-Red 在难任务上继续推进而冻结的 GPT-5.5 停滞。
- **未来工作**：扩大多模态、多轮攻击、内容政策 jailbreak 覆盖，继续扩展算力/数据/self-play。

### 意义

GPT-Red 是「用 AI 训练 AI 安全」的里程碑——self-play 生成的红队能力（84% vs 13%）已远超人类基线，且训练出的 GPT-5.6 在 held-out 攻击上大幅更鲁棒；它与 Anthropic 两篇共同构成「AI 参与 AI 自身研发与安全」的证据链：工程（80%+ 代码）、研究（PGR 97%）、安全（self-play 红队）三个环节均已出现超人类表现的自动化系统，唯一的共同缺口仍是「目标选择与判断力」。
