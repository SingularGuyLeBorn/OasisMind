# 坐标基准与高 DPI 处理

## 坐标系定义
- `target=window`：坐标原点 = 窗口**客户区**左上角（不含标题栏、边框）
- `target=desktop`：坐标原点 = 虚拟屏幕左上角（多显示器拼接后的总画布）
- `Snapshot` 返回字段：`x`, `y` (窗口左上角屏幕坐标), `width`, `height` (客户区尺寸), `scaleFactor` (DPI 缩放因子)

## 高 DPI 缩放规则
```
实际物理像素坐标 = 逻辑坐标 × scaleFactor
```
- Windows 设置「缩放 150%」→ `scaleFactor = 1.5`
- `Snapshot` 返回的 `width/height` 已是**逻辑尺寸**（已除以 scaleFactor）
- **点击坐标传递逻辑坐标**（windows-mcp 内部会乘以 scaleFactor）

## 典型分辨率/缩放下的窗口基准（1920×1080 为例）

| 缩放 | 逻辑分辨率 | 记事本默认窗口 (约) | Chrome 最大化客户区 (约) |
|------|------------|---------------------|--------------------------|
| 100% | 1920×1080 | 800×600 | 1920×1030 |
| 125% | 1536×864 | 640×480 | 1536×824 |
| 150% | 1280×720 | 533×400 | 1280×693 |
| 175% | 1097×617 | 457×343 | 1097×593 |
| 200% | 960×540 | 400×300 | 960×515 |

> 以上为经验值，实测以 `Snapshot` 返回为准。

## 相对坐标计算工具函数（伪代码）
```typescript
// 窗口相对比例 → 绝对逻辑坐标
function relToAbs(windowRect, relX, relY) {
  return {
    x: Math.round(windowRect.width * relX),
    y: Math.round(windowRect.height * relY)
  };
}

// 绝对逻辑坐标 → 相对比例（用于记录可复用位置）
function absToRel(windowRect, x, y) {
  return {
    relX: x / windowRect.width,
    relY: y / windowRect.height
  };
}
```

## 常用 UI 元素相对位置经验值（供参考，需实测校准）

### 记事本
| 元素 | 相对位置 (relX, relY) | 备注 |
|------|----------------------|------|
| 文件菜单 | (0.02, 0.02) | 标题栏下方菜单栏 |
| 编辑区域中心 | (0.5, 0.5) | 文本编辑区 |
| 状态栏行号 | (0.9, 0.98) | 右下角 |

### Chrome（标签页区域）
| 元素 | 相对位置 | 备注 |
|------|----------|------|
| 新标签按钮 | (0.95, 0.02) | 标签栏最右 |
| 地址栏 | (0.1, 0.04) | 标签栏下方 |
| 书签栏第一项 | (0.02, 0.08) | 若显示书签栏 |

### VS Code
| 元素 | 相对位置 | 备注 |
|------|----------|------|
| 活动栏(文件图标) | (0.01, 0.15) | 最左侧竖栏 |
| 编辑器中心 | (0.55, 0.5) | 右侧编辑区 |
| 终端切换 | (0.5, 0.95) | 底部面板 |

## 多显示器坐标换算
```typescript
// 虚拟桌面坐标 → 目标显示器相对坐标
function virtualToMonitor(virtualX, virtualY, monitors) {
  for (const m of monitors) {
    if (virtualX >= m.x && virtualX < m.x + m.width &&
        virtualY >= m.y && virtualY < m.y + m.height) {
      return { x: virtualX - m.x, y: virtualY - m.y, monitor: m };
    }
  }
  return null; // 跨屏或越界
}
```

## 校准流程（新环境/新分辨率必做）
1. `Snapshot(target=window, windowTitle="目标应用")` 获取 `width`, `height`, `scaleFactor`
2. 目标元素用相对比例记录（如 `relX=0.5, relY=0.5`）
3. 执行时：`x = width * relX, y = height * relY` → `Click(target=window, x, y)`
4. 执行后 `Snapshot` 校验；偏移 > 5px 时微调比例并记录

## 已知问题与规避
| 问题 | 现象 | 规避 |
|------|------|------|
| UWP 应用客户区含标题栏 | 坐标偏移约 32px | 实测标题栏高度，`y += titleBarHeight` |
| 窗口边框阴影算入客户区 | Win11 圆角阴影导致 width 变大 | 用 `processName` 而非 `windowTitle` 定位，或手动减边框 |
| 远程桌面/虚拟机 DPI 不同 | 宿主/客机 scaleFactor 不一致 | 在目标机器上校准，勿跨机复用坐标 |