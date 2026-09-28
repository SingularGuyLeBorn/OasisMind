---
title: "Pascal Editor：React 19 + R3F + WebGPU 浏览器建筑编辑器"
category: "工具 · 3D 编辑器"
published: true
excerpt: "pascalorg/editor 是 MIT 开源的浏览器端 3D 建筑编辑器：Turborepo 四分 packages（core/viewer/editor/nodes），React 19 + Next.js 16 + R3F + WebGPU，Zustand+Zod 场景状态，viewer 可嵌入、editor 可扩展，含 MCP 读改场景。"
tags: ["Pascal Editor", "WebGPU", "React Three Fiber", "3D 编辑器", "建筑"]
---
# Pascal Editor：React 19 + R3F + WebGPU 浏览器建筑编辑器

> **仓库**：[pascalorg/editor](https://github.com/pascalorg/editor)（MIT）
> **在线**：[editor.pascal.app](https://editor.pascal.app/)
> **Stars**：~9k（2026-08 量级）

## 原文精读

Pascal Editor 是**浏览器内 3D 建筑编辑**开源项目， slogan 为「Create and share 3D architectural projects」。核心卖点：

- **WebGPU 渲染**：Three.js WebGPU renderer，面向下一代 web 图形性能。
- **npm 可嵌入**：`@pascal-app/viewer` / `@pascal-app/editor` 发布到 npm，可只装 viewer 或完整 editor。
- **Agent 接口**：MCP server 允许 agent 读/改场景（房间、物体、材质、建筑系统）。
- **IFC 等**：支持导入自有 BIM/IFC 模型（官网文案）。

技术栈：**React 19 + Next.js 16 + R3F + Drei + Zustand + Zod + Zundo（undo）+ three-bvh-csg（布尔运算）+ Turborepo + Bun**。

## 方法/架构解析

### Monorepo 分包

```text
apps/editor/          # Next.js 宿主
packages/core/        # Schema、Zustand 场景、registry、空间查询、事件总线
packages/viewer/      # R3F 渲染、相机、后处理
packages/editor/      # 工具、面板、选择、直接操纵 UI
packages/nodes/       # 内置节点定义、renderer、geometry、systems
packages/ui/          # 共享 UI
```

**Viewer vs Editor**：viewer 带合理默认渲染；editor 扩展工具、选择、结构层 visibility——**同一 scene store，分层增能力**。

### 状态三分

| Store | 包 | 职责 |
|---|---|---|
| `useScene` | core | nodes CRUD、dirty nodes；IndexedDB 持久化 + Zundo undo |
| `useViewer` | viewer | 选中 building/level/zone、楼层显示模式、相机 |
| `useEditor` | apps/editor | 当前工具、面板、编辑器偏好 |

**Dirty nodes** 增量更新几何，避免全场景 rebuild。

### 插件/registry

节点类型通过 **registry plugin** 注册（schema + 3D/2D renderer + systems + 面板），扩展不需 fork 内部 API。

### 借鉴点

- **Web 端 heavy 3D 编辑** 的可复用分层：core 纯数据、viewer 纯渲染、editor 纯交互。
- **MCP 暴露场景** = agent 可操作的 spatial harness，与 Code as Agent Harness 综述中「environment as code」一致。
- 若见微要做可视化 garden/空间编排，Pascal 是「嵌入现成 engine」而非自研 R3F 的参考样本。

### 嵌入方式（概念）

消费者应用可只依赖 `@pascal-app/core` + `@pascal-app/viewer` 渲染已有 scene JSON；需要编辑时再挂 `@pascal-app/editor` + `@pascal-app/nodes` 默认插件。Scene 通过 Zod schema 校验，便于 agent MCP 写操作后做 deterministic validate——与「plan → mutate scene → verify schema」.harness 模式一致。

### 与 pure-line-room 对比

| | Pascal Editor | pure-line-room 类小品 |
|---|---|---|
| 目标 | 可编辑 BIM/建筑 | 只读 portfolio / 导航 |
| 渲染 | WebGPU + CSG | 线框/轻量 GLB |
| 状态 | IndexedDB + undo | 通常无持久编辑 |

Pascal 代表「重交互、重状态」的浏览器三维应用架构样本：React 19 并发特性 + R3F 声明式 scene graph + WebGPU 后端，配合 Zod 做 agent 可写场景的 schema gate。学习重点不在学会画墙，而在 **viewer/editor 分包、dirty incremental rebuild、registry 插件** 三条可迁移模式。国内开发者可关注 editor.pascal.app 在线 demo 与 npm 包版本对齐情况。

## 方法/架构解析（续）

浏览器建筑编辑的长期趋势是 **WebGPU + 可嵌入 npm 包 + Agent MCP 改场景** 三件套。Pascal 把「场景 JSON + schema」当作单一事实源，UI 与渲染都是投影层——这与见微「Markdown 为源、SQLite 为缓存」哲学同构，只是载体从文本换成 spatial node graph。若只做只读展示，引入 full editor 过重；若要做「用户与 Agent 共创空间布局」，Pascal 类 engine 比从零写 R3F 省数月工程量。MIT 许可也利于二次集成，无需担心商业宿主授权障碍。学习时可对照见微已有 Three.js 组件（如 garden 可视化），评估「嵌入 npm viewer」与「自研 R3F」成本；多数只读场景 embedding viewer 即可。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
