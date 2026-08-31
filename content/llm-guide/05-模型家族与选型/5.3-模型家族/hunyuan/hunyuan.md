---
title: "Hunyuan / Tencent Hy 模型家族"
category: "模型家族与选型"
tags: ["hunyuan", "tencent-hy", "模型家族"]
published: true
as_of: "2026-09-01"
excerpt: "腾讯 Hy 语言模型线、云服务线与 Hunyuan3D 生成线的分离索引。"
---

# Hunyuan / Tencent Hy 模型家族

> 核验日期：2026-09-01。语言模型和 3D 生成不是一条参数代际线。

## 语言模型线

| 身份 | 证据日期 | 开放状态 | 页面 |
|---|---|---|---|
| Hunyuan Pro 云服务档位 | 2024（首发日待官方归档） | 闭源 API | [Pro](./pro/pro.md) |
| Hunyuan-Large | 2024-11-04 报告 | 开放权重 | [Large](./large/large.md) |
| Tencent Hy3 | 2026-07 官方仓库 final | Apache 2.0，295B/21B，256K | [Hy3](./hy3/hy3.md) |
| Tencent Hy4 Preview | 2026-08-28 | Apache 2.0，770B/49B，1M+ | [Hy4 Preview](./hy4-preview/hy4-preview.md) |

## Hunyuan3D 生成线

| 身份 | 证据日期 | 页面 |
|---|---|---|
| Hunyuan3D 1.0 | 2024-11-04 报告 | [3D 1.0](./3d-1/3d-1.md) |
| Hunyuan3D 2.0 | 2025-01-21 | [3D 2.0](./3d-2/3d-2.md) |
| Hunyuan3D 2.1 | 2025-06-13 | [3D 2.1](./3d-2-1/3d-2-1.md) |

Hy3/Hy4 是文本语言模型；Hunyuan3D 是 shape/texture 生成系统。二者不能共享模态、上下文、参数或 benchmark 结论。

[← 返回模型家族索引](../5.3-模型家族.md)
