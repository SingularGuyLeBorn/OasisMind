---
name: "qq-web-screenshot"
description: "从 QQ 请求截取网页、桌面或指定窗口，并把真实图片附件回传。"
icon: "MonitorUp"
trigger: null
enabled: true
kind: procedural
tags:
  - "qq-bot"
  - "screenshot"
  - "web"
version: "0.2.0"
---
# QQ 截图回传

## 何时用

用户在 QQ 要求“截网页”“看当前桌面”“发某个窗口给我”时使用。截图完成不等于交付完成：必须再调用 `send_qq_image`，并确认传输状态为 `sent`。

## 工具选择

| 请求 | 截图调用 |
|---|---|
| 网页当前视区 | `capture_screenshot({ mode:"web_viewport", url })` |
| 网页完整长图 | `capture_screenshot({ mode:"web_fullpage", url })` |
| 懒加载 / 无限滚动网页 | `scroll_screenshot({ url, scrollSteps, scrollDelay })` |
| 当前桌面 | `capture_screenshot({ mode:"desktop" })` |
| 指定窗口 | `capture_screenshot({ mode:"window", windowTitle })` |

网页截图的实际参数是 `timeout`、`waitFor`、`width`、`height`；没有 `wait_ms`、`max_height` 或 `full_page`。指定窗口和桌面能力只允许私聊。

## 标准流程

1. 群聊中预计超过 30 秒时，先发一条简短 `kind:"progress"` 进度，避免被动回复窗口过期。
2. 调用上表对应的截图模式。
3. 若还要分析页面，把返回的 `path` 交给 `read_image` 或 `vision_describe`。
4. 调用 `send_qq_image({ file: screenshot.attachment.localPath, kind:"answer" })`。
5. 检查返回的 `transfer.status`：
   - `sent`：完成。
   - `failed` 且 `retrySafe=true`：可调用 `channel_transfer_retry`。
   - `uncertain`：先到 QQ 核对，禁止盲目重发，避免重复图片。

分段滚动截图会返回 `screenshots[]`；逐项使用 `screenshots[i].attachment.localPath` 发送，不要把整个数组当成一个文件。

## 示例

```json
{"tool":"capture_screenshot","args":{"mode":"web_fullpage","url":"https://example.com","timeout":30000}}
```

```json
{"tool":"capture_screenshot","args":{"mode":"window","windowTitle":"Visual Studio Code"}}
```

```json
{"tool":"send_qq_image","args":{"file":"{{screenshot.attachment.localPath}}","kind":"answer"}}
```

## 避坑

- 不只在正文里写本机路径或 Markdown 图片；QQ 收不到本机文件路径。
- 不用 `run_shell` 自己启动 Puppeteer / Playwright；截图、落盘、MIME 校验已有统一链路。
- 不把工具内部的 base64 放进消息；统一截图结果会返回受控本地附件。
- 普通长页用 `web_fullpage`；确实有懒加载或无限滚动时才用 `scroll_screenshot`。
