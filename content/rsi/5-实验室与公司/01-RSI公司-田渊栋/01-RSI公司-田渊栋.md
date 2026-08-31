---
title: 田渊栋 & RSI 公司：6.5 亿美元押注「会自我进化的 AI」
category: 公司
published: true
excerpt: >-
  Recursive Superintelligence：2026 年初成立，6.5 亿美元首轮融资、投后估值 46.5 亿美元，GV/Greycroft
  领投、AMD/英伟达跟投，AWS 4 亿美元算力协议；8 位联创（Richard Socher、田渊栋、施天麟、Tim Rocktäschel、Alexey
  Dosovitskiy、Josh Tobin、Caiming Xiong、Jeff Clune）；押注 latent space 自我改进路线。
tags:
  - RSI
  - Recursive Superintelligence
  - 田渊栋
  - Richard Socher
  - latent space
  - Coconut
---
# 田渊栋 & RSI 公司：6.5 亿美元押注「会自我进化的 AI」

> 由原始调研笔记重建（2026-08-12）。素材：腾讯新闻（量子位转载）、钛媒体、NeurIPS 2025 论文、AGI Summit 2026 报道。

## 一、成立与融资

- **成立**：约 2026 年初成立，2026-05-13（美东时间）正式走出隐身模式亮相；田渊栋当天在 X 宣布以联创身份加入。成立仅六个月、团队不足 30 人。
- **融资**：首轮 **6.5 亿美元**，投后估值 **46.5 亿美元**；GV（谷歌风投）与 Greycroft 领投，AMD Ventures 与英伟达跟投。背景：田渊栋 2025-10 被 Meta 裁员（Meta 裁 AI 研究部门 1600 人，时任 FAIR 研究科学家总监的田渊栋在列），OpenAI/Anthropic 曾抛橄榄枝，他选择创业。
- **后续**：2026-07-29 与 AWS 签 **4 亿美元**多年期算力协议；CEO Richard Socher 称「这只是开始」。

## 二、8 位联创（「AI 梦之队」）

1. **Richard Socher（CEO）**：前 Salesforce 首席科学家、MetaMind 创始人、You.com 创始人。
2. **田渊栋**：原 Meta FAIR 研究科学家总监（「Llama 4 救火队员」），建过训练/后训练 agentic harness。
3. **施天麟（Tim Shi）**：清华姚班，曾任 Cresta CTO。
4. **Tim Rocktäschel**：Meta、Google DeepMind 出身，RL、世界模型、open-ended agent。
5. **Alexey Dosovitskiy**：ViT 一作之一。
6. **Josh Tobin**：OpenAI 早期员工，agent science 与工程。
7. **Caiming Xiong（熊蔡明）**：与 Socher 共事于 MetaMind，后任 Salesforce Research 高级管理。
8. **Jeff Clune**：DGM 作者，长期研究 open-endedness 与 AI scientist。

## 三、使命与技术哲学

- **使命**：打造能**自动发现知识、递归自我改进的 AI**，从根本上改变科学与技术的进步方式。
- **核心逻辑**（Socher）：「AI 就是代码。而现在，AI 已经能够编码。各项要素已经具备。」算力越多、数据越多，靠人手工设计的方法正一步步被 AI 自己驱动的方法取代——Recursive 要沿着这条路走到头。
- **进化论哲学**：人类智能由达尔文式生物进化 + 文化进化两个开放式过程共同创造；AI 科学同样遵循开放式创新，现在「接力棒该交到 AI 自己手上」。Socher 名言：「AI 之于生物学，就如同微积分之于物理学。」
- **运作方式**：AI 在开放式的自动化科学发现过程中模拟——自己提出实验想法、测试并验证结果；改进范围远超代码优化，包括自身代码、工具套件（harness）、训练/推理基础设施，形成无需持续人工监督的开放式循环。安全被摆在首位。

## 四、技术路线：latent space 自我改进

- **核心押注**：用 **latent token 取代语言 token**，让模型在 latent space 中思考（Coconut 连续思维链路线）——latent token 承载信息量高于语言 token，可同时保存几种思路并行存在，最后选出一条正确路径；用语言思考则必须把每条思路人工写出来，强制串行化。
- **理论支撑**：NeurIPS 2025《Reasoning by Superposition》（arXiv:2505.12514，田渊栋合著）证明「两个 Transformer + D 步连续思维链」即可解有向图可达性问题（D 为图的直径），而离散 CoT 常深度 Transformer 已知最好结果需 $O(n^2)$ 解码步；连续思维向量是叠加态，等价并行 BFS，且该机制训练中自动涌现。
- 田渊栋明确：CoT 不是错的、很实用，但「语言更多时候是一种解释工具，而不是思考本身」。

## 五、核心论述（访谈要点）

- **定义 RSI**：「用 AI 去优化 AI 自己的一些环节，让 AI 变强，然后再在新的基础上继续向上迭代。」
- **人类是瓶颈**：研究员受生理条件限制无法 100% 投入研究；第一步让 AI 替代繁重复劳动（一定可行），第二步自动发现新洞察，加速整个进程。
- **评估**：benchmark 只是实现目标的手段，「刷榜冲榜比较表层」；未来评估转向最终结果（人和 AI 结合后的产出是否真有用）。
- **可解释性评估前置**：训练一个模型要几千几万块卡，能在训练中早判断方向就能显著提高效率；安全也是核心问题。
- **时间线**：「我们大概还在 1 到 2、甚至可能是 0.5（假设人类能力边界为 10）。一旦越过人类边界，后面也许还有 100。」AI 证明非平凡定理的新闻越来越频繁。

## 六、AGI Summit 2026（投资人视角）

- 2026-07-18 旧金山，嘉加资本郑泓与田渊栋炉边对话（钛媒体报道）。投资人押注的是八位科学家的研究能力，以及「当 AI 开始参与创造更强的 AI，研究就不再只是产品诞生之前的成本，它可能就是产品本身」。

## 备注

- 官网 recursive.com 是 JS 渲染页，正文以搜索摘要为准。
- 关联：访谈见 [02](../02-田渊栋访谈/02-田渊栋访谈.md)；三层判定见 [第 1 章](../../1-坐标系与术语/1-坐标系与术语.md)。不要用专栏补机制数字。
