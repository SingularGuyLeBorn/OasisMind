# Seed 块缓存生命周期配图

## 正式第六版

第四版仍有悬空来源与落在标签的箭头, 未采用. 第五版重新组织为状态轨迹、单轮局部展开和缓存生命周期, 第六版局部去掉制作说明后采用. 实际查看确认 Q/K/V 投影进入注意力, 同层历史 KV 单独读取, 后续网络产生下一轮状态, 完成块建立各层缓存后供下一块使用. 图中两轮与四 token 为教学例子, 不是固定采样日程. 正式图为 `content/DiffusionLanguageModels/3-模型谱系/images/fig-seed-cache-v6.png`. 无实验数值. 接口仍无法确认模型版本.

### 第四版提示词

```text
Precise minimal edit of supplied diagram. Preserve all existing boxes text colors and all correct vertical arrows. Only perform these line changes:
DELETE the entire amber horizontal return line under the bottom row running from "下一块的各轮前向" back into A B C D. There is NO backward update from next block.
DELETE the short teal branch that ends on the first round panel upper-left frame (at height near round title). Keep the long teal top route originating from cache and entering SECOND attention at right edge, and keep lower route cache->FIRST attention. These two routes must branch at cache right edge but there is no third teal endpoint.
Extend the amber cross-round arrow from FIRST output A M C M until it touches SECOND input token strip A M C M LEFT edge, at its vertical middle, not input text or panel frame. Route in clear space behind no labels.
Extend the amber downward/leftward arrow from SECOND output A B C D into bottom A B C D TOP edge instead of ending on '当前块生成完成' caption.
Do not add new lines, loops, symbols, boxes, headings or shapes. Do not modify any math or text. Pay special attention to no arrow endpoint on a panel frame or title. Output same size.
```

### 第五版提示词

```text
Chinese scientific teaching diagram, white background 1536x1024, navy text, teal cached quantities, amber recomputed quantities. Title "块扩散: 逐轮重算与逐层缓存". Clean aligned rectangular modules. NO decorative illustrations, English translations, experimental data, or undefined symbols. Use 3 horizontal bands.
Band1 "教学示例: 当前块 b 的状态". Token strips in single straight left-right path: x_b^(r)=[M M M M] -> "前向与采样" -> x_b^(r+1)=[A M C M] -> "前向与采样" -> x_b^(r+2)=[A B C D]. Legend "M: 掩码; r: 去噪轮次; b: 当前块". This is a chosen illustration not universal schedule.
Band2 dominant detailed ONE ROUND local computation, so no repeated panel. Left vertical network path "当前块状态 x_b^(r)" -> "嵌入与前面各层" -> "第 ℓ 层输入 h_b^(ℓ,r)" -> "投影生成当前 Q、K、V" -> "注意力" -> "本层剩余运算与后面各层" -> "预测与采样" -> "下一轮状态 x_b^(r+1)". Clear arrow each. Label ℓ network layer in legend. Right of attention, a large teal storage rectangle "第 ℓ 层历史缓存: K_<b^ℓ, V_<b^ℓ" with note "前序块完成时建立; 当前块各轮只读". ONE connected arrow from this cache to attention right edge labelled "读取". Inside attention box formula Attention(Q_b^(ℓ,r), [K_<b^ℓ; K_b^(ℓ,r)], [V_<b^ℓ; V_b^(ℓ,r)]). Formula readable without shape. Definition "[ ; ]: 沿 token 位置拼接". Side amber note "每轮重算当前块隐藏状态与 Q、K、V", teal note "每层读取自己的历史 KV". NO recurrence arrow outside path; first band separately illustrates repeated calls.
Band3 cache lifecycle single left-right fully connected path: "当前块最终 token" -> "以最终 token 建立各层 KV" -> "追加到各层历史缓存" -> "下一块各轮读取". NO backward line. Bottom condition concise "精确复用要求历史隐藏状态不依赖后续可变输入; Seed 报告缓存可能引入偏差." Make explicit teaching decomposition not exact disclosed kernel. All arrows start/end exact box edges, no arrow into caption, no shape dimensions. Do not add extra paths. No provenance text.
```

### 第六版提示词

```text
Change only the bottom footnote: delete the second sentence '本图为教学分解流程, 非精确的已公开内核实现.' Keep first sentence about exact reuse and Seed potential bias, center it vertically in the bottom dashed strip. Preserve EVERY other text, formula, diagram, arrow, box and token. No new changes.
```


## 第二、三版局部修正

第二版去除未定义 shape, 增加 b、r、层索引说明和逐层计算展开. 第三版已实际查看:移除两轮注意力直接相连的错误路径, 恢复掩码说明并增加最终块连接. 仍未通过:新增下一块前向返回旧块 token 的错误回路, 缓存支线和跨轮输入仍落在面板边界而非输入对象. 两版均只保存候选, 正文不引用.

### 第二版提示词

