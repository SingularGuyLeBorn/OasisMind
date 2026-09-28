这是 Mistral AI 官网的 Mistral Small 3 发布页, 共 11 页, images 目录里 12 张图. 正文在第 1 到第 9 页, 第 10, 11 页是站点页脚. 每一页都叠着一个 cookie 横幅, 转出的 Markdown 丢了大半正文, 下面的英文按 PDF 文本层补全. 页面上的五张图表被横幅或站点顶栏挡住一部分, 数字按 PDF 里嵌着的原图读. 人评图上每个数都印了出来, 照抄; 延迟散点图, 指令模型和预训练模型的柱状图没印数字, 表里的数是按像素量点位和柱高估读的, 误差大约 ±0.5 个点, 统一标 「读图」. 文中自己算的数都标了估算.

<!-- page 1 of 11 -->

# Mistral Small 3

The page header reads **RESEARCH**, followed by the title "Mistral Small 3", the date **January 30, 2025** and the byline "By Mistral AI Team".

页头印着 **RESEARCH**, 下面是标题 「Mistral Small 3」, 日期 **January 30, 2025**, 署名 「By Mistral AI Team」.

A hero image sits below the byline: a pink pixel-art flower with a green stem on a blue grid, with a white card in the middle showing a small version of the same flower. On the page, the lower part of the picture is hidden behind the cookie banner. The images directory keeps a crop of its right part.

署名下面是一张题图: 蓝色网格上一朵粉色像素花, 绿色花茎, 中间一张白卡片上画着同样的小花. 页面上题图下半被 cookie 横幅挡住. images 目录里截了它右侧一块.

![题图右侧局部, 粉色像素花朵和绿色花茎, 左边露出一截白色卡片](images/p01-y-optimized-24b-parameter.png)

Today we're introducing Mistral Small 3, a latency-optimized 24B-parameter model released under the Apache 2.0 license.

今天我们推出 Mistral Small 3, 一个为延迟优化的 24B 参数模型, 以 Apache 2.0 许可证发布.

> **想:** 「latency-optimized」 落到结构上是什么?
> 本页只在第 2 页说它 「far fewer layers than competing models」, 没给层数, 隐藏维度, 注意力头数, 词表大小, 上下文长度. 24B 是全页唯一的结构数字.

The rest of page 1 is a cookie consent banner certified by axeptio. It says the site uses cookies to measure the audience, nurture the relationship and send content and advertisement. It lists Google Analytics 4 and Hubspot, with Close, Accept all and Next buttons. The same banner repeats on every page below. The images directory keeps three small crops from it: the Toggle all switch and two empty checkboxes.

第 1 页剩下的是 axeptio 认证的 cookie 同意横幅. 横幅说网站用 cookie 统计访问量, 维系用户关系, 推送内容和广告. 它列出 Google Analytics 4 和 Hubspot 两项, 带 Close, Accept all, Next 三个按钮. 后面每一页都重复这个横幅, 下文不再逐页说明. images 目录里从横幅上截了三个小图: 一个 Toggle all 开关, 两个空复选框.

![cookie 横幅里 Toggle all 的开关, 处于关闭状态, 不含模型信息](images/p01-google-analytics-4-helps-us-measure-our-audience.png)

![cookie 横幅里的空复选框, 不含模型信息](images/p01-hubspot.png)

![cookie 横幅里的另一个空复选框, 不含模型信息](images/p01-close.png)

<!-- page 2 of 11 -->

Page 2 opens with a scatter chart titled "Performance / MMLU-Pro". The x-axis is "Latency / milliseconds per token" (11 to 16), the y-axis is MMLU-Pro (50 to 70). Mistral Small 3 is the orange point in the upper left, inside a shaded wedge; the other three points are teal. The note under the chart reads: "Apache 2.0 models benchmarked with public vLLM at batch size 16 on 4xH100, GPT-4o-mini measured from OpenAI API". On the page, the site header covers the title and the top of the y-axis.

