---
title: SSI（Safe Superintelligence）与 TTT 路线：Ilya 的赌注
category: 公司
published: true
excerpt: >-
  SSI（Ilya Sutskever 2024 年创办）与 TTT 路线：2026-08 爆料其首个模型围绕 test-time training
  构建（边思考边更新权重），NVIDIA 7 月注资数十亿美元；技术参考指向 TTT-E2E 论文。未证实但多方吻合。
tags:
  - RSI
  - SSI
  - Ilya Sutskever
  - TTT
  - Test-Time Training
  - 公司
---
# SSI（Safe Superintelligence Inc.）与 TTT 路线：Ilya 的赌注

> 2026-08-12 整理。素材：aimidday.com（2026-08-13）、QbitAI、Bloomberg、NVIDIA 公告、arXiv TTT-E2E。

## 背景：Ilya 的预训练终结论

Ilya Sutskever 2024-12 公开称「预训练时代将终结」：互联网数据的增长终将放缓，继续堆数据不可持续。出路在于**让模型在推理/测试时能自我学习**——这是 SSI 与 TTT 路线的思想根基，也是「后预训练时代」最受关注的方向之一。

## SSI 公司

- **Safe Superintelligence Inc.**，2024-06 由 Ilya Sutskever（CEO）、Daniel Levy（前 OpenAI 优化团队负责人）、Daniel Gross 联合创办；2025-07 Gross 离职去 Meta Superintelligence Labs 任负责人。
- 团队极小、极度保密（"spend years on problems without publishable results"），对外极少发声。
- **NVIDIA 2026-07 注资数十亿美元**（据称经"rare access"考察后），与 Bloomberg 报道的 50 亿级别投资一致——侧面印证其 TTT 路线可信度。

## 2026-08 爆料：SSI 首个模型围绕 TTT 构建

- 8 月 13 日，X 账号「三只草莓」发帖：SSI 一直在围绕 **test-time training（TTT）** 构建一个小型推理引擎——模型**在解决任务过程中实时更新自己的部分权重**，而非预训练后定型。
- 逻辑是 TTT 经典卖点：**小模型 + 边干边学**，可以在远小于对手的算力下打平大模型。
- 据称：当前版本基本就绪；团队正以 10 倍规模扩展下一代；可能本月小范围开放（后续另有传闻称会推迟）。
- **技术参考论文指向 TTT-E2E《End-to-End Test-Time Training for Long Context》**——其作者列表是与 SSI 研究最公开的连接点。
- 状态：SSI 未评论，未证实。但爆料与此前 Ilya 所有公开言论、SSI 投资人合著论文、NVIDIA 注资三者高度吻合，被媒体评价为"要么是惊人一致的虚构，要么领域要迎来一种非常不同的模型"。

## 对 RSI 的意义

TTT 与 RSI 同属「模型动态更新」谱系：RSI 是 AI 改进 AI 的研发/训练/安全，TTT 是 AI 在推理时自我更新权重。若 SSI 的 TTT 模型为真，它将是从「预训练即定型」迈向「持续自我进化」的实证一步——这正是 RSI 叙事的底层技术支撑。

## 备注

- 爆料与传闻均未证实，引用需标注"unverified"。
- 关联：本库《田渊栋 & RSI 公司》同样押注"模型动态更新"（latent space 自我改进），两家可对比。