```text
Edit this candidate into a correct scientific Chinese teaching diagram. Keep white/navy/teal/amber style, title, three panels, token examples and bottom exact-cache condition. Remove ALL shape tables B,L,H,d. Define b=current block, r=denoising round, ℓ=network layer in one short legend. Inside each round REPLACE full Transformer block with "嵌入与前面各层", then "第 ℓ 层: 当前隐藏状态" -> "计算 Q、K、V" -> attention -> "本层剩余运算与后面各层" -> prediction -> sampler -> updated token strip. Cache label "逐层历史 KV" and "第 ℓ 层读取 K_<b^ℓ, V_<b^ℓ"; cache sends a separate connected arrow into both rounds' layer ℓ attention, not into projection. This is local expansion, not complete Transformer plus another attention. Connect first output A M C M via explicit routed solid arrow around outside panels to second input A M C M, remove detached dashed shortcut between middle panels. Connect second output A B C D down to bottom "当前块完成" -> "用最终 token 建立逐层 KV" -> "追加到历史缓存" -> "下一块的各轮前向". Cache append notation K_<b+1,V_<b+1 allowed but no ambiguous shapes. All sampling arrows must start at prediction box edges and end at sampler edges; all timeline arrows between actual block strips. Remove decorative standalone horizontal arrow under timeline. Do not add bilingual translations, undefined symbols, source captions or Figure numbers. Preserve caveat Seed empirical caching may incur bias, and history hidden states independent of future mutable inputs for exact reuse. No fake source kernel details or new numerical claims.
```

### 第三版提示词

```text
Precise diagram edit. Preserve all boxes, colors, text, layout except fix four connections and restore definition. 1) Teal line currently crosses OUT of first attention and into second attention, which wrongly implies first attention output reused. DELETE that horizontal segment. Instead branch directly from historical KV box upper right, route ABOVE both panels, then down into second attention's right edge, label that separate route '读取同一层历史 KV'. Keep first-cache-to-first-attention intact. 2) Amber arrow from first output A M C M currently ends at second panel border. Route it to second INPUT token strip A M C M left edge, not panel border. 3) Add a solid amber connection from second OUTPUT A B C D bottom edge down and left into bottom '当前块生成完成' A B C D strip top edge. Keep this clear of all labels. 4) Top strip restore small legend 'M: 掩码位置'. No other changes, no new symbols. All arrow endpoints must touch named token strips or actual calculation boxes, never panel frames. Do not create any connection from first attention output to second attention. Cache routes originate only at cache box.
```


## 科学依据

[Seed Diffusion v1 §3.4](https://arxiv.org/html/2508.02193v1#S3.SS4) 描述块级并行采样、前序块 KV 复用和潜在偏差. 本图为计算依赖教学展开, 不代表未公开的内核或网络层数. 原论文 Figure 2 为训练动态与分块耗时实验, 本图不复刻其曲线.

## 候选验收

内置生图输出 `seed-cache-candidate-v1.png`, 接口无法确认模型版本. 已实际查看. 块顺序和历史缓存消费者已呈现, 但未定义 shape、跨轮输出连接不足、完整 Transformer 与注意力局部展开串联容易误读为重复计算. 暂不进入正文. 下一版删除未定义 shape, 完整连接上一轮输出与下一轮输入, 明确逐层缓存与局部展开.

## 完整提示词

```text
Use case: scientific-educational. Create a dense clear Chinese technical teaching diagram, landscape 1536x1024, white background, navy text, teal cached objects, amber mutable objects. Title "块扩散中的状态与 KV 复用". No cartoons, no decorative English translations, no sources or Figure numbers inside. Regular aligned rectangles, readable math, all arrows connected. This is a pedagogical generic block-diffusion cache lifecycle explaining Seed's reported inference choice, not its undisclosed kernel architecture.
Top narrow timeline: "教学示例" and 3 groups of 4 token cells: "已完成块" A B C D; "当前块" M M M M; "后续块" grey cells. Legend "M: 掩码位置". Block order arrow from completed to current to later.
Main central computation: Left teal cache rectangle "历史 KV: K_<b, V_<b" with note "前序块完成后保存; 当前块各轮读取". It branches into two sequential amber forward modules labelled "当前块第 r 轮" and "当前块第 r+1 轮". Each forward module has input token strip x_b^(r), then "Transformer" then internal Q_b^(r), K_b^(r), V_b^(r), then "注意力" receiving current Q,K,V plus historical cached K,V. Attention then "后续网络与预测" -> "采样更新" -> x_b^(r+1), connecting into second module input. In second use r+1 superscripts and output x_b^(r+2). Current block tokens example M M M M -> A M C M -> A B C D is an illustrative trajectory, not forced schedule. Mark "当前状态变化: 当前块重新前向" between rounds. Historical cache remains unchanged during both rounds. No claim all visible tokens exact reusable.
Bottom transition: final current block A B C D -> rectangle "完成当前块" -> "建立该块 KV" -> larger cache "历史 KV + 当前块 KV" -> "下一块的各轮前向". Above append write "块完成后才加入历史缓存". Distinguish reused storage from recomputed quantities with consistent color, clearly connecting outputs.
Bottom small technical condition strip: "精确复用条件: 历史隐藏状态不依赖后续可变输入" then "Seed 的缓存是实测推理选择, 可能引入偏差". Never imply causal order alone guarantees equality. No experimental curves, no invented timings. Include all storage consumers and completion boundary. Use schematic multi-layer network placeholder, not fake exact layer count. Q,K,V are common attention notation, no redundant Chinese expansions.
```
