---
title: "Minimal Zine Poster Skill：极简杂志风海报 Prompt Skill"
category: "Skill · 视觉设计"
published: true
excerpt: "gc-minimal-zine-poster（LiamGvchi）Codex Skill：主题/情绪/物件 → 安静极简 zine 编辑海报 Prompt + 栅格图；Standard Mode 默认出图，四段式配方（画布留白、主体隐喻、muted 锚点、规避列表）。"
tags: ["Skill", "Zine", "海报", "Prompt 设计", "图像生成"]
---
# Minimal Zine Poster Skill：极简杂志风海报 Prompt Skill

> **仓库**：[LiamGvchi/gc-minimal-zine-poster](https://github.com/LiamGvchi/gc-minimal-zine-poster)（MIT）
> **Skill 名**：`gc-minimal-zine-poster-v0-1`

## 原文精读

Callable skill 把**主题、一句话、物件、情绪、文章 idea 或参考图**转成：

1. 生成的 raster 海报图
2. 最终 image-generation prompt
3. 所选 variation recipe + 短解读

**Standard Mode 默认直接出图**；仅当用户明确要求才 prompt-only。

安装：

```bash
git clone https://github.com/LiamGvchi/gc-minimal-zine-poster.git \
  ~/.codex/skills/gc-minimal-zine-poster-v0-1
```

调用示例：`用 $gc-minimal-zine-poster-v0-1 做一张关于雨天旧书店的海报`

仓库含 `SKILL.md`（完整指令）、`examples/` 样例图。

## 方法/架构解析

### 设计定位

与 Anthropic `canvas-design`（先写 design manifesto 再 museum-grade 出图）不同，Minimal Zine 偏 **日式/韩式独立杂志**审美：大面积留白、平面扫描感、**高饱和度视觉锚点**（钴蓝、番茄红等）作焦点。

同族改版 [muted-zine-poster-v01](https://github.com/moonlin1213/muted-zine-poster-v01) 去掉高饱和块，改 muted grayscale + 破碎拼贴——可按项目气质二选一。

### Workflow 抽象

Skill 内隐 **四段配方**：画布与纸张质感 → 主体与隐喻 → 锚点色彩 → Avoid 列表。Prompt **自包含**（光影/构图/禁止项内嵌），模型无关，可粘贴任意图像 API。

### 与 tt-material-animation 的分工

| Skill | 输出 | 交互 |
|---|---|---|
| Minimal Zine Poster | 静态编辑海报 | 一次 brief → 出图 |
| tt-material-animation | 材质动画首尾帧+视频 Prompt | 三段式逐步确认 |

海报适合文章封面/社媒；材质动画适合短视频生成 front-end。

### 输出契约

每次 generation 默认返回三件套：**栅格图** + **完整 prompt 文本** + **recipe 名称与解读**（便于迭代时换 variation 而非重写 brief）。用户若只要 prompt，需显式说「仅 prompt」——避免误烧 image API 额度。

### 与 canvas-design 选型

| | Minimal Zine | canvas-design |
|---|---|---|
| 美学 | 独立杂志编辑风 | 博物馆级抽象平面 |
| 文本量 | 可含标题/微文案 | 极简文字 |
| 流程 | brief → 出图 | 先 manifesto 再渲染 |

知识库文章封面、RSI 读报头图优先 Minimal Zine；抽象艺术向用 canvas-design。

使用技巧：brief 里写清**情绪与物理材质**（雨、旧纸、油墨）比写「好看」更有效；Skill 会选 variation recipe 并在解读里说明为何选该配方。若需系列海报，固定 recipe 只改主题句，可保持视觉系列感。安装到 Codex 后与其它 Skill 并列，不占用见微 server 资源。

## 方法/架构解析（续）

极简 zine 海报 Skill 的本质是 **把平面设计约束编译进 Prompt**（留白比例、锚点色、Avoid 列表），而不是让模型自由发挥。这对知识库配图尤其有用：同一花园的多篇文章可共享视觉体系。与 tt-material-animation 组合时，静帧用 Minimal Zine，动效 Prompt 用材质 Skill，避免一个 Skill 包打天下导致风格混乱。社区另有 muted 变体服务更低饱和审美，可按花园品牌色选择。安装路径 `~/.codex/skills/gc-minimal-zine-poster-v0-1` 与见微无耦合，适合编辑/运营同学本机使用。

---

> 见微改进对照见 [OasisMind 2026-08 Harness 波改进清单](../../essays/oasis-improvements-2026-08-harness-wave.md)。
