# d3LLM 多块 KV 候选修订

来源与初稿见 d3llm-multiblock-kv-v1.md. 全部使用内置图像编辑工具, 未指定或确认 Image 2.5. 各版本保留, 不覆盖.

v2:分开稳定期重算和后续轮读取, 但写入箭头直连注意力计算, 另有悬空箭头, 未验收.

v3:缓存读取与当前状态输入已分离, 跨阶段写入连线仍错误, 未验收.

v4:删除错误跨阶段连线, 用同名K1,V1与K2,V2及对应说明联系两个时间分面. 阶段A以完整当前画布重算产生历史刷新和本块写入, 阶段B从已写入缓存与后续块当前状态分别输入注意力计算. 回读未发现悬空箭头, 上方五状态、阈值、稳定轮数及token不变关系保留. 四格只是示意, 不代表实际块长. 图中重算是计算依赖示意, 不展开逐层attention mask或kernel实现.

v4 已实际检查浏览器800像素固定正文宽度预览, 主要标签、状态条件与两阶段读写可读. 已复制到文章 images/fig-d3llm-multiblock-kv-v4.png, 当前正文作为图3引用, 配有变量对应与时间阶段解析. 该预览不等于完整站点文章或移动端验收.

## 当前正式图片重新查看

本轮直接打开正文引用的v4 PNG, 同时打开伪轨迹训练图与原论文Figure 3 PNG. v4上排箭头均从一个状态框连接到下一状态框;10%与95%说明的是前一块的完成比例, 四格条带只表示本块状态. 下排A的四个块输入完整前向重算, 再分别产生历史K1,V1覆盖与稳定后K2,V2写入. 下排B在稍后的轮次分别读取这两个缓存对象和当前token/MASK, 汇入注意力计算. 两个时间分面用同名缓存与文字对应, 没有悬空的跨阶段箭头. 图底明确token保留、KV仅更新表示. 未发现新增概念、冗余双语标签或矩形遮挡, 当前保留v4.

原Figure 3保留其论文原貌, 上方朝右延伸至省略号的分支表示继续存在后续块;正文另用v4展开实际缓存消费者, 不靠原图分支代替读写解释. 本轮没有编辑图像, 也没有重新构建站点. 先前页面截图与本轮原尺寸查看分开记录, 不将原尺寸可读性当作当前移动端验收.

## v2 编辑提示词

```text
Edit this d3LLM scientific diagram. Keep top title and entire top five-state panel UNCHANGED. Redesign lower panel ONLY, preserving four block strips A B C D / E F G H / I M J M / M K M M. Goal remove mixed time ambiguity. Lower panel title '稳定期重算 → 写入后复用'. Stage A on left two-thirds labelled '阶段A:块2稳定中, 不读取旧 KV'. Put all four current block strips as one row, labelled block1completed,block2stabilizing,block3fullyactivated,block4activated. Four arrows converge with NO crossings into rectangle '当前完整画布的前向重算'. Outputs below: rectangle '覆盖历史 K1,V1' and rectangle '稳定1–2轮后写入 K2,V2'. Distinct valid source-output arrows. Stage B on right labelled '阶段B:写入后的后续轮'. Show one memory rectangle '已写入缓存 K1,V1;K2,V2', receiving arrows from both A outputs across a visible vertical time boundary, each labelled '写入完成'. The StageB memory feeds a rectangle '后续块注意力计算' labelled arrow '读取缓存'. A separate small currentstate input strip labelled '后续块当前 token / MASK' feeds same attention rectangle. Do not show stage A active block state directly feeding future attention; give distinct futurestate strip e.g. I M J L. Clear time stages: fullforwardrefresh is one event, normalcachedread is another futureevent. Footer '周期刷新再次完整前向, 覆盖历史 KV' and 'token 已揭开后保留; KV 刷新只更新表示'. All lines complete definedendpoints, no overlapping rectangles or crossing arrows. No new formulas, no results, no vague fullyforward omissions. K,V definition preserved. In top activation boxes fix ifnecessary only typo '熵' not otherchanges. Large crisp Chinese labels whitebackground/navy/teal/amber flattechnicalstyle. Reference image is edit target.
```

## v3 编辑提示词

```text
Precise diagram edit. Preserve entire top panel and all text, rectangles and token strips in bottom panel. CHANGE ONLY THE WRONG WRITE-COMPLETION ARROWS AND THE MERGED READ INPUT. Remove both arrows marked 写入完成 presently exiting the K2,V2 rectangle and remove their two labels. Instead add one thin navy orthogonal arrow starting at rectangle 覆盖历史 K1,V1 and ending at LEFT edge of 已写入缓存 K1,V1;K2,V2 rectangle, labeled 写入完成. Add second thin navy orthogonal arrow starting at rectangle 稳定1–2轮后写入 K2,V2 and ending at BOTTOM LEFT corner of the SAME 已写入缓存 rectangle, labelled 写入完成. Route with sufficient spacing and bend around other boxes; no overlapping text, no arrow into 后续块注意力计算 from write rectangles and NO dangling arrows. If needed shift bottom small boxes up/down minimally to open routing space, preserve all text. Cached rectangle output and currenttoken rectangle output currently merged into one readlabel line; replace with TWO DISTINCT arrows ending separately at top edge 后续块注意力计算: one from cachedrectangle labelled 读取缓存, second from currenttokenrectangle labelled 当前状态. All endpoints clearly touching source/target module borders. No additions, no diagram simplification, no changes to five states, token values, palette, Chinese labels or sourceinput meaning.
```

## v4 编辑提示词

```text
Edit only bad cross-panel arrows in bottom half of image. KEEP all top diagram unchanged and all bottom boxes labels/tokens intact. ERASE ALL THREE write-completion connector paths between stage A and stage B: short floating arrow at x939 y631 to cachedbox; long path from K2box at x777 y815 up to cache; bottom paths from K1box/K2box to attention. Erase both 写入完成 text labels. Leave no lines exiting K1/V1 or K2/V2 output boxes, these two are OUTPUTS in stageA. Add ONE clear correspondence text in blank bottom stageA area: '阶段B缓存取自左侧已完成的写入'. This is a deliberate separate-panel correspondence, not an omitted arrow. Cachebox in stageB already named K1,V1;K2,V2 defines same objects. Preserve arrows from fullforward to K1output/K2output and from cache/input to attention. No arrow between stageA and B anywhere. No standalone arrowheads. White erase background matches surrounding. Ensure stageA outputboxes have no outgoing lines whatsoever. Preserve all other modules, shapes, diagrams, palette, text. Result must have zero dangling connectors.
```
