[OM-FREEPLAY] 材料不够 5000. 这是 Mistral AI 官网的 Mistral Small 4 发布页, 标题 「Introducing Mistral Small 4」, 10 页, 6 张图, 不是论文. 下面只用这页印出来的数, 不从 Small 3, Small 3.1, Small 3.2 或同家族其他模型的页面搬参数. 两张柱状图的每个数都印在 PDF 嵌入的原图上, 不需要读柱高; 第 6 页那张 「Score vs. Output Length」 图没有抓到, 只能用正文里的数. 凡是自己算的比例, 平均, 差值, 都标了估算.

- 发布: **March 16, 2026**, 署名 Mistral AI, 官网 RESEARCH 栏.
- 定位: Small 系列下一个大版本, 把 Magistral (推理), Pixtral (多模态), Devstral (agentic 编码) 的能力合进一个模型.
- 结构: MoE, 128 个专家, 每 token 激活 4 个; 总参数 119B, 每 token 激活 6B, 算上 embedding 层和输出层 8B.
- 上下文: 256k, 单位没写.
- 模式: reasoning_effort 两档, 「none」 对标 Small 3.2 的对话风格, 「high」 对标 Magistral 的话量.
- 输入: 文本和图像.
- 速度: 端到端完成时间减少 40%, 每秒请求数是 Small 3 的 3 倍.
- 部署: 最低 4x HGX H100 / 2x HGX H200 / 1x DGX B200; 推荐 4x HGX H100 / 4x HGX H200 / 2x DGX B200.
- 许可和价格: Apache 2.0; 输入 $0.15, 输出 $0.6, 单位 /M tokens.
- 印出来的分数: 第 3 页 5 个基准 x 5 列, 25 个数; 第 5 页 4 个基准 x 3 列, 12 个数; 第 6 页正文 AA LCR 0.72, 输出长度 1.6K, 5.8 到 6.1K.
- 没印的: 层数, 隐藏维度, 注意力结构, 词表大小, 训练数据, 训练 token 数, 视觉编码器, 多语言范围, 安全评测.

## 1. 这页的底子

这页能用的材料分四块: 正文七八段, 一张结构参数列表, 两张自家模型对比柱状图, 以及第 6 页一段关于输出长度的文字. 和前几代发布页比, 这页难得把参数量, 专家数, 激活量, 上下文长度都写了出来, 但层数, 维度, 注意力方式, 视觉部分的结构仍然一个没给. 所以这页能分析的, 一半是 「它有多大, 怎么省」, 一半是 「它和自家哪一代比, 比出了什么」.

材料本身有损. 每页都叠着 cookie 横幅, 转出的 Markdown 把正文切得七零八落, 第 2 页的结构列表只剩几截碎片, 第 5 页的部署配置只剩 「0, 2x NVIDIA HGX H200, or 1x」 这样的碎片. PDF 文本层完整保住了正文, 两张柱状图的嵌入原图也完整. 唯一补不回来的是第 6 页的图: 页面上图的位置只有空白和图注, PDF 里没有嵌入这张图, images 目录里也没有, 所以第 6 页那三组 「分数对输出长度」 的数据, 除了正文点到的几个, 其余都看不到.

## 2. 结构: 119B 里每次只用 6B

结构列表是这页信息量最大的一段. 128 个专家选 4 个, 专家激活比例是 4/128, 约 3.1%; 参数激活比例是 6/119, 约 5.0%; 算上 embedding 层和输出层, 8/119, 约 6.7%. 三个比例依次变大, 说明除了被路由的专家, 每个 token 还要走一段固定的公共计算. 页面单独把 embedding 层和输出层的 2B 拎出来, 这 2B 占总参数约 1.7%, 但它们和词表大小, 隐藏维度相乘有关, 页面两个都没给, 反推不出词表多大.

页面没交代的地方更多. 没说有没有共享专家, 没说每层是否都是 MoE, 没说路由怎么做负载均衡, 也没说视觉输入经过什么编码器接进来. 「enabling efficient scaling and specialization」 这句是宣传语, 不是结构说明. 从 128 选 4 这个比例能读出的只有一点: 这是一个专家很多, 每次用得很少的稀疏设计, 计算量按 6B 到 8B 算, 权重却要按 119B 存. 后面讲部署和 「LIGHTWEIGHT」 标签时, 这个落差会反复出现.

## 3. 一个模型, 两种模式

第 3 页的图把 Small 4 的每根柱子分成两段: 实心段是 Instruct 分数, 斜线段顶上是 Reasoning 分数. 开推理带来的提升, 五项分别是 GPQA Diamond +12.1, MMLU Pro +4.5, IFBench +12.3, Arena Hard +2.5, MMMU-Pro +13.7. 提升大的是推理题, 指令约束题和视觉题, 提升小的是知识题和 Arena Hard. 五项平均从约 54.1 升到约 63.1.

