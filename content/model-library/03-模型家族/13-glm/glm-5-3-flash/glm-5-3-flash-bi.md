---
title: "GLM-5.3-Flash · 对照译稿"
category: "模型库"
tags: ["GLM", "对照译稿"]
published: true
excerpt: "GLM-5.3-Flash 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
<!-- page 1 of 7 -->

[AutoClaw](https://autoclaw.z.ai/)

[Blog](https://autoclaw.z.ai/blog/) More Download

页首导航栏: 左边是 [AutoClaw](https://autoclaw.z.ai/) 标志, 右边依次是 [博客](https://autoclaw.z.ai/blog/) (当前高亮), 更多 (More), 下载 (Download) 按钮.

[Home](https://autoclaw.z.ai/) / [Blog](https://autoclaw.z.ai/blog/) / [model](https://autoclaw.z.ai/blog/model/) / GLM-5.3-Flash: More Intelligence with Less Compute

面包屑: [首页](https://autoclaw.z.ai/) / [博客](https://autoclaw.z.ai/blog/) / [model 分类](https://autoclaw.z.ai/blog/model/) / GLM-5.3-Flash: 更多智能, 更省算力.

**model** Published: September 25, 2026 • 5 min read • Author: AutoClaw Team

分类标签 **model**. 发布于 2026 年 9 月 25 日 • 阅读约 5 分钟 • 作者: AutoClaw Team.

> **确认:** 标题, 日期, 作者分别印在哪里, 和 PDF 对得上吗?
> 对得上. 标题在第 1 页面包屑末尾和正文大标题各出现一次, 两处文字相同. 日期和作者在大标题上方的同一行: 「Published: September 25, 2026」, 「Author: AutoClaw Team」. PDF 元数据的标题是 「GLM-5.3-Flash: More Intelligence with Less Compute | AutoClaw Blog」, 生成时间是 2026-09-25 05:02 (UTC), 和发布日期是同一天. 页脚第 7 页写的是 「AutoClaw by AutoGLM」, 这是站点署名, 不是文章作者, 作者栏仍以 AutoClaw Team 为准. 页面标的 「5 min read」 是站点估算的阅读时长, PDF 打印成 7 页, 其中第 6, 7 页是推广区和页脚, 两者不冲突.

# GLM-5.3-Flash: More Intelligence with Less Compute

GLM-5.3-Flash: 更多智能, 更省算力. (文章大标题. 「Less Compute」 指模型用更少的计算完成任务, 第 2 页整节讲的是推理效率, 所以译作更省算力.)

GLM-5.3-Flash is our first natively multimodal model in the GLM-5 family. With 320B total parameters and only 18B active parameters, it delivers strong performance across complex tasks, agentic workflows, visual understanding, and professional work.

GLM-5.3-Flash 是我们 GLM-5 家族里第一个原生多模态模型. 它总参数 320B, 激活参数只有 18B, 在复杂任务, 智能体工作流, 视觉理解和专业工作上都有很强的表现.

> **想:** 320B 和 18B 各在源文哪一行?
> 320B 全文只出现一次, 就在这一段, 源文 md 第 12 行, PDF 第 1 页导语第二句 「With 320B total parameters」. 18B 出现两次: 一次在同一句 「only 18B active parameters」; 另一次在第 2 页架构节, 源文 md 第 24 行 「it reduces the number of active parameters from 32B to 18B」. 两处 18B 说的是同一个量. 320B 是模型里全部参数的总数, 18B 是处理每个输入时实际参与计算的参数量, 两个数本来就是两种口径, 页面把它们放在一句里一起报. 页面没有写专家总数, 每次激活几个专家, 共享专家有几个, 所以 18B 是怎么由路由组合出来的, 这一页查不到.

![Image block](images/p01-we-trained-glm-5-3-flash-from-a-new-base-model-and.png)

(图: 黑底横幅. 左上角 AutoClaw 标志, 左侧两行白字 「GLM-5.3-Flash」 和 「Coming to AutoClaw」, 下面一条渐隐的细线; 右侧是一头由白色细线和光点组成的公牛, 低头, 牛角朝前, 脚下是点阵构成的起伏地面. 图里没有数据, 没有坐标轴.)

> **对一下:** 这张图的文件名 p01-we-trained-glm-5-3-flash-from-a-new-base-model-and.png 和图的内容对得上吗?
> 对不上内容, 只对得上位置. 文件名是 MinerU 用紧跟在图后面那段正文的开头 「We trained GLM-5.3-Flash from a new base model and」 生成的, 图本身是一张宣传横幅, 画的是 「GLM-5.3-Flash Coming to AutoClaw」 和一头公牛, 和 「新基座模型」 没有关系. PDF 第 1 页里, 横幅确实夹在导语和 「We trained...」 那段之间, md 的位置和 PDF 一致. 所以按文件名去猜图的内容会猜错, 引用时要看图.

We trained GLM-5.3-Flash from a new base model and redesigned its architecture and training recipe around capability and efficiency. It introduces a hybrid architecture combining sparse and linear attention, adopts Manifold-Constrained Hyper-Connections to improve scaling efficiency, and is trained on our latest 30T-token multimodal corpus.

我们从一个新的基座模型开始训练 GLM-5.3-Flash, 并围绕能力和效率重新设计了它的架构和训练方案. 它采用稀疏注意力和线性注意力相结合的混合架构, 用流形约束超连接 (Manifold-Constrained Hyper-Connections) 来提高扩大规模时的效率, 训练数据是我们最新的 30T token 多模态语料.

> **拆开:** 这一段有三件事: 新基座, 混合注意力, 流形约束超连接, 外加 30T token 语料. 哪几件在后文有展开?
> 混合注意力在第 2 页有两段文字和一张架构图, 展开最多. 流形约束超连接在正文只出现这一次, 没有解释它改了什么; 第 2 页架构图左侧每个子层旁边都有一个 「mHC」 方框, 从字母看应当就是 Manifold-Constrained Hyper-Connections 的缩写, 但页面没有把两者明确对应起来. 「scaling efficiency」 说的是模型规模或训练规模扩大时的效率, 和第 2 页讲的推理省算力不是一回事, 页面也没给这方面的数. 30T token 只有总量, 没有文本, 图像, 视频各占多少. 「new base model」 只说是新的, 没说和 GLM-5 系列其他模型的基座是什么关系.

<!-- page 2 of 7 -->

Before its official release, we evaluated GLM-5.3-Flash anonymously as Ox Alpha under realworld traffic, with all traffic served on Chinese AI accelerators.

正式发布前, 我们以 Ox Alpha 的匿名身份, 在真实流量下评估了 GLM-5.3-Flash, 所有流量都跑在国产 AI 加速器上.

> **问:** 「Chinese AI accelerators」 是哪家的芯片? 匿名评估在哪个平台上做的?
> 页面都没说. 第 2 页这里和第 5 页 「Serving at Scale on Chinese AI Chips」 一节, 都只写 「Chinese AI accelerators」, 没有厂商, 型号, 集群规模. Ox Alpha 是匿名代号, 页面没说在哪个平台以这个名字上线, 跑了多久, 评估看的是什么指标. 另外一个抓取问题: PDF 这里是 「real-」 在行尾断开, 下一行接 「world」, md 合并时把连字符丢了, 写成了 「realworld」, 原文应是 「real-world」.

**Architecture for Efficient Inference**

**面向高效推理的架构**

We designed GLM-5.3-Flash specifically for highly efficient inference. Compared with the GLM-4.5 series, which has a similar total parameter count, it reduces the number of active parameters from 32B to 18B and the number of layers from 92 to 45.

我们专门为高效推理设计了 GLM-5.3-Flash. 和总参数量相近的 GLM-4.5 系列相比, 它把激活参数从 32B 降到 18B, 层数从 92 层降到 45 层.

> **回看:** 「similar total parameter count」 相近到什么程度? 32B 和 92 层对得上 GLM-4.5 吗?
> 本页没印 GLM-4.5 的总参数. 同家族 glm-4-5 目录的论文表 1 写的是: GLM-4.5 总参数 355B, 激活 32B, 3 层 dense 加 89 层 MoE, 合计 92 层, 另有 1 层 MTP. 所以 32B 和 92 层都对得上, 而且 92 不含那层 MTP. 320B 对 355B, 少 35B, 约少 10%, 说 「相近」 可以接受. 激活参数从 32B 到 18B, 少了 43.75%; 层数从 92 到 45, 少了约 51%. 按各自总参数算, GLM-4.5 每次激活约 9.0% 的参数 (32 / 355), GLM-5.3-Flash 约 5.6% (18 / 320). 这两个比例是用两页的数算出来的, 页面自己没写.

To reduce attention costs in long-context workloads, the model combines linear and sparse attention. Linear attention captures local dependencies through state modeling, while sparse attention uses a lightweight indexer to retrieve relevant information from the global context.

为了降低长上下文场景下的注意力开销, 模型把线性注意力和稀疏注意力结合起来. 线性注意力通过状态建模捕捉局部依赖, 稀疏注意力则用一个轻量的索引器 (indexer) 从全局上下文里检索相关信息.

> **拆开:** 第 2 页说层数是 45, 架构图里线性注意力块标 「×3」, 稀疏注意力块标 「×1」. 45 层怎么按 3 比 1 分?
> 分不整. 图左侧画的是两组: 下面一组 「Linear Attention + MoE」, 旁边标 ×3; 上面一组 「IndexPool Sparse Attention + MoE」, 旁边标 ×1. 按字面理解是 3 层线性注意力配 1 层稀疏注意力, 4 层一组. 45 除以 4 是 11.25, 不是整数. 可能的情况有几种: 45 层里首尾有不按这个比例排的层; 或者 45 的计数口径和图不同, 比如是否含图顶上的 「MTP Layer」; 或者 ×3 / ×1 只是示意. 页面没有给重复次数, 也没有给线性层和稀疏层各多少层, 这里不替它算.

At context lengths of up to one million tokens, IndexPool further reduces indexer latency and memory overhead by compressing four cached key vectors into one through weighted pooling.

在最长一百万 token 的上下文长度下, IndexPool 通过加权池化把每四个缓存的 key 向量压成一个, 进一步降低索引器的延迟和显存开销.

> **对一下:** 文字说 「compressing four cached key vectors into one」, 图里对应的是哪一块? 压的是主注意力的 KV cache 吗?
> 图右侧的放大框里, 「Context Hidden States」 分出两路: 一路进 「KV Cache」, 直接接到顶上的 「Attention」; 另一路是 「Indexer Keys」, 经过 「4x Pooling」 进 「Indexer Cache」, 再进 「Indexer」. 所以 「4x Pooling」 压的是索引器用的 key, 不是主注意力的 KV cache. 这和文字 「reduces indexer latency and memory overhead」 的主语一致: 省的是索引器那一侧的延迟和显存. 图上 Indexer 接 「TopK」, 再接 「KV Block Selection」, 说明稀疏注意力选的是 KV 块, 不是单个位置. 文字里没有 「block」 这个词, 这一点只有图上有.

In our published comparison, GLM-5.3-Flash achieves approximately:

在我们公布的对比中, GLM-5.3-Flash 大约做到了:

a 3.0× reduction in attention compute compared with GLM-5.3;

和 GLM-5.3 相比, 注意力计算量降低约 3.0 倍;

a 4.4× reduction in KV-cache size compared with GLM-5.3.

和 GLM-5.3 相比, KV cache 大小降低约 4.4 倍.

![Image block](images/p02-image.png)

(图: 标题 「GLM-5.3-Flash Architecture」. 左半是整体堆叠, 自下而上: 输入端 「Image」 进 「ViT」, 「Text」 进 「Embedding」, 两路汇入一个 「mHC」; 往上是标 ×3 的浅蓝底块, 里面 「Linear Attention」 和 「MoE」 两个子层, 每个子层都由左侧一个 「mHC」 方框接出又接回; 再往上是标 ×1 的块, 子层换成 「IndexPool Sparse Attention」 和 「MoE」, 同样各配一个 「mHC」; 最上面是 「MTP Layer」 和黑底的 「LM Head」. 右半是浅紫底的放大框, 展开 IndexPool Sparse Attention: 底部 「Context Hidden States」 生成 「KV Cache」 和 「Indexer Keys」, 「Query Hidden State」 生成 「Indexer Query」 和 「Query」; Indexer Keys 经 「4x Pooling」 存成 「Indexer Cache」, 和 Indexer Query 一起进 「Indexer」, 再经 「TopK」 得到 「KV Block Selection」; 最后 KV Cache, 选中的块和 Query 一起进顶部的 「Attention」.)

![Chart block](images/p02-chart.png)

(图: 折线图, 标题 「Average Per-layer KV Cache Size vs. Sequence Length」, 即每层平均 KV cache 大小随序列长度的变化. 横轴 Sequence Length, 刻度 200K 到 1M; 纵轴 「Average KV-Cache per layer」, 刻度 0 到 600, 没有单位. 四条线: GLM-5.3 蓝色实线, 1M 处约 600; GLM-5.3-Flash 紫色实线, 1M 处约 150; Kimi-K3 绿色虚线, 略低于紫线; DeepSeek-V4 橙色虚线, 1M 处约 80. 右侧一个双向箭头连着蓝线和紫线在 1M 处的端点, 标 「3.80×」. 四条线都从原点出发, 近似直线.)

![Chart block](images/p02-it-has-the-lowest-attention-compute-among-the-models.png)

(图: 折线图, 标题 「Per-token Attention Compute vs. Token Position」, 即每个 token 的注意力计算量随 token 位置的变化. 横轴 Token Position, 0 到 1M; 纵轴 「Attention compute per token」, 0 到 140, 没有单位. 五条线: Kimi-K3 (Decode) 红色虚线最高, 1M 处约 147; Kimi-K3 (Prefill) 绿色虚线, 1M 处约 48; GLM-5.3 蓝色实线, 1M 处约 17; DeepSeek-V4 橙色虚线, 略低于蓝线; GLM-5.3-Flash 紫色实线最低, 1M 处约 5. 右下角双向箭头连着蓝线和紫线, 标 「3.40×」. 数值是按刻度目测的.)

> **看表:** 文字说注意力计算降 3.0 倍, 图上标的是 3.40×. 哪个对? 这是不是和 GLM-5.3 唯一能比的一格?
> 两个数都印在页面上, 口径看起来不同. 图的纵轴是 「每个 token」 的计算量, 3.40× 标在横轴 1M 的位置, 是最长上下文那一点的比值. 文字是 「approximately 3.0×」, 没说在哪个位置取值, 也没说是不是在整段长度上平均. 如果 GLM-5.3-Flash 的曲线在短位置有一段不随长度增长的固定开销 (线性注意力那部分就是这种形状), 越往前比值越小, 整段平均下来会低于 1M 处的 3.40, 这可以解释 3.0 和 3.40 的差. 但这是推断, 页面没写. 至于和 GLM-5.3 的比较: 全页直接拿 GLM-5.3 作对照的, 只有这两句文字 (注意力计算 3.0×, KV cache 4.4×) 和这两张折线图里的蓝线. 第 3 页的智能体基准表对照的是 GLM-5.2, 第 4 页的多模态表只有 GLM-5.3-Flash 一列, 都没有 GLM-5.3 的格子.

> **再看:** KV cache 这边, 文字是 4.4×, 图上是 3.80×, 差得更多. 能对上吗?
> 对不上, 但可能是统计范围不同. 图的标题写的是 「Average Per-layer」, 每层平均; 文字写的是 「KV-cache size」, 没说是每层还是整个模型. 整个模型的 KV cache 约等于每层平均乘以层数. 如果 GLM-5.3 的层数比 45 多, 总量的比值就会比每层的比值大: 3.80 × (GLM-5.3 层数 / 45) = 4.4 时, GLM-5.3 约 52 层. 这个数只是反推, 本页没有给 GLM-5.3 的层数, 这个解释无法在本页验证. 能确定的只有: 两个数都来自作者自己公布的对比, 引用时要带上口径, 写 「文字称约 4.4 倍, 图中每层平均在 1M 处为 3.80 倍」.

It has the lowest attention compute among the models included in our comparison. Its KV-cache footprint remains slightly larger than that of some comparable Flash-class models, leaving room for further optimization.

在我们对比的模型里, 它的注意力计算量最低. 它的 KV cache 占用仍略大于一些同级的 Flash 类模型, 还有继续优化的空间.

> **核对:** 图里谁是 「comparable Flash-class models」? 「slightly larger」 和图上的差距相符吗?
> 图例里除了两个 GLM, 只有 Kimi-K3 和 DeepSeek-V4, 名字里都没有 「Flash」. 文字没点名, 从 KV cache 图看, 线在紫线下方的就是这两条, 只能推断 「Flash-class」 指的是它们, 意思是同一档规模的模型, 不是名字带 Flash. 差距按目测: 1M 处 GLM-5.3-Flash 约 150, Kimi-K3 约 135, 确实只略大; DeepSeek-V4 约 80, GLM-5.3-Flash 接近它的两倍, 用 「slightly」 形容偏轻. 「lowest attention compute」 在注意力图上成立, 紫线全程最低. 另外, 注意力图里 Kimi-K3 分了 Decode 和 Prefill 两条线, 其他模型只有一条, 页面没说 GLM-5.3-Flash 那条线对应哪个阶段.

<!-- page 3 of 7 -->

Together with our multimodal training corpus, these architectural changes enable GLM-5.3-Flash to deliver more capability with less compute.

结合我们的多模态训练语料, 这些架构改动让 GLM-5.3-Flash 用更少的算力提供更强的能力.

> **停一下:** 标题和这句里的 「less compute」 到底指训练还是推理? 有没有 「推理时多想几步」 的意思?
> 指推理更省算力. 这句话收束的是第 2 页整节 「Architecture for Efficient Inference」, 前面列的是激活参数 32B 到 18B, 层数 92 到 45, 注意力计算 3.0×, KV cache 4.4×, 全是推理侧的量. 训练算力页面一个数都没给, 只有 30T token 的语料总量. 页面也没有任何一处说推理时增加步数或多生成思考内容, 所以 「less compute」 就按字面写成更省算力, 不往别的方向引申. 句子把 「多模态训练语料」 和架构改动并列当原因, 语料影响的是 「more capability」 那一半, 省算力那一半靠的是架构.

**Complex Tasks and Agentic Performance**

**复杂任务与智能体表现**

In our published evaluations, GLM-5.3-Flash outperforms GLM-5.2 across coding, tool use, automation, and professional-work benchmarks.

在我们公布的评测中, GLM-5.3-Flash 在编程, 工具调用, 自动化和专业工作几类基准上都超过了 GLM-5.2.

<table><tbody><tr><td rowspan=「2」>Benchmark</td><td rowspan=「2」>GLM-5.3-Flash</td><td rowspan=「2」>GLM-5.2</td><td rowspan=「2」>复制</td></tr><tr></tr><tr><td>Terminal Bench 2.1</td><td>84.3</td><td colspan=「2」>81.0</td></tr><tr><td>DeepSWE v1.1</td><td>63.4</td><td colspan=「2」>46.2</td></tr><tr><td>NL2Repo</td><td>56.3</td><td colspan=「2」>48.9</td></tr><tr><td>Toolathlon Verified</td><td>78.4</td><td colspan=「2」>59.9</td></tr><tr><td>AutomationBench v1.0.6</td><td>48.8</td><td colspan=「2」>26.2</td></tr><tr><td>Agents' Last Exam</td><td>26.3</td><td colspan=「2」>20.4</td></tr><tr><td>HLE with Tools</td><td>55.3</td><td colspan=「2」>54.7</td></tr><tr><td rowspan=「2」>GDPval-AA v2</td><td rowspan=「2」>1773</td><td rowspan=「2」 colspan=「2」>1504</td></tr><tr></tr></tbody></table>

| 基准 | GLM-5.3-Flash | GLM-5.2 | 差值 |
| --- | --- | --- | --- |
| Terminal Bench 2.1 | 84.3 | 81.0 | +3.3 |
| DeepSWE v1.1 | 63.4 | 46.2 | +17.2 |
| NL2Repo | 56.3 | 48.9 | +7.4 |
| Toolathlon Verified | 78.4 | 59.9 | +18.5 |
| AutomationBench v1.0.6 | 48.8 | 26.2 | +22.6 |
| Agents' Last Exam | 26.3 | 20.4 | +5.9 |
| HLE with Tools | 55.3 | 54.7 | +0.6 |
| GDPval-AA v2 | 1773 | 1504 | +269 |

(中文表: 前三列照抄页面, 「差值」 一列是按页面数字算的, 页面没有这一列.)

> **看表:** 表头第四格 「复制」 是一个模型吗? GLM-5.2 的数为什么跨两列?
> 不是模型. PDF 第 3 页里 「复制」 是表格右上角的一个灰色小按钮, 点了复制整张表, 网页组件自带的. MinerU 把它识别成第四列表头, 于是 GLM-5.2 的每个数都被标成 colspan=「2」, 横跨 「GLM-5.2」 和 「复制」 两格; GDPval-AA v2 一行又多了 rowspan=「2」 和空行. 实际上这张表只有三列: 基准名, GLM-5.3-Flash, GLM-5.2. 8 行里 GLM-5.3-Flash 全部更高, 和上面 「outperforms GLM-5.2 across...」 的说法一致. 差距最小的是 HLE with Tools, 只高 0.6; 最大的是 AutomationBench, 高 22.6, 相对提升约 86%. GDPval-AA v2 的 1773 和 1504 不是百分数, 页面没说它是什么分制. 表头 「Agents' Last Exam」 的撇号, PDF 里是弯引号, md 换成了直引号.

These benchmarks evaluate underlying capabilities such as planning, tool use, environmental feedback, and multi-step execution. The same capabilities can support research, file processing, data analysis, content production, and business workflow automation—not only software development.

这些基准考察的是底层能力, 比如规划, 工具调用, 利用环境反馈, 多步执行. 同样的能力也能用在研究, 文件处理, 数据分析, 内容生产和业务流程自动化上, 不只是软件开发.

All figures above come from our published evaluations. Actual performance may vary with inference settings, tools, execution frameworks, and evaluation environments.

以上数字都来自我们公布的评测. 实际表现会随推理设置, 工具, 执行框架和评测环境而变化.

> **问:** 「our published evaluations」 发表在哪? 推理设置和框架是什么?
> 页面没有链接, 也没有附录. 8 个基准的版本号印了几个 (Terminal Bench 2.1, DeepSWE v1.1, AutomationBench v1.0.6, GDPval-AA v2), 但每项用什么智能体框架, 最大轮数, 温度, 是否开思考模式, 跑了几次取平均, 都没写. 这句免责说明等于承认换一套设置分数会变, 所以这张表只能当作者自报的一组数来引用, 不能和别处不同设置下的分数直接相减.

**Native Multimodal Intelligence**

**原生多模态智能**

GLM-5.3-Flash learns text and visual information together from the pre-training stage, supporting text, images, video, and files.

GLM-5.3-Flash 从预训练阶段起就同时学习文本和视觉信息, 支持文本, 图像, 视频和文件.

> **回看:** 这里说支持文本, 图像, 视频和文件, 第 2 页架构图的输入端对得上吗? 「第一个原生多模态」 怎么理解?
> 图的输入端只画了两路: 「Image」 进 「ViT」, 「Text」 进 「Embedding」. 视频和文件怎么进模型, 图上没画, 文字也没说 (比如视频是不是按帧走 ViT, 文件是渲染成图还是抽文本). 第 1 页 「first natively multimodal model in the GLM-5 family」 里的 「natively」, 这一句给了定义: 从预训练阶段就把文本和视觉一起学. 家族目录里还有 glm-5v-turbo, 本页没提它; 按这句的定义, 「第一个」 说的是预训练阶段就联合学习的模型, 不是说此前家族里没有能看图的模型. 这是按字面推的, 页面没做比较.

Native multimodal training allows the model to interpret document structure, charts, interface state, layout relationships, and operational feedback, then use that information in subsequent

原生多模态训练让模型能理解文档结构, 图表, 界面状态, 版面关系和操作反馈, 再把这些信息用到后续的

<!-- page 4 of 7 -->

reasoning and execution.

推理和执行中. (这一句在 PDF 第 3 页末尾断开, 第 4 页开头接上.)

| Benchmark | GLM-5.3-Flash复制 |
| --- | --- |
| OfficeQA Pro | 62.4 |
| CharXiv Reasoning with To | 89.4 |
| ols |  |
| Chartography with Tools | 78.0 |
| BabyVision | 53.4 |
| MVBench | 77.8 |
| MMVU | 80.5 |

| 基准 | GLM-5.3-Flash |
| --- | --- |
| OfficeQA Pro | 62.4 |
| CharXiv Reasoning with Tools | 89.4 |
| Chartography with Tools | 78.0 |
| BabyVision | 53.4 |
| MVBench | 77.8 |
| MMVU | 80.5 |

(中文表: 把被拆成两行的 CharXiv 一项合并, 去掉表头里的 「复制」 按钮文字.)

> **确认:** 「CharXiv Reasoning with To」 和下一行 「ols」 是两项吗? 这张表能和 GLM-5.3 或 GLM-5.2 比吗?
> 是一项. PDF 文字层就是 「CharXiv Reasoning with To」 换行 「ols」, 分数 89.4 在 「ols」 之后, 网页单元格太窄把 「Tools」 折成了两行, MinerU 当成了两行表格. 合起来是 「CharXiv Reasoning with Tools」, 89.4. 表头 「GLM-5.3-Flash复制」 同样粘上了复制按钮. 所以实际是 6 个基准, 不是 7 个. 这张表只有 GLM-5.3-Flash 一列, 没有 GLM-5.3, GLM-5.2 或任何别家的对照分, 也没说满分和指标. 页面没有给出这 6 项与 GLM-5.3 对比的格子.

**Bringing Visual Feedback into the Workflow**

**把视觉反馈带进工作流**

Visual understanding goes beyond recognizing what appears in an image. It allows the model to inspect the outcome of its work and determine what should happen next.

视觉理解不止是认出图里有什么. 它让模型能检查自己工作的结果, 判断下一步该做什么.

For documents and presentations, the model can inspect rendered pages, evaluate information hierarchy, chart clarity, image cropping, alignment, and visual consistency, then continue refining the result.

对文档和演示文稿, 模型可以检查渲染出来的页面, 评估信息层级, 图表是否清楚, 图片裁切, 对齐和视觉一致性, 然后继续改进结果.

For data-analysis tasks, it can interpret both the underlying data and its visual presentation, checking whether a chart communicates the intended conclusion and whether data definitions remain consistent.

对数据分析任务, 它既能读底层数据, 也能读数据的可视化呈现, 检查图表是否传达了想要的结论, 数据口径是否前后一致.

For product and interface work, the model can observe the current state of a webpage or application, understand its structure and workflow, and translate visual findings into experience analysis, recommendations, or follow-up tasks.

对产品和界面工作, 模型可以观察网页或应用的当前状态, 理解它的结构和流程, 把视觉上的发现转成体验分析, 改进建议或后续任务.

Across multi-step workflows, visual feedback can also help the model determine whether an operation succeeded and select the next appropriate action. Vision therefore becomes part of execution and verification rather than a separate input capability.

在多步工作流里, 视觉反馈还能帮模型判断一次操作是否成功, 并选出下一步合适的动作. 因此视觉成了执行和验证的一部分, 不再只是一项单独的输入能力.

**Multimodal Intelligence for Professional Work**

**面向专业工作的多模态智能**

A large share of professional work involves heterogeneous visual and structured information, including documents, spreadsheets, presentations, dashboards, interfaces, and meeting artifacts.

专业工作里很大一部分涉及异构的视觉信息和结构化信息, 包括文档, 表格, 演示文稿, 仪表盘, 界面和会议产物.

<!-- page 5 of 7 -->

GLM-5.3-Flash can decompose complex objectives, use tools, inspect results, and continue improving its output across the workflow—from source-material analysis to finished professional deliverables.

GLM-5.3-Flash 能拆解复杂目标, 调用工具, 检查结果, 并在整个流程里持续改进输出, 从分析原始材料一直做到成品级的专业交付物.

For office tasks, the model can work with PPTX, PDF, DOCX, and XLSX files. In addition to generating content, it can inspect information structure, visual style, charts, image cropping, and page layout through rendered output. This allows it to identify text overflow, misalignment, overlapping elements, and inconsistent styling.

对办公任务, 模型可以处理 PPTX, PDF, DOCX 和 XLSX 文件. 除了生成内容, 它还能通过渲染结果检查信息结构, 视觉风格, 图表, 图片裁切和页面版式, 从而发现文字溢出, 没对齐, 元素重叠和样式不统一.

For research and analysis, the model can organize public information, business materials, and structured data; distinguish known facts from assumptions and analysis; and turn the result into reports, presentations, spreadsheets, and other professional deliverables.

对研究和分析, 模型可以整理公开信息, 业务材料和结构化数据, 区分已知事实和假设, 分析, 再把结果做成报告, 演示文稿, 表格等专业交付物.

For meetings and collaboration, it can work across meeting materials, notes, and existing files to organize decisions, action items, and supporting context, then continue developing an executable plan.

对会议和协作, 它可以在会议材料, 笔记和已有文件之间来回处理, 整理出决策, 待办事项和相关背景, 再继续推进成可执行的计划.

**Serving at Scale on Chinese AI Chips**

**在国产 AI 芯片上大规模服务**

We have served real-world GLM-5.3-Flash traffic on a large-scale cluster of Chinese AI accelerators. To address memory and bandwidth constraints, we developed an inference engine optimized for the model’s architecture.

我们已经在一个大规模国产 AI 加速器集群上承接了 GLM-5.3-Flash 的真实流量. 为了应对显存和带宽的限制, 我们开发了一个针对该模型架构优化的推理引擎.

Our serving stack incorporates intra-node tensor parallelism, ReplaySSM, W8A8 quantization, hybrid INT8/FP8/BF16 cache quantization, Layer Split, and an Encode–Prefill–Decode disaggregated architecture.

我们的服务栈包括: 节点内张量并行, ReplaySSM, W8A8 量化, INT8/FP8/BF16 混合的缓存量化, Layer Split, 以及编码, 预填充, 解码三段分离的架构.

With these optimizations, we achieved a threefold improvement in end-to-end serving performance compared with our initial baseline on the same hardware.

靠这些优化, 在同一套硬件上, 端到端服务性能比我们最初的基线提高到三倍.

> **拆开:** 服务栈六项里, 哪些在页面上有解释? 「threefold」 和第 2 页的 3.0× 是一回事吗?
> 六项都只列了名字. 节点内张量并行, W8A8 量化, INT8/FP8/BF16 混合缓存量化, 编码-预填充-解码分离是常见做法的名称, 字面能看懂; ReplaySSM 和 Layer Split 是页面自己的叫法, 没有解释. ReplaySSM 里的 SSM 让人联想到线性注意力的状态 (第 2 页 「state modeling」), 但页面没说两者的关系, 这里不猜. 「Encode」 一段多半对应架构图里给图像编码的 ViT, 同样是推断. 「threefold」 和第 2 页的 「3.0× reduction in attention compute」 不是一回事: 前者是整个服务系统相对自家初始基线的提升, 硬件相同, 模型相同; 后者是模型结构相对 GLM-5.3 的注意力计算量. 而且 「serving performance」 没说是吞吐, 延迟还是单卡并发, 基线是什么配置也没写.

The model’s efficiency comes from the combined design of its architecture, multimodal training corpus, inference stack, and underlying hardware—not from any single technique.

这个模型的效率来自架构, 多模态训练语料, 推理栈和底层硬件的联合设计, 不是靠某一项单独的技术.

**Open Weights and Deployment**

**开放权重与部署**

We have made the GLM-5.3-Flash model weights publicly available on Hugging Face under the MIT License.

我们已在 Hugging Face 上以 MIT 许可证公开了 GLM-5.3-Flash 的模型权重.

GLM-5.3-Flash currently supports inference frameworks including SGLang, vLLM, and TokenSpeed. Framework compatibility and deployment options may continue to evolve; refer to our official model repository for the latest information.

GLM-5.3-Flash 目前支持的推理框架包括 SGLang, vLLM 和 TokenSpeed. 框架兼容性和部署方式可能还会变化, 最新信息请看我们的官方模型仓库.

> **问:** Hugging Face 仓库叫什么? 部署要多少显存?
> 页面没给仓库名, 也没给链接. 「refer to our official model repository」 只是一句话, PDF 里这里没有超链接. 三个框架没写最低版本号, TokenSpeed 在页面上也没有介绍. 显存, 卡数, 精度 (BF16 还是量化权重) 都没写. 第 5 页服务栈里的 W8A8 和混合缓存量化是作者自己线上服务的配置, 页面没说公开的权重是哪种精度. 能照抄的只有三件事: 权重在 Hugging Face, 许可证 MIT, 三个框架名.

<!-- page 6 of 7 -->

GLM-5.3-Flash is now available in AutoClaw, bringing efficient native multimodal intelligence into real work.

GLM-5.3-Flash 现已上线 AutoClaw, 把高效的原生多模态智能带进真实工作.

**Download AutoClaw, let your AI avatar enter your chat**

**下载 AutoClaw, 让你的 AI 分身进入你的聊天**

Complete deployment in 5 minutes, supports Lark, WeCom, Telegram

5 分钟完成部署, 支持飞书 (Lark), 企业微信 (WeCom), Telegram.

**+ Download Now**

**+ 立即下载** (深色推广卡片里的橙色按钮.)

**Related Posts**

**相关文章**

Tackle complex tasks with Agent Cluster.

用 Agent Cluster 处理复杂任务. (这句是相关文章卡片左侧那张橙黑配色宣传图上的字, 不是正文.)

![Image block](images/p06-how-to-use-autoclaw-cluster-mode-start-with-these-5.png)

(图: 一个软件界面的截图, 上部被裁掉一半. 顶端露出三张缩略图卡片的下沿, 分别标 「App design」, 「Web design」, 「Slide layout」, 第三张里有黄底黑字 「OPEN CLAW ACP HARNESS」; 中间大片空白; 下部一排按钮: 「Add reference screenshots」, 「Upload project docs」, 「Provide a product link」, 「Add Figma MCP」, 最右一个被截断, 只露出 「Jimeng ima」; 最底部是输入框, 占位文字 「Send to Design Expert」. 右侧有一条灰色竖边. 图里没有数据.)

> **对一下:** 这张图的文件名 p06-how-to-use-autoclaw-cluster-mode-start-with-these-5.png 对得上吗? 上面那句 「Tackle complex tasks with Agent Cluster.」 从哪来?
> 文件名来自图后面那篇相关文章的标题 「How to Use AutoClaw Cluster Mode: Start with These 5 Types of Complex Tasks」, 和图所在的卡片是同一篇, 这一张对得上. 但卡片的配图在 PDF 里是左右两块: 左边是橙黑大字 「Tackle complex tasks with Agent Cluster.」 的宣传图, 右边才是这张界面截图. MinerU 只把右边存成了图片, 左边那张图上的字被识别成了一行正文. PDF 第 6 页的文字层里没有 「Tackle complex tasks」 这句, 可以印证它原本是图里的字. 另外, 截图里的 「Design Expert」 和那排按钮, 看起来是 Cluster Mode 里一个设计类角色的入口, 和 GLM-5.3-Flash 本身无关.

[**How to Use AutoClaw Cluster Mode: Start with These 5 Types of Complex Tasks**](https://autoclaw.z.ai/blog/product/autoclaw-cluster-mode/)

[**如何使用 AutoClaw 集群模式: 从这 5 类复杂任务开始**](https://autoclaw.z.ai/blog/product/autoclaw-cluster-mode/)

[AutoClaw offers two modes. Standard Mode answers quick questions instantly. Cluster Mode handles complex work by splitting tasks into steps and assigning specialist roles. Cluster Mode excels at research, document synthesis, data analysis, event planning, and content production. It turns scattered inputs into polished reports and verified deliverables.Speed for simple queries. A dedicated team for serious work.](https://autoclaw.z.ai/blog/product/autoclaw-cluster-mode/)

[AutoClaw 提供两种模式. 标准模式即时回答简单问题. 集群模式把复杂工作拆成步骤, 分派给不同的专业角色. 集群模式擅长研究, 文档综合, 数据分析, 活动策划和内容生产, 能把零散的输入变成成型的报告和经过核验的交付物. 简单问题求快, 严肃工作配一个专门团队.](https://autoclaw.z.ai/blog/product/autoclaw-cluster-mode/) (原文 「deliverables.Speed」 句号后缺空格, PDF 里也是这样.)

> **回看:** 第 1 页横幅写 「Coming to AutoClaw」, 第 6 页写 「now available in AutoClaw」. 哪个是抓取时的状态?
> 两处时态不同, 页面没解释. 横幅是一张预先做好的宣传图, 写的是 「即将上线」; 第 6 页是正文, 写的是 「现已上线」. 最可能的情况是配图沿用了预热时的素材, 正文按发布当天的状态写. 按页面能确认的是正文那句: 发布时 GLM-5.3-Flash 已在 AutoClaw 中可用. 横幅的 「Coming to」 不能当作抓取时还没上线的证据.

<!-- page 7 of 7 -->

© 2026 AutoClaw by AutoGLM

© 2026 AutoClaw, 出品方 AutoGLM.

[AutoClaw Privacy Policy](https://autoclaw.z.ai/privacy/md2html/?md=autoclaw_privacy&favicon=autoglm) [AutoClaw Terms of Service](https://autoclaw.z.ai/privacy/md2html/?md=autoclaw_agreement&favicon=autoglm)

页脚链接: [AutoClaw 隐私政策](https://autoclaw.z.ai/privacy/md2html/?md=autoclaw_privacy&favicon=autoglm), [AutoClaw 服务条款](https://autoclaw.z.ai/privacy/md2html/?md=autoclaw_agreement&favicon=autoglm).

> **想:** 全文 5 张图, 文件名和位置逐一对过了吗?
> 对过. 第 1 页 1 张: p01-we-trained-glm-5-3-flash-from-a-new-base-model-and.png, 是宣传横幅, 文件名取自后一段正文, 内容对不上名字. 第 2 页 3 张: p02-image.png 是架构图; p02-chart.png 是每层平均 KV cache 折线图; p02-it-has-the-lowest-attention-compute-among-the-models.png 是注意力计算折线图, 名字取自图后那句 「It has the lowest attention compute...」, 恰好和图的内容一致. PDF 里这三张是一整块: 架构图在左, 两张折线图在右上下叠放, KV cache 在上, 注意力在下, md 的顺序和它一致. 第 6 页 1 张: p06-how-to-use-autoclaw-cluster-mode-start-with-these-5.png, 是相关文章卡片右半的界面截图. 第 3, 4, 5, 7 页没有图, 两张基准表是网页表格, 不是图片. images 目录里正好这 5 个文件, 没有多余, 也没有缺.
