---
title: "03 · AlphaEvolve：进化编码智能体改算法不改自己"
date: 2026-08-31
as_of: 2026-08-31
category: 论文精读
published: true
excerpt: >-
  AlphaEvolve（arXiv:2506.13131）用冻结的 Gemini 给程序打补丁，评估函数在墙外打标量分。
  48 次复数矩阵乘、Borg 0.7%、Gemini kernel 23%/1%、FlashAttention 约 32%。
  Artifact 层样板：反哺训练栈不等于 RSI。
tags:
  - RSI
  - AlphaEvolve
  - FunSearch
  - Artifact
  - 算法发现
  - 进化搜索
---

# 03 AlphaEvolve：进化的是代码

有大模型基础的人第一次听到 AlphaEvolve，多半会把它听成「AI 在改自己」。卡住的瓶颈其实更窄：**候选必须能被机器自动打分**，进化发生在程序数据库里，提议补丁的 Gemini 权重可以整段冻结。产出物变好、甚至把 Gemini 自己的训练 kernel 加快 23%，都还不是递归自我改进。

本篇是 Artifact 层的样板。三层坐标在 [02 Model–Harness–Artifact](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；能不能叫 RSI，用 [01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md) 的式 (1)(2)。**不是** AlphaTensor 那种专打矩阵乘的强化学习，**不是** [04 DGM](../../3-Harness层-Agent运行时/04-DGM-达尔文哥德尔机/04-DGM-达尔文哥德尔机.md) 那种改自己脚手架的编码 Agent，也**不是**把报告里的 OPD 再推一遍。一手：Novikov, Vũ, Eisenberger 等，Google DeepMind 白皮书 [arXiv:2506.13131](https://arxiv.org/abs/2506.13131)；官方博客 [2025-05-14](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/)。

## 1. 问题：LLM 会编，发现必须能跑、能打分

科学发现和工程优化要经过提议、试错、回退、验证。近年 LLM 把「提议」做得很快，幻觉也跟着快。AlphaEvolve 的设定是：只接那些**候选可以表示成代码、分数可以自动算出来**的题。用户提供的评估函数写成

$$
h(P)=\{m_1(P),\ldots,m_k(P)\},\qquad m_i\text{ 约定取越大越好}. \tag{1}
$$

实践里 $h$ 是一个叫 `evaluate` 的 Python 函数，返回标量字典。数学题可以很薄：生成一个图，检查性质，返回顶点数。工程题可以很厚：在加速器上真跑 kernel，墙钟当分数；数据中心调度则用历史负载仿真。白皮书写明：评一次可以花大约 **100 计算小时**，靠级联测试和并行把墙钟压下去。换来的是——模型胡说的代码，执行一遍就现形，进化不会把幻觉当知识存下来。

这个设定同时是上限。需要人手实验、不能仿真的自然科学，不在范围内。LLM 也可以给「简洁性」这类难写成公式的性质打辅助分，作者说那不是他们优化过的主路径。

## 2. 前身 FunSearch：只进化一个短函数

2023 年同一条线上已经有 FunSearch（Romera-Paredes 等，*Nature*；机制精读见 [04 FunSearch](../04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md)）：冻结的代码 LLM 当变异算子，评估器挡幻觉，在函数空间里搜。cap set 这类极值组合问题靠它刷新过已知构造（$n=8$ 时 512）。骨架仍是「人写评估 + 人写种子函数 + 岛模型保多样性」。

白皮书 Table 1 把两者并排。FunSearch 进化**单个 Python 函数**、大约 **10–20 行**、评估要快（单 CPU $\leq 20$ 分钟）、往往要**数百万**次 LLM 采样、小模型就够、提示里几乎只有以往解、单目标。AlphaEvolve 进化**整份代码文件**、可以到**数百行**、任意语言、评估可以在加速器上跑数小时、**数千**次采样就够、能吃到前沿模型、提示可以塞文献和执行反馈、可以多目标。三条扩展叠在一起，才从「发现一个启发式函数」走到「改 Gemini 训练用的 tiling 启发式 / 改 XLA IR / 改 TPU 的 Verilog」。

同一道矩阵乘，更早还有 AlphaTensor（Fawzi 等，2022）：深度强化学习专打张量分解，不是通用编码 Agent。它对 $4\times 4$ 在二元域 $\mathbb{F}_2$ 上找到过 rank **47**；在特征为 0 的域上，Strassen 1969 递归给出 rank **49**，这个记录停了 56 年。AlphaEvolve 用通用进化编码，在复数矩阵乘上把 rank 推到 **48**。专才系统能做的，通用系统在这块上超过了它，这是白皮书拿来对照的那一刀，不是「RL 过时了」的口号。

## 3. 循环：采样提示、打补丁、打分、放回档案

用户要交三样东西：一份带 `# EVOLVE-BLOCK-START/END` 标记的种子程序、一个 `evaluate`、可选配置。标记里的代码是进化对象，标记外是骨架，评估函数从骨架调用进化块。初始实现必须能跑，可以很蠢，比如单行返回常数。

之后进入异步流水线（`asyncio`）：控制器、LLM 采样器、评估节点，优化的是**吞吐量**，不是单次延迟。一轮可以写成

$$
P'=\mathrm{ApplyDiff}\bigl(P,\;\mathrm{LLM}(\mathrm{Prompt}(\mathcal{D}))\bigr),\qquad
\mathcal{D}\leftarrow\mathcal{D}\cup\{(P',h(P'))\}. \tag{2}
$$

$\mathcal{D}$ 是程序数据库。Prompt sampler 从 $\mathcal{D}$ 里抽出若干已评分程序，拼上任务说明、执行结果、可选的文献，送给模型。模型默认不重写整文件，而是输出 SEARCH/REPLACE 块：

```
<<<<<<< SEARCH
旧片段
=======
新片段
>>>>>>> REPLACE
```

短代码也可以配置成整段重写。集成用的是 **Gemini 2.0 Flash + Gemini 2.0 Pro**：Flash 拉采样速率，Pro 偶尔给能跳台阶的补丁。消融里「只用小基座」明显变差，所以这条不是装饰。

评估侧有三件可选机关。级联（作者写成 hypothesis testing）：先在小规模或易例上跑，过关才进入主测试，把必错程序尽早丢掉。LLM 辅助分：给「写得是否简单」这类 $h$ 不好写死的性质打分，或用来直接丢掉。并行：同一评估从多个随机种子展开，否则单次 100 小时会把「连续打好几刀补丁」掐死。多目标有时是真需求（又要快又要面积），有时是工具——不同度量上的冠军结构不同，把它们一并塞回提示，模型更不容易围着一个局部最优打转。

和「AI 科学家」类系统的差别也在 $h$ 上。相关工作把 AI Co-Scientist 收成自然语言假设加自然语言评价；AlphaEvolve 把假设写成程序、评价写成可执行函数。幻觉在执行时现形，所以进化能撑很长时间。白皮书承认两条可以接：先用 LLM 筛高层想法，再进实现阶段交给机器分数。那是展望，主实验没有走这条。

数据库要在「继续爬最好」和「别把多样性养死」之间找位置。实现灵感来自 **MAP-Elites** 加 **岛模型**（FunSearch 用过后者）。岛上表现差的程序仍可能当垫脚石：MAP-Elites 的本意就是按特征格子各留一个精英，避免档案退化成只存第一名的排行榜。AlphaEvolve 这边读者先记住这件事即可；开放档案在 DGM 里会写得更显式。

提示还可以更厚：显式上下文（公式、代码、PDF）、随机模板、把 $h$ 的返回值渲染进提示，以及 **meta prompt evolution**——另开一个库，让 LLM 给「下一次该怎么提示」提建议。后一件已经碰到脚手架的边：改的是搜索器自己的提示，不是 $\theta$，也不是 `evaluate`。本花园仍把它记在 Artifact 循环内部的可选插件，不升级成 Harness 层 RSI。

![AlphaEvolve 循环：User spec → Prompt sampler → Gemini 集成 → Apply diffs → Evaluator → Program DB，虚线回流采样父代](./images/fig-alphaevolve-loop.png)

> 图 1：进化发生在程序数据库里。Gemini 只出 diff，分数由墙外的 $h$ 给出。

**图 1 解析**

- **最左 User spec**：人写下种子、进化块标记和 `evaluate()`。考纲从这里进场，后面默认不再改。
- **Prompt sampler**：从档案里抽已评分程序，拼上下文。没有这一步，模型每次都对着同一份种子说话，消融里叫 No evolution。
- **Gemini 2.0 Flash + Pro**：变异算子。输出是补丁，不是新权重。
- **Apply diffs**：SEARCH/REPLACE 打进当前程序，得到 $P'$。
- **Evaluator $h$**：执行并返回标量。错误程序在这里死，不进「新知识」。
- **Program DB**：MAP-Elites + 岛。虚线「sampled parents」是辅助回流，不是模型在改自己。

## 4. 改哪一层：产物在变，改进器在墙外

沿用导读记号。$S$ 若只含「当前候选程序」，$I$ 是「Gemini + 提示模板 + $h$ + 数据库规则」。每一轮 $S'=I(S)$ 都成立，这是 self-improving 伞下的 Artifact 搜索。RSI 还要求 $I'\subseteq S'$。AlphaEvolve 的公开描述里，$I$ 的四件套都还在墙外：权重冻结，`evaluate` 人写，选择规则固定，进化框架本身不是被进化块标出来的对象。

![左栏进化产物，右栏冻结的权重/评估/选择规则](./images/fig-alphaevolve-frozen.png)

> 图 2：左栏是 $S$ 里会变的东西；右栏是 $I$ 里公开冻结的东西。

**图 2 解析**

- **左栏 Evolves**：候选程序、kernel / 启发式、Verilog 或编译器 IR。交卷物在这里。
- **右栏 Frozen**：$\theta$、人类写的 `evaluate()`、MAP-Elites 与岛规则。
- **中间 I stays outside**：改进器身份没有进 $S'$。
- **底栏**：缺式 (2)，所以默认不是 RSI。要把声称升级，至少指出下一轮提示模板或选择算子已经由上一轮 Agent 接任，并且评估函数的改写有授权。

白皮书 Discussion 自己写了更硬的下一步：把 AlphaEvolve 抬上去的能力**蒸馏回下一代基座**，以及用发现来的效率改进去喂「未来版本的」基座和 AlphaEvolve。作者同时写：目前增益中等，反馈环以**月**计。那是系统叙事上的可能闭合，不是已经闭合的递归证明。生产数字经常被转述成「Gemini 在改 Gemini」——改的是训练栈上的 kernel 和调度启发式，发现者 Agent 仍是那套固定流水线。

## 5. 矩阵乘：48 次复数乘，以及张量分解在搜什么

矩阵乘 $A_{m\times n}B_{n\times p}$ 对应一个 3 张量 $\langle m,n,p\rangle$。把它分解成 rank-one 项的个数，等于算法需要的标量乘法次数，所以更快的算法 $\Leftrightarrow$ 更低的张量 rank。从 Strassen 1969 到交替最小二乘、AlphaTensor、各种定制搜索，连 $3\times 3$ 的最小 rank 都还不知道。

AlphaEvolve 不直接在张量条目上做 RL，而是进化一个**搜分解的程序**：初始化、重构损失、Adam/AdamW、超参扫描都可以进进化块。评估时对一组乘法目标、多个随机种子跑这个搜索器，分数是达到的最低 rank，以及有多少种子打到这个 rank。为避免浮点装成「新算法」，评估会把条目四舍五入到整数或半整数，并在提示里用自然语言要求接近整数解。论文 Figure 4 给过一次 15 步变异的例子：优化器从 Adam 换成 AdamW、初始化尺度改掉、损失里加上离散化项和余弦退火——改的是搜索器源码，不是 Gemini。

Table 2 里 14 个目标刷新已知最好，覆盖 $\langle 2,4,5\rangle$ 到 $\langle 4,5,6\rangle$ 这一段常用形状。$\langle 4,4,4\rangle$ 从 49（Strassen 递归，任意域）到 **48**（复乘，也可用于实矩阵的精确乘）。脚注写清：存在乘法次数更少但不对应张量分解、因而不能递归放大到更大矩阵的算法；AlphaEvolve 给的是可递归的 rank-48 分解。$\langle 3,3,3\rangle$ 仍停在 23，没有假装什么都破了。完整表和构造在配套 [Colab](https://colab.research.google.com/github/google-deepmind/alphaevolve_results/blob/master/mathematical_results.ipynb)。

同一套系统还可以换抽象层级：直接进化解的字符串、进化从零构造解的函数、进化在固定算力预算里找解的搜索算法，或者让中间解和搜索算法一起进化。对称性强的对象更吃构造函数（FunSearch 那一路）；不对称的更吃定制搜索。这是用法，不是另一套坐标系。

## 6. 数学开放题与 Google 生产四刀

对 50 余道分析、几何、组合、数论里「找到更好构造就算进展」的题，约 **75%** 追平当时最好（其中不少可能已经最优），约 **20%** 超过。例子：Erdős 最小重叠问题的上界被推进一点；11 维 kissing number 的下界从 592 到 **593** 个互不重叠的单位球同时碰到中心球。题目有一部分来自 Gomez Serrano 与陶哲轩的建议。这是人出题、机器在可检验的构造空间里搜，不是机器在改评分标准。

工程四刀写在 §3.3，博客与白皮书数字对得上的，以白皮书为准；博客多说的「最高 32.5%」标来源。

**Borg 调度。** 在线作业调度被收成二维向量装箱：机器是箱子（CPU / 内存容量），作业是物品。启发式吃「作业需求 + 机器剩余」，吐一个优先级；Borg 只在已经判定能跑的机器里按这个分排序，正确性几乎是构造出来的。论文 Figure 6 给出的打分可以读成（记号按源码）

$$
\mathrm{score}=-\Bigl(\tfrac{\mathrm{cpu_{req}}}{\mathrm{cpu_{free}}}+\tfrac{\mathrm{mem_{req}}}{\mathrm{mem_{free}}}+\tfrac{\mathrm{mem_{res}}}{\mathrm{cpu_{res}}}+\tfrac{\mathrm{cpu_{res}}}{\mathrm{mem_{res}}}\Bigr), \tag{3}
$$

其中 $\mathrm{cpu_{res}}=\mathrm{cpu_{req}}/\mathrm{cpu_{free}}$，$\mathrm{mem_{res}}=\mathrm{mem_{req}}/\mathrm{mem_{free}}$。交叉比两项惩罚「一种资源先见底、另一种还空着」的 stranded 形态。仿真用历史负载，测试用未见过的近期负载。全舰队上线后，平均持续回收 Google 全球计算资源的 **0.7%**。选它而不是深度 RL，理由写得很工程：可解释、可调试、可预期、好上线。

**Gemini 矩阵乘 tiling。** 大矩阵乘要切成子问题才能在 TPU 上把计算和搬运配平。手工启发式难，自动搜索又会在形状一变时打断研究。AlphaEvolve 进化 tiling 启发式，目标是真实 TPU 上的 kernel 运行时间；切块策略变、数学运算不变，正确性同样近乎构造。训练/评估形状从真实用户调用里对半拆。结果：相对专家启发式，平均 **23%** kernel 加速，Gemini 整体训练时间大约 **1%**。优化周期从几个月工程师手工变成几天自动实验。白皮书原句把这写成 Gemini 经由 AlphaEvolve **optimize its own training process**——优化的是训练过程用的 kernel 启发式，权重训练配方仍在人这边。

**TPU 算术电路。** 在已经很瘦的矩阵乘单元 Verilog 上做 RTL 优化，目标是面积和功耗，功能必须过硬验证。找到过一次去掉多余比特的改写，TPU 设计师确认正确；下游综合工具后来也能抓到同一处。意义是 Gemini 第一次经这条路直接碰到 TPU 算术电路的源 RTL，沟通语言是工程师日常用的 Verilog。不要把它听成「芯片已经由模型全自动流片」。

**FlashAttention 的 XLA IR。** 注意力在他们的栈里是 Pallas kernel + JAX 包装，再被 XLA 降成 IR。IR 本为调试，且已经是编译器优化过的。AlphaEvolve 直接改这份 IR，每步和未改参考在随机输入上对数值，最后由人确认对所有输入正确。该配置下 FlashAttention kernel **32%**；预处理/后处理再 **15%**。博客写「该 kernel 实现最高 **32.5%**」，量的是同一方向、口径略宽，本篇并存、不调和。

## 7. 消融：进化、上下文、整文件、模型强弱都不是配件

§4 在张量分解和 kissing number 上拆过组件，曲线在 Figure 8，正文没有给可摘的单点百分数，这里不读图编数。拆掉的五件是：No evolution（每次只喂同一份种子）、No context in the prompt、No meta prompt evolution、No full-file evolution（张量分解里只进化损失函数）、Small base LLM only。作者的判断是：每一件都对结果有可观贡献。对有大模型基础的读者，这句话的用法是——不要把 AlphaEvolve 理解成「换一个更强的聊天模型再采样」。没有档案回流，它退回反复采样；没有整文件进化，它退回 FunSearch 能做的那一截；没有前沿模型，Table 1 里「thousands of samples suffice」那一档就不成立。

相关工作还点过一条更靠近 Model 层的变体：进化过程中用强化学习继续微调提议补丁的 LLM（Surina et al., 2025）。白皮书说，在 AlphaEvolve 这个规模上，这类想法还需要另做研究。读者把它放在「可以想像的闭合」里即可，不要把 2025 白皮书读成已经在训 $\theta$。

和邻居的「不是」可以收成一张表：

| 系统 | 改什么 | 改进器在哪 | 本花园 |
|------|--------|------------|--------|
| [FunSearch](../04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md) | 单个短函数 | 冻结小代码 LLM + $h$ | Artifact 前身 |
| AlphaTensor | 矩阵乘张量分解 | 专精 RL 策略 | 专才发现，不是通用编码 Agent |
| AlphaEvolve | 整文件算法 / kernel / RTL / IR | 冻结 Gemini 2.0 + 人写 $h$ | Artifact；可反哺训练栈 |
| SPIN / Self-Rewarding | 权重 | 损失与数据锚大多固定 | Model 层，见第 2 章 |
| DGM / STOP / Gödel Agent | Agent 自己的代码 | 基座可冻结，改的是 harness | 第 3 章；弱 RSI 候选 |
| OPD | 学生 $\theta$ | 教师分布在墙外 | llm-guide 4.6，不是本库 |

失效模式也短。没有自动评估器，循环建不起来。评估器写偏，系统会合法地刷偏掉的 $h$（reward hacking 的工程版）；Borg 那刀把启发式限制在「已经可运行的机器排序」上，是在收这个口。数值不取整，矩阵乘会得到不能当算法用的浮点分解。只爬当前最好、丢掉岛屿，会过早收敛——档案规则存在就是为了这件事。把「训练时间少了 1%」说成权重递归改自己，是本花园最常见的口误。

## 8. 本篇之后读什么

下一篇机制若走科研闭环，看 [01 Polaris](../01-Polaris-科研智能体/01-Polaris-科研智能体.md)（文献→实验→写作，默认仍是 Artifact）。前身机制已单开：[04 FunSearch](../04-FunSearch-函数空间搜索/04-FunSearch-函数空间搜索.md)。若问「改自己代码的编码 Agent」，出本章，进第 3 章的 DGM / STOP / Gödel Agent。实验室把 AlphaEvolve 写进通稿的部分，[06 实验室动态](../../5-实验室与公司/06-实验室动态/06-实验室动态.md) 只当索引，数字以本篇白皮书为准。

**读**：候选如何表示、$h$ 在哪、Gemini 出的是 diff 还是新 $\theta$、反哺落在训练栈的哪一层。  
**不读**：融资通稿当机制、把 0.7% / 23% / 1% 加成「已经 RSI」。

## 参考文献

1. Novikov, A., Vũ, N., Eisenberger, M., Dupont, E., Huang, P.-S., Wagner, A. Z., … Balog, M. (2025). [AlphaEvolve: A coding agent for scientific and algorithmic discovery](https://arxiv.org/abs/2506.13131). arXiv:2506.13131. Table 1、式与 §2–§4、Table 2、§3.3 生产数字以该白皮书为准。
2. AlphaEvolve team. (2025-05-14). [AlphaEvolve: A Gemini-powered coding agent for designing advanced algorithms](https://deepmind.google/blog/alphaevolve-a-gemini-powered-coding-agent-for-designing-advanced-algorithms/). Google DeepMind. 博客口径的 32.5%、Early Access 叙述以该页为准。
3. Romera-Paredes, B., Barekatain, M., Novikov, A., et al. (2023). [Mathematical discoveries from program search with large language models](https://www.nature.com/articles/s41586-023-06924-6). *Nature*. FunSearch。
4. Fawzi, A., Balog, M., Huang, A., et al. (2022). Discovering faster matrix multiplication algorithms with reinforcement learning. *Nature*. AlphaTensor；$\mathbb{F}_2$ 上 $4\times 4$ rank 47。
5. Strassen, V. (1969). Gaussian elimination is not optimal. *Numerische Mathematik*, 13, 354–356.
6. 本花园：[02 三层](../../1-坐标系与术语/02-Model-Harness-Artifact/02-Model-Harness-Artifact.md)；[01 术语](../../1-坐标系与术语/01-RSI-术语辨析/01-RSI-术语辨析.md)。数学构造：[Colab](https://colab.research.google.com/github/google-deepmind/alphaevolve_results/blob/master/mathematical_results.ipynb)。