第 2 页开头是一张散点图, 标题 「Performance / MMLU-Pro」. 横轴 「Latency / milliseconds per token」 (11 到 16), 纵轴 MMLU-Pro (50 到 70). Mistral Small 3 是左上角的橙色点, 落在一块浅色楔形区域里, 其余三个点是青色. 图下注释: 「Apache 2.0 models benchmarked with public vLLM at batch size 16 on 4xH100, GPT-4o-mini measured from OpenAI API」, 即 Apache 2.0 许可的模型用公开版 vLLM 在 4 张 H100 上以 batch size 16 测, GPT-4o-mini 走 OpenAI API 测. 页面上图的标题和纵轴顶端被站点顶栏盖住.

![延迟对 MMLU-Pro 散点图, 顶部被站点顶栏盖住, 标题和 Qwen-2.5 32B 的标签只露出一半](images/p02-chart.png)

| model | latency (ms/token, 读图) | MMLU-Pro (读图) |
|---|---|---|
| Mistral Small 3 | 10.9 | 66.6 |
| GPT-4o Mini | 12.0 | 61.7 |
| Gemma-2 27B | 13.7 | 53.6 |
| Qwen-2.5 32B | 15.1 | 68.3 |

> **问:** 横轴是 「每 token 毫秒数」, 和正文的 「150 tokens/s」 对得上吗?
> 对不上. 10.9 ms/token 折合约 92 tokens/s (估算), 150 tokens/s 要约 6.7 ms/token (估算), 比图上最左的点还靠左. 图用的是 batch size 16, 如果 150 指别的测法 (比如单条请求), 页面没交代.

Mistral Small 3 is competitive with larger models such as Llama 3.3 70B or Qwen 32B, and is an excellent open replacement for opaque proprietary models like GPT4o-mini. Mistral Small 3 is on par with Llama 3.3 70B instruct, while being more than 3x faster on the same hardware.

Mistral Small 3 能和 Llama 3.3 70B, Qwen 32B 这类更大的模型较量, 也可以开放地替换 GPT4o-mini 这类不透明的闭源模型. Mistral Small 3 和 Llama 3.3 70B instruct 水平相当, 在同样硬件上快 3 倍以上.

> **核对:** 「more than 3x faster」 在散点图里能核吗?
> 不能. 散点图只有 Small 3, GPT-4o Mini, Gemma-2 27B, Qwen-2.5 32B 四个点, 没有 Llama 3.3 70B. 图上最接近的对比是 Qwen-2.5 32B, 15.1 对 10.9 ms/token, 约 1.4 倍 (估算).

Mistral Small 3 is a pre-trained and instructed model catered to the '80%' of generative AI tasks—those that require robust language and instruction following performance, with very low latency.

Mistral Small 3 是预训练加指令调优的模型, 面向生成式 AI 里 「80%」 的任务, 也就是那些要求语言能力和指令遵循稳当, 延迟又很低的任务.

We designed this new model to saturate performance at a size suitable for local deployment. Particularly, Mistral Small 3 has far fewer layers than competing models, substantially reducing the time per forward pass. At over 81% accuracy on MMLU and 150 tokens/s latency, Mistral Small is currently the most efficient model of its category.

我们设计这个新模型, 是想在适合本地部署的尺寸上把性能做满. 具体说, Mistral Small 3 的层数比同类模型少得多, 每次前向传播的时间因此明显缩短. MMLU 准确率超过 81%, 延迟 150 tokens/s, Mistral Small 是目前同类里效率最高的模型.

> **看表:** 「over 81% accuracy on MMLU」 出自哪张图?
> 全页只有第 6 页预训练图里有 MMLU (5-shot), 读图 Small 3 base 约 80.3, 柱顶贴着 80 的刻度线. 81 在那张图上比柱顶高约 2 个像素, 在读图误差边上, 但从图上看不出 「over 81%」.

We're releasing both a pretrained and instruction-tuned checkpoint under Apache 2.0. The checkpoints can serve as a powerful base for accelerating progress. Note that Mistral Small 3 is neither trained with RL nor synthetic data,

我们以 Apache 2.0 同时发布预训练和指令调优两个 checkpoint. 这两个 checkpoint 可以作为加速后续进展的扎实底座. 注意, Mistral Small 3 既没用 RL 训练, 也没用合成数据,

