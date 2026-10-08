# 索引器共享项与残差配图提示词

使用内置生图接口；接口不提供 Image 2.5 版本指定或确认能力。

```text
Use case: scientific-educational. Create a dense precise Chinese research teaching figure, landscape 1536x1024, white background, navy typography, blue linear path and amber residual path, thin complete orthogonal arrows, no cartoons, no decorations. Title「索引器：共享线性项 + 稀疏残差」. Top equation exact: I_s = Σ_h w_h ReLU(q_hᵀk_s) = (Σ_h w_h q_h)ᵀk_s + Σ_h w_h ReLU(−q_hᵀk_s). Define in small line「当前 query 的 q_h、w_h；历史共享 key k_s；ReLU(x)=max(x,0)」.
Main large diagram: stack q1,q2,...qH and signed w1,w2,...wH into weighted vector sum q̄=Σ_h w_hq_h, then arrow to dot product with historical key strip k1...kN, blue score strip labelled「共享线性项：所有头始终参与」. Below same q,w and legal historical keys into coordinate extrema per block, calculate「残差上界 S_h=|w_h| max_b ReLU(U⁻_h,b)」, select r heads, evaluate selected negative dot ReLU「Σ_{h∈A}w_h ReLU(−q_hᵀk_s)」 for every legal key. Orange residual score strip plus blue linear strip feed sum then token Top-k. Top-k then arrow to sparse main attention, with separate input labelled「主 attention 自己的 Q、KV」. Do NOT imply indexer K is main KV. Label routing「同一 query 选定的残差头用于全部合法 key；评分保留 w_h 的正负」. Legal keys go into both linear dot and residual computation; bounds routing selects heads only.
Bottom left numeric teaching example exact table columns q_h,w_h,q_h k,w_h ReLU(q_h k),w_h ReLU(−q_h k); rows head1:2,1,6,6,0; head2:−1,0.5,−3,0,1.5. heading「一维手算：k=3」. Show q̄=1.5, sharedlinear=4.5, residual=1.5, originalscore=6, sum4.5+1.5=6. Caption「只保留第2头残差，这个例子仍恢复原分数」.
Bottom right compact distinction three rows:「LISA：只用共享线性分数选 token」;「LISA†：线性阈值筛候选 → 完整多头精排」;「LISA‡：组首候选位置共享 → 各层自己的多头分数 → 各层自己的 Top-k」. In last row small two layer strips show same candidate positions {1,3,5,7} and differing final sets {1,5} and {3,7}, clearly label「示意位置」. All rectangular panels aligned no overlapping, no floating arrows. No performance claims no paper citations printed. Clearly readable Chinese, math signs correct especially minus inside residual, distinguish head routing from token selection.
```

## 第二版修改提示

修正数据依赖：加权 query 向量直接输入点积，不生成历史 key；合法 key 输入分块坐标极值与残差评分；主 attention 使用自己的投影。保留公式、手算与候选共享示意，移除悬空箭头。

## 第三版重新生成

