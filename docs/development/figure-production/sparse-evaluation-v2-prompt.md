# 联合评测图 v2 提示词

Use case: scientific-educational. Create a Chinese technical teaching diagram 1536x1024 landscape, white background, navy text, restrained cyan/amber accents, crisp rectangles and fully connected arrows. No cartoon, no perspective, no icons substituting scientific content. Title “把选择误差与执行误差分开”.
Top left shared input card “同一请求、权重与精度” with request_id=R42, fixed Q/K/V labels. Branch into exactly THREE parallel horizontal rows:
A “完整合法集合” → miniature causal mask (illustrative, no fabricated numerical cells) → “高精度注意力” → oᵈ.
B “固定实际候选 S” → miniature mask with only selected cells → “同候选参考实现” → oʳ.
C same candidate S (MUST explicitly be shared/frozen between B/C, connect S source to both B and C; not regenerate indexer) → “待测稀疏内核” with inline small sequence “地址映射 → mask → 分块合并” → oᵏ.
To right comparisons in two stacked cards with explicit connections from named outputs:
“选择差异 E_sel = ‖oᵈ − oʳ‖₂”
“执行差异 E_exe = ‖oʳ − oᵏ‖₂”
Do not connect oᵈ vs oᵏ and claim exact sum. Under cards one small condition “先固定候选，再比较实现”.
Bottom separate framed example “600条样本的配对计数（教学示例）”, actual 2×2 TABLE with COLUMN sparse正确, sparse错误 and ROW dense正确, dense错误:
526 | 26
9 | 39
Below exact computations “dense：552/600=92.0%” “sparse：535/600≈89.17%” “ΔAcc=(9−26)/600≈−2.83个百分点”.
Bottom right metric card “同批请求还要记录” with three compact Chinese labels “证据覆盖与候选页数” “实际KV字节” “索引、内核与请求时延”.
Do not include plots, confidence intervals, claimed empirical accuracy, or unexplained concepts. Formula D defined directly as Euclidean norm here, probabilities notneeded. Output consumers end at named comparison boxes. Distinguish three data paths with row labels and line shape not only colors. All text readable atarticlewidth, no crossed labels or floating arrows, no production/source statements inside.
