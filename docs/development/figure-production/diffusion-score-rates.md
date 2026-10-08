# Score entropy 反向速率候选

来源: [SEDD v3 §2–3](https://arxiv.org/html/2310.16834v3), 采用正文四状态教学数值, 不复制实验图. 已查看旧图, 其不同损失结论需替换. 内置生图接口无法确认 Image 2.5 版本. imagegen 与 scifig 用于结构分析和局部修订.

候选: fig-score-rates-candidate.png. 数值、箭头与累计生存率解释已核对;噪声概率标签的多余内层下标仍疑似未修正, 不进入正文. 原图保留. 后续需改为明确的 p_t(a) 并完成正文图注同步.

## 论文实验原图核对

实际下载并查看 [SEDD v3 PDF](https://arxiv.org/pdf/2310.16834v3) 第 7 页 Figure 1, 同时阅读 §5.3.1. PDF SHA256: `1f3a135a52346270ef4b0872d52f17954af7ea0fa53d0a0b31a9183599ec976e`. 整页查看留档为 `sedd-source-page7.png`;Figure 1(a) 以 PyMuPDF 按 PDF 坐标 `(52,68,300,282)`、4 倍分辨率直接渲染, 正式路径为正文 `images/fig-sedd-original-generation-ppl.png`, 尺寸 992×856. 首轮裁切遗漏纵轴标签, 扩大左边界后重新查看, 当前坐标、刻度和标签完整.

这是原图保留, 没有生图或重新拟合曲线, 不从像素反推实验数值. 两轴为对数刻度, SEDD 两条曲线的调用预算为 32–2048, GPT-2 星形点在 1024;评委 GPT-2 large、未退火采样条件由正文说明. 正文作为图 2 引用, 配中文图注与三条解析;机制图 1 的生图流程和手算数值保持不变.

## 提示词

最终局部修改已去掉噪声概率行的冗余公式,实际查看输出后通过. 正式图片为正文 images/fig-score-entropy-v2.png,旧版保留. 数值与逆向边逐项复算,正文图注和解析同步更新.

最后修订提示词: Edit only left probability table row-label second row. Delete entire math expression beneath 噪声时刻概率 (currently p_t(a_t)); leave label just 噪声时刻概率 centered, with no equation. This removes unnecessary notation instead of trying to repair small subscript. Everything else identical, all numbers arrows layout and bottom formulas unchanged.

```text
Chinese scientific teaching raster infographic, landscape white navy teal amber precise aligned rectangles, dense mathematics and state diagram. Title '从概率比到反向跳转 · 单位置手算'. Left table headers 状态 A B C M; row 数据概率 .5 .3 .2 0; row 噪声时刻概率 .20 .12 .08 .60. Explain M=掩码, 生存率 α=.4. Below graph forward arrows A→M B→M C→M each label q=2; header 前向吸收. Center table 当前状态 M, candidate A B C; ratios p_t(a)/p_t(M) = 1/3,1/5,2/15; rates q×ratio = 2/3,2/5,4/15. Label '比率不是归一化概率', sum score2/3 total rate4/3. Right distinct reverse graph M→A M→B M→C labeled rates 2/3 2/5 4/15. Below right one-step probability table h=.15 destinations A B C M probabilities .10 .06 .04 .80; note '冻结起点速率的一阶更新'. Bottom horizontal strip '归一化比率 → 揭示后的类别分布 (.5,.3,.2)' and '共同尺度 → 总跳转强度 4/3'. All formulas and arrows correctly oriented, arrows terminate at states, no broken connectors, no undefined concepts. No source note, no English-Chinese pairs, no historical comparisons or loss non-equivalence claims. Show numeric table not disproportionate charts.
```

```text
Correct three labels only, preserve all numeric tables arrows colors. Row 数据概率 p_t(a) must read 数据概率 p₀(a). Row 噪声时刻概率 p_t(a_t) must read 噪声时刻概率 p_t(a). Bullet α=.4 parentheses must say 从干净时刻到 t 未被掩码的概率, not 一个时间步. No other changes.
```

```text
One exact label correction only. In left table second probability row, equation currently p_t(a_t) has extra subscript t on a. Replace entire equation with p_t(a). Keep outer t on p, remove only inner t on a. All other content absolutely unchanged.
```
