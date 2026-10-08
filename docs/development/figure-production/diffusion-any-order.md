# 任意顺序与并行揭示配图

## 科学依据与选题

正文: `content/DiffusionLanguageModels/2-数学与生成机制/2.3-生成因式分解与采样/2.3.1-任意顺序与概率因式分解.md`.

实际阅读 [RADD v2](https://arxiv.org/html/2406.03736v2) §3.3, 下载并查看 PDF 第 6 页 Figure 1、Figure 2 与 Theorem 2. 原图是缓存调用数和生成质量实验图, 不能拿来冒充排列机制图;整页查看存档为 `radd-source-page6.png`. PDF SHA256: `d4f2288d9b32cf91676abab6cdce64b755b90e542106469f5d324323d6c07c86`.

教学图根据概率链式法则与正文组合推导设计, 不重画上述实验曲线. 上半图用三个位置的两条揭示顺序展示条件集合增加, 下半图用二元相关分布区分逐个条件采样和同时独立采样. 示例联合仅有 00、11, 各概率 1/2;独立边际乘积四项均为 1/4, 非法组合总概率为 1/2. 所有数值是教学假设, 非论文实验数据.

## 生成与验收

使用内置 imagegen, 接口不能指定或确认 Image 2.5 版本, 不将其标记为已确认版本. 科学配图与 imagegen skill 用于组织对象、条件和连接. 已实际查看的 NSA 认可图作为配色、密度与清晰标签参考传入接口, 不复制其中的机制、三栏结构或制作说明. 旧图 `../images/fig-ao-arm-vs-ar.png` 保留, 候选通过数值、标签、箭头和正文尺寸检查后才进入文章.

首轮候选已查看并保存为 `fig-any-order-candidate.png`, 当前未进入正文. 两条路径的 token 位置、可见集合及条件概率与正文一致, 二元联合和乘积均已用 Fraction 复算. 首轮右下 Y 边际没有完整进入独立采样模块, 数据联合表到两个分支的连接有小缝;正在局部修线, 修改后需重新查看输出.

局部修订提示词:

```text
Edit only connectors in this exact scientific diagram, preserve ALL text, math, tables, numbers, colors, token strips and layout. In lower right, the Y marginal probability box currently has no outgoing connector. Add an intact orthogonal navy connector starting at its RIGHT border, going right to the shared vertical join with X branch, then joining the arrow that enters 独立采样，边际相乘. Both X and Y probability boxes must visibly feed that box, with no crossing text. In lower middle, close the tiny gaps between the 数据联合 table left/right borders and the two outward horizontal branch lines: extend lines to touch table borders. Keep existing branch downward arrows and do not draw a line through the table. No other changes.
```

第一次局部修线输出已保存为 `fig-any-order-connectors-v1.png`. 重新查看后发现 Y 分支仍缺少出线, 未通过验收. 第二次修订限定具体连接区域与转折点:

```text
Precise localized diagram connector repair, not regeneration. Image dimensions 1536x1024. Preserve every other pixel conceptually. Add a dark navy solid polyline in the lower-right region: start at RIGHT EDGE of Y probability box near (1105,868), go horizontally to (1122,868), then vertically UP to (1122,827). Join the existing shared line entering independent sampling box at (1145,827). Thus the lower Y box must have a visible outgoing line, matching upper X box. This missing line is mandatory; do not return identical image. Also extend the small source table outbound lines so left line touches x595 at y676 and right line touches x940 at y676; no whitespace gaps. Do not alter any formulas, probability values, Chinese text, colors, or other arrows. Output the same figure with only these three connector repairs.
```

第二次局部修订已保存为 `fig-any-order-connectors-v2.png`, Y 分支已进入独立采样模块. 定义分布表旁的连接仍有小缝, 且定义表不承担计算模块功能, 因此第三次修订删除这两条冗余流程连接, 保留各分支内部的计算箭头:

```text
Change ONLY two redundant arrows next to central 数据联合 table. Completely REMOVE both long dark-navy branching connector lines immediately LEFT and RIGHT of this table, including their down-pointing arrowheads towards the two lower comparison panels. Leave clean white space there. The table is an example definition, not a compute module. Keep all table contents and panel borders. Preserve EVERYTHING else, especially the newly repaired lower-right Y outgoing line into 独立采样，边际相乘, all upper trajectory arrows, text, formulas, probabilities, highlights, and positions. Do not add replacement lines or labels. Output identical figure except removal of these two table-to-panel branching arrows.
```

## 正式验收

第三次修订输出逐项查看后通过:所有轨迹位置、可见集合、条件标签、概率和归一化正确, Y 边际明确进入独立采样模块, 冗余分布表流程线已删除. 正式图片为正文 `images/fig-any-order-conditionals.png`, 1536×1024. 正文在图前定义 $S$ 与掩码状态, 图内定义二元教学分布, 图注与三条解析同步. 旧图与三个候选保留, 不再由正文引用旧图. 上半图用于条件链, 下半图用于条件相关性, 不把二元教学分布当成语言实验数据. 本切片完成该图验收, 本篇其他重复段落仍需继续处理.

## 提示词

```text
undefined
```
