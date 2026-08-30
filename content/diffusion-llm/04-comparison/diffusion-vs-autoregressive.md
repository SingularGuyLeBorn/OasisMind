---
title: "扩散 vs 自回归：全面对比"
category: null
tags:
  - comparison
  - diffusion
  - autoregressive
  - inference
  - reversal-curse
published: true
as_of: 2026-08-31
excerpt: "从因式分解、吞吐、质量、可控、反转、长文本对照扩散与自回归。哪些是机制必然，哪些只是 2026 年的工程现状。数字以论文表为准。"
---
# 扩散 vs 自回归

自回归把 $P(x)$ 写成从左到右的乘积，扩散写成一条去噪轨迹的积分。不是谁替代谁，是两套账单。机制层的差别（有没有因果掩码、KV Cache 是否严格成立、PPL 能不能横比）不会因为 Mercury 跑到四位数 tok/s 就消失。工程层的差别（吞吐、对齐、系统栈）2026 年仍在快速动。

```viz
composition: ArVsDiffusion
title: AR vs 扩散生成对比
prompt: "床前明月"
genTokens: ["光","，","疑","是","地","上","霜"]
```

读完前面的机制和知识点之后，本篇只做对照：每一维先写机制必然，再写 2026 年能核对的数字。没有数字的格子就写判断，不编倍数。

## 1. 数学定义

自回归将联合分布分解为条件概率的链式乘积：

$$P_{\text{AR}}(x)=\prod_{i=1}^{n}P_\theta(x_i\mid x_{<i})$$

扩散通过隐变量从噪声逐步生成：

$$P_{\text{Diff}}(x)=\int p(x_T)\prod_{t=1}^{T}p_\theta(x_{t-1}\mid x_t)\,dx_{1:T}$$

| 方面 | 自回归 | 扩散 |
|---|---|---|
| 联合概率 | 精确分解 | 变分下界（ELBO） |
| 可见方向 | 单向（左→右） | 当前未掩位置，默认双向 |
| 似然能不能横比 | 精确 PPL | 常常是界，不能直接减 |

机制必然：AR 的 $\log P$ 可精确求值；掩码扩散训练的是界。LLaDA 评 MMLU 用蒙特卡洛估条件似然，评 HumanEval 用生成，两列不是同一种解码。SEDD Table 1 的 ≤ 号就是在提醒：扩散报的是上界。

块扩散把式子改成块级连乘乘块内 ELBO，介于两行之间。$B=1$ 时概率分解回到 AR，训练目标仍可能带着扩散损失的方差，见[块扩散](../03-points/block-diffusion.md)。

## 2. 推理效率

动画里左侧每步 +1 token，右侧每步可以揭开多个格子。$T$ 与 $n$ 解耦是机制卖点。账单立刻跟上：全双向每步注意力 $O(n^2)$，没有严格 KV Cache。

| 场景 | 自回归 | 扩散 |
|---|---|---|
| 生成 $n$ 个 token | $n$ 次串行前向 | $T$ 次前向，每步可改多位置 |
| 吞吐实例 | 基线 | Mercury Mini 1109 tok/s @ H100；LLaDA 2.0-flash-CAP 535 TPS，文内 AR 约 2.1×。LLaDA 8B 原论文没有速度表 |
| KV Cache | 必须，且严格成立 | 全双向默认不成立；块间真缓存；跨步是近似 |

短样本、$T\ll n$ 时扩散可以少跑前向。极长续写、AR 已有 KV 时，全双向每步重算整段反而更贵。Fast-dLLM 在 LLaDA-Instruct GSM8K 5-shot、生成长度 256 上从 6.7 tok/s 到 54.4 tok/s，约 8.1×；27.6× 那一格对照的是原版 LLaDA 循环，不是 AR。见[推理加速](../03-points/inference-acceleration.md)。

开源 Dream 和商业 Mercury 不在同一条速度曲线上。分母、prefill、batch、是否锁输出格式，都可以让 tokens/s 差一倍。本花园只并列。

## 3. 生成质量

LLaDA Table 1，$*$ 协议，Base：

| 指标 | LLaMA3 8B | LLaDA 8B |
|---|---|---|
| MMLU (5) | 65.4 | 65.9 |
| GSM8K (4) | 48.7 | 70.3 |
| HumanEval (0) | 34.8 | 35.4 |
| BBH (3) | 62.1 | 49.7 |
| Hellaswag (0) | 79.1 | 70.5 |

Instruct 见 Table 2：LLaDA 只有 SFT，LLaMA3 有 SFT+RL，GSM8K 69.4 对 78.3，HumanEval 49.4 对 59.8。Base 的 GSM8K 优势不能抄到 Instruct 上。论文主表没有可引用的精确 perplexity 对照。

