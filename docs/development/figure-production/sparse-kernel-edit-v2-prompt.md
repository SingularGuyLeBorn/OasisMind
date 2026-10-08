# 内核图 v2 局部编辑提示词

Use case: precise-object-edit. Edit this technical teaching diagram, preserving all correct numbers, Chinese typography, white/navy/cyan style and two-panel composition. Only repair these scientific details:
1. Upper cache box MUST have continuous routed arrows down to BOTH lower K input box and V input box. Label separate routes K and V; endpoints touch those boxes. Do not connect Q to cache. No suspended arrows.
2. Each compressed 64-slot cache strip ends at offset 63. For physical page41 show offsets 0,1,2,…,63 with 1,2,63 cyan. For page7 show offsets 0,1,2,…,63 with 0,1,63 cyan. NO cells or ellipses after 63. All remaining indicated cells grey.
3. Replace entire accumulator box content with these legible exact lines, widen/reflow locally if needed:
“累计状态 (m, l, o)”
“m′ = max(m, m_b)”
“旧状态乘 exp(m − m′)”
“本块状态乘 exp(m_b − m′)”
“分别相加分母 l 与分子 o”
This means rescale BOTH local and existing partial sums before addition. Final output remains o/l.
4. Footer first invariant replace with “Q 来自当前层投影；K/V 来自已写入缓存。” Footer third replace with “合并前按统一最大值 m′ 缩放旧状态与本块状态。”
Preserve S={1,2,63,64,65,127}, indices=[0,1], indptr=[0,2], table[0]=41 table[1]=7; K,V shapes128×d; Q1×d; QKᵀ/√d; masks candidate/padding/causal; unnormalized P_j=exp(z_j−m_b), l_b=ΣP_j,o_b=ΣP_jV_j. Six selected slots out of128 loaded. Retain independent Q→dotproduct,K→dotproduct,V→weightedvalue paths. Clear straight rectangular boxes, complete readable arrows; no decorative illustration or production/source notes.
