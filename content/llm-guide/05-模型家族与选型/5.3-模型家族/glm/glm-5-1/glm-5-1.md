---
title: "GLM-5.1"
category: "模型家族与选型"
tags: ["glm-5.1", "agentic engineering", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-5.1 的长时智能体后训练、200K 上下文、开放权重与 MIT 许可。"
---

# GLM-5.1

## 身份

GLM-5.1 于 2026 年 4 月 7 日发布，是 GLM-5 之后面向长时 Agent 工程的文本模型迭代。官方同时提供 API 与开放权重；模型卡继续引用 GLM-5 技术报告，但后训练和评测已更新，不能把它当作 GLM-5 的简单服务别名。

| 字段 | 官方口径 |
|---|---|
| 输入/输出 | 文本 → 文本 |
| 上下文 | 200K |
| API 最大输出 | 128K |
| 公开形态 | BF16/FP8 开放权重与托管 API |
| 权重许可 | MIT；模型仓库已有完整 LICENSE |

## 长时能力该怎样读

官方发布说明称 GLM-5.1 面向最长约 8 小时的单次独立工作，并强化规划、持续执行、修错和策略迭代。这是特定 Agent 框架、任务集和预算下的产品/评测结论，不是对任意任务连续可靠 8 小时的 SLA。生产验证至少要记录：中途失败、重复副作用、上下文漂移、工具错误恢复、人工接管点和总成本。

官方资料把改进归于多轮 SFT、强化学习和过程质量评估。没有一手材料支持具体训练阶段比例、学习率或数据集规模，这些字段应保持未知。

## 部署与许可

开放权重允许私有部署，但体量仍属于 GLM-5 大型 MoE 级别；激活参数不能代替完整权重容量规划。权重 MIT、GitHub 推理代码 Apache-2.0、托管 API 服务条款三者应分别记录。

## 一手来源

- [GLM-5.1 官方模型卡](https://huggingface.co/zai-org/GLM-5.1)
- [GLM-5.1 权重 LICENSE](https://huggingface.co/zai-org/GLM-5.1/blob/main/LICENSE)
- [GLM-5.1 官方发布页](https://z.ai/blog/glm-5.1)
- [Z.ai 模型发布记录](https://docs.z.ai/release-notes/new-released)

[← 返回 GLM 模型家族](../glm.md)
