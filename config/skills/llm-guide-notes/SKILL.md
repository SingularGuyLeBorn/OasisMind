---
name: "llm-guide-notes"
description: "llm-guide 长文行文：科学空间节奏 + MoE/MHA/RoPE 样本。见微 Agent 写该花园时加载。"
icon: "BookOpen"
trigger: "/llm-guide-notes"
enabled: true
kind: procedural
tags: ["llm-guide", "writing"]
version: "1.0.0"
---

# llm-guide-notes（见微侧入口）

完整行文与样本在仓库 `.cursor/skills/llm-guide-notes/`（Cursor Goal 用那份）。本 Skill 只补见微工具约束。

## 何时用

用户要补 `content/llm-guide/` 笔记、对齐 MoE/MHA 文风、或执行 `CURSOR-GOAL-续写提示词.md`。

## 见微硬约束

1. 禁止 `write_file` 直写 `content/`（除 `uploads/`）；用 `post_create` / `post_update` / `garden_*`。
2. 调研走 `deep-research` + `arxiv-fetch-process`（先一手论文再写）。
3. 超长材料分段读（RLM）：有 `truncated` 就翻页。
4. 不要删既有文件。不要把语雀/网页图当配图。

行文骨架、图解析、金样本路径：让用户或 Cursor 代理读 `.cursor/skills/llm-guide-notes/SKILL.md` 与 `canon.md`。
