# 编辑流对齐与生成配图

## 来源与范围

实际下载并查看 [Edit Flows v1](https://arxiv.org/pdf/2506.09018v1) 第 2 页 Figure 1–2 和第 4 页 Figure 3. 保存第 4 页为 editflows-source-page4.png. 教学图展开 Figure 3 的辅助对齐与实际输入关系, 用自拟 A B C → D C E 示例, 不复制实验数据. 内置生图接口无法指定或确认 Image 2.5 版本.

正式图位于 content/DiffusionLanguageModels/2-数学与生成机制/2.2-训练目标与离散分数/images/fig-edit-flows-alignment.png. 两次候选分别保存在本目录 fig-edit-flows-candidate.png、fig-edit-flows-connectors.png.

## 验收

对齐源 A B C ε, 目标 D ε C E, 中间 D B C ε, 去空位得到 D B C. 替换、删除、保持、插入按列对应. 删除 B 后插入 E, 或先插入 E 后删除 B, 都得到 D C E. 实际序列与时间进入网络, 对齐空位不进入词表. 两条轨迹是可能编辑顺序, 不表示确定输出或两条轨迹概率相同. 生成的每次编辑需要重新评估速率, 示意分支合并不表示免去网络调用.

首轮投影连到轨迹而不是输入, 第二轮输入连接仍有缺口, 第三轮已修正. 最终实际查看, 箭头连续、端点明确, 无非必要矩形重叠. imagegen 和 scifig skill 用于结构分析、局部生成和回读.

## 完整提示词

### 1

```text
Scientific-educational Chinese technical teaching diagram, wide 16:9, white background, crisp navy teal amber muted rose, regular aligned rectangles, dense useful mechanics not cartoon. Reference provided paper page Figure 3 for training/projection logic ONLY, not copy text or paper provenance onto image. Title '编辑流: 对齐监督与可变长生成'. Two broad regions, left auxiliary training, right actual state and edit actions, bottom explicit distinction. Use toy token labels A B C D E, not experimental data. Left title '辅助对齐 · 仅用于训练'. Four equal columns numbered 1 2 3 4. Row z₀ exact [A,B,C,ε]; row z₁ exact [D,ε,C,E]. Column annotations '替换 A→D', '删除 B→ε', '保持 C', '插入 ε→E'. Between endpoint rows show intermediate row z_t exact [D,B,C,ε], label '已完成替换'. Connect intermediate row by single solid complete arrow labeled '去掉 ε' to actual input token row x_t [D,B,C] on right, label '模型只读取实际序列与时间 t'. Model rectangle θ below actual row with solid arrow input, next outputs three properly connected regular rate cards: '插入速率', '删除速率', '替换速率'. Explain output '预测可能编辑的速率'. Below actual model draw two illustrative allowed separate one-edit branches from current [D,B,C]: branch '删除位置 2' gives [D,C], branch '在 C 后插入 E' gives [D,B,C,E]. Then both branches each one more clearly labeled edit and complete arrow merge into shared final [D,C,E]: first '在 C 后插入 E'; second '删除位置 2'. These two branches illustrate alternative edit orders, NOT model deterministic outputs. Label above diamond-style branches '两种编辑顺序 · 示意'. Do not use probability numbers. Rates output connect to a branch-choice small label '按速率采样编辑' immediately upstream of both branches, all source/destination endpoints explicit. Bottom small strip 'ε 是对齐空位, 不属于模型词表' and '每轮编辑后重读当前序列, 位置随插入与删除改变'. Avoid undefined symbols besides z₀,z₁,z_t,x_t,θ,t defined locally as 对齐源/对齐目标/中间对齐/实际序列/网络/时间. No English-Chinese translation pairs, no source Figure notes. No dangling connectors, no accidental broken lines, no overlapping rectangles. Clearly distinguish auxiliary training alignment from generation trajectory. All branch output exact order above.
```
### 2

```text
Edit only connectors in this image, preserve all exact rows tokens labels layout colors and rectangles. Projection arrow labeled 去掉 ε must go from left z_t row [D B C ε] to right TOP x_t row [D B C], NOT to dashed lower generation branch area. Remove old horizontal projection arrow at midheight completely. Route a clean continuous orthogonal arrow through available whitespace from right boundary of left z_t ε cell, up beside central divider, then across to LEFT boundary of TOP x_t D token row, with small label 去掉 ε near routed connector. Add a clear complete solid arrow from bottom center of TOP x_t [D B C] token strip into TOP boundary of θ network, joining time input if necessary with explicit junction. Existing time t line remains connected θ. No crossing over labels. Do not create source-less arrows or connectors. No other change.
```

### 3

```text
Precise connector correction ONLY. Top actual token row D B C: add label x_t above row (do not remove 实际序列). Its bottom midpoint must connect visibly with a continuous vertical line to TOP boundary of θ box, ending with arrowhead at θ box. Currently line begins below caption and is disconnected from tokens: remove that disconnected segment, move caption 模型只读取实际序列与时间 t to right of vertical connector in empty area so line not crossing any text. Existing time t connector join vertical line with visible filled junction. Preserve all other content exactly, all toy tokens and branches and projection.
```
