---
name: browser-drive
description: "真实浏览器操作：点击/填表/多标签（Kimi WebBridge）"
kind: procedural
enabled: true
version: "0.1.0"
---

# browser-drive

## 何时用

用户要在**已登录的真实浏览器**里操作：点按钮、填表、多标签对比、截图/PDF。  
**只要读正文** → 用 `dokobot_read` / `read_article`，不要加载本 Skill。

## 工具

| 步骤 | 工具 |
|------|------|
| 探活 | `webbridge_status` |
| daemon 未起 | `webbridge_start`（可重复；禁止自动 stop） |
| 操作 | `webbridge_command`（action + args + **固定 session**） |
| 读图 | 截图返回 path → `read_image` |

## 流程

1. 任务开始定一个 `session`（如 `phone-compare`），整任务不换。
2. 首次 `navigate`：`newTab:true` + `group_title`（用户语言标签）。
3. `snapshot` → 用 `@e` ref 做 `click` / `fill`（优先于手写 CSS）。
4. 仅用户要求时 `close_session`。
5. 扩展未 Connected：给安装页 https://www.kimi.com/zh-cn/features/webbridge ，勿深排障。

## 纪律

- 中文内容走 `webbridge_command`（Node UTF-8），禁止 shell 内联 JSON。
- 不要为 WebBridge 再拆一工具一 Skill；本 Skill 只描述「操作浏览器」场景。
