# Dream 移位预测配图

来源: [Dream v1 Figure 2、§4.1](https://arxiv.org/html/2508.15487v1#S4.SS1). 实际查看源 PDF 第 4 页,参考输入为本目录 `dream-source-page4.png`. 内置生图,接口未确认模型版本. 正式图片 `content/DiffusionLanguageModels/3-模型谱系/images/fig-dream-shift-v2.png`,初版保存为 `dream-shift-candidate-v1.png`.

科学复核:两种模型均使用 h_i 预测目标 i+1. 因果矩阵 5×5 开放下三角 15 格,双向矩阵开放 25 格. 输入 S,A,M,C,M 对应隐藏状态 h0–h4,损失仅计 h1 预测目标位置 2 的 B 与 h3 预测位置 4 的 D. 干净标签未作为对应被掩输入. 局部连接 C(输入3)→双向注意力→h1→B(目标2) 说明可见范围与预测位置独立. 端点、框体、文字、颜色和末端示例边界已查看. 初版冗余 Key/Query/AR 括注经局部编辑删除,其余科学结构保留.

## 生成提示词

```text
Scientific educational Chinese diagram, white background, precise flat blue/teal/orange academic style, 1536x1024. Use supplied Dream v1 paper Figure 2 as scientific reference, not page text. Title Dream: 保留移位, 改变可见范围. Two panels vertically. Each panel five aligned columns position 0,1,2,3,4. Top AR panel input tokens S,A,B,C,D; Transformer causal attention; hidden states h0,h1,h2,h3,h4; output TARGET tokens A,B,C,D,E shifted: draw h0 arrow to A target position1, h1→B target2, h2→C target3,h3→D target4,h4→E target5. Use output row labels目标位置1,2,3,4,5, aligned with their originating hidden columns, with an explicit label h_i→目标i+1. Small causal attention 5x5 matrix rows query0..4, cols key0..4, permitted lower triangular including diagonal teal, prohibited white. Bottom Dream panel same position0..4 inputs S,A,M,C,M. Full bidirectional Transformer, hidden states h0..h4 same alignment, predicted targets A,B,C,D,E at target positions1..5. Only target2 B and target4 D orange and loss-active: h1→B at2; h3→D at4. Others grey no direct reconstruction loss. Note M:掩码, S:可见前置token. Full attention 5x5 all25 cells teal, legend teal可见 white不可见. Important h1 can see right input C at3 although it predicts B at2: inset C(输入3)→双向注意力→h1→预测B(目标2). All connections exact endpoints, no floating/broken arrows, no overlapping rectangles. Main comparison headline 两种模型都用h_i预测位置i+1; show mappings intact. Footer 教学五位置示例. Do not draw original B or D as network inputs in Dream; true targets B/D belong only output/loss side. Do not imply hidden state includes only same-position token; h_i computed through contextual attention. No experiment numbers. No irrelevant English translation parentheses, source Figure N labels or authoring notes. No cartoon and no decorative glow. Large readable labels, clean flat rectangles.
```

## 局部修改提示词

```text
Precise text-localization edit only. Keep entire approved Dream scientific diagram unchanged: all input tokens, hidden states, target positions, arrows, 5x5 matrices, loss gating, shapes, colors and layout. Remove redundant English parenthetical translations from the four matrix axis labels: replace both instances 键位置 (Key) with 键位置, replace both instances 查询位置 (Query) with 查询位置. Also replace 自回归模型 (AR) panel label with 自回归模型, keeping Dream and Transformer official terms. Do NOT alter any scientific content or add other captions. Ensure regular rectangles, connected arrows and readable Chinese. No other changes.
```
