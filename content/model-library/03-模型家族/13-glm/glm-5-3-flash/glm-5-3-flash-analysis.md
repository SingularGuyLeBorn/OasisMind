---
title: "GLM-5.3-Flash：一篇发布博客里能读出的参数，结构和对照"
category: "模型库"
tags: ["GLM", "技术解析"]
published: true
excerpt: "总参数 320B 全文只出现一次，在第 1 页导语：「With 320B total parameters and only 18B active parameters」。"
---
> 源文 `glm-5-3-flash.md` 是 AutoClaw 博客一篇发布文章的 MinerU 抓取，7 页，5 张图，正文约五分钟读完。能用的是一段架构说明，一张架构图，两张效率折线图，一张 8 行和一张 6 行的基准表，其余是能力描述和产品推广。

# GLM-5.3-Flash：一篇发布博客里能读出的参数，结构和对照

来源：同目录 `glm-5-3-flash.md`，对照同目录 `glm-5-3-flash.pdf`（PDF 生成时间 2026-09-25）。逐段英中对照和疑点见 `glm-5-3-flash-bi.md`。下文的数字都出自这篇博客的正文，两张基准表和第 2 页的三张图；引到 `glm-4-5` 目录论文的地方注明 「GLM-4.5 论文」，只作核对。`glm-5-3` 目录那篇博客不在本文范围内，下文说到 GLM-5.3，只指本页拿它作对照的那几处。

## 1. 材料是什么

源文是 AutoClaw 博客上的一篇文章，分类 model，标题 「GLM-5.3-Flash: More Intelligence with Less Compute」，发布日期 2026 年 9 月 25 日，作者栏写 AutoClaw Team，站点标注阅读时长 5 分钟。PDF 打印成 7 页，5 张图。第 1 页是导航，标题，导语和一张宣传横幅；第 2 页是架构一节，含一张架构图和两张折线图；第 3 页是智能体基准表和原生多模态的开头；第 4, 5 页是多模态表，视觉反馈，专业工作，服务部署和开放权重；第 6 页是上线说明，下载推广和一篇相关文章；第 7 页只有页脚。

这是一篇发布博客，不是技术报告。它给出了总参数，激活参数，层数，注意力结构，语料规模，两组效率比值和两张基准表，但没有专家数，隐藏维度，注意力头数，训练步数，训练算力，也没有评测设置。所以下文能做的事有两类：一是把页面上的数和图互相对齐，找出一致和不一致的地方；二是讲清楚哪些结论页面支持，哪些页面没写。页面没写的，不从别处补。

## 2. 320B 和 18B：两个数各在哪里

总参数 320B 全文只出现一次，在第 1 页导语：「With 320B total parameters and only 18B active parameters」。激活参数 18B 出现两次，一次就在这句，另一次在第 2 页架构节：「it reduces the number of active parameters from 32B to 18B and the number of layers from 92 to 45」。两个数是两种口径：320B 是模型里全部参数的总量，决定存权重要多大的空间；18B 是每处理一个输入实际参与计算的参数，决定每一步前向要做多少乘加。MoE 模型总参数大，激活参数小，这两个数放在同一句里报是常规写法。

页面拿来比的是 GLM-4.5 系列，说它 「has a similar total parameter count」。本页没印 GLM-4.5 的总参数。GLM-4.5 论文表 1 给的是总参数 355B，激活 32B，3 层 dense 加 89 层 MoE 共 92 层，外加 1 层 MTP. 32B 和 92 层和本页对得上。320B 比 355B 少约 10%，算得上相近。激活参数从 32B 降到 18B，少 43.75%；层数从 92 降到 45，少约 51%。按各自总参数折算，GLM-4.5 每次激活约 9.0%，GLM-5.3-Flash 约 5.6%。这组比例是用两份材料的数算的，博客自己没写。页面没给专家总数和每次激活的专家数，18B 由哪些部分组成，本页查不到。

