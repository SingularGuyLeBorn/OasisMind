# SDTT 软目标收集图

## 当前验收结果

当前正式图为重排后的 v6, 源分辨率与800px固定宽度预览已检查, 详见 `sdtt-target-collector-v6.md`. v1–v5 保留为候选. v3、v4 的 KL 方向正确, 但位置4软目标收集线仍从位置5分布旁出发, 位置4旁还有断开的短线;重排布局后修正. 公开站完整页面与移动端验收仍待完成.

### v3 修正请求

保持三分区、冻结教师、状态条和其余对象. 反向 KL 必须为 `Σᵢ KL(sᵢ || q̃ᵢ)`, 学生在前且 s 无波浪号. 删除 q5 第二步到目标位置4的错线;将 q4 第二步旁的短线连续接到目标位置4. 保留 q5 到目标位置5的独立连接. 实际输出仅修正了 KL, 未修正连接.

### v4 修正请求

仅修改位置4连接:删除 q4 旁断线和 q5 旁到位置4的错线, 从 q4 第二步分布右上边缘连续连接到目标位置4;保留位置5连接及正确反向 KL. 输出仍留下同型断线与错误起点, 未通过科学验收.

## 来源与状态

依据 [2410.21035v2 Figure 3(a)、Algorithm 1、2](https://arxiv.org/html/2410.21035v2#S3.SS1). 已实际查看 PDF 第 3 页整页图, 保存 `sdtt-source-figure3-page.png`. 参考图通过接口实际传入. 使用内置生图, 接口不能指定或确认 Image 2.5 版本.

候选 v1 已保存 `sdtt-target-candidate-v1.png`, 暂不进入正文:目标收集箭头从分布组末端出发, 无法对应具体 q 行;学生输入的掩码格挤在一起;采样状态误用连续时间的 t−1、t−2 标签. 后续修改对应连接、格间距与状态记号.

## 首次提示词

```text
Use case: scientific-educational. Create a detailed Chinese technical teaching figure for SDTT, wide landscape 1536x1024, white background, restrained navy/teal/orange scientific palette, straight regular rectangles, precise complete arrows, no cartoons, no decorative gradients. Reference image is the SDTT paper Figure 3(a) page: borrow the per-position probability-row collection as tokens become denoised, NOT the experimental plot or page text. Expand the actual Algorithm 1 target collector and separate frozen teacher path from student original input. Title "SDTT：按揭开时刻收集软目标". Small label "六位置、两教师步：教学示例". Define in small legend "M：掩码；字母：token 类别；q：教师分布；s：学生分布". No redundant English/Chinese bilingual text. No paper provenance inside image.

Layout 3 structured regions, connected, with explicit position column alignment. Left ~60% width shows frozen teacher two steps top-to-bottom; right upper 35% shows soft-target row collector; bottom shows student input, forward, reverse KL loss, gradient update.
Teacher state strips SIX cells labelled positions 1 2 3 4 5 6 above columns. Original input "A M C M M F". Mark initial masked positions {2,4,5}. Arrow from original input into rectangular "教师 θ：冻结". It produces three probability minirows q₂⁽¹⁾,q₄⁽¹⁾,q₅⁽¹⁾, use small schematic bars NO numeric probabilities. Arrow through "采样第1步" into next state "A B C M M F". An orange branch from q₂⁽¹⁾ directly into collector row "位置2：q₂⁽¹⁾", label "首次揭开：保存". q₄⁽¹⁾ and q₅⁽¹⁾ are calculated but NOT stored as targets, label "仍为M：暂不保存". Next state goes into "同一教师 θ：冻结", produces q₄⁽²⁾ and q₅⁽²⁾ minirows, then "采样第2步" -> "A B C D M F". q₄⁽²⁾ branch to collector "位置4：q₄⁽²⁾", label "首次揭开：保存". q₅⁽²⁾ branch to collector "位置5：q₅⁽²⁾", label "两步后仍为M：取最后一步". Three collector rows clearly contain entire probability minirow, NOT sampled hard letters B or D. Below collector caption "目标 q̃：逐位置拼接；停止梯度". Already visible positions 1,3,6 do not enter loss.

Student region bottom: duplicate original strip "A M C M M F" label "学生读原始输入 zₜ", arrow into "学生 ν：一次前向", arrow into three output rows "s₂ / s₄ / s₅". Collector q̃ arrow into loss, student rows arrow into SAME loss rectangle labelled "反向 KL：Σᵢ KL(sᵢ || q̃ᵢ)" with smaller "i ∈ {2,4,5}". A clearly attached dashed navy arrow from loss back to student box labelled "仅更新 ν". Explicit note below student "不读取教师生成的 B、D". Teacher generated strip has no connector into student input. Distinguish solid data arrows vs dashed gradient using legend. All connectors complete endpoints, no dangling lines, no overlapping blocks or label crossings. Keep text large readable at 800px width, use aligned rows with 18-24pt visual equivalent labels. Avoid excessive microtext. Preserve mechanism even if simplify composition. No experimental numbers, no accuracy or speed cards.
```

## 第二、三版局部修正

v2 保存为 `sdtt-target-candidate-v2.png`. 六个输入格与状态记号已修正, 但反向 KL 被误画为教师在前, q4 第二步连接仍断开, q5 连接误入位置4目标. 继续局部修正, v2 不进入正文.

### v2 提示词

```text
Edit this SDTT candidate, preserve title, 3-region layout, style, teacher freeze, reverse KL direction, target row contents. Fix only geometry and specific incorrect labels/connections. Original input A M C M M F has six SEPARATE equally sized cells in student AND teacher. Student positions4 and5 MUST be separate M rectangles, not merged. Replace teacher state subscripts z_{t-1} and z_{t-2} with simple z^(1) and z^(2), since denoising time is continuous not integer decrements.

Crucial target arrows must physically begin at the correct named probability panel, never at the final panel of a group. From first-step q₂^(1) mini-chart draw a continuous orange path from its TOP-RIGHT corner through reserved whitespace to target collector row position2. From second-step q₄^(2) chart draw continuous orange path to collector row position4. From second-step q₅^(2) chart draw continuous orange path to collector row position5. All three paths distinct, not overlap/cross probability labels. Remove the current arrows originating vaguely at right side of grouped strips. The "仍为M：暂不保存" annotation must be plain text BELOW first-step q₄^(1),q₅^(1), with NO dangling arrows. The target collector rows must have only category labels A B C D E F below bars; remove confusing position numbers 1..6 floating above the three full-distribution bars. Keep position2/4/5 labels on rows and positions1..6 on FINAL assembled target strip. Preserve target q₂^(1),q₄^(2),q₅^(2), initialmask{2,4,5}, visible{1,3,6} excluded. Keep all other physical arrow endpoints clear. Avoid broken lines and label overlap. Do not add extra decorations.
```

### v3 提示词

```text
Precisely repair this existing SDTT diagram. Preserve every other pixel/object and its labels. ONLY two edits:
1. Bottom-right reverse KL formula MUST read exactly "Σᵢ KL(sᵢ || q̃ᵢ)" and beneath "i ∈ {2,4,5}". Student s is FIRST argument, target q tilde SECOND. NO tilde on student s. Existing image accidentally has reversed arguments, fix it.
2. Middle-left q₄⁽²⁾ top-right orange dot has a short horizontal line that ends disconnected at x≈550. The right collector position4 incoming arrow at y≈320 currently begins from q₅⁽²⁾'s orange line. Remove that incorrect connection from q₅ to row4. Route q₄ dot as ONE continuous orange polyline: start dot (x≈463,y≈571), go RIGHT to x≈790, go UP to y≈320, then RIGHT into collector position4. The q₅⁽²⁾ arrow to collector position5 stays independently from its lower-right chart boundary (x≈635,y≈616) RIGHT to x≈850 then UP to y≈440 then RIGHT to position5. Avoid touching q₅ top label, keep both lines distinct and complete. The q₂ first-step orange line remains unchanged. No extra arrows, no overlapping rectangles, no unrelated changes.
```

### v4 完整提示词

```text
Make ONLY this connector correction. Preserve all text, formula, states, rectangles, panels, and probability bars exactly. In middle-left second-step teacher distributions, ERASE the disconnected orange dot/stub next to q4^(2), and ERASE the incorrect orange dot/line from above q5^(2) routed up to target position4. Replace those TWO erroneous orange elements with a SINGLE complete orange connector from the upper-right edge of the q4^(2) probability chart (near x460 y600) horizontally to x770, vertically up to y318, then horizontally RIGHT with arrowhead entering the collector row labelled "位置4：q4^(2)" near x923. This new line must start at q4 chart, not q5 chart, must be unbroken. Route its first horizontal portion in the whitespace above probability bars, do not cross label q5. Use top-left q4 chart edge if needed to avoid labels. Preserve separate existing q5 lower chart line to position5. Preserve first-step q2 connector. Reverse KL bottom-right must STAY student first "Σ_i KL(s_i || q̃_i)". Never reverse formula. Do not change anything else.
```
