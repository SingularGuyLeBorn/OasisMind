Use case: scientific-educational.
Create a Chinese technical teaching figure for H2O KV eviction. White background, navy headings, restrained gold for heavy hitters, blue for recent positions, red outline only for the evicted position. Landscape 1536x1024, large legible labels, aligned rectangular tables, no cartoon icons, no English translations in parentheses. Image 1 is the scientific reference: the paper's recent/heavy separation and score-based eviction, not its page layout or experimental numbers.

Title "H2O: 先更新累计分数, 再驱逐". Subtitle "单层、单 head 教学示例 · 总容量 B=6 · Heavy 3 + Recent 3".

Panel 1 (upper horizontal band): "第10步结束: cache 保留6项". Six token slots ordered 1,3,5,8,9,10. Each slot explicitly contains paired K/V labels k_i,v_i and the cumulative score. Scores respectively 2.40,1.70,1.20,0.30,0.20,0.00. Slots1,3,5 have gold header "Heavy"; slots8,9,10 have blue header "Recent". This is C_10={1,3,5,8,9,10}. No implication of six consecutive original positions. Original position labels stay visible.

Panel 2 (central, largest): "第11步: 追加 k_11,v_11, 临时候选7项". Explain D_11=C_10∪{11}. Seven aligned columns headed original positions 1,3,5,8,9,10,11. Three aligned numerical rows with row labels "旧累计分数", "本步attention权重", "更新后累计分数":
old = [2.40,1.70,1.20,0.30,0.20,0.00,0.00]
weight = [0.20,0.05,0.02,0.08,0.15,0.30,0.20]
updated = [2.60,1.75,1.22,0.38,0.35,0.30,0.20]
Formula "s_i ← s_i + a_11,i" and "Σ_i a_11,i = 1". A fourth aligned row "本步保护状态" says "竞争" for1,3,5,8 and "Recent保护" for9,10,11. Highlight position8 with a thin red outline and label "8离开Recent; 0.38为竞争区最低". Recent boundary between columns8 and9 clearly visible. On right or beneath this table, a well-separated note "当步输出 o_11 = Σ_{i∈D_11} a_11,i v_i, 使用7项". Make this the calculation from temporary candidates; it must not be wired from the six-slot post-eviction state. Use no extra arrows if alignment and labels are enough. All numbers exact.

Panel 3 (lower horizontal band): "驱逐位置8: 下一步携带6项". Six token slots 1,3,5,9,10,11, each with paired k_i,v_i and updated scores 2.60,1.75,1.22,0.35,0.30,0.20. Gold heavy slots1,3,5; blue recent slots9,10,11. Formula "C_11={1,3,5,9,10,11}". A clear note "位置8的K/V与分数一起删除; 原始位置编号保留".

Between panels2 and3 use exactly one short complete downward arrow labelled "累计分数更新后, 删除Recent之外的最低分项" connecting the actual panel boundaries. No floating, backward or broken arrows. Footer "当步输出用 D_11; 下一步cache用 C_11. 被驱逐KV无法在下一步重新选回". No publication/source/version notes on the image. All quantities are teaching values, explicitly marked 教学示例. Do not draw a perf graph or any measured speedup. Avoid a few empty boxes: numeric table, token strips, paired KV and recent boundary carry the mechanism.
