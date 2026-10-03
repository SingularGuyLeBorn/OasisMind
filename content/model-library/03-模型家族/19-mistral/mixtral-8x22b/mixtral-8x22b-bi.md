---
title: "Mixtral 8x22B · 对照译稿"
category: "模型库"
tags: ["Mistral", "对照译稿"]
published: true
excerpt: "Mixtral 8x22B 公开材料的逐段中英对照译稿，附读报告时的疑问块。"
---
源文是 Mistral AI 官网 Mixtral 8x22B 发布页的打印件, 共 7 页, 正文只有发布词, 三张评测表和一张散点图, 其余是 cookie 横幅和站点导航. 本稿只对照这页印出来的内容, 不从 Mixtral 8x7B 或别的 Mistral 模型搬参数.

<!-- page 1 of 7 -->

# Cheaper, Better, Faster, Stronger

这是 Mistral AI 官网的一篇 RESEARCH 栏目文章, 标题直译是 「更便宜, 更好, 更快, 更强」. 转出的 Markdown 被 cookie 横幅切得很碎, 下面的英文按 PDF 文字层还原, 每页只保留正文.

April 17, 2024. By Mistral AI team.

2024 年 4 月 17 日, 作者署名 Mistral AI team.

> **想:** April 17, 2024 是发布日, 那第 7 页页脚的 2026 又是什么?
> 按发布日读, 它挨着标题印在页头. 第 7 页的 「Mistral AI © 2026」 是抓页时的站点页脚, 和这篇公告不是同一个时间.

Mixtral 8x22B is our latest open model. It sets a new standard for performance and efficiency within the AI community. It is a sparse Mixture-of-Experts (SMoE) model that uses only 39B active parameters out of 141B, offering unparalleled cost efficiency for its size.

Mixtral 8x22B 是我们最新的开放模型, 在 AI 社区里给性能和效率定了新标准. 它是一个稀疏 MoE (SMoE) 模型, 总参数 141B, 每次只用其中 39B 激活参数, 在同等规模里成本效率无出其右.

> **问:** 「39B active parameters」 在这页里是按什么口径算的?
> 页面没有定义. 能读出的只有两个印出来的数: 总参数 141B, 激活参数 39B. 每个 token 经过几个专家, 专家怎么选, 这页一个字也没写.

Mixtral 8x22B comes with the following strengths:

- It is fluent in English, French, Italian, German, and Spanish
- It has strong mathematics and coding capabilities
- It is natively capable of function calling; along with the constrained output mode implemented on la Plateforme, this enables application development and tech stack modernisation at scale
- Its 64K tokens context window allows precise information recall from large documents

Mixtral 8x22B 有这几项长处:

- 英语, 法语, 意大利语, 德语, 西班牙语都说得流利
- 数学和代码能力强
- 原生支持 function calling; 配合 la Plateforme 上的受约束输出模式, 可以支撑大规模的应用开发和技术栈改造
- 上下文窗口 64K token, 能从长文档里准确找回信息

> **核对:** 64K 具体是多少 token?
> 原文只印了 64K tokens. 按 1K = 1,024 算是 65,536, 按 1K = 1,000 算是 64,000, 页面没说用哪种. function calling 和受约束输出也只有一句描述, 没有任何评测数.

## Truly open (真正开放)

This heading closes page 1. The same cookie consent banner, certified by axeptio, covers the lower left of every page. It says cookies are used to measure the audience and send quality content and advertisement, and lists Google Analytics 4 and Hubspot with Close, Accept all and Next buttons.

这个小标题是第 1 页最后一行. 每页左下都盖着同一个 axeptio 认证的 cookie 横幅, 说网站用 cookie 统计访问量, 推送内容和广告, 列了 Google Analytics 4 和 Hubspot 两项, 下面是 Close, Accept all, Next 三个按钮. 后面各页不再重复描述.

<!-- page 2 of 7 -->

We believe in the power of openness and broad distribution to promote innovation and collaboration in AI.

我们相信开放和广泛分发的力量, 它能推动 AI 领域的创新与协作.

We are, therefore, releasing Mixtral 8x22B under Apache 2.0, the most permissive open-source licence, allowing anyone to use the model anywhere without restrictions.

因此, 我们以 Apache 2.0 发布 Mixtral 8x22B. 这是最宽松的开源许可证, 任何人都可以在任何地方不受限制地使用这个模型.

## Efficiency at its finest (效率做到极致)

We build models that offer **unmatched cost efficiency for their respective sizes**, delivering the best performance-to-cost ratio within models provided by the community.

我们做的模型在**各自规模上都有无可比拟的成本效率**, 在社区提供的模型里性能成本比最好.

Mixtral 8x22B is a natural continuation of our open model family. Its sparse activation patterns make it faster than any dense 70B model, while being more capable than any other open-weight model (distributed under permissive or restrictive licenses). The base model's availability makes it an excellent basis for fine-tuning use cases.

