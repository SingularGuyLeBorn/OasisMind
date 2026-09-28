[OM-FREEPLAY] 材料不够 5000. 这是 Mistral AI 官网的 Mistral Large 2 发布页, 标题 「Large Enough」, 11 页, 9 张图, 不是论文. 下面只用这页印出来的数和图, 不补结构, 不从同家族其他模型搬参数. 图表都没有数据标签, 凡是读柱高, 读散点得来的数和自己算的数, 都标了估算.

- 发布: **July 24, 2024**, 署名 Mistral AI team, 官网 RESEARCH 栏.
- 名字: Mistral Large 2, la Plateforme 和 API 名 mistral-large-2407, 版本 24.07 (YY.MM 版本号); MultiPL-E 表里写作 「Mistral Large 2 (2407)」.
- 规模: **123 billion** 参数, 按单节点推理设计.
- 上下文: 128k, 没写单位.
- 语言: 几十种自然语言, 80+ 种编程语言.
- 印出来的分数: 预训练版 MMLU 84.0%; MultiPL-E 表一张 (6 行 x 8 列).
- 只能读图的: 代码四组, 数学两组, 对齐三组, 生成长度, 多语言 MMLU 九种语言, Function Calling, 三张参数量散点图.
- 许可: Mistral Research License, 允许研究和非商业用途; 商用自部署要买 Mistral Commercial License.
- 权重: instruct 模型权重开放, 托管在 HuggingFace.
- 没印的: 模型结构, 层数, 训练 token 数, 数据配比, 训练算力, 价格, 延迟.

## 1. 这页一共印了哪些数

和模型本身有关的数只有几个: 123B, 128k, 80+, 24.07 这个版本号, 以及发布日期. 分数方面, 正文只给了一个 MMLU 84.0%, 而且注明是预训练版. 真正成表的只有第 4 页的 MultiPL-E, 6 个模型 x 7 种语言外加一列平均, 共 48 个百分数.

其余的评测结果全在柱状图和散点图里, 没有一根柱子标了数值. 这篇对照稿和分析里所有 「约 xx」 都是对着坐标轴读出来的, 误差在半个到一个刻度之间. 另外 cookie 横幅在 11 页里每页都有, 把第 2 到第 9 页的图挡掉一块. 转出的 Markdown 因此丢了很多正文, 好在 PDF 文本层完整, 被挡的图也能从 PDF 里嵌着的原图读到.

## 2. 123B 和 「单节点」

页面给 123B 配的说法是 「allows it to run at large throughput on a single node」. 页面没写精度, 按每参数 2 字节算, 权重约 246 GB (估算), 单张 80 GB 的卡放不下. 所以 「single node」 只能读作一台多卡机器, 页面没说这台机器几张卡, 也没给吞吐数字.

三张散点图把这个规模摆到了 Llama 3.1 70B 和 405B 中间. 横轴是 「# of Parameters」, 没印单位, Mistral Large 2 画在约 123 处, 和正文的 123B 对得上. 按名字里的规模算, 405B 约是 123B 的 3.3 倍, 70B 约是它的 0.57 倍 (估算). 左上角那块 「Best performance/size ratio」 三角是作者自己画的区域, 边界怎么定没交代, Mistral Large 2 恰好落在里面, 405B 在外面.

## 3. 代码: 一张表和四组柱子

MultiPL-E 表的 Average 列可以完整复算. 六行各自把七种语言求平均, 四舍五入后是 76.9, 60.4, 74.9, 75.8, 68.5, 77.9, 和表上逐一一致. 加粗是每列最大值, 「paper」 行也参与比较: Bash 最高是自测的 Llama 3.1 405B (58.2%), C# 最高是 Llama 3.1 405B 的论文分 (64.4%).

这张表里 Mistral Large 2 不是第一. 平均分 GPT-4o 77.9%, Mistral Large 2 76.9%. 七种语言里它只在 Java (84.2%) 拿了最高, C# 比 GPT-4o 高 1.3 个点, 其余五种比 GPT-4o 低 1.2 到 2.5 个点. 对上一代的提升很整齐, Python 高 22.0 个点, 其余六种高 13.9 到 17.4 个点. 对自测的 Llama 3.1 405B, 平均高 2.0 个点, 但 Bash 低 6.3 个点.

