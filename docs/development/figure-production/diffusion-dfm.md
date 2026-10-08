# 离散流匹配机制图

## 科学来源

[Discrete Flow Matching v2](https://arxiv.org/pdf/2407.15595v2), PDF 第 4 页 Figure 2 已下载、渲染并实际查看. 原图比较连续坐标移动与离散状态跳转, 展示概率通量对边际变化的作用. 教学图使用其离散状态与通量语义, 扩展成三状态路径、生成器、有限步概率与校正手算, 不复制原文实验结果.

§2.4 式 (12)、(13)、(24) 支持更新及后验到速度的转换;Theorem 2.4 支持理想后验下校正路径. 详细平衡例子是零净流的充分构造, 不作为所有校正器的必要条件. PDF SHA256: `5FF582A1CCB3E6584B23450A8F4FF05B3829D4FA29A9D240E5D31D15B0E140BD`.

## 输出与验收

正文图: `content/DiffusionLanguageModels/2-数学与生成机制/2.2-训练目标与离散分数/images/fig-dfm-probability-path-v2.png`. 原版保留, 候选单独放在本记录目录 `fig-dfm-probability-path-v2-candidate.png`, 不被正文引用.

使用内置生图接口, 传入已查看的原文整页与既有概括图. 接口未提供可指定或确认 Image 2.5 的字段, 不声明已验证模型版本. imagegen、scifig-scientific-figure 用于构图、生成与局部修改, PDF skill 用于原图页面渲染检查.

数值由同目录 `diffusion-dfm-number-check.py` 复算. 状态顺序为 m、A、B;行向量约定, 生成器行和零, 转移矩阵行和一. h=0.1 将 (0.5,0.3,0.2) 更新为 (0.4,0.36,0.24). 校正速率 0.12 与 0.20 对应双向通量 0.06, pRc=0. 本例精确相等不推广到序列粗步更新.

首轮候选已查看:路径与矩阵数值正确, 但 A 面板 t=0.6 的 B 标签误成 0.8, B 面板乘法漏 P, 并多出 MASK 括注. 第二轮已修三处, 保存在 `fig-dfm-probability-path-v2-labels.png`. 概率条带宽度与数值不成比例, 第三轮修分段比例仍未成功, 留存为 `fig-dfm-probability-path-v2-bars.png`. 第四轮去掉不准确的条带列, 用完整数字表表示边际, 保留生成器、跳转与校正机制. 原文参考页保存在 `dfm-source-page4.png`. 旧图虚线分支与英文模块解析同步替换.

## 生成提示词

最终输出已重新查看:四行概率表、R 与 P 的全部元素、pP 乘法、校正矩阵与双向通量一致. 无冗余双语标签, 边界规整, 所有跳转箭头两端明确. 机制图已进入正文, 原图与候选均保留. 配图通过不等于本篇所有后续工作与实验数字已核查.

```text
Scientific Chinese teaching figure, high information density, wide white background navy teal muted amber, crisp rectangular panels, readable mathematical symbols. Input image1 is scientific reference DFM Figure2: adopt meaning of discrete state jumps and incoming/outgoing probability flux, NOT its fullpage typography. Input image2 is old diagram to REPLACE COMPLETELY; do not preserve generic English boxes. Title '离散流匹配: 从概率路径到跳转' with badge '单位置教学示例'. Exactly 3 substantive panels A/B/C.
A '先规定边际路径': define m=掩码, A/B=两类数据 token, κ_t=t, target p1(A)=0.6,p1(B)=0.4. A clean table columns states m,A,B rows t=0:(1,0,0); t=0.5:(0.5,0.3,0.2); t=0.6:(0.4,0.36,0.24); t=1:(0,0.6,0.4). Match colored stacked bars eachrow, no measured plots. Label p_t=(1-t,0.6t,0.4t). Time increases 0→1. Sample jumps are discrete, not continuous token interpolation.
B '后验转为速率, 再形成转移概率': at t=0.5 currentstate m → '预测目标类别 q=(0.6,0.4)' display two normalized bars labelsA .6 B .4 → coefficient '1/(1-t)=2' → rates arrows m→A labelled1.2 and m→B labelled0.8, ordinary A/B no outflows. Include row generator matrix R rows/cols m,A,B = [-2,1.2,0.8;0,0,0;0,0,0]. Label '行:出发; 列:到达'. Below h=0.1, P=I+hR = [.8,.12,.08;0,1,0;0,0,1]. Current m transition probs remainm .80, A .12, B .08. State boundary final box '抽样得到 X_{t+h}; 下一步重新计算后验'. Another equation p_0.5 P=(.4,.36,.24)=p_0.6. Important rate units vs finite probabilities distinct; all arrows actual endpoints.
C '校正增加跳转, 不改变这一时刻的边际': instantaneous distribution fixedp=(.5,.3,.2). Two complete opposing curved arrows m→A rate.12, A→m rate.20. Both flux .06, calculations .5*.12=.06 and .3*.20=.06. Third state B no added correction edge. Rc=[-.12,.12,0;.20,-.20,0;0,0,0], pRc=(0,0,0). Bold summary '相等的是通量, 不是速率'. Caption withinpanel '速率×出发状态概率=通量'. Freeze t inthispanel, not claim wholepathconstant. No source notes, no 'Figure N 重绘', no bilingual translations, no cartoons, no overlapping modules, no dashed dangling connections. Do not add new undefined concepts. All numerical labels exact. Avoid massive whitespace. Raster publication-quality PNG.
```

## 局部修改提示词

```text
Precisely edit the provided technical figure, preserve every panel/matrix/value/arrow/layout except THREE text mistakes: (1) In panel A t=0.6 row rightmost amber segment of stackedbar currently incorrectly labelled '0.8', replace only its text with 'B'. The row numerical probabilities .4 .36 .24 stay. (2) In B block5 '验证边际更新', formula must be p_{0.5}P = (0.5,0.3,0.2)P = (0.4,0.36,0.24) = p_{0.6}. Currently missing P after (.5,.3,.2); add it, can break lines cleanly. (3) In A topdefinition '令 m 表示掩码 (MASK)' remove '(MASK)', leave Chinese definition. Everything else unchanged, all Rc/R/P matrix entries unchanged. No new concepts, no new text.
```

## 概率条带修订

```text
Make one targeted correction: panel A stackedbars must have correct geometric widths matching table probabilities. Keep every other element unchanged. The four bars have identical overall width: t=0 gray m 100%; t=.5 gray m50%, blueA30%, amberB20%; t=.6 graym40%, blueA36%, amberB24%; t=1 blueA60%, amberB40%, no gray. Precisely place segment boundaries: t=.5 at 50% and80% of barlength, t=.6 at40% and76%, t=1 at60%. Currentbars are visually wrong. Labels m,A,B inside appropriate segments. All numbers/matrices/arrows unchanged. Do not alter B and C panels at all.
```

## 最终数字表修订

```text
undefined
```
