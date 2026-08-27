---
name: "qq-web-screenshot"
description: "qq-web-screenshot"
icon: "Sparkles"
trigger: null
enabled: true
kind: procedural
tags: []
version: "0.1.0"
---
# qq-web-screenshot

## 何时用

用户在 QQ 里 @ 机器人，要求「打开某网页截图看看」「帮我看这个链接长什么样」「截全页发我」等**网页截图 + 发回 QQ** 的需求。  
核心工具链：`scroll_screenshot`（长页/懒加载） → `read_image`/`vision_describe`（如需读图文本） → `send_qq_image`（把本地图片路径发回 QQ）。

## 工具链速查

| 步骤 | 工具 | 关键参数 | 适用场景 |
|------|------|----------|----------|
| 1a. 截单页/首屏 | `browser_screenshot` | `url`、`wait_ms`(默认 800) | 普通页面、非 SPA、只需首屏 |
| 1b. 截长图/懒加载页 | `scroll_screenshot` | `url`、`wait_ms`(默认 800)、`max_height`(默认 10000)、`full_page:true` | 长页面、SPA 懒加载、需全页 |
| 2. 读图文本（可选） | `read_image` / `vision_describe` | `path` 来自上一步返回的 `path` | 需 OCR/理解图中文字 |
| 3. 发回 QQ | `send_qq_image` | `path`、`kind:"answer"`、`at`/`quote` 视场景 | 群聊/私聊发图 |

## 标准流程

1. **收到链接/关键词** → 如是关键词先 `web_search` 拿首条 URL。
2. **截图**：
   - 普通页面/仅需首屏：`browser_screenshot({ url, wait_ms: 800 })`
   - 长页面/SPA/需全页：`scroll_screenshot({ url, full_page: true })`
   返回 `{ path, width, height, truncated }`。
3. **如需 OCR/理解**：`read_image({ path })` 或 `vision_describe({ path, prompt })`。
4. **发回 QQ**：`send_qq_image({ path, kind: "answer" })`。  
   - 群聊被动窗 ≈5 分钟：预计超 30 秒先 `send_qq_text({ kind:"progress", text:"截图中…" })` 占窗口。  
   - 终稿发图后，**不要**再发同内容文字（防双发兜底）。
5. **如需归档**：`memory_daily_append` 记要点；成文再 `post_create`。

## 反模式 / 避坑

- ❌ 先 `browser_screenshot` 再 `scroll_screenshot`：二选一，长页/SPA 用 `scroll_screenshot`。
- ❌ 截图返回 path 后不 `send_qq_image`，只在终稿写 `![](path)` → 群里收不到图（兜底只发文本）。
- ❌ 群聊任务超 3 分钟没进度 → 窗口关闭，终稿发不出去。必须分步发进度。
- ❌ 用 `run_shell` 调 puppeteer/playwright：平台已封装 `scroll_screenshot`，别自带浏览器。
- ❌ 图片过大（>20 MB）发送失败：`scroll_screenshot` 默认 `max_height:10000` 足够大多数页面；极长页可分段截再拼或仅截首屏。

## 与 browser-drive 区别

| 场景 | 用哪个 |
|------|--------|
| 需登录/点击/填表/多标签交互 | `browser-drive` (WebBridge) |
| 只需「打开链接看长什么样/截全页」 | **本 Skill** (`scroll_screenshot`) |

## 可复用片段（模板）

```json
// 进度占窗
{"tool":"send_qq_text","args":{"kind":"progress","text":"收到，正在截图…"}}

// 截单页/首屏
{"tool":"browser_screenshot","args":{"url":"https://example.com","wait_ms":800}}

// 截长图
{"tool":"scroll_screenshot","args":{"url":"https://example.com","full_page":true}}

// 发图回 QQ
{"tool":"send_qq_image","args":{"path":"{{screenshot.path}}","kind":"answer"}}
```

## 标签

- 非常有用
- qq-bot
- screenshot
- web
