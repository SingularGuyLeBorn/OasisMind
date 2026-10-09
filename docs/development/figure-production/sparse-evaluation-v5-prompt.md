# 联合评测图 v5 提示词

Scientific-educational Chinese technical bitmap teaching figure landscape1536x1024 white/navy/cyan/amber. NEW layout, no reference. Title “把选择差异与执行差异分开”. Use exactly three aligned horizontal rows, source-input left; outputs and comparisons right. At left card “同一层、同一查询 q₅” “固定Q/K/V与输入精度” with branches to three rows. This is ONE query at position5, all six historicalpositions0..5 are causalallowed. NO 2D matrix anywhere.
A row “完整合法集合” tokenstrip exactlysix cells labelled0,1,2,3,4,5 allcyan→“高精度参考计算”→oᵈ.
B row “固定候选S={1,3,5}” strip exactly0,1,2,3,4,5; ONLY1,3,5 amber,otherwhite→“同候选参考计算”→oʳ.
C row “共享同一S={1,3,5}” identicalsixstripONLY1,3,5 green→“稀疏内核” withsmallinternal“地址映射→mask→分块合并”→oᵏ.
Explicit connection from B candidate strip/source to C candidate strip/source labelled冻结后复用. Arrowends MUST touch exact candidate card boundaries, no outerrowframes. No independent recomputation ofCselection. B/A use same higherprecisionreference compute. Inputs same precision; no dtype labels needed.
oᵈ andoʳ connectto “选择差异 E_sel=‖oᵈ−oʳ‖₂”.
oʳ andoᵏ connectto “执行差异 E_exe=‖oʳ−oᵏ‖₂”.
Connections separately routed no unintendedjunction. Colorsnotonlydistinction, rowlabelsA/B/C. Smallcaptionunder strips “彩色位置参与计算；白色位置被mask”. No interpretation thatCsharesKVfromBprojection;inputsQKVfixed acrossallthree.
Bottom left table “600条样本配对计数（教学示例）” columns sparse正确 sparse错误; rowsdense正确 dense错误; cells52626/939. nexttothistable dense552/600=92.0%,sparse535/600≈89.17%,ΔAcc=(9−26)/600≈−2.83个百分点.
Bottomright “同批请求记录” labels证据覆盖与候选页数,实际KV字节,索引、内核与请求时延. All Chinese clear literal text, no fabricatedplots, no confidenceintervals,nosource/productionnotes. Preserve consistentquery single6strip semantic, obviousreadablepaths notdecorativecards.
