---
name: academic-diagrams
description: >-
  Draws academic architecture diagrams as unwatermarked light-theme PNGs via
  PaperBanana's five-agent loop with Cursor GenerateImage as Visualizer.
  Enforces orthogonal connectors (edge-to-edge, no pierce, no rogue bidirectional).
  Use when calling GenerateImage, authoring fig-*.png, or the user mentions
  PaperBanana, 架构图, 配图, llm-guide images, or rsi images.
---

# 学术架构图：PaperBanana 流程 × GenerateImage

生任何 `fig-*.png` 之前 **必须整份 Read 本文件**。

## 融合方式（死命令）

论文 [PaperBanana](https://arxiv.org/abs/2601.23265) 的像素出口是 Gemini / GPT-Image。本仓库 **不装 CLI、不调 MCP、不烧那套图 API**。

把 Visualizer 换成 Cursor 原生 `GenerateImage`。其余四角（Retriever / Planner / Stylist / Critic）由当前 Agent 用文本 + `Read` 图完成。`I_t = GenerateImage(P_t)`。

| PaperBanana | 本仓库谁干 | 工具 |
|---|---|---|
| Retriever | 按 **拓扑** 挑本库参考图（结构优先于主题） | 本地 PNG 路径 |
| Planner | 写框表 + 线表 + 布局 | 文本 |
| Stylist | 套 NeurIPS 粉彩 + 浅色 + 接线死命令 → `P*` | `paperbanana-neurips-style.md` |
| Visualizer | 生像素 | **`GenerateImage`** |
| Critic | 对着源文 + 图找漏模块 / 坏线，改 `P_{t+1}` | `Read` 那张 PNG |

禁止：`paperbanana generate` / `paperbanana-mcp` 当生图后端。禁止把统计图丢给 `GenerateImage`（工具自己禁 charts；PaperBanana 对 plot 也走 matplotlib）。

PaperSpine 是论文写作编排器（Never fabricate figures），**不是**生图引擎。

## 原流程（论文 §3，T=3）

输入：源文 `S`（方法段 / 笔记节）+ 图注 `C`（这张图要讲什么）。

```
S, C
  │
  ├─ Retriever  → 参考例 E（结构像的图，不是主题像的论文）
  ├─ Planner    → 描述 P（组件、布局、连线；ICL 自 E）
  └─ Stylist    → P*（NeurIPS 美学 + 本库接线）
         │
         ▼
    t = 1..3:
         Visualizer:  I_t = GenerateImage(P_t)     P_0 = P*
         Critic:      P_{t+1} = 看图(I_t, S, C, P_t)
         合格则停
```

消融结论（论文 Table 2）：去掉 Critic，忠实度从 45.8 掉到 30.7。所以 **禁止单次 GenerateImage 交差**。默认最多 3 轮；用户说「挺好」立刻停，不要用读图幻觉否决。

论文自己承认：扩散模型最常在 **细粒度连通性** 上翻车，Critic 经常看不出。本库用下面的 `CONNECTOR GEOMETRY` 补那一层。

## Phase 1 — 规划（先写完再调用 GenerateImage）

### Retriever

从本库已有浅色架构图里挑 **1 张** 作 `reference_image_paths`，只学线型，不抄模块名。

默认（用户点名「还凑合」）：

`content/llm-guide/2-核心原理与架构/2.3-高效与稀疏注意力/2.3.2-稀疏与压缩注意力/08-QSA-Qwen稀疏注意力/images/fig-qsa-hybrid-slot.png`

按拓扑换参考，不要按论文题目：

| 要画的拓扑 | 优先参考 |
|---|---|
| 层间插槽 / 正交肘线 / 成对平行箭 | 上面 QSA 默认 |
| 残差 / 门控读写 | `2.1.3-残差连接/03-Gated-Residual/images/fig-gr-elem-read-scalar-write.png` |
| MoE 路由 / Top-K | `2.4.1-混合专家模型MoE/images/fig-moe-router-top2.png` |
| EP / All2All | `6.1.8-MoE系统与并行/08-MoE系统优化综述/images/fig-moe-ep-alltoall.png` |

### Planner

在调用工具前，对话里先列出（可短，但必须有）：

1. 每个框：`id`、颜色、网格位置。
2. 每条线：`source_id.edge → target_id.edge`，实/虚，单向/双向，标签写在 **走廊** 不写框内。
3. 主方向：左→右 **或** 上→下，一张图只选一种。
4. `C`：一句图注（读者从这张图应读出什么）。只讲图里在干什么。不要写 `（Author et al., YEAR；2026-08 自绘）`，也不要把 prompt 写进读者页 HTML 注释。

### Stylist

`P*` = Planner 清单 + 下面两段 **原文**（缺任一段 = 不合格）+ NeurIPS 粉彩（圆角过程框、浅填充深描边、模块名无衬线、变量衬线斜体）。完整美学见 `paperbanana-neurips-style.md`。

`GenerateImage` 参数：

- `description` = `P*`
- `filename` = `fig-kebab-case.png`（不要目录；落点仍是笔记旁 `images/`）
- `reference_image_paths` = Retriever 那 1 张
- `aspect_ratio`：架构总览用 `"16:9"`；竖向层级用 `"3:4"` 或 `"4:3"`

## LIGHT THEME ONLY（整段粘进 description）

`LIGHT THEME ONLY: solid white or off-white canvas, dark charcoal text and arrows, pastel filled boxes with dark outlines. NEVER dark mode, NEVER black/navy/charcoal background, NEVER white text on dark panels, NEVER inverted colors. white academic background, no watermark, no logo, no copyright text, no website URL`

## CONNECTOR GEOMETRY（整段粘进 description）

`CONNECTOR GEOMETRY (fail the image if any rule is broken): Orthogonal polylines only — horizontal and vertical segments, 90-degree elbows, no freehand Bezier except one clearly labeled feedback loop. Every arrow has exactly one start box and one end box. The shaft STARTS at the midpoint of a box EDGE and ENDS at the midpoint of a target box EDGE. Never start in empty whitespace. Never start from a floating text label. Arrowheads NEVER enter the fill of a box; leave a clear gap between the triangle tip and the destination stroke; arrowheads NEVER overlap numbers or labels inside boxes. Default arrows are ONE-WAY with a single small filled isosceles triangle. Bidirectional arrows are forbidden unless the caption explicitly says bidirectional. Do not put heads on both ends of a dashed gate/mask line. Arrowheads are sharp triangles, not ink blobs, not smeared chevrons, not double-outlined. Lines never cross the interior of unrelated boxes; route through gutters. Solid = forward data; dashed = auxiliary (mask, gate weight, skip, copy-weights). Boxes sit on a grid with 8–12px gutters so arrows have a corridor.`

## Phase 2 — Visualizer ↔ Critic

每一轮：`GenerateImage` → 立刻 `Read` 生成的 PNG（不要凭记忆）。

Critic 只判这些（对齐论文：忠实、简洁、可读 + 本库接线）：

- [ ] 源文里的关键模块都在，没有多造一个论文没有的块。
- [ ] 白底深字，无水印。
- [ ] 每条线能指回 source 框和 target 框。
- [ ] 没有箭头头埋进色块。
- [ ] 没有未声明的双向箭头。
- [ ] 没有标签旁边凭空出线。
- [ ] 箭头头是干净小三角。

失败：改 `P_t` 里的 **线清单 / 缺块**（不要只加「请画清楚」），同一 `filename` 再 `GenerateImage`。禁止 Delete 旧文件再换名，除非用户点名。

用户已经说「挺好」→ 入库。不要用读图工具的文字描述当否决票——那层描述会把可接受的箭头也报成穿框/双向/墨团。只有人眼也明显坏、或用户点名坏，才重画。

三轮仍把箭头画进框里：改 mermaid，或 `scripts/draw_connectors.py` 矢量补线。拓扑正确优先于粉彩。禁止手绘假坐标曲线冒充论文 Figure。

## 本库已踩过的病（再犯 = 不合格）

| 病 | 例子 | 修法 |
|----|------|------|
| 未声明的双向箭头 | DeepSeek-MoE 右侧虚线两头都有箭头 | 门控虚线只从 Top-K **向下**进 ×；× 到 + 用 **实线单向** |
| 箭头伸进填充 | Top-K STE 右侧虚线箭头扎进格子、压住数字 | 箭头停在格子 **顶边外侧**，和描边留缝 |
| 线从空白长出来 | SPIN 的 $y$ 不从绿框底边伸出 | $y$ 与 $y'$ 对称：都从源框底边中点向下再肘到损失框 |
| 箭头头糊成墨团 | EP All2All 右上角多线汇成一坨 | 少交叉；每条线自己的小三角；不要四条线共用一个糊点 |
| 好对照 | `fig-qsa-hybrid-slot.png` | 层间竖箭停在框边；GR 左右成对平行箭 |

## PaperBanana 线型（摘要）

完整原文见 `paperbanana-neurips-style.md` §C。

- 架构图用 **正交/直角肘线**（矩阵、张量、插槽）。
- 实线 = 前向数据；虚线 = 辅助（梯度、skip、loss、门控）。禁止同一线型混用数据流和梯度。
- 模块名无衬线；公式变量衬线斜体。
- 左→右流水线，或上→下层级；一张图一种主方向。
- 对齐隐式网格；组内间距 < 组间间距。
