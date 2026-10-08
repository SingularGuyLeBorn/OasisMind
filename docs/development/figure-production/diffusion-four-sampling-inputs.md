# 四种采样输入配图

## 科学来源与图像查看

- [LLaDA v3](https://arxiv.org/html/2502.09992v3), Figure 4、附录 B.4, PDF 第 24 页已渲染并实际查看.
- PDF: `tmp/llada-2502.09992v3.pdf`, SHA256: `18942f14544d696bef711acd43c84017e51b8428b15edc74130761218e66f73b`.
- 原图页面: `llada-sampling-source-page24.png`. Figure 4 对比逐位扩展、变长块扩展与定长块提交;教学图增加纯扩散参照, 不复制 Table 7–8 实验表格.
- 风格参考: `docs/assets/figure-style-references/nsa-mechanism.png`, 已查看并随源页面实际传入生图接口.

## 输出与验收

正式图: `content/DiffusionLanguageModels/2-数学与生成机制/2.3-生成因式分解与采样/images/fig-four-sampling-inputs.png`.

首轮候选保存在 `llada-sampling-candidate.png`. 内置生图生成后, 再编辑一轮统一图例、中文标签、跳步说明与连线. 接口未提供可确认的模型版本, 不声称已验证为 Image 2.5. 旧 `fig-three-samplers.png` 保留, 本篇引用改为新图.

四位置、块长 2 均为教学构造. 检查 k=0、1、2、4 的可见位置数, M 与未加入输入的空框, 定长画布不缩短、变长画布逐块扩展, 提示固定. 纯扩散先揭 C 再揭 A;其余三条从左侧当前位置或块内提交. k=2 到 k=4 略去一次提交, 不表示一次并行揭示两位. 图中的提交顺序不赋予预测器因果注意力或严格 KV 缓存. 橙色虚框的当前块含义在图前正文定义.

初版图例错误地称橙色为每步新增, 已改为首轮提交位置;未定义的青色 C 改为可见 token 的统一深蓝. 编辑版已重新查看, 标签与状态序列核对通过. 实验数值留在正文并标 Table 8, 不用生成图片冒充数据图.

## 首轮提示词

```text
Use case: scientific-educational. Create a Chinese technical teaching diagram, landscape white background, sharp typography, restrained navy/teal/amber. Image1 is LLaDA v3 PDF page24 scientific reference: distinguish variable input length vs fixed full canvas, not architecture or KV cache. Image2 NSA style reference: borrow precise token strips, clear grids, density, not its layout or data. Title "同一预测器，四种采样输入". Four equally sized panels in 2x2 grid. Each panel includes a fixed left prompt strip P and four aligned response column locations 1,2,3,4, each cell readable. Show four snapshots k=0,k=1,k=2,k=4 vertically, small labelled solid arrows between complete snapshot strips with both ends connected. Define k as "k：已提交位置数" once above panels, M as "M：掩码", empty dashed outline cell as "空框：尚未加入输入", navy A/B/C/D as "可见 token"; amber highlighting newly committed cells. Use EXACT state sequences:
Panel upper left "纯扩散：完整画布，任意位置". Rows k0 = M M M M; k1=M M C M; k2=A M C M; k4=A B C D. Explain "全画布共同去噪；本例每步提交一位".
Panel upper right "自回归采样：逐位扩展". k0=M empty empty empty; k1=A M empty empty; k2=A B M empty; k4=A B C D. Empty slots have dashed outline but no X or M; label "只加入下一个待生成位置".
Panel lower left "变长块采样：完成一块再扩展". block length two, vertical block boundary between cols2and3. k0=M M empty empty; k1=A M empty empty; k2=A B M M; k4=A B C D. label "前块完成后，才加入下一块掩码".
Panel lower right "定长块采样：完整画布，逐块提交". same boundary. k0=M M M M; k1=A M M M; k2=A B M M; k4=A B C D. Outline current first block cols1,2 at k0,k1; second block cols3,4 at k2; label "未来块掩码从开始就存在；当前块外不提交".
All prompt P strips unchanged navy. Emphasize no causal attention mask matrices, no cache icons: these are sampling/input distinctions for a fully bidirectional predictor, not a change to attention architecture. Bottom small text "教学示例：4 个位置，块长 2；实际取值由模型预测". Do not add benchmark scores, EOS causality claims, citations, source Figure wording, English then Chinese translation, decorative icons, overlapping boxes or broken/dangling arrows. Keep every grid mathematically exact, no extra rows or erroneous token duplicates.
```

## 局部修订

保持所有 token、快照与四面板不变. Prompt P 改为提示 P, Response 位置改为回答位置;橙色图例改为首轮提交位置;C 统一为深蓝. 快照条带加完整外框, 箭头连接前后条带边界, k=2 到 k=4 标略去 k=3. 不添加分数、EOS 因果说明或图面来源文字.
