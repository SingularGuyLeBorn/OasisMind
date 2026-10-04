---
name: "windows-desktop-automation"
description: "Windows 桌面观察与交互：截图、窗口定位、应用切换、点击、输入和滚动。"
icon: "Monitor"
trigger: null
enabled: true
kind: procedural
tags:
  - "desktop"
  - "automation"
  - "windows"
version: "0.2.0"
---
# Windows 桌面自动化

## 安全边界

- 只有私聊会话可以使用桌面与主机能力；群聊一律拒绝。
- Agent 必须同时拥有 `native:host_access` 和 `mcp:windows-mcp`。
- Windows-MCP 白名单不含 PowerShell、注册表、任意文件系统或杀进程能力。
- 截图优先用 `capture_screenshot`：它会把图片落到受控上传区，返回可直接回传 QQ / 微信的附件。

## 当前真实工具参数

| 工具 | 用途 | 关键参数 |
|---|---|---|
| `capture_screenshot` | 网页、桌面或指定窗口截图 | `mode`；网页传 `url`；窗口传 `windowTitle`；桌面可传 `display` |
| `Snapshot` | 看当前桌面、窗口清单和 UI 树 | `use_ui_tree`、`use_vision`、`use_dom`、`use_annotation`、`display:number[]` |
| `Screenshot` | 快速截整个显示器 | `use_annotation`、`display:number[]` |
| `App` | 启动、切换、移动或缩放应用 | `mode:launch|launch_executable|switch|resize`、`name`、`window_loc`、`window_size` |
| `Click` | 点击坐标或 Snapshot 标号 | `loc:[x,y]` 或 `label`、`button`、`clicks` |
| `Type` | 向坐标或标号输入文字 | `text`、`loc`/`label`、`clear`、`press_enter` |
| `Scroll` | 滚轮操作 | `loc`/`label`、`type`、`direction`、`wheel_times` |
| `Move` | 移动或拖拽 | `loc`、`from_loc`、`drag`、`duration` |
| `Wait` | 固定等待 | `duration`（秒） |
| `WaitFor` | 等文字或窗口条件 | `condition`、`text`、`window_name`、`timeout`、`interval` |
| `DisplayInventory` | 查看显示器编号和坐标 | 无参数 |

Windows-MCP 的 `Snapshot` / `Screenshot` 没有 `target`、`windowTitle` 或 `region` 参数。指定窗口图片必须调用 `capture_screenshot(mode="window", windowTitle="...")`，不要向 MCP 传不存在的字段。

## 标准流程

### 只查看并回传

1. 当前桌面：`capture_screenshot({ mode: "desktop" })`。
2. 指定窗口：`capture_screenshot({ mode: "window", windowTitle: "记事本" })`。
3. 需要理解画面时，把返回的 `path` 交给 `read_image` / `vision_describe`。
4. 远程回传时，把 `attachment.localPath` 作为 `file` 交给 `send_qq_image` 或 `send_weixin_image`。
5. 只有发送结果里的 `transfer.status=sent` 才算送达。

### 操作桌面

1. `Snapshot({ use_ui_tree: true, use_annotation: true })` 获取当前窗口、控件树和可点击标号。
2. 优先按 `label` 点击或输入；没有标号时再使用 `loc:[x,y]`。
3. 操作后重新 `Snapshot`，根据新状态决定下一步。
4. 等待明确文字或窗口时用 `WaitFor`；只有动画等无法观察的短过程才用 `Wait`。

## 例子

```json
{"mode":"desktop"}
```

```json
{"mode":"window","windowTitle":"记事本"}
```

```json
{"use_ui_tree":true,"use_annotation":true}
```

```json
{"label":12,"button":"left","clicks":1}
```

```json
{"text":"hello","label":18,"clear":true,"press_enter":true}
```

## 避坑

- 不凭旧截图连续点击；每个会改变布局的动作后重新 Snapshot。
- 截图元数据若提示坐标缩放，传给 `loc` 的必须是换算后的屏幕坐标；`label` 不需要手算。
- 窗口标题片段若匹配多个窗口，补充更完整标题，不随机选择。
- 最小化窗口无法可靠捕获；先用 `App(mode="switch", name="...")` 恢复，再截窗口。
- 不用 `run_shell` 代替桌面工具，也不通过桌面能力删除文件或操作敏感目录。
