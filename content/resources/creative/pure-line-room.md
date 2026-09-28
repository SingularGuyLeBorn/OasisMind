---
title: "Pure Line Room：Animnia 线框房间 Three.js 小品"
category: "创意 · WebGL"
published: true
excerpt: "Animnia pure-line-room：Three.js 线框/isometric 房间互动小品，GLB 约 610KB 级轻量加载；属 Three.js Journey isometric room 一脉的纯线条 aesthetic 变体。（社区传播条目，官方 repo 待核实）"
tags: ["Three.js", "pure-line-room", "Animnia", "WebGL", "创意"]
---
# Pure Line Room：Animnia 线框房间 Three.js 小品

> **来源**：社区传播（Animnia / 小红书等）｜ **状态**：官方仓库与 live URL **待核实**
> **技术线索**：Three.js + 轻量 GLB（传播口径 ~610KB）

## 原文精读

Pure Line Room 指一类 **纯线条（pure line） aesthetic** 的 3D 房间场景：弱化贴图与写实渲染，以线框/轮廓与等距（isometric）镜头呈现「可探索的小空间」。与 Bruno Simon Three.js Journey 第 9 期 Isometric Room 挑战及大量 `my-room-in-3d` 二创同属**房间 portfolio** 范式，但视觉更极简、包体更小，适合移动端与即时加载。

传播中 attributed 到 **Animnia** 作者/品牌；常见描述为 three.js 实现、模型压缩后在 **~610KB** 量级，强调「打开即玩、低带宽」。

## 方法/架构解析

### 技术模式（同类项目共性）

```text
Blender 建模 → 烘焙或线框材质 → 导出 GLB（compress-glb 等压体积）
    → Three.js / R3F 加载 → Orbit/等距相机 + 少量交互 hotspot
```

610KB 级目标通常意味着：**单 GLB、低面数、无高清 PBR 贴图**，用线条材质或 unlit shader 换视觉。

### 可借鉴点

- **知识库/个人站点** 用 3D room 作 spatial nav 时，pure-line 变体比写实 room 更易维护与加载。
- 与 Pascal Editor（全功能 BIM 编辑）对比：pure-line-room 是**只读体验/展示**端，工程复杂度低一个数量级。

核实待办：补官方 GitHub/Pages 链接后再更新 frontmatter 中的 `published` 与来源字段。

### 与 Three.js Journey isometric room  lineage

Bruno Simon 原版 `my-room-in-3d` 开启「浏览器房间 portfolio」genre；Journey 第 9 期挑战推动大量 baking + GLB 作品。Pure-line 变体用**线条替代 baked PBR**，牺牲写实换加载速度与风格识别度——适合作为「数字花园入口」的 decorative layer，而非功能 UI。

### 性能预算（610KB 口径）

若 GLB 含 mesh + 简单 line material，610KB 在 4G 网络仍可在 1–2s 内可交互；应避免同步加载多段 HDR/音频。交互上通常仅 orbit + 点击 hotspot，无 heavy physics。

作为 `resources/creative` 条目，pure-line-room 标记**审美参考**而非工具依赖：见微若做花园首页三维入口，可借鉴其「轻量 GLB + 强风格化」策略，避免复制 Bruno Simon 全烘焙写实 room 的维护成本。待核实官方链接后，可补 demo 动图与作者授权说明。

## 方法/架构解析（续）

纯线条房间类作品证明：**三维入口不必追求写实**。对带宽敏感的中文用户，610KB 级首包比 multi-MB 烘焙 room 更易接受。技术选型上优先 Draco/meshopt 压缩与 unlit line material；交互保持 orbit + 少量 hotspot 即可。若见微花园要做「走进知识库」 metaphor，可先 pure-line 原型验证，再决定是否上 Pascal 级编辑能力。条目保留「待核实」以免把二手传播当成官方项目。Animnia 名称在中文设计社区常与极简线稿 aesthetic 关联，见微收录仅供灵感索引。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
