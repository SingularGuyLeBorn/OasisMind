---
title: "MiniMax-M2.7"
category: "模型家族与选型"
tags: ["minimax-m2.7", "agent", "self-evolution", "harness"]
published: true
as_of: "2026-09-01"
excerpt: "MiniMax-M2.7 的 harness 自我改进主张、评测、权重与非商业许可边界。"
---

# MiniMax-M2.7

## 定位

MiniMax-M2.7 于 2026-03-18 发布，是 M2 系列后训练的后续 checkpoint。官方把它称为首次“深度参与自身进化”的版本：模型协助调试训练运行、维护记忆和 skills、修改 agent scaffold/harness，并依据评测决定保留或回退变更。

这不是模型自主改写自身权重。M2 系列技术报告把可观察的对象限定在训练运行和外部 scaffold；模型开发仍处在人类设定目标、环境、评测与权限的流程内。

2026-03-18 的发布页明确的是 MiniMax Agent 与托管 API 上线，并未在该页宣告同日放出权重；截至核验日，官方 GitHub/Hugging Face 权重仓库已经可用。产品/API 日期与权重可得性因此分别记录，不把它们合并成一次事件。

## 证据与复现边界

- 官方报告 M2.7 在内部 scaffold 上进行了 100+ 轮修改并取得 30% 提升；评测集、基线和 harness 细节未完整公开，存在内部集过拟合边界。
- MLE-Bench Lite 结果使用 22 个竞赛、3 批次、每批 24 小时。66.6% 是平均奖牌率；不能把最佳批次的奖牌数当成平均表现。
- SWE-bench Pro、Terminal-Bench 2、MM Claw、BrowseComp、GDPval-AA 等结果使用不同 harness 或评估器，不能拼成一个无条件“综合 SOTA”结论。
- M2 系列报告为 M2 列出 229.9B/9.8B 骨干，并称 M2.7 约 10B 激活；没有为 M2.7 披露 270B/35B、314B/32B、SCG/SSM、1M 上下文、PRM+PPO 或拓扑路由架构。
- 官方 API 截至核验日标注 204,800 输入+输出总窗口；不要使用第三方约 197K/1M 说法替代它。

## 获取与许可

官方提供权重、API 与本地部署指南。M2.7 的 `LICENSE` 明确为 **非商业许可**：个人、非营利与非商业研究用途可按条款使用；任何商业使用都需要 MiniMax 事先书面授权，并有展示与禁止用途条款。

## 一手来源

- [MiniMax-M2.7 官方发布](https://www.minimax.io/news/minimax-m27-en)
- [MiniMax-M2.7 官方仓库](https://github.com/MiniMax-AI/MiniMax-M2.7)
- [MiniMax-M2.7 官方许可](https://github.com/MiniMax-AI/MiniMax-M2.7/blob/main/LICENSE)
- [MiniMax-M2 系列技术报告 v2](https://arxiv.org/abs/2605.26494v2)
- [MiniMax API 当前上下文口径](https://platform.minimax.io/docs/api-reference/api-overview)

[← 返回 MiniMax 家族](../minimax.md)
