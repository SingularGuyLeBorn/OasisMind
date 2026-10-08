# MMaDA 统一离散状态配图记录

## 第三、四版与正式验收

第三版改用时间展开, 固定条件分别进入两次恢复器调用. 但下方共享参数虚线误连完整视觉码, 保留为 `mmada-unified-candidate-v3.png`, 不进入正文. 第四版删除两条共享虚线, 改为文字说明;正式图为 `content/DiffusionLanguageModels/3-模型谱系/images/fig-mmada-unified-v4.png`.

第四版已逐项查看: 条件总线两端均进入恢复器, 部分状态进入下一调用, 完整视觉码进入解码器后才输出像素;矩形及标签没有遮挡, 无反馈环线与悬空箭头. 32×32=1024, 示例索引均在 8192 类范围内. 两轮、四格及图像为教学示意, 不代表实际步数与实验数据. 正文增加图 2、图注和四条解析. 内置接口仍无法确认模型版本.

## 第三版生成提示词

```text
Scientific educational Chinese diagram, white background, restrained blue/orange/gray, landscape, readable regular rectangles. Use provided actual MMaDA Figure 2 page ONLY as mechanism reference for shared mask predictor and fixed prompt; expand inference states, do not copy paper labels or logos. Title "MMaDA: 条件固定, 生成状态逐轮更新". NO loops anywhere. All arrows single-direction, complete, never floating. No source production wording, no bilingual translations.
Three stacked panels.
TOP tokenization: image "512×512 像素" → "图像编码与量化" → grid "32×32 视觉码 = 1024 个位置"; below "每个索引属于 8192 类". Legend orange视觉码, blue文本符号, gray"M: 掩码位置".
MIDDLE task 看图回答: top orange visual strip and blue question strip grouped as "固定条件: 视觉码 + 问题". A condition bus branches DOWN to TWO predictors, arrowheads at predictor tops. Main horizontal row: gray state "M M M M" → regular box "恢复器 + 选择" → blue/gray state "A M C M" → identical box "恢复器 + 选择" → blue state "A B C D". Above states labels "初始回答" "部分回答" "完整回答"; below predictors "预测被掩位置的文本分布". Subnote "四位置回答仅作示意". Ensure partial state feeds second predictor, fixed bus also feeds second predictor. No direct partial→complete shortcut. All predictor boxes indicate same shared parameters, compact label underneath panel "两次调用共享参数".
BOTTOM task 按文字生图: top blue textstrip "固定条件: 文字提示"; bus branches down to TWO predictor boxes. Main row: 2x2 allgray M grid → "恢复器 + 选择" → partialorangegrid [17,M;M,205] → identical "恢复器 + 选择" → completeorangegrid [17,8;61,205] → "图像解码器" → small outputpixel image. Below states "初始视觉码" "部分视觉码" "完整视觉码". small note "仅画四位置局部, 索引为教学示例". Below predictors "预测被掩位置的视觉码分布". Decoder only receives complete visualgrid, never receives partialgrid. No actual image output without decoder.
Global footer "文字按块恢复, 图像整段迭代; 两轮仅展示状态变化, 并非实际步数". All four predictor calls use same MMaDA parameters. Space sufficient for aligned arrows and labels without overlap; crisp scientific diagram, informative grids rather than empty boxes.
```

## 第四版编辑提示词

```text
Edit this image only: remove BOTH bottom dashed blue shared-parameter connectors and their light blue '两次调用共享参数' badges in panels 2 and 3. Replace each with plain small centered text '恢复器调用共享 MMaDA 参数', with NO lines or arrows near this text. This fixes an incorrect dashed endpoint touching the visual code grid. Also change legend '文本符号 (词元)' to exactly '文本符号'. Preserve every other object, number, regular rectangle, connected solid arrow, condition bus, image, title and footer unchanged.
```


## 科学来源

- 论文: MMaDA: Multimodal Large Diffusion Language Models.
- PDF 实际版本: arXiv:2505.15809v2, 2025-09-25, 37 页. 下载入口: https://arxiv.org/pdf/2505.15809 .
- 实际查看 PDF 第 3 页的 tokenization 描述及第 4 页 Figure 2、Eq. (1). 留存页面: `mmada-source-page3.png`、`mmada-source-page4.png`.
- HTML: https://arxiv.org/html/2505.15809 . 带 v1 的 HTML 入口返回 404, 改用可达 HTML 并以 PDF 明确版本.

## 配图对象与待完成内容

需要展开图像离散码与文本符号如何进入共享恢复器, 以及理解与生图时固定条件和恢复位置如何交换. 图像编码器将 512×512 像素映射为 32×32 个视觉码, 码本为 8192;生成所得视觉索引须经过图像解码器才能成为像素. 不能把视觉码画成连续 SigLIP 特征, 也不能让 Transformer 直接输出像素.

