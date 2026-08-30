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

短样本、$T\ll n$ 时扩散可以少跑前向。极长续写、AR 已有 KV 时，全双向每步重算整段反而更贵。Fast-dLLM 在 LLaDA-Instruct GSM8K 5-shot、生成长度 256 上从 6.7 tok/s 到 54.4 tok/s，约 8.1×；27.6× 那一格对照的是原版 LLaDA 循环，不是 AR。见[推理加速](../03-points/inference-acceleration.md)。Eso-LM 用洗牌+因果换**精确** KV，65× 对照无缓存 MDLM，尺度不是 8B，见[Eso-LM](../03-points/eso-lm.md)。SDTT 把步数蒸掉 32–64 倍，延迟对照的是带 KV 的 GPT-2（32 步约 4×），见[少步蒸馏](../03-points/few-step-distill.md)。DCD 用 I-投影外挂 GPT-2 copula，4 步对上 SEDD 128 步，少的是函数调用、尺度停在 GPT-2，墙钟不一定掉，见[离散 copula](../03-points/discrete-copula.md)。SlowFast 15.63× 钉在 GPQA 长度 1024，不是 GSM8K；dParallel 8.5× 是 GSM8K 时延；ReFusion 18× 对照原版扩散吞吐。STaR-Quant 相对 FP16：Dream 吞吐 1.69×、显存 3.14×，LLaDA GSM8K 会从 67.48 掉到 57.29，见[量化](../03-points/quantization.md)。这些倍数分母全不一样，不能减。

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
| 改编预算 | — | DiffuLLaMA &lt;200B；Dream ~580B；v2 ~1B；[SDAR](../03-points/sdar.md) ~50B |

表面上扩散每个 batch 只有被掩位置进损失，$1/t$ 把轻度掩码加权回来。被掩位置看见双向上下文，梯度里的搭配更密。谁更样例高效没有与数据无关的定理。改编路线把这个问题部分取消：知识已经在 AR 权重里，扩散阶段改生成过程。见[从自回归改编](../03-points/ar-to-diffusion.md)。

## 5. 可控生成

图像里的 classifier guidance 依赖连续轨迹上的梯度。Diffusion-LM 把 token 映到嵌入，才能原样搬梯度；80M 上 Syntax Tree 86.0 对 PPLM 的 17.9。离散 8B 更常用掩码、定长和 CFG 的对数概率加权。8B 语言 CFG 的完整 γ 扫描表，未找到与 Table 2 同口径的公开细表。细节见[可控生成](../03-points/controllable-generation.md)。

第三条是训练免费的粒子转向。[嵌套 SMC](../03-points/nested-smc.md) 在 MDLM（12 层 768、$T=50$）上对照 best-of-$n$ 与 bootstrap SMC。Table 1（$N=4,M=8,K=4,\lambda=10$）：基础毒性率 0.003，best-of-$n$ 0.022，bootstrap 0.25，NSMC 0.39，FA-NSMC 0.40。毒性列是稀有事件探针，不是 8B 安全评测。Uehara 教程里漏分母的权重极限下仍偏。Dream-7B / LLaDA 上的表这篇没有。

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

并行不自动带来前后一致：一步之内各位置仍按边际乘积提交。这是采样篇的并行诅咒，ParallelBench 把下界写成 $\mathcal{C}(Y\mid X)$。[五条性质](../03-points/discreteness.md) 把同一条缝写成 L2：训练是按格交叉熵，乘积可以抽出「I likes tennis」。[CRoCoDiL](../03-points/crocodil.md) 把长程结构先写进连续草稿，再让 MDM 译词；无条件 Python 上 NFE 512 对 40 约 13×，不是 Nie 的 GSM8K。缓解还靠低置信 remask、阈值、小 AR 验证（APD，有损）、I-投影 copula（DCD，GPT-2 尺度）、可算乘积层（CoDD，冻 8B）、允许再掩。CART 改的是 Dream 训练损失对近明文格的权重，7B 没有「只关 CART」消融，Sudoku 81.0 不能单记在这一项。LLaDA Base 同协议 BBH 49.7 低于 LLaMA3 的 62.1；TruthfulQA 46.1 对 44.0。对齐侧 AR 有多年 RLHF，扩散刚有 VRPO 与 d1。见[失效模式](../03-points/failure-modes.md)、[ParallelBench](../03-points/parallelbench.md)。

## 9. 基础设施

