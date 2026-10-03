源文: Mistral AI 官网博文 Mistral NeMo, 2024 年 7 月 18 日, 网页打印 6 页, 6 张图. 英文段在前, 中文意译紧跟. 正文英文按 PDF 文字层校正; 每页都叠着同一个 axeptio cookie 弹窗和顶栏 「Get in touch」, 弹窗文字只在第 1 页录一次. 表 1 和表 2 的左侧列, 图 1 的左中两格都被弹窗遮住, 表里只录露出来的格子.

<!-- page 1 of 6 -->

[Get in touch](https://mistral.ai/contact/)

顶栏链接: 联系我们.

**RESEARCH**

栏目: 研究.

# Mistral NeMo

July 18, 2024

By Mistral AI team

2024 年 7 月 18 日, 作者 Mistral AI 团队.

Today, we are excited to release Mistral NeMo, a 12B model built in collaboration with NVIDIA. Mistral NeMo offers a large context window of up to 128k tokens. Its reasoning, world knowledge, and coding accuracy are state-of-the-art in its size category. As it relies on standard architecture, Mistral NeMo is easy to use and a drop-in replacement in any system using Mistral 7B.

今天发布 Mistral NeMo, 一个和 NVIDIA 合作打造的 12B 模型. 它的上下文窗口最长 128k token. 在同一尺寸档里, 它的推理, 世界知识和代码准确率都是最好的. 由于用的是标准架构, Mistral NeMo 上手容易, 任何在用 Mistral 7B 的系统都可以直接把它换进去.

> **想:** 名字里的 12B 之外, 页面有没有印总参数和激活参数?
> 名字里的 12B 只出现在 「a 12B model」 这一句. 总参数: 本页未印. 激活参数: 本页未印. 六页里也没有层数, 隐藏维度, 头数, 词表大小这些规格.

> **问:** 说是 Mistral 7B 的 「drop-in replacement」, 可第 2 页又说换了新 tokenizer, 旧系统真能直接换吗?
> 页面没有解释. tokenizer 从 SentencePiece 换成基于 Tiktoken 的 Tekken 之后, 同一段文本切出的 token 序列就不一样了, 旧系统至少要连 tokenizer 一起换; 「drop-in」 指到哪一层 (接口, 推理框架, 还是整套流水线), 本页没有界定.

We have released pre-trained base and instruction-tuned checkpoints checkpoints under the Apache 2.0 license to promote adoption for researchers and enterprises. Mistral NeMo was trained with quantisation awareness, enabling FP8 inference without any performance loss.

预训练基座和指令微调两套 checkpoint 都已按 Apache 2.0 许可发布, 方便研究者和企业采用. Mistral NeMo 训练时做了量化感知, 因此可以用 FP8 推理, 性能不受任何损失. (原文 「checkpoints」 连写了两遍, 照录.)

> **核对:** 「without any performance loss」 有对应的数字吗?
> 没有. 本页没有 FP8 推理和更高精度推理的对照分数, 也没说在哪些基准上比过, 「零损失」 只是一句陈述.

The following table compares the accuracy of the Mistral NeMo base model with two recent open-source pre-trained models, Gemma 2 9B, and Llama 3 8B.

下表把 Mistral NeMo 基座模型的准确率, 和两个近期开源的预训练模型 Gemma 2 9B, Llama 3 8B 做对比.

| 行 (左侧列含模型名, 被遮) | MMLU (5-shot) | OpenBookQA (0-shot) | CommonSenseQA (0-shot) | TruthfulQA (0-shot) |
| --- | --- | --- | --- | --- |
| 第 1 行 (背景高亮) | 68.0% | 60.6% | 70.4% | 50.3% |
| 第 2 行 | 71.5% | 50.8% | 60.8% | 46.6% |
| 第 3 行 | 62.3% | 56.4% | 66.7% | 43.0% |

表 1 露出的四列如上, 加粗按原图. 表的左半部分 (模型名和可能的其他列) 被弹窗盖住, 行名无法确认.

> **看表:** 高亮的第 1 行在 MMLU 上反而不是最高, 怎么回事?
> 第 1 行三格加粗, MMLU 却是 68.0%, 比第 2 行的 71.5% 低 3.5 个点, 这一列加粗的是第 2 行. 行名被遮; 若按图注顺序第 1 行是 Mistral NeMo, 「state-of-the-art in its size category」 在 MMLU 这一列不成立, 其余三列第 1 行都最高.

Cookies

左下角按钮: Cookies.

CERTIFIED BY axeptio. Here are our cookies! Light and completely harmless. On this website, we use cookies to measure our audience, nurture our relationship with you and, from time to time send you some quality content and some advertisement. You can select here those you allow to stay. Toggle all. Google Analytics 4: Helps us measure our audience. Hubspot: Tool for customer relationship management. Close / Accept all / Next.

弹窗 (axeptio 认证): 「这是我们的 cookie! 轻巧, 完全无害. 本站用 cookie 统计访问量, 维系和你的关系, 并不时给你推送一些优质内容和广告. 你可以在这里选择留下哪些.」 选项: 全部开关; Google Analytics 4, 帮我们统计访问量; Hubspot, 客户关系管理工具. 按钮: 关闭, 全部接受, 下一步. 这个弹窗在第 2 到第 6 页原样重复, 不再录.

<!-- page 2 of 6 -->

Table 1: Mistral NeMo base model performance compared to Gemma 2 9B and Llama 3 8B.

表 1: Mistral NeMo 基座模型与 Gemma 2 9B, Llama 3 8B 的性能对比.

## Multilingual Model for the Masses (面向大众的多语言模型)

The model is designed for global, multilingual applications. It is trained on function calling, has a large context window, and is particularly strong in English, French, German, Spanish, Italian, Portuguese, Chinese, Japanese, Korean, Arabic, and Hindi. This is a new step toward bringing frontier AI models to everyone's hands in all languages that form human culture.

这个模型面向全球化的多语言应用. 它训练过函数调用, 上下文窗口大, 在英语, 法语, 德语, 西班牙语, 意大利语, 葡萄牙语, 中文, 日语, 韩语, 阿拉伯语和印地语上尤其强. 这是往前迈的一步: 让每个人都能用自己文化里的语言用上前沿 AI 模型.

> **拆开:** 正文点名 11 种语言, 图 1 的 MMLU 格画了哪几种?
> 图 1 MMLU 格是 FR, DE, ES, IT, NL, PT, RU, ZH, JA, KO 共 10 种, 和正文重合的只有 8 种. 正文点名的英语, 阿拉伯语, 印地语不在图里; 图里的荷兰语 (NL) 和俄语 (RU) 又不在正文名单里.

![图 1 左格和中格: 顶部只露出 Hellaswag 与 Arc Challenge 两个小标题, 其余被 axeptio cookie 弹窗整块遮住](images/p02-toggle-all.png)

![图 1 右格 MMLU: FR, DE, ES, IT, NL, PT, RU, ZH, JA, KO 十种语言各一对橙蓝柱, 纵轴 Accuracy (%) 从 30 到 70, 图例被遮](images/p02-ual-benchmarks.png)

Figure 1: Mistral NeMo performance on multilingual benchmarks.

图 1: Mistral NeMo 在多语言基准上的表现.

> **确认:** 橙柱和蓝柱各是谁, 差多少?
> 图例被遮, 分不出. 按像素读柱高 (读图), 橙柱依次约 62, 62, 64, 61, 57, 63, 59, 59, 59, 44, 蓝柱约 51, 52, 54, 52, 50, 52, 48, 51, 52, 40; 十种语言都是橙高于蓝, 差距从 KO 的约 4 点到 RU 的约 11 点.

> **回看:** 第 1 页说 128k, 这里又说 「large context window」, 六页里有长上下文的评测吗?
> 回看全部六页, 没有. 128k 只以 「up to 128k tokens」 出现一次, 没有长文检索, 长文问答之类的分数, 也没说训练时见过多长的序列.

## Tekken, a more efficient tokenizer (Tekken: 更高效的 tokenizer)

Mistral NeMo uses a new tokenizer, Tekken, based on Tiktoken, that was trained on over more than 100 languages, and compresses natural language text and source code more efficiently than the SentencePiece tokenizer used in previous Mistral models. In particular, it is ~30% more efficient at compressing source code, Chinese, Italian, French, German, Spanish, and Russian. It is also 2x and 3x more efficient at compressing Korean and Arabic, respectively. Compared to the Llama 3 tokenizer, Tekken proved to be more proficient in compressing text for approximately 85% of all languages.

Mistral NeMo 用了一个新的 tokenizer, 叫 Tekken, 基于 Tiktoken, 在 100 多种语言上训练. 和此前 Mistral 模型用的 SentencePiece tokenizer 相比, 它压缩自然语言文本和源代码的效率更高. 具体说, 在源代码, 中文, 意大利语, 法语, 德语, 西班牙语和俄语上效率高约 30%; 在韩语和阿拉伯语上分别高 2 倍和 3 倍. 和 Llama 3 的 tokenizer 相比, Tekken 在大约 85% 的语言上压缩得更好.

> **停一下:** 「over more than 100 languages」 和 「approximately 85% of all languages」 的分母各是什么?
> 页面都没交代. 前者把 over 和 more than 叠在一起, 只能读成 「100 多种」; 后者没说 「all languages」 是训练用的那 100 多种还是别的集合, 和 Llama 3 tokenizer 的比较也没有任何图表.

<!-- page 3 of 6 -->

![cookie 弹窗里 Toggle all 的灰色开关图标, 处于关闭状态](images/p03-image.png)

![图 2 Tekken 压缩率柱状图: English 1.12, Code 1.28, Chinese 1.28, Italian 1.28, French 1.31, German 1.33, Spanish 1.35, Russian 1.36, Portuguese 1.37, Japanese 1.56, Vietnamese 1.85, Korean 2.22, Bengali 2.48, Hindi 2.75, Arabic 3.02, Malayalam 柱顶超出 3.5 被裁掉](images/p03-figure-2-tekken-compression-rate.png)

Figure 2: Tekken compression rate.

图 2: Tekken 压缩率.

> **再看:** 正文的 「~30% more efficient」 对得上图 2 吗?
> 图 2 里 Code, Chinese, Italian 都是 1.28, French 1.31, German 1.33, Spanish 1.35, Russian 1.36, 落在 1.28 到 1.36 之间, 按 「压缩率 1.3 = 效率高 30%」 的读法对得上. 换成 token 数, 同一段文本只剩原来的 1/1.36 到 1/1.28, 即少约 22% 到 26%, 不是少 30%.

> **对一下:** 韩语 2 倍, 阿拉伯语 3 倍对得上吗, 压缩率是相对谁算的?
> 图 2 Korean 2.22, Arabic 3.02, 和 「2x and 3x」 对得上. 图的可见部分没有标基线, 纵轴只写 「Compression ratio」; 按正文, 比较对象是 「previous Mistral models」 用的 SentencePiece tokenizer, 没说是哪个型号.

> **想:** 图 2 还有哪些数正文没提?
> English 只有 1.12, 全图最低; Portuguese 1.37 比名单里的 Russian 1.36 还高, 却不在 「~30%」 名单里; Japanese 1.56, Vietnamese 1.85, Bengali 2.48, Hindi 2.75 都没进正文; Malayalam 柱顶超出 3.5 被裁掉, 数值看不到.

## Instruction fine-tuning (指令微调)

Mistral NeMO underwent an advanced fine-tuning and alignment phase. Compared to Mistral 7B, it is much better at following precise instructions, reasoning, handling multi-turn conversations, and generating code.

Mistral NeMo 经过了一轮进阶的微调和对齐. 和 Mistral 7B 相比, 它在遵循精确指令, 推理, 多轮对话和生成代码上都强得多. (原文此处写作 「NeMO」, 大小写与标题不同.)

| 行 (左侧列含模型名, 被遮) | WildBench |
| --- | --- |
| 第 1 行 | 25.55 |
| 第 2 行 | 28.77 |
| 第 3 行 (背景高亮) | 42.57 |

表 2 只露出最右一列, 列头首字母被裁, 可见部分为 「ildBench」.

Table 2: Mistral NeMo instruction-tuned model accuracy. Evals done with GPT4o as judge on official references.

表 2: Mistral NeMo 指令微调模型的准确率. 评分由 GPT4o 当评委, 对照官方参考答案给出.

> **问:** 表 2 只露出一列, 能读出什么?
> 第 3 行高亮加粗, 42.57, 比第 1 行 25.55 高 17.02, 比第 2 行 28.77 高 13.80, 约为两者的 1.67 倍和 1.48 倍. 行名被遮, 看不出哪一行是 Mistral 7B, 也看不出另外几列比了什么.

> **核对:** 图注写 「accuracy」, 这三个数是百分比吗?
> 页面没说单位和满分. GPT4o 当评委打出的分叫 「accuracy」 并不贴切, 25.55 这类两位小数也没注明量纲, 只能当同一量表内的相对高低来读.

## Links (链接)

<!-- page 4 of 6 -->

Weights are hosted on HuggingFace both for the base and for the instruct models. You can try Mistral NeMo now with mistral-inference and adapt it with mistral-finetune. Mistral NeMo is exposed on la Plateforme under the name <strong><u>open-mistral-nemo-2407</u></strong>. This model is also packaged in a container as NVIDIA NIM inference microservice and available from [ai.nvidia.com](https://ai.nvidia.com/).

基座和指令版的权重都放在 HuggingFace 上. 现在就可以用 mistral-inference 试用 Mistral NeMo, 用 mistral-finetune 做适配. 它在 la Plateforme 上的名字是 open-mistral-nemo-2407. 模型还打包成容器, 作为 NVIDIA NIM 推理微服务, 可以在 ai.nvidia.com 获取.

Products: [Vibe](https://mistral.ai/products/vibe/), [Vibe Code](https://mistral.ai/products/vibe/code/), [Studio](https://mistral.ai/products/studio/), [Forge](https://mistral.ai/products/forge/), Compute, Pricing

页脚 「产品」 栏: Vibe, Vibe Code, Studio, Forge, Compute (算力), Pricing (定价).

Solutions: Delivery methodology, Model customization, Coding, Document intelligence, Speech, Mistral for finance, Mistral for public institutions, Mistral for manufacturing, Mistral for energy & utilities

页脚 「解决方案」 栏: 交付方法, 模型定制, 编程, 文档智能, 语音, 以及面向金融, 公共机构, 制造业, 能源与公用事业的 Mistral.

Why Mistral: [About us](https://mistral.ai/about/), [Careers](https://mistral.ai/careers/)

页脚 「为什么选 Mistral」 栏: 关于我们, 招聘.

<!-- page 5 of 6 -->

Partners, Our customers, [Our models](https://mistral.ai/models/), [Brand](https://mistral.ai/brand)

页脚续: 合作伙伴, 客户, 我们的模型, 品牌.

Company: [Terms of Service](https://legal.mistral.ai/terms), [Privacy Policy](https://legal.mistral.ai/terms/privacy-policy?language=en-US), Privacy choices, [Data processing agreement](https://legal.mistral.ai/terms/data-processing-addendum), [Trust Center](https://trust.mistral.ai/), [Legal notice](https://mistral.ai/legal/)

页脚 「公司」 栏: 服务条款, 隐私政策, 隐私选项, 数据处理协议, 信任中心, 法律声明.

Get Mistral Vibe

Mistral AI © 2026

English

页脚末尾: 下载 Mistral Vibe; 版权行 「Mistral AI © 2026」; 语言切换 English. 版权年份是网页打印时的年份, 不是博文发布年份.

<!-- page 6 of 6 -->

![cookie 弹窗选项右侧的空白复选框图标, 未勾选](images/p06-image.png)

![cookie 弹窗里另一枚空白复选框图标, 同样未勾选](images/p06-h.png)

[Get in touch](https://mistral.ai/contact/)

本页只剩顶栏, 顶栏下方一条红色装饰带和同一个 cookie 弹窗, 没有正文.
