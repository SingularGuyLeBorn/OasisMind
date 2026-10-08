# 联合依赖教学图

- 正文: `content/DiffusionLanguageModels/1-导论与阅读路线/1.1-动机与能力边界/1.1.2-扩散与自回归的能力边界.md` §1.1.
- 正式图片: `content/DiffusionLanguageModels/1-导论与阅读路线/images/fig-joint-vs-independent.png`.
- 依据: 正文的 00/11 自构造反例与概率链式法则. 此图不是论文 Figure 的重绘, 不编造论文图号. 实测图不使用这一教学样例.
- 复算: p=(0.5,0,0,0.5), q=(0.25,0.25,0.25,0.25);各自归一化为 1, q 非法概率为 0.5, D_KL(p||q)=0.6931471805599453. 自然对数. 条件树两条终点路径各概率 0.5.
- 连带修复: 两位置正确事件的联合概率与协方差关系. 各正确率 0.95 时 Fréchet 范围 [0.90,0.95], 独立值 0.9025;错误正相关对应正确事件正相关, 不能由它推出全对概率低于边缘乘积.
- 流程: scientific-figure 先组织概率表与条件树, 内置 imagegen 生成候选, 检查数值和端点后局部修改标签. 接口未返回可确认模型版本. 候选保留在本地生成目录.

## 生成提示词

```text
Use case scientific-educational. Create a Chinese dense legible scientific teaching PNG, landscape 3:2 white background navy text muted teal blue orange, regular rectangles no overlap or floating arrows, no source notices, no redundant bilingual labels. Title “边缘都正确，独立组合仍会出错”. Subtitle “教学示例：合法答案只有 00 与 11，各占 1/2”. Define X₁ firstbit, X₂ secondbit, z currentvisiblecondition=[MASK,MASK]. Three well-spaced columns with connected actual probability trees and 2x2 tables (not blank cards).
LEFT “真实联合分布”. Exact 2x2table with ROWS X₁=0,X₁=1, COLUMNS X₂=0,X₂=1: cells 1/2,0;0,1/2. Green diagonal valid, pale red offdiagonal invalid. Below “两个边缘：P(X₁=0)=P(X₂=0)=1/2；取1也各为1/2”. Note “P(X₂=X₁)=1”.
MIDDLE “同一旧状态，独立并行抽样”. InputtwoMASKstrip feeding separate rectangles “第一位：0或1，各1/2” and “第二位：0或1，各1/2”; NO arrows fromonefirstbittootherbit (independence). Pairedlines to output2x2table exactallfourcells1/4, row/colsame labels asleft. Offdiagonal red text “01：非法” and “10：非法” if spaceseparate underneath. Formula “q(X₁,X₂|z)=p(X₁|z)p(X₂|z)”. Result “非法概率=1/4+1/4=1/2”. Need label BOTH marginal predictions ARE EXACT, error from independentcombination. No claim attentioncan't communicate.
RIGHT “提交第一位，再重新计算第二位”. Draw actual binary probability tree: “[MASK,MASK]” start branches with labels 1/2 to “[0,MASK]” and “[1,MASK]”; each next straight branch label “条件概率1” to final “00：概率1/2” and “11：概率1/2”. Draw modelrecompute narrowrect between eachintermed andfinal label “读取已提交的第一位” or put arrowlabel “重新前向”. Below formula “p(X₁,X₂|z)=p(X₁|z)p(X₂|X₁,z)”. Result “非法概率=0”. Parent-childarrowsonnodes realendpoints. Underbottom smallsummary “全双向注意力读取当前状态；同轮独立抽样看不到彼此尚未提交的取值”. No curves/benchmarks, no networksnamedor dates.
Optional last mathbar “D_KL(p||q)=ln2 ≈0.693（自然对数）” but define p truejoint, q middleindependent, not extraunknownconcept; articleexplainsKL. Use ifspacelegible. Explain notproofallparallelfails; no disclaimerprose needed. Output no warningsthat thisisnottheorem. Allnumbers exact. No iconart, no perspective, no deformedboxes, no source/redrawmetadata.
```

## 局部修正

```text
Precise text-only edit. In top symboldefinition remove parenthetical English (first bit) and (second bit) completely; keep X₁表示第一位，X₂表示第二位，z表示当前可见条件=[MASK,MASK]. In middleorangeannotation replace all text 两路独立抽样，没有从第一位到第二位的箭头（相互独立）。 with exact “两位置只条件于旧状态 z，分别独立抽样。” This is scientificcontent rather than describingdrawing. Preserve EVERY formula, matrixnumber, probability tree, arrows, colors, layout and allotherChinese unchanged. No new English-Chinesetranslations or source/making notices.
```
