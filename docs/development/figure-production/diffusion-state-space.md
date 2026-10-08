# 连续与离散语言扩散配图

- 正文: `content/DiffusionLanguageModels/1-导论与阅读路线/1.1-动机与能力边界/1.1.1-为什么用扩散做语言生成.md`.
- 图片: `content/DiffusionLanguageModels/1-导论与阅读路线/images/fig-continuous-vs-discrete-dlm.png`.
- 来源: [Diffusion-LM v1](https://arxiv.org/html/2205.14217v1) Figure 1、§4.2;[MDLM v1](https://arxiv.org/html/2406.07524v1) Eq. (8)、§3.2. 原图 Figure 1 已实际查看并传入生成接口. MDLM v3 HTML 返回 404, 改读可访问的 v1.
- 两条路线分别展开训练前向与生成反向, 不把干净训练样本当成生成时已知输入. 下方只代表吸收态, 不代表所有 D3PM 转移核.
- 数值: 0.6+0.3+0.1=1. 揭开概率与保持掩码概率相加为 1;条件为 s<t、αₛ>αₜ、αₜ<1. 具体状态条带为教学示例.
- 旧图只有英文名称框且混写干净 token 预测与 score. 候选修正时间方向、单步输出和映回词表的定义, 最后复核两条分支的箭头端点.
- 内置 imagegen 实际生成, scientific-figure 用于组织科学关系. 接口未提供可确认的模型版本. 旧图与候选保留在本地生成目录和 tmp/figure-previews/2026-10-08.

## 初始提示词

```text
Use case scientific-educational. Rebuild existing first reference simple English route chart into clear Chinese dense mechanism diagram. Second reference is actual Diffusion-LM Figure1, borrow continuous latent denoising progression only, no classifier because not explained in this local figure. White landscape, restrained navy blue orange green, regular rectangles, crisp Chinese text, no cartoons, no source notices, no redundant English(Chinese).
Title “语言扩散：向量加噪与词表转移”. Define x₀ clean tokensequence, z continuous embedding; t noise level, s<t lower noise. TWO stacked panels.
Upper title “连续嵌入路线”. Training row “干净 token x₀” [a b c] → “嵌入 z₀=E(x₀)” 3vector columns → “高斯加噪 zₜ” noisyvector columns, arrow label 训练前向. Generation row starts “高斯终态 z_T” vectorcolumns → “多步去噪 z_T→…→z₀” with noisy→clean columns → “映回词表” → “生成 token”. Lastmapping illustrate dot nearest among labeled词向量 E(a),E(b),E(c), no numerical coordinate axes needed. Note “中间状态是实数向量；最终需离散映射”. DO NOT connect clean input to generationstart.
Lower title “离散吸收态路线”. Trainingrow “干净 token x₀” [a b c] → “按保留率 αₜ 掩码” → “带噪 token xₜ” [a MASK MASK]. Define αₜ保留概率. Generationrow “全掩码终态” [MASK MASK MASK] → “预测干净 token 分布” include 3category probabilities teachingexample a .6 b .3 c .1 (sum1) → “反向采样 xₜ→xₛ” → “逐步恢复 token”. Probability inset teachingexample clearly labeled. Include correct singlemaskedpositionposterior “揭开概率 = (αₛ−αₜ)/(1−αₜ)”, “仍掩码概率 = (1−αₛ)/(1−αₜ)” and define “s<t, αₛ>αₜ”. Tinybranch maskedposition→“仍为 [MASK]” or“抽取词表 token”, properarrows both explicit into boxes. Note “状态始终是类别；无需最终向量量化”. Use learnedclean distribution not score. This is absorption example not allD3PMvariants.
All arrowlines continuous start/end borders, no crossingtext, at articlewidth readable, math exact. No dates, speedclaims, modelranking. No English except canonical token,MASK,modelnames ifneeded. All conceptdefinitions infigure.
```

## 科学关系修正

```text
Precise edit scientific labels/connectors only, keep all other layout and color.
Upper continuous mapping currently says nearestneighbor/dot and takes argmaxdot, misleading. Replace above arrow label 映回词表 (最近邻或点积) with 映回词表. Replace 与各词向量点积，取最大 with “输出词表概率，取 argmax”. Wordvector table becomes “词表输出头” and rows “a: p(a|z₀)” “b: p(b|z₀)” “c: p(c|z₀)”, tiny bars fine notnumerical probabilities needed. This reflects Diffusion-LM §4.2 mostprobablewordmapping not mandatory nearestneighbors. Preserve training embedding E.
Lower posterior heading WRONG from s to t. Replace exact “对单个被掩码位置，从 s 到 t 的后验” with “单个掩码位置：从 t 回到 s”.
Rightmostlower box currently shows fullydecodedx0 immediatelyfromone step. Change title “下一较低噪声状态 xₛ” and tokenstrip “a [MASK] c”. Both outputbranchboxes “抽取词表 token” and “仍为 [MASK]” must have complete arrows from RIGHTBORDER converging to RIGHTMOST NEXTSTATE LEFTBORDER; current floatingline must connect. Put note below rightbox “重复反向步骤，最终得到 x₀”. Generation arrowbeforeposterior label “单步反向：xₜ → xₛ” instead of multi-stepxT..x0. Upper distribution example replace “例：某位置的预测分布” with “教学示例：某位置的预测分布”. Keep probabilities .6 .3 .1 unchanged and exact posteriorfractions. Everyarrow endpoint proper nooverlap.
```

## 连线端点修正

```text
Change ONLY lower-right branch connections. Draw a continuous arrow from RIGHT BORDER of 仍为 [MASK] rectangle, routed to LEFT BORDER of 下一较低噪声状态 x_s rectangle at a distinct lower port. Current topbranchline from 抽取词表token rectangle must start on its RIGHT BORDER, end on LEFT BORDER of nextstatebox at distinct upperport, not floating in whitespace. No line passes through text or the other branch box. Keep all posterior probabilities, trainingrows, labels and uppercontinuouspanel unchanged. No new objects or captions.
```
