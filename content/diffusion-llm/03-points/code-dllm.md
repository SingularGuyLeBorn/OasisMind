---
title: "代码向扩散：DiffuCoder、AR-ness 与 coupled-GRPO"
category: null
tags:
  - DiffuCoder
  - coupled-GRPO
  - AR-ness
  - code
published: true
as_of: 2026-08-31
excerpt: "开源 7B 代码扩散的可核对表在 DiffuCoder，不在 Mercury 的 tok/s。130B 有效 token 改编自 Qwen2.5-Coder。温度升高不但多样化 token，还多样化揭开顺序。coupled-GRPO 用一对互补掩码估对数概率，不依赖半自回归小块解码。"
---
# 代码向扩散：DiffuCoder、AR-ness 与 coupled-GRPO

会写代码的人，看扩散 LLM 时最容易焊错两张表。一张是商业吞吐：Mercury Mini 1109 tok/s，HumanEval 可以到 90.0，参数量未公开。一张是通用开源 7B：Dream Instruct 的 HumanEval，在 Dream 自己的 Table 2 上是 55.5，对照有 RL 的 Qwen2.5 是 84.8。中间缺一条「开源、代码向、数字能指回作者评测」的线。DiffuCoder（Gong 等人，arXiv:2506.20639）补这条线：7B，从 Qwen2.5-Coder 改编，约 130B 有效代码 token，再加 SFT 和 coupled-GRPO。本篇只钉他们的表、揭开顺序测到了什么、RL 为什么要一对互补掩码。

不要把本篇 HumanEval 73.2 和 Nie et al. Table 1 的 LLaDA Base 35.4 横减。评测库、是否代码专料、Instruct 配方都不同。也不要把 DiffuCoder 表里的 LLaDA-Instruct HumanEval 35.4 抄回 LLaDA 专文当 Instruct 主数字：那是 Gong 等人自己的 harness，Nie 原文 Instruct 生成列是 49.4。

## 1. 配方：改编，不是从头堆代码模型

骨干和词表跟 Qwen2.5-Coder，改编路径类似 Dream / DiffuLLaMA：移位保住，$h_i$ 仍对准下一个位置。语料写了 RefineCode 与 Stackv2，作者提到约 400B token 的代码预训练池，以及和 Qwen2.5-Coder / OpenCoder 相近的 code-to-text 比。Stage 1 真正吃进去的有效 token 在 65B 处早停。他们观察到训到 700B 时下游验证变差、AR-ness 反而升高，于是丢掉更长的那一截。Stage 2 用约 16B 退火代码数据，重复到 4 个 epoch，合计再记 65B。摘要里的「130B tokens of code」指这两段有效量，不是 400B 池全吃完。

SFT 用 OpenCoder 的 436K 样本。RL 从 Acecoder-87K 里挑 21K 带可验证测试的难题。机器是 8 到 10 个节点、每节点 8 张 H100。后训练代码改编自 Open-R1。这些数字只说明预算量级，不能用来换算「比 LLaDA 的 13 万 H800 小时更便宜」：任务、序列长度、是否全参都不同。

Table 1 是作者评测环境。EvalPlus 定义为 HumanEval+ 与 MBPP+ 的平均。摘开源 7/8B 几列：

| 模型 | HumanEval | HE+ | MBPP | MBPP+ | EvalPlus | BCB-C Full |
|---|---|---|---|---|---|---|
| Qwen2.5-Coder | 61.6 | 51.8 | 75.9 | 61.4 | 56.6 | 46.1 |
| DiffuCoder | 67.1 | 60.4 | 74.2 | 60.9 | 60.6 | 40.2 |
| Dream | 56.7 | 50.0 | 68.7 | 57.4 | 53.7 | 23.6 |
| LLaDA | 35.4 | 30.5 | 50.1 | 42.1 | 36.3 | 18.9 |
| DiffuCoder-Instruct | 72.0 | 65.2 | 75.1 | 61.9 | 63.6 | 35.7 |
| + coupled-GRPO | 73.2 | 68.3 | 78.6 | 67.5 | 67.9 | 40.4 |
| Qwen2.5-Coder-Instruct | 90.2 | 85.4 | 83.9 | 72.0 | 78.7 | 50.7 |
| Qwen2.5-Coder+SFT（同数据） | 82.9 | 75.6 | 80.1 | 66.1 | 70.9 | 46.9 |

