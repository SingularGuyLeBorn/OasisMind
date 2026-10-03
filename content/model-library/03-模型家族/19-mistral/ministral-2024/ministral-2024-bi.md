源文: Mistral AI 官网博文 「Un Ministral, des Ministraux」, 2024 年 10 月 16 日, 网页打印 9 页, 11 张图. 英文段在前, 中文意译紧跟. 正文英文按 PDF 文字层校正; 每页左下角都叠着同一个 axeptio cookie 弹窗和顶栏 「Get in touch」, 弹窗文字只在第 1 页录一次. 表 1 的左半部分, 图 1 的左两组横轴标签, 图 2 的左半部分和纵轴, 表 2 的表头上半截都被弹窗或页边遮住, 表里只录露出来的格子.

<!-- page 1 of 9 -->

[Get in touch](https://mistral.ai/contact/)

顶栏链接: 联系我们.

**RESEARCH**

栏目: 研究.

# Un Ministral, des Ministraux

标题是法语, 意思是 「一个 Ministral, 一群 Ministraux」. Ministraux 是 Ministral 的法语复数写法.

October 16, 2024 By Mistral AI team

2024 年 10 月 16 日, 作者 Mistral AI 团队.

## Introducing the world's best edge models (推出世界上最好的边缘模型)

On the first anniversary of the release of Mistral 7B, the model that revolutionized independent frontier AI innovation for millions, we are proud to introduce two new state-of-the-art models for on-device computing and at-the-edge use cases. We call them les Ministraux: Ministral 3B and Ministral 8B.

Mistral 7B 发布满一周年. 这个模型曾让数以百万计的人参与到独立的前沿 AI 创新里. 在这个时间点, 我们推出两个新的顶尖模型, 面向端侧计算和边缘场景, 统称 les Ministraux: Ministral 3B 和 Ministral 8B.

> **想:** 名字里的 3B 和 8B 之外, 页面有没有印总参数和激活参数?
> 名字里的尺寸: 3B, 8B. 总参数: 本页未印. 激活参数: 本页未印. 九页里也没有层数, 隐藏维度, 头数, 词表大小这些规格, 只有一句 「sub-10B category」 给出量级.

These models set a new frontier in knowledge, commonsense, reasoning, function-calling, and efficiency in the sub-10B category, and can be used or tuned to a variety of uses, from orchestrating agentic workflows to creating specialist task workers. Both models support up to 128k context length (currently 32k on vLLM) and Ministral 8B has a special interleaved sliding-window attention pattern for faster and memory-efficient inference.

在 10B 以下这一档, 这两个模型在知识, 常识, 推理, 函数调用和效率上都刷新了上限. 它们可以直接用, 也可以微调后用在各种场合, 从编排 agent 工作流到做专门的任务执行者都行. 两个模型都支持最长 128k 的上下文 (目前在 vLLM 上是 32k). Ministral 8B 还用了一种特殊的交错滑动窗口注意力 (interleaved sliding-window attention) 模式, 推理更快, 也更省显存.

> **问:** 128k 和 「currently 32k on vLLM」 差了 4 倍, 哪个才是能用的长度?
> 页面只说模型 「support up to 128k」, vLLM 上目前只开到 32k, 没说原因, 也没说其他推理框架开到多少. 九页里没有任何长上下文评测, 128k 只是一句规格声明.

> **核对:** 交错滑动窗口注意力只写给了 8B, 3B 用的是什么?
> 页面只说 「Ministral 8B has a special interleaved sliding-window attention pattern」, 对 3B 的注意力方式一字未提. 窗口多大, 怎么交错 (比如几层滑窗配几层全局), 也都没写.

## Use cases (使用场景)

Cookies

左下角按钮: Cookies.

CERTIFIED BY axeptio. Here are our cookies! Light and completely harmless. On this website, we use cookies to measure our audience, nurture our relationship with you and, from time to time send you some quality content and some advertisement. You can select here those you allow to stay. Toggle all. Google Analytics 4: Helps us measure our audience. Hubspot: Tool for customer relationship management. Close / Accept all / Next.

弹窗 (axeptio 认证): 「这是我们的 cookie! 轻巧, 完全无害. 本站用 cookie 统计访问量, 维系和你的关系, 并不时给你推送一些优质内容和广告. 你可以在这里选择留下哪些.」 选项: 全部开关; Google Analytics 4, 帮我们统计访问量; Hubspot, 客户关系管理工具. 按钮: 关闭, 全部接受, 下一步. 这个弹窗在第 2 到第 9 页原样重复, 不再录.

<!-- page 2 of 9 -->

Our most innovative customers and partners have increasingly been asking for local, privacy-first inference for critical applications such as on-device translation, internet-less smart assistants, local analytics, and autonomous robotics. Les Ministraux were built to provide a compute-efficient and low-latency solution for these scenarios. From independent hobbyists to global manufacturing teams, les Ministraux deliver for a wide variety of use cases.

我们最有创新力的客户和合作伙伴, 越来越多地要求在本地做推理, 把隐私放在第一位, 用在一些关键应用上: 端侧翻译, 不联网的智能助手, 本地数据分析, 自主机器人. Les Ministraux 就是为这些场景打造的, 算力省, 延迟低. 从独立的业余爱好者到全球化的制造团队, 各种用途它都能胜任.

Used in conjunction with larger language models such as Mistral Large, les Ministraux are also efficient intermediaries for function-calling in multi-step agentic workflows. They can be tuned to handle input parsing, task routing, and calling APIs based on user intent across multiple contexts at extremely low latency and cost.

和 Mistral Large 这类更大的语言模型搭配时, les Ministraux 还能在多步 agent 工作流里充当高效的函数调用中间层. 经过微调, 它们可以按用户意图, 在多种上下文里完成输入解析, 任务路由和 API 调用, 延迟和成本都极低.

> **看表:** 「extremely low latency and cost」 有对应的数字吗?
> 没有延迟数字. 成本方面第 5, 6 页给了 la Plateforme 的价格 (8B 每百万 token 0.1 美元, 3B 0.04 美元), 但没有和 Mistral Large 的价格或延迟对比, 也没有函数调用路由场景的实测.

## Benchmarks (基准测试)

We demonstrate the performance of les Ministraux across multiple tasks where they consistently outperform their peers. We re-evaluated all models with our internal framework for fair comparison.

我们在多项任务上展示 les Ministraux 的表现, 它们一贯胜过同档模型. 为了比较公平, 所有模型都用我们的内部评测框架重新跑过.

## Pretrained Models (预训练模型)

![表 1 截图: 左半部分 (模型名和前几列) 被 axeptio cookie 弹窗遮住, 右侧露出 HumanEval pass@1 (列头首字母被遮), GSM8K maj@8, French MMLU, German MMLU, Spanish MMLU 五列六行数字, 下方分组标签 Code, Math, Multilingual](images/p02-google-analytics-4-helps-us-measure-our-audience.png)

| 行 (模型名被遮) | HumanEval pass@1 | GSM8K maj@8 | French MMLU | German MMLU | Spanish MMLU |
| --- | --- | --- | --- | --- | --- |
| 第 1 行 | 20.1 | 35.5 | 41.0 | 40.1 | 41.7 |
| 第 2 行 | 29.9 | 37.2 | 42.3 | 42.2 | 43.1 |
| 第 3 行 | 34.2 | 50.9 | 49.1 | 48.3 | 49.5 |
| 第 4 行 | 26.8 | 51.3 | 50.6 | 49.6 | 51.4 |
| 第 5 行 | 37.8 | 61.7 | 50.8 | 52.8 | 54.6 |
| 第 6 行 | 34.8 | 64.5 | 57.5 | 57.4 | 59.6 |

表 1 露出的五列如上, 加粗按原图. 第 3 行和第 4 行之间有一条横线, 把六行分成上下两组, 加粗是组内最高. 列分组: HumanEval 属 Code, GSM8K 属 Math, 三个 MMLU 属 Multilingual.

> **拆开:** 行名被遮, 六行各是谁?
> 第 5 行和第 6 行能认出来: 图 1 图例露出 「LLama 3.1 8B」 (深蓝) 和 「Ministral 8B」 (深橙), 两者在 GSM8k 组的柱高约 61.7 和 64.5, 正是表 1 第 5, 6 行的 GSM8K 值. 前四行按图注和表 2 的排法, 推断是 Gemma 2 2B, Llama 3.2 3B, Ministral 3B, Mistral 7B, 但这只是推断.

> **确认:** 「consistently outperform their peers」 在表 1 里处处成立吗?
> 不是. 第 5 行 (Llama 3.1 8B) 的 HumanEval 37.8 加粗, 比第 6 行 (Ministral 8B) 的 34.8 高 3.0 个点. 若第 3 行是 Ministral 3B, 第 4 行是 Mistral 7B, 那么 GSM8K 和三个 MMLU 这四列都是第 4 行更高, 3B 只赢 HumanEval 一列.

Table 1: Ministral 3B and 8B models compared to Gemma 2 2B, Llama 3.2 3B, Llama 3.1 8B and Mistral 7B on multiple categories

表 1: Ministral 3B 和 8B 与 Gemma 2 2B, Llama 3.2 3B, Llama 3.1 8B, Mistral 7B 在多个类别上的对比.

<!-- page 3 of 9 -->

![图 1 基座模型柱状图: 四组各六根柱, 纵轴 Accuracy (%) 从 35 到 65 以上, 图例只露出 LLama 3.1 8B (深蓝) 和 Ministral 8B (深橙); 横轴只露出 GSM8k Maj@8 (首字母被遮) 和 Knowledge & Commonsense, 左两组标签被 cookie 弹窗盖住](images/p03-here-are-our-cookies.png)

Figure 1: Ministral 3B and 8B base models compared to Gemma 2 2B, Llama 3.2 3B, Llama 3.1 8B and Mistral 7B

图 1: Ministral 3B 和 8B 基座模型与 Gemma 2 2B, Llama 3.2 3B, Llama 3.1 8B, Mistral 7B 的对比.

> **回看:** 图 1 四组柱子各是多少, 和表 1 对得上吗?
> 按像素读柱高 (读图, 误差约 ±0.5), 六根柱从左到右: 第 1 组约 52.3, 56.2, 64.8, 60.9, 62.4, 65.0; 第 2 组约 41.0, 42.5, 52.7, 48.9, 50.6, 64.2; GSM8k 组约 35.5, 37.2, 61.7, 50.9, 51.3, 64.5; Knowledge & Commonsense 组约 49.1, 50.0, 54.5, 62.8, 64.8, 67.9. GSM8k 组六个数和表 1 的 GSM8K 列一一对上 (顺序是表 1 的第 1, 2, 5, 3, 4, 6 行), 第 1 组和 Knowledge 组在表 1 露出的列里找不到, 应在被遮住的左半部分.

> **停一下:** 第 2 组的标签被遮, 它画的是什么?
> 把表 1 三个 MMLU 取平均: 第 1 行 40.9, 第 2 行 42.5, 第 3 行 49.0, 第 4 行 50.5, 第 5 行 52.7, 第 6 行 58.2. 按同样的柱序, 前五根柱和这五个均值相差都在 0.1 左右, 只有 Ministral 8B 那根约 64.2, 比均值 58.2 高出约 6 个点. 如果这一组是多语言均值, 图和表在 Ministral 8B 上对不上.

## Instruct Models (指令模型)

<!-- page 4 of 9 -->

| 模型 | C1 (列头被遮) | C2 (...Hard) | C3 (...bench) | C4 (pass@1) | C5 (pass@1) | C6 (maj@1) | C7 (...bench) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Gemma 2 2B | 7.5 | 51.7 | 32.5 | 54.5 | 42.7 | 22.8 | N/A |
| Llama 3.2 3B | 7.2 | 46.0 | 27.2 | 64.6 | 61.0 | 38.4 | N/A |
| Ministral 3B | 8.1 | 64.3 | 36.3 | 67.7 | 77.4 | 51.7 | 28.4 |
| Mistral 7B | 6.7 | 44.3 | 33.1 | 50.2 | 38.4 | 13.2 | 6.9 |
| Llama 3.1 8B | 7.5 | 62.4 | 37.0 | 69.7 | 67.1 | 49.3 | N/A |
| Gemma 2 9B | 7.6 | 68.7 | 43.8 | 68.5 | 67.7 | 47.4 | N/A |
| Ministral 8B | 8.3 | 70.9 | 41.3 | 70.0 | 76.8 | 54.5 | 31.6 |

表头上半截被页边切掉, 括号里是还能认出的残字; C6 的 「maj@1」 字形残缺. 表下分组标签: C1 到 C3 是 「Chat/Arena (gpt-4o judge)」, C4, C5 是 「Code」, C6 是 「Math」, C7 是 「Function calling」. 前三行和后四行之间有横线, 加粗是组内最高.

> **再看:** C1 列头看不见, 它是什么量表?
> 图 2 和图 3 的 「MT-Bench Dev」 组里, 各柱高约等于 C1 乘 10: 图 3 中 Gemma 2 9B 约 75.8, Llama 3.1 8B 约 75, Mistral 7B 约 67, Ministral 8B 约 83, 对应 C1 的 7.6, 7.5, 6.7, 8.3. 表里是 10 分制, 图里画成了百分制, 列头本身在表里看不到.

> **对一下:** Ministral 8B 在表 2 里有没有输的格子?
> 有两格. C3 输给 Gemma 2 9B, 41.3 对 43.8, 差 2.5; C5 输给自家的 Ministral 3B, 76.8 对 77.4, 差 0.6. 其余五格 8B 组内最高. C7 函数调用一列, 其他家模型全是 N/A, 只有三个 Mistral 模型有分.

Table 2: Ministral 3B and 8B Instruct models compared to Gemma 2 2B, Llama 3.2 3B, Llama 3.1 8B, Gemma 2 9B and Mistral 7B on different evaluation categories.

表 2: Ministral 3B 和 8B 指令模型与 Gemma 2 2B, Llama 3.2 3B, Llama 3.1 8B, Gemma 2 9B, Mistral 7B 在不同评测类别上的对比.

![图 2 的 3B 指令模型柱状图: 左半部分和纵轴被 cookie 弹窗遮住, 只露出 Arena Hard 和 MT-Bench Dev 两组, 每组四根柱 (绿, 蓝, 中橙, 浅橙), 图例露出 Mistral 7B Instruct v0.3 和 Ministral 3B Instruct 两项, 浅橙柱顶有 Mistral 的 M 标](images/p04-figure-2-a-comparison-of-the-3b-family-of-instruct.png)

Figure 2: A comparison of the 3B family of Instruct models - Gemma 2 2B, Llama 3.2 3B and Ministral 3B. The figure showcases the improvements of

图 2: 3B 档指令模型的对比, 包括 Gemma 2 2B, Llama 3.2 3B 和 Ministral 3B. 图中展示了 (图注在下一页续完)

<!-- page 5 of 9 -->

Ministral 3B over the much larger Mistral 7B.

Ministral 3B 相对大得多的 Mistral 7B 的提升.

> **想:** 图 2 纵轴被遮, 柱高还能和表 2 对上吗?
> 只能对相对高低. 用 Arena Hard 组的 Gemma 2 2B (51.7) 和 Ministral 3B (64.3) 两根柱定比例, 推出 Llama 3.2 3B 和 Mistral 7B 的位置, 与表 2 的 46.0, 44.3 相差不到 1 个像素; MT-Bench Dev 组按 C1 乘 10 放上去, 偏差约 1 到 1.5 分 (读图). 图注前半句只列了三个模型, 图例却有四项, 第四项 Mistral 7B 在图注后半句才出现.

![图 3 截图 (含下方文字): 8B 指令模型柱状图, 图例 Gemma 2 9B Instruct, LLama 3.1 8B Instruct, Mistral 7B Instruct v0.3, Ministral 8B Instruct, 下方被 cookie 弹窗遮住图注和价格表左半, 只露出 License 列 Mistral Commercial License, Mistral Research License](images/p05-image.png)

![图 3 柱状图的放大截图: 五组柱, 纵轴从 20 到 90, 横轴只露出 Arena Hard 和 MT-Bench Dev, 每组 Ministral 8B 的深橙柱顶有 M 标; 第 1 组缺 Mistral 7B 的柱](images/p05-here-are-our-cookies.png)

Figure 3: A comparison of the 8B family of Instruct models - Gemma 2 9B, Llama 3.1 8B, Mistral 7B and Ministral 8B.

图 3: 8B 档指令模型的对比, 包括 Gemma 2 9B, Llama 3.1 8B, Mistral 7B 和 Ministral 8B.

> **问:** 图 3 五组柱对应表 2 哪几列?
> 按柱高读 (读图): 第 1 组约 47.4, 49.3, 无, 54.5, 对 C6 数学; 第 2 组约 68.5, 69.7, 50.2, 70.0, 对 C4; 第 3 组约 43.8, 37.0, 33.1, 41.3, 对 C3; Arena Hard 对 C2; MT-Bench Dev 对 C1 乘 10. 表里的 C5 和 C7 没进图. 第 1 组 Mistral 7B 的 13.2 离横轴太近, 被弹窗上沿挡住, 看不到.

## Availability and pricing (上线与定价)

Both models are available starting today.

两个模型从今天起可用.

| Model | API | Pricing on la Plateforme | License |
| --- | --- | --- | --- |
| Ministral 8B | ministral-8b-latest | $0.1 / M tokens (input and output) | Mistral Commercial License, Mistral Research License |

| 模型 | API 名 | la Plateforme 价格 | 许可 |
| --- | --- | --- | --- |
| Ministral 8B | ministral-8b-latest | 每百万 token 0.1 美元 (输入输出同价) | Mistral 商业许可, Mistral 研究许可 |

<!-- page 6 of 9 -->

| Model | API | Pricing on la Plateforme | License |
| --- | --- | --- | --- |
| Ministral 3B | ministral-3b-latest | $0.04 / M tokens (input and output) | Mistral Commercial License |

| 模型 | API 名 | la Plateforme 价格 | 许可 |
| --- | --- | --- | --- |
| Ministral 3B | ministral-3b-latest | 每百万 token 0.04 美元 (输入输出同价) | Mistral 商业许可 |

> **核对:** 两个模型的许可为什么不一样?
> 8B 一行写了商业和研究两种许可, 3B 一行只写商业许可. 下文说 「Ministral 8B Instruct」 的权重开放给研究用途, 和 8B 的研究许可对得上; 3B 的权重页面没提. 价格上 8B 是 3B 的 2.5 倍 (0.1 / 0.04).

For self-deployed use, [please reach out to us](https://mistral.ai/contact/) for commercial licenses. We will also assist you in lossless quantization of the models for your specific use-cases to derive maximum performance.

如需自行部署, 请[联系我们](https://mistral.ai/contact/)获取商业许可. 我们也会针对你的具体场景, 协助把模型做无损量化, 以发挥最大性能.

The model weights for [Ministral 8B Instruct](https://huggingface.co/mistralai/Ministral-8B-Instruct-2410) are available for research use. Both models will be available from our [cloud partners](https://docs.mistral.ai/deployment/cloud/overview/) shortly.

[Ministral 8B Instruct](https://huggingface.co/mistralai/Ministral-8B-Instruct-2410) 的模型权重已开放, 限研究用途. 两个模型很快也会在我们的[云合作伙伴](https://docs.mistral.ai/deployment/cloud/overview/)那里上线.

> **看表:** 「lossless quantization」 有对照分数吗?
> 没有. 页面没说量化到几 bit, 没给量化前后的分数, 「lossless」 只是一句承诺, 而且是按客户场景协助做, 不是随权重发布的量化版本.

## More to come (后续还有)

At Mistral AI, we continue pushing the state-of-the-art for frontier models. It's been only a year since the release of Mistral 7B, and yet our smallest model today (Ministral 3B) already outperforms it on most benchmarks. We can't wait for you to try out les Ministraux and give us feedback.

Mistral AI 会继续推进前沿模型的最高水平. Mistral 7B 发布才一年, 我们今天最小的模型 Ministral 3B 已经在多数基准上超过了它. 我们很期待你试用 les Ministraux 并给我们反馈.

> **拆开:** 「outperforms it on most benchmarks」 指基座还是指令版?
> 指令版 (表 2) 成立: Ministral 3B 在七列上全部高于 Mistral 7B. 基座 (表 1) 若按推断的行序 (第 3 行 Ministral 3B, 第 4 行 Mistral 7B), 露出的五列里 3B 只赢 HumanEval, 图 1 可读的四组里 3B 的浅橙柱也都低于 Mistral 7B 的中橙柱. 页面这句话没有说明比的是哪一版.

<!-- page 7 of 9 -->

![cookie 弹窗里 Hubspot 的橙色图标](images/p07-hl.png)

[Get in touch](https://mistral.ai/contact/)

顶栏链接: 联系我们.

![梗图上半: 披棕袍的师父背影牵着四只小乌龟, 师父身上标 MISTRAL 7B, 左上角年份标签被顶栏切掉一半](images/p07-2024.png)

2024

梗图下半的年份标签: 2024.

![cookie 弹窗里 Toggle all 的灰色开关图标, 处于关闭状态](images/p07-google-analytics-4-helps-us-measure-our-audience.png)

![cookie 弹窗选项右侧的空白复选框图标, 未勾选](images/p07-hubspot.png)

![cookie 弹窗里另一枚空白复选框图标, 同样未勾选](images/p07-close.png)

![梗图下半的右侧: 两只长大的乌龟背影, 分别标 PIXTRAL 和 MISTRAL SMALL, 左侧另外两只被 cookie 弹窗盖住](images/p07-accept-all.png)

这一页是一张两段式梗图: 上半是一年前的 Mistral 7B 牵着四个小家伙, 下半 「2024」 里它们长成了一排大乌龟, 露出的两只标着 Pixtral 和 Mistral Small. 页面没有给这张图配文字.

> **确认:** 梗图里被遮住的两只乌龟是谁?
> 看不到. 下半部分左侧被 cookie 弹窗盖住, 只露出 PIXTRAL 和 MISTRAL SMALL 两个标签, 另外两只标的是什么, 包括是不是 Ministral 3B 和 8B, 页面上读不出来.

<!-- page 8 of 9 -->

Products: Vibe, Vibe Code, Studio, Forge, Compute, Pricing

页脚 「产品」 栏: Vibe, Vibe Code, Studio, Forge, Compute (算力), Pricing (定价).

Solutions: [Delivery methodology](https://mistral.ai/solutions/), Model customization, Coding, Document intelligence, [Speech](https://mistral.ai/solutions/speech/), [Mistral for finance](https://mistral.ai/industry/finance/), [Mistral for public institutions](https://mistral.ai/industry/public-sector/), [Mistral for manufacturing](https://mistral.ai/industry/manufacturing/), [Mistral for energy & utilities](https://mistral.ai/industry/energy/)

页脚 「解决方案」 栏: 交付方法, 模型定制, 编程, 文档智能, 语音, 以及面向金融, 公共机构, 制造业, 能源与公用事业的 Mistral.

Why Mistral: About us, Careers, [Partners](https://mistral.ai/partners/), [Our customers](https://mistral.ai/customers), Our models, [Brand](https://mistral.ai/brand)

页脚 「为什么选 Mistral」 栏: 关于我们, 招聘, 合作伙伴, 客户, 我们的模型, 品牌.

Company

页脚 「公司」 栏标题.

<!-- page 9 of 9 -->

Terms of Service, Privacy Policy, Privacy choices, [Data processing agreement](https://legal.mistral.ai/terms/data-processing-addendum), [Trust Center](https://trust.mistral.ai/), [Legal notice](https://mistral.ai/legal/)

「公司」 栏条目: 服务条款, 隐私政策, 隐私选项, 数据处理协议, 信任中心, 法律声明.

Get Mistral Vibe. Download on the App Store. GET IT ON Google Play.

下载 Mistral Vibe: App Store, Google Play.

Mistral AI © 2026

English

页脚末尾: 版权行 「Mistral AI © 2026」; 语言切换 English. 版权年份是网页打印时的年份, 不是博文发布年份.