这组数也暴露出 instruct 模式本身不算强. 五项里 instruct 一个第一都没拿, MMMU-Pro 46.3 还低于上一代 Small 3.2 的 49.1. 页面第 2 页说 「Native multimodality」, 第 4 页说 「none」 模式和 Small 3.2 的对话风格一样, 可在视觉基准上, 不开推理的 Small 4 反而比 Small 3.2 低 2.8 个点. 要在 MMMU-Pro 上拿第一, 得开推理, 这时是 60.

图上还有一个读法上的坑: 只有 Small 4 分了两种模式, Small 3.2, Medium 3.1, Large 3 的柱子都是单色, 没标是否开推理. 如果它们是非推理分, 那斜线顶上的数就是拿 Small 4 的推理分去比别人的普通分; 如果它们本身就是推理分, 页面也该说一声. 这个问题决定了下一节 「开推理拿三个第一」 能不能算数, 可页面没有给答案.

## 4. 和自家旧旗舰比: Medium 3.1, Large 3

第 3 页的对手全是 Mistral 自家模型, 标题也写明 「across internal models」. 开推理后, Small 4 在 GPQA Diamond (71.2), IFBench (48), MMMU-Pro (60) 三项第一, 分别领先第二名 5.5, 7.2, 6.0 个点. 输掉的两项是 MMLU Pro, 78 对 Large 3 的 80.9, 以及 Arena Hard, 58.3 对 Medium 3.1 的 67.3, 差 9.0 个点, 是五项里差距最大的一处.

五项等权平均, Small 4 reasoning 约 63.1, Large 3 约 60.7, Medium 3.1 约 58.9, Small 4 instruct 约 54.1, Small 3.2 约 49.0. 开推理的 Small 4 平均排第一, 不开推理则排在 Medium 3.1 和 Large 3 后面. 页面没印 Medium 3.1 和 Large 3 的参数量, 所以 「小模型打大模型」 这个读法这页撑不起来, 能说的只是名字上的档位.

纵轴从 20 起, 这一点会放大视觉差距. IFBench 上 48 对 34, 柱高是 28 对 14, 看着差一倍, 实际分数比约 1.41. 第 5 页的图纵轴从 0 起, 两张图放在一篇里, 视觉尺度不统一.

## 5. 和 Magistral 1.2 比: 推理这条线

第 5 页的图只比推理模型: Small 4 - High 对 Magistral Medium 1.2 和 Magistral Small 1.2. 对 Magistral Medium 1.2, 四项只赢 Collie (62.9 对 61.3), 输 LCR 1.8 个点, AIME25 0.6 个点, LiveCodeBench 2.5 个点; 四项平均约 70.4 对 71.2. 对 Magistral Small 1.2 四项全赢, LCR 上 71.2 对 27, 差 44.2 个点, 其余三项差 2.6 到 3.6 个点.

这张图放在 「Reasoning on demand」 一节后面, 读起来是在证明 「high」 档能顶替 Magistral. 数字支持的说法是: high 档大致追平 Magistral Medium 1.2, 明显好过 Magistral Small 1.2, 而对 Magistral Small 1.2 的优势主要集中在 LCR 一项. 去掉 LCR, 三项平均 Small 4 约 70.1, Magistral Medium 1.2 约 70.6, Magistral Small 1.2 约 67.1, 差距一下子收窄. 页面没给 Magistral 两款的参数量, 「追平」 背后的代价比不出来.

## 6. 输出长度: 第 6 页的效率论证

第 6 页的主张是 「分数相当, 输出更短」. 正文给出的数: AA LCR 上 Small 4 拿 0.72, 输出 1.6K 字符; Qwen 模型输出 5.8 到 6.1K, 是 Small 4 的 3.5 到 4 倍. 按 1.6K 算, 实际倍数约 3.6 到 3.8, 落在区间内, 但区间写宽了. LiveCodeBench 上 Small 4 超过 GPT-OSS 120B, 输出少 20%, 可两边的分数和长度都没印, 「20%」 以谁为基数也没说.

这一节最大的问题是图没抓到, 而且正文本身就不完整. 「three benchmarks」 只点名了两个, GPT-OSS 120B 一个数都没有, Qwen 没写是哪几个型号. 另外 0.72 和第 5 页 LCR 的 71.2 对不上: 换成同一尺度, 一个是 72, 一个是 71.2. 可能是不同轮次, 不同推理档位, 或者 「AA LCR」 和 「LCR」 本来就不是同一套设置, 页面没交代. 用字符数而不是 token 数衡量输出长度, 也让它和价格 (按 token 计) 没法直接换算.

## 7. 速度与部署