Base 上 DiffuCoder 的 HumanEval 67.1 高于同表 Qwen2.5-Coder 的 61.6，EvalPlus 60.6 对 56.6，BigCodeBench 完成式全量 40.2 对 46.1，完成式并没有全面超过代码 AR 基座。Instruct 之后扩散列涨得少：DiffuCoder-Instruct 相对 Base 的 HumanEval 只 +4.9，同数据 SFT 的 Qwen 是 +21.3。作者把这个缺口当成做 RL 的动机：SFT 没把指令能力从 AR 配方里完整接过来。商业行 GPT-4o / Mercury / Gemini Diffusion 的 HumanEval 在 89–90，带 $*$，来自公开报告，不是同一 harness 重跑。存在性可以写：闭源扩散代码能到那一档。开源 7B 的主数字仍是 72.0 / 73.2。

Dream 原文 Table 1 带 $*$ 的 HumanEval 是 57.9，本表 Dream 是 56.7。两套协议不要减出「Dream 退步了」。讨论 DiffuCoder 对 Dream 用 Gong 的表；讨论 Dream 对 Qwen2.5 用 Ye 的表。

## 2. AR-ness：揭开顺序到底有多像从左到右

任意顺序训练给了所有排列，低置信 remask 推理会自己挑一条。Gong 等人把「这条路有多像 AR」写成两个可测的量。局部 AR-ness@$k$：新揭开的字，和它前面刚揭开的 $k$ 个字，是不是严格递增的连续下标。$k=1$ 就是「是不是在写 next token」。全局 AR-ness@$k$：这一步选中的位置，是不是仍掩格子里最靠左的 $k$ 个之一。AR 解码两个量都恒等于 1。扩散两个量都小于 1，但更靠近 1 而不是 0：文本本身有从左到右的结构，从头训的 LLaDA 和改编的 Dream / DiffuCoder 都会抓住一部分。改编模型的 AR-ness 往往更高，因为基座就是左到右训出来的。

代码和数学不一样。GSM8K 上全局 AR-ness 更稳、更偏左；HumanEval 上均值更低、方差更大。作者的解释是：数学文本几乎必须按演算顺序写，代码可以先写函数体再补签名，也可以先写返回值再填循环。这是观察，不是「代码任务上扩散一定更强」的证明。Table 1 上 DiffuCoder Base 的 HumanEval 确实高于同表 Dream，也高于同表 LLaDA，但分母里有 130B 代码 token，Dream 不是代码专料。

熵汇（entropy sink）出现在条件生成的第一步：提示干净、回答全掩。各位置的置信度画出来像 L 形，紧挨前缀的格子特别尖。低置信 remask 会先揭这些格子，于是解码被吸回「接着前缀往右写」。温度默认 0.2 时，这条吸力很强。升到 1.2，AR-ness 明显下降：不但 token 选择散了，揭开的位置也散了。AR 模型升温只散词，不散顺序，因为它没有顺序可散。pass@10 随温度从 0.2 升到 1.2 变好，说明基座里藏着更多能过测试的轨迹，pass@1 默认设置只是没把它们采出来。RL 需要这种多样性当 rollout。训练 coupled-GRPO 时他们把在线采样温度放到 1.2，评测 Table 2 再在 $\{0.2,0.3,0.4\}$ 里取最好。

Stage 1 训到 65B 时 AR-ness 已经偏低；硬训到 700B，AR-ness 回升、验证变差，所以早停。中训和 SFT 的第一个 epoch 会把因果偏差抬高，随后任务变好、AR-ness 再往下走。GRPO 之后全局 AR-ness 继续降，并且步数减半时掉点比 Instruct 更小。作者据此说：模型可以自己决定要多因果，不必靠半自回归小块解码把因果写死。

