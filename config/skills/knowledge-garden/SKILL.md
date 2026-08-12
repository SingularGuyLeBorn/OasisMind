---
name: knowledge-garden
description: "主题知识库：建花园、深度长文、站内链、过夜 Goal"
kind: procedural
enabled: true
version: "0.2.1"
---

# knowledge-garden

## 何时用

建/补主题花园；过夜 Goal 搭初版。模板：`skill_view(..., file_path="templates/article.md")`。

## 硬约束

1. 禁止 `write_file` 直写 `content/`（除 uploads）；用 `garden_*` / `post_*`
2. 写前 `garden_list` / `garden_get`；勿删种子库
3. 「相关」用 `[标题](./slug.md)` 或 `[[slug|标题]]`，禁止裸 `[[slug]]`

## 工具

| 阶段 | 工具 |
|------|------|
| 花园/文 | `garden_*` `post_*` |
| 调研 | `web_search` `read_article` `dokobot_*` `save_webpage` `video_transcript` |
| 登录墙 | `dokobot_read` 优先；否则 `platform_login` → `read_article` |
| 需点选/填表 | `webbridge_command`（见 skill `browser-drive`） |
| 过夜 | `session_goal_set` |

## 质量

正文 ≥800 字（综述 ≥1200）；含概述/机制/例子/来源外链/相关。公式用 `$…$`。

## 过夜 Goal

Goal 文案嵌入质量标准；设完立刻写第一篇，勿空转搜索。重启不自动续跑。