## 3. 架构图读出来的结构

第 2 页的架构图是全篇结构信息最多的地方。左半自下而上：图像进 ViT，文本进 Embedding，两路汇入第一个 mHC 方框；往上是标 ×3 的一组，子层是 Linear Attention 和 MoE；再往上是标 ×1 的一组，子层是 IndexPool Sparse Attention 和 MoE；每个子层旁边都配一个 mHC，由它接出又接回；最顶上是 MTP Layer 和 LM Head。按图的字面，是 3 层线性注意力配 1 层稀疏注意力，每层的前馈部分都是 MoE。

图上的 mHC 在正文只对应一句话：「adopts Manifold-Constrained Hyper-Connections to improve scaling efficiency」。从字母看，mHC 就是它的缩写，但页面没把二者明写成一回事，也没解释它和普通残差连接有什么区别。那句话说的是 「scaling efficiency」，即模型规模或训练规模扩大时的效率，和本文后面讲的推理省算力不是同一件事，页面也没给它的任何数字。MTP Layer 在正文一次也没提到。GLM-4.5 论文把 MTP 层单列，且 92 层不含它；GLM-5.3-Flash 的 45 层含不含顶上这层 MTP，本页没说。

还有一处算不整。按 3 比 1, 4 层为一组，45 除以 4 等于 11.25。可能是首尾有不按比例排的层，可能 45 的计数口径和图不同，也可能 ×3 和 ×1 只是示意。页面没给线性层和稀疏层各有多少，这里不替它拆。能确定的只是：两种注意力按层交替排，线性注意力占多数。

## 4. 长上下文怎么省：线性注意力，稀疏注意力和 IndexPool

正文对两种注意力的分工写得很短。线性注意力 「captures local dependencies through state modeling」，用一个状态去承接前文；稀疏注意力 「uses a lightweight indexer to retrieve relevant information from the global context」，先用一个便宜的索引器挑出和当前位置相关的内容，再只对挑中的部分做注意力。前者管近处，后者管远处，这是页面自己给的说法。

架构图右半的放大框把稀疏注意力画得更细。上下文的隐状态分两路：一路存成 KV Cache，直接接到顶部的 Attention；另一路生成 Indexer Keys，经过 4x Pooling 存进 Indexer Cache。当前位置的隐状态也分两路：Indexer Query 和 Query. Indexer 用 Indexer Query 在 Indexer Cache 里打分，经 TopK 得到 KV Block Selection，最后 Query 只和选中的 KV 块做注意力。图上写的是 「Block」，说明选的单位是一段连续的 KV，不是单个位置；正文没有 block 这个词。

IndexPool 在正文里的描述是：在最长一百万 token 的上下文里，通过加权池化把四个缓存的 key 向量压成一个，降低索引器的延迟和显存开销。对照图，4x Pooling 作用在 Indexer Keys 上，不作用在主注意力的 KV Cache 上。所以 IndexPool 省的是索引器那一侧：索引器要扫的 key 少了四分之三，索引器缓存也小了四分之三。主注意力那一侧，稀疏注意力只取选中的块参与计算，省的是计算量；KV cache 变小，按结构推断主要来自线性注意力层用状态代替完整的 KV，页面没有明说。3.0 倍和 4.4 倍里各有多少来自哪一项，页面也没有拆开。

## 5. 和 GLM-5.3 能比的只有两格

全页直接拿 GLM-5.3 作对照的，只有第 2 页列表里的两句和两张折线图中的蓝线。第 3 页的智能体基准表对照的是 GLM-5.2；第 4 页的多模态表只有 GLM-5.3-Flash 一列。换句话说，本页没有任何一个基准分数能和 GLM-5.3 比，能比的只是注意力计算量和 KV cache 大小这两项效率指标。

