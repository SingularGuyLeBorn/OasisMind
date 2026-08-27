# 常用应用窗口标题/类名预设

## 系统自带
| 应用 | 进程名 | 典型窗口标题 | 备注 |
|------|--------|--------------|------|
| 记事本 | notepad.exe | "无标题 - 记事本" / "*.txt - 记事本" | 标题随文件名变化 |
| 计算器 | calculator.exe | "计算器" | UWP 应用，窗口枚举特殊 |
| 画图 | mspaint.exe | "无标题 - 画图" / "*.png - 画图" | |
| 资源管理器 | explorer.exe | "文件夹名" / "此电脑" | 多窗口共进程 |
| 终端/命令提示符 | cmd.exe / wt.exe | "命令提示符" / "Windows Terminal" | |

## 常用第三方
| 应用 | 进程名 | 典型窗口标题 | 备注 |
|------|--------|--------------|------|
| Chrome | chrome.exe | "标签页标题 - Google Chrome" | 多进程，主窗口标题随标签变 |
| Firefox | firefox.exe | "标签页标题 - Mozilla Firefox" | |
| Edge | msedge.exe | "标签页标题 - Microsoft Edge" | |
| VS Code | Code.exe | "文件名 - 项目名 - Visual Studio Code" | |
| 微信 | WeChat.exe | "微信" | 登录后主窗口固定标题 |
| QQ | QQ.exe | "QQ" | |
| 向日葵/ToDesk | SunloginClient.exe / ToDesk.exe | 远程控制窗口标题动态 | 需动态匹配 |

## 匹配策略建议
- **精确匹配**：固定标题应用（微信、计算器）
- **前缀/包含匹配**：标题随内容变化（浏览器、编辑器、记事本）
- **进程名兜底**：`processName: "notepad.exe"` 配合 `windowTitle` 模糊匹配

## UWP 应用特殊处理
- `Snapshot(target=window, processName="WindowsCalculator")` 可不传 windowTitle
- 坐标系仍为窗口客户区，但可能无标题栏