Dream Table 1 另有一套 $*$：Dream 7B 对 Qwen2.5 7B，MMLU 69.5 对 71.9，Sudoku 81.0 对 21.0。那张表上的 LLaDA HumanEval 是 32.9，不要和 35.4 减。见[Dream 专文](../03-models/dream-mercury-seed.md)。

同数据 ARM baseline 才回答「扩散目标能不能 scale」。2.3T 对 15T 混了语料配比。

## 4. 训练效率

| 维度 | 自回归 | 扩散 |
|---|---|---|
| 单步目标 | next-token | 抽 $t$ 与 mask，加权交叉熵 |
| 序列内并行 | causal mask 内并行 | 双向 + 随机 mask |
| 公开 8B 数据量 | LLaMA3：15T | LLaDA：2.3T |
| 改编预算 | — | DiffuLLaMA &lt;200B；Dream ~580B；v2 ~1B |

表面上扩散每个 batch 只有被掩位置进损失，$1/t$ 把轻度掩码加权回来。被掩位置看见双向上下文，梯度里的搭配更密。谁更样例高效没有与数据无关的定理。改编路线把这个问题部分取消：知识已经在 AR 权重里，扩散阶段改生成过程。见[从自回归改编](../03-points/ar-to-diffusion.md)。

## 5. 可控生成

图像里的 classifier guidance 依赖连续轨迹上的梯度。Diffusion-LM 把 token 映到嵌入，才能原样搬梯度；80M 上 Syntax Tree 86.0 对 PPLM 的 17.9。离散 8B 更常用掩码、定长和 CFG 的对数概率加权。8B 语言 CFG 的完整 γ 扫描表，未找到与 Table 2 同口径的公开细表。细节见[可控生成](../03-points/controllable-generation.md)。

AR 侧改行为靠提示、logit 后处理、RLHF。扩散侧对应 VRPO 与 diffu-GRPO，见[对齐](../03-points/alignment-rl.md)。能写成掩码的约束，不必上分类器。

## 6. 反转诅咒

Berglund：虚构名人正向 96.7%，反向约 0%。LLaDA 诗句表：LLaDA Instruct 正向 48.8 / 反向 42.4，GPT-4o 82.7 / 34.3。机制是因果掩码禁止看右边，加上编码器注意力耦合，不是「任意顺序训练」一句能讲完。不要写成扩散已经全面免疫。见[双向注意力](../03-points/bidirectional-attention.md)。

块采样会把全局双向收进块内。报反转分数时写清是纯扩散还是块解码。

## 7. 长文本

| 方面 | 自回归 | 扩散 |
|---|---|---|
| 生成长文本 | 逐 token 续写，KV 线性涨 | 全双向每步 $T\times n^2$；块扩散按块续 |
| 理解长文本 | 看不见右边 | 双向看见已揭开的两端 |
| 可变长 | 天然 | 全双向靠 `[EOS]` / 预垫；块扩散可再开一块 |

长文本是全双向开源模型目前最硬的短板。2.0 文内称 32k 内 flash 稳定，靠的是块而不是把 32k 当一次全双向去噪。打包长序列必须在文档边界切断注意力，否则去噪作弊。

## 8. 幻觉、一致、事实

并行不自动带来前后一致：一步之内各位置仍按边际乘积提交。这是采样篇的并行诅咒。缓解靠低置信 remask、阈值、验证、允许再掩。LLaDA Base 同协议 BBH 49.7 低于 LLaMA3 的 62.1；TruthfulQA 46.1 对 44.0。对齐侧 AR 有多年 RLHF，扩散刚有 VRPO 与 d1。见[失效模式](../03-points/failure-modes.md)。

## 9. 基础设施

| 维度 | 自回归 | 扩散 |
|---|---|---|
| 推理框架 | vLLM、SGLang、Ollama | 论文仓库、dInfer；专用栈仍薄 |
| 开源权重 | LLaMA / Qwen / 等 | LLaDA、Dream |
| 商业演示 | 满地都是 | Mercury、Gemini Diffusion、Seed Preview |
| KV / GQA | 生态默认成立 | 8B 原论文不用 GQA；块间才真缓存 |

要接现有 serving，块扩散或 AR 更顺。要任意 infill，全双向更顺。没有第三条免费的路同时拿走两头。

## 10. 选型

填空、反向查询、定长表格：扩散或至少要双向。可变长闲聊、超长续写、要接现有 vLLM：AR 或块扩散。要吞吐：先看绝对 tok/s 和硬件，不要看相对原版 Python 循环的倍数。要可控：能写成掩码就不要上分类器。要对齐：有对错标签走 d1 一类，风格偏好走 VRPO。机制必然与工程现状不要焊在同一格。

读完十维，应能把「LLaDA 8B 快 2–8 倍」这种旧稿判为无来源，把 27.6× 判为相对原版 LLaDA，把诗歌反向判为机制实验而不是总榜。

