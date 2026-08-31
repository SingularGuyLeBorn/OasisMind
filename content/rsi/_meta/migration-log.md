---
title: RSI 目录迁移记录
as_of: 2026-09-01
category: 内部维护
tags: [migration, rsi]
published: false
excerpt: 从 0–6 平铺结构迁到 00–10 主题结构的内部记录。
---

# RSI 目录迁移记录

## 2026-09-01

- 根层从 `0–6` 重建为 `00–10`，采用继承编号。
- 原第 2 章拆为模型自训练与工具学习；原第 3 章按反馈、搜索、工具、记忆、多智能体和自动研究重新分组。
- 原 Artifact 内容并入自动研究与科学发现；评测与安全成为第 10 章。
- `chapter-structure-plan.md` 移入 `_meta/structure-plan.md`；旧 `notes` 迁移告示并入本页。
- 旧社区三层笔记、旧章节首页和全谱系导航移入 `_archive/superseded-navigation`。
- 公司融资、访谈、实验室动态、行业速览和混合来源 GPT-Red 旧页移入 `_archive/industry-claims`。
- 原 `.trash/notes` 移入 `_archive/legacy-notes`，全部归档页设为 `published: false`。
- 全部公开 Markdown 相对链接按新路径重算；不保留兼容副本。
- `migration-manifest.md` 从范围摘要扩展为结构迁移前 HEAD 中 127 篇旧 Markdown 的逐文件 ledger；旧路径覆盖 127/127、无重复、无遗漏，图片按旧章聚合记录。
- 删除 3 个与存续归档字节重复的 legacy notes：田渊栋访谈、GPT-Red 时间线、2026-08 行业速览；唯一存续路径记录在 manifest。
- `1.3-模仿学习与RLVR` 的展示标题收紧为“模仿与 RLVR：能力归因争议，RLVR 不是 RSI”，并同步 RSI 库内所有指向该页的链接锚文字；物理路径保持不变。
- 新增 `10.5-GPT-Red-安全红队自博弈`，只依据 OpenAI 2026-07-15 官方论文与官方说明，拆分威胁模型、攻击/防御种群、留出评测、局限和 safety flywheel 的 RSI 边界。
- 第 10 章首页、10.3 可靠性专文与 2.1.1 SPIN 已改为指向 10.5 正本；旧 `_archive/industry-claims/05-OpenAI-GPT-Red` 继续保留为非公开混合来源归档。

详细去向见 [migration-manifest.md](migration-manifest.md)。