| 维度 | 自回归 | 扩散 |
|---|---|---|
| 推理框架 | vLLM、SGLang、Ollama | 论文仓库、dInfer；专用栈仍薄 |
| 权重量化 | GPTQ / AWQ 生态默认 | AR 向 PTQ 直接搬会掉；STaR-Quant 管掩码态和跨步误差，见[量化](../03-points/quantization.md) |
| 开源权重 | LLaMA / Qwen / 等 | LLaDA、Dream |
| 商业演示 | 满地都是 | Mercury、Gemini Diffusion、Seed Preview |
| KV / GQA | 生态默认成立 | 8B 原论文不用 GQA；块间才真缓存 |

要接现有 serving，块扩散或 AR 更顺。要任意 infill，全双向更顺。没有第三条免费的路同时拿走两头。

## 10. 选型

填空、反向查询、定长表格：扩散或至少要双向。可变长闲聊、超长续写、要接现有 vLLM：AR 或块扩散。要吞吐：先看绝对 tok/s 和硬件，不要看相对原版 Python 循环的倍数。要可控：能写成掩码就不要上分类器。要对齐：有对错标签走 d1 一类，风格偏好走 VRPO。机制必然与工程现状不要焊在同一格。

读完十维，应能把「LLaDA 8B 快 2–8 倍」这种旧稿判为无来源，把 27.6× 判为相对原版 LLaDA，把诗歌反向判为机制实验而不是总榜。

机制必然只有几条，值得单独列，避免和工程现状焊死。必然的是：AR 有精确连乘，掩码扩散训练的是界；因果掩码禁止看右边，全双向默认没有严格 KV；一步提交多个位置时，提交前它们看不见彼此的最终取值；PPL 上界不能和精确 PPL 直接减。2026 年仍在动的是：吞吐倍数、对齐算法、serving 栈、块长课程、近似缓存算不算能用。Mercury 的 1109 和 2.0 的 535 会过时；因果掩码禁止看右边不会过时。

![](./images/fig-mech-vs-eng.png)

> 图 1：左列四条机制账单锁死因式分解带来的后果；右列四条是 2026 年仍在改的工程行。虚线写「不要焊」：吞吐表过时了，因果掩码禁止看右边不会过时。

**图 1 解析**

- **M1 exact product vs ELBO**：AR 的 $\log P$ 可精确求值；掩码扩散训练的是界。SEDD Table 1 的 ≤ 号就是在挡「直接减 PPL」。
- **M2 causal mask forbids right**：这是注意力图案，不是语料不够。诗歌反向吃的是把禁令拿掉。
- **M3 no strict KV if full bidir**：Key 随揭开而变。块间缓存是真缓存；DualCache 是近似。
- **M4 one-step multi-token is a product of margins**：提交前格子互相看不见最终取值。并行吞吐和搭配错误同一来源。
- **E1–E4**：tokens/s、VRPO 与 d1、vLLM 对 dInfer、块长课程。这些行会改版本。把 535 TPS 写成定理，就是把右列焊到左列。

给已经会训 GPT 的人一条最短路径。若你的任务是续写和对话，AR 或块扩散就够，不必先上全双向。若你的任务是任意位置填空、表格缺格、从后半句补前半句，全双向掩码扩散少一层改写。若你要接 vLLM，问的是块间能不能真缓存，不是论文标题里有没有 diffusion。若你要报速度，先写硬件和分母，再写倍数。若你要报质量，先写采样器和 shot。这五句比十维表更不容易读错。

对照时最常见的偷换是把「结构上能做」写成「已经全面更好」。双向结构上能做反向查询，诗句表上正向仍弱于 GPT-4o。并行结构上能少跑前向，开源全双向在超长续写上可能更贵。ELBO 结构上是生成模型，界松的时候 PPL 看起来很差、下游却能打。每一次偷换都是把机制可能性当成产品现状。本篇把数字限制在能指回表的格子里，就是为了少干这种偷换。

同一条提示走两遍，差别会从抽象表变成可感的过程。提示是「床前明月」，要写下句。AR 的下一步必须先决定「光」还是别的字，KV 里只有「床前明月」，「霜」还不存在，不能回来改「光」。扩散一开始垫好整句长度的掩码，「床前明月」若作为提示保持干净，其余格子同时去噪；某一步可以先揭开「霜」再揭开中间的逗号。动画里右侧不是魔法，是因式分解允许右边作为条件。代价也立刻出现：每揭开一些字，双向注意力让所有 Key 都可能变，严格 KV 没有了。若改用块扩散，下句被切成块，块间又变回从左到右，霜所在的块如果排在后面，前面的块仍然看不见它。旋钮拧向 AR，结构优势就退回去。

