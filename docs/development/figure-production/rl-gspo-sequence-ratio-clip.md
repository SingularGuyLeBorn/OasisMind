# GSPO 序列比率与裁剪图

图片：`content/ReinforcementLearning/3-推理强化/3.2-稳定优化/images/gspo-sequence-ratio-clip.png`。

来源：[Qwen Team，*Group Sequence Policy Optimization*，arXiv:2507.18071](https://arxiv.org/pdf/2507.18071)，重点核对 PDF 第 3 页（索引 2）的式 (5)–(10) 与第 5 页（索引 4）的 Figure 1、Figure 2。论文原图展示训练结果，这张机制图根据公式另行绘制，没有借用或编造论文实验曲线。

生成方式：Codex 内置 `image_gen`，2026-10-11；工具未确认具体模型版本。以论文页面和仓库技术图参考图为视觉输入，画四个有效 token 的两路比较：GRPO 的四个独立 token 比率/裁剪开关；GSPO 的 $d_t$ 汇入均值、指数化为 $s_i$、整条回答共用裁剪开关。首版出现 token 下标错误，第二版把旧策略概率标签写错；最终版改为清楚的中文定义，并逐一检查变量流向。

数学核对：$d_t=\log\pi_\theta(y_t\mid x,y_{<t})-\log\pi_{old}(y_t\mid x,y_{<t})$，$s_i=\exp(T^{-1}\sum_t d_t)$，真实完整轨迹比率为 $\prod_t\rho_t=s_i^T$。未触平台时每个有效 token 的 log-prob 导数系数为 $-s_i\hat A_i/T$；参数梯度仍由各 token 的 Jacobian 决定。论文实验的下、上偏移分别是 $3\times10^{-4}$、$4\times10^{-4}$。图中的开关表达正优势上侧或负优势下侧的裁剪，不声称 $s_i\approx1$ 时梯度为零。

配图作用：让读者沿箭头看到各 token 的量何时产生、怎样汇聚、后续在多少个裁剪决策中复用；同时可一眼看出 GSPO 的「共享序列系数」和 GRPO 的「逐 token 开关」之别。最终检查：PNG 可打开，变量标签可读，箭头无悬空线，图中没有未解释的缩写或无来源的实验数值。
