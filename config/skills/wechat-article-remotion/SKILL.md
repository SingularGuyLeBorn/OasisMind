---
name: wechat-article-remotion
description: "文章→材料包→beats→Remotion 成片（本地，不依赖 Ideaflow）"
kind: procedural
enabled: true
version: "0.1.1"
---

# wechat-article-remotion

先钉时间线，再铺画面。细则：`references/beat-checklist.md`。

## 流程

1. `article_material_pack`（或自备 pack）
2. 填 `beats.json`（同 kind 不连续；每屏 ≤5 文案元素）
3. `article_video_compose`（禁止 `write_file` → `apps/algo-viz/**`）
4. 文章插 ` ```viz composition: {Id}``` `

## 铁律

- 抓取只用 `article_material_pack` / `read_article`
- `article-image` 只用材料包真实 `imageId`，不重复
- 无 TTS 时可做无声预览（caption 作旁白条）