| 模型 (读图估算) | Human Eval | Human Eval Plus | MBPP Base | MBPP Plus | 四组平均 |
|---|---|---|---|---|---|
| Mistral Large 2 | 92 | 86.5 | 80 | 69 | 81.9 |
| GPT 4o | 93 | 88.5 | 84 | 69.5 | 83.8 |
| Claude 3.5 Sonnet | 86.5 | 82.5 | 91 | 75.5 | 83.9 |
| Llama 3.1 405B | 84 | 80 | 88 | 74 | 81.5 |
| Llama 3.1 70B | 79 | 77 | 83 | 71 | 77.5 |
| Mistral Large | 70 | 64.5 | 67.5 | 57 | 64.8 |

四组柱子里, Mistral Large 2 在 HumanEval 两组都是第二, 只输给 GPT 4o; 在 MBPP 两组只排第 6, Claude 3.5 Sonnet, Llama 3.1 405B, Claude 3 Opus, Llama 3.1 70B, GPT 4o 都在它上面, MBPP Plus 上 GPT 4o 只高一点. 按四组等权平均, 它约 81.9, 低于 Claude 3.5 Sonnet 约 83.9 和 GPT 4o 约 83.8 (估算). 第 2 页那张代码散点图的三个点, 正好和这个平均对得上, 但散点图里只画了 Llama, 没画这两家更高的闭源模型.

还有一处对位: Human Eval 柱高和 MultiPL-E 的 Python 列几乎相同. Mistral Large 2 约 92 对 92.1%, GPT 4o 约 93 对 93.3%, Llama 3.1 405B 约 84 对 84.1%, Llama 3.1 70B 约 79 对 78.7% (估算). 页面没说两者是同一组测量, 但读数看起来是一回事.

## 4. 测量值和论文值

MultiPL-E 表把 Llama 3.1 405B 列了两行, 一行自测 (measured), 一行抄论文 (paper), 表注说只有 paper 行不走同一评测流程. 平均分 74.9% 对 75.8%, 自测低 0.9 个点. 逐列看, Python 和 C# 都低 4.9 个点, PHP 低 2.5 个点, Java 和 TypeScript 反而高 2.5 个点, C++ 相同, Bash 高 0.6 个点.

这组对照说明同一个模型换一套流程, 单列能差近 5 个点. Mistral Large 2 和 GPT-4o 的平均差距只有 1.0 个点, 比这个流程误差还小. 页面把两行都印出来, 算是坦白, 但没解释流程差在哪, 读者也就没法判断 1.0 个点的领先或落后有多牢.

## 5. 数学: 正文和图的顺序

第 3 页正文讲数学, 结尾一个冒号, 后面接的却是代码图, 图注也写的是 code generation. 数学图要到第 4 页, 排在 MultiPL-E 表后面. 数学图的图注写 「MATH (0-shot, no CoT)」, 图里的组名写 「Math Instruct (0-shot no CoT)」, 图注末尾还有 「generation benchmarks」 这个多出来的词, 像是从代码图注复制过来没删干净.

读柱高, Mistral Large 2 在 GSM8K (8-shot) 约 93, 低于 Claude 3.5 Sonnet 约 95, Llama 3.1 70B 约 94, Llama 3.1 405B 约 96; 在 Math Instruct 约 70, 低于 GPT 4o 约 76, 高于 Llama 3.1 405B 约 67 (都是估算). 正文说的是 「improved model performance」, 这个说法对上一代成立: Mistral Large 在 Math Instruct 上约 49.5, 提升约 20 个点 (估算). 拿去和对手比, 它在两组里都不是第一.

## 6. 对齐和生成长度

对齐三项里, Mistral Large 2 在 Wild Bench 约 56 排第二, 在 Arena Hard 约 73 排第三, 在 MT Bench 约 8.63 排第三 (都是估算). 三项里压过它的总是 GPT 4o, Arena Hard 和 MT Bench 上还有 Claude 3.5 Sonnet. MT Bench 用 GPT-4o 当裁判, 等于 GPT-4o 给自己打分, 页面没提这个偏差. MT Bench 纵轴从 6 起, 前三名差距不到 0.1, 图上看着却有一截.

生成长度那张图的用意是说明 Mistral Large 2 分数高不靠写得长. 它约 1470, 比六个对手都短, 但比上一代 Mistral Large 约 1300 长了约 13% (估算). 横轴没印单位, 字符还是 token 看不出来. 正文说 「generations remain succinct」, 这句和对手比成立, 和自家上一代比不成立.

## 7. 多语言: 13 种和 9 种

第 6 页正文列了 13 种 「excels in」 的语言, 第 7 页的柱状图只有 9 种: FR, DE, ES, IT, NL, PT, RU, JA, ZH. 英语, 韩语, 阿拉伯语, 印地语都没测. 第 2 页那份支持语言清单有阿拉伯语和印地语, 却没有荷兰语; 第 7 页图里又有荷兰语. 三处语言集合各不相同.