Mixtral 8x22B 是我们开放模型家族的自然延续. 稀疏激活让它比任何 70B 稠密模型都快, 同时比其它任何开放权重模型都强 (不论许可证宽松还是严格). 基座模型也一并放出, 适合拿来做微调.

> **拆开:** 「faster than any dense 70B model」 在页面上有速度数据吗?
> 没有吞吐或延迟数字. 能拿来比的只有激活参数: 39B 对 70B, 约为 0.56 倍. 这只说明每个 token 参与计算的参数更少, 实际快多少要看部署方式, 这页没测.

> **确认:** 「more capable than any other open-weight model」 和第 4 页的表对得上吗?
> 不完全对得上. 括号里明确把严格许可证的模型也算进来, 而 CC-BY-NC 的 Command R+ 在 HellaSwag 上是 88.6%, 高于 Mixtral 8x22B 的 88.5%; Wino Grande 上是 85.4%, 高于 84.7%. 这两格在表里还是加粗的.

<!-- page 3 of 7 -->

![图 1 截图: MMLU 对激活参数与成本的散点图, 下半被 cookie 横幅遮住](images/p03-umber-of-active-parameters-here-are-our-cookies.png)

Figure 1: Measure of the performance (MMLU) versus inference budget tradeoff (number of active parameters). Mistral 7B, Mixtral 8x7B and Mixtral 8x22B all belong to a family of highly efficient models compared to the other open models.

图 1: 性能 (MMLU) 与推理预算 (激活参数量) 之间的权衡. 和其它开放模型相比, Mistral 7B, Mixtral 8x7B, Mixtral 8x22B 同属一个高效率的模型家族.

The plot uses "Performance (MMLU)" from 40% to 80% on the y-axis and "Active parameters / cost" from 0 to 110 on the x-axis. An orange triangle in the upper left is labelled "Best performance/cost ratio" and contains Mistral 7B, Mixtral 8x7B and Mixtral 8x22B. Outside it sit LLaMA 2 7B, LLaMA 2 13B, LLaMA 1 33B, LLaMA 2 70B, and Command R and Command R+, both marked CC-BY-NC license.

图的纵轴是 「Performance (MMLU)」, 从 40% 到 80%; 横轴是 「Active parameters / cost」, 从 0 到 110. 左上角的橙色三角标着 「Best performance/cost ratio」, 里面是 Mistral 7B, Mixtral 8x7B, Mixtral 8x22B 三个点. 三角外面是 LLaMA 2 7B, LLaMA 2 13B, LLaMA 1 33B, LLaMA 2 70B, 以及标注 CC-BY-NC license 的 Command R 和 Command R+.

> **回看:** LLaMA 2 7B, LLaMA 2 13B, LLaMA 1 33B 的 MMLU 是多少?
> 这三点只在图里出现, 三张表都没有它们. 目测大约是 44.5%, 55.7%, 56.8% (读图误差约 ±0.5), 只能当位置参考, 不能当印出来的分数引用.

## Unmatched open performance (开放模型里无可匹敌的性能)

The following is a comparison of open models on standard industry benchmarks.

下面是开放模型在业界常用基准上的对比.

### Reasoning and knowledge (推理与知识)

Mixtral 8x22B is optimized for reasoning.

Mixtral 8x22B 针对推理做了优化.

<!-- page 4 of 7 -->

The table of Figure 2 is an embedded image. On screen its header is cut off above the page top, but the full image in the PDF carries the header below. "Common sense and reasoning" spans MMLU to Arc C (25); "Knowledge" spans TriQA and NaturalQS. The bracket "CC-BY-NC license" covers Command R and Command R+.

图 2 的表是嵌入图片. 屏幕上表头被页顶切掉了, PDF 里完整的嵌入图带着表头, 下表照它录入. 「Common sense and reasoning」 覆盖 MMLU 到 Arc C (25), 「Knowledge」 覆盖 TriQA 和 NaturalQS. 竖括号 「CC-BY-NC license」 只括住 Command R 和 Command R+.

| Model | Active parameters | MMLU | HellaS | WinoG | Arc C (5) | Arc C (25) | TriQA | NaturalQS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LLaMA 2 70B | 70B | 69.9% | 87.1% | 83.2% | 86.0% | 85.1% | 77.57% | 35.5% |
| Command R | 35B | 68.2% | 87.0% | 81.5% | - | 66.5% | - | - |
| Command R+ | 104B | 75.7% | 88.6% | 85.4% | - | 71.0% | - | - |
| Mistral 7B | 7B | 62.47% | 83.1% | 78.0% | 77.2% | 78.1% | 68.8% | 28.1% |
| Mixtral 8x7B | 12.9B | 70.63% | 86.6% | 81.2% | 85.8% | 85.9% | 78.4% | 36.5% |
| Mixtral 8x22B | 39B | 77.75% | 88.5% | 84.7% | 91.3% | 91.3% | 82.2% | 40.1% |

