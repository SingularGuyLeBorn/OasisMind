---
name: remotion-code-motion-explainer
description: Remotion 连续讲解动画。细节在 references/；工程落 apps/algo-viz，成片 content/uploads/viz。
kind: procedural
enabled: true
version: "0.2.0"
---

# Remotion Code Motion Explainer

先 `skill_view` 本包，再按需读 `references/`（勿一次灌全文）。

## 入口

| 需要 | 读 |
|------|-----|
| 每次成片 | `references/code-motion-design.md` + `motion-production-patterns.md` |
| 交付前 | `references/production-and-qc.md` |
| UI/产品动效 | `references/ui-motion-shot-library.md` |
| 复刻参考片 | `references/reference-reconstruction.md` |
| 可复用镜头 | `assets/shot-library/shot-library.json` → 复制到 `apps/algo-viz/`，勿改 skill 包 |

## 流程（短）

1. 把讲解拆成语义 beat（陈述 / 输入态 / 变化 / 输出 / 交接）。
2. 锁定视觉系统（网格、色义、持久物体），再写 `choreography-plan.json`。
3. 用 `algo_viz_create` 落工程（禁止 `write_file` 直写 `apps/algo-viz/**`）。
4. 成片后 `post_update` 插入 ` ```viz composition: {Id}``` `。

## 铁律

- 不编造产品行为/数据；字幕有声时以字幕为 timing 权威。
- 参数化视觉系统 > 一次性硬编码镜头。
