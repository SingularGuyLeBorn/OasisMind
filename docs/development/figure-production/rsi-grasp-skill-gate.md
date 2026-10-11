# GRASP 技能准入流程图制作记录

正式图: [grasp-skill-gate.png](../../../content/RecursiveSelfImprovement/3-脚手架层/3.1-脚手架改进/images/grasp-skill-gate.png), 用于 `3.1.2-技能记忆与Harness.md`. 图片为 1024 × 1536 像素的 PNG, 1,692,768 字节; SHA-256 为 `c591ac059093f30a7e222a04a0764e3cbe1affa984a7f3672efd7c0b3b8c2173`. 图里没有实验曲线、实测数据或教学示例数值.

## 官方依据

- Johannes Moll 等, [*GRASP: Gated Regression-Aware Skill Proposer for Self-Improving LLM Agents*, arXiv:2605.29668v3](https://arxiv.org/html/2605.29668v3), 2026-08-21. 制作前实际打开 [官方 PDF](https://arxiv.org/pdf/2605.29668v3), 用 PyMuPDF 渲染第 1 页并查看 Figure 1, 同时核对网页正文的 §2.2、§2.3 和附录 B.3.
- Figure 1 给出「执行任务并收集轨迹 → 按失败机制分组 → 提出增、改、删技能候选 → 平衡留出探针上重跑 → 准入或拒绝」的顺序. §2.3 给出探针来源、当前库重跑基线与双重准入条件. 附录 B.3 说明无效动作回归在净得分中会被加权, 硬回归约束仍使用未加权计数.

## 实际制作方式

先依据官方原图试制横版候选, 但反馈线的起点和方向不够明确, 未采用. 正式版重新从文字提示生成竖版机制图;**这一步没有把论文 Figure 1 作为图像参数传入**, 它的机制依据来自此前对原图、图注和 §2.3 的人工阅读. 随后把竖版候选作为参考图传入同一生图工具, 只修正图中 $F_0$、$R_0$ 的解释, 再次查看输出并选定入库. 图像由 Codex 内置 `image_gen.imagegen` 接口生成与编辑;接口未返回可核实的底层模型版本, 因此不把它标成已确认的 Image 2.5. 未使用 PPT 或代码重绘正式图.

以下两段是**最终入库图对应的实际主生成提示词与实际局部修正提示词**, 可以从本次工具调用记录核对. 更早横版弃稿的首次提示词未完整保留, 这里不冒充全流程的完整提示记录.

### 正式版主生成提示词

```text
Create a NEW ORIGINAL publication-grade Chinese educational mechanism figure, PORTRAIT 2:3 aspect ratio for mobile reading, for a technical article about the GRASP agent skill library paper (arXiv:2605.29668 v3, Fig.1 as methodological reference only, not copied). Design a single vertical flow with FOUR full-width numbered stages stacked from top to bottom; one thick downward connector ONLY between adjacent stages, terminating precisely at the next stage. White background, restrained navy/teal/coral palette, sharp typography, no cartoon people, no unrelated iconography, no ornamental arrows. Large Chinese labels readable on a phone; minimal text but mathematically precise. Exact content: 1 ‘采集轨迹’ : current skill library S + Agent + environment yield failing and passing trajectories. 2 ‘构造候选’ : use failure mechanisms and sample passing traces to propose one change c: add / edit / remove a skill; apply c to a BRANCH to form S^c, while baseline S remains unchanged. 3 ‘留出探针同题重跑’ : previously failing AND previously passing held-out tasks; compare S and S^c on the SAME probes. This yields F(c), number of formerly failing cases fixed, and R(c), formerly passing cases broken; baseline counts F0, R0. Clearly show BOTH S and S^c feeding comparison, no dangling arrows. 4 ‘准入门槛’ : reproduce exact formula ‘(F(c) − F₀) − (R(c) − R₀) > 0’ AND ‘R(c) ≤ R₀’. Beneath decision, two distinct short outcomes without outgoing arrows: GREEN ‘通过：S^c 成为下一批任务使用的库’ and RED ‘拒绝：继续使用 S’. No cycle arrow, no line that touches both outcomes, no additional boxes. No huge blocks of prose. Respect math notation exactly. Keep stage order and flow unambiguous. No English words except Agent and symbols S, S^c, F, R, c. Avoid deforming rectangles, crossing lines, ambiguous arrow source/destination. High-resolution bitmap PNG.
```

### 正式版局部修正提示词

```text
Make a precision text correction ONLY in the rightmost white ‘得到性能变化’ box of stage 3 in this existing portrait technical diagram. Keep every other pixel/layout/arrow/formula/colour/label unchanged. The current F₀ and R₀ explanations are inaccurate. Replace those two lines with exact concise Chinese text: ‘F₀：原库 S 重跑时，原失败任务被修复数’ and ‘R₀：原库 S 重跑时，原成功任务被破坏数’. Preserve the existing F(c) and R(c) lines. Do not change F₀ and R₀ in the formula. All typography legible, no spelling mistakes. No other changes.
```

## 入库前复核

1. 图中当前技能库 $S$ 经一次增、改或删操作 $c$ 才产生分支库 $S^c$;被拒绝时继续使用 $S$, 通过时下一批任务使用 $S^c$. 这与 Figure 1 及 §2.2 一致. 图中的两个结果框均没有指向下一轮的含糊回路.
2. 留出探针同时包含此前失败和此前成功的开发任务, 与产生候选的当前批次分开. 对同一批探针分别运行 $S$ 与 $S^c$. $F_0$ 是 $S$ 重跑时原失败任务被修复数, $R_0$ 是 $S$ 重跑时原成功任务被破坏数; $F(c)$、$R(c)$ 是 $S^c$ 在相同两组任务上的对应计数. 图中的最终文字与 §2.3 一致.
3. 图中两道门为 $(F(c)-F_0)-(R(c)-R_0)>0$ **且** $R(c)\leq R_0$. 第一项要求相对当前库有正的净收益, 第二项单独限制新回归. 两个条件、变量上下标和通过/拒绝分支已逐项对照 §2.3 式 (1).
4. 图展示的是正文主门槛, 没把附录 B.3 对无效动作回归的加权细节挤进图面;技术正文在图后单独说明该例外. 本图不包含论文实验数字, 不能拿它推断 GRASP 的实测收益.

已按原始 1024 × 1536 尺寸重新查看正式 PNG, 并用 Pillow 验证文件格式、尺寸和可解码性. 未在移动端网页实际测量最终展示宽度;竖排布局仅为降低缩放后的阅读负担.