Figure 2: Performance on widespread common sense, reasoning and knowledge benchmarks of the top-leading LLM open models: MMLU (Measuring massive multitask language in understanding), HellaSwag (10-shot), Wino Grande (5-shot), Arc Challenge (5-shot), Arc Challenge (25-shot), TriviaQA (5-shot) and NaturalQS (5-shot).

图 2: 主流开放大模型在常识, 推理和知识基准上的表现. 基准包括 MMLU (大规模多任务语言理解), HellaSwag (10-shot), Wino Grande (5-shot), Arc Challenge (5-shot), Arc Challenge (25-shot), TriviaQA (5-shot), NaturalQS (5-shot).

> **看表:** Command R 的 Arc C (25) 只有 66.5%, 为什么比它自己的 MMLU 还低?
> 同一列里其它模型都在 78% 到 91% 之间, LLaMA 2 70B 的 MMLU 69.9% 和 Command R 的 68.2% 很接近, Arc C (25) 却是 85.1% 对 66.5%. 表里没注这两格的来源, Command R 和 Command R+ 的 Arc C (5) 也是空的.

> **停一下:** 同一个 Arc Challenge, 25-shot 为什么没比 5-shot 高?
> LLaMA 2 70B 是 86.0% 对 85.1%, 25-shot 反而低 0.9; Mixtral 8x22B 两列都是 91.3%; Mistral 7B 和 Mixtral 8x7B 各高 0.9 和 0.1. 多给示例不一定加分, 页面也没解释两列的评测设置差在哪.

### Multilingual capabilities (多语言能力)

Mixtral 8x22B has native multilingual capabilities. It strongly outperforms LLaMA 2 70B on HellaSwag, Arc Challenge and MMLU benchmarks in French, German, Spanish and Italian.

Mixtral 8x22B 原生支持多语言. 在法语, 德语, 西班牙语, 意大利语的 HellaSwag, Arc Challenge, MMLU 上, 它明显强过 LLaMA 2 70B.

The table of Figure 3 is also an embedded image. On screen the cookie banner hides the row labels and the French and German columns; the full image shows four flag groups in the order France, Germany, Spain, Italy.

图 3 的表同样是嵌入图片. 屏幕上 cookie 横幅挡住了行名和法语, 德语两组列, 完整嵌入图里四组国旗依次是法国, 德国, 西班牙, 意大利, 下表按它录入.

| Model | FR Arc-C | FR HellaS | FR MMLU | DE Arc-C | DE HellaS | DE MMLU | ES Arc-C | ES HellaS | ES MMLU | IT Arc-C | IT HellaS | IT MMLU |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Mistral 7B | 44.2% | 63.9% | 50.6% | 39.7% | 58.4% | 49.6% | 43.9% | 64.8% | 51.4% | 41.2% | 60.8% | 51.3% |
| Mixtral 8x7B | 54.3% | 76.0% | 66.1% | 52.7% | 71.0% | 64.9% | 53.7% | 76.3% | 67.5% | 51.1% | 72.9% | 65.9% |
| Mixtral 8x22B | 59.1% | 79.2% | 75.1% | 57.1% | 75.9% | 74.1% | 58.4% | 79.9% | 75.7% | 55.3% | 77.1% | 75.8% |
| LLaMA 2 70B | 49.9% | 72.5% | 64.3% | 47.3% | 68.7% | 64.2% | 50.5% | 74.5% | 66.0% | 49.4% | 70.9% | 65.1% |

Figure 3: Comparison of Mistral open source models and LLaMA 2 70B on HellaSwag, Arc Challenge and MMLU in French, German, Spanish and Italian.

图 3: Mistral 开源模型与 LLaMA 2 70B 在法语, 德语, 西班牙语, 意大利语的 HellaSwag, Arc Challenge, MMLU 上的对比.

> **再看:** 图 3 的 Arc-C 只有 55% 到 59%, 图 2 的英文 Arc C 却是 91.3%, 差这么多正常吗?
> 两张表测的不是同一种设置. 图 3 没写 shot 数, 也没写题目是翻译版还是原生版. MMLU 在四种语言里是 74.1% 到 75.8%, 比英文 77.75% 只低 2 到 3.7 分, 差距主要落在 Arc-C 上.

### Maths & Coding (数学与代码)

This heading closes page 4.

这个小标题是第 4 页最后一行.

<!-- page 5 of 7 -->

Mixtral 8x22B performs best in coding and maths tasks compared to the other open models.

和其它开放模型相比, Mixtral 8x22B 在代码和数学任务上表现最好.

