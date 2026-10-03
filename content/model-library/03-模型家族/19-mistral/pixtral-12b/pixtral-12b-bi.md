源文: Mistral AI 官网博文 「Announcing Pixtral 12B」, 2024 年 9 月 17 日发布, 2026/9/25 打印, 共 22 页, 30 张图. 英文段在前, 中文意译紧跟. 转出的 Markdown 被 cookie 弹窗打乱了很多句子, 英文一律按 PDF 文字层校正 (例如 Markdown 里的 「pixtral-12h-2409」, 文字层是 「pixtral-12b-2409」). 每页的页眉 「2026/9/25 13:49 [Deprecated] Pixtral 12B | Mistral AI」, 页脚网址和页码, 顶栏 「Get in touch」, 以及左下角同一个 axeptio cookie 弹窗, 只在第 1 页录一次. 第 4 页的对比表, 第 7 页的架构图, 第 11 页的两张输入表, 第 13 页的手绘草图在 images 目录里没有单独的图文件, 按渲染出来的页面抄录露出的部分.

<!-- page 1 of 22 -->

**Banner.** Heads up: this model is deprecated. Pixtral 12B is no longer maintained and has been replaced by our latest, more powerful vision and multimodal models. [Explore our current vision capabilities](https://docs.mistral.ai/capabilities/vision)

**横幅.** 提醒: 这个模型已经弃用. Pixtral 12B 不再维护, 已由我们更新, 更强的视觉和多模态模型接替. 链接: 了解我们现在的视觉能力.

![页首装饰插画: 左侧一根深蓝竖条, 中间墨绿色方块排成阶梯, 底部是黄色方块, 薄荷绿底色, 左上角露出一角橙色的弃用横幅](images/p01-replaced-by-our-latest-more.png)

> **想:** 横幅说已弃用, 页面给了弃用日期和替代型号吗?
> 没有. 第 1 页横幅只写 「replaced by our latest, more powerful vision and multimodal models」, 没点型号, 也没写哪天停止维护; 页面上的时间只有发布日期 September 17, 2024 和页眉打印时间 2026/9/25.

[Get in touch](https://mistral.ai/contact/)

顶栏链接: 联系我们. 之后每页都有, 不再录.

**RESEARCH**

栏目: 研究.

# Announcing Pixtral 12B (发布 Pixtral 12B)

September 17, 2024. By Mistral AI team.

2024 年 9 月 17 日, 作者 Mistral AI 团队.

Cookies

左下角按钮: Cookies.

CERTIFIED BY axeptio. Here are our cookies! Light and completely harmless. On this website, we use cookies to measure our audience, nurture our relationship with you and, from time to time send you some quality content and some advertisement. You can select here those you allow to stay. Toggle all. Google Analytics 4: Helps us measure our audience. Hubspot: Tool for customer relationship management. Close / Accept all / Next.

弹窗 (axeptio 认证): 「这是我们的 cookie! 轻巧, 完全无害. 本站用 cookie 统计访问量, 维系和你的关系, 并不时给你推送一些优质内容和广告. 你可以在这里选择留下哪些.」 选项: 全部开关; Google Analytics 4, 帮我们统计访问量; Hubspot, 客户关系管理工具. 按钮: 关闭, 全部接受, 下一步. 这个弹窗在第 2 到第 22 页原样重复, 不再录.

![cookie 弹窗里 Hubspot 一项前面的橙色 Hubspot 图标](images/p01-2026-9-25-13-49.png)

![cookie 弹窗 Toggle all 右侧的灰色拨动开关, 处于关闭状态](images/p01-google-analytics-4-helps-us-measure-our-audience.png)

<!-- page 2 of 22 -->

![页面左上角的 Mistral 像素风 M 标志, 红橙黄三色](images/p02-image.png)

![cookie 弹窗里的灰色拨动开关, 关闭状态](images/p02-2026-9-25-13-49.png)

## Pixtral 12B in short: (Pixtral 12B 概要)

- Natively multimodal, trained with interleaved image and text data
- Strong performance on multimodal tasks, excels in instruction following
- Maintains state-of-the-art performance on text-only benchmarks
- Architecture:
    - New 400M parameter vision encoder trained from scratch
    - 12B parameter multimodal decoder based on Mistral Nemo
    - Supports variable image sizes and aspect ratios
    - Supports multiple images in the long context window of 128k tokens
- Use:
    - License: Apache 2.0
    - Try it on La Plateforme or on Le Chat

- 原生多模态, 用图文交错的数据训练.
- 多模态任务表现强, 指令遵循尤其好.
- 纯文本基准上保持最先进的水平.
- 架构:
    - 新的视觉编码器, 400M 参数, 从零开始训练.
    - 多模态解码器, 12B 参数, 以 Mistral Nemo 为底座.
    - 支持不同的图像尺寸和宽高比.
    - 在 128k token 的长上下文窗口里可以放多张图.
- 使用:
    - 许可: Apache 2.0.
    - 可以在 La Plateforme 或 Le Chat 上试用.

> **问:** 名字里的 12B, 总参数, 激活参数, 视觉编码器参数, 页面各印了什么?
> 本页概要里 12B 写的是 「12B parameter multimodal decoder」, 指多模态解码器; 视觉编码器单列, 是 400M. 总参数: 本页未印, 两者相加约 12.4B. 激活参数: 本页未印, 22 页里也没写层数, 隐藏维度, 头数, 词表大小.

Pixtral is trained to understand both natural images and documents, achieving 52.5% on the MMMU reasoning benchmark, surpassing a number of larger models. The model shows strong abilities in tasks such as chart and figure understanding, document question answering, multimodal reasoning and instruction following. Pixtral is able to ingest images at their natural resolution and aspect ratio, giving the user flexibility on the number of tokens used to process an image. Pixtral is also able to process any number of images in its long context window of 128K tokens. Unlike previous open-source models, Pixtral does not compromise on text benchmark performance to excel in multimodal tasks.

Pixtral 训练时同时学看自然图像和文档, 在 MMMU 推理基准上拿到 52.5%, 超过了好几个更大的模型. 它在图表理解, 文档问答, 多模态推理和指令遵循这类任务上都很强. Pixtral 可以按图像原本的分辨率和宽高比读图, 用户因此可以自己决定一张图花多少 token. 在 128K token 的长上下文窗口里, 它能处理任意多张图. 以往的开源模型为了多模态任务往往要牺牲文本基准, Pixtral 没有这个代价.

> **核对:** 「surpassing a number of larger models」 指的是哪些模型?
> 页面没点名. 第 4 页表里 MMMU 低于 52.5 的只有 Claude-3 Haiku (50.4) 和第 3 行 (50.7, 第 12 页合并表写作 Gemini-1.5 Flash 8B (0827)), 两者的规模页面都没给; 页面明确说更大的 LLaVA-OV 72B, 在第 12 页合并表里 MMMU 是 54.4, 比 Pixtral 高 1.9.

<!-- page 3 of 22 -->

![柱状图: MMMU (CoT, val) 和 MathVista (CoT, testmini) 两组, 每组五根柱依次是 Pixtral 12B, LLaVA-OV 7B, Qwen2-VL 7B, Gemini Flash-8B, Claude-3 Haiku, 纵轴 Accuracy (%) 从 20 到 70; 两组都是橙色的 Pixtral 最高, 柱顶标着 Mistral 标志, MathVista 组 LLaVA-OV 7B 最低](images/p03-chart.png)

![柱状图: ChartQA (CoT, test), DocVQA (ANLS, test), VQAv2 (VQA Match, val) 三组, 同样五个模型, 纵轴 20 到 100; ChartQA 和 VQAv2 两组 Pixtral 最高, DocVQA 组最高的是浅绿色的 Qwen2-VL 7B, 而 ChartQA 组 Qwen2-VL 7B 只到 40 左右](images/p03-instruction-following-multimodal-text.png)

Instruction Following (Multimodal & Text)

图标题: 指令遵循 (多模态与文本). 这张图整块被 cookie 弹窗盖住, 只露出标题.

Text Understanding (Science, Math & Code)

图标题: 文本理解 (科学, 数学与代码).

![文本理解图的右半截: 最左一组被裁掉, 只露出 Gemini Flash-8B 和 Claude-3 Haiku 两根高柱; 右边是 MATH (maj@1) 和 HumanEval (pass@1) 两组五根柱, 没有纵轴刻度; MATH 组 Gemini Flash-8B 最高, Pixtral 第二, Qwen2-VL 7B 最低; HumanEval 组 Claude-3 Haiku 最高, Gemini Flash-8B 第二, Pixtral 第三](images/p03-toggle-all.png)

> **看表:** 概要说纯文本基准 「state-of-the-art」, 本页文本理解图支持这个说法吗?
> 只在开源模型之间成立. 第 5 页表的三列文本基准 (69.2, 48.1, 72.0) Pixtral 在五个开源模型里都最高; 本页文本理解图多画了 Gemini Flash-8B 和 Claude-3 Haiku, MATH 组 Gemini Flash-8B 的柱比 Pixtral 高, HumanEval 组两个闭源模型都比 Pixtral 高. 图没有纵轴, 差多少读不出.

> **拆开:** 同一个数学基准, 本页图写 「MATH (maj@1)」, 第 5 页表写 「Math (Pass@1)」, 是不是两种口径?
> 页面没交代. maj@1 只取 1 个样本时和 Pass@1 是同一回事, 两种写法未必矛盾; 可页面既没说采样几次, 也没说温度, 读者只能按单样本理解. HumanEval 在图和表里都写 pass@1, 这一项口径一致.

## Performance (性能)

Pixtral was trained to be a drop-in replacement for Mistral Nemo 12B. Its key distinguishing factor from existing open-source models is the delivery of best-in-class multimodal reasoning without compromising on key text capabilities such as instruction following, coding, and math.

Pixtral 的训练目标之一, 是可以直接替换 Mistral Nemo 12B. 它和现有开源模型最大的区别, 在于多模态推理做到同级最好, 同时不牺牲指令遵循, 编程, 数学这些关键的文本能力.

<!-- page 4 of 22 -->

![页面左上角的 Mistral 像素风 M 标志](images/p04-2026-9-25-13-49.png)

## Evaluation protocol (评测协议)

We re-evaluate a range of open and closed models through the same evaluation harness. For each dataset, the prompt was chosen such that we could reproduce the results of leading multimodal models (GPT-4o and Claude-3.5-Sonnet). All models were then evaluated with this same prompt. Overall, Pixtral substantially outperforms all open models around its scale and, in many cases, outperforms closed models such as Claude 3 Haiku. Pixtral even outperforms or matches the performance of much larger models like LLaVa OneVision 72B on multimodal benchmarks. All prompts will be open-sourced.

我们把一批开源和闭源模型放进同一套评测框架重新测了一遍. 每个数据集的 prompt 都选成能复现领先多模态模型 (GPT-4o 和 Claude-3.5-Sonnet) 已报告成绩的那一版, 然后所有模型都用这同一个 prompt 来测. 总体上, Pixtral 明显强过同量级的所有开源模型, 很多项上也强过 Claude 3 Haiku 这类闭源模型. 在多模态基准上, 它甚至能超过或追平大得多的模型, 比如 LLaVa OneVision 72B. 所有 prompt 都会开源.

| Model | MMMU (CoT) | Mathvista (CoT) | ChartQA (CoT) | DocVQA (ANLS) | VQAv2 (VQA Match) | MM MT-Bench |
| --- | --- | --- | --- | --- | --- | --- |
| Pixtral 12B | 52.5 | 58.0 | 81.8 | 90.7 | 78.6 | 6.05 |
| Claude-3 Haiku | 50.4 | 44.8 | 69.6 | 74.6 | 68.4 | 5.46 |
| 第 3 行 (被遮) | 被遮 | 被遮 | 被遮 | 79.5 | 65.5 | 5.93 |
| 第 4 行 (被遮, 灰字) | 被遮 | 被遮 | 被遮 | 91.6 | 83.8 | 4.95 |
| 第 5 行 (被遮, 灰字) | 被遮 | 被遮 | 被遮 | 88.9 | 77.8 | 7.72 |
| 第 6 行 (被遮, 灰字) | 被遮 | 被遮 | 被遮 | 90.3 | 70.7 | 7.50 |

这张表在 images 目录里没有单独的图, 按渲染页面抄录. Pixtral 一行背景高亮, 六格加粗; Claude-3 Haiku 一行只露出上半截, 前三格仍可辨认; 第 4 到第 6 行的数字是灰色字. 第 3 到第 6 行的行名被弹窗盖住. 第 12 页 Pixtral 自己生成的合并表里, 这几行依次是 Gemini-1.5 Flash 8B (0827), LLaVA-OV 72B, GPT-4o, Claude-3.5 Sonnet, 露出的格子和它一一对得上.

Performance of Pixtral compared to closed and larger multimodal models. [All models were benchmarked through the same evaluation harness and with the same prompt. We verify that prompts reproduce the performance reported for GPT-4o and Claude 3.5 Sonnet (prompts will be provided in technical report)].

Pixtral 和闭源模型及更大的多模态模型的对比. [所有模型都在同一套评测框架里, 用同一个 prompt 测. 我们核实过这些 prompt 能复现 GPT-4o 和 Claude 3.5 Sonnet 报告的成绩 (prompt 会在技术报告里给出).]

> **确认:** 「outperforms or matches ... LLaVa OneVision 72B」 逐列看成立吗?
> 不完全成立. 本页表第 4 行 (LLaVA-OV 72B) 的 DocVQA 91.6, VQAv2 83.8 都比 Pixtral 高, 只有 MM MT-Bench 4.95 低于 6.05; 被遮的 MMMU 和 Mathvista, 第 12 页合并表给的是 54.4 和 57.2, 一输一赢. 六列里 Pixtral 赢 3 列, 输 3 列, VQAv2 差 5.2 个点.

> **回看:** 页面说所有模型用同一个 prompt, 这些 prompt 在哪能看到?
> 22 页里都没有. 正文写 「All prompts will be open-sourced」, 本页表注写 「prompts will be provided in technical report」, 两处都是将来时. 表里的数能不能复现, 本页给不出依据.

## Instruction following (指令遵循)

Pixtral particularly excels at both multimodal and text-only instruction following as compared to other open multimodal models. It substantially outperforms Qwen2-VL 7B, LLaVa-OneVision 7B and Phi-3.5 Vision in instruction following, with a 20% relative improvement in text IF-Eval and MT-Bench over the nearest OSS model. To further evaluate this ability for multimodal use cases, we create multimodal versions of these benchmarks: MM-IF-Eval and MM-MT-Bench.

和其他开源多模态模型相比, Pixtral 在多模态和纯文本两类指令遵循上都特别突出. 它在指令遵循上明显强过 Qwen2-VL 7B, LLaVa-OneVision 7B 和 Phi-3.5 Vision, 文本 IF-Eval 和 MT-Bench 比最接近的开源模型相对提升 20%. 为了进一步评估多模态场景下的这项能力, 我们做了这两个基准的多模态版本: MM-IF-Eval 和 MM-MT-Bench.

> **停一下:** 「20% relative improvement in text IF-Eval and MT-Bench」, 拿第 5 页表算得出来吗?
> 只算得出一半. 第 5 页表 Text IF-Eval 61.3 对最接近的 LLaVA-OV 7B 51.4, 相对提升约 19.3%; Text MT-bench 7.68 对 LLaVA-OV 7B 6.94, 只有约 10.7%. 换成 MM MT-Bench, 6.05 对 Qwen2-VL 7B 5.45 也只有约 11.0%.

<!-- page 5 of 22 -->

Pixtral outperforms open-source alternatives on multimodal instruction following benchmarks as well. We will open-source MM-MT-Bench to the community.

在多模态指令遵循基准上, Pixtral 同样胜过其他开源模型. 我们会把 MM-MT-Bench 开源给社区.

![网页截图: 上方是 Pixtral 与四个开源多模态模型的对比表, 按橙色框分成 Multimodal Benchmarks, 黄色框分成 Instruction Following 和 Text Benchmarks 三组, Pixtral 一行高亮; 表下是斜体图注; 下半页被 axeptio cookie 弹窗盖住, 只露出 Architecture 一节的右半截文字和红色等宽字体的 IMG 字样](images/p05-2026-9-25-13-49.png)

| Model | MMMU (CoT) | Mathvista (CoT) | ChartQA (CoT) | DocVQA (ANLS) | VQAv2 (VQA Match) | MM MT-Bench | Text MT-bench | MM IF-Eval | Text IF-Eval | MMLU (5-shot) | Math (Pass@1) | HumanEval (Pass@1) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pixtral 12B | 52.5 | 58.0 | 81.8 | 90.7 | 78.6 | 6.05 | 7.68 | 52.7 | 61.3 | 69.2 | 48.1 | 72.0 |
| Qwen2-VL 7B | 47.6 | 54.4 | 38.6 | 94.5 | 75.9 | 5.45 | 6.41 | 38.9 | 50.1 | 68.5 | 27.8 | 64.6 |
| LLaVA-OV 7B | 45.1 | 36.1 | 67.1 | 90.5 | 78.3 | 4.12 | 6.94 | 42.5 | 51.4 | 67.9 | 38.6 | 65.9 |
| Phi-3 Vision | 40.3 | 36.4 | 72.0 | 84.9 | 42.4 | 3.70 | 6.27 | 41.2 | 50.9 | 63.5 | 29.2 | 48.8 |
| Phi-3.5 Vision | 38.3 | 39.3 | 67.7 | 74.4 | 56.1 | 4.46 | 6.31 | 31.4 | 47.4 | 63.6 | 28.4 | 49.4 |

分组: 前五列是 Multimodal Benchmarks (多模态基准), 中间四列是 Instruction Following (指令遵循), 最后三列是 Text Benchmarks (文本基准). 加粗按原图.

Performance of Pixtral compared to open multimodal models. All models were benchmarked through the same evaluation harness and with the same prompt.

Pixtral 和开源多模态模型的对比. 所有模型都在同一套评测框架里, 用同一个 prompt 测.

> **再看:** 多模态指令遵循两列是 Mistral 自建的基准, Pixtral 领先多少?
> 本页表 MM IF-Eval 52.7 对次高的 LLaVA-OV 7B 42.5, 相对高约 24.0%; MM MT-Bench 6.05 对次高的 Qwen2-VL 7B 5.45, 高约 11.0%. 这两个基准都是本页新造的, MM-MT-Bench 写的是 「will open-source」, MM-IF-Eval 连开源承诺都没有.

> **对一下:** Qwen2-VL 7B 的 ChartQA 只有 38.6, Phi-3 Vision 的 VQAv2 只有 42.4, 这两格正常吗?
> 本页表没有注释. Qwen2-VL 7B 的 DocVQA 是全表最高的 94.5, ChartQA 却比 Phi-3 Vision (72.0) 还低 33.4 个点; Phi-3 Vision 的 VQAv2 比 Phi-3.5 Vision (56.1) 低 13.7 个点. 页面只说统一用能复现 GPT-4o 和 Claude-3.5-Sonnet 的 prompt, 没讨论小模型会不会因此吃亏.

## Architecture (架构)

**Variable image size.** Pixtral is designed to optimize for both speed and performance. We trained a new vision encoder that natively supports variable image sizes:

- We simply pass images through the vision encoder at their native resolution and aspect ratio, converting them into image tokens for each 16x16 patch in the image
- These tokens are then flattened to create a sequence, with `[IMG BREAK]` and `[IMG END]` tokens added between rows and at the end of the image.
- `[IMG BREAK]` tokens let the model distinguish between images of different aspect ratios with the same number of tokens.

In this way, Pixtral can be used to accurately understand complex diagrams, charts and documents in high resolution, while providing fast inference speeds on small images like icons, clipart, and equations.

**可变图像尺寸.** Pixtral 的设计同时照顾速度和效果. 我们训练了一个新的视觉编码器, 原生支持不同尺寸的图像:

- 图像按原本的分辨率和宽高比直接送进视觉编码器, 图里每个 16x16 的 patch 变成一个图像 token.
- 这些 token 再展平成一个序列, 每行之间插一个 `[IMG BREAK]`, 整张图末尾加一个 `[IMG END]`.
- 有了 `[IMG BREAK]`, 两张 token 数相同但宽高比不同的图, 模型也能分得开.

这样一来, Pixtral 既能在高分辨率下准确读懂复杂的示意图, 图表和文档, 在图标, 剪贴画, 公式这类小图上又能推理得很快.

> **想:** 按 16x16 一个 token, 一张 1024x1024 的图要占多少上下文?
> 本页没给例子, 按正文规则算: 64 行乘 64 列是 4096 个图像 token, 加 63 个 `[IMG BREAK]` 和 1 个 `[IMG END]`, 共 4160. 128k 若按 128,000 算, 不放文字也只装得下约 30 张. 页面没写分辨率上限, 也没说大图会不会先缩小.

<!-- page 6 of 22 -->

![可变尺寸示意图: 上面一张横幅猫图经过橙色 Vision Encoder 变成 3 行 4 列的彩色方格, 再展平成一行, 行与行之间插换行标记 b, 末尾是结束标记 e; 下面一张竖幅狗图变成 5 行 3 列的方格, 展平后同样用 b 隔行, 中间用省略号略去几行, 末尾是 e; 图注和下方正文被 cookie 弹窗遮住左半](images/p06-https-mistral-ai-news-pixtral-12b.png)

Pixtral uses a new vision encoder trained from scratch that natively supports variable image sizes.

图注: Pixtral 用了一个从零训练的新视觉编码器, 原生支持不同尺寸的图像.

> **问:** 示意图里 [b] 和 [e] 的个数和正文的规则对得上吗?
> 对得上. 本页图的猫图 3 行 4 列, 展平后是 12 个图像 token, 中间 2 个 [b], 末尾 1 个 [e], 最后一行后面不再加 [b]; 狗图 5 行 3 列应有 15 个图像 token 和 4 个 [b], 图里用省略号略去了中段. 两张图 token 数不同 (12 对 15), 并不是正文说的 「same number of tokens」 那种情形.

**Final architecture.** Pixtral has two components: the Vision Encoder, which tokenizes images, and a Multimodal Transformer Decoder, which predicts the next text token given a sequence of text and images. The model is trained to predict the next text token on interleaved image and text data. This architecture allows Pixtral to process any number of images with arbitrary sizes in its large context window of 128K tokens.

**最终架构.** Pixtral 由两部分组成: 一是视觉编码器, 负责把图像切成 token; 二是多模态 Transformer 解码器, 给定一串文字和图像, 预测下一个文本 token. 模型在图文交错的数据上, 以预测下一个文本 token 为目标训练. 这种结构让 Pixtral 能在 128K token 的大上下文窗口里处理任意数量, 任意尺寸的图.

> **核对:** 「tokenizes images」 是说图像被变成离散的码吗?
> 页面没讲清. 正文一处写 「converting them into image tokens」, 一处写 「tokenizes images」, 本页上方示意图画的是一格格彩色方块, 看不出是离散码还是连续向量; 训练目标只写了预测下一个文本 token, 没有图像 token 的预测目标.

<!-- page 7 of 22 -->

![cookie 弹窗选项右侧的空白复选框, 未勾选](images/p07-image.png)

![cookie 弹窗里另一枚空白复选框, 未勾选](images/p07-2026-9-25-13-49.png)

![页面左上角的 Mistral 像素风 M 标志](images/p07-get-in-touch-https-mistral-ai-contact.png)

# Pixtral Model Architecture (Pixtral 模型架构)

架构图 (images 目录里没有整图, 按渲染页面描述): 顶部一条橙色长条写着 Multimodal Transformer Decoder, 下面从左到右四段输入: Text (一串蓝色方块), Image (一串紫红方块, 下接橙色的 Vision Transformer Encoder), Text, Image (同样下接 Vision Transformer Encoder). 两个 Text 下面各有一段等宽字体的示例文字, 两个编码器下面各是一张缩略图. 右上角是一串绿色输出方块, 上方露出半行被裁掉的输出文字 「...models like Claude-3 Haiku, ...」.

Multimodal Transformer Decoder / Vision Transformer Encoder

图中标签: 多模态 Transformer 解码器 / Vision Transformer 编码器.

Pixtral is trained to understand both natural images and documents. The model shows strong abilities in document question answering, optical character recognition ...

第一段示例文字: Pixtral 训练时同时学看自然图像和文档. 这个模型在文档问答, 光学字符识别……方面能力很强 (原图此处截断).

![架构图里第一张输入缩略图: 模糊的柱状图, MMMU CoT 和 Mathvista CoT 两组, 图例是 Pixtral 12B, Phi-3 Vision, LLaVA-OV 7B, Qwen2-VL 7B, Claude3 Haiku; 两组都是橙色的 Pixtral 最高](images/p07-pixtral-outperforms-other-open-source-models-on.png)

Pixtral outperforms other open source models on multimodal understanding and reasoning benchmarks, such as MMMU and Mathvista ...

第二段示例文字: 在 MMMU, Mathvista 这类多模态理解和推理基准上, Pixtral 胜过其他开源模型…… (原图此处截断).

第二张输入缩略图是一张小表, 列头 MMMU, Mathvista, ChartQA, DocVQA, VQAv2, 第一行高亮; 字很糊, Pixtral 一行放大后读作 52.5, 58.0, 81.8, 92.3, 78.6.

> **看表:** 架构图缩略表里 Pixtral 的 DocVQA 像是 92.3, 和第 4, 第 5 页表的 90.7 对不上?
> 本页缩略表太糊, 放大后第一行第四格像 92.3, 其余四格和正式表一致. 第 4 页和第 5 页两张正式表都印 90.7, 第 11, 第 12 页的示例也都是 90.7; 以正式表为准, 缩略图这一格只能记作 「看不清, 疑似不同」.

## Qualitative Examples (定性示例)

### Reasoning over complex figures (复杂图形上的推理)

This table combines the data from both tables, ensuring that all models and their respective scores from each benchmark are included in a single, cohesive format.

这张表把两张表的数据合在一起, 保证所有模型和它们在各基准上的分数都收进同一个统一的格式里. (这句和第 12 页回答的末句一字不差, 在这里单独出现, 前后没有上下文, 是网页打印时叠进来的重复片段.)

![cookie 弹窗 Toggle all 右侧的灰色拨动开关, 关闭状态](images/p07-google-analytics-4-helps-us-measure-our-audience.png)

<!-- page 8 of 22 -->

![cookie 弹窗里的灰色拨动开关, 关闭状态](images/p08-1.png)

![世界各国 GDP 的 Voronoi 分区图, 按地区着色: 右上图例为 Africa 紫, Australia 红, Other Countries 黄, Latin America and Caribbean 橙, Middle East 青, Europe 绿, Asia 蓝, North America 玫红; 可见 China $13.61T 15.86%, Japan $4.97T 5.79%, India $2.73T 3.18%, 蓝色的 Russia $1.66T 1.93%, 绿色的 Germany $3.99T 4.65%, United Kingdom $2.82T 3.29%, France $2.78T 3.24%, Italy $2.07T 2.42%, Spain $1.43T 1.66%, 玫红的 Canada $1.71T 1.99%; 下半部分被 cookie 弹窗盖住](images/p08-here-are-our-cookies.png)

**Prompt.** List the top 5 countries in Europe with the highest GDP

**提示.** 列出欧洲 GDP 最高的 5 个国家.

**Response.** The top 5 countries in Europe with the highest GDP, based on the image, are:

1. Germany
    - GDP: $3.99 trillion
    - Percentage: 4.65%

**回答.** 根据图片, 欧洲 GDP 最高的 5 个国家是:

1. 德国
    - GDP: 3.99 万亿美元
    - 占比: 4.65%

<!-- page 9 of 22 -->

3. United Kingdom
    - GDP: $2.82 trillion
    - Percentage: 3.29%
5. France
    - GDP: $2.78 trillion
    - Percentage: 3.24%
7. Italy
    - GDP: $2.07 trillion
    - Percentage: 2.42%
9. Spain
    - GDP: $1.43 trillion
    - Percentage: 1.66%

These countries are highlighted in green on the diagram.

3. 英国, GDP 2.82 万亿美元, 占比 3.29%.
5. 法国, GDP 2.78 万亿美元, 占比 3.24%.
7. 意大利, GDP 2.07 万亿美元, 占比 2.42%.
9. 西班牙, GDP 1.43 万亿美元, 占比 1.66%.

这些国家在图上都是绿色. (序号按原页面照录, 是 1, 3, 5, 7, 9, 网页渲染列表时把子项也计了数.)

> **拆开:** 俄罗斯 1.66 万亿美元比西班牙高, 为什么没进前五?
> 第 8 页 GDP 图把 Russia 涂成蓝色, 归在亚洲; 回答最后一句 「highlighted in green」 说明模型是按绿色挑的. 五个国家的金额和占比都和图上一致. 若把俄罗斯算进欧洲, 它会排第五, 西班牙掉到第六.

## Chart Understanding and Analysis (图表理解与分析)

**Image.**

**图片.** (图在下一页.)

<!-- page 10 of 22 -->

![训练曲线图 train/loss: 四条线 dark-dragon-50 (红实线), dainty-sunset-49 (蓝实线), different-haze-34 (红虚线), morning-field-33 (蓝虚线); 横轴 Step 从 0 到 60k, 纵轴对数刻度 1e-5, 1, 1e+5; 蓝实线约 7k 处尖峰到 1 附近; 红实线约 9.5k 处第一次尖峰到 1 附近, 回落后在约 19.5k 处第二次冲到接近 1e+4 的量级, 约 21.5k 处中止; 两条虚线平稳下降到约 63k](images/p10-here-are-our-cookies.png)

**Prompt.** When did things start to go wrong for dark dragon?

**提示.** dark dragon 是从什么时候开始出问题的?

**Response.** The image is a line graph titled 'train/loss' that shows the training loss over steps for four different models: dark-dragon-50, dainty-sunset-49, different-haze-34, and morning-field-33. The x-axis represents the steps, ranging from 0 to 60k, and the y-axis represents the loss on a logarithmic scale from 1e-5 to 1e+5.

To determine when things started to go wrong for the dark-dragon-50 model, we need to look at the red line representing this model. Initially, the loss decreases, indicating that the model is learning effectively. However, around the 10k step mark, the loss starts to spike significantly. This spike indicates that the model's performance is deteriorating. The loss continues to spike and fluctuate, reaching very high values, which suggests that the model is not learning effectively and is likely overfitting or encountering other issues.

**回答.** 这是一张题为 'train/loss' 的折线图, 画的是四个模型 dark-dragon-50, dainty-sunset-49, different-haze-34, morning-field-33 的训练 loss 随步数的变化. 横轴是步数, 从 0 到 60k; 纵轴是 loss, 对数刻度, 从 1e-5 到 1e+5.

要判断 dark-dragon-50 从什么时候开始出问题, 得看代表它的那条红线. 起初 loss 在下降, 说明模型学得不错. 但到 10k 步左右, loss 开始大幅飙升, 说明模型表现在变差. 之后 loss 继续尖峰和起伏, 升到很高的值, 说明模型学得不好, 可能是过拟合, 也可能遇到了别的问题.

![cookie 弹窗盖住回答左半的截图, 右侧露出 "...on?", "...hows the training loss over steps", "...y-sunset-49, different-haze-34," 等半截句子](images/p10-esponse-on-this-website-we-use-cookies-to-measure-our.png)

> **确认:** 回答说 10k 步左右出问题, 本页曲线图上是这样吗?
> 第一次尖峰对得上: 红实线在约 9.5k 步冲到 1 附近 (读图). 但回答漏了更大的一次: 约 19.5k 步红实线冲到接近 1e+4 的量级, 比第一次高约四个数量级 (读图), 之后曲线在约 21.5k 步中止. 回答只说 「continues to spike and fluctuate」, 没点出 20k 附近这次.

<!-- page 11 of 22 -->

Therefore, the critical point where things started to go wrong for the dark-dragon-50 model is around the 10k step mark.

所以, dark-dragon-50 开始出问题的关键点在 10k 步左右.

> **回看:** 回答把原因归为 「likely overfitting」, 训练 loss 飙升能说明过拟合吗?
> 说明不了. 第 10 页图标题是 train/loss, 只有训练 loss, 没有验证 loss; 过拟合的典型表现是训练 loss 继续降, 验证 loss 回升. 图里是训练 loss 自己突然冲高, 更像训练不稳定. 页面把这段回答原样当作正面示例登出, 没有更正.

## Multi-image instruction following (多图指令遵循)

**Images.**

**图片.** 两张输入图 (images 目录里没有单独的图文件, 按渲染页面抄录露出的部分):

第一张是第 5 页那张开源对比表的左半 (橙色框 Multimodal Benchmarks 五列), 露出的格子:

| Model | MMMU (CoT) | Mathvista (CoT) | ChartQA (CoT) | DocVQA (ANLS) | VQAv2 (VQA Match) |
| --- | --- | --- | --- | --- | --- |
| Pixtral 12B | 52.5 | 58.0 | 81.8 | 90.7 | 78.6 |
| Qwen2-VL 7B | 47.6 | 54.4 | 38.6 | 94.5 | 75.9 |
| LLaVA-OV 7B | 45.1 | 36.1 | 67.1 | 90.5 | 78.3 |
| 第 4 行 (被遮) | 被遮 | 被遮 | ...2.0 | 84.9 | 42.4 |
| 第 5 行 (被遮) | 被遮 | 被遮 | ...7.7 | 74.4 | 56.1 |

第二张是第 4 页那张闭源对比表的前五列, 左半被弹窗盖住, 只露出右三列:

| ChartQA (CoT) | DocVQA (ANLS) | VQAv2 (VQA Match) |
| --- | --- | --- |
| 81.8 | 90.7 | 78.6 |
| 69.6 | 74.6 | 68.4 |
| 78.0 | 79.5 | 65.5 |
| 66.9 | 91.6 | 83.8 |
| 85.1 | 88.9 | 77.8 |
| 87.6 | 90.3 | 70.7 |

第二张的后三行是灰色字, 和第 4 页一致.

<!-- page 12 of 22 -->

**Prompt.** Combine information in both the tables into a single markdown table

**提示.** 把两张表的信息合并成一张 markdown 表.

**Response.** To combine the information from both tables into a single table, we need to align the models and their corresponding scores from each benchmark. Here is the combined table:

**回答.** 要把两张表合成一张, 得把模型和它们在各基准上的分数对齐. 合并后的表如下:

```text
| Model                  | MMMU (CoT) | Mathvista (CoT) | ChartQA (CoT) | DocVQA (ANLS) | VQ
|------------------------|------------|-----------------|---------------|---------------|---
| Pixtral 12B            | 52.5       | 58.0            | 81.8          | 90.7          | 78
| Claude-3 Haiku         | 50.4       | 44.8            | 69.6          | 74.6          | 68
| Gemini-1.5 Flash 8B (0827) | 50.7       | 56.9            | 78.0          | 79.5          
| LLaVA-OV 72B           | 54.4       | 57.2            | 66.9          | 91.6          | 83
| GPT-4o                 | 68.6       | 64.6            | 85.1          | 88.9          | 77
| Claude-3.5 Sonnet      | 68.0       | 64.4            | 87.6          | 90.3          | 70
| Qwen2-VL 7B            | 47.6       | 54.4            | 38.6          | 94.5          | 75
| LLaVA-OV 7B            | 45.1       | 36.1            | 67.1          | 90.5          | 78
| Phi-3 Vision           | 40.3       | 36.4            | 72.0          | 84.9          | 42
| Phi-3.5 Vision         | 38.3       | 39.3            | 67.7          | 74.4          | 56
```

合并表放在一个横向滚动的代码框里, 打印时右侧被截断, VQAv2 一列只露出前两位, Gemini 一行因为名字太长, 被挤到连 VQAv2 的前两位也看不到.

This table combines the data from both tables, ensuring that all models and their respective scores from each benchmark are included in a single, cohesive format.

这张表把两张表的数据合在一起, 保证所有模型和它们在各基准上的分数都收进同一个统一的格式里.

> **停一下:** 合并表里 LLaVA-OV 72B 的 MMMU 54.4, Mathvista 57.2, 有原图可以核对吗?
> 在本页打印件里核对不了. 第 11 页第二张输入图的左半被弹窗盖住, 第 4 页原表这两格也被盖住; 能核对的是后三列, 66.9, 91.6, 83 (83.8 被截断) 都和第 11 页露出的格子一致. 所以 「outperforms or matches LLaVA OneVision 72B」 里 MMMU 和 Mathvista 两项, 本页只能靠模型自己生成的数.

## Image to Code (图片转代码)

**Image.**

**图片.** (图在下一页.)

<!-- page 13 of 22 -->

手绘草图 (images 目录里没有单独的图文件, 按渲染页面描述): 横线笔记纸上用黑笔画了一个网页框, 顶部写着 「Pick An Ice Cream Flavor」, 左侧一个下拉框写着 「Flavor ∨」, 右下一个按钮写着 「Next」, 按钮下方写着 「MistralAI」. 草图中下部被 cookie 弹窗盖住.

<!-- page 14 of 22 -->

![代码框截图: 顶部是 html 代码块标记, DOCTYPE 声明和 html lang="en" 开标签, 右侧露出 initial-scale=1.0, 中间被 cookie 弹窗盖住, 底部露出 select { width: 100%; padding: 10px;](images/p14-2026-9-25-13-49.png)

**Prompt.** Write HTML code to create a website like this

**提示.** 写一段 HTML 代码, 做一个像这样的网站.

**Response.** Certainly! Below is an example of HTML code to create a simple webpage that allows users to pick an ice cream flavor. This example includes a dropdown menu for selecting the flavor and a "Next" button.

**回答.** 当然! 下面是一段 HTML 示例代码, 做一个让用户挑冰淇淋口味的简单网页. 示例里有一个选口味的下拉菜单和一个 「Next」 按钮.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pick an Ice Cream Flavor</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f0f0f0;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h1 {
            text-align: center;
        }
        select {
            width: 100%;
            padding: 10px;
            margin-top: 10px;
            margin-bottom: 20px;
        }
        button {
            width: 100%;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Pick An Ice Cream Flavor</h1>
        <select id="flavorSelect">
            <option value="vanilla">Vanilla</option>
            <option value="chocolate">Chocolate</option>
            <option value="strawberry">Strawberry</option>
            <option value="cookie_dough">Cookie Dough</option>
            <option value="mint_chocolate">Mint Chocolate</option>
        </select>
        <button onclick="next()">Next</button>
    </div>
    <footer style="position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 1
        &copy; copyright MistralAI
    </footer>
    <script>
        function next() {
            const selectedFlavor = document.getElementById('flavorSelect').value;
            alert('You selected: ' + selectedFlavor);
        }
    </script>
</body>
</html>
```

这段代码从第 14 页跨到第 15 页, 这里接成一整块. footer 那一行在网页的代码框里超出宽度, 打印时从 「font-size: 1」 后面截断, 照录.

<!-- page 15 of 22 -->

![代码框截图: 从 button 样式块开始, 依次是 width: 100%, padding: 10px, background-color: #4CAF50, color: white, border: none, border-radius: 4px, cursor: pointer, button:hover 的 #45a049, style 和 head 的闭合标签, body 和 container div 的开标签; 下半被 cookie 弹窗盖住, 右侧露出几行 option 闭合标签和 getElementById('flavorSelect').value](images/p15-https-mistral-ai-news-pixtral-12b.png)

本页是上一页 HTML 代码的后半段, 正文已接回第 14 页.

<!-- page 16 of 22 -->

**Explanation.**

- HTML Structure: The webpage consists of a container div that holds the heading, a dropdown menu, and a button.
- CSS Styling: Basic styling is applied to center the content and style the elements.
- JavaScript Function: The `next` function is called when the "Next" button is clicked. It retrieves the selected flavor from the dropdown menu and displays an alert with the chosen flavor.

You can copy and paste this code into an HTML file and open it in a web browser to see the result.

**说明.**

- HTML 结构: 网页由一个 container div 组成, 里面放标题, 下拉菜单和按钮.
- CSS 样式: 加了基础样式, 让内容居中, 并给各元素定好外观.
- JavaScript 函数: 点击 「Next」 按钮时调用 `next` 函数, 它读取下拉菜单里选中的口味, 再弹窗显示出来.

把这段代码复制进一个 HTML 文件, 用浏览器打开就能看到效果.

**Website Generated.**

**生成的网站.**

![生成网页的截图: 白色卡片上是大号黑体标题, 露出后半截 "...am Flavor", 下面一个带下拉箭头的选择框和一条绿色按钮, 底部一行 "© copyright MistralAI" 只露出一半; 左半被 cookie 弹窗盖住](images/p16-2026-9-25-13-49.png)

> **再看:** 草图上只写了 「Flavor」, 生成网页里的五种口味从哪来?
> 第 13 页草图的下拉框只写 「Flavor ∨」, 没列选项; 代码里的 Vanilla, Chocolate, Strawberry, Cookie Dough, Mint Chocolate 是模型自己补的. 草图底部的 「MistralAI」 被写成页脚 「© copyright MistralAI」, 本页截图的底部也露出了这一行.

<!-- page 17 of 22 -->

## Natural scene understanding (自然场景理解)

![比萨斜塔照片: 左边是比萨大教堂, 中间是斜塔, 右上方前景有两根手指作势捏住塔顶, 塔前草坪上有游客; 底部被 cookie 弹窗遮住一条](images/p17-certified-by-https-www-axept-io-get-widget-utmsource.png)

**Prompt.** Is this person really big, or is this building just super small?

**提示.** 这个人是真的很大, 还是这栋建筑其实特别小?

**Response.** The image shows a person holding their thumb in front of the Leaning Tower of Pisa, making it appear as if the thumb is much larger than the tower. This creates an optical illusion, making the tower seem smaller than it actually is. In reality, the Leaning Tower of Pisa is a large and iconic structure, and the person's thumb is not nearly as large as it appears in the image. The purpose of this photo is to demonstrate the impressive height and size of the tower by comparing it to a familiar object, such as a thumb.

**回答.** 图里有人把拇指举在比萨斜塔前面, 看上去拇指比塔大得多. 这造成了一种视错觉, 让塔显得比实际小. 实际上比萨斜塔是一座高大, 标志性的建筑, 这个人的拇指远没有图里看起来那么大. 拍这张照片的目的, 是拿拇指这样熟悉的物体来对比, 展示塔的高度和体量.

> **对一下:** 回答说拍照目的是展示塔的高大, 本页照片看得出这层意思吗?
> 看不出. 本页照片是两根手指在前景作势捏住塔顶的错位摆拍, 回答前半段识别出视错觉是对的; 最后一句 「The purpose of this photo is to demonstrate the impressive height」 是模型加的解读, 照片本身只显示塔被 「捏」 得很小.

![cookie 弹窗 Toggle all 右侧的灰色拨动开关, 关闭状态](images/p17-google-analytics-4-helps-us-measure-our-audience.png)

![cookie 弹窗 Google Analytics 4 一项右侧的空白复选框](images/p17-lia-r-objechubspot.png)

![cookie 弹窗 Hubspot 一项右侧的空白复选框](images/p17-n-front-of-the-leaning-tower-of-rger-than-the-tower.png)

## How to run Pixtral? (怎么运行 Pixtral?)

### Le Chat

<!-- page 18 of 22 -->

You can try Pixtral easily and freely via Le Chat, our user-friendly conversational chat interface. You can choose Pixtral in the model list, upload an image, and start asking questions about the image.

通过 Le Chat 可以免费, 方便地试用 Pixtral, Le Chat 是我们好上手的对话界面. 在模型列表里选 Pixtral, 上传一张图, 就可以开始问关于这张图的问题.

### La Plateforme

Pixtral is also available on La Plateforme. You can leverage Pixtral's capabilities through API calls, enabling seamless integration with various applications and workflows. Below is a simple example. Please find more details in our [docs](https://docs.mistral.ai/capabilities/vision/).

Pixtral 也上了 La Plateforme. 可以通过 API 调用 Pixtral 的能力, 顺畅地接进各种应用和工作流. 下面是一个简单例子, 更多细节见我们的文档.

```shell
curl https://api.mistral.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -d '{
    "model": "pixtral-12b-2409",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What’s in this image?"
          },
          {
            "type": "image_url",
            "image_url": "https://tripfixers.com/wp-content/uploads/2019/11/eiffel-tower-wit
          }
        ]
      }
    ],
    "max_tokens": 300
  }'
