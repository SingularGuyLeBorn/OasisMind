# LaViDa 互补监督与前缀缓存配图

## 前缀缓存正式第三版

正式路径: `content/DiffusionLanguageModels/3-模型谱系/images/fig-lavida-cache-v3.png`. 在第二版上通过内置生图局部编辑, 恢复橙色回答状态到下一轮嵌入的连接. 实际查看输出后确认: 6×6 可见性矩阵正确, 两轮分别直接读取缓存, 回答 QKV 独立重算, 下一回答流入下一轮前序层. 箭头两端完整, 无文字遮挡. 正文增加图 4 及解析, 补充模型参数、条件和位置配置固定的缓存前提. 接口仍无法确认模型版本.

编辑提示词:

```text
Precise object edit, change ONLY ONE connection in supplied figure. Add continuous ORANGE orthogonal line from right edge of middle-column bottom box '下一回答 x^(r+1)' at y875, across to x1020 in blank gutter, up to y500, then right into LEFT EDGE of right-column top box '嵌入与前序层, 重算' with one right-pointing arrowhead. Line source has NO arrowhead. Use orange to distinguish dynamic state transfer from blue cache read. No text needed. Preserve ALL existing blue cache lines exactly: cache→firstattention, cache→bottom margin→right edge secondattention. Preserve matrix, all boxes, all labels, all existing vertical arrows. Do not remove, shorten or relocate any other connection. The new line must end at second-round embedding box, NOT attention box, QKV box or cache. Gutter route must not cross text.
```

## 前缀缓存候选

实际传入 Figure 3 源页生成 `lavida-cache-candidate-v1.png`, 随后传入第一版编辑得到 `lavida-cache-candidate-v2.png`. 两版矩阵符合前缀隔离. 第一版把注意力1连到注意力2, 缓存读取含糊;第二版正确建立缓存到两轮注意力的独立读取, 却删除下一回答状态到第二轮输入的连接. 两版均不进入正文. 下一版须只恢复该时间依赖, 保留独立缓存读取.

首次提示词:

```text
Chinese scientific diagram 1536x1024 white background restrained teal blue orange regular rectangles clear crisp labels, no cartoons no bilingual translations or source notes. Reference actual LaViDa Figure3(b) for visibility matrix. Title "Prefix-DLM: 前缀逐层缓存, 回答逐轮重算".
TOP left 6x6 matrix rows查询 columns键. Axes v1 v2 p1 p2 a1 a2. Top4rows first4cols teal;top4rows last2cols white;bottom2rows all6cols teal. Legend "v:视觉, p:提示, a:回答; 着色可读取". Topright reasoning "前缀只读前缀 → 前缀隐藏状态不依赖当前回答 → 固定条件下逐层 KV 可复用". These as text equations not arrows floating between boxes.
BOTTOM three zones, expand ONE layer ℓ and TWO sampling rounds, no loops. Left staticprefix column: rectangle "固定视觉与提示" → rectangle "首轮前缀前向, 到第ℓ层" → rectangle "产生 K前缀ℓ, V前缀ℓ" → cache rectangular storage "第ℓ层前缀 KV 缓存". Cache branches two blue arrows DIRECTLY into attentionround1 and attentionround2 only. Never connect cache to answerQKVprojection.
Middle dynamic first-round vertical: "当前回答状态 x(r)" → "嵌入与前序层" → "第ℓ层回答 Q(r), K(r), V(r)" → "第ℓ层注意力, 第r轮" → "后续层与预测选择" → "下一回答 x(r+1)".
Right dynamicsecond-round: arrow from nextanswerx(r+1) enters TOP "嵌入与前序层, 重算" → "第ℓ层回答 Q(r+1), K(r+1), V(r+1)" → "第ℓ层注意力, 第r+1轮" → "后续层与预测选择" → "继续恢复". Cache arrow ends at each attention box, answerQKV arrow separately ends there.
Under attention label plain math compact "Q回答 读取 [K前缀; K回答] 与 [V前缀; V回答]" once shared note, not modelinput generated fromcache. Define "ℓ:层号, r:采样轮次;每层保存自己的前缀 KV". Footer "回答仍读取前缀; 前缀改变或请求结束时, 缓存需重建或释放". No claim attention becomes A². Every directed line must connect actual modules, avoid crossings use outer margin path nextstate→secondround input. No arrow from answerstate into prefix. Matrix indicates allansweranswervisible, no triangle. No unspecified cache built from finalanswer. Only staticprefixcache. Explicit two separate time rounds and layer boundary.
```

编辑提示词:

```text
Edit only cache connection in supplied figure. Preserve ALL other content and positions. DELETE the horizontal arrow from first-round attention box right edge to second-round attention box left edge. These attention boxes must have NO direct connection. Keep existing cache→firstattention arrow. Add a NEW distinct blue line originating from LEFT cache cylinder, routed via bottom margin below all three columns then up on far right margin, terminating with arrowhead at RIGHT EDGE of second-round attention box. Label that new route '读取同一层前缀 KV'. It MUST touch cache as source, not firstattention, and terminate at secondattention not QKV projection or nextanswer. Avoid crossing text/footer by reserve white margin or slightly expand canvas. Full continuous orthogonal line. No other changes.
```

## 独立监督图第二版

正式路径: `content/DiffusionLanguageModels/3-模型谱系/images/fig-lavida-complement-v2.png`. 重新传入原图, 内置生图生成. 逐项检查四位置输入、互补掩码、视觉条件分支、两个隔离前向与预测到损失的方向;监督 1、3 和 2、4 互补. 未掩位置没有损失箭头. 分布条形仅示意, 目标标签在交叉熵模块给出. 正文加入图 3 及解析. 此图不覆盖前缀缓存, 缓存图仍待完成.

