# DiffusionLanguageModels 模型谱系配图记录

## 模型谱系

- 正文: `content/DiffusionLanguageModels/3-模型谱系/3-模型谱系.md`.
- 图片: `content/DiffusionLanguageModels/3-模型谱系/images/fig-dlm-timeline.png`.
- 依据: 正文图注中的 D3PM、Diffusion-LM、SEDD、MDLM、BD3-LM 与 LLaDA 2.0 原论文. 此图为跨论文路线综合, 不冒充单篇论文原图.
- 制作: 以旧图为结构参考, 内置 imagegen 重新生成中文机制对照;普通说明使用中文, 模型名和技术专名保留英文.
- 核查重点: 方法关系与权重来源分开. SEDD 不向 LLaDA 传递目标;MDLM 的吸收态目标分别连接 LLaDA 8B 与 LLaDA-MoE. BD3-LM 与 LLaDA 2.0 仅共享块结构分组, Ling 才是后者的权重来源.

### 生成提示词

```text
Use case scientific-educational. Edit attached diffusion-model lineage figure to a polished dense Chinese technical knowledge-base image, white background, regular rectangular modules, no overlap, no broken or floating connecting lines, highres landscape16:10. Keep model names English, ALL explanatory prose Chinese, never English(Chinese) duplicate labels. Title “扩散语言模型: 状态、目标与训练起点”. Two bands, upper researchtimelinefour lanes, lower mechanismtable. Upperlabels: 连续嵌入 / 离散目标 / 从头训练 / 块结构与改编. Years2021,2022,2024,2025 across top, a plain axis line WITHOUT arrowhead is time axis. Eachnodecontains explicityear, so positions approximate not strictpublishdates. Nodes: Diffusion-LM2022“嵌入加高斯噪声 / 梯度引导”; D3PM2021“类别转移矩阵 Q_t”; SEDD2024“状态概率比 / score entropy”; MDLM2024“吸收态 [MASK] / 加权 MLM”; LLaDA8B2025“从头训练 / 掩码重建”; LLaDA-MoE2025“从头训练 / 稀疏 FFN”; BD3-LM2025“块间自回归 / 块内扩散”; Ling AR MoE2025“预训练权重”; LLaDA2.02025“WSD 转换 / 块扩散”. Connect D3PM→SEDD and D3PM→MDLM only labelled“离散建模框架”; MDLM→LLaDA8B and MDLM→LLaDA-MoE branching separately labelled“吸收态目标”; MDLM→BD3-LM labelled“分块建模”. These bluearrows ONLY showmethodrelationships, notweights, legend“蓝线: 方法关系”. Ling→LLaDA2.0 orangeSOLIDarrowONLY weightinheritancelabel“权重初始化”, legend“橙线: 权重来源”. BetweenBD3LM andLLaDA2.0 use a CLOSED outline grouping border labelled“块间因果, 块内双向”, not a floatingdashedline. Both boxes remainregular and distinct. DO NOTconnect LLaDA8B→LLaDAMoE (couldsuggestweighttransfer), DO NOTconnectBD3→LLaDA2.0 viaarrow. No speculativeclaimaboutwhichroutefailed, no source/redraw notices, no disclaimertitle. LowerTable5rows,5cols precisely: 表头“工作 | 状态与噪声 | 训练目标 | 训练起点 | 生成结构”. rowDiffusion-LM“连续嵌入 / 高斯噪声 | 连续去噪 | 从头训练 | 嵌入去噪后映回词表”. rowSEDD“离散类别 / 吸收或均匀转移 | score entropy | 从头训练 | 离散反向过程”. rowMDLM/LLaDA“离散 token / 吸收态 [MASK] | 加权 MLM | 从头训练 | 双向去噪”. rowBD3-LM“块内掩码 | 块扩散目标 | 从头训练 | 块间自回归, 块内双向”. rowLLaDA2.0“块内掩码 | 掩码重建 | Ling AR MoE | 已完成前缀 KV 可复用”. Alltablecontentsclear withouttruncation, enoughspace, largerfont. No unnecessaryEnglishprose likeembedding Gaussian,pretrainedknowledge,fromscratch,deploy. This is a mechanism comparison graphic, no empiricalperformance metrics. Everyarrowmuststartandendatactualrectborder witharrowheadtouchingdestination. No crossingrectinteriors or text. Keep dimensions enough for article-readability.
```

### 局部修正提示词

