---
title: "Ling 模型家族"
category: "模型家族与选型"
tags: ["ling", "模型家族", "moe", "线性注意力"]
published: true
as_of: "2026-09-01"
excerpt: "inclusionAI Ling Lite/Plus、2.0、2.5 与 2.6 的稀疏 MoE 谱系和边界。"
---

# Ling 模型家族

> 核验日期：2026-09-01。这里的 Ling 指 inclusionAI/蚂蚁团队模型家族，不是 Yi。厂商吞吐与 benchmark 仅在其披露硬件和 harness 下成立。

## 定位与谱系

| 身份 | 证据日期 | 公开定位 | 页面 |
|---|---|---|---|
| Ling-Lite | 2025-03-07 同篇论文 | 16.8B 总参数、2.75B 激活 | [Ling-Lite](./ling-lite/ling-lite.md) |
| Ling-Plus | 2025-03-07 同篇论文 | 290B 总参数、28.8B 激活 | [Ling-Plus](./ling-plus/ling-plus.md) |
| Ling 2.0 | 2025-10-25 论文 v1 | 16B 到 1T 的统一高稀疏 MoE 推理线 | [Ling 2.0](./ling-2-0/ling-2-0.md) |
| Ling 2.5 | 截至 2026-09-01 模型卡 | 1T/63B，混合线性注意力，256K→1M YaRN | [Ling 2.5](./ling-2-5/ling-2-5.md) |
| Ling 2.6 | 2026-06-13 论文 v1 | 1T 与 104B/7.4B flash 等多 SKU Agent 线 | [Ling 2.6](./ling-2-6/ling-2-6.md) |

## 能力边界

- Lite 与 Plus 共用 2025 报告，但不是同一尺寸；旧稿的两个重复“纯中文精译”只作为来源快照。
- Ling 2.0 论文覆盖 mini/flash/1T，不能把 1T 配方全部复制到 mini。
- Ling 2.5 的 1M 是 YaRN 扩展口径；Ling 2.6 的 1T 与 flash 参数、激活量和目标不同。

## 部署与选型

- 小激活量 MoE/异构训练研究：Lite、Plus 或 2.0，按具体权重选择。
- 超长生成吞吐研究：2.5，必须实测框架对混合线性注意力的支持。
- 复杂 Agent 与较低延迟 SKU：2.6 的 1T/flash 分开测；不要只用总参数估计成本。
- 模型卡涉及 `trust_remote_code` 时，应固定 revision 并审阅自定义代码后部署。

## 一手来源

- [Ling Lite/Plus 论文](https://arxiv.org/abs/2503.05139)
- [Ling 2.0 论文](https://arxiv.org/abs/2510.22115) · [官方仓库](https://github.com/inclusionAI/Ling-V2)
- [Ling 2.5 官方模型卡](https://huggingface.co/inclusionAI/Ling-2.5-1T)
- [Ling/Ring 2.6 报告](https://arxiv.org/abs/2606.15079)
- [Ling 2.6 1T](https://huggingface.co/inclusionAI/Ling-2.6-1T) · [Ling 2.6 flash](https://huggingface.co/inclusionAI/Ling-2.6-flash)

[← 返回模型家族索引](../5.3-模型家族.md)