完整提示词:

```text
Chinese scientific educational diagram landscape white background restrained blue and gray regular rectangles crisp typography. Reference actual LaViDa Figure3(a), ignore its matrix panel. Title "LaViDa: 两个副本覆盖全部监督位置". No English translated duplicates, no source/production text, no cartoon.
Show 4 numbered columns 1 2 3 4 consistently. TOP clean answer strip A B C D labelled "干净回答". It branches into TWO masking operators "掩位置1、3" and "掩位置2、4", each creates own fourposition noisy strip. LEFT noisy strip MUST EXACTLY M B M D. RIGHT MUST EXACTLY A M C M. Below each strip model rectangle "副本1独立前向" and "副本2独立前向". Fixed condition box "视觉编码结果 + 提示" at center has clean branched arrows into BOTH model inputs. No connection between model outputs or copies, note "模型参数共享, 副本不互读".
Each model outputs FOUR probability bar groups, not clean token sequence, labels "位置1分布" "位置2分布" "位置3分布" "位置4分布". Highlight groups1,3 on left and2,4 onright; others muted gray. Each selected group has downwardarrow into corresponding CEsmallbox, labelled left "目标A" "目标C" and right "目标B" "目标D"; target labels indicate clean answer supervision. Then left CEboxes→sum "副本1恢复损失";right CEboxes→sum "副本2恢复损失". No arrows from loss upward back to predictions; no gradient arrows. Unmasked groups NO arrow to loss. Explain "仅被掩位置计算交叉熵". Clean target used to create masking input and supervise losses, but never directly enters predictor. Note "M: 掩码位置; 分布条形仅作示意". No numeric loss or weighting formula. Footer "一次视觉编码, 两次独立回答恢复, 全部位置获得监督". Every arrow touches actual start/end modules, no overlapping boxes or labels. Clear informative token-to-distribution-to-loss relation, ample space.
```

## 科学来源

实际查看 arXiv:2505.16839v1 PDF 第 5 页 Figure 3(a)(b), 连同 §3.2–3.3 阅读. PDF: https://arxiv.org/pdf/2505.16839v1 . 原图留存 `lavida-source-page5.png`. 图的行表示 query、列表示 key. 前缀查询不能读取回答键, 回答查询可以读取全部位置.

## 第一版候选

`lavida-candidate-v1.png` 通过内置生图生成, 实际传入上述源页. 接口无法确认模型版本. 未进入正文.

已查看输出: 6×6 可见性矩阵正确, 但第一噪声回答画成五位置 A,M,B,M,D, 应为四位置 M,B,M,D. 干净目标错误连入噪声回答;损失到预测的箭头方向倒置. 前缀缓存连入回答 QKV 模块, 应直接供注意力读取;第一次回答状态没有进入第二次回答重算. 还出现冗余英中双语标签. 这些问题使本版无法用于教学.

后续拆为两个独立图, 优先把互补副本的输入与损失方向画对, 再单独展开缓存的产生和消费者. 不能因为矩阵正确便验收整张图.

## 完整生成提示词

```text
Create Chinese scientific teaching diagram landscape white background blue/teal and gray, sharp readable text, regular rectangles, no cartoons no decorative icons no production wording. Actual paper Figure3 page supplied as reference: follow its complementary masking and Prefix-DLM matrix, expand details. Title "LaViDa: 互补监督与前缀缓存". Two separate panels labeled 训练 and 推理, no arrow between them.
LEFT training: clean target strip A B C D. Split into independent noisyanswer1 M B M D and noisyanswer2 A M C M. Clean target must connect ONLY to loss targets, never to predictor input. Fixed '视觉特征 + 提示' box branches into BOTH predictor calls, labeled '视觉编码结果复用'. Answer1→'同一模型, 副本1前向'→predictionrow A B C D→lossbox '仅监督位置1、3: A、C'; answer2→'同一模型, 副本2前向'→predictionrow A B C D→lossbox '仅监督位置2、4: B、D'. For predictions show masked-target positions colored and others gray, loss arrows only from selectedpositions. No intercopy connections. Simple note '两个副本互不读取; 覆盖全部回答位置'. Define 'M: 掩码位置'.
RIGHT inference upper: precisely 6x6 attention visibility matrix rows查询 columns键, eachaxis labels v1 v2 p1 p2 a1 a2. v视觉,p提示,a当前回答. Top4rows first4cols tealallowed;top4rows last2cols whiteblocked;bottom2rows all6cols tealallowed. Legend '着色: 可读取'. Label '前缀只读取前缀, 回答读取全部'. No causal triangle.
RIGHT lower cache lifecycle: '固定视觉与提示'→'首轮逐层计算前缀 K、V'→'逐层前缀 KV 缓存'. That cache has TWO arrows to two attentioncalls. Separate currentanswer1→'当前回答 Q、K、V'→'注意力1'→'下一回答状态'; nextstate→'重算回答 Q、K、V'→'注意力2'→'继续恢复'. attentioncalls both read cachedprefixKV and currentanswerQKV. Use compact vertical timeflow to prevent overlap, no loops. Explain '前缀各层状态不依赖回答, 后续只读缓存; 回答随状态重算'. Never put arrow from answer into prefix cache. Never label cached prefix as fullanswercache. No numeric speedup, no probabilities, all exampleletters illustrative. Avoid English+Chinese duplicate labels; Q,K,V,KV,LaViDa allowed. Keep all arrows solid, single endpoint direction, every line connected.
```