机制必然只有几条，值得单独列，避免和工程现状焊死。必然的是：AR 有精确连乘，掩码扩散训练的是界；因果掩码禁止看右边，全双向默认没有严格 KV；一步提交多个位置时，提交前它们看不见彼此的最终取值；PPL 上界不能和精确 PPL 直接减。2026 年仍在动的是：吞吐倍数、对齐算法、serving 栈、块长课程、近似缓存算不算能用。Mercury 的 1109 和 2.0 的 535 会过时；因果掩码禁止看右边不会过时。

给已经会训 GPT 的人一条最短路径。若你的任务是续写和对话，AR 或块扩散就够，不必先上全双向。若你的任务是任意位置填空、表格缺格、从后半句补前半句，全双向掩码扩散少一层改写。若你要接 vLLM，问的是块间能不能真缓存，不是论文标题里有没有 diffusion。若你要报速度，先写硬件和分母，再写倍数。若你要报质量，先写采样器和 shot。这五句比十维表更不容易读错。

对照时最常见的偷换是把「结构上能做」写成「已经全面更好」。双向结构上能做反向查询，诗句表上正向仍弱于 GPT-4o。并行结构上能少跑前向，开源全双向在超长续写上可能更贵。ELBO 结构上是生成模型，界松的时候 PPL 看起来很差、下游却能打。每一次偷换都是把机制可能性当成产品现状。本篇把数字限制在能指回表的格子里，就是为了少干这种偷换。

同一条提示走两遍，差别会从抽象表变成可感的过程。提示是「床前明月」，要写下句。AR 的下一步必须先决定「光」还是别的字，KV 里只有「床前明月」，「霜」还不存在，不能回来改「光」。扩散一开始垫好整句长度的掩码，「床前明月」若作为提示保持干净，其余格子同时去噪；某一步可以先揭开「霜」再揭开中间的逗号。动画里右侧不是魔法，是因式分解允许右边作为条件。代价也立刻出现：每揭开一些字，双向注意力让所有 Key 都可能变，严格 KV 没有了。若改用块扩散，下句被切成块，块间又变回从左到右，霜所在的块如果排在后面，前面的块仍然看不见它。旋钮拧向 AR，结构优势就退回去。

质量表上的「有的任务领先、有的落后」也应读成结构加数据，而不是性格。GSM8K 上 LLaDA Base 领先，BBH 落后，Hellaswag 落后。双向上下文对应用题里的数量关系可能更有用，对需要逐步消元的硬推理不一定更有用，对常识续写那种「顺着往下说」的题，因果模型吃的就是它最熟的分布。没有一张表能把「扩散性格」一次定性。能定性的只有：换因式分解会换任务上的相对强弱，强弱方向要看表，不能看直觉。

选型清单可以再具体一点。写代码补全、中间填空很多：Dream 或全双向 LLaDA，别一上来块长 32。写对话、工具调用、长日志：块扩散或 AR，KV 和可变长更要紧。要报吞吐给业务：用 Mercury / Seed / 2.0-CAP 那种测过的栈，不要用论文仓库的 Python 循环去打 vLLM。要对齐风格：VRPO。要对齐数学对错：d1。要注入句法树：连续 Diffusion-LM 或把树写成可见约束；8B 离散上还没有同等细表。每一条都指向本花园已经存在的专文，本篇不再展开公式。

基础设施薄这件事会过时，但过时的速度不均匀。训练侧，Megatron 上改注意力掩码和广播掩码已经能跑 100B 转换。推理侧，vLLM 的默认路径仍是因果解码，扩散要自己的 scheduler。开源用户今天能跑的是 Dream / LLaDA 的仓库和少数专用 runtime。把「生态成熟度」写成 2026 年 8 月的观察可以；写成结构定理不行。两年后若 vLLM 原生支持块扩散，第 9 节那一行要改，第 1 节的 ELBO 不必改。

## 来源

- [LLaDA](https://arxiv.org/abs/2502.09992) Table 1–3。文中没有 8B 速度表。
- [Dream 7B](https://arxiv.org/abs/2508.15487) Table 1–2
- [Fast-dLLM](https://arxiv.org/abs/2505.22618)、[dKV-Cache](https://arxiv.org/abs/2505.15781)、[LLaDA 1.5](https://arxiv.org/abs/2505.19223)、[d1](https://arxiv.org/abs/2504.12216)
- [Diffusion-LM](https://arxiv.org/abs/2205.14217) Table 2
- [A Survey on Diffusion Language Models](https://arxiv.org/abs/2508.10875)

## 相关

- [为什么用扩散做语言生成](../01-overview/why-diffusion.md)
- [双向注意力与反转诅咒](../03-points/bidirectional-attention.md)
- [推理加速](../03-points/inference-acceleration.md)
- [可控生成](../03-points/controllable-generation.md)
- [对齐与 RL](../03-points/alignment-rl.md)
- [失效模式](../03-points/failure-modes.md)
- [LLaDA 专文](../03-models/llada-frontier.md)
