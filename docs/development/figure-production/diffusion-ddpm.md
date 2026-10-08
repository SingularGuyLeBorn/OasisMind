# DDPM 训练与生成配图

## 对象与来源

正文: `content/DiffusionLanguageModels/2-数学与生成机制/2.1-状态空间与前向过程/2.1.1-从ddpm到离散token.md`.

图像: `2-数学与生成机制/images/fig-ddpm-training-sampling.png`. 原 `fig-ddpm-forward-reverse.png` 保留, 不再作为本篇正文主图.

科学依据为 [DDPM v2](https://arxiv.org/abs/2006.11239v2) Figure 2、式 (4)、(7)、(11)、Algorithm 1–2. 查看 PDF 第二页与既有图, 参考输入实际传入已查看的既有教学图;原论文 PDF 未作为图片输入传给生图接口.

使用内置 imagegen, 接口不能指定或确认 Image 2.5 版本. 首轮展开训练和生成流程, 第二轮纠正输入旁路和删除图内说明句, 第三轮补齐当前状态到反向均值的独立输入连接. 候选保存在本次会话的 generated_images 目录, 正文使用仓库稳定路径.

## 计算验收

- 训练读取干净样本、噪声和时间;网络输出噪声估计, 原始噪声进入监督损失.
- 生成读取当前状态和时间;噪声估计与当前状态共同计算均值, 新随机噪声进入抽样, 抽样结果成为下一步输入.
- 干净样本估计和上一步状态分开, 不将估计值画成直接进入下一步的样本.
- 教学标量例子: sqrt(0.64)=0.8, sqrt(0.36)=0.6, x_t=0.8×1+0.6×1=1.4;假设预测为 1 时, (1.4−0.6)/0.8=1.
- 正文公式编号由原来的 1–22、53–59、23–34 重排为连续 1–41, 对应式号引用同步修改. 修正高信噪比时噪声目标方差仍为 1, DDPM 时间注入与后续 DiT adaLN 的区别, 以及固定反向方差时 KL 的参数相关项.

## 初始提示词

```text
Use case: scientific-educational. Create a technically precise Chinese DDPM mechanism teaching figure, white background, sharp black mathematical typesetting, restrained blue/orange/green accents, landscape 3:2, high density but legible at article width. Reference image is the old teaching diagram to REPLACE: retain distinction fixed forward q versus learned reverse p_theta, but correct and expand it, do NOT copy its X/Y labels or exact-standard-normal forward endpoint. Title:「DDPM：一次训练与一步生成」. Two horizontal panels. Top「训练：直接抽一个噪声水平」: source x_0 and independent source ε∼N(0,I), each arrow into a calculation node labelled x_t=√ᾱ_t x_0+√(1−ᾱ_t) ε. Include small schedule definitions α_t=1−β_t, ᾱ_t=∏_{s=1}^t α_s. x_t together with time t arrows enter「去噪网络 ε_θ(x_t,t)」, output ε̂ feeds squared-error node together with original ε: L=||ε−ε̂||². This panel no iterative forward chain; small note「不必实例化中间轨迹」. Bottom「生成：t → t−1」: x_t and time t enter network output ε̂, then ε̂ and x_t both enter「计算反向均值」with μ_θ=(x_t−β_t ε̂/√(1−ᾱ_t))/√α_t. μ_θ arrow into「抽样」 node; independent fresh z∼N(0,I) arrow enters it too; node formula x_{t−1}=μ_θ+σ_t z (t>1). Arrow from output x_{t−1} leads to explicit terminal small box「下一步输入，时间减一」. A separate branch from x_t and ε̂ to「估计干净样本」 labelled x̂_0=(x_t−√(1−ᾱ_t) ε̂)/√ᾱ_t, then end there, clearly not next-step sample. Bottom narrow band「教学示例」: x_0=1, ᾱ_t=0.64, ε=1 ⇒ x_t=1.4; 若 ε̂=1，则 x̂_0=(1.4−0.6)/0.8=1. This is hypothetical perfect prediction not guaranteed noise recovery. All arrows continuous and physically touch exact source and destination borders, no floating lines, rectangular shapes regular with no overlap, orthogonal routing where needed. NO English(Chinese) translations, no unused concept names, no source or production notices inside. Chinese labels and standard mathematical variable names only. No cartoon, no decorative graphics. Prioritize correct formulas and clear causal wiring; training and generation have separate network instances in separate panels.
```

局部修正要求: 输入 x_t 的旁路独立进入干净估计和反向均值;网络输出仅标记噪声估计;新增路径完整接到相应边界, 不与其他输入混为一条线. 教学区只保留计算, 删除制作与防御性说明.