```

示例请求: 模型 ID `pixtral-12b-2409`, 一条用户消息里放一段文字 「What’s in this image?」 (图里有什么?) 和一个图片链接, `max_tokens` 为 300. 图片链接在代码框右侧被截断, 照录.

### mistral-inference

<!-- page 19 of 22 -->

The easiest way to run Pixtral locally is to use `mistral-inference`. After installing `mistral_inference`, you can download the model, load the model, and run the model using the code below. For detailed information, please see [here](https://github.com/mistralai/mistral-inference).

在本地跑 Pixtral, 最简单的办法是用 `mistral-inference`. 装好 `mistral_inference` 之后, 用下面的代码就能下载模型, 加载模型, 运行模型. 详细说明见链接.

```python
# download the model
from huggingface_hub import snapshot_download
from pathlib import Path

mistral_models_path = Path.home().joinpath('mistral_models', 'Pixtral')
mistral_models_path.mkdir(parents=True, exist_ok=True)

snapshot_download(repo_id="mistralai/Pixtral-12B-2409", allow_patterns=["params.json", "cons

# load the model
from mistral_inference.transformer import Transformer
from mistral_inference.generate import generate
from mistral_common.tokens.tokenizers.mistral import MistralTokenizer
from mistral_common.protocol.instruct.messages import UserMessage, TextChunk, ImageURLChunk
from mistral_common.protocol.instruct.request import ChatCompletionRequest

tokenizer = MistralTokenizer.from_file(f"{mistral_models_path}/tekken.json")
model = Transformer.from_folder(mistral_models_path)

# Run the model
url = "https://huggingface.co/datasets/patrickvonplaten/random_img/resolve/main/yosemite.png
prompt = "Describe the image."

completion_request = ChatCompletionRequest(messages=[UserMessage(content=[ImageURLChunk(imag

encoded = tokenizer.encode_chat_completion(completion_request)

images = encoded.images
tokens = encoded.tokens

out_tokens, _ = generate([tokens], model, images=[images], max_tokens=256, temperature=0.35,
result = tokenizer.decode(out_tokens[0])

print(result)
```

三段代码依次是下载, 加载, 运行: 从 HuggingFace 仓库 `mistralai/Pixtral-12B-2409` 拉取权重到 `~/mistral_models/Pixtral`, 用 `tekken.json` 建 tokenizer, 以 「Describe the image.」 (描述这张图) 为提示, 生成时 `max_tokens=256`, `temperature=0.35`. 有四行在代码框右侧被截断, 照录.

![mistral-inference 代码框的截图, 上半露出下载和加载两段, 下半被 cookie 弹窗盖住, 右侧露出 tekken.json, yosemite.png, max_tokens=256, temperature=0.35 等半行, 底部是 print(result) 和横向滚动条](images/p19-here-are-our-cookies.png)

<!-- page 20 of 22 -->

![页面左上角的 Mistral 像素风 M 标志](images/p20-get-in-touch-https-mistral-ai-contact.png)

### vLLM

If you choose to serve Pixtral locally, we also recommend using Pixtral with the [vLLM library](https://github.com/vllm-project/vllm) as a fantastic option to reach higher serving throughput. We thank the vLLM team for their support to integrate Pixtral quickly. Below is a simple usage example. Please find more information [here](https://huggingface.co/mistralai/Pixtral-12B-2409).

如果要在本地部署 Pixtral 提供服务, 我们也推荐配合 vLLM 库使用, 这是拿到更高服务吞吐的好办法. 感谢 vLLM 团队帮忙, 让 Pixtral 很快接入. 下面是一个简单的用法示例, 更多信息见链接.

```python
from vllm import LLM
from vllm.sampling_params import SamplingParams

model_name = "mistralai/Pixtral-12B-2409"

sampling_params = SamplingParams(max_tokens=8192)

llm = LLM(model=model_name, tokenizer_mode="mistral")

prompt = "Describe this image in one sentence."
image_url = "https://picsum.photos/id/237/200/300"

messages = [
    {
        "role": "user",
        "content": [{"type": "text", "text": prompt}, {"type": "image_url", "image_url": {"u
    },
]

outputs = vllm_model.model.chat(messages, sampling_params=sampling_params)

print(outputs[0].outputs[0].text)
```

示例用同一个 HuggingFace 仓库, `max_tokens=8192`, `tokenizer_mode="mistral"`, 提示是 「Describe this image in one sentence.」 (用一句话描述这张图), 图片是一张 200x300 的随机图. messages 那一行在右侧被截断, 照录.

> **想:** 这段 vLLM 代码照抄能跑通吗?
> 跑不通. 本页代码先写 `llm = LLM(model=model_name, tokenizer_mode="mistral")`, 最后调用的却是 `vllm_model.model.chat(...)`, 前面从没定义 `vllm_model`, 照抄会报名字未定义. 本页正文也没提这个出入.

> **问:** 本页示例图 200x300, 按第 5 页的 16x16 规则要占多少 token?
> 页面没说边长不是 16 的倍数时怎么处理. 若向上补齐, 宽 200 是 13 列, 高 300 是 19 行, 共 247 个图像 token, 加 18 个 `[IMG BREAK]` 和 1 个 `[IMG END]`, 合计 266; 若向下截断, 是 12 列 18 行, 共 216 加 18, 合计 234.

Products

- [Vibe](https://mistral.ai/products/vibe/)

页脚 「产品」 栏开头: Vibe.

<!-- page 21 of 22 -->

![页脚导航截图: 上方是 Forge, Compute, Pricing; 中间 Solutions 一栏列出 Delivery methodology 到 Mistral for public institutions; 下半被 cookie 弹窗盖住, 底部露出 Data processing agreement 和 Trust Center](images/p21-t-on-this-website-we-use-cookies-to-measure-our.png)

- Products (续)
    - Vibe Code
    - Studio
    - Forge
    - Compute
    - Pricing
- Solutions
    - Delivery methodology
    - Model customization
    - Coding
    - Document intelligence
    - Speech
    - Mistral for finance
    - Mistral for public institutions
    - Mistral for manufacturing
    - Mistral for energy & utilities
- Why Mistral
    - [About us](https://mistral.ai/about/)
    - [Careers](https://mistral.ai/careers/)
    - [Partners](https://mistral.ai/partners/)
    - Our customers
    - [Our models](https://mistral.ai/models/)
    - Brand
- Company
    - Terms of Service
    - Privacy Policy
    - Privacy choices
    - [Data processing agreement](https://legal.mistral.ai/terms/data-processing-addendum)
    - [Trust Center](https://trust.mistral.ai/)

- 产品 (续)
    - Vibe Code, Studio, Forge, 算力 (Compute), 定价 (Pricing)
- 解决方案
    - 交付方法, 模型定制, 编程, 文档智能, 语音
    - 面向金融, 公共机构, 制造业, 能源与公用事业的 Mistral
- 为什么选 Mistral
    - 关于我们, 招聘, 合作伙伴, 客户, 我们的模型, 品牌
- 公司
    - 服务条款, 隐私政策, 隐私选项, 数据处理协议, 信任中心

<!-- page 22 of 22 -->

- Company (续)
    - Legal notice

GET IT ON Google Play / Download on the App Store / Get Mistral Vibe

Mistral AI © 2026

English

页脚末尾: 公司栏最后一项是法律声明; 应用商店徽标 (Google Play, App Store) 和 「下载 Mistral Vibe」; 版权行 「Mistral AI © 2026」; 语言切换 English. 版权年份是网页打印的年份, 不是博文发布的年份.
