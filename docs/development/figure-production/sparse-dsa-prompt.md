# DSA 数据流图提示词

内置生图接口生成；接口无法指定或确认 Image 2.5 版本。全部候选保留。

+## 初版

```text
Use case scientific-educational. Generate precise dense Chinese technical diagram landscape 1536x1024, white background navy text, blue main attention flow, teal indexer flow, orange integer selection, magenta limited gradients. No cartoon no decorative icons. Title「DSA：索引分数选位置，主注意力重算权重」. Three zones: main computation top 60%, three-token arithmetic bottomleft, training stages bottomright.
Top computation TWO independent horizontal branches fed by one current input h_t at left. Upper branch: h_t → 主 query 投影 → Q_main → 主 QK 与 softmax → 加权 V → u_t. Lower indexer branch: h_t → 索引 query 与权重投影 → q^I_{t,1}…q^I_{t,H}, w^I_{t,1}…w^I_{t,H} → indexscore I_{t,s}=Σ_h w^I_{t,h}ReLU((q^I_{t,h})ᵀk^I_s) → 因果 Top-k → orange positions S_t → gather. Main attention does NOT receive indexscores, only selected main KV via gather.
At bottom of top zone have two parallel cache strips with distinct roles. 独立索引 K 缓存 strip [k^I_1 k^I_2 … k^I_t] feeds indexscore calculation. 主 MLA 缓存 strip [c^KV_1 c^KV_2 … c^KV_t] + 位置键 k^R_1…k^R_t feeds gather with orange S_t; selectedentries fromgather go UP to mainQKsoftmax/value calculation. MainlatentKVshared across mainqueryheads; indexerKnotmainkey. Current h_t small two distinct projections produces new k^I_t and new c^KV_t,k^R_t appended to respective strips BEFORE selection thisstep. Show append arrows ending currenttcachecells, not indexerquery generates history. Future position t+1 as crossed-out faded cell OUTSIDE legalcache with label 未来不可见. Indexer and main query refreshed eachstep. All legal history stays resident after Top-k, unselected not erased. Label「两套缓存逐步追加；本步未选的位置，后续仍可选」. Shape smalllegend q^I_{t,h},k^I_s∈R^{d^I}; S_t为整数位置; allmainheads shareS_t. Do not claim caches crosslayerreuse.
Bottomleft toy table heading「三 token 手算（教学例）」 q1=(1,0),q2=(0,1),w=(0.75,0.25); columns 位置,索引key,索引分数,主logit,主V; rows1,(2,−1),1.5,0.2,(2,0); row2,(1,3),1.5,1.2,(0,3); row3,(−1,4),1.0,未读取,未读取. Top-2={1,2}; mainsoftmax(0.2,1.2)=(0.269,0.731); u≈(0.538,2.193). Note「1.5、1.5只用于选择，不充当主softmax权重」.
Bottomright training table two columns 稠密预热 and 稀疏适应. Rows 主attention: 全部合法位置 / S_t内; 主模型: 冻结 / LM loss更新; Indexer: KL更新 / KL更新; 教师p: 跨主heads求和后L1归一化 / S_t内归一化; 监督: KL(p∥softmax(I)) / KL(p_S∥softmax(I_S)). Small line「稀疏阶段：indexer输入detach；离散Top-k不传LM梯度」. No extra training requirements. Clean rectangles no overlapping no unsupportedEnglish parentheticaltranslations, complete arrows with both endpoints, arrows only true dataflow. Extra MLA detailedweightabsorption omitted for clarity but two query inputs must clear. Do NOT turn caches into outputs of queries.
```

## 第二版

```text
Edit diagram precisely keep all bottom arithmetic and training table unchanged. Fix dataflow: add complete teal arrow from index K cache strip UP into 索引分数计算 box (K input). Add complete blue arrow from 主MLA缓存 strip UP into gather box (main KV input). Route lines in unused whitespace, never across text, arrowheads terminate on correct box. Remove orange vertical connector rising from S_t integerpositions toward mainQK; S_t only points right to gather. Gather output alone routes up then left into 主QK与softmax, labelled 选中的主KV. Currentmainquery arrow kept. Replace corrupted mainsoftmax equation EXACT with A_t=softmax(Q_main K_selᵀ / √d_q). Replace S_t cardinality |S_t|=k with |S_t|=min(k,t+1), add small label 位置从0开始. Replace w vector R^{d^I} inside weightbox with R^H (H=indexer heads). Fix bottom KL formula to KL(p_S ∥ softmax(I_S)) legibly. Inputs and cache strips are not outputs from query, keep independent append annotations. Do not change numbers .269 .731 .538 2.193 or futuremask. No new arrows between index K and main KV.
```

