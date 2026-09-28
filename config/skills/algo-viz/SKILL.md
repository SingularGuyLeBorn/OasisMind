---
name: algo-viz
description: "算法讲解动画（MLA/PPO/Attention 等）。用 algo_viz_create；细节见 references/"
kind: procedural
enabled: true
version: "0.3.1"
---

# algo-viz

文章转短片走 `wechat-article-remotion`，不要用本包硬套长文。

## 验收

1. 白底教学风；片内有公式与短旁白条
2. 每拍：输入 → 动作 → 可见结果 → handoff
3. 至少一处对照；先静帧再动

详规：`skill_view(name="algo-viz", file_path="references/algorithm-explainer-pedagogy.md")`  
镜头/流程：先 `skill_view(name="remotion-code-motion-explainer")`

## 硬约束

- 唯一创建工具：`algo_viz_create`（禁止 `write_file` → `apps/algo-viz/**`）
- 嵌入：` ```viz composition: {Id}``` `
- 禁止让用户跑部署脚本
