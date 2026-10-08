# dParallel 活动块与正确性门控配图

## 来源与状态

- 科学来源: [dParallel v1](https://arxiv.org/html/2509.26488v1), §4.2、式 (4)–(8)、Algorithm 1.
- 实际查看: PDF 第 5 页 Figure 3, 本地参考 `dparallel-source-page5.png`;第 4 页也保留为来源材料.
- 候选: `dparallel-candidate-v2.png`, 内置 imagegen 实际生成, 接口无法指定或确认 Image 2.5 版本.
- 当前正式图: `content/DiffusionLanguageModels/5-训练-后训练与迁移/5.2-少步与轨迹蒸馏/images/fig-dparallel-training-gate-v6.png`. 旧正式图与所有候选保留.

v6 已用本地 HTML 预览实际查看:浏览器报告图片完整加载, 原宽 1536 px、显示宽 800 px. 活动位置、正确集合、两项损失、温度与参数更新的主要标签可辨认, 未发现图像裁切. 源分辨率科学连接复核与桌面正文宽度检查通过, 正文已替换引用、补就地变量定义和四条解析. 此检查不包含手机窄屏, 也不代表整篇其余段落已完成审查.

## 科学设计

12 位置目标为 A 至 L, 教学块长 4. 输入为 A B C D / M F M H / M M M M. 所有位置参与学生前向, 活动掩码位置 5、7 计算交叉熵;位置 5 预测 E 正确、位置 7 预测 J 错误, 熵项只使用位置 5 的低温分布. 教师离线生成目标, 学生参数由两项损失共同更新. 数值与位置均为教学示例, 不作为论文实验结果.

## 候选复核

token 状态、活动集合与正确集合、温度和损失汇合与设计一致. 图仍需局部修订:目标条带下的括号误标随机掩码和全掩码, 容易混淆目标与实际输入;正确集合框缺少来自正确性判断的连接, 低温 softmax 的 logits 输入没有明确连线. 修订后再检查正文尺度, 不以已生成认定正式验收.

## 生成提示词


### v4–v6 连线修订

三个候选均保留. v4 改为 logits 总线分流, v5 将总线连接至具体计算框但丢失源连接, v6 补回 logits 条带到总线的连接. 实际查看 v6:输入为 A B C D / M F M H / M M M M;普通 softmax、argmax 与低温 softmax 都有明确 logits 输入;标签同时用于交叉熵与正确性判断, 正确集合连接熵分支, 两损失汇合更新学生参数. 总线从 logits 条带抽取活动位置, 图注须解释为整条输出的选择接口, 不能误读为把 z7 数值复制到 z5. 源分辨率连接复核通过, 正文宽度检查仍待完成, 尚未嵌入正文.

v4 提示词:
Precisely edit only the connector routes of this diagram. Preserve ALL text, token cells, rectangles, distributions, loss formulas and colors. Erase the connector from the BOTTOM of 学生预测器 to the left branch. The predictor must have only its rightward output arrow into logits. Extend the existing logits selection bus (the horizontal navy line below logits at y≈524) leftward through empty gutter to x≈120, then DOWN into the TOP BORDER of 普通Softmax box at y≈637. Label that line 取z5,z7 in empty gutter. Extend its middle downward branch from y≈524 all the way INTO the TOP BORDER of the argmax box at y≈638, not stopping at the panel header. Extend its right downward branch all the way INTO the TOP BORDER of the low-temperature Softmax box at y≈638, label 取z5. These paths may cross panel boundaries but must never cross label text: add small whitespace by moving panel headings aside or making diagram slightly taller if necessary. Also replace the current gate arrow beginning arbitrarily near the words 仅选正确位置 with an arrow explicitly starting on the RIGHT BORDER of Mc={5} and ending on LEFT BORDER of the low-temperature softmax box; use 仅选正确位置 label above this connector. Keep the correctness-result-to-Mc connection and the other entropy/loss connectors. No orphan lines; every new arrow must touch exact destination compute box. Do not connect logits directly to loss without softmax. No other changes.

v5 提示词:
Edit this figure with one surgical geometry change ONLY: The three downward data arrows from the logits horizontal bus currently end on teal panel TOP borders, around y=560. They MUST continue from those panel border endpoints down to the three actual small white calculation boxes at y=635: ordinary Softmax, argmax, low-temperature Softmax. Route through blank gutters, moving headings aside as necessary. Draw a visible complete navy line from each bus to the actual small white compute box, with arrowhead touching that small box's top or side border. For ordinary Softmax use route left of panel at x=8 down to y=680 then right into its LEFT BORDER x=30, avoiding all text. For argmax route at x=635 (left margin of center panel) down to y=667 then right into box LEFT BORDER x=640. For low-temperature Softmax route at x=1320 (gap just right of box and left of chart) down to y=656 then left into its RIGHT BORDER x=1295. Remove the old downward arrowheads on panel borders. Preserve all other elements including token arrays, teacher, target, Mc gate, losses, text and bars. Do not invent any new content. No text overlap. Data arrows must physically terminate on computational objects, never panel headers.

v6 提示词:
Make ONE tiny connector repair only. The horizontal navy distribution bus at y≈518 is disconnected from the logits strip above. Add a solid vertical navy line from the BOTTOM BORDER of the highlighted z7 cell at x≈1095,y≈473 straight DOWN to meet that horizontal bus at x≈1095,y≈518, with a junction dot. Label selection is already 取z5,z7 so the strip is a bundled logits source; no additional label needed. Preserve every other pixel/element/text/line as much as possible. DO NOT remove or reroute any existing bus-to-softmax/argmax arrows. All three existing lines into white computation boxes MUST remain. Repair this one missing source connection and nothing else.

### v3 局部编辑与复核
保存 `dparallel-candidate-v3.png`. 已修正目标条带为三个明文目标块, 增加教学示例与标签目标连接, 删除冗余 Transformer 括注. 正确性判断已连接正确集合. 仍未通过:交叉熵分支仍从预测器底部出线、未从 logits 条带明确选择;低温 softmax 的 logits 连线停在分支区域边缘, 没有进入计算框. 下一版仅修这两条输入线, 保留其他已正确区域. 未嵌入正文.

编辑提示词: Edit this existing scientific diagram only to correct computation connections and target labels, preserving title, colors, layout, all token values, positions, formulas and loss merging. Top CLEAN target strip ABCDEFGHIJKL must have bracket labels "目标块1", "目标块2", "目标块3", not random/full masking. Lower noisy input labels remain unchanged. Teacher generates clean Y for masking and labels. Remove "(Transformer)" redundant subtitle. Correct branch routing: logits strip z1...z12 outputs selected z5,z7 via solid labelled connector "取活动位置5、7" to ordinary Softmax and argmax modules; these two modules must visibly have incoming arrows from logits, not mysteriously directly from the student predictor. Remove original student bottom fork that bypassed logits. Label target y5=E,y7=G is shared by CE and correctness comparison: use a solid arrow from target-label box to the correctness judgment box, routed in available gutter without crossing formulas. Connect correctness result "位置5...位置7..." explicitly to Mc={5}. Connect z5 selected from logits to low-temperature softmax explicitly, labelled "取z5"; connect Mc gate to selection on that z5 route, or clearly to low-temperature softmax with label "仅选正确位置". Low-temperature softmax outputs entropy. Remove old Mc direct arrow to entropy if gate now acts on selection. All connectors must have explicit start/end, no overlap or floating arrows. Maintain all12 input participating forward, only active masks5,7 CE, entropy only5;future no loss. Clearly label "教学示例" near blocklength4 text. No new numerical probabilities or experimental claims. If necessary enlarge gutters slightly to route complete arrows. Readable Chinese labels. This is diagram editing, do not redraw as a simple box flow.

### v2 初始提示词

Use case: scientific-educational. Make a detailed Chinese technical teaching computation diagram, landscape 1536x1024, white background, crisp dark navy sans serif labels, restrained blue/teal/orange, flat regular rectangles, no cartoon decoration. Title "dParallel: 活动块监督与正确性门控". This is a pedagogical expansion of training structure, not a reproduction of experimental curves. Everything numerical is labeled "教学示例". NO source captions on canvas, NO redundant bilingual labels, NO L0/R0 node codes.

Top third: show target response Y as 12 cells with indices 1..12, values A B C D E F G H I J K L. Partition three blocks each four positions. Separate target-only lane from model input. The actual noisy INPUT is A B C D | M F M H | M M M M. Bracket labels "前块: 明文", "活动块: 随机掩码", "未来块: 全掩码". Define "M: 掩码位置". Text "本例块长4,活动块掩码率50%" and "目标Y仅参与标签与正确性判断". Only noisy INPUT arrow enters central "学生预测器"; no clean target arrow into predictor. Full input all12 positions participate in forward.

Middle: predictor outputs "各位置 logits". Highlight positions5 and7 only as activity mask set "Ma={5,7}". Split outputs into TWO parallel branches, not serial losses. Left branch ordinary softmax and label targets y5=E, y7=G -> CE with "L一致性=−(log p5(E)+log p7(G))/2". Right branch argmax comparison target yields "位置5: argmax=E,正确" and "位置7: argmax=J,错误"; "Mc={5}" then entropy via temperature softmax logits/T, "T=0.5", "L确定性=H(softmax(z5/T))". Show two illustrative mini categorical bar distributions with appropriate labels E dominant position5 and J dominant position7, label "分布仅作示意"; do not write fake probabilities. Position7 excluded from entropy branch but included in CE branch. Show z5 feeding temperature softmax directly, gate from correctness selects it; gate not numerical probability. Label "未来块无损失".

Bottom: BOTH loss arrows merge into "L=L一致性+β L确定性", β=2, then distinct dashed gradient arrow labeled "反向更新" to "学生可训练参数". Teacher offline branch small separate labeled "教师生成Y,参数冻结", feeds target Y lane only. No arrow from teacher to student's input except masking process legitimate noisy state derived from target. Distinguish dataflow solid and gradient dashed in small legend. Labels must remain readable at800px displayed width. All arrows connect explicit ports, no overlaps or broken lines. Include brief bottom summary "猜错位置用交叉熵纠正;猜对位置再压低熵". Reference paper image only for scientific context, do not copy its confidence evolution curves.
