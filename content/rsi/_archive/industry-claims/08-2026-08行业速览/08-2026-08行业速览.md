---
title: RSI 行业动态速览（2026-08）：Karpathy 入局、Pichai 泼冷水、Cotra 里程碑框架
category: RSI · 行业动态
published: false
excerpt: >-
  2026-08 行业速览：Karpathy Auto-Research 开源并加入 Anthropic 预训练团队；Adaption
  AutoScientist 冲全尺寸训练闭环；Pichai 泼冷水「还没到下一个量级」；CSET 专家分裂；Ajeya Cotra 给出
  adequacy→parity→supremacy 三级里程碑；国内不喊 RSI 但 DeepSeek 们已摸到边。
tags:
  - RSI
  - Karpathy
  - Auto-Research
  - Adaption
  - Ajeya Cotra
  - CSET
  - 行业动态
---
# RSI 行业动态速览（2026-08）：Karpathy 入局、Pichai 泼冷水、Cotra 里程碑框架

> 主要来源：36氪《让AI自我构建的RSI火了，Google泼冷水，DeepSeek们摸到了边》（2026-08-12，作者雷科技）
> https://m.36kr.com/p/3838267106966404

## 谁在 All in RSI

- **Karpathy Auto-Research**：用智能体集群训练语言模型，让模型自己做研究任务、自我改进；当前在 GPT-2 级小模型上迭代（本人坦言「还不是突破性研究」），代码公开在 GitHub（karpathy/autoresearch，2026-03 起）。**关键动向：Karpathy 已加入 Anthropic 预训练团队**——Claude + auto-research 方法论一旦跑通，就是大模型+自训练循环的实战化。
- **Adaption AutoScientist**：目标更激进，直接自动化**全尺寸前沿模型**的训练闭环；与 Karpathy 的「底层逐块验证、开源攒势能」形成两种路线对比。
- **Recursive Superintelligence**（Richard Socher 等 8 位联创）：主张「研究的构思、实现、验证全部自动完成」，详见库内公司笔记。

## 唱反调的声音

- **Sundar Pichai（Google CEO）**：RSI 是一个连续体、大家都在进步；但按大众描述的方式，那是「下一个量级的加速」，**我们还没到那一步**。
- **CSET（Georgetown）专家研究**：评估明显分裂——一部分预期「超级智能爆炸」，另一部分预期进展慢、最终触达瓶颈；唯一共识是**递归让未来格外难以预测**。
- **Anthropic 内部 Mythos 调查**：18 位工程师中 5 位认为改进配套系统后 Mythos 可替代 L4 工程师；但弱点明确：模糊任务管理、组织优先级、品味、验证、指令遵循、认识论——**恰恰是自我驱动（RSI 根基）薄弱的地方**。同月也有「Claude Code 写了团队近 100% 代码」的说法（字面意义的 AI 在写自己）。

## Ajeya Cotra（METR）的 RSI 里程碑框架

最好用的分析框架，类比自动驾驶 L2-L5：

1. **adequacy（足够）**：把人类完全移除后，系统依然能做研究——哪怕不如人类，但能运转。
2. **parity（对等）**：AI 独立研究质量与人类独立研究相当。
3. **supremacy（超越）**：AI 独立系统表现超过人类+AI 协作系统。

- Cotra 判断：**离第一级已经很近**；第二级没有时间表，但**一旦到第二级，一年内可能冲到第三级**。
- 理由：第二级的 AI = 不需要睡觉/开会/对齐 KPI 的研究团队，24 小时不间断试-改-再试；人类深度工作时间一天仅几小时，瓶颈一旦消失，加速度断崖式上升。

## 国内：没人喊 RSI，但 DeepSeek 们已摸到边

- 国内厂商很少公开喊 RSI（「递归超级智能」写进公司使命在国内几乎不可想象），但「让 AI 改进自己」的实际动作已在不同层面展开。
- 阻碍不止技术：优质数据变少、出口管制与技术脱钩把 AI 研究切成互不流通的圈子——RSI 还需要一个足够开放的世界，这个前提技术圈说了不算。

## 一条时间线的观察

预训练（「参数崇拜」）→ RLHF（「价值观可以微调」）→ RSI（「机器自己跑完整个研发链条」）：每一步都让人类从决策链条往后退一步，**而且这种退法是不可逆的**——一旦环节被自动化接管，人的直觉、经验、判断力在该环节会慢慢退化（作者比喻：不用 GPS 之后认路能力变差）。到那时，我们可能连工具是怎么造出来的都不一定能真正理解。