```text
Precise scientific correction of attachedfigure. ONE wrong arrow: “吸收态目标” arrow to LLaDA8B incorrectly starts from SEDD. REMOVE that SEDD→LLaDA8B connection completely. Add instead MDLM→LLaDA8B bluearrow: leave from MDLM topborder near its rightedge, route upward thenright through emptyspace withouttouchingSEDDbox, endontheLEFTBORDER ofLLaDA8Bbox. Label“吸收态目标”. MDLM→LLaDAMoE staysunchanged. SEDD has NO outgoingarrows toLLaDA models. Preserve D3PM→SEDD andD3PM→MDLM. Ensure line routing nooverlap orcrossingtext. Also align lane labels with actualnodes: move “从头训练” leftlabel vertically to alignwithLLaDA8B/LLaDAMoEpair, move “块结构与改编” label vertically to alignwithBD3-LM/LLaDA2.0pair. Labels 连续嵌入 alignsDiffusionLM,离散目标 alignsD3PM/SEDD/MDLM. Keeptableexact. No addedconcepts. Preservefontandcolors, allarrowendstouchactualborders.
```


### 谱系图端点与标签修正提示词

```text
Edit attachedimage with only following corrections, preserveallotherstructureandcontents. 1 Remove left-side labels “从头训练” and “块结构与改编” entirely, because they are misaligned; these facts are already explained inside modelnodesandtable. Keep连续嵌入and离散目标. 2 The bluearrow labelled分块建模 currently stops at orange dottedGROUPborder. Extend it to touch LEFT BORDER OF BD3-LM rectangle itself, so arrowdestinationunambiguous. It may cross groupborder, but nottext. 3 InlowerSEDDtablerow change状态与噪声 cell to EXACT “离散类别 / 吸收或均匀转移”. 4 Preservecorrect MDLM→LLaDA8B connection, NO SEDDoutgoingarrow. Allarrowheadstouchrealmodelnodeborders. No othernewlabels, duplicates, translationparentheses, sources or notices.
```

### 谱系图简化连接提示词

```text
undefined
```

## LLaDA 2.0 块长课程与缓存