速度只有两个相对数: 端到端完成时间减少 40% (延迟优化配置), 每秒请求数 3 倍 (吞吐优化配置), 比较对象是 Small 3. 两条都没给硬件, 并发, 序列长度, 也没说 Small 4 此时是不是 「none」 档. 值得注意的是, 分数对比用的是 Small 3.2, 速度对比用的是 Small 3, 两条基线不是同一个版本.

部署配置有一处明显不整齐: 最低配置和推荐配置里 H100 都是 「4x NVIDIA HGX H100」, H200 和 B200 都从最低到推荐翻了一倍. 权重按每参数 2 字节约 238 GB, 按 1 字节约 119 GB, 页面没写精度, 也没说 「4x HGX」 的 4x 数的是卡还是机器, 这组配置和模型大小对不上号. 推理框架写了 vLLM, llama.cpp, SGLang, Transformers, 并说和 NVIDIA 一起为 vLLM 和 SGLang 做了优化, 首日上 NVIDIA NIM, 可以用 NeMo 微调.

## 8. 开放与价格

许可是 Apache 2.0, 页面从第 2 页到第 8 页反复强调开源, 第 5 页还写了 「fully open source」. 权重放在 Hugging Face 的 mistralai/mistral-small-4 合集, 同时在 Mistral API, AI Studio 和 build.nvidia.com 上可用. 第 2 页顺带宣布 Mistral 以创始成员身份加入 NVIDIA Nemotron Coalition, 这是这页里唯一的组织层面新闻.

价格只在第 8 页的模型卡片上: 输入每百万 token $0.15, 输出 $0.6, 输出是输入的 4 倍. 按 3:1 混合约 $0.26, 按 1:1 混合约 $0.38 每百万 token (混合比例为假设值). 正文没有拿价格和任何对手比. 卡片上的四个标签里, LIGHTWEIGHT 和 119B 的权重规模放在一起有些别扭; 按本页的数, 轻的是每 token 的计算量, 存储和部署并不轻.

## 9. 谱系: 三条线并成一条

这页给出的谱系线索, 是 Mistral 把原本分开的几条产品线收回到 Small 系列. 第 1 页说合并的是 Magistral (推理), Pixtral (多模态), Devstral (agentic 编码) 三条旗舰线; 第 4 页的说法变成 Magistral, Devstral 和 Mistral Small (instruct), Pixtral 不见了, 换成了 Small 自己. 两处列举不一致, 说明 「统一」 更像是能力层面的对标, 而不是某几个具体模型的合并. 页面没说 Small 4 是从哪个底座训出来的, 也没说这三条线以后还单独更新不.

对标关系在两张图里各有体现. 第 3 页拿 Small 4 去比自家 Small 3.2, Medium 3.1, Large 3, 意思是 「Small 档位已经能碰到中大档位」; 第 5 页拿 high 档去比 Magistral Medium 1.2 和 Magistral Small 1.2, 意思是 「推理专线可以由通用模型的一个档位代替」. reasoning_effort=「none」 对标 Small 3.2 的对话风格, 「high」 对标 Magistral 的话量, 这两句把新旧产品的对应关系写得很直白. 至于 Pixtral 和 Devstral 这两条线, 图里没有出现任何一款 Pixtral 或 Devstral 模型, 多模态只有一个 MMMU-Pro, 编码只有一个 LiveCodeBench, 「合进来」 的证据比推理那条线薄得多.

## 10. 本页对不上的数字

跨图和跨段: 第 6 页 「AA LCR ... 0.72」, 第 5 页 LCR 上 Small 4 - High 是 71.2, 同一尺度差 0.8; 「Qwen models need 3.5-4x more output (5.8-6.1K)」, 按 1.6K 算是 3.6 到 3.8 倍, 区间写宽; 部署配置里 H100 的最低配置和推荐配置都是 「4x NVIDIA HGX H100」, 另两种卡都翻倍; 速度对比的基线是 Small 3, 分数对比和 「none」 档对标的是 Small 3.2; 第 1 页合并的三条线是 Magistral, Pixtral, Devstral, 第 4 页变成 Magistral, Devstral, Mistral Small.

宣传句和数字之间: 「matching or surpassing GPT-OSS 120B on all three benchmarks」 没有一个 GPT-OSS 的数可核, 三个基准只点名两个; 「Native multimodality」 下, instruct 模式的 MMMU-Pro 46.3 低于 Small 3.2 的 49.1; 卡片标 LIGHTWEIGHT, 总参数 119B. 转换稿和 PDF 之间: 转出的 Markdown 丢了 「Performance highlights」 标题, 结构列表和部署配置只剩碎片, 两张图没有转出任何数字. 两张嵌入原图内部的数字没有自相矛盾的地方.