The last clause continues on page 3. The images directory keeps a crop where the cookie banner covers the left half of this page's text.

这半句接到第 3 页. images 目录里截了一张 cookie 横幅盖住本页正文左半的图.

![cookie 横幅盖住第 2 页正文左半, 右边露出 Llama 3.3 70B, 80% 和 81% accuracy 等半句](images/p02-light-and-completely-harmless.png)

<!-- page 3 of 11 -->

so is earlier in the model production pipeline than models like Deepseek R1 (a great and complementary piece of open-source technology!). It can serve as a great base model for building accrued reasoning capacities. We look forward to seeing how the open-source community adopts and customizes it.

所以它在模型生产流程里的位置比 Deepseek R1 这类模型更靠前 (Deepseek R1 是很好的开源技术, 和它互补!). 它可以当作很好的基座模型, 在上面继续堆推理能力. 我们期待看到开源社区怎么采用和定制它.

> **拆开:** 「neither trained with RL nor synthetic data」 覆盖到指令模型吗?
> 句子主语是 Mistral Small 3, 放在同时发布 base 和 instruct 两个 checkpoint 的段落里, 读起来两个都算. 可指令调优用的是什么数据, 多少条, 人写还是别的来源, 页面一句没提.

## Performance

## Human Evaluations

The human evaluation chart is titled "Human rater preferences / percentage". It is a stacked bar chart with percentage on the y-axis (0 to 100) and one bar per opponent on the x-axis, labelled "Model (prompt type)". Each bar has five segments: Mistral is better (orange), Mistral is slightly better (yellow), Ties (light grey), Other is slightly better (light blue), Other is better (blue). On the page, the cookie banner covers everything below the top segment; the values below are read from the embedded image.

人评图标题 「Human rater preferences / percentage」. 这是一张堆叠柱状图, 纵轴百分比 (0 到 100), 横轴每个对手一根柱, 轴名 「Model (prompt type)」. 每根柱分五段: Mistral is better (橙), Mistral is slightly better (黄), Ties (浅灰), Other is slightly better (浅蓝), Other is better (蓝). 页面上除了最上面一段, 其余都被 cookie 横幅盖住, 下面的数按嵌入的原图读.

![人评堆叠柱状图的顶部, 只露出 Other is better 一段的 15.6, 17.2, 11.0, 31.2, 下面被 cookie 横幅挡住](images/p03-here-are-our-cookies.png)

| opponent (prompt type) | Mistral is better | Mistral is slightly better | Ties | Other is slightly better | Other is better |
|---|---|---|---|---|---|
| Gemma-2 27B (generalist) | 53.6 | 19.6 | 5.2 | 6.0 | 15.6 |
| Qwen-2.5 32B (generalist) | 49.6 | 18.4 | 6.0 | 8.8 | 17.2 |
| Qwen-2.5 32B (coding) | 53.0 | 27.0 | - | 9.0 | 11.0 |
| Llama-3.3 70B (generalist) | 19.2 | 16.4 | 11.2 | 23.6 | 29.6 |
| GPT-4o mini (generalist) | 20.0 | 20.4 | 16.0 | 12.4 | 31.2 |

In the original, the Qwen-2.5 32B (coding) bar has no Ties segment and no value printed for it.

原图里 Qwen-2.5 32B (coding) 那根柱没有 Ties 段, 也没印数.

> **确认:** 对 Llama 3.3 70B 和 GPT-4o mini, 人评是赢还是输?
> 都是输. 把两档 「better」 加起来: 对 Llama-3.3 70B 是 35.6 对 53.2, 对 GPT-4o mini 是 40.4 对 43.6. 第 2 页说和 Llama 3.3 70B instruct 「on par」, 这张图上 Small 3 落后 17.6 个点.

> **回看:** Qwen-2.5 32B (coding) 真的一个平局都没有?
> 53.0 + 27.0 + 9.0 + 11.0 正好 100, 所以不是漏印, 这一组确实没有 Ties. 其余四组都有 5.2 到 16.0 的平局. 为什么只有代码组没有, 是题型本身还是评审规则不同, 页面没说.

