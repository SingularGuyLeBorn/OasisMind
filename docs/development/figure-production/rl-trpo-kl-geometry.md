# TRPO 局部 KL 几何图

图片：`content/ReinforcementLearning/1-基础/1.3-近端策略优化/images/trpo-kl-geometry.png`。

来源：[Schulman 等，*Trust Region Policy Optimization*，ICML 2015 正式论文](https://proceedings.mlr.press/v37/schulman15.pdf)；绘图前核对 PDF 第 4 页（索引 3）的理论目标与实用更新、正文中的局部二次近似及共轭梯度解。论文 Figure 1 是采样流程，不是此处的 KL 椭球；本站图依据公式原创绘制，不冒称是 Figure 1 重绘。

生成方式：Codex 内置 `image_gen`，2026-10-11；具体模型版本未由工具确认。提供论文原页和仓库技术图风格参考，要求左右两个面板：左侧标出 $g$、$H^{-1}g$、$\tfrac12d^\top Hd\le\delta$、候选步与回溯；右侧明确分开理论中的最大状态 KL 改进界和实用算法中的样本平均 KL 约束。输出为白底 PNG，没有凭空实验曲线或数值。

数学核对：局部模型最大化 $g^\top d$ 且满足 $\tfrac12d^\top Hd\le\delta$ 时，候选方向为 $H^{-1}g$，长度为 $\sqrt{2\delta/(g^\top H^{-1}g)}$。最大状态 KL 与精确优势支撑论文的理论单调改进界；实用 TRPO 使用采样、平均 KL、局部近似和线搜索，原论文只报告经验上的改善趋势，不把前一保证直接转给有限样本实现。

配图作用：展示为何参数空间的直线梯度和策略分布的 KL 几何不同，也把读者最易混淆的「理论保证」与「实际求解」并排区分。最终检查：所有箭头有明确起终点；椭圆与文本不重叠；公式、标签和正文一致。
