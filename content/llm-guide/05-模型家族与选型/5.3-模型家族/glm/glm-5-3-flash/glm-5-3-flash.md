---
title: "GLM-5.3-Flash"
category: "模型家族与选型"
tags: ["glm-5.3-flash", "原生多模态", "linear attention", "开放权重"]
published: true
as_of: "2026-09-01"
excerpt: "GLM-5.3-Flash 的 320B/A18B 新基座、混合注意力、1M 多模态上下文与 MIT 权重。"
---

# GLM-5.3-Flash

## 身份与时间

Z.ai 发布记录将 GLM-5.3-Flash 服务列为 2026 年 8 月 26 日；官方 AutoClaw 技术文章发表于 8 月 30 日。它是 GLM-5 家族首个原生多模态模型，并从新训练的 base model 起步，不是 GLM-5.3 的量化版或蒸馏后缀。

| 字段 | 官方口径 |
|---|---|
| 总参数 / 激活参数 | 320B / 18B |
| 层数 | 45 |
| 预训练数据 | 30T 多模态 token |
| 输入 | 文本、图像、视频、文件 |
| 输出 | 文本 |
| 上下文 | 最高 1M |
| 公开形态 | 开放权重与 API |
| 权重许可 | MIT |

## 架构为何不同

模型交替使用稀疏注意力与线性注意力：线性注意力通过状态建模覆盖局部依赖，稀疏注意力用轻量索引器检索全局相关 token。它还采用 Manifold-Constrained Hyper-Connections（mHC）；在 1M 上下文下，IndexPool 将四个缓存 key 加权压成一个以降低索引延迟和内存。

官方相对 GLM-5.3 的分析称注意力计算约降 3.0 倍、KV cache 约降 4.4 倍。这是指定架构/口径的组件比较，不等于整机成本、端到端延迟或价格同比例下降。

## 原生多模态与 Agent

“原生”表示文本和视觉从预训练阶段共同学习，可理解文档版式、图表、界面状态和操作反馈。外部工具仍负责浏览器点击、文件编辑和渲染。对视觉工作流要把感知、推理、工具执行和结果复核分开测，防止把一次截图理解成功当作闭环自动化可靠性。

## 与 GLM-5.3 的选择

GLM-5.3 是同 GLM-5.2 基座的文本后训练旗舰，并使用自定义许可；GLM-5.3-Flash 是 320B/A18B 新多模态基座，MIT 许可。两者在模态、架构、参数和许可上都不同，不能只按“Flash 更快”排序。

## 一手来源

- [GLM-5.3-Flash 官方模型卡](https://huggingface.co/zai-org/GLM-5.3-Flash)
- [GLM-5.3-Flash 官方技术文章](https://autoclaw.z.ai/blog/model/glm-5.3-flash/)
- [Z.ai 模型发布记录](https://docs.z.ai/release-notes/new-released)
- [GLM-5 官方仓库](https://github.com/zai-org/GLM-5)

[← 返回 GLM 模型家族](../glm.md)