We conducted side by side evaluations with an external third-party vendor, on a set of over 1k proprietary coding and generalist prompts. Evaluators were tasked with selecting their preferred model response from anonymized generations produced by Mistral Small 3 vs another model. We are aware that in some cases the benchmarks on human judgement starkly differ from publicly available

我们请一家外部第三方供应商做了并排对比评测, 用的是 1000 多条内部的代码和通用 prompt. 评审从匿名的两份回答里选出更喜欢的一份, 一份来自 Mistral Small 3, 一份来自另一个模型. 我们知道, 有些情况下基于人类判断的结果和公开的

> **停一下:** 「over 1k」 分到五根柱上, 每根多少条?
> 页面没写. 四组 generalist 的每个数都是 0.4 的整数倍, 能对上的最小样本是每组 250 条; 代码组的数都是 1.0 的整数倍, 却不是 0.4 的整数倍, 最小是 100 条 (都是估算, 实际可以是这些数的倍数). 4 × 250 + 100 = 1100, 和 「over 1k」 不冲突.

<!-- page 4 of 11 -->

benchmarks, but have taken extra caution in verifying a fair evaluation. We are confident that the above benchmarks are valid.

基准差别很大, 但我们格外小心地核实了评测是公平的. 我们相信上面的结果是有效的.

## Instruct performance

Our instruction tuned model performs competitively with open weight models three times its size and with proprietary GPT4o-mini model across Code, Math, General knowledge and Instruction following benchmarks.

我们的指令调优模型在代码, 数学, 通用知识, 指令遵循几类基准上, 能和三倍大小的开放权重模型, 以及闭源的 GPT4o-mini 较量.

> **再看:** 「three times its size」 指谁?
> 图里的对手是 Gemma-2-27b-it, Qwen2.5-32B-Instruct, Llama-3.3-70B-Instruct 和 gpt-4o-mini. 只有 Llama 3.3 70B 接近三倍, 70 / 24 约 2.9 倍; Qwen 32B 约 1.3 倍, Gemma 27B 约 1.1 倍 (都是估算).

The first instruct chart shows MMLU Pro (5-shot) and GPQA main, with "Accuracy (%)" on the y-axis (0.2 to 0.8). The five bars in each group follow the legend: Mistral-Small-24B-Instruct-2501 (orange), Gemma-2-27b-it (green), Qwen2.5-32B-Instruct (teal), Llama-3.3-70B-Instruct (blue), gpt-4o-mini-2024-07-18 (purple). The Mistral bars carry a small Mistral logo. On the page, the banner covers the lower left of the chart.

第一张指令模型图是 MMLU Pro (5-shot) 和 GPQA main, 纵轴 「Accuracy (%)」 (0.2 到 0.8). 每组五根柱按图例排: Mistral-Small-24B-Instruct-2501 (橙), Gemma-2-27b-it (绿), Qwen2.5-32B-Instruct (青), Llama-3.3-70B-Instruct (蓝), gpt-4o-mini-2024-07-18 (紫). Mistral 的柱顶上画着 Mistral 小图标. 页面上图的左下被横幅盖住.

![指令模型 MMLU Pro 和 GPQA main 柱状图上半, 左下被 cookie 横幅挡住](images/p04-toggle-all.png)

| benchmark (读图) | Mistral Small 3 Instruct | Gemma-2-27b-it | Qwen2.5-32B-Instruct | Llama-3.3-70B-Instruct | gpt-4o-mini |
|---|---|---|---|---|---|
| MMLU Pro (5-shot) | 0.662 | 0.534 | 0.683 | 0.662 | 0.616 |
| GPQA main | 0.451 | 0.342 | 0.403 | 0.528 | 0.376 |

> **对一下:** 散点图里的 MMLU-Pro 和这张图是同一组数吗?
> 看起来是. 散点图读 66.6, 61.7, 53.6, 68.3, 这里读 0.662, 0.616, 0.534, 0.683, 差都在 0.5 个点以内, 属读图误差. GPQA main 上 Small 3 比 Llama 3.3 70B 低约 7.7 个点, 是八项里差得最多的一项.

<!-- page 5 of 11 -->