这两项的文字和图数不一致。注意力计算：文字写 「approximately 3.0× reduction」，图 「Per-token Attention Compute vs. Token Position」 在横轴 1M 处标 3.40×. KV cache：文字写 「4.4× reduction in KV-cache size」，图 「Average Per-layer KV Cache Size vs. Sequence Length」 在 1M 处标 3.80×。两对数不一致的方向相反：注意力是文字小于图，KV cache 是文字大于图。

两处差异都可能来自口径。注意力图取的是 1M 这一点的每 token 计算量；如果 GLM-5.3-Flash 的曲线在短位置有一段固定开销，比值会随位置增大，在整段长度上平均就会低于 3.40，落到 3.0 附近是可能的。KV cache 图是每层平均，文字没说是每层还是整个模型；整个模型的 KV cache 等于每层平均乘层数，如果 GLM-5.3 层数多于 45，总量比值就会大于每层比值，按 3.80 × (L / 45) = 4.4 反推，L 约为 52。这两个解释都只是推断，页面没有交代取值方法，也没有给 GLM-5.3 的层数。引用时最稳妥的写法是把口径带上：文字称注意力计算约降 3.0 倍，KV cache 约降 4.4 倍；图中 1M 处分别为 3.40 倍和每层 3.80 倍。

两张图还有几处可读的信息。注意力图里 GLM-5.3-Flash 的紫线全程最低，1M 处目测约 5，GLM-5.3 约 17，DeepSeek-V4 略低于 GLM-5.3，Kimi-K3 分成 Decode 和 Prefill 两条，分别约 147 和 48；正文 「the lowest attention compute among the models included in our comparison」 在图上成立。只有 Kimi-K3 分了两个阶段，其他模型对应哪个阶段，页面没说。KV cache 图里 1M 处 GLM-5.3 约 600，GLM-5.3-Flash 约 150，Kimi-K3 约 135，DeepSeek-V4 约 80。正文承认 GLM-5.3-Flash 的 KV cache 「slightly larger than that of some comparable Flash-class models」。对 Kimi-K3 来说 「slightly」 说得通；对 DeepSeek-V4，GLM-5.3-Flash 接近它的两倍，用 「slightly」 偏轻。两张图的纵轴都没有单位，只能比倍数，不能读出绝对量。

## 6. 「Less Compute」 指的是更省算力

标题 「More Intelligence with Less Compute」 和第 3 页开头 「deliver more capability with less compute」 是同一个意思。这句话收束的是第 2 页 「Architecture for Efficient Inference」 整节，前面列的激活参数，层数，注意力计算量，KV cache，都是推理时的量。所以 「Less Compute」 就是推理更省算力：每处理一个 token 用到的参数更少，层更少，注意力更便宜，缓存更小。

页面没有任何一处说推理时多走了步，也没有说靠延长思考换分数。训练侧，页面只给了 30T token 的语料规模，没给训练算力，所以也不能说训练更省。第 3 页那句把 「多模态训练语料」 和架构改动并列成原因：语料对应 「more capability」，架构对应 「less compute」。第 5 页结尾又补了一句，效率来自架构，语料，推理栈和底层硬件的联合设计，「not from any single technique」。这句话把第 5 页的服务优化也算进了效率，但服务优化的 3 倍和第 2 页的 3.0 倍是两个层面的数，下面第 9 节再分开说。

## 7. 智能体基准：对照的是 GLM-5.2

第 3 页的表共 8 行，列是 GLM-5.3-Flash 和 GLM-5.2. md 里的第四列表头 「复制」 是网页表格右上角的复制按钮，不是模型；它让 GLM-5.2 的每个数都被标成跨两列。去掉这个假列之后，8 行 GLM-5.3-Flash 全部高于 GLM-5.2，和正文 「outperforms GLM-5.2 across coding, tool use, automation, and professional-work benchmarks」 一致。

