# REINFORCE baseline 两动作手算配图

图片: `content/ReinforcementLearning/1-基础/1.2-策略梯度与估计/images/reinforce-baseline-variance.png`。

来源: 原创教学图,不是论文原图或原图截图。机制来源: [Ronald J. Williams, *Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning* (1992)](https://doi.org/10.1007/BF00992696)。数值来自 `content/ReinforcementLearning/1-基础/1.2-策略梯度与估计/1.2.2-reinforce.md` 的两动作手算。

生成方式: Codex 内置 image_gen,2026-10-11。工具结果未确认具体模型版本,不标为 Image 2.5。

数学核对: p(a1)=p(a2)=0.5;无 baseline 时 score 为 +0.5/-0.5,奖励为 4/1,单样本梯度为 2/-0.5,均值 0.75,总体方差 1.5625。b=2.5 时权重为 +1.5/-1.5,两种梯度均为 0.75,总体方差 0。score 是二动作 logit 在 p=0.5 时的局部导数,b=2.5 仅为本例理想条件 baseline。

## 实际生成提示词

```text
Use case: scientific-educational
Asset type: horizontal technical figure embedded in a Chinese reinforcement learning article, white background, mobile readable.
Primary request: illustrate the exact two-action REINFORCE baseline calculation with two vertically aligned panels and a compact probability distribution, not a generic flowchart. Panel A (without baseline): two rows a1 and a2, each probability 0.5. a1 has reward 4, score +0.5, gradient sample 2.0. a2 has reward 1, score -0.5, gradient sample -0.5. Mean gradient 0.75, variance 1.5625. Panel B (baseline b=2.5): same action probabilities, rewards and scores, but weight R-b is +1.5 for a1 and -1.5 for a2; both gradient samples equal +0.75. Mean gradient 0.75, variance 0. At right compare discrete gradient distributions as two little plots: before, mass 0.5 at -0.5 and mass 0.5 at 2.0; after, all mass at 0.75. Use exact mathematical notation and decimal values.
Style/medium: high-density publication-grade didactic math diagram, precise 2D vector-like rendering as PNG, no perspective distortion. Cream-white canvas, dark slate typography, muted blue for a1, rust orange for a2, green highlight only for unchanged expected gradient. Compact table grid with extremely clear legible numbers. Directly connected arrows only if mathematically necessary; no decorative arrows.
Text (verbatim): "无 baseline", "baseline b=2.5", "action", "概率", "reward", "score", "权重", "单样本梯度", "均值 0.75", "方差 1.5625", "方差 0".
Constraints: all mathematical values must match exactly; no additional numbers, no invented labels, no English-plus-Chinese redundant translations, no logo or watermark. Wide landscape aspect ratio.
```