Page 5 holds two more instruct charts in the same colours. The first shows HumanEval and Math Instruct with "Accuracy (%)" from 0.5 to 1.0. The second shows Wildbench, Arena Hard, MTBench and IFEval with "Accuracy (%)" from 30 to 100. On the page, the site header covers the legend of the first chart and the banner covers the left half of the second.

第 5 页还有两张指令模型图, 配色同上. 第一张是 HumanEval 和 Math Instruct, 纵轴 「Accuracy (%)」 从 0.5 到 1.0. 第二张是 Wildbench, Arena Hard, MTBench, IFEval, 纵轴 「Accuracy (%)」 从 30 到 100. 页面上第一张图的图例被站点顶栏盖住, 第二张图的左半被横幅盖住.

![第 5 页整页截图, 上面是 HumanEval 和 Math Instruct 柱状图, 下面四项基准图的左半被 cookie 横幅挡住](images/p05-image.png)

![HumanEval 和 Math Instruct 柱状图, 图例被站点顶栏盖住](images/p05-rep.png)

| benchmark (读图) | Mistral Small 3 Instruct | Gemma-2-27b-it | Qwen2.5-32B-Instruct | Llama-3.3-70B-Instruct | gpt-4o-mini |
|---|---|---|---|---|---|
| HumanEval | 0.847 | 0.731 | 0.909 | 0.852 | 0.888 |
| Math Instruct | 0.703 | 0.533 | 0.819 | 0.741 | 0.760 |
| Wildbench | 52.1 | 48.0 | 52.6 | 49.7 | 56.0 |
| Arena Hard | 87.3 | 78.5 | 85.8 | 83.6 | 89.4 |
| MTBench | 83.1 | 78.5 | 82.4 | 79.3 | 83.1 |
| IFEval | 82.9 | 80.5 | 83.9 | 88.0 | 84.8 |

> **想:** 八项里 Small 3 对 Llama 3.3 70B 和 gpt-4o-mini 各赢几项?
> 对 Llama 3.3 70B: Wildbench, Arena Hard, MTBench 三项高, MMLU Pro 持平, GPQA main, HumanEval, Math Instruct, IFEval 四项低, 其中 HumanEval 只差约 0.5 个点, 在读图误差内. 对 gpt-4o-mini: MMLU Pro, GPQA main 两项高, MTBench 持平, 其余五项低. 对 Gemma-2-27b-it 八项全高.

> **问:** MTBench 画在 「Accuracy (%)」 轴上, 83 是什么分?
> 页面没解释 MTBench 怎么换算成百分数, 也没说 Wildbench 的 52 是什么口径. 下一页只说这三项评审式基准用 gpt-4o-2024-05-13 当评审.

Performance accuracy on all benchmarks were obtained through the same internal evaluation pipeline - as such, numbers may vary slightly from previously

所有基准的准确率都出自同一条内部评测流程, 因此数字可能和此前

<!-- page 6 of 11 -->

reported performance (Qwen2.5-32B-Instruct, Llama-3.3-70B-Instruct, Gemma-2-27B-IT). Judge based evals such as Wildbench, Arena hard and MTBench were based on gpt-4o-2024-05-13.

公开报告的成绩略有出入 (Qwen2.5-32B-Instruct, Llama-3.3-70B-Instruct, Gemma-2-27B-IT). Wildbench, Arena hard, MTBench 这类靠评审模型打分的评测, 评审用的是 gpt-4o-2024-05-13.

> **核对:** 用 gpt-4o 当评审, 对 gpt-4o-mini 公平吗?
> 页面没讨论. 三项评审式基准里 gpt-4o-mini 是 Wildbench 和 Arena Hard 的最高分, MTBench 和 Small 3 并列最高. 评审和被评模型同出一家, 有没有偏向, 页面没给对照.

## Pretraining performance

The first pretraining chart has five groups: Math Maj@4, MMLU (5-shot), GPQA Main (5-shot CoT), TriviaQA (5-Shot) and MMLU Pro (5-shot CoT), with "Accuracy (%)" on the y-axis (20 to about 90). The legend lists Mistral-Small-24B-Base-2501 (orange), Gemma 2 27B (green), Qwen 2.5 32B (teal) and LLama 3.1 70B (blue). On the page, the banner covers the lower part of the chart and most of the x-axis labels.

