---
name: piclite-compress
description: "本地压图/GIF（PicLite）；禁第三方在线压图站"
kind: procedural
enabled: true
version: "0.1.1"
---

# piclite-compress

花园配图、批量素材、清 EXIF：本地完成。

## 铁律

1. 禁止 TinyPNG 等第三方压图 SaaS（除非用户明确接受外传）
2. 原图放 Workspace；压完进 `content/uploads/`；成文用 `post_*`
3. 工具不可用时给安装指引，勿假装已压成功

## 步骤

`list_directory` → 本机 PicLite/CLI 压缩 → 上传/引用 → `post_update`