逐行看差距：Terminal Bench 2.1 从 81.0 到 84.3，高 3.3，相对约 4.1%；DeepSWE v1.1 从 46.2 到 63.4，高 17.2，约 37.2%；NL2Repo 从 48.9 到 56.3，高 7.4，约 15.1%；Toolathlon Verified 从 59.9 到 78.4，高 18.5，约 30.9%；AutomationBench v1.0.6 从 26.2 到 48.8，高 22.6，约 86.3%；Agents' Last Exam 从 20.4 到 26.3，高 5.9，约 28.9%；HLE with Tools 从 54.7 到 55.3，只高 0.6，约 1.1%；GDPval-AA v2 从 1504 到 1773，高 269，约 17.9%，这一项不是百分数，页面没说分制。提升集中在 DeepSWE，工具调用和自动化三项；Terminal Bench 和 HLE with Tools 几乎持平。

这张表的边界也要写清楚。正文说这些基准考察的是规划，工具调用，环境反馈和多步执行，并说同样的能力可用于研究，文件处理，数据分析等工作；这是作者对基准含义的解释，表里没有对应这些场景的分数。表下还有一句免责说明：数字来自作者公布的评测，实际表现会随推理设置，工具，执行框架和评测环境变化。页面没有给这些设置，也没有链接到评测细节，所以表中分数只能作为作者自报的一组数引用。和 GLM-5.3 的对比，这张表给不了。

## 8. 原生多模态和视觉反馈

第 3 页给 「原生多模态」 下了定义：从预训练阶段起就同时学习文本和视觉信息。第 1 页 「first natively multimodal model in the GLM-5 family」 里的 「natively」 应按这个定义理解。页面说支持文本，图像，视频和文件，但架构图的输入端只画了图像进 ViT，文本进 Embedding 两路；视频按什么方式输入，文件是渲染成图还是抽取文本，图上没画，文字也没说。

第 4 页的多模态表只有 GLM-5.3-Flash 一列。md 把 「CharXiv Reasoning with Tools」 拆成了 「CharXiv Reasoning with To」 和 「ols」 两行，合并后实际是 6 项：OfficeQA Pro 62.4, CharXiv Reasoning with Tools 89.4, Chartography with Tools 78.0, BabyVision 53.4, MVBench 77.8, MMVU 80.5。表里没有对照模型，没有满分说明，也没说哪几项开了工具，只有名字里带 「with Tools」 的两项看得出来。这张表能说明的只有这 6 个数本身。

「Bringing Visual Feedback into the Workflow」 和 「Multimodal Intelligence for Professional Work」 两节是能力描述，没有数字。核心意思是把视觉用在执行和验证上：文档和演示文稿看渲染后的页面，查层级，图表，裁切，对齐；数据分析同时看数据和图表，查结论和口径；界面工作观察网页或应用的当前状态；多步流程里用视觉判断一步操作是否成功。第 5 页点名了 PPTX，PDF，DOCX，XLSX 四种文件，以及文字溢出，没对齐，元素重叠，样式不统一四类版面问题。这些都是作者描述的用法，页面没有给对应的评测。

## 9. 在国产加速器上服务，以及开放权重

第 2 页开头和第 5 页 「Serving at Scale on Chinese AI Chips」 一节都提到国产 AI 加速器：发布前以 Ox Alpha 的匿名身份在真实流量下评估，全部流量跑在国产加速器上；之后在大规模国产加速器集群上承接真实流量。厂商，型号，集群规模，页面都没写。为应对显存和带宽限制，作者做了针对该架构的推理引擎，服务栈包括节点内张量并行，ReplaySSM，W8A8 量化，INT8/FP8/BF16 混合缓存量化，Layer Split，以及编码，预填充，解码三段分离。