## 3. coupled-GRPO：一对互补掩码，每个 token 当一次目标

掩码扩散没有精确的 $\log\pi(y\mid x)$，GRPO 的重要性比只能估。d1 的办法是把整段 completion 全掩，一步前向，用 $t=1$ 的边际当序列概率。省，但偏：熵汇会让左边的 token 梯度更猛；代码任务上再去掩 15% 提示，作者发现奖励曲线不稳，于是退回「提示不掩、completion 全掩」当基线。即便如此，每个 token 总在「完全看不见兄弟」的上下文里被打分，和生成时逐步揭开对不上。

coupled-GRPO 抽 $\lambda$ 对互补时间 $(t,\hat t)$，满足 $t+\hat t=T$。两个掩码并起来盖住全部 completion，且每个位置恰好在其中一个里当预测目标。实践取 $\lambda=1$，再加一次全掩 $t=T$，对数概率对这几次平均。 antithetic：一对噪声负相关，方差下降。每个 token 都有非零学习信号，又都在「部分可见」的真实上下文里被估，而不是永远全盲。

![](./images/fig-coupled-grpo.png)

> 图 1：同一段 completion 抽一对互补掩码，汇成 coupled-GRPO 的对数概率。每个 token 恰好当一次目标。

**图 1 解析**

- **completion y**：在线 rollout 已经写完的回答，奖励在这里打。
- **mask A / 补集**：位置划分，不是两种 $Q_t$。前向仍是吸收态。
- **汇合**：两次交叉熵拼成对每个 token 的一次估计，再进 GRPO 的 $\rho_i^k$。
- **不是新噪声**：训练预训练仍是 $1/t$ MLM。这里只改策略梯度里的似然估计。
- **和 d1 的差**：d1 相当于只走全掩那一次；本图强制部分可见。

Table 2，温度集合 $\{0.2,0.3,0.4\}$ 取最好。DiffuCoder-Instruct → coupled-GRPO：HumanEval 72.0→73.2，HE+ 65.2→68.3，MBPP 75.1→78.6，MBPP+ 61.9→67.5。EvalPlus 63.6→67.9，摘要写成 +4.4%。同表消融：completion 全掩（d1 风格）HumanEval 掉到 66.5，HE+ 59.1；同等次数但不互补的 decoupled 是 68.9 / 62.8。互补约束比「多抽几次随机掩码」更值钱。Leave-one-out 优势在 MBPP+ 上到 68.5，HumanEval 上反而到 70.7，任务间不稳定。奖励是格式分加测试通过率。

同数据的 Qwen2.5-Coder+SFT 再加 AR 的 GRPO：HumanEval 82.9→80.5，掉了；MBPP 80.1→84.4，涨了。扩散这边 HumanEval 小涨、Plus 和 MBPP 涨得更明显。不要写成「扩散 RL 全面超过 AR RL」。分母是 Qwen 的 SFT 已经 82.9，DiffuCoder Instruct 只有 72.0。RL 是在各自的 SFT 墙上挖，不是从零起跑。

作者强调 coupled-GRPO 不依赖半自回归、不把块长训死。d1 在 LLaDA 上常常配合小块解码。代码实验里，全掩基线不稳定，互补掩码才把奖励曲线拉平。这是扩散原生的估法，不是把 AR 的 token 对数概率公式抄过来。

## 4. 和 VRPO、d1、商业代码模型的分工

对齐专文写的 VRPO 吃离线偏好对，贵在四条 ELBO；d1 吃数学可验证奖励，贵在一步全掩估计。coupled-GRPO 吃代码测试，贵在一对互补掩码。三条都是「精确 $\log\pi$ 写不出来」的补丁，补丁形状跟着数据走。写作风格走 VRPO；GSM8K / 数独走 d1；HumanEval 走本篇。不要把 21K 样本的 +4.4 EvalPlus 加成 LLaDA 1.5 的 +4.7 GSM8K。模型、奖励、采样器都不同。