质量表上的「有的任务领先、有的落后」也应读成结构加数据，而不是性格。GSM8K 上 LLaDA Base 领先，BBH 落后，Hellaswag 落后。双向上下文对应用题里的数量关系可能更有用，对需要逐步消元的硬推理不一定更有用，对常识续写那种「顺着往下说」的题，因果模型吃的就是它最熟的分布。没有一张表能把「扩散性格」一次定性。能定性的只有：换因式分解会换任务上的相对强弱，强弱方向要看表，不能看直觉。

选型清单可以再具体一点。写代码补全、中间填空很多：Dream 或全双向 LLaDA，别一上来块长 32。写对话、工具调用、长日志：块扩散或 AR，KV 和可变长更要紧。要报吞吐给业务：用 Mercury / Seed / 2.0-CAP 那种测过的栈，不要用论文仓库的 Python 循环去打 vLLM。要对齐风格：VRPO。要对齐数学对错：d1。要注入句法树：连续 Diffusion-LM 或把树写成可见约束；8B 离散上还没有同等细表。每一条都指向本花园已经存在的专文，本篇不再展开公式。

基础设施薄这件事会过时，但过时的速度不均匀。训练侧，Megatron 上改注意力掩码和广播掩码已经能跑 100B 转换。推理侧，vLLM 的默认路径仍是因果解码，扩散要自己的 scheduler。开源用户今天能跑的是 Dream / LLaDA 的仓库和少数专用 runtime。把「生态成熟度」写成 2026 年 8 月的观察可以；写成结构定理不行。两年后若 vLLM 原生支持块扩散，第 9 节那一行要改，第 1 节的 ELBO 不必改。

PPL 不可比、KV 不免费、一步多 token 有因子分解误差，这三条机制账单足够挡住大多数口号。剩下的选型是任务问题。把十维表当成打分卡去给「扩散总分」「AR 总分」是误用。没有总分。有的任务双向值钱，有的任务 KV 值钱，有的任务 RLHF 生态值钱。2026 年 8 月能核对的数字都写在各专文里；本篇只负责把数字放回「机制还是工程」这一格。格放错了，数字再准也是错句。

同一条 GSM8K，至少有四格合法数字，不能减着玩。LLaDA 原论文 Instruct 纯扩散 69.4（4-shot）；块长 8 的块扩散 LLaDA 78.6；d1 的 0-shot 长度 512 基线 78.2、训完 82.1；1.5 的 83.3 相对 Instruct 78.6。四格采样器、shot、是否 RL 都不同。对照文若只留一格「扩散 GSM8K」，读者会拿它去减 LLaMA3 的 78.3，得出完全相反的故事。本篇因此拒绝给 GSM8K 一个「扩散代表分」。要写分，去 LLaDA 专文看表，并且抄采样器。

反转那一维同样拒绝总分。GPT-4o 正向 82.7 远高于 LLaDA 的 48.8，反向 34.3 低于 42.4。结构优势出现在反向，知识与文风出现在正向。宣传只截反向，攻击只截正向，都是截图传播。对照必须两格一起在。Berglund 的 0% 测的是微调后的虚构名人，和诗句表不是同一分布，也不能加总。

前面十节不是打分卡。每一维先问：这件事是因式分解写进结构里的，还是某篇 2025 年系统论文刚测出来的。填空顺、反向格高于 GPT-4o，属于结构。1109 tok/s 属于系统。MMLU 65.9 对 65.4 属于某张表上的同协议对照，换协议就换格。把三件事写成「扩散更好」，句子没有主语该承担的限定。图 1 的虚线就是这条纪律的画法：左列可以当定理用，右列只能当观察用。

serving 栈这一维会过时，但过时方式值得提前写清。vLLM 的默认调度器按因果解码的一步一个 token 设计。扩散要的是：一步提交一个位置集合、下一步可能把其中一些盖回去、注意力掩码可能是下三角加对角方块。dInfer、论文仓库的 Python 循环、Mercury 的内部 runtime，都是在补这个调度器。两年后若开源 serving 原生支持块扩散，第 9 节那一行要改数字，不必改第 1 节的 ELBO。只记「生态不成熟」，会在栈变厚之后把整篇作废。生态薄是观察；ELBO 不是观察。

