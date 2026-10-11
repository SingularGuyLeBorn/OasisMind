# RLVR 组内优势与验证器误判配图

图片: `content/ReinforcementLearning/3-推理强化/3.4-验证与长程/images/rlvr-verifier-group-signals.png`。

来源: 原创教学图,不是论文原图或原图截图。组内优势定义参见 [DeepSeek-R1 (arXiv:2501.12948v2) §2.1](https://arxiv.org/html/2501.12948v2)。图中四回答组和假阳性均为本文教学示例,不是论文实测图。

生成方式: Codex 内置 image_gen,2026-10-11。工具结果未确认具体模型版本,不标为 Image 2.5。

数学核对: 左图 R=(1,0,0,1),均值 0.5,总体标准差 0.5,A=(1,-1,-1,1)。右图真实 Z=(0,0,0,0),误判后的 R=(1,0,0,0),均值 0.25,总体标准差 sqrt(3)/4≈0.4330127,A=(sqrt(3),-1/sqrt(3),-1/sqrt(3),-1/sqrt(3))≈(1.732,-0.577,-0.577,-0.577)。两图均按 epsilon_A=0 计算。

## 实际生成提示词

```text
Use case: scientific-educational
Asset type: high-information 2D PNG for a Chinese RLVR technical article.
Primary request: compare how a four-answer GRPO group creates valid learning signal and how a single verifier false positive creates a misleading signal. Wide but compact, two stacked panels or two aligned columns; no generic box-arrow workflow. Each panel contains four aligned answer tokens y1,y2,y3,y4 as four columns, with three rows of exact values.
Panel 1 heading "可靠判定": true correctness Z = [1,0,0,1]; verifier reward R = [1,0,0,1]; group mean 0.5, population std 0.5, advantage A = [+1,-1,-1,+1]. Blue for positive, rust for negative.
Panel 2 heading "一次假阳性": true correctness Z = [0,0,0,0]; verifier reward R = [1,0,0,0] because y1 is wrongly accepted; group mean 0.25, population std sqrt(3)/4 ≈ 0.433; advantage A = [+1.732,-0.577,-0.577,-0.577]. Mark y1 as '误判' and its positive advantage as a false training incentive.
Under the panels, one small shared legend: Z is actual task success, R is verifier reward, A is normalized within the four-answer group; generated completions come from one frozen old policy, then verifier scores them, then new policy updates using A. Use three small labeled stages integrated as a timeline only if each arrow ends at an actual stage. Text must be legible at blog reading width.
Style: precise flat research infographic on warm white, typography clear and restrained; no decorative 3D, cartoon, sparkles or gradients; ruled table or dot-matrix perhaps. Dark ink + muted blue / rust color coding; use labels or shapes in addition to color.
Text (verbatim): "可靠判定", "一次假阳性", "真实结果 Z", "验证奖励 R", "组内优势 A", "误判", "旧策略采样", "验证器", "新策略更新".
Constraints: exact values above, all 4 columns line up, no extra numbers, no misleading arrow or disconnected line, no other English labels or redundant translations, no watermark.
```
