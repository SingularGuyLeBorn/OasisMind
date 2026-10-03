---
title: "腾讯混元官网研究栏目 · 对照译稿"
category: "模型库"
tags: ["Hunyuan", "对照译稿"]
published: true
excerpt: "腾讯混元官网研究栏目 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 1 -->

腾讯混元 模型 研究 Co-design

腾讯混元（左上角字标），顶部导航：模型，研究，Co-design。

> **想：** 目录叫 `hunyuan`，放在混元家族的最前面，这一页是不是混元的模型卡？
> 不是。全页只有导航，一块首屏区，以及 「更多研究」 栏目下的三张研究卡片。没有模型名，没有参数量，没有上下文长度，没有下载或许可证信息，也没有任何评测数字。三张卡片讲的是批量大小，学习率和一个研究智能体，没有一张是某个混元模型的发布说明。这一页只能当腾讯混元官网研究栏目的入口看。

[International](https://hy.tencent.ai/) [试用 Hy](https://aistudio.tencent.com/?lang=zh&utm_source=hy)

[国际版](https://hy.tencent.ai/) [试用 Hy](https://aistudio.tencent.com/?lang=zh&utm_source=hy)（International 指向另一个域名 hy.tencent.ai；试用 Hy 指向腾讯 AI Studio，地址带 `lang=zh` 和 `utm_source=hy`.）

> **再看：** 同一排导航里，左边写 「腾讯混元」，右边写 「试用 Hy」，Hy 和混元是一回事吗？
> 页面没有明说。能看到的是：中文站在 hunyuan.tencent.com，国际版链到 hy.tencent.ai，试用入口的来源参数也写 `hy`。下面 Hyra 那张卡片把 Hyra 展开成 「Hunyuan Research Agent」，名字里的 Hy 取自 Hunyuan。同家族目录里还有 `hy3`，`hy4-preview` 两个条目。这些都指向 「Hy 是混元的简称」，但这一页本身没有一句话把两者等同起来。

登录

登录（右上角按钮。）

![Image block](images/p01-image.png)

（图：一块大的黑色圆角矩形，里面什么也没有；下方居中两个按钮，左边黑底白字 「立即试用」，右边白底黑字 「了解更多」。）

> **停一下：** 黑框里本来是什么，两个按钮又指到哪里？
> 对照 PDF：这块区域没有嵌入任何图片，黑框应当是首屏的视频或动画位，无头浏览器截图时没有渲染出来。两个按钮在 PDF 文字层里是真文字，也带链接：「立即试用」 指向和顶部 「试用 Hy」 相同的 AI Studio 地址；「了解更多」 指向 `https://hunyuan.tencent.com/research/hy4-preview`。源文把按钮连同黑框截成了图，这条 hy4-preview 链接在 md 里没有留下。也就是说首屏推的是 Hy4 预览版，但页面上没有一个字介绍它。

## 更多研究

更多研究（栏目标题，右侧对齐一个 「查看全部」 链接。）

[2026-09-22 ｜ RL Team](https://hunyuan.tencent.com/research/100116)

[2026 年 9 月 22 日，RL 团队](https://hunyuan.tencent.com/research/100116)

# [When Do Larger Batches Help Scale LLM…](https://hunyuan.tencent.com/research/100116)

# [更大的批量，什么时候有助于 LLM 扩展...](https://hunyuan.tencent.com/research/100116)

[Larger batches expose more parallelism by processing more sequences per update, but under a fixed sample…](https://hunyuan.tencent.com/research/100116)

[批量越大，每次更新处理的序列越多，可用的并行度也越高；但在样本数固定的条件下...](https://hunyuan.tencent.com/research/100116)

[了解更多](https://hunyuan.tencent.com/research/100116)

了解更多（卡片底部的链接，和标题指向同一篇。）

> **问：** 署名是 RL Team，讲的却是批量大小和并行度，这篇说的是强化学习训练，还是一般的 LLM 训练？
> 卡片上判断不了。标题在 「Scale LLM」 后面被截断，扩展的到底是 LLM 的什么没有写出来；摘要停在 「under a fixed sample」 之后，固定的是样本总量还是别的预算也被截掉。能确定的只有两点：作者是 RL 团队，讨论的是 「每次更新处理更多序列」 带来的得失。另外它的地址是纯数字 `research/100116`，下面两篇用的是单词 `elr` 和 `hyra`，页面没解释为什么编号方式不同。

![Image block](images/p01-https-hunyuan-tencent-com-research.png)

（图：浅灰蓝底的几何示意图，没有文字也没有数字。两条带箭头的虚线坐标轴交于中心，中心是一个黄色圆点；以它为圆心有一个实线大圆和一个虚线小圆。大圆右上方外侧有一个浅蓝圆点，左下方大圆上有一个灰绿圆点。从中心引出两条实线，一条连到浅蓝点，一条连到大圆右侧某点，两线之间标了一个夹角；浅蓝点和大圆上那一点之间也连了实线，旁边用虚线补成直角。）

> **对一下：** 文件名是 `p01-https-hunyuan-tencent-com-research.png`，看上去属于 「查看全部」 那条 `/research` 链接，它到底是哪张卡片的图？
> 对一下 PDF 坐标：这张图在页面右侧，纵向约 643 到 931，完全落在 100116 卡片的链接区（纵向约 620 到 956）里；「查看全部」 在纵向约 548，位于它上方。所以这是 「When Do Larger Batches」 那张卡片的封面图。MinerU 把它排在卡片文字之后，又按紧随其后的 「查看全部」 链接起了名，文件名只反映它在源文里的位置。

[查看全部](https://hunyuan.tencent.com/research)

[查看全部](https://hunyuan.tencent.com/research)（栏目右上角的链接，指向研究栏目总页。）

> **拆开：** 这份材料被当作研究列表页，可页面上又有 「更多研究」 和指向 `/research` 的 「查看全部」，它抓的到底是哪一页？
> 分开看两件事。其一，如果这就是 `/research` 本身，很少会再放一个 「查看全部」 链回自己；带首屏黑框，两个首屏按钮，加一个 「更多研究」 栏目，这种排法更像站点首页或某篇文章页底部的推荐区。其二，PDF 没有记录抓取的网址，标题元数据只写 「腾讯混元」，生成时间是 2026 年 9 月 25 日。所以 「研究列表页」 这个说法只能算对内容的概括，页面自己证明不了它是 `/research`。

![Image block](images/p01-https-hunyuan-tencent-com-research-elr.png)

（图：同一种浅灰底，也没有文字和数字。一条水平虚线上从左到右排着四个圆点：灰绿，浅蓝，米白，黄。最大的实线椭圆以灰绿点和黄点为左右两端；较小的实线椭圆以灰绿点和米白点为两端；一个虚线椭圆以浅蓝点和黄点为两端，和小椭圆部分重叠。）

> **核对：** 这三张图里有没有站点图标？
> 没有。`p01-image.png` 是首屏黑框加按钮的截图；另外两张是研究卡片的封面，一张圆和夹角，一张共线的椭圆，在 PDF 里原图都是 2580×1548 的大图，各自落在 100116 和 ELR 卡片的链接区里。真正的站点字标在页面左上角，PDF 里是一张约 78×18 的小图（原图 416×96），它没有被提取进 `images/`。源文首行的 「腾讯混元」 在 PDF 文字层里找不到，多半就是对这张字标图的识别结果。

[研究](https://hunyuan.tencent.com/research/elr)

[研究](https://hunyuan.tencent.com/research/elr)（卡片左上的类别标签，点击同样进入 ELR 那篇。）

### [From LR to ELR: A Better Heuristic for Pretraining Dynamics](https://hunyuan.tencent.com/research/elr)

### [从 LR 到 ELR：观察预训练动态的一个更好的启发式指标](https://hunyuan.tencent.com/research/elr)

> **确认：** 源文里这个标题是二级标题，前一篇和后一篇却是一级标题，三张卡片在页面上真有主次之分吗？
> 确认过 PDF：三个标题都折成两行，100116 那个两行约占 75 个单位高，ELR 和 Hyra 各约 62，后两者字号相同。版式上 100116 是一张通栏大卡，文字在左，封面在右；ELR 和 Hyra 是下面一排的卡片，文字从横向约 472 处起排。所以 ELR 和 Hyra 在页面上同级，源文却给了一个 `##` 一个 `#`，这是 MinerU 的判断，不代表页面层级。这里把它降成三级标题，只是为了不和 「更多研究」 抢同一级。

[Understanding pretraining dynamics is crucial for designing effective training hyperparameters for large language models (LLMs), particularly the learning rate (LR). However, LR does not…](https://hunyuan.tencent.com/research/elr)

[要给大语言模型（LLM）定好训练超参数，特别是学习率（LR），先得弄清预训练过程是怎么演变的。然而，LR 并不...](https://hunyuan.tencent.com/research/elr)

[2026-08-06 ｜ Pretrain Team](https://hunyuan.tencent.com/research/elr)

[2026 年 8 月 6 日，预训练团队](https://hunyuan.tencent.com/research/elr)

> **回看：** 标题从 LR 走到 ELR，ELR 是什么？
> 回看整张卡片，全称没有出现。摘要先说 LR 对设计超参数很关键，接着一句 「However, LR does not」 就断了，正好断在要说 LR 哪里不够的地方。标题只说 ELR 是观察预训练动态的一个 「heuristic」，而且比 LR 更好；它怎么定义，和 LR 是什么换算关系，卡片没给。另外这张卡把日期和团队放在摘要下面，100116 那张放在标题上面，同一栏目两种排法。

[研究](https://hunyuan.tencent.com/research/hyra)

[研究](https://hunyuan.tencent.com/research/hyra)（类别标签。）

# [Hyra: A simple yet effective scaffold for general discovery](https://hunyuan.tencent.com/research/hyra)

# [Hyra：一个简单而有效的通用发现脚手架](https://hunyuan.tencent.com/research/hyra)

[Today, we are introducing Hyra-1.0, the first release of Hyra (Hunyuan Research Agent) - an agent capable of recursive self-improvement, purpose-built for performance-driven research…](https://hunyuan.tencent.com/research/hyra)

[今天我们推出 Hyra-1.0，这是 Hyra（Hunyuan Research Agent，混元研究智能体）的第一个版本。它是一个能够递归自我改进的智能体，专门为以性能为目标的研究而做...](https://hunyuan.tencent.com/research/hyra)

[2026-07-21 ｜ Hyra Team](https://hunyuan.tencent.com/research/hyra)

[2026 年 7 月 21 日，Hyra 团队](https://hunyuan.tencent.com/research/hyra)

> **想：** 标题说 Hyra 是 「scaffold」，摘要说它是能 「recursive self-improvement」 的 agent，这两个说法怎么放到一起？
> 卡片只给了这两句。标题把它定位成通用发现用的脚手架，强调 「simple yet effective」；摘要说它是一个智能体，能递归自我改进，面向 「performance-driven research」，即有明确指标可优化的研究。自我改进靠什么实现，在哪些任务上验证过，卡片都没写，摘要在 「research」 之后截断。另外 Hyra 是三张卡片里唯一没有封面图的，PDF 里这个位置也是空的。

> **问：** 三张卡片的链接指向哪些论文？
> 三条都指向混元官网自己的研究文章页：`research/100116`, `research/elr`, `research/hyra`。页面上没有 arXiv 链接，没有 PDF 链接，没有作者姓名，只署了团队名（RL Team, Pretrain Team, Hyra Team）。这些文章背后有没有对应的论文，这一页看不出来。算上首屏按钮，报告指向研究栏目的一共是四个目标：这三篇，外加 `research/hy4-preview`。

> **停一下：** 研究卡片到 Hyra 就没了，这是研究栏目的全部吗？
> 大概率不是。PDF 页高 1500，Hyra 的日期行落在纵向约 1450 到 1466，离底边只剩三十多个单位；页面没有页脚，没有版权行，也没有翻页控件。截图应当是在这里截断的。按日期看，可见的三篇是 2026 年 9 月 22 日，8 月 6 日，7 月 21 日，从新到旧排列，再早的研究文章只能去 「查看全部」 指向的 `/research` 看。
