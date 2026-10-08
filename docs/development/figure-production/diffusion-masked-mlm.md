# 加权 MLM 训练图

## 来源与范围

- 科学依据: [MDLM v1 §3.2–3.4](https://arxiv.org/html/2406.07524v1), SUBS 与连续时间目标;[LLaDA v1 §2.3](https://arxiv.org/html/2502.09992v1#S2.SS3), 式 (5) 与 Algorithm 2 的回答归一化.
- MDLM v1 PDF 第 2 页 Figure 1 已下载、渲染并实际查看, 页面保存为 `mdlm-source-page2.png`. 左侧是不同掩码率下的加权交叉熵训练, 右上概括目标与采样, 右下是 One Billion Words 困惑度比较. 本文教学图展开左侧训练的输入、预测与损失计算, 教学数值不来自右下实验柱图. 此次核对补齐此前 HTML 与截图请求超时留下的原图视觉检查.
- 正文图片: `content/DiffusionLanguageModels/2-数学与生成机制/images/fig-masked-diffusion-train-v2.png`. 原版 `fig-masked-diffusion-train.png` 留在原目录,首轮候选单独保存在 `docs/development/figure-production/fig-masked-diffusion-train-v2-candidate.png`,不被正文引用.
- 使用内置生图接口, 接口未提供可指定或确认 Image 2.5 的版本字段. 使用 imagegen 与 scifig-scientific-figure skill 的结构分析、生成和回读流程.

## 数值与验收

掩码位置为 2、5、7,真实类别概率为 0.72、0.41、0.86. 三项负对数为 0.3285040669720361、0.8915981192837836、0.15082288973458366, 和为 1.3709250759904033, 乘 8/3 为 3.655800202641075. 显示为 1.371、3.656, 不先取整再计算. 其他概率柱形仅表示分布轮廓, 不读出实测数值.

输出已实际查看. 指示向量 a 与掩码 token m 分开;八个位置、双向注意力矩阵、三个监督位置及门控求和一致. 清理 copy / ignore 与 mask rate 标签, 删除悬空橙色连接. 输入箭头从腐蚀序列到预测模块, 矩形规整无遮挡. 首轮候选求和使用等号且条件漏 t, 第二轮改为约等号并补 t. SFT 只有条件与损失选择变化, 本文补公式与八位置例子, 不重复新增相同训练图.

## 提示词

第一轮:

```text
Edit the provided Chinese technical teaching figure. Preserve dense aligned token tables A,B,C,D, full 8x8 attention matrix, probability distributions, white navy pale amber scientific style. Improve complete clarity, regular rectangles no overlaps. Main title '加权 MLM 的一次训练计算 · 教学示例'. L=8 t=3/8 masks positions2,5,7. Rename 'mask 向量 m' to '掩码指示 a', values 01001010; reserve m for mask token. Use [m] in corrupted row. Replace every copy / ignore with '不计损失'. Remove ALL orange dashed connectors between A and B (currently dangling/misaligned); instead add one solid arrow from A corrupted sequence lower boundary into B block top boundary with label '输入 x_t', endpoint explicit. Retain full eight position probability distribution cards, correct-token probabilities .72 .41 .86 for positions2,5,7. All other distributions schematic not measured. Label '各位置真实 token 的预测概率'; do not claim unmasked SUBS distribution arbitrary. C title '掩码位置交叉熵', masked losses approximately .329 .892 .151, unmasked0; formula e_i=1[x_t^i=m](-ln pθ(x_0^i|x_t,t)), use approximate ≈ in three log equations. D title '求和与时间加权', a⊙ℓ gated row. Exact unrounded sum -ln(.72*.41*.86)≈1.371, final loss (8/3)[-ln(.72*.41*.86)]≈3.656. Never 1.372 or3.659. Note '先用完整精度求和, 最后显示三位小数'. Sidebar title '不同掩码概率的样本示例'; t=1/8 sample masks position3; t=1/2 sample masks1,3,5,7; weights8 and2. Replace bottom sidebar text '掩码数量随机, 单位置权重为 1/t'. Footer loss negative expectation 1/t sum indicators logp with time t. No English Chinese translation pairs, no source/repainting notes, no broken lines, mathematical subscripts clear. Do not add invented concepts. Image is raster PNG.
```

第二轮:

```text
Make two exact small text corrections only, preserve all layout, numbers, colors and graphs. In D panel the sum expression should read 'Σ_i a_i ℓ_i ≈ 1.371', replace equals with approximately because rounded. In B prediction probability formula add ',t' to condition, pθ(x_0^i | x_t,t). Everything else unchanged, no new arrows or notes.
```