Figure 2 是任务与训练流程总览, 本次教学图计划展开它未充分呈现的输入状态与输出解码. 统一骨干不表示文本与视觉采用同一采样配置. 条件固定、掩码位置及预测目标须在图内标明.

已使用内置生图生成两版候选, 第一次调用实际传入第 4 页参考, 第二次传入第一版进行局部编辑. 接口未提供可确认的模型版本, 不宣称已验证 Image 2.5. 正文图片尚未替换.

## 候选与验收

- `mmada-unified-candidate-v1.png`: 视觉量化、任务条件与解码器路径可读. 两条反馈线两端均有朝上的箭头, 部分状态无法作为明确的流出端;部分到完整状态的恢复过程缺少标记. 不验收.
- `mmada-unified-candidate-v2.png`: 图例与上方后续恢复标签改善. 编辑未移除两个反馈起点的箭头, 下方后续恢复标签也未补入. 不验收, 不进入正文.

下一版应把每条反馈路径从部分状态底部无箭头地引出, 只在模型输入端保留箭头;若局部编辑继续失败, 改用时间展开的两次恢复器调用, 避免环线双端歧义. 两版保留供比较, 不覆盖.

## 首次生成提示词

```text
Use case: scientific-educational. Create a polished Chinese technical teaching diagram about MMaDA, landscape 1536x1024, white background, restrained blue text conditions / orange image codes / gray masks. Reference image is the actual paper Figure 2 page: use its shared discrete diffusion and fixed prompt / generated response relationship, not its cluttered typography, not its examples, no logos. Title "MMaDA: 共享恢复器, 不同生成状态". Regular rectangular modules, connected arrows only, no unexplained jargon or bilingual translations, no source/production wording inside image.
Top compact visual tokenization flow: small schematic image grid labeled "512×512 像素" → rectangle "图像编码与量化" → orange grid labeled "32×32 视觉码, 共 1024 个" then annotation "每格是 8192 类中的一个索引". Do NOT imply indices are pixels. Define "M = 掩码位置".
Middle two horizontal lanes with identical labeled predictor instances "共享参数的 MMaDA 恢复器":
Lane1 header "看图回答". Input sequence graphic shows orange visual code strip labeled "视觉码固定" and blue question strip "问题固定", plus gray answer row "M M M M" labeled "回答待恢复". All three connect as model INPUT (one clear collector). Model output goes to small four probability bars labeled "被掩位置的文本分布" then rectangle "预测与选择" then answer row "A M C M". Clearly connect partial answer to next iteration of same predictor with loop labeled "下一轮更新回答". Fixed visual/question conditions remain fixed; loop does not touch fixed rows. Endpoint final answer "A B C D", label "示意回答". No probability numbers required.
Lane2 header "按文字生图". Blue prompt strip "文字条件固定"; gray 2x2 grid all M labeled "视觉码待恢复 (仅画局部)". Both connect to model input. Output label "被掩位置的视觉码分布" → "预测与选择" → partial2x2grid [17,M;M,205] → iteration loop labeled "下一轮更新视觉码". Final2x2grid [17,8;61,205] labeled "完整视觉码 (局部示意)" → regular rectangle "图像解码器" → small pixel image. Do not connect incomplete grid directly to decoder. Never present code values as experimental data.
Bottom note "恢复目标: 文本符号或视觉码; 条件位置保持固定". Separate note "文本可按块生成; 图像整段迭代, 采样日程分别设置". No training or gradients in these inference lanes. Ensure loops connect to predictor input without ambiguous arrows, no line crossing labels, no overlapping boxes. Provide detailed strips/grids and readable text, not a few vague boxes.
```

## 第二版编辑提示词

```text
Edit the supplied MMaDA diagram. Preserve all layout, modules, text, grids, colors and dimensions except exactly these corrections. In BOTH horizontal task lanes, fix bottom feedback loop direction: originate at bottom of partial result (A M C M in upper lane; [17 M; M 205] in lower lane), line descends with NO arrowhead at its source, runs left, then turns upward with ONE arrowhead ending at model-input line before predictor. Current image has upwards arrowheads at both ends; remove source arrowhead. Label unchanged 下一轮更新回答 / 下一轮更新视觉码. Add label 后续恢复 above direct arrow from partial answer to complete A B C D; add label 后续恢复 above arrow from partial visual grid to complete visual grid. These arrows abbreviate further model rounds, not direct conversion. Remove redundant parenthetical legend text so gray legend is exactly 'M: 掩码位置'. Do not introduce new arrows or move other objects. Full connections, clean regular rectangles, no overlap.
```
