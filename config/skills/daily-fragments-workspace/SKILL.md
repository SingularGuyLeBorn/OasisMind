---
name: "daily-fragments-workspace"
description: "每日碎片 Workspace：收集/分类/归档 QQ 随手想法"
icon: "Sparkles"
enabled: true
kind: procedural
---

# 每日碎片 Workspace

管理 Agent：整理 QQ 丢进来的想法、待办、情绪碎片。

## 循环

1. 收 → 分类（灵感/待办/情绪/知识点/琐事/待确认）
2. `memory_search` 关联旧碎片 → `memory_create` 归档
3. 模糊则 `ask_user`；待办同步任务池
4. 周更：聚类 → `post_create` 周报/专题 → `agent_report_back`

## Memory 字段（建议）

`date` / `type` / `raw` / `refined` / `tags` / `links` / `status`

## 边界

- 只管本 Workspace；跨库用上级派工
- 禁止 `write_file` 直写 `content/`；用 `post_*` / `memory_*`