| Model | Active parameters | HumanE | MBPP | GSM8K maj@1 (5-shot) | GSM8K maj@8 (8-shot) | Math maj@4 |
| --- | --- | --- | --- | --- | --- | --- |
| LLaMA 2 70B | 70B | 29.3% | 49.8% | 53.6% | 69.6% | 13.8% |
| Command R | 35B | - | - | 56.6% | - | - |
| Command R+ | 104B | - | - | 70.7% | - | - |
| Mistral 7B | 7B | 26.22% | 50.2% | 36.5% | 50.0% | 12.7% |
| Mixtral 8x7B | 12.9B | 40.2% | 60.7% | 58.4% | 74.4% | 28.4% |
| Mixtral 8x22B | 39B | 45.1% | 71.2% | 78.6% | 88.4% | 41.8% |

表头上方还有两组分栏: HumanE 和 MBPP 归 「Coding」, 三列 GSM8K 与 Math 归 「Maths」. 竖括号 「CC-BY-NC license」 同样只括住 Command R 和 Command R+.

> **对一下:** LLaMA 2 70B 在这张表里算不算 CC-BY-NC?
> 不算. 转出的 Markdown 把 「CC-BY-NC license」 的合并格扩成了三行, 把 LLaMA 2 70B 也包了进去; 页面图里的竖括号只挨着 Command R 和 Command R+, 和图 2 一样. LLaMA 2 70B 用什么许可证, 这页没写.

Figure 4: Performance on popular coding and maths benchmarks of the leading open models: HumanEval pass@1, MBPP pass@1, GSM8K maj@1 (5 shot), GSM8K maj@8 (8-shot) and Math maj@4.

图 4: 主流开放模型在常用代码和数学基准上的表现: HumanEval pass@1, MBPP pass@1, GSM8K maj@1 (5 shot), GSM8K maj@8 (8-shot), Math maj@4.

> **想:** GSM8K 从 maj@1 的 78.6% 到 maj@8 的 88.4%, 这 9.8 分都是投票带来的吗?
> 拆不开. 两列同时变了投票数 (1 到 8) 和示例数 (5-shot 到 8-shot), 页面没给固定其中一项的对照. 这 9.8 分 只能算两个因素合在一起的效果.

The instructed version of the Mixtral 8x22B released today shows even better math performance, with a score of 90.8% on GSM8K maj@8 and a Math maj@4 score of 44.6%.

今天一同发布的 Mixtral 8x22B 指令版数学更好: GSM8K maj@8 是 90.8%, Math maj@4 是 44.6%.

> **问:** 指令版只报了两个数, 其它基准呢?
> 这页只给了这两项, 比基座版的 88.4% 和 41.8% 各高 2.4 和 2.8 分. 指令版的代码, 推理, 多语言分数都没印, 其它模型的指令版也没列, 所以没法横向比.

Explore Mixtral 8x22B now on la Plateforme and join the Mistral community of developers as we define the AI frontier together.

现在就去 la Plateforme 体验 Mixtral 8x22B, 加入 Mistral 开发者社区, 一起定义 AI 的前沿.

The footer navigation starts here: Products, Vibe, Vibe Code, Studio.

页脚导航从这里开始: Products, Vibe, Vibe Code, Studio.

![第 5 页下半截图: 图 4 图注和指令版那段被 cookie 横幅遮住, 下方是页脚导航](images/p05-forg.png)

<!-- page 6 of 7 -->

Page 6 is the rest of the site footer: Forge, Compute, Pricing; Solutions (Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities); Why Mistral (About us, Careers, Partners, Our customers, Our models, Brand); Company (Terms of Service, Privacy Policy, Privacy choices, Data processing agreement, Trust Center, Legal notice).

第 6 页是页脚剩下的部分: Forge, Compute, Pricing; Solutions 一栏 (交付方法, 模型定制, 代码, 文档智能, 语音, 以及面向金融, 公共机构, 制造, 能源与公用事业的方案); Why Mistral 一栏 (关于我们, 招聘, 合作伙伴, 客户, 我们的模型, 品牌); Company 一栏 (服务条款, 隐私政策, 隐私选项, 数据处理协议, 信任中心, 法律声明). 这一页没有任何和 Mixtral 8x22B 有关的数.

<!-- page 7 of 7 -->

Get Mistral Vibe. The page ends with App Store and Google Play buttons, the large Mistral logo, the copyright line "Mistral AI © 2026" and a language switch set to English.

Get Mistral Vibe. 页尾是 App Store 和 Google Play 下载按钮, 大号 Mistral 标志, 版权行 「Mistral AI © 2026」, 以及停在 English 的语言切换.

![第 7 页页尾截图: Get Mistral Vibe 下载按钮, Mistral 标志和 cookie 横幅](images/p07-image.png)