训练侧的并行其实一直在。teacher forcing 让 AR 一次前向算整句损失；扩散一次前向也算整句，只是损失写在掩码格上。两边训练都能吃满 GPU。差别在生成循环。对照「效率」时必须声明说的是训练还是推理。混用会把 LLaDA 的 13 万 H800 小时和 Mercury 的 1109 tok/s 减出毫无意义的比。13 万小时是从头训 8B 的账单；1109 是代码模型在 H100 上的产品吞吐。分母不同，不能当「扩散已经便宜」。

质量表上「有的任务领先、有的落后」不要解释成性格。GSM8K 上 LLaDA Base 领先，BBH 落后，Hellaswag 落后。双向上下文对应用题里的数量关系可能更有用，对需要逐步消元的硬推理不一定更有用，对常识续写那种「顺着往下说」的题，因果模型吃的就是它最熟的分布。Dream 的数独 81.0 对 21.0 把规划题上的结构差放大了；同一张 Instruct 表上 HumanEval 55.5 对 84.8 又把后训练深度的差放大了。没有一张表能给「扩散性格」定性。能定性的只有：换因式分解会换任务上的相对强弱，强弱方向要看表，不能看直觉。

对齐这一维 2026 年仍薄，薄的是算法库存不是原理禁令。AR 有 PPO、DPO、GRPO 多年工具链。扩散刚有 VRPO 和 diffu-GRPO。原版 LLaDA Instruct 只有 SFT，拿它去减有 RL 的 LLaMA3 Instruct，减的是后训练深度。1.5 把 GSM8K 从 Instruct 的 78.6 拉到 83.3，步子存在，口径仍要写采样器。把「扩散对齐不了」写成机制必然，图 1 的右列 E2 会抗议：那一格还在动。

动画里那句「床前明月」把抽象表变成可感过程。AR 下一步必须先决定「光」，KV 里没有「霜」，不能回来改已经写出的字。扩散一开始垫好整句长度的掩码，某一步可以先揭开「霜」再揭中间的逗号。代价立刻出现：每揭开一些字，双向注意力让所有 Key 都可能变，严格 KV 没有了。若改用块扩散，下句被切成块，块间又变回从左到右。旋钮拧向 AR，结构优势就退回去。十维表是账单；动画是同一笔账单的可播放版本。两者对着看，比单独背表更不容易把「结构上能做」写成「已经全面更好」。

HumanEval-FIM 那一格也属于对照纪律。LLaDA Base 73.8 对 LLaMA3 的 73.3，几乎打平。AR 用数据增强能买到连续中段填空；扩散买到的是不必另开 FIM 模板，任意一组位置同时是空位。产品若只有「函数中间缺一块」，FIM 够用。若表格缺不相邻的几格，掩码扩散少一层改写。这格不要用来宣传「代码全面超过」，两数几乎打平，而且 FIM 不是聊天主路径。对照时把它放在「填空」那一维，不要放在「代码智能」那一维。

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
- [Serving](../03-points/serving.md)
- [可控生成](../03-points/controllable-generation.md)
- [对齐与 RL](../03-points/alignment-rl.md)
- [失效模式](../03-points/failure-modes.md)
- [LLaDA 专文](../03-models/llada-frontier.md)
- [多模态扩散](../03-models/multimodal-dllm.md)
- [任意顺序](../03-points/any-order.md)
- [代码向扩散](../03-points/code-dllm.md)
- [离散流匹配](../03-points/discrete-flow.md)
- [LLaDA-MoE](../03-models/llada-moe.md)
- [谁决定揭开哪一格](../03-points/plan-denoise.md)
- [提交之后还能不能改](../03-points/remask-revise.md)
- [Eso-LM](../03-points/eso-lm.md)
- [SDAR](../03-points/sdar.md)
- [APD](../03-points/apd.md)
- [离散 copula](../03-points/discrete-copula.md)
- [CoDD](../03-points/codd.md)
- [量化 dLLM](../03-points/quantization.md)
- [D2F](../03-points/d2f.md)
- [ParallelBench](../03-points/parallelbench.md)
- [少步蒸馏](../03-points/few-step-distill.md)
- [Score entropy](../03-points/score-entropy.md)
- [五条性质](../03-points/discreteness.md)
- [嵌套 SMC](../03-points/nested-smc.md)
- [CRoCoDiL](../03-points/crocodil.md)
