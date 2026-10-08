# SDTT 目标收集 v6 正式图

正式路径: `content/DiffusionLanguageModels/5-训练-后训练与迁移/5.2-少步与轨迹蒸馏/images/fig-sdtt-target-collector-v6.png`. 来源与 v1–v4 记录见 `sdtt-target-collector.md`.

## 实际文章显示检查

本轮重新实际查看正式PNG原尺寸. 教师两个状态条带、位置2首次分布保留、位置4新揭开与位置5仍掩码的最终分布均与正文一致. 学生读取原输入, 表格软目标流入反向KL, 虚线只更新学生. 该图描述一条教师采样路径上的目标收集, 不表示跨轨迹算术平均;正文新增的期望反向KL几何目标推导与此图互补. 未发现冗余双语标签、非必要重叠或悬空连接. 当前保留v6, 本轮没有新站点截图.

当前确认3003端口静态服务进程34904监听, SDTT文章返回HTTP 200. v6图实际解码, 源尺寸1536×1024;1280px视口中显示800×533, 390px视口中显示362×241. 两张实际截图分别为 `sdtt-site-target-desktop.png`、`sdtt-site-target-mobile.png`, 均已逐张查看.

桌面图中教师状态AM CMM F依次推进为ABCMMF与ABCDMF, 学生独立读取原始AM CMM F. 位置2保存第一步分布且第二步不覆盖, 位置4保存第二步揭开分布, 位置5仍为M而取最后一步分布. 反向KL的第一参数为学生分布, 第二参数为停止梯度的软目标, 虚线更新箭头回到学生. 状态条带、分布表与两条输入路径完整, 未发现截断或遮挡. 手机主结构可辨, 分布上下标与细标签需放大, 不将免缩放公式阅读标记为通过. 以上只补实际站内显示证据, 未重新生成图片, 也不替代全文来源和公式审查.

v5 改为按位置排列的目标来源表, 避免跨行折线. v6 去掉位置2从第二步列旁出发的歧义长箭头, 由目标等式与文字明确第一步来源. 旧卡片和所有候选保留. 实际查看源分辨率输出及本地只读 HTML 的800px显示, 位置索引、两步状态、目标等式、KL 参数方向、冻结与更新对象可读, 无断线或遮挡. 此为固定正文宽度预览, 尚非公开站完整页面或移动端验收. 表中条形只有示意类别偏好, 不作为数值分布或实验数据. 使用内置生图, 接口无法确认 Image 2.5 模型版本.

### v5 完整提示词

```text
Create a NEW scientific-educational Chinese SDTT mechanism figure, do NOT reuse previous failed layout. Reference image paper Figure3(a) conveys soft-target selection per denoising step; borrow mechanism only, no experimental curve. White background, navy headings, restrained teal/orange, regular rectangles, no illustration/cartoon. Landscape 1536x1024, readable at 800px. Title "SDTT：教师走两步，学生学一次预测". Subtitle "六位置教学示例；M 表示掩码，字母表示 token 类别".

Upper left, small full-width horizontal teacher timeline, complete arrows:
Original strip positions1..6 "A M C M M F", label "原输入 zₜ". Arrow into "教师 θ（冻结）· 第1步", arrow to strip "A B C M M F". Arrow into "同一教师 θ · 第2步", arrow to strip "A B C D M F". These strips align, each exactly six separate rectangles. Step1 newly reveals position2, step2 newly reveals position4, position5 remainsM. Label each change locally. Timeline can run across two rows if needed for width, no overlapping arrows.

Main central area: large explicit 3-row TABLE with aligned columns "位置", "第1步教师分布", "第2步教师分布", "保存的软目标". Each row one masked position: 2,4,5. Probability vectors use 4 simple bars purely schematic, no numerical values. Definitions q_i^(j) teacher category distribution at stepj; qtilde target. row2 first-step q₂⁽¹⁾ mini-bars highlighted orange. Second-step column has plain "已揭开：不覆盖" gray. Horizontal orange arrow from FIRST-STEP q₂⁽¹⁾ mini-chart goes right through blank margin ABOVE gray words into saved q̃₂=q₂⁽¹⁾ chart, label "首次揭开时保存". row4 first-step q₄⁽¹⁾ gray mini-bars label "仍为M"; second-step q₄⁽²⁾ orange minibars. SHORT STRAIGHT horizontal arrow from SECOND-STEP q₄⁽²⁾ into saved q̃₄=q₄⁽²⁾. row5 first-step q₅⁽¹⁾ gray mini-bars label "仍为M"; second-step q₅⁽²⁾ teal minibars. SHORT STRAIGHT arrow from SECOND-STEP q₅⁽²⁾ into saved q̃₅=q₅⁽²⁾, label "仍为M：取最后一步". Every arrow stays INSIDE its table row; no vertical target collectors, no crossing rows, no dangling stubs. For row2 long arrow, provide top whitespace inside row so it doesn't overlap chart/graywords. Targets are full distributions, NOT sampled B,D letters. Footnote "qᵢ⁽ʲ⁾：教师第 j 步分布；q̃ᵢ：保存的目标分布". No positions1,3,6 in table.

Bottom separate student pipeline:
six-cell original strip "A M C M M F" -> box "学生 ν：一次前向" -> 3 probability rows s₂,s₄,s₅ -> loss box "反向 KL" and exact formula "Σᵢ KL(sᵢ || q̃ᵢ)" smaller "i ∈ {2,4,5}". A single target arrow from final table-column bottom border to loss top border labelled "软目标：停止梯度". Dashed gradient arrow from loss bottom border back to student bottom border labelled "仅更新学生 ν". Note "学生始终读取原输入；不读取教师新生成的 B、D". Note "原先可见的位置 1、3、6 不计损失". Teacher timeline relates to table by exact matching step/position labels; do not add confusing connectors through cells. All arrows have explicit source and endpoint. No provenance text in graphic. No latency facts, no benchmark numbers, no redundant English translations. Keep s first argument and qtilde second.
```

### v6 完整提示词

```text
Edit only the row for position2 in this SDTT figure. Keep ALL other objects and text exactly unchanged, especially correct reverse KL KL(s_i||qtilde_i), q4 and q5 targets, state strips and student. The orange arrow "首次揭开时保存" currently begins beside gray "已揭开：不覆盖", which misleadingly suggests taking second-step output. REMOVE that row2 orange arrow entirely, including arrowhead. Replace its annotation with plain text "目标取第1步；第2步不覆盖" in same empty region without any connector. The existing target equality qtilde2=q2^(1) and orange distribution already explicitly identify source. Do NOT draw another row2 arrow. Keep row4 and row5 arrows unchanged. Preserve all layout and readable text.
```