## 第三版重新布局

```text
Create NEW precise Chinese scientific diagram landscape1536x1024 white navy text tealindexer blueattention orangeindices, complete orthogonal arrows no danglinglines. Title DSA：索引分数选位置，主注意力重算权重. Top65% computation four aligned modules left→right and three independent inputs.
Module1 at x30% y35% 索引评分: I_{t,s}=Σ_h w^I_{t,h}ReLU((q^I_{t,h})ᵀk^I_s).
Module2 x48% y35% 因果Top-k: S_t；0≤s≤t；|S_t|=min(k,t+1).
Module3 x66% y35% gather: 读取S_t对应主KV.
Module4 x85% y35% 主attention: 自己的QK→softmax→加权V→u_t.
Only horizontal arrows: Module1→Module2→Module3→Module4. Clearly label last arrow 选中的主KV. Indexscore must never receive gatheroutput.
Above Module1 at x30% y17%, queryinput 独立索引query和权重 q^I_{t,1}…q^I_{t,H},w^I_{t,1}…w^I_{t,H},arrowstraightDOWN into Module1. Above Module4 at x85% y17%, input 当前主query Q_main(h_t),arrowstraightDOWN into Module4. Eachinput labelled 由当前h_t投影; do notconnectinputs.
Below Module1 at x30% y51% a tealcache strip labelled 索引K缓存: k^I_0…k^I_{t−1},k^I_t; arrowstraightUP fromthisstrip into Module1. Below Module3 at x66% y51% a bluecache strip labelled 主MLA缓存: c^KV_0…c^KV_t；位置键k^R_0…k^R_t; arrowstraightUP intogatherModule3. Never connect eithercache toothermodule. Add smallappendannotation eachcache 新k^I_t由h_t投影后追加; 新c^KV_t,k^R_t由h_t投影后追加. Maincache may abstract fullkeyvaluesandRotary. Lasttcellhighlight eachstrip, fadedfuturet+1outsidecachecrossedout. Bottomofmainzone labels 所有主queryheads共享S_t；未选位置仍保存在缓存，后续可选. Queries recomputed eachstep; cacheappend BEFOREselection.
Lowerleft40% teachingexample: 三token手算；q1=(1,0),q2=(0,1),w=(.75,.25). Table positions1,2,3; indexkeys(2,−1),(1,3),(−1,4); indexscores1.5,1.5,1.0; mainlogits .2,1.2,未读取; mainV(2,0),(0,3),未读取. Top-2={1,2}; mainsoftmax(.2,1.2)≈(.269,.731); u≈(.538,2.193). Note 索引分数1.5、1.5不进入主softmax. Label 教学例.
Lower right50% two-stage training table columns 稠密预热/稀疏适应; rows 主attention 全部合法位置/S_t内; 主模型 冻结/LMloss更新; Indexer KL更新/KL更新; 教师p 跨主heads求和后归一化/S_t内归一化. Under table KL(p∥softmax(I)), and 稀疏阶段indexer输入detach；离散Top-k不传LM梯度.
Rectangular aligned panels no overlapping, commontermsEnglishfinebutnot bilingualparenthesis. No performanceclaims. Distinct caches, clear direct input arrows essential. Do not add any arrow excepttheexplicit7 listed dependencies and selectedKVflow. No query input arrow to historicalcache.
```

## 第四版局部修改

```text
Edit only the English sentence in the central lightblue horizontal band: replace Queries recomputed each step; cache append BEFORE selection. with exact Chinese 当前query每步重算；新缓存先追加，再选位置. Keep all diagrams, formulas, arrows, tables and other text identical. Do not change the arithmetic. Preserve complete input arrows from both caches to their actual consumers.
```