第一张预训练图分五组: Math Maj@4, MMLU (5-shot), GPQA Main (5-shot CoT), TriviaQA (5-Shot), MMLU Pro (5-shot CoT), 纵轴 「Accuracy (%)」 (20 到约 90). 图例是 Mistral-Small-24B-Base-2501 (橙), Gemma 2 27B (绿), Qwen 2.5 32B (青), LLama 3.1 70B (蓝). 页面上图的下半和大部分横轴标签被横幅盖住.

![预训练模型五项基准柱状图, 下半和横轴标签被 cookie 横幅挡住](images/p06-here-are-our-cookies.png)

| benchmark (读图) | Mistral-Small-24B-Base-2501 | Gemma 2 27B | Qwen 2.5 32B | LLama 3.1 70B |
|---|---|---|---|---|
| Math Maj@4 | 45.8 | 44.3 | 64.8 | 45.2 |
| MMLU (5-shot) | 80.3 | 77.3 | 82.1 | 80.0 |
| GPQA Main (5-shot CoT) | 34.1 | 28.8 | 39.8 | 30.9 |
| TriviaQA (5-Shot) | 80.0 | 78.2 | 69.3 | 82.4 |
| MMLU Pro (5-shot CoT) | 54.1 | 48.7 | 61.2 | 51.7 |

> **看表:** 预训练图里比的 Llama 是哪一版?
> 这里是 LLama 3.1 70B, 指令图里是 Llama-3.3-70B-Instruct, 版本号不一样. 第 7 页说 「rivals with models three times larger such as Llama 3.3 70B」, 可 base 对比的其实是 3.1. 对 Qwen 2.5 32B, 五项里 Small 3 base 只在 TriviaQA 上高, Math Maj@4 低约 19 个点.

<!-- page 7 of 11 -->

Page 7 opens with a second pretraining chart in the same colours: MMLU in seven languages (French, German, Spanish, Russian, Chinese, Korean, Japanese), with "Accuracy (%)" from 20 to 90. On the page, the site header cuts off the top of the chart, including the legend and the top of the Qwen 2.5 32B bar for Chinese MMLU.

第 7 页开头是第二张预训练图, 配色同上: 七种语言的 MMLU (French, German, Spanish, Russian, Chinese, Korean, Japanese), 纵轴 「Accuracy (%)」 从 20 到 90. 页面上图的顶端被站点顶栏切掉, 图例和 Qwen 2.5 32B 在 Chinese MMLU 上的柱顶都看不见.

![预训练模型七种语言 MMLU 柱状图, 顶端被站点顶栏切掉, Qwen 2.5 32B 的 Chinese MMLU 柱顶看不到](images/p07-axeptio.png)

| language (读图) | Mistral-Small-24B-Base-2501 | Gemma 2 27B | Qwen 2.5 32B | LLama 3.1 70B |
|---|---|---|---|---|
| French MMLU | 78.0 | 73.1 | 78.0 | 76.8 |
| German MMLU | 77.5 | 72.8 | 79.0 | 76.3 |
| Spanish MMLU | 78.5 | 75.5 | 80.9 | 78.5 |
| Russian MMLU | 75.5 | 72.1 | 77.5 | 74.8 |
| Chinese MMLU | 70.1 | 61.8 | 88.8 | 69.2 |
| Korean MMLU | 56.2 | 51.3 | 62.8 | 54.0 |
| Japanese MMLU | 74.3 | 69.2 | 79.5 | 73.6 |

> **拆开:** 七种语言里 Small 3 base 和 Qwen 2.5 32B 差在哪?
> French 持平, 其余六种都是 Qwen 高, 差得最多的是 Chinese MMLU, 88.8 对 70.1, 约 18.7 个点 (估算). 对 LLama 3.1 70B, Small 3 base 六种高一点, Spanish 持平. 七种语言里 Korean 是四个模型都最低的一项.

Mistral Small 3, a 24B model, offers the best performance for its size class and rivals with models three times larger such as Llama 3.3 70B.