```text
Use case scientific-educational. Generate a NEW Chinese scientific teaching diagram 1536x1024 white background, sharp navy text blue linear branch amber residual branch, rectangular aligned panels and complete arrows, no cartoons no decorative elements. Title 索引器：所有头的线性项，少量头的残差. Top identity I_s=Σ_h w_h ReLU(q_hᵀk_s)=(Σ_h w_hq_h)ᵀk_s+Σ_h w_hReLU(−q_hᵀk_s). ReLU(x)=max(x,0).
Use clearly separated horizontal rows with independent input copies per row to avoid crossing arrows. Row1 blue linear computation from left to right: input panel 当前 query: q₁…q_H，w₁…w_H → weighted sum panel q̄=Σ_hw_hq_h → dotproduct panel l_s=q̄ᵀk_s → blue vector l₁…l_N. A separate key strip k₁…k_N placed directly ABOVE dotproduct panel feeds straight DOWN into dotproduct. Keys are independent input NEVER a result of qbar. Label 所有头参与；每个合法 key 一次点积.
Row2 amber routing: key strip 合法历史 key → panel 分块坐标极值 → panel S_h=|w_h|max_bReLU(U⁻_h,b) → panel 按上界取 top-r 头: A. Additional independent query input box q_h,w_h directly ABOVE upperboundpanel feeds straight DOWN into it. U⁻ is label 第b块负点积上界. Caption 选择头，不选择token.
Row3 amber residual: independent input 当前 query 的 q_h,w_h → panel r_s=Σ_{h∈A}w_hReLU(−q_hᵀk_s) → amber vector r₁…r_N. Independent strip 同一批合法 key directly ABOVE residual calculation feeds straightDOWN. A fromrow2 goes down into residual calculation via complete line. Label 同一query的A用于全部合法key；评分保留w_h正负.
At far right blue vector and amber vector each have complete arrows into sumcircle+, then I_hat_s=l_s+r_s then Top-k then selectedpositionsstrip then 主attention. Show own separate input 主attention的Q、KV into lastblock. Mainattention keynotindexerkey. No source arrows to rawinputs.
Bottom panel one-dimensional toy table: k=3; columns 头,q_h,w_h,q_hk,原ReLU贡献,负点积残差; row1:1,2,1,6,6,0; row2:2,−1,0.5,−3,0,1.5. Beneath qbar=1.5; l=4.5; r=1.5; 原分数6=4.5+1.5. 教学例：只选第2头残差可恢复原分数.
Bottomright panel concise method table LISA: 线性分数直接选token; LISA†: 线性阈值筛候选，完整多头精排; LISA‡: 组首候选位置共享，各层独立精排和Top-k. show illustrative sharedpool {1,3,5,7}, layer1final{1,5},layer2final{3,7}. Label 示意位置. Avoid dangling arrows, unrelated English translations, overlapping text, accidental arrows from one input to another. Prioritize mathematically correct complete endpoints over decorative flow.
```

## 第四版局部修改

```text
Edit only three data-flow/text defects in this image, all other exact formula/table/title/layout preserved. (1) Middle routing orange box 分块坐标极值: replace its body with 历史 key 分为 B 块；保存每块逐坐标最小值和最大值. It must NOT say 每个key分成B块 and must NOT compute U there. U⁻_h,b belongs to next box 每个头的残差上界, which has both q_h,w_h and block extrema inputs; in that next box add small explanation U⁻_h,b：第b块负点积上界. (2) The downward arrow from 按上界取top-r头 currently ends at 残差分数向量; reroute it to the calculation box 残差分数（仅A中的头）, entering its TOP edge. No A arrow into scorevector. Draw complete nonoverlapping connector. (3) At rightbottom, arrow between 主attention and 主attention的Q、KV points wrongway. Reverse so Q、KV input points LEFT into 主attention. No mainattention output to Q、KV. Keep minus signs, signedweights, legalkey inputs, sum, tables all unchanged.
```

## 第五版局部修改

```text
Precise local edit only. Keep entire image identical except these two changes. Middle orange 每个头的残差上界 lower explanation currently U⁻_h,b：第b块点积上界, REPLACE exact with U⁻_h,b：第b块负点积上界 (add 负, essential negative dot). At bottom right between 主attention and 主attention的Q、KV, DELETE existing short RIGHT-pointing arrow. Draw short LEFT-pointing arrow with arrowhead touching right edge of 主attention box, tail starting left edge of 主attention的Q、KV box. The Q、KV box is INPUT, not output. Everything else unchanged, especially equations, numeric table and A connector.
```

## 第六版局部修改

```text
Change ONE small text line ONLY, keep all pixels/layout/formulas/lines otherwise unchanged. In middle orange box 每个头的残差上界, line under S_h equation must say exactly: U⁻_h,b：max(−q_hᵀk) 的上界. The negative minus sign inside max is essential. Existing wording 第b块负点积上界 did not render 负. Use this explicit math instead. Do not change any arrow, especially bottomright leftward QKV arrow. Do not change table or main equations.
```
