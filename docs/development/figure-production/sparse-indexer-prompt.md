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