Mistral Small 3 是 24B 模型, 在同尺寸里性能最好, 能和三倍大的模型较量, 比如 Llama 3.3 70B.

## When to use Mistral Small 3

Across our customers and community, we are seeing several distinct use cases emerge for pre-trained models of this size:

在客户和社区里, 这个尺寸的预训练模型已经冒出几类明确的用法:

**Fast-response conversational assistance.** Mistral Small 3 excels in scenarios where quick, accurate responses are critical. This includes virtual assistants in many scenarios where users expect immediate feedback and near real-time interactions.

**快速响应的对话助手.** Mistral Small 3 擅长那些回答必须又快又准的场景, 包括大量用户期待即时反馈, 近乎实时交互的虚拟助手.

**Low-latency function calling.** Mistral Small 3 is able to handle rapid function execution when used as part of automated or agentic workflows.

**低延迟函数调用.** 放进自动化或 agentic 工作流里, Mistral Small 3 能快速处理函数执行.

**Fine-tuning to create subject matter experts.** Mistral Small 3 can be fine-tuned to specialize in specific domains, creating highly accurate subject matter experts. This is particularly useful in fields like legal advice, medical

**微调出领域专家.** Mistral Small 3 可以微调到特定领域, 做成准确度很高的领域专家. 这在法律咨询, 医疗

<!-- page 8 of 11 -->

diagnostics, and technical support, where domain-specific knowledge is essential.

诊断, 技术支持这类离不开领域知识的场景里特别有用.

**Local inference.** Particularly beneficial for hobbyists and organizations handling sensitive or proprietary information. When quantized, Mistral Small 3 can be run privately on a single RTX 4090 or a Macbook with 32GB RAM.

**本地推理.** 对爱好者, 以及处理敏感或专有信息的机构特别有用. 量化后, Mistral Small 3 能在一张 RTX 4090 或一台 32GB 内存的 Macbook 上私有运行.

> **确认:** 「When quantized」 量化到几比特?
> 没写. 24B 参数按 4 bit 算, 权重约 12 GB; 按 8 bit 算约 24 GB (都是估算, 不含 KV cache 和激活). 页面没印 RTX 4090 的显存, 也没给量化后的分数.

Our customers are evaluating Mistral Small 3 across multiple industries, including:

我们的客户正在多个行业评估 Mistral Small 3, 包括:

- Financial services customers for fraud detection
- Healthcare providers for customer triaging
- Robotics, automotive, and manufacturing companies for on-device command and control

- 金融服务客户, 用于反欺诈
- 医疗机构, 用于客户分诊
- 机器人, 汽车, 制造企业, 用于端侧指令与控制

Horizontal use cases across customers include virtual customer service, and sentiment and feedback analysis.

跨客户的通用场景有虚拟客服, 以及情感和反馈分析.

## Using Mistral Small 3 on your preferred tech stack

Mistral Small 3 is now available on la Plateforme as `mistral-small-latest` or `mistral-small-2501`. Explore our docs to learn how to use our models for text generation.

Mistral Small 3 现已在 la Plateforme 上线, 模型名 `mistral-small-latest` 或 `mistral-small-2501`. 文本生成怎么调用, 请看我们的文档.

We are also excited to collaborate with Hugging Face, Ollama, Kaggle, Together AI, and Fireworks AI to make the model available on their platforms starting today:

我们也很高兴和 Hugging Face, Ollama, Kaggle, Together AI, Fireworks AI 合作, 从今天起在它们的平台上提供这个模型:

- Hugging Face (base model)
- Ollama
- Kaggle
- Together AI

> **回看:** Hugging Face 那一项为什么只写 base model?
> 链接文字就是 「Hugging Face (base model)」. 第 2 页说 base 和 instruct 两个 checkpoint 都以 Apache 2.0 发布, 可这份渠道清单里没单列 instruct 的下载处.

<!-- page 9 of 11 -->

- Fireworks AI
- IBM Watson X

Coming soon on NVIDIA NIM, Amazon SageMaker, Groq, Databricks and Snowflake

即将上线 NVIDIA NIM, Amazon SageMaker, Groq, Databricks 和 Snowflake

