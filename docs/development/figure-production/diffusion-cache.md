# DiffusionLanguageModels 缓存配图记录

## Fast-dLLM DualCache

- 正文: `content/DiffusionLanguageModels/6-推理加速与系统/6.3-缓存部署与服务/6.3.1-缓存与服务调度.md`.
- 图片: `content/DiffusionLanguageModels/6-推理加速与系统/images/fig-fastdllm-dualcache.png`.
- 科学来源: [Fast-dLLM v3](https://arxiv.org/html/2505.22618v3), Figure 2、Figure 3 与 §3.2. 已实际查看 Figure 2 高清图, 作为生成参考传入;§3.2 明确块完成后更新所有 token 的缓存.
- 旧图问题: 后缀错误地流向已提交前缀;只给模块名称, 缺少实际计算与缓存时间;普通说明全英文. 正文把不变的提示 token 与近似缓存混同, 现区分固定 token 与双向表示变化.
- 教学对象: P 是提示与已完成块, B 是当前块, S 是未解码后缀. s 表示本步, s₀ 表示本块缓存建立步. 各层缓存独立, 只展开一层;当前块所有位置每步重算, 两侧 KV 近似复用, 块结束全序列刷新.
- 示例: 12 个位置、当前块 4 个位置与具体 token 均为教学示意, 不代表实际部署配置. 本例推进到最后一块后新 S 为空.
- 制作: 内置 imagegen 实际生成与局部修正. 接口不返回可确认的模型版本, 不将版本记为已确认的 Image 2.5. 旧图和候选保留在本地生成目录与 `tmp/figure-previews/2026-10-08/`.
- 正文连带核查: 按 LLaDA 2.0 v2 §5.2 修正 CAP 的正确位置监督来源与对错误位置的作用, 修正论文作者引用.

### 生成提示词

```text
Use case: scientific-educational. Rebuild the old incorrect Fast-dLLM teaching figure (reference1) using actual paper Figure2(reference2) for scientific mechanism. Chinese white-background crisp scientific raster figure, wide16:10, dense meaningful details, no cartoons, glowing, deformed boxes, overlapping text, floating arrows, source/redraw notices, redundant bilinguallabels. Title “Fast-dLLM DualCache: 块内复用, 块边界刷新”. Explain symbols withinfigure: “P: 提示与已完成块  B: 当前块  S: 未解码后缀  s: 当前去噪步  s₀: 本块缓存建立步”. Three horizontalbands.
Band1 “1. 当前输入按位置分区”. Draw contiguous12tokenstrip P positions1–4 blue tokens“p₁ p₂ p₃ p₄”, B positions5–8orangegreen “a [MASK] b [MASK]”, Spositions9–12grey “[MASK] [MASK] [MASK] [MASK]”. P/B/S brackets clearlybounded. Below “token 不变, 双向表示仍可能随当前块变化”.
Band2 “2. 同一层中的计算与复用”. LEFT “本块起点 s₀” node fullstrip→ “全序列前向” → two smallbluecache rectangularmatrices labelled “K_P(s₀), V_P(s₀)” and “K_S(s₀), V_S(s₀)”, grouped “缓存固定到块结束”. RIGHT “块内第 s 步” orange currentblockmatrix H_B(s)→projectionnode “W_Q, W_K, W_V” branches Q_B(s), K_B(s), V_B(s). Draw a single centralattentionmodule with EXACT bigformula “O_B(s) = softmax(Q_B(s) K̃(s)ᵀ / √d_k) Ṽ(s)”. Aboveorinsideinputs explanatory2concatrows “K̃(s) = [K_P(s₀); K_B(s); K_S(s₀)]” “Ṽ(s) = [V_P(s₀); V_B(s); V_S(s₀)]”. “; 按位置拼接” defined nearby; this is concat along tokenpositions, notmatrixarithmetic. Arrow from each cache andcurrentKV to correspondingconcatinput, Q onlytoQinput. Makeonlynecessaryconnectedarrows, avoidspaghetti, groupK,Vpairlines. Attentionoutputconnected “当前块预测”→ “更新 B 的 token”→feedbackonlytoH_B(s) with “下一去噪步”. Outputblockhas tokenstrip “a c b [MASK]” illustratingonepositionupdated, tagged“教学示例”. DO NOTshow suffix becomingprefixwithinblock. ALLcurrentBpositionsrecomputedincludingdecoded a,b, notonlyunmaskedpositions. Note “P 与 S 的 KV 近似复用; B 每步重算”.
Band3 “3. 块结束后重建边界”. Currentfullinput P | B全部已解码 | S全[MASK] → connectedarrow “全序列刷新” → finalstrip “新P=P+B | 新B=原S第一块 | 新S=剩余后缀”. Could use shorter3block3cells tofitbutmaintainprior12 positions: newP positions1–8, newBpositions9–12,newS“其余后缀” not inventpositions. Add 3rowtable withcolumns“区域 | 块内 | 块边界”: P “读本块起点KV | 与全序列一起刷新”; B “每步重算Q/K/V | 完成后并入新P”; S “保持[MASK],读缓存 | 刷新后重新分区”. Keep independentconfidence-thresholdmechanism outofthisfigure toavoidwrong scope. Noexperimentalcosineheatmap ormeasuredaccuracy invented. Clear regular rectangles, legibleChinese sans-serif, low-saturationblueorangegreen. Fullattentioneverylayer remainsbidirectional; thiscacheisAPPROXIMATE, notarchitecturalcausalprefixcache. Formula rowshowproper√d_k, subscriptandtranspose. Allarrowsstart/endactualobjectborderswithfullcontinuouslines.
```

### 局部修正提示词

```text
Edit attached diagram only one connector label placement in middleband. Orange verticalline from linearprojectionrectangle currently stops at the label “Q_B(s), K_B(s), V_B(s): 每步重算” abovegreenattentionbox, leaving gap. Move this label INSIDE GREEN attention rectangle, justbelow its topheader (adjust formulasdown slightlyinsidebox or raiseboxtopsofits). Draw ONE COMPLETE CONTINUOUSorangeverticalarrow fromprojectionrectangleBOTTOMBORDER togreenattentionrectangleTOPBORDER, witharrowheadtouchinggreenborder. No textbetweenarrowheadandgreenbox. Preserve formulas allcharacters EXACTLY, allotherconnections, upper andlowerbands unchanged. Do notaddnewobjects,text,sourcecredits. This is a single endpoint fix.
```

中间计算区的缓存端点与反馈线未通过检查后, 单独重制该区域, 保留位置分区和块边界示例.

该轮中间区域的完整提示词未留存, 不以空值充当制作记录;保留的候选图与后续修正提示词可用于追查连接变化.


## dInfer 去噪循环

最终局部修正恢复注意力的 V 输入:「刷新或复用的 V」以完整竖直箭头连接「概率加权 V」的上边界, 避免修正判断分支时丢失该路径.

```text
Precise local edit ONLY upper model panel. Restore missing input for V: add label 刷新或复用的 V at x aligned to 概率加权 V above it, below 注意力核心示意 header. Add continuous vertical arrow from that label bottom to TOP BORDER of 概率加权 V box. Do not overlap 后续模型层 text (move 后续模型层 below rightmost logits connector if needed). All other pixels, labels, formula, decision paths, lower insets preserve unchanged. No additional changes.
```

- 来源: [dInfer v1](https://arxiv.org/html/2510.08666v1), Figure 2、Algorithm 1、§2.3 与 §2.5. 实际查看并传入原论文 Figure 2.
- 正文与图片: 同上篇缓存与服务调度文章, `fig-dinfer-vs-vllm.png` 保留既有稳定引用路径.
- 改动: 用块内循环替代模块名称与吞吐数字的串联;展开邻域重算、远处缓存读取、块完成后的全量刷新和跨轮软嵌入. 三种解码策略为按配置选择, 不是依次执行.
- 验收: 首轮候选注意力与缓存连接错误, 第二轮修正后继续调整判断分支标注. 原图、候选与生成版本保留, 不直接把未验收候选写入正文.
- 制作工具: scientific-figure 组织计算关系, 内置 imagegen 生成与编辑 PNG;接口未提供可确认的模型版本.

### 初始提示词

```text
Use case: scientific-educational. Create a dense but legible Chinese technical teaching figure, landscape white background, navy text, restrained blue green orange. Reference image is the original dInfer Figure 2, use its four component responsibilities but expand actual Algorithm 1 dataflow, do NOT copy its simple boxes. Title “dInfer：一块内的去噪循环”. No English-Chinese parenthetical translations, no source notices, no throughput statistics.
Layout main upper flow with five clear regular rectangular modules:
“当前序列 X” with token strip “提示 | 已完成块 | 当前块 | 后续掩码”, current block contains [MASK] and revealed tokens, label “迭代器选择 [start:end]”.
Arrow to “缓存管理” label “按刷新策略更新 K、V”.
Arrow to “模型前向” with interior actual small attention schematic: “当前输入 → Q、K、V”, “Q × Kᵀ → softmax → 加权 V → logits”; cached K,V enter corresponding attention K,V inputs, NOT Q or logits. Keep exact arrows and all endpoints explicit.
Arrow logits to “解码器” interior “阈值 / 分层 / 信用：按配置选择”, label “决定本轮提交的位置与词”.
Arrow to “更新 X 与未定位置”.
Below this output decision diamond “当前块还有掩码？”: yes solid outer return arrow to CURRENT SEQUENCE X with label “是：同一块下一轮”; no down to “全量刷新缓存 → 选择下一块”, arrow returning to iterator block selection. Draw no unconnected arrows.
Lower inset titled “邻域刷新：新状态在哪里算，旧状态在哪里读”. Token strip split into “远处缓存 | 邻域 | 当前掩码 | 邻域 | 远处缓存”; orange interior “重算 K、V → 写入缓存”, blue distant regions “读取既有 K、V”; both routes connect to model attention inputs via clearly labeled matching ports if inset separate, no floating line. Note “块完成：全量更新，吸收新提交 token 的影响”; “跨轮复用为近似”.
Small separate optional inset “迭代平滑” with “本轮 logits → 概率加权嵌入 → 下一轮仍为掩码位置的输入”; clear loop to input only, not logits. Explain probability weighted embedding short Chinese phrase “保留尚未提交位置的软预测”. Use round t/t+1 only if defined. Every arrow complete, no overlap, no double head unless real, regular boxes. No meaningless decorative icons. Focus genuine computation and temporal reuse; ensure all Chinese labels accurate and readable at article width.
```

### 连接修正提示词

```text
Edit this scientific diagram. Preserve title, style, token strip, main five boxes. FIX SCIENTIFIC FLOW ONLY with deliberate simplification.
1 Completely redraw interior model forward: single horizontal chain of four boxes with connected arrows “注意力分数 QKᵀ/√dₖ” → “softmax” → “概率加权 V” → “logits”. Above first box “本轮 Q” arrow into scores; “刷新或复用的 K” arrow into scores; “刷新或复用的 V” arrow into probability-weighted V ONLY. Delete WQ/WK/WV modules because cached K,V are not passed through projection again. Main incoming model arrow represents input, outgoing represents logits.
2 Delete arrow model→decision. Decision receives arrow ONLY from 更新X box: right box bottom goes to diamond RIGHT vertex WITHOUT label yes on that incomingline. Diamond LEFT vertex → currentsequence BOTTOM with label “是：同一块下一轮”. Diamond BOTTOM → fullrefreshrectangle with label “否：块已填满”. fullrefreshrectangle LEFT → iterator/currentsequence outerbottom arrow. Existing horizontal inputdecision line not fork with its returnline.
3 Lower cache inset remove ALL existing bottom green connector lines which wrongly flow into recompute block. Instead show three paths into a SINGLE downstream box “供模型前向读取 K、V”: leftblue readbox→downstream, orange recompute→downstream, rightblue readbox→downstream. All arrows point away from read/recompute boxes to the destination. Put downstreambox belowthreeboxes, whole-block refresh note at bottom. Remove parenthetical “覆盖邻域与当前块” since refresh scope is masked positions and immediate neighbors, not necessarily every position. Use “写回被刷新的位置”.
4 Lowerright smoothing inset DELETE feedbackarrow nextinput→本轮logits. Keep acyclic chain “本轮 logits” → “概率加权嵌入” → “下一轮仍为掩码位置的输入”. Bottom note “未提交位置保留软预测，供下一轮输入使用”. No bogusloop.
5 Decoder boxes label “阈值”“分层”“信用” and put separate short label “按配置选择一种”, so credit alone isn't selection.
Never add source or redesign notices. All arrows endpoints explicit no boxes overlap.
```

### 判断分支与计算范围修正

```text
Edit only decision-loop labeling and arrows in this image. The 更新X downward line enters diamond RIGHT vertex: keep arrowhead pointing into diamond, REMOVE label 是：同一块下一轮 from this incoming line; replace label with 更新后的未定集合. Diamond LEFT vertex outbound line goes left then up into 当前序列X: add explicit LEFT-pointing arrowhead on this horizontal return line near diamond leftvertex, place label 是：同一块下一轮 ABOVE this LEFT returnline. Preserve no→fullrefresh path. All other panels and formulas unchanged. The logits box denotes output after subsequent model layers; in model panel add small label 注意力核心示意 above attention chain so it is not mistaken for whole Transformer logits computation, keep logitsafterchain and label arrow beforelogits 后续模型层. No source notices.
```


```text
Precise scientific figure edit of attachedcandidate, preservelayoutcorrectformula/tokenstates. Fix ONLY these technical/labelissues: 1 REMOVE bottomright source/making text “来源: Fast-dLLM (Figure 2)” and “本图为教学重绘（中文），仅用于学术交流” completely; no source or production notes anywhere onfigure. 2 Bottomright newS: originalsequencecontains exactly12positions so afterpositions9–12become newB no suffix remains. Remove two greyellipsis cells and caption“新 S (其余后缀)”; replacewithshort “本例新 S 为空”. Preserve newP1–8 newB9–12. 3 Left middlepanel cacheoutputblueconnectionlines currentlystartatpanelborderfloating. Draw fullcontinuousline from RIGHTBORDER ofactualupperBLUECACHEMATRIX K_P(s₀),V_P(s₀) to LEFTBORDER of CENTRALBLUE CONCAT formula box; routearoundlabels, arrowheadtouchesconcatbox. LowerBLUECACHEMATRIX K_S(s₀),V_S(s₀) likewisecontinuous to sameconcatbox leftborder at distinctport. Delete existingfloatingcache→attentionlines. 4 Current Q_B(s) remainsconnectedtoattention directly; current K_B(s),V_B(s) must feed concatbox (separate pairedlineorbracket), then concatboxfeedsattention K̃,Ṽ ports. Formula still O_B(s)=softmax(Q_B(s)K̃(s)^T/√d_k)Ṽ(s). 5 Feedbackarrow fromUPDATED TOKENS rectangle to H_B(s) must start onactualtokencellstrip topborder (notfromwhiteblankannotationpanel), continuousroute alonguppermargin endsontopborder H_B(s)orange matrix, label 下一去噪步 s+1. No feedbackfromapproximationNOTEbox. 6 Remove “(线性投影)” English/Chinese duplicate inWQWK WVbox; useChinese “线性投影” plusmathweights is fine. Keep alldefinitions, perlayer, approximationandwhole-sequencerefreshnotes. Never output disconnectedlines, samecolor connectedendpointsfrom actualmatrices/rectangles. Preserveeverythingelse.
```