商业 Mercury 的 HumanEval 90.0、Gemini Diffusion 89.6，来自公开报告行。开源 DiffuCoder coupled-GRPO 是 73.2。中间差的是规模、数据、系统栈、是否闭源，不是「开源不会写代码」。Dream Instruct 在 Gong 表上 HumanEval 57.9，还没有这条代码专料。想自托管一条可复现的代码扩散，检查点在 [apple/ml-diffucoder](https://github.com/apple/ml-diffucoder)，表用 Gong Table 1–2。想要四位数 tok/s，那是 Mercury / Seed 的交付物卡，见 Dream / Mercury / Seed 专文。

半步数掉点变小，是 AR-ness 下降的副作用，不是 CAP 那种系统加速。推理加速专文里的 DualCache、dKV-Cache 仍可叠，DiffuCoder 原文没有把 27.6× 写进主表。27.6× 的对照物是原版 LLaDA，不是本模型。

## 5. 失效

把 DiffuCoder 表的 LLaDA-Instruct HumanEval 35.4 写进 Nie 的 Instruct 规格：harness 不同，Nie Table 2 是 49.4。

把 130B 写成 400B：400B 是语料池，Stage 1 早停在 65B。

把温度 1.2 当评测默认：那是 rollout。Table 2 评测温度在 0.2–0.4。

把 EvalPlus +4.4% 理解成相对 63.6 再乘 1.044：表上是 63.6→67.9 的绝对点。摘要的百分号和表格的百分点不要焊。

把 coupled-GRPO 理解成新的 $Q_t$：噪声仍是吸收态，变的是 RL 的似然估计。

读完应能指着图 1 说出：一对掩码为什么互补、每个 token 当一次目标、这和 d1 全掩差在哪。再能指出 Table 1 里 Base 已经接近 Qwen2.5-Coder、Instruct 涨幅远小于同数据 AR SFT、RL 用 21K 样本把 EvalPlus 推到 67.9。指不出这三句，代码向扩散就还停在「Mercury 很快」那句口号上。

四个 token 的 completion 把互补掩码写具体。设回答是 $(w,x,y,z)$，抽到 $t$ 盖住 $w,y$，补集盖住 $x,z$。第一次前向的损失只打在 $w,y$ 上，上下文里 $x,z$ 是可见的；第二次只打 $x,z$，上下文里 $w,y$ 可见。每个位置当一次目标、当一次条件，次数相同。全掩基线四次目标都在「四个兄弟全瞎」的上下文里，左边因为熵汇更尖，梯度更偏。decoupled 随机抽两次掩码，有的位置可能两次都当目标、有的一次都没有，方差来自覆盖不均。互补约束把覆盖锁死。这就是图 1 比「多抽几次」值钱的原因。$\lambda=1$ 已经是一对；再加全掩 $t=T$，是怕部分可见估计在高噪声端漏掉边际。实现上三次前向，不是新网络。

pass@k 和温度要分开读。0.2 时 pass@1 好看、pass@10 几乎不涨，轨迹挤在同一条路上。1.2 时 pass@1 可能掉一点，pass@10 抬起来，揭开顺序也散。RL 吃的是后者：组内要有过测试的、也有不过的，优势才分得开。评测 Table 2 回到 0.2–0.4，是把已经强化过的 pass@1 用低温度榨出来。把 1.2 写进产品默认采样，会把 Instruct 的 pass@1 打回去。温度在扩散里是双旋钮：词的熵，加上位置的熵。只抄 AR 的「解码温度 0.2」会把位置熵锁死，AR-ness 回升，半步数掉点的那点好处也会吐回去。

Stage 1 训到 700B 变差，作者归到预训练数据质量。更长并不自动把代码扩散训好。有效 65B 早停、再用干净退火数据重复，是承认噪声语料会把已经学到的非因果结构冲回「假 AR」。AR-ness 在 700B 处回升，和下游一起坏，像是模型重新依赖左到右捷径。早停不是超参神话，是验证集投票。复制实验若只抄「130B」而不抄早停，可能会把 Stage 1 跑满池子，然后奇怪为什么不如论文。

MMaDA 也把 GRPO 接到扩散上，但那是多模态统一骨干，解码常配合块。本篇的 coupled-GRPO 明确写了不靠小块。两篇都叫 GRPO，似然估计不是同一个。对齐专文的 d1 是数学向、一步全掩、常配半自回归。代码向把全掩当阴性对照，HumanEval 掉到 66.5。任务换了，估法要换。不要在 LLaDA 上默认套互补掩码，也没有公开主表证明 VRPO 的四条 ELBO 能被一对互补掩码代替。未找到一手来源之前，三种估法分三条任务线，不要合成「扩散 RL 标准配方」。

改编几何仍适用。Qwen2.5-Coder 的下一 token 头没有被拆掉，继续预训练才不会把代码语法冲成随机填空。dKV-Cache 在 Dream 上演示过：移位搞反，GSM8K 可以掉到 32.68。DiffuCoder 没把这条消融写成主表，但不意味着移位可以随便改。读代码扩散实现，先看位置 $i$ 的预测靶子是 $x_i$ 还是 $x_{i+1}$。靶子错了，后面所有 HumanEval 都不可信。

SFT 涨幅小，还有一种读法：436K 来自为 AR 写的 OpenCoder 配方，掩码扩散的画布、EOS、填充和 AR 的 teacher forcing 不是同一套事故。d1 附录写过扩散 SFT 对格式极度敏感。DiffuCoder 没有把「换一套扩散原生 SFT 数据」做成主消融。未找到一手来源之前，不要把 +4.9 HumanEval 写成「扩散结构学不会指令」。更干净的句子是：这套 AR 风格 SFT 接过来只涨这么多，所以他们去做可验证 RL。

BigCodeBench 完成式全量上，Instruct 相对 Base 是 40.2→35.7，掉了；coupled-GRPO 拉回 40.4，几乎只回到 Base。Hard 子集 Instruct 12.2、GRPO 10.8，没有抬上去。主表的好看集中在 HumanEval / MBPP 家族。报「代码扩散已经打平 Qwen Instruct」之前，先看 BCB。打不平。本篇把打平限制在 Base 的 HumanEval / EvalPlus 附近，Instruct 之后仍认 Qwen2.5-Coder-Instruct 的 90.2。

GRPO 其余零件仍是 AR 那套：组内相对优势、PPO 式裁剪、对参考策略的 KL。换掉的只有 $\log\pi$ 怎么来。组大小 $G$ 决定优势有多稳，扩散每条组员都是一次多步去噪，把 $G$ 加到 16 在线成本线性涨。原文没把 $G$ 扫成主消融。奖励两件：代码格式，加上测试用例通过率。格式分防止模型交一堆能编译但不能过测的碎片；通过率才是对错。没有过程监督，中间变量写错但最终测过，仍拿满分。这和 d1 的「格式加 boxed 答案」同类，只是裁判从字符串匹配换成解释器。奖励黑客在扩散上多一条路：正确碎片可以写在不相邻的揭开位置上，中间填注释或占位。评测抽取函数体的脚本若太松，会把这种拼图当成功。看 case 时应当看整段 completion。

半步数掉点变小，写在原文 Figure 1(c)，主表没有列出「步数减半后的 HumanEval 精确格」。能引用的是方向：coupled-GRPO 之后，少步时掉得比 Instruct 少，并和全局 AR-ness 下降放在同一段讨论里。不要把这句话换成「快两倍还不掉点」。步数减半省的是前向次数，每步仍是全双向注意力。系统级 tok/s 去 Mercury / Seed 那张交付物卡。

代码 infill 是任意顺序的产品形态。提示左右都在，中间一段待写。DFM 1.7B 的论文用填空当卖点，但 HumanEval Pass@1 只有 6.7%，和本篇 7B 的 73.2 不是同一量级。机制上 infill 不必等 DFM：掩码扩散训练时已经见过两边可见。DiffuCoder 主表仍是标准补全，没有把 infill 做成 HumanEval 那种主数字。能力在，规格卡上没单独一列。

LLaDA 2.0 post-training 的互补掩码提高数据利用率，语料小于约 100B 时有用。coupled-GRPO 的互补掩码目标不同：不是多看一遍预训练 token，是让每个 completion token 在策略梯度里被公平地估一次对数概率。形状像，用途不是同一个。不要把 2.0 的 complementary masking 抄进本篇的 RL 公式，也不要把 $\lambda=1$ 抄进 2.0 的继续预训练。

局部 AR-ness 随 $k$ 变严：要连续 $k$ 个下标都是「刚才那个字的后继」，$k$ 一大几乎没人达标，曲线往下掉。全局 AR-ness 随 $k$ 变松：允许在最靠左的 $k$ 个仍掩位置里挑，$k$ 一大很容易达标，曲线往上走。读原文 Figure 3 时两根轴方向相反，不是画反了。改编模型两根都比从头训更高，说明 Qwen 的左到右习惯还在。温度 1.2 把两根一起压下来，才是「扩散真的在用任意顺序」的测试时证据。默认 0.2 加低置信 remask，看起来仍很像 AR，只是偶尔跳一下。产品若把温度锁死在 0.2，用户几乎感觉不到任意顺序，只会感觉步数多、填空方便。这不是论文造假，是默认采样把集合又收窄了。

仓库 `apple/ml-diffucoder` 提供权重和 coupled-GRPO 训练脚本。复现 Table 2 必须抄温度集合、EvalPlus 定义（HE+ 与 MBPP+ 平均）、以及「best of {0.2,0.3,0.4}」。只跑一次温度 0.2 的 HumanEval，会对不上 73.2。商业 90 分那一行带 $*$，不要用来验收开源训练是否成功。

和通用 8B 的最后一条接缝：Nie 的 HumanEval 35.4 是 Base、通用数据、他们的生成协议；Gong 表上 LLaDA 也写 35.4，Instruct 列仍是 35.4（相对 Base 0.0），MBPP 还掉了 18.6 点。那是 Gong 的 harness，不是 LLaDA 专文 Instruct 的 49.4。代码向专文引用 LLaDA 时，写清「Gong Table 1」还是「Nie Table 1–2」。两张表的 LLaDA 不能减。

OpenCoder 的 436K 和 Acecoder 的 21K 都是可验证代码数据。通用对话语料不会自动把 HumanEval 从 67 推到 90。Qwen2.5-Coder-Instruct 的 90.2 背后还有 AR 侧更重的指令与 RL 配方。本篇能主张的上限停在：开源 7B 吸收态、代码专料、coupled-GRPO 之后 EvalPlus 67.9。再往上是闭源栈或更重的后训练，没有公开同配方对照。

## 参考文献

- [Gong et al., DiffuCoder, 2025](https://arxiv.org/abs/2506.20639) — Table 1–2；130B；AR-ness；coupled-GRPO；21K。
- [Zhao et al., d1, 2025](https://arxiv.org/abs/2504.12216) — 全掩一步估计的对照。
- [Ye et al., Dream 7B, 2025](https://arxiv.org/abs/2508.15487) — 改编几何；不要和本表横减。
- [Nie et al., LLaDA, 2025](https://arxiv.org/abs/2502.09992) — 通用 8B 的 HumanEval 35.4 / Instruct 49.4，另一套表。

## 相关

- [任意顺序](./any-order.md)
- [对齐与强化学习](./alignment-rl.md)
- [从自回归改编](./ar-to-diffusion.md)
- [Dream、Mercury、Seed](../03-models/dream-mercury-seed.md)
- [采样与调度](../02-mechanism/sampling.md)