## The road ahead

It's been exciting days for the open-source community! Mistral Small 3 complements large open-source reasoning models like the recent releases of DeepSeek, and can serve as a strong base model for making reasoning capabilities emerge.

这些天开源社区很热闹! Mistral Small 3 和 DeepSeek 最近发布的大型开源推理模型互补, 可以当作让推理能力涌现出来的扎实基座.

Among many other things, expect small and large Mistral models with boosted reasoning capabilities in the coming weeks. Join the journey if you're keen (we're hiring), or beat us to it by hacking Mistral Small 3 today and making it better!

除了别的很多事, 接下来几周还会有推理能力加强的大小 Mistral 模型. 感兴趣就加入我们 (我们在招人), 或者今天就动手改 Mistral Small 3, 抢在我们前面把它做得更好!

> **停一下:** 「boosted reasoning」 的模型会建在 Small 3 上吗?
> 本页没说. 它只说几周内会有小的和大的推理加强模型, 没给名字, 尺寸和底座. 这里也不能拿后来发布的型号去补.

## Open-source models at Mistral

We're renewing our commitment to using Apache 2.0 license for our general purpose models, as we progressively move away from MRL-licensed models. As with Mistral Small 3, model weights will be available to download and deploy locally, and free to modify and use in any capacity. These models will also be made available through a serverless API on la Plateforme, through our on-prem and VPC deployments, customisation and orchestration platform, and through our inference and cloud partners. Enterprises and developers that need specialized capabilities (increased speed and context, domain specific knowledge, task-specific models like code completion) can count on additional commercial models complementing what we contribute to the community.

我们重申, 通用模型会用 Apache 2.0 许可证, 并逐步告别 MRL 许可的模型. 和 Mistral Small 3 一样, 这些模型的权重可以下载, 在本地部署, 随意修改和使用. 它们也会通过 la Plateforme 上的 serverless API, 我们的本地和 VPC 部署, 定制与编排平台, 以及推理和云合作伙伴提供. 需要专门能力 (更快的速度和更长的上下文, 领域知识, 代码补全这类专用模型) 的企业和开发者, 可以用我们的商业模型, 作为对社区贡献的补充.

> **再看:** MRL 是什么许可证, 哪些旧模型用了它?
> 页面没展开缩写, 也没列 MRL 许可的模型名单. 这段只说方向: 通用模型往 Apache 2.0 走, 更长上下文等专门能力放在商业模型里.

<!-- page 10 of 11 -->

Page 10 is the site footer navigation, captured in 2026. It lists Products (Vibe, Vibe Code, Studio, Forge, Compute, Pricing), Solutions (Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities), Why Mistral (About us, Careers, Partners, Our customers, Our models, Brand) and Company (Terms of Service, Privacy Policy). The cookie banner covers the middle of the page.

第 10 页是站点页脚导航, 抓页时间是 2026 年. 里面列了 Products (Vibe, Vibe Code, Studio, Forge, Compute, Pricing), Solutions (Delivery methodology, Model customization, Coding, Document intelligence, Speech, 以及金融, 公共机构, 制造, 能源与公用事业四个行业方案), Why Mistral (About us, Careers, Partners, Our customers, Our models, Brand) 和 Company (Terms of Service, Privacy Policy). 页面中间被 cookie 横幅盖住.

> **对一下:** 页脚里的 Vibe, Forge 和 Small 3 同期吗?
> 不同期. 页脚是抓页时的站点外壳, 第 11 页印着 「Mistral AI © 2026」, 正文日期是 January 30, 2025. 这些产品名不是这篇公告的内容.

<!-- page 11 of 11 -->

Page 11 continues the footer: Privacy choices, Data processing agreement, Trust Center, Legal notice, a "Get Mistral Vibe" block with App Store and Google Play badges, the line "Mistral AI © 2026" and a language switch set to English.

第 11 页接着是页脚: Privacy choices, Data processing agreement, Trust Center, Legal notice, 一个带 App Store 和 Google Play 徽标的 「Get Mistral Vibe」 区块, 一行 「Mistral AI © 2026」, 以及设成 English 的语言切换.