这六项只有名字。ReplaySSM 和 Layer Split 是页面自己的叫法，没有解释；编码一段多半对应 ViT 图像编码，这是推断。优化后的效果是 「在同一套硬件上，端到端服务性能比最初的基线提高到三倍」。这个 3 倍和第 2 页的注意力计算 3.0 倍不是一回事：前者是同一个模型，同一套硬件，服务系统相对自家初始基线的提升，而且没说是吞吐，延迟还是并发；后者是模型结构相对 GLM-5.3 的计算量比值。两个数不能相乘，也不能互相替代。

开放权重一节很短：权重已在 Hugging Face 以 MIT 许可证公开；推理框架支持 SGLang，vLLM 和 TokenSpeed；兼容性以官方模型仓库为准。页面没有仓库名，PDF 里这一节也没有超链接；框架没写版本号，部署没写显存和卡数，公开权重是什么精度也没写。第 5 页的 W8A8 和混合缓存量化是作者线上服务的配置，不能当作公开权重的格式。

## 10. 其余页面和五张图

第 6 页是产品推广。正文最后一句是 「GLM-5.3-Flash is now available in AutoClaw」。下面是下载卡片，写着 5 分钟完成部署，支持飞书，企业微信和 Telegram；再往下是一篇相关文章，讲 AutoClaw 的集群模式。第 7 页只有版权行 「© 2026 AutoClaw by AutoGLM」 和隐私政策，服务条款两个链接。这部分和模型能力无关，bi 文件里照原文译出，这里不展开讨论。

五张图的文件名是 MinerU 按邻近文字生成的，和内容的对应情况不一。第 1 页 p01-we-trained-glm-5-3-flash-from-a-new-base-model-and.png 取自后一段正文，实际是一张 「GLM-5.3-Flash Coming to AutoClaw」 的公牛宣传横幅，名字和内容对不上。第 2 页 p02-image.png 是架构图，p02-chart.png 是 KV cache 折线图，p02-it-has-the-lowest-attention-compute-among-the-models.png 是注意力计算折线图；最后这张的名字取自图后那句正文，恰好和图意一致。第 6 页 p06-how-to-use-autoclaw-cluster-mode-start-with-these-5.png 取自相关文章标题，是那张卡片右半的界面截图；卡片左半 「Tackle complex tasks with Agent Cluster.」 那张宣传图没有被存成图片，上面的字被识别成了正文。

横幅写 「Coming to」，第 6 页写 「now available」，时态不同。横幅是预先做好的素材，正文按发布当天的状态写，能确认的是正文：发布时模型已在 AutoClaw 上线。此外还有两处抓取瑕疵：第 2 页 「real-world」 在 PDF 里跨行断开，md 丢了连字符，写成 「realworld」；表头 「Agents' Last Exam」 的弯引号被换成了直引号。都不影响数字。

## 11. 读完这页能确定什么，不能确定什么

能确定的有这些：GLM-5.3-Flash 总参数 320B，激活 18B，45 层；相对 GLM-4.5 激活参数从 32B 降到 18B，层数从 92 降到 45；注意力由线性注意力和带 IndexPool 的稀疏注意力按层交替组成，前馈是 MoE，连接用 mHC；训练语料 30T token，多模态；最长上下文一百万 token；对 GLM-5.3 的注意力计算和 KV cache，文字称约 3.0 倍和 4.4 倍，图上标 3.40 倍和每层 3.80 倍；8 项智能体基准全部高于 GLM-5.2; 6 项多模态基准只有自身分数；权重 MIT 许可，在 Hugging Face 公开。

不能确定的有这些：专家数和 18B 的构成；45 层里线性层和稀疏层各多少，含不含 MTP；mHC 具体改了什么；3.0 和 3.40, 4.4 和 3.80 各自的取值口径；「Flash-class models」 指谁；评测设置；国产加速器的型号；ReplaySSM 和 Layer Split 是什么；服务性能 3 倍的指标；公开权重的精度和仓库地址。这些要等官方模型仓库或技术报告，这篇博客给不了。和 GLM-5.3 的基准对比，本页也给不了，只能比效率。