- 正文: `content/DiffusionLanguageModels/3-模型谱系/3.1-吸收态模型家族/3.1.1-llada家族.md`.
- 图片: `content/DiffusionLanguageModels/3-模型谱系/images/fig-llada-wsd.png`.
- 科学依据: [LLaDA 2.0 v2](https://arxiv.org/pdf/2512.15745v2), Figure 2、§4.1 与 §7.3. 已查看 PDF 第 5 页原图, 并作为生成参考输入.
- 表达范围: 单篇文档内的可见性示例, 三阶段块长课程, 完成块的前缀 KV 复用. $B=4$ 与 8×8 矩阵为教学示例. 曲线只表示课程方向, 不表示实测调度函数.
- 制作: 内置 imagegen 实际生成与局部编辑. 接口没有返回可确认的模型版本, 不将版本标记为已确认的 Image 2.5.
- 检查: 三种矩阵分别为下三角、全可见与块因果;当前块重新计算, 完成块写入缓存, 后续块读取;标签为中文说明与必要专名, 连线连接实际对象.
- 旧图与各轮候选保留在本地生成目录及 `tmp/figure-previews/2026-10-08/`, 不删除历史资产.

### 初始提示词

```text
Use case scientific-educational. Edit reference image1, a LLaDA2.0 WSD teaching diagram, with image2 the actual paper Figure2 as scientific reference only. Produce a crisp high-resolution white-background Chinese technical figure, landscape 16:10. Keep three stacked bands and correct three 8x8 attention matrices but replace ALL generic English prose with concise Chinese. No English(Chinese) translations, no source/redraw notices inside image, no cartoons. Title “LLaDA 2.0: 块长课程与前缀缓存”. Define on top “B: 块长    L: 单篇文档长度”; single-document demonstration, not full packed training mask. Band1 title “训练中逐步改变块长”, vertical “块长 B”, horizontal “训练进度”. Smooth schematic curve starts B=1, rises to B=L, stays B=L then falls to B=4 (教学示例). Phase labels “逐步扩大”, “全序列去噪”, “缩至部署块长”; keep WSD in main title or omit, no redundant english. Band2 “同一文档内的可见范围”, three EXACT 8x8 grids: B=1 lower triangular inclusive diagonal; B=L all64 filled; B=4 top-left4x4 allfilled, top-right4x4 blank, entire lower4rows all8columnsfilled. Row “查询位置 i”, column “被读取位置 j”; legend filled“可见”,white“不可见”. Band3 “块完成后写入, 后续块读取”. Show two timeline rows t and t+1 with 3 blocks of4 cells, each block labeled positions1–4,5–8,9–12. Rowt blue finalized prefix block1 labeled “前缀已完成”,green activeblock2 with 4 [MASK]/filled cells labeled “当前块多轮去噪”,greyblock3 “[MASK] 尚未开始”. A dedicated small “前缀 KV” rectangle under block1 connects from finalizedblock1 to cache (写入), then cache arrow to activeblock2 attention calculation (读取); activeblock2 loop arrow ends back at samegreenblock and label“当前块重新计算”. Row t+1 after block2 finishes: blue blocks1+2, greenblock3 active. A clear arrow from COMPLETED BLOCK2 at transition to a NEW rowt+1 cache “更新后的前缀 KV” labeled “块完成后重算并追加”; arrow from NEW cache to rowt+1activeblock3 labeled“读取”. No arrow suggests intermediate noisyblockKV is exactcache or futureblockcanfeedearlierblock. All arrows solid continuous with explicit start/end, boxes regular no overlap. Explain in small text “前缀不读取后续块; 当前块内部双向计算”. Draw no measured axes or empiricalvalues beyond B=4 teaching illustration. Sourcepaper's documentmask restriction respected, no erroneous all-doc fullattention. Sans-serifChinese with generous legible type; allscientificlabels exact, neat consistent bluegreenorange.
```

### 局部修正提示词

```text
Use case precise-object-edit scientific educational. Edit attached generated diagram ONLY fix connections and time labels. Preserve all correct matrices, title, Chinese labels, regular layout and curves. 1. In first band below curve REMOVE the three floating orange blue green horizontal arrow strips and their labels entirely; they are decorative arrows with no objects. Keep horizontal training-progress axis, curve, phase headers. 2. In bottom band FIRST ROW, the blue arrow labeled 读取 from 前缀 KV currently ends in empty whitespace next to loop. Route it continuously from right edge of 前缀 KV rectangle to bottom edge of the GREEN currentblock 5–8 (arrowhead touches that block's lower border at position6). Keep green recomputation loop connected to greenblock at both ends but move loop nearer position8 to avoidintersection. 3. Secondrow 更新后的前缀KV→activeblock9–12 bluearrow must touch greenblocklowerborder at position11 (not terminate on textbelowblock). 4. Replace left rowlabels t and t+1 with “处理第2块” and “处理第3块”, adjust left margin so labels legible withoutoverlap. There is no implication a wholeblock finishes in one denoising timestep. 5. Add short transitionlabel betweenrowedges “第2块去噪完成” if room without crowding. ALL arrowends terminate on actualmoduleborder, nofloatingarrow, no disconnectedline. Do not add English translations, source notices, new concepts or data. Keep curves and exact64cellmatrixpatterns unchanged.
```

```text
Edit only bottom band connection endpoints in attached diagram. Both blue “读取” arrows still stop on text, leaving white space before the green token rectangles. Fix precisely: move “当前块多轮去噪” labels ABOVE their corresponding green token rectangles (between row header and positionnumbers, adjust vertical spacing onlybottom band ifneeded). Extend each blue upward arrow so its triangular arrowhead TOUCHES THE BOTTOM BORDER OF THE GREEN TOKEN RECTANGLE, rowone at column6, rowtwo atcolumn11. No text lies between arrowhead and rectangle. Move green recomputation loop so both ends ALSO TOUCH bottom border of green rowone tokenrect atcolumns7,8; loop has only one arrowhead onreturnend, startplain. Move “前缀已完成” labels above blue prefix blocks and extend prefixblock→KVcache arrows to start on bottom border of the BLUE TOKEN RECTANGLE, not on labels. Keep ALL text legible and unoverlapped. “第2块去噪完成” label moves right of its verticalcachewritearrow, whose topend touches bottom border of blue block5–8 andbottomheadtouchescacherect. Preserve upper2bands exactly. No dangling arrows permitted anywhere.
```

```text
Edit only bottom band attachedfigure. Preserve top2bands andmatrices EXACTLY. Fix diagram completeness: bottomrow has a left “前缀 KV” box and central “更新后的前缀 KV” box. Connect LEFT cache rightborder to CENTRAL cache leftborder by a continuous horizontalbluearrow labeled “保留第1块 KV”, so preexistingcacheisexplicitinputtoenlargedcache. Centralcachealso receives a verticalarrow from finalizedblueblockpositions5–8 above; starttouchesblockbottom,endtouchescachetop,label “追加第2块 KV”. Firstrow prefixblock1 bottom→cachetop line needs a downwardarrowhead touchingcachetop,label “写入”. Firstrowgreenrecompute loop currentlyhas2arrowheads; make it a single-directionreturnloop, noarrowhead atstartposition7, onearrowheadatreturnposition8. Labelunderloop “每轮重新计算”. Move any labels ifnecessary toavoidlinescrossingtext. Keep both readarrows endingonactualgreentokenrectangleborders. No extra boxes. No Englishprose, no redrawnotice.
```