九种语言里, Mistral Large 2 每一种都低于 Llama 3.1 405B, 差距约 0.3 到 1.6 个点, 平均约 80.5 对 81.4 (估算). 对上一代的提升在中文和日语上最大, 中文约从 62.6 到 74.8, 日语约从 69.6 到 78.8 (估算). 页面给它的定位是散点图里那块三角: 参数约是 405B 的 0.30 倍, 分数只差不到 1 个点 (估算). 这个说法和图一致, 只是 「excels」 需要按这个前提理解.

## 8. Function Calling 和其他没有名字的图

Function Calling 那张图只有标题和 Accuracy (%) 纵轴, 没写是哪个基准, 没有图注, 对比对象也换了: 没有 Llama, 没有 Command R+, 只有 Mistral Large, 两个 Claude 和 GPT 4o. Mistral Large 2 约 48 最高, GPT 4o 约 47, 上一代约 21 (估算). 这是本页唯一一张 Mistral Large 2 排第一的柱状图, 恰好也是信息最少的一张.

正文说它能 「proficiently execute both parallel and sequential function calls」, 图里并没有区分并行和串行. 检索能力 (「retrieval skills」) 也只在这句话里出现, 没有对应的图. 同样, 第 3 页讲的幻觉控制和 「承认不知道」 两件事, 本页没有一个专门的指标.

## 9. 许可, 版本和上架

许可分两层: Mistral Research License 允许研究和非商业用途的使用和修改, 需要自部署的商用得联系团队买 Mistral Commercial License. 开放的是 instruct 模型的权重. 可 MMLU 84.0% 和多语言 MMLU 都注明是在预训练基座上测的, 页面没说基座权重开不开. 报分的模型和能下载的模型不是同一份, 这一点容易被忽略.

版本号 24.07 是 YY.MM 格式, 页面说以后所有模型都用这套, 所以 mistral-large-2407 里的 2407 就是 2024 年 7 月. 云平台方面, 上线表里 Mistral Large 2 (24.07) 在 Google Vertex AI, Azure AI Studio, Amazon Bedrock, IBM watsonx.ai 四家都打勾. Mistral Nemo 两家打勾, Codestral 一家, 云上 Finetuning 一家也没打勾, 两家 「Coming soon」. 正文说的 「今天开放微调」 指的是 la Plateforme, 不是云平台.

## 10. 谱系: 这页能说什么

这页能确定的谱系信息都来自正文的几句话. 第一, 代码方面它接着 Codestral 22B 和 Codestral Mamba 的经验, 训练时放了 「very large proportion of code」, 比例没写. 第二, 它的前一代是 「the previous Mistral Large」, MultiPL-E 表里写作 「Mistral Large 1 (2402)」, 其他图里写作 「Mistral Large」. 这页只给了前一代的分数, 没给它的参数量或结构.

第三, 这页顺带画了 2024 年 7 月时 Mistral 在 la Plateforme 上的产品线: 通用模型收拢成 Mistral Nemo 和 Mistral Large 两个, 专用模型是 Codestral 和 Embed. Apache 许可的 Mistral 7B, Mixtral 8x7B, Mixtral 8x22B, Codestral Mamba, Mathstral 逐步从 la Plateforme 下线, 但仍可以用 mistral-inference 和 mistral-finetune 自己部署和微调. 页脚里的 Vibe, Studio, Forge 等是 2026 年抓页时的站点导航, 不要当成和 Mistral Large 2 同期的产品.

## 11. 本页对不上的地方

最硬的几处: 正文说和 「Llama 3 405B」 打平, 图表里只有 Llama 3.1 405B; 第 3 页数学段落的冒号后接的是代码图; 数学图的图注写 MATH, 图里写 Math Instruct, 图注还多了 「generation benchmarks」; 正文列 13 种擅长语言, 图里只测 9 种, 第 2 页清单又少了荷兰语; MMLU 84.0% 说的是 「performance/cost Pareto front」, 可本页的 Pareto 图横轴都是参数量, 也没有一张画 84.0%.

小地方: 对齐图的图注把 evaluation 拼成 「evalutation」; Wild Bench/Arena Hard 图把 Llama 3.1 405B 标成 「LLama 3.1 405」, 少了 B; 不同图的柱子顺序不一样, Llama 两根在代码图里夹在 Claude 中间, 在数学图里排到 GPT 4o 后面, 颜色又相近, 容易读错. 自称 「succinct」 的 Mistral Large 2 比上一代长约 13% (估算). MultiPL-E 表的数字本身没有对不上的, Average 列六行都能复算.
