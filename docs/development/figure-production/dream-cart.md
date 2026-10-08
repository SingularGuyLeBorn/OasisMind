# Dream CART 配图

来源: [Dream v1](https://arxiv.org/pdf/2508.15487v1),第 4 页 Figure 2 和第 5 页 Figure 3、式 (4)–(5) 已实际渲染查看. 源页保存在本目录 `dream-source-page4.png` 与 `dream-source-page5.png`. 本图展开 CART,移位预测头另行制作.

正式图片: `content/DiffusionLanguageModels/3-模型谱系/images/fig-dream-cart-v1.png`. 使用内置生图,接口未提供可确认的模型版本,不标称已确认 Image 2.5. 参考输入实际传入 `dream-source-page5.png`. 原始候选保留在生成目录,未覆盖既有交付卡.

验收:五位置 `(A,M,M,M,E)`,教学 p=0.5. 几何贡献采用 p(1-p)^(d-1),位置 2/3/4 权重分别 0.3125/0.25/0.3125,交叉熵均为 2 时逐项损失 0.625/0.5/0.625,总和 1.75. 表内贡献在乘 1/2 前. 两条带噪输入支路表示同一序列,权重仅进入损失,不进入网络条件. 已查看生成图,核对数值、箭头端点、框体、标签与教学标识. 交叉熵内部词表预测与真值标签未展开,正文解析补充.

## 完整提示词

```text
Use case: scientific-educational. Create a precise Chinese scientific teaching diagram, landscape 1536x1024, white background, flat navy/teal/orange academic style, crisp readable type, no cartoons, no decorations. Reference image is source paper page: use Figure 3 and Equation 5 as scientific structure reference, NOT copy page text or experimental charts. Title: Dream CART: 可见上下文如何进入损失. Top: five aligned token cells, positions 1 2 3 4 5, input A M M M E, A/E teal visible, M light orange masked; legend M: 掩码. Main middle: two visible sources A(position1) and E(position5) feed each of three masked-position weight rows. Show explicit contribution table with columns 目标位置 / 来自 A / 来自 E / 权重 w. Rows 2 / 0.5 / 0.125 / 0.3125; 3 / 0.25 / 0.25 / 0.25; 4 / 0.125 / 0.5 / 0.3125. Define above table: 教学参数 p=0.5; 距离 d=|n-i|; 单个可见位置贡献 0.5×(1-0.5)^(d-1); w_n=(两端贡献之和)/2. Table contributions are BEFORE factor 1/2. Lower panel: a distinct computation graph: 带噪输入 → 双向 Transformer → 掩码位置交叉熵 vector [2,2,2]; separate branch 带噪输入 → 可见位置与距离 → 权重 vector [0.3125,0.25,0.3125]; both vectors meet elementwise multiplication node ⊙ → 加权损失 [0.625,0.5,0.625] → 求和 1.75. Every line is continuous, arrow has exact source/destination, no floating connections, no accidental overlap. Footnote 教学示例, 非实测结果. Do not imply weights sum to one; do not draw weights entering Transformer time embeddings; weights enter loss only. Use Chinese labels, preserve Dream CART, Transformer, M, p, w mathematical labels. No English with parenthetical Chinese translations. No Figure N source or production notes inside picture. All rectangles regular, aligned, no overlap or skew. Keep labels readable at article width. Accurate arithmetic mandatory.
```